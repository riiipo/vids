#!/usr/bin/env node
/**
 * Xvfb + x11grab:
 * - Fresh Xvfb on :99 → Chrome renders at real speed
 * - FFmpeg x11grab captures at 30fps → ProRes 422 HQ MOV
 * - Total: ~184s playback + encode = ~4 minutes
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DURATION = 184;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DISP = ':201';
const OUTPUT_FILE = path.join(__dirname, 'project', 'jiko-explainer.mov');

function startServer(port) {
  return new Promise((resolve, reject) => {
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
      } catch (err) { res.writeHead(500); res.end(); }
    });
    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('\n🎬 Jiko Explainer → ProRes MOV (Xvfb + x11grab)\n');

  const server = await startServer(8765);
  console.log('  server: http://localhost:8765');

  // Start Xvfb
  console.log(`  starting Xvfb on ${DISP}...`);
  const xvfb = spawn('Xvfb', [DISP, '-screen', '0', `${WIDTH}x${HEIGHT}x24`, '-ac', '-noreset'], {
    stdio: 'ignore',
    env: { ...process.env, DISPLAY: DISP }
  });
  xvfb.on('error', e => console.error('  Xvfb error:', e.message));

  // Wait for Xvfb to be ready
  await delay(3000);

  // Verify Xvfb is running by checking the socket file
  const dispNum = DISP.replace(':', '');
  const socketPath = `/tmp/.X11-unix/X${dispNum}`;
  const xvfbRunning = fs.existsSync(socketPath);
  if (!xvfbRunning) {
    console.error(`  ❌ Xvfb socket not found at ${socketPath} — aborting`);
    server.close(); process.exit(1);
  }
  console.log(`  ✅ Xvfb ready (${socketPath})`);

  // Launch Chrome on Xvfb
  console.log('  launching Chrome on virtual display...');
  const browser = await puppeteer.launch({
    headless: false,
    env: { ...process.env, DISPLAY: DISP },
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-infobars',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--window-position=0,0',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      '--noerrdialogs',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  console.log('  loading animation...');
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  console.log('  waiting for animation to mount (~15s)...');
  await delay(15000);

  const ready = await page.evaluate(() => typeof window.__seek === 'function');
  if (!ready) {
    const dbg = await page.evaluate(() => ({ react: typeof React, babel: typeof Babel, seek: typeof window.__seek }));
    console.error('  ❌ Animation not mounted:', dbg);
    await browser.close(); xvfb.kill(); server.close(); process.exit(1);
  }
  console.log('  ✅ animation mounted\n');

  await page.evaluate(() => { window.__seek(0); });
  await delay(300);

  // Start FFmpeg FIRST, set up close listener BEFORE playing
  console.log(`  starting FFmpeg x11grab → ProRes...\n`);
  const ffmpegEnv = { ...process.env, DISPLAY: DISP };
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'x11grab',
    '-r', String(FPS),
    '-s', `${WIDTH}x${HEIGHT}`,
    '-i', `${DISP}.0`,
    '-t', String(DURATION + 2),
    '-vf', 'format=yuv422p10le',
    '-c:v', 'prores',
    '-profile:v', '3',
    '-q:v', '1',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    OUTPUT_FILE
  ], { stdio: ['pipe', 'pipe', 'pipe'], env: ffmpegEnv });

  let ffmpegLog = '';
  ffmpeg.stderr.on('data', d => {
    const msg = d.toString();
    ffmpegLog += msg;
    const m = msg.match(/frame=\s*(\d+).*?time=(\S+)/);
    if (m) {
      const pct = ((parseInt(m[1]) / (DURATION * FPS)) * 100).toFixed(0);
      process.stdout.write(`\r  recording: frame ${m[1]} / ${DURATION * FPS} (${pct}%)`);
    }
  });

  // Set up close handler BEFORE playing
  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      if (code === 0 || code === null) resolve(code);
      else reject(new Error(`ffmpeg exited ${code}:\n${ffmpegLog.slice(-600)}`));
    });
    ffmpeg.on('error', err => reject(new Error(`ffmpeg spawn: ${err.message}`)));
  });

  // Give FFmpeg a moment to connect to x11grab
  await delay(800);

  // Play the animation
  console.log(`  playing animation (${DURATION}s)...\n`);
  await page.evaluate(() => { window.__play(); });

  // Wait for FFmpeg to finish naturally (via -t flag)
  const exitCode = await ffmpegDone;
  console.log(`\n  FFmpeg done (code: ${exitCode})\n`);

  await browser.close();
  xvfb.kill();
  server.close();

  const mb = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`  ✅ ${OUTPUT_FILE}`);
  console.log(`     ${mb} MB · ${DURATION}s · ${FPS}fps · ProRes 422 HQ\n`);
}

main().catch(e => {
  console.error('\n❌', e.message);
  process.exit(1);
});
