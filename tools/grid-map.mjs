// grid-map.mjs — draws a 50px coordinate grid over the CURRENT cropped
// metro-map.png to locate leftover non-map fragments (pngjs decode —
// @napi-rs/canvas drawImage silently fails on loaded PNGs).
// Usage: node tools/grid-map.mjs  → tools/tmp/grid-map.png

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'apps/experience/public/metro/metro-map.png');
const OUT = join(root, 'tools/tmp/grid-map.png');

const png = PNG.sync.read(await readFile(SRC));
const { width: W, height: H, data } = png;

// rgba write
const px = (x, y, r, g, b, a = 255) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
};

for (let x = 0; x < W; x += 50)
  for (let y = 0; y < H; y++)
    if (data[(y * W + x) * 4 + 3] > 0) px(x, y, 255, 60, 60, 110);
for (let y = 0; y < H; y += 50)
  for (let x = 0; x < W; x++) px(x, y, 255, 60, 60, 110);

// tiny labels: paint coord numbers as dark dots — skip fonts entirely;
// instead write coordinate values using a 3x5 micro font for digits only.
const DIG = {
  0: [0b111, 0b101, 0b101, 0b101, 0b111],
  1: [0b010, 0b110, 0b010, 0b010, 0b111],
  2: [0b111, 0b001, 0b111, 0b100, 0b111],
  3: [0b111, 0b001, 0b111, 0b001, 0b111],
  4: [0b101, 0b101, 0b111, 0b001, 0b001],
  5: [0b111, 0b100, 0b111, 0b001, 0b111],
  6: [0b111, 0b100, 0b111, 0b101, 0b111],
  7: [0b111, 0b001, 0b010, 0b010, 0b010],
  8: [0b111, 0b101, 0b111, 0b101, 0b111],
  9: [0b111, 0b101, 0b111, 0b001, 0b111],
};
const label = (x0, y0, s) => {
  let cx = x0;
  for (const ch of s) {
    const g = DIG[ch];
    if (!g) { cx += 4; continue; }
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (g[r] & (4 >> c)) px(cx + c, y0 + r, 180, 0, 0);
    cx += 4;
  }
};
for (let x = 0; x < W; x += 100) label(x + 2, 3, String(x));
for (let y = 50; y < H; y += 100) label(3, y + 3, String(y));

await mkdir(join(root, 'tools/tmp'), { recursive: true });
await writeFile(OUT, PNG.sync.write(png));
console.log(`grid over ${W}x${H}`);
