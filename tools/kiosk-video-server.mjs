// tools/kiosk-video-server.mjs — static file server for the kiosk promo video.
// The kiosk page is served from the SWA (https), but the <video> source points
// at http://localhost:PORT/... so the ~86 MB file never leaves the stand PC.
// Zero deps: `npm run dev:kiosk-video` (port KIOSK_VIDEO_PORT, dir KIOSK_VIDEO_DIR).

import { createServer } from 'node:http';
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.KIOSK_VIDEO_PORT) || 8090;
const DIR = resolve(process.env.KIOSK_VIDEO_DIR || 'media');
const MIME = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = normalize(join(DIR, pathname));
  // Path traversal guard — never serve outside DIR.
  if (!file.startsWith(DIR)) {
    res.writeHead(403).end();
    return;
  }
  let st;
  try {
    st = statSync(file);
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  if (!st.isFile()) {
    res.writeHead(404).end('not found');
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
  res.setHeader('Accept-Ranges', 'bytes');
  if (req.method === 'HEAD') {
    res.writeHead(200, { 'Content-Length': st.size }).end();
    return;
  }

  // Browsers stream video with Range requests — honour them so seeking works.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]));
    const end = Math.min(range[2] && range[1] ? Number(range[2]) : st.size - 1, st.size - 1);
    if (start > end || start >= st.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end();
      return;
    }
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${st.size}`,
      'Content-Length': end - start + 1,
    });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Length': st.size });
  createReadStream(file).pipe(res);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ocupado — ¿ya hay otro dev:kiosk-video corriendo? (o usá KIOSK_VIDEO_PORT=otro)`);
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, () => {
  console.log(`Serving ${DIR} at http://localhost:${PORT}/`);
  try {
    for (const f of readdirSync(DIR)) {
      if (MIME[extname(f).toLowerCase()]) console.log(`  http://localhost:${PORT}/${f}`);
    }
  } catch {
    console.log('  (carpeta media/ vacía o inexistente — suelta ahí el .mp4)');
  }
});
