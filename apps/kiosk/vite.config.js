import { defineConfig } from 'vite';

// Dev-server mock API — lets the board paint locally without the real
// Azure Functions backend (and without Azurite). Only exists in `vite
// dev`, like the experience app's metro-design-save endpoint: `vite
// preview` and production builds hit the real API as usual.
const MOCK_RANKINGS = {
  'screen-reader': [
    { user: 'Veronica', elapsedMs: 232000, endedAt: '2026-11-11T11:00:00Z', result: 'completed' },
    { user: 'Raul Lavarias', elapsedMs: 495000, endedAt: '2026-11-11T11:05:00Z', result: 'completed' },
    { user: 'Suga', elapsedMs: 511000, endedAt: '2026-11-11T11:10:00Z', result: 'completed' },
    { user: 'Esther', elapsedMs: 610000, endedAt: '2026-11-11T11:15:00Z', result: 'abandoned' },
  ],
  chromatic: [
    { user: 'Ana', elapsedMs: 180000, endedAt: '2026-11-11T11:20:00Z', routeMinutes: 32, result: 'completed' },
    { user: 'Belén', elapsedMs: 240000, endedAt: '2026-11-11T11:25:00Z', routeMinutes: 44, result: 'completed' },
    { user: 'Cid', elapsedMs: 150000, endedAt: '2026-11-11T11:30:00Z', result: 'abandoned' },
  ],
  comprehension: [
    { user: 'Isabel', elapsedMs: 220000, endedAt: '2026-11-11T11:35:00Z', appointmentAt: '2026-10-16T16:00', result: 'completed' },
    { user: 'Celia', elapsedMs: 300000, endedAt: '2026-11-11T11:40:00Z', appointmentAt: '2026-10-20T18:00', result: 'completed' },
    { user: 'Crystian', elapsedMs: 190000, endedAt: '2026-11-11T11:45:00Z', result: 'abandoned' },
  ],
};

const mockApi = {
  name: 'kiosk-mock-api',
  configureServer(server) {
    server.middlewares.use('/api', (req, res) => {
      const send = (data) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      const path = (req.url || '').split('?')[0];
      const expId = new URL(req.url, 'http://localhost').searchParams.get('experienceId');

      if (path === '/experiences') {
        return send({ experiences: Object.keys(MOCK_RANKINGS) });
      }
      if (path === '/ranking') {
        return send({ ranking: MOCK_RANKINGS[expId] ?? [] });
      }
      if (path === '/ops/results' && req.method === 'GET') {
        return send({
          results: Object.entries(MOCK_RANKINGS).flatMap(([id, rows]) =>
            rows.map((r, i) => ({ partitionKey: id, rowKey: `rk${i}`, experienceId: id, ...r }))
          ),
        });
      }
      if (path === '/health') return send({ status: 'ok' });
      res.statusCode = 404;
      res.end();
    });
  },
};

export default defineConfig({
  base: '/kiosko/',
  plugins: [mockApi],
  // Build stamp — theme choice is invalidated on every deploy
  define: { __KIOSK_BUILD__: JSON.stringify(new Date().toISOString()) },
});
