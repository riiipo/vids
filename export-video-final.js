#!/usr/bin/env node

// Final approach: Use prebuilt libraries injected into the page

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

// Build inline React/ReactDOM UMD by combining CJS with wrapper
function createReactUMD() {
  const react = fs.readFileSync(path.join(__dirname, 'node_modules/react/cjs/react.development.js'), 'utf8');
  const reactdom = fs.readFileSync(path.join(__dirname, 'node_modules/react-dom/cjs/react-dom.development.js'), 'utf8');
  const babel = fs.readFileSync(path.join(__dirname, 'node_modules/@babel/standalone/babel.js'), 'utf8');

  return {
    react: babel + `\nif(typeof window!=="undefined"){window.Babel=Babel;}`,
    // React and ReactDOM need special handling - we'll inject them as globals
    inject: `
      <script>window.React=${extractExports(react, 'React')};</script>
      <script>window.ReactDOM=${extractExports(reactdom, 'ReactDOM')};</script>
      <script>var Babel=${extractExports(babel, 'Babel')};</script>
    `
  };
}

function extractExports(code, name) {
  // Simple extraction - get the module.exports
  const match = code.match(/module\.exports\s*=\s*({[\s\S]*});?$/);
  if (match) {
    return match[1];
  }
  return '{}';
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        let filePath = path.join(__dirname, 'project', decodeURIComponent(req.url).replace(/^\//, '') || 'Jiko Explainer.html');

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end();
          return;
        }

        if (req.url === '/' || req.url.endsWith('.html')) {
          let html = fs.readFileSync(filePath, 'utf8');

          // Inject Babel and React before the scripts
          const babelScript = fs.readFileSync(path.join(__dirname, 'node_modules/@babel/standalone/babel.js'), 'utf8');
          const babelInline = `<script>${babelScript}</script>`;

          html = html.replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"><\/script>/, babelInline);
          html = html.replace(/<script src="https:\/\/unpkg\.com\/react@[^"]*"><\/script>/, '');
          html = html.replace(/<script src="https:\/\/unpkg\.com\/react-dom@[^"]*"><\/script>/, '');

          // Inject React and ReactDOM as window objects
          html = html.replace(/<\/head>/, `
            <script>
              (function() {
                // Minimal React stub - just enough to make the code run
                const React = window.React = function(){};
                React.Fragment = function(){};
                React.useState = () => [null, ()=>{}];
                React.useEffect = () => {};
                React.createContext = () => ({});
                React.useCallback = (fn) => fn;
                React.useMemo = (fn) => fn();

                window.ReactDOM = {
                  createRoot: () => ({render:()=>{}})
                };
              })();
            </script>
          </head>`);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } else if (req.url.endsWith('.js') || req.url.endsWith('.jsx')) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(fs.readFileSync(filePath));
        } else if (req.url.endsWith('.css')) {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(fs.readFileSync(filePath));
        } else if (['.woff', '.otf', '.svg', '.png', '.avif', '.mp4'].some(e => req.url.endsWith(e))) {
          const ext = path.extname(req.url);
          const mimes = { '.woff': 'font/woff', '.otf': 'font/otf', '.svg': 'image/svg+xml', '.png': 'image/png', '.avif': 'image/avif', '.mp4': 'video/mp4' };
          res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
          res.end(fs.readFileSync(filePath));
        } else {
          res.writeHead(200);
          res.end(fs.readFileSync(filePath));
        }
      } catch (error) {
        res.writeHead(500);
        res.end('Error');
      }
    });

    server.listen(8765, () => {
      console.log('Server ready at http://localhost:8765');
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
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });

    console.log('Loading http://localhost:8765...');
    await page.goto('http://localhost:8765/', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => {});

    console.log('Waiting for animation...');
    await delay(8000);

    const ready = await page.evaluate(() => typeof window.__seek === 'function');

    if (!ready) {
      const state = await page.evaluate(() => ({
        React: typeof React,
        ReactDOM: typeof ReactDOM,
        Babel: typeof Babel,
        seek: typeof window.__seek
      }));
      console.log('State:', state);
      throw new Error('Animation not ready');
    }

    console.log('✅ Ready\n');

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
          if (frame - lastLog >= 30) {
            lastLog = frame;
            process.stdout.write(`\rEncoding: ${frame}/${totalFrames}`);
          }
        }
      }
    });

    console.log(`🎬 Capturing ${totalFrames} frames...`);

    for (let i = 0; i < totalFrames; i++) {
      const t = i / FPS;
      await page.evaluate(t => { if (window.__seek) window.__seek(t); }, t);
      await delay(3);

      const ss = await page.screenshot({ encoding: 'binary' });
      ffmpeg.stdin.write(ss);

      if ((i + 1) % 60 === 0) {
        console.log(`\n  ${i + 1}/${totalFrames}`);
      }
    }

    console.log('\n  Encoding...');
    ffmpeg.stdin.end();

    return new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) {
          const size = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
          console.log(`\n✅ Done!\n  ${OUTPUT_FILE}\n  ${size} MB\n`);
          resolve();
        } else {
          reject(new Error(`FFmpeg: ${code}`));
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
  const server = await startServer();
  try {
    await captureFrames();
  } catch (error) {
    console.error('\n❌', error.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

main();
