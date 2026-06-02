#!/usr/bin/env node

const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DURATION = 184;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT_FILE = path.join(__dirname, 'project', 'jiko-explainer.mov');

let mainWindow;
let serverPort = 8765;

// HTTP Server
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        let filePath = path.join(__dirname, 'project', decodeURIComponent(req.url).replace(/^\//, '') || 'Jiko Explainer.html');

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        // Read and serve files
        if (req.url === '/' || req.url.endsWith('.html')) {
          let content = fs.readFileSync(filePath, 'utf8');
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
          const ext = path.extname(req.url);
          const mimes = { '.png': 'image/png', '.avif': 'image/avif', '.mp4': 'video/mp4' };
          res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
          res.end(fs.readFileSync(filePath));
        } else {
          res.writeHead(200);
          res.end(fs.readFileSync(filePath));
        }
      } catch (error) {
        console.error('Server error:', error.message);
        res.writeHead(500);
        res.end('Error');
      }
    });

    server.listen(serverPort, () => {
      console.log(`Server running at http://localhost:${serverPort}`);
      resolve(server);
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Disable sandbox for headless rendering
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-dev-shm-usage');

app.on('ready', async () => {
  console.log('\n🎬 JIKO EXPLAINER VIDEO EXPORT');
  console.log(`Settings: ${DURATION}s @ ${FPS}fps, ${WIDTH}x${HEIGHT}, ProRes MOV\n`);

  const server = await startServer();

  // Create window
  mainWindow = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => ({ action: 'deny' }));

  await mainWindow.loadURL(`http://localhost:${serverPort}/`);

  // Wait for animation
  await sleep(8000);

  const isReady = await mainWindow.webContents.executeJavaScript(`
    typeof window.__seek === 'function' && typeof window.__play === 'function'
  `);

  if (!isReady) {
    const state = await mainWindow.webContents.executeJavaScript(`
      ({
        hasReact: typeof React !== 'undefined',
        hasReactDOM: typeof ReactDOM !== 'undefined',
        hasBabel: typeof Babel !== 'undefined'
      })
    `);
    console.log('State:', state);
    console.error('Animation not ready');
    app.quit();
    return;
  }

  console.log('✅ Animation loaded\n');

  // FFmpeg
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

  console.log(`🎬 Capturing ${totalFrames} frames...`);

  // Capture loop
  for (let i = 0; i < totalFrames; i++) {
    const t = i / FPS;

    // Seek
    await mainWindow.webContents.executeJavaScript(`
      if (window.__seek) window.__seek(${t});
    `);

    await sleep(2);

    // Capture
    try {
      const image = await mainWindow.webContents.capturePage();
      const buf = image.toRGBA();
      ffmpeg.stdin.write(buf);
    } catch (e) {
      console.error('Capture error:', e.message);
    }

    if ((i + 1) % 60 === 0) {
      const pct = (((i + 1) / totalFrames) * 100).toFixed(0);
      console.log(`\n  ${i + 1}/${totalFrames} (${pct}%)`);
    }
  }

  console.log('\n✅ Frames captured. Encoding...');
  ffmpeg.stdin.end();

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      const size = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
      console.log(`\n✅ Success!\n`);
      console.log(`  📁 ${OUTPUT_FILE}`);
      console.log(`  📊 ${size} MB`);
      console.log(`  ⏱️  ${DURATION}s @ ${FPS}fps\n`);
    } else {
      console.error(`FFmpeg exited with code ${code}`);
    }
    server.close();
    app.quit();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
