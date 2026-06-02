#!/usr/bin/env node
/**
 * CDP screencast approach:
 * - Load animation, let it play in real time
 * - Chrome's Page.startScreencast streams JPEG frames via CDP
 * - Collect all frames, encode to ProRes MOV with FFmpeg
 * - Total time: ~184s playback + ~60s encode = ~4 minutes
 */

const puppeteer = require('puppeteer');
const { spawnSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DURATION = 184;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const FRAMES_DIR = '/tmp/jiko_frames';
const OUTPUT_FILE = path.join(__dirname, 'project', 'jiko-explainer.mov');

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const libs = {
          '/react.js':     path.join(__dirname, 'node_modules/react/umd/react.development.js'),
          '/react-dom.js': path.join(__dirname, 'node_modules/react-dom/umd/react-dom.development.js'),
          '/babel.js':     path.join(__dirname, 'node_modules/@babel/standalone/babel.js'),
        };
        if (libs[req.url]) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(libs[req.url]));
          return;
        }
        const filePath = path.join(__dirname, 'project',
          decodeURIComponent(req.url).replace(/^\//, '') || 'Jiko Explainer.html');
        if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
        if (req.url === '/' || req.url.endsWith('.html')) {
          let html = fs.readFileSync(filePath, 'utf8');
          html = html
            .replace(/https:\/\/unpkg\.com\/react@[^"]+/g, '/react.js')
            .replace(/https:\/\/unpkg\.com\/react-dom@[^"]+/g, '/react-dom.js')
            .replace(/https:\/\/unpkg\.com\/@babel\/standalone@[^"]+/g, '/babel.js')
            .replace(/ integrity="[^"]*"/g, '')
            .replace(/ crossorigin="[^"]*"/g, '');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } else if (req.url.endsWith('.jsx') || req.url.endsWith('.js')) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.css')) {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.woff') || req.url.endsWith('.otf')) {
          res.writeHead(200, { 'Content-Type': 'font/woff' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.svg')) {
          res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
          res.end(fs.readFileSync(filePath));
        } else {
          const ext = path.extname(req.url).toLowerCase();
          const mimes = { '.png': 'image/png', '.avif': 'image/avif', '.mp4': 'video/mp4' };
          res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
          res.end(fs.readFileSync(filePath));
        }
      } catch (err) {
        res.writeHead(500); res.end();
      }
    });
    server.listen(8765, () => { console.log('  server: http://localhost:8765'); resolve(server); });
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function recordScreencast() {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
           '--disable-dev-shm-usage', '--enable-precise-memory-info']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // Get CDP session for screencast
  const client = await page.createCDPSession();

  console.log('  loading animation...');
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  console.log('  waiting for animation to mount (~15s)...');
  await delay(15000);

  const ready = await page.evaluate(() => typeof window.__seek === 'function');
  if (!ready) {
    const dbg = await page.evaluate(() => ({
      react: typeof React, babel: typeof Babel, seek: typeof window.__seek
    }));
    await browser.close();
    throw new Error('Animation not mounted: ' + JSON.stringify(dbg));
  }
  console.log('  ✅ animation mounted\n');

  // Seek to beginning
  await page.evaluate(() => { window.__seek(0); });
  await delay(500);

  // Collect frames via CDP screencast
  const frames = [];
  let lastTimestamp = 0;

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: WIDTH,
    maxHeight: HEIGHT,
    everyNthFrame: 1
  });

  client.on('Page.screencastFrame', async (event) => {
    // Ack immediately to keep frames flowing
    client.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});

    const ts = event.metadata.timestamp;
    if (frames.length === 0 || ts > lastTimestamp) {
      frames.push({ data: event.data, timestamp: ts });
      lastTimestamp = ts;

      if (frames.length % 30 === 0) {
        const elapsed = ts - frames[0].timestamp;
        const pct = ((elapsed / DURATION) * 100).toFixed(0);
        console.log(`  recording: ${frames.length} frames, ${elapsed.toFixed(1)}s elapsed (${pct}%)`);
      }
    }
  });

  // Start playing
  console.log(`  playing animation (${DURATION}s)...`);
  const startTime = Date.now();
  await page.evaluate(() => { window.__play(); });

  // Wait for animation to complete
  await delay((DURATION + 3) * 1000);

  await client.send('Page.stopScreencast');
  await browser.close();

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`\n  recorded ${frames.length} frames over ${elapsed.toFixed(1)}s`);

  // Write frames to disk
  console.log('  writing frames to disk...');
  for (let i = 0; i < frames.length; i++) {
    const buf = Buffer.from(frames[i].data, 'base64');
    fs.writeFileSync(path.join(FRAMES_DIR, `frame_${String(i).padStart(6, '0')}.jpg`), buf);
  }
  console.log(`  wrote ${frames.length} frames\n`);

  return frames;
}

function encode(frames) {
  // Calculate actual fps from timestamps
  const capturedFps = frames.length > 1
    ? frames.length / (frames[frames.length - 1].timestamp - frames[0].timestamp)
    : 30;

  const actualFps = Math.round(capturedFps);
  console.log(`  captured fps: ~${actualFps}`);
  console.log('  encoding with FFmpeg (ProRes 422 HQ)...');

  const result = spawnSync('ffmpeg', [
    '-y',
    '-framerate', String(actualFps),
    '-i', path.join(FRAMES_DIR, 'frame_%06d.jpg'),
    '-c:v', 'prores',
    '-profile:v', '3',
    '-q:v', '1',
    '-r', String(FPS),
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    OUTPUT_FILE
  ], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024, timeout: 300000 });

  if (result.status !== 0) {
    const err = result.stderr?.toString() || '';
    console.error('FFmpeg stderr (last 500 chars):\n', err.slice(-500));
    throw new Error(`ffmpeg exited ${result.status}`);
  }

  const mb = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\n  ✅ ${OUTPUT_FILE}`);
  console.log(`     ${mb} MB · ${DURATION}s · ProRes 422 HQ`);
}

async function main() {
  console.log('\n🎬 Jiko Explainer → ProRes MOV (CDP screencast)\n');
  const server = await startServer();
  try {
    const frames = await recordScreencast();
    encode(frames);
    console.log('\n  cleaning up frames...');
    fs.rmSync(FRAMES_DIR, { recursive: true });
    console.log('  done.\n');
  } catch (e) {
    console.error('\n❌', e.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

main();
