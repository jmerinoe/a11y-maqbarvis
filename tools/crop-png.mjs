// crop-png.mjs — pixel crop of the CURRENT metro-map.png for inspection.
// Usage: node tools/crop-png.mjs x0 y0 x1 y1 out.png   (crop-space px)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [x0, y0, x1, y1] = process.argv.slice(2).map(Number);
const out = join(root, 'mockups', process.argv[6] || 'crop-view.png');

const src = PNG.sync.read(await readFile(join(root, 'apps/experience/public/metro/metro-map.png')));
const w = x1 - x0, h = y1 - y0;
const dst = new PNG({ width: w, height: h });
PNG.bitblt(src, dst, x0, y0, w, h, 0, 0);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, PNG.sync.write(dst));
console.log(`${out} ${w}x${h}`);
