#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DURATION = 184;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT_FILE = path.join(__dirname, 'project', 'jiko-explainer.mov');

let serverPort = 8765;

// Start simple HTTP server
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        let filePath = path.join(__dirname, 'project', decodeURIComponent(req.url).replace(/^\//, '') || 'Jiko Explainer.html');

        // Special handling for script requests
        if (req.url === '/react.js') {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(path.join(__dirname, 'node_modules/react/cjs/react.development.js')));
          return;
        }
        if (req.url === '/react-dom.js') {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(path.join(__dirname, 'node_modules/react-dom/cjs/react-dom.development.js')));
          return;
        }
        if (req.url === '/babel.js') {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(path.join(__dirname, 'node_modules/@babel/standalone/babel.js')));
          return;
        }

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not found: ' + filePath);
          return;
        }

        // Read and modify HTML
        if (req.url === '/' || req.url.endsWith('.html')) {
          let content = fs.readFileSync(filePath, 'utf8');
          // Replace CDN URLs with local paths
          content = content.replace(/https:\/\/unpkg\.com\/react@[^"]*/g, 'http://localhost:' + serverPort + '/react.js')
                           .replace(/https:\/\/unpkg\.com\/react-dom@[^"]*/g, 'http://localhost:' + serverPort + '/react-dom.js')
                           .replace(/https:\/\/unpkg\.com\/@babel[^"]*/g, 'http://localhost:' + serverPort + '/babel.js');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        } else if (req.url.endsWith('.js') || req.url.endsWith('.jsx')) {
          res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.css')) {
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.woff') || req.url.endsWith('.otf')) {
          res.writeHead(200, { 'Content-Type': 'font/woff' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.svg')) {
          res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
          res.end(fs.readFileSync(filePath));
        } else if (['.png', '.avif', '.mp4'].some(ext => req.url.endsWith(ext))) {
          const mimes = { '.png': 'image/png', '.avif': 'image/avif', '.mp4': 'video/mp4' };
          const ext = path.extname(req.url);
          res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
          res.end(fs.readFileSync(filePath));
        } else {
          res.writeHead(200);
          res.end(fs.readFileSync(filePath));
        }
      } catch (error) {
        console.error('Server error:', error.message);
        res.writeHead(500);
        res.end('Error: ' + error.message);
      }
    });

    server.listen(serverPort, () => {
      console.log(`HTTP server at http://localhost:${serverPort}`);
      resolve(server);
    });
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureFrames() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });

    // Intercept and handle requests
    await page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`⚠️  HTTP ${response.status()}: ${response.url()}`);
      }
    });

    console.log(`Loading http://localhost:${serverPort}/...`);
    await page.goto(`http://localhost:${serverPort}/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    }).catch(e => console.log('Navigation note:', e.message));

    console.log('Waiting for animation engine...');
    await delay(12000);

    const state = await page.evaluate(() => ({
      react: typeof React !== 'undefined',
      reactdom: typeof ReactDOM !== 'undefined',
      babel: typeof Babel !== 'undefined',
      ready: typeof window.__seek === 'function',
      root: !!document.getElementById('root')
    }));

    console.log('\n📊 Loaded:');
    console.log(`   React: ${state.react ? '✅' : '❌'}`);
    console.log(`   ReactDOM: ${state.reactdom ? '✅' : '❌'}`);
    console.log(`   Babel: ${state.babel ? '✅' : '❌'}`);
    console.log(`   Animation: ${state.ready ? '✅' : '❌'}`);

    if (!state.ready) {
      throw new Error('Animation engine not ready');
    }

    console.log('\n✅ Ready!\n');

    // FFmpeg process
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'rawvideo',
      '-pixel_format', 'rgba',
      '-video_size', `${WIDTH}x${HEIGHT}`,
      '-framerate', String(FPS),
      '-i', 'pipe:0',
      '-c:v', 'prores',
      '-profile:v', '3',
      '-q:v', '1',
      '-color_primaries', 'bt709',
      '-color_trc', 'bt709',
      '-colorspace', 'bt709',
      OUTPUT_FILE
    ]);

    const totalFrames = Math.ceil(DURATION * FPS);
    let lastLog = 0;

    ffmpeg.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('frame=')) {
        const m = msg.match(/frame=\s*(\d+)/);
        if (m) {
          const frame = parseInt(m[1]);
          if (frame - lastLog >= 30 || frame === 1) {
            lastLog = frame;
            const pct = ((frame / totalFrames) * 100).toFixed(0);
            process.stdout.write(`\rEncoding: ${frame}/${totalFrames} (${pct}%)`);
          }
        }
      }
    });

    console.log(`🎬 Capturing ${totalFrames} frames at ${FPS}fps...`);

    for (let i = 0; i < totalFrames; i++) {
      const t = i / FPS;
      await page.evaluate(t => { if (window.__seek) window.__seek(t); }, t);
      await delay(2);

      const ss = await page.screenshot({ encoding: 'binary' });
      ffmpeg.stdin.write(ss);

      if ((i + 1) % 90 === 0) {
        const pct = (((i + 1) / totalFrames) * 100).toFixed(0);
        console.log(`\n  [${i + 1}/${totalFrames} frames - ${pct}% captured]`);
      }
    }

    console.log(`\n  All frames captured. Encoding...`);
    ffmpeg.stdin.end();

    return new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) {
          const size = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
          console.log(`\n✅ Success!\n`);
          console.log(`  📁 ${OUTPUT_FILE}`);
          console.log(`  📊 ${size} MB`);
          console.log(`  ⏱️  ${DURATION}s @ ${FPS}fps`);
          console.log(`  🎬 ProRes 422 HQ\n`);
          resolve();
        } else {
          reject(new Error(`FFmpeg exited: ${code}`));
        }
      });
      ffmpeg.on('error', reject);
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n🎬 JIKO EXPLAINER VIDEO EXPORT\n');
  console.log(`Settings: ${DURATION}s @ ${FPS}fps, ${WIDTH}x${HEIGHT}, ProRes MOV\n`);

  const server = await startServer();

  try {
    await captureFrames();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
