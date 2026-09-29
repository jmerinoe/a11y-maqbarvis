import { defineConfig } from 'vite';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Dev-server endpoint used by the #/metro-design "Integrar cambios" button:
// the browser cannot write files, so the designer posts the regenerated
// metro-map-data.js source here and the dev server saves it to disk.
// Not present in `vite preview`/production builds — the button then shows
// its fallback error message.
const metroDesignSave = {
  name: 'metro-design-save',
  configureServer(server) {
    server.middlewares.use('/__metro-design/save', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end();
      }
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', async () => {
        try {
          if (!body.includes('stationPositions')) throw new Error('bad payload');
          const target = join(
            server.config.root,
            'src/experiences/chromatic/data/metro-map-data.js'
          );
          await writeFile(target, body, 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false }));
        }
      });
    });
  },
};

export default defineConfig({
  root: '.',
  plugins: [metroDesignSave],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
