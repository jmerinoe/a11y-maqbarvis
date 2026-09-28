// crop-map.mjs — writes region crops of the plano (re-rendered from the PDF)
// with a 50px coordinate grid so station label positions can be read
// manually. Coordinates are in the scale-3 image space (2211x2381).
// Usage: node tools/crop-map.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = join(root, 'apps/experience/public/metro/plano-metro.pdf');
const OUT = join(root, 'tools/tmp');
const SCALE = 3;

const REGIONS = [
  ['l8-airport', 0.72, 0.28, 0.92, 0.38],
];

const doc = await getDocument({
  data: new Uint8Array(await readFile(PDF)),
  isEvalSupported: false,
}).promise;
const page = await doc.getPage(1);
const full = page.getViewport({ scale: SCALE });
console.log(`image ${full.width}x${full.height}`);

await mkdir(OUT, { recursive: true });
for (const [name, fx0, fy0, fx1, fy1] of REGIONS) {
  const x0 = Math.round(fx0 * full.width);
  const y0 = Math.round(fy0 * full.height);
  const w = Math.round((fx1 - fx0) * full.width);
  const h = Math.round((fy1 - fy0) * full.height);
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  await page.render({
    canvasContext: ctx,
    viewport: full,
    transform: [1, 0, 0, 1, -x0, -y0],
  }).promise;
  // grid
  ctx.strokeStyle = 'rgba(255,0,0,0.35)';
  ctx.fillStyle = 'rgba(255,0,0,0.95)';
  ctx.font = '15px sans-serif';
  ctx.lineWidth = 0.7;
  for (let gx = 0; gx <= w; gx += 50) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    ctx.fillText(`${x0 + gx}`, gx + 2, 13);
  }
  for (let gy = 0; gy <= h; gy += 50) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    ctx.fillText(`${y0 + gy}`, 2, gy + 13);
  }
  await writeFile(join(OUT, `${name}.png`), c.toBuffer('image/png'));
  console.log(`${name}: origin ${x0},${y0} size ${w}x${h}`);
}
