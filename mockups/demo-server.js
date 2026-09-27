// demo-server.js — serves apps/kiosk/dist + a fake ranking API that mutates
// on every poll so the NEW / delta / NEW RECORD animations can be seen live.
// Usage: node mockups/demo-server.js  →  http://127.0.0.1:8400/kiosko/
// Demo only — not part of the shipped app.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../apps/kiosk/dist', import.meta.url));
const PORT = 8400;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.ttf': 'font/ttf', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const ended = {};
const P = (user, m, s) => {
  ended[user] ??= `2026-09-26T19:${String(Object.keys(ended).length).padStart(2, '0')}:00Z`;
  return { user, elapsedMs: (m * 60 + s) * 1000, endedAt: ended[user] };
};

const CARLA = P('CARLA S.', 4, 1);
const JUAN = P('JUAN P.', 4, 52);
const SOFIA = P('SOFÍA L.', 5, 48);
const MARCO = P('MARCO D.', 6, 12);
const DIEGO = P('DIEGO F.', 4, 5);
const LUCIANA = P('LUCIANA B.', 5, 7);
const MARTINA = P('MARTINA R.', 3, 41);

const ANA = P('ANA G.', 4, 30);
const LUIS = P('LUIS M.', 5, 2);
const VALE = P('VALE R.', 5, 40);
const NICO = P('NICO P.', 4, 44);
const ROBERTO = P('ROBERTO M.', 5, 33);
const ELENA = P('ELENA V.', 4, 58);
const PABLO = P('PABLO C.', 6, 44);
const IRENE = P('IRENE G.', 7, 12);
const HUGO = P('HUGO S.', 5, 56);

const timelines = {
  'screen-reader': [
    [CARLA, JUAN, SOFIA, MARCO],
    [CARLA, JUAN, SOFIA, MARCO],
    [CARLA, DIEGO, JUAN, SOFIA, MARCO],                          // NEW entry at #2
    [CARLA, DIEGO, JUAN, LUCIANA, SOFIA, MARCO],                 // reorder + NEW
    [MARTINA, CARLA, DIEGO, JUAN, LUCIANA, SOFIA, MARCO],        // NEW RECORD
    // two-column steps (sorted by elapsedMs): 12 then 14 entries
    [MARTINA, CARLA, DIEGO, ANA, JUAN, ELENA, LUIS, LUCIANA, ROBERTO, SOFIA, HUGO, MARCO],
    [MARTINA, CARLA, DIEGO, ANA, JUAN, ELENA, LUIS, LUCIANA, ROBERTO, SOFIA, HUGO, MARCO, PABLO, IRENE],
    [MARTINA, CARLA, DIEGO, JUAN, LUCIANA, SOFIA, MARCO],
  ],
  'low-vision': [
    [ANA, LUIS, VALE],
    [ANA, LUIS, VALE],
    [NICO, ANA, LUIS, VALE],                          // NEW RECORD
    [NICO, ANA, LUIS, VALE],
    [NICO, ANA, LUIS, VALE],
    [NICO, ANA, LUIS, VALE],
  ],
};

const counters = {};
function nextRanking(expId) {
  const steps = timelines[expId] ?? timelines['screen-reader'];
  const n = counters[expId] ?? 0;
  counters[expId] = (n + 1) % steps.length;
  return steps[n];
}

const json = (res, data) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/experiences') {
    return json(res, { experiences: Object.keys(timelines) });
  }
  if (u.pathname === '/api/ranking') {
    return json(res, { ranking: nextRanking(u.searchParams.get('experienceId')) });
  }
  let p = u.pathname.replace(/^\/kiosko/, '') || '/';
  if (p === '/') p = '/index.html';
  try {
    const data = await readFile(join(DIST, normalize(p)));
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`demo → http://127.0.0.1:${PORT}/kiosko/`));
