#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DURATION = 184;
const FPS = 30;
const CAPTURE_FPS = 10; // Capture at 10fps, FFmpeg outputs 30fps (3x duplicate)
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

async function captureFrames() {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  browser err:', msg.text().slice(0, 120));
  });

  console.log('  loading animation...');
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  console.log('  waiting for React + Babel to mount (~15s)...');
  await delay(15000);

  const ready = await page.evaluate(() => typeof window.__seek === 'function');
  if (!ready) {
    const dbg = await page.evaluate(() => ({
      react: typeof React, babel: typeof Babel, seek: typeof window.__seek,
      label: document.getElementById('root')?.dataset.screenLabel
    }));
    await browser.close();
    throw new Error('Animation failed to mount: ' + JSON.stringify(dbg));
  }
  console.log('  ✅ animation mounted\n');

  const totalFrames = Math.ceil(DURATION * CAPTURE_FPS);
  console.log(`  capturing ${totalFrames} frames at ${CAPTURE_FPS}fps → will output ${FPS}fps...`);

  for (let i = 0; i < totalFrames; i++) {
    await page.evaluate(t => { window.__seek(t); }, i / CAPTURE_FPS);
    await delay(2);
    const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(6, '0')}.jpg`);
    await page.screenshot({ path: framePath, type: 'jpeg', quality: 95 });

    if ((i + 1) % 50 === 0 || i === 0) {
      const pct = (((i + 1) / totalFrames) * 100).toFixed(0);
      console.log(`  frame ${i + 1}/${totalFrames} (${pct}%)`);
    }
  }

  await browser.close();
  console.log(`\n  all ${totalFrames} frames saved to disk`);
  return totalFrames;
}

function encode(totalFrames) {
  console.log('\n  encoding with FFmpeg (ProRes 422 HQ)...');

  const result = spawnSync('ffmpeg', [
    '-y',
    '-framerate', String(CAPTURE_FPS),       // input is 10fps
    '-i', path.join(FRAMES_DIR, 'frame_%06d.jpg'),
    '-vf', `fps=${FPS}`,                     // output at 30fps (duplicates frames)
    '-c:v', 'prores',
    '-profile:v', '3',
    '-q:v', '1',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    OUTPUT_FILE
  ], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024, timeout: 300000 });

  if (result.status !== 0) {
    console.error('FFmpeg stderr:', result.stderr?.toString().slice(-500));
    throw new Error(`ffmpeg exited with code ${result.status}`);
  }

  const mb = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\n  ✅ ${OUTPUT_FILE}`);
  console.log(`     ${mb} MB · ${DURATION}s · ${FPS}fps · ProRes 422 HQ`);
}

async function main() {
  console.log('\n🎬 Jiko Explainer → ProRes MOV\n');
  const server = await startServer();

  try {
    const totalFrames = await captureFrames();
    encode(totalFrames);
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
