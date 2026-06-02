#!/usr/bin/env node
/**
 * Jiko Explainer — parallel headless renderer
 *
 * Spins up 4 Chromium instances in parallel, each rendering a quarter of
 * the animation to JPEG frame files, then assembles them into a
 * ProRes 422 HQ .mov with FFmpeg.
 *
 * Usage:  node render.js
 * Output: Jiko_Explainer.mov
 */

const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_DIR   = path.join(__dirname, 'project');
const OUTPUT_FILE   = path.join(__dirname, 'Jiko_Explainer.mov');
const FRAMES_DIR    = path.join(os.tmpdir(), 'jiko_frames_' + Date.now());
const CHROMIUM_BIN  = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG_BIN    = '/usr/bin/ffmpeg';

const WIDTH          = 1920;
const HEIGHT         = 1080;
const VIEWPORT_H     = 1200;   // ensures Stage computes scale=1.0
const CANVAS_OFFSET_Y = 38;    // canvas top when viewport=1200, stage=1080
const FPS            = 30;
const DURATION       = 184;    // must match Stage duration prop
const TOTAL_FRAMES   = Math.ceil(DURATION * FPS);
const NUM_WORKERS    = 4;

// JPEG quality for intermediate frames — high enough for ProRes output
// (animation has flat colors, gradients, text — 93 is perceptually lossless here)
const JPEG_QUALITY = 93;

// ── MIME map for static server ─────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.json': 'application/json',
};

// ── Local HTTP server (shared across workers) ──────────────────────────────

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/' || urlPath === '') urlPath = '/render.html';
      const decoded = decodeURIComponent(urlPath);
      const filePath = path.join(PROJECT_DIR, decoded.replace(/^\//, ''));
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'max-age=3600',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

// ── Worker: renders a range of frames to JPEG files ────────────────────────

async function renderWorker(workerId, startFrame, endFrame, port, progressBuf) {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--force-color-profile=srgb',
      `--window-size=${WIDTH},${VIEWPORT_H}`,
    ],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: VIEWPORT_H },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => {
    if (!e.message.includes('favicon')) {
      process.stderr.write(`[W${workerId}] ${e.message.slice(0, 80)}\n`);
    }
  });

  const cdp = await context.newCDPSession(page);
  const clipParams = {
    x: 0, y: CANVAS_OFFSET_Y,
    width: WIDTH, height: HEIGHT,
    scale: 1,
  };

  await page.goto(`http://127.0.0.1:${port}/`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  await page.waitForFunction(() => window.__renderReady === true, { timeout: 30000 });

  // Warm up at the first frame of this segment
  await page.evaluate((t) => window.__seek(t), startFrame / FPS);
  await new Promise((r) => setTimeout(r, 3000));

  // Render frames
  for (let frame = startFrame; frame < endFrame; frame++) {
    const t = frame / FPS;
    await page.evaluate((seekT) => window.__seek(seekT), t);

    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: JPEG_QUALITY,
      clip: clipParams,
    });

    const framePath = path.join(FRAMES_DIR, String(frame).padStart(7, '0') + '.jpg');
    fs.writeFileSync(framePath, Buffer.from(data, 'base64'));

    progressBuf[workerId] = frame - startFrame + 1;
  }

  await browser.close();
}

// ── Progress reporter ──────────────────────────────────────────────────────

function startProgressReporter(progressBuf, startTime) {
  return setInterval(() => {
    const totalDone = progressBuf.reduce((a, b) => a + b, 0);
    const pct = ((totalDone / TOTAL_FRAMES) * 100).toFixed(1);
    const elapsed = (Date.now() - startTime) / 1000;
    const fps = elapsed > 0 ? (totalDone / elapsed).toFixed(1) : '0';
    const remaining = totalDone > 0
      ? ((TOTAL_FRAMES - totalDone) / (totalDone / elapsed) / 60).toFixed(1)
      : '?';
    process.stdout.write(
      `\r  [${progressBuf.map((v, i) => `W${i}:${v}`).join(' ')}]  ` +
      `${totalDone}/${TOTAL_FRAMES} (${pct}%)  ${fps}fps  ETA ${remaining}min   `
    );
  }, 2000);
}

// ── FFmpeg: JPEG frames → ProRes 422 HQ MOV ──────────────────────────────

function encodeVideo() {
  return new Promise((resolve, reject) => {
    console.log('\n\nEncoding to ProRes 422 HQ...');
    const args = [
      '-y',
      '-framerate', String(FPS),
      '-start_number', '0',
      '-i', path.join(FRAMES_DIR, '%07d.jpg'),
      '-vcodec', 'prores_ks',
      '-profile:v', '3',          // ProRes 422 HQ — broadcast standard, excellent quality
      '-pix_fmt', 'yuv422p10le',  // 10-bit 4:2:2
      '-vendor', 'apl0',
      '-bits_per_mb', '8000',     // high bitrate
      '-movflags', '+faststart',
      OUTPUT_FILE,
    ];

    const ff = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    ff.on('error', reject);
    ff.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────

function cleanup() {
  try {
    if (fs.existsSync(FRAMES_DIR)) {
      fs.readdirSync(FRAMES_DIR).forEach((f) => {
        fs.unlinkSync(path.join(FRAMES_DIR, f));
      });
      fs.rmdirSync(FRAMES_DIR);
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Jiko Explainer — parallel headless renderer');
  console.log(`  Output   : ${OUTPUT_FILE}`);
  console.log(`  Canvas   : ${WIDTH}×${HEIGHT}  ${FPS}fps  ${DURATION}s`);
  console.log(`  Frames   : ${TOTAL_FRAMES}`);
  console.log(`  Workers  : ${NUM_WORKERS}`);
  console.log(`  Quality  : ProRes 422 HQ  (JPEG ${JPEG_QUALITY} intermediate)\n`);

  // Create frames directory
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  console.log(`  Temp dir : ${FRAMES_DIR}`);

  // Start file server
  const { server, port } = await startServer();
  console.log(`  Server   : http://127.0.0.1:${port}/\n`);

  // Divide work across workers
  const framesPerWorker = Math.ceil(TOTAL_FRAMES / NUM_WORKERS);
  const segments = Array.from({ length: NUM_WORKERS }, (_, i) => ({
    id: i,
    start: i * framesPerWorker,
    end: Math.min((i + 1) * framesPerWorker, TOTAL_FRAMES),
  }));

  console.log('Segments:');
  segments.forEach(({ id, start, end }) => {
    const tStart = (start / FPS).toFixed(1);
    const tEnd = (end / FPS).toFixed(1);
    console.log(`  Worker ${id}: frames ${start}–${end - 1}  (t=${tStart}s–${tEnd}s)`);
  });
  console.log('\nStarting parallel capture...');

  // Shared progress counters
  const progressBuf = new Array(NUM_WORKERS).fill(0);
  const startTime = Date.now();
  const reporter = startProgressReporter(progressBuf, startTime);

  // Launch all workers in parallel
  await Promise.all(
    segments.map(({ id, start, end }) =>
      renderWorker(id, start, end, port, progressBuf).catch((err) => {
        console.error(`\nWorker ${id} failed:`, err.message);
        throw err;
      })
    )
  );

  clearInterval(reporter);
  const captureTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalFramesDone = progressBuf.reduce((a, b) => a + b, 0);
  const totalFps = (totalFramesDone / parseFloat(captureTime)).toFixed(1);
  console.log(`\n\nCapture done: ${totalFramesDone} frames in ${captureTime}s (${totalFps} fps effective)`);

  server.close();

  // Verify all frames exist
  const missing = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const p = path.join(FRAMES_DIR, String(i).padStart(7, '0') + '.jpg');
    if (!fs.existsSync(p)) missing.push(i);
  }
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} frames: ${missing.slice(0, 10).join(', ')}...`);
    process.exit(1);
  }
  console.log(`All ${TOTAL_FRAMES} frames verified.`);

  // Encode
  await encodeVideo();

  // Report
  const stat = fs.statSync(OUTPUT_FILE);
  const mb = (stat.size / 1024 / 1024).toFixed(0);
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\nDone! Total time: ${totalTime} min`);
  console.log(`  ${OUTPUT_FILE}`);
  console.log(`  ${mb} MB  ·  ProRes 422 HQ  ·  ${WIDTH}×${HEIGHT}  ·  ${FPS}fps`);

  cleanup();
}

main().catch((err) => {
  console.error('\nRender failed:', err);
  cleanup();
  process.exit(1);
});
