// extract-metro-map.mjs — derives the interactive chromatic map from the
// official plano PDF:
//   1. rasterizes page 1 → apps/experience/public/metro/metro-map.png
//   2. OCRs a higher-res raster (the PDF text is outlined, not extractable)
//      and locates each modelled station's label → data/metro-map-data.js
//      with fractional (0-1) positions.
// Usage: node tools/extract-metro-map.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker } from 'tesseract.js';
import { allStations } from '../apps/experience/src/experiences/chromatic/data/metro.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = join(root, 'apps/experience/public/metro/plano-metro.pdf');
const PNG_OUT = join(root, 'apps/experience/public/metro/metro-map.png');
const DATA_OUT = join(
  root,
  'apps/experience/src/experiences/chromatic/data/metro-map-data.js'
);
const SCALE = 3; // display raster
const OCR_SCALE = 5; // OCR raster — small labels need more pixels

// Manual label positions (scale-3 px) for stations OCR cannot read
// (white-on-black boxes, dense interchanges) AND for stations whose names
// also appear in the bottom-left line index — OCR otherwise anchors the
// hotspot on the index entry, not the map label. Read off region crops.
const OVERRIDES_PX = {
  'Aeropuerto T4': [1920, 680],
  Argüelles: [925, 1170],
  'Casa de Campo': [835, 1440],
  'Cuatro Caminos': [955, 952],
  'El Casar': [1145, 2160],
  'Hospital Infanta Sofía': [1800, 140],
  'Las Tablas': [820, 295],
  Moncloa: [870, 1170],
  'Nuevos Ministerios': [1125, 948],
  'Pinar de Chamartín': [1490, 745],
  'Plaza Elíptica': [800, 1745],
  'Alonso Martínez': [1345, 1305],
  'Arganzuela-Planetario': [1590, 1785],
  'Avenida de América': [1380, 1113],
  'Avenida de la Paz': [1705, 1215],
  Batán: [1030, 1412],
  'Campo de las Naciones': [1865, 755],
  'Ciudad Universitaria': [930, 1080],
  'Conde de Casal': [1700, 1298],
  'Diego de León': [1625, 1160],
  'Feria de Madrid': [1780, 808],
  'Fuenlabrada Central': [970, 2300],
  'Gregorio Marañón': [1285, 1087],
  'Joaquín Vilumbrales': [705, 1815],
  'Manuel Becerra': [1725, 1210],
  'Méndez Álvaro': [1545, 1692],
  Noviciado: [1180, 1320],
  'Parque de los Estados': [1085, 2300],
  'Parque Europa': [805, 2300],
  'Parque Lisboa': [610, 1925],
  'Plaza de Castilla': [1105, 845],
  'Plaza de España': [1065, 1290],
  'Puerta del Ángel': [1030, 1450],
  'República Argentina': [1410, 1010],
  Tribunal: [1185, 1172],
  'Universidad Rey Juan Carlos': [355, 2008],
  Velázquez: [1420, 1290],
};

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function lev(a, b) {
  if (Math.abs(a.length - b.length) > Math.ceil(a.length * 0.3)) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[a.length][b.length];
}

const doc = await getDocument({
  data: new Uint8Array(await readFile(PDF)),
  isEvalSupported: false,
  standardFontDataUrl: pathToFileURL(
    join(root, 'node_modules/pdfjs-dist/standard_fonts/')
  ).href,
  cMapUrl: pathToFileURL(join(root, 'node_modules/pdfjs-dist/cmaps/')).href,
  cMapPacked: true,
}).promise;
const page = await doc.getPage(1);

async function raster(scale) {
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, viewport.width, viewport.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, png: canvas.toBuffer('image/png'), w: viewport.width, h: viewport.height };
}

const disp = await raster(SCALE);
await writeFile(PNG_OUT, disp.png);
console.log(`PNG: ${disp.w}x${disp.h}`);

const ocr = await raster(OCR_SCALE);
console.log(`OCR raster: ${ocr.w}x${ocr.h}`);

// cache the OCR word lists — the two passes take minutes
const CACHE = join(root, 'tools/tmp/ocr-cache.json');
let data, invData;
try {
  const c = JSON.parse(await readFile(CACHE, 'utf8'));
  ({ data, invData } = c);
  console.log('ocr cache hit');
} catch {
  // white-on-black station boxes need an inverted pass
  const imgData = ocr.canvas.getContext('2d').getImageData(0, 0, ocr.w, ocr.h);
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 255 - imgData.data[i];
    imgData.data[i + 1] = 255 - imgData.data[i + 1];
    imgData.data[i + 2] = 255 - imgData.data[i + 2];
  }
  const invCanvas = createCanvas(ocr.w, ocr.h);
  invCanvas.getContext('2d').putImageData(imgData, 0, 0);

  const worker = await createWorker('spa');
  await worker.setParameters({ tessedit_pageseg_mode: '11' }); // sparse text
  ({ data } = await worker.recognize(ocr.png, {}, { blocks: true }));
  ({ data: invData } = await worker.recognize(
    invCanvas.toBuffer('image/png'),
    {},
    { blocks: true }
  ));
  await worker.terminate();
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(root, 'tools/tmp'), { recursive: true });
  await writeFile(CACHE, JSON.stringify({ data, invData }));
}

const collect = (d) => {
  const out = [];
  for (const block of d.blocks || [])
    for (const par of block.paragraphs || [])
      for (const line of par.lines || [])
        for (const w of line.words || [])
          if (w.text && w.confidence > 20) out.push(w);
  return out;
};
const words = collect(data);
const invWords = collect(invData);
console.log(`ocr words: ${words.length} (+${invWords.length} inverted)`);

// cluster each pass separately into text lines (mixing passes interleaves
// junk words between a label's words and breaks contiguity)
const medH =
  allWordHeights([...words, ...invWords]) || 10;
function allWordHeights(ws) {
  const hs = ws.map((w) => w.bbox.y1 - w.bbox.y0).sort((x, y) => x - y);
  return hs[Math.floor(hs.length / 2)];
}

function clusterLines(wordList) {
  const ws = [...wordList].sort(
    (a, b) => (a.bbox.y0 + a.bbox.y1) / 2 - (b.bbox.y0 + b.bbox.y1) / 2
  );
  const lines = [];
  for (const w of ws) {
    const yc = (w.bbox.y0 + w.bbox.y1) / 2;
    const line = lines.find((l) => Math.abs(l.yc - yc) < medH * 0.6);
    if (line) {
      line.items.push(w);
      line.yc = (line.yc * (line.items.length - 1) + yc) / line.items.length;
    } else lines.push({ yc, items: [w] });
  }
  for (const l of lines) l.items.sort((a, b) => a.bbox.x0 - b.bbox.x0);

  // two-line labels: merge vertically adjacent lines with x overlap
  const merged = [...lines];
  for (const a of lines) {
    const ax0 = Math.min(...a.items.map((w) => w.bbox.x0));
    const ax1 = Math.max(...a.items.map((w) => w.bbox.x1));
    for (const b of lines) {
      const gap = b.yc - a.yc;
      if (gap < medH * 0.9 || gap > medH * 2.6) continue;
      const bx0 = Math.min(...b.items.map((w) => w.bbox.x0));
      const bx1 = Math.max(...b.items.map((w) => w.bbox.x1));
      if (Math.min(ax1, bx1) - Math.max(ax0, bx0) > -medH)
        merged.push({ yc: (a.yc + b.yc) / 2, items: [...a.items, ...b.items] });
    }
  }
  return merged;
}

const merged = [...clusterLines(words), ...clusterLines(invWords)];

// all contiguous windows of 1-4 words per line (incl. merged two-line groups)
const windows = [];
for (const l of merged) {
  for (let a = 0; a < l.items.length; a++) {
    let acc = '';
    for (let b = a; b < l.items.length && b - a < 4; b++) {
      acc += (acc ? ' ' : '') + l.items[b].text;
      const w0 = l.items[a].bbox;
      const w1 = l.items[b].bbox;
      windows.push({
        text: norm(acc),
        yc: l.yc,
        x0: w0.x0,
        y0: Math.min(...l.items.slice(a, b + 1).map((w) => w.bbox.y0)),
        x1: w1.x1,
        y1: Math.max(...l.items.slice(a, b + 1).map((w) => w.bbox.y1)),
      });
    }
  }
}
console.log(`windows: ${windows.length}`);

// token-gapped matcher: each station token must appear in order inside a
// window of consecutive words, tolerating up to 2 interposed junk words
const tokTol = (tok) => (tok.length <= 4 ? 1 : 2);
function matchTokens(line, tokens) {
  let best = null;
  for (let s = 0; s < line.items.length; s++) {
    let t = 0;
    let skipped = 0;
    let score = 0;
    const hits = [];
    for (let p = s; p < line.items.length && t < tokens.length; p++) {
      const d = lev(norm(line.items[p].text), tokens[t]);
      if (d <= tokTol(tokens[t])) {
        hits.push(line.items[p]);
        score += d;
        t++;
      } else {
        skipped++;
        score += 2;
        if (skipped > 2 || p - s > 7) break;
      }
    }
    if (t === tokens.length && (!best || score < best.score)) {
      best = {
        score,
        x0: Math.min(...hits.map((h) => h.bbox.x0)),
        y0: Math.min(...hits.map((h) => h.bbox.y0)),
        x1: Math.max(...hits.map((h) => h.bbox.x1)),
        y1: Math.max(...hits.map((h) => h.bbox.y1)),
      };
    }
  }
  return best;
}

const missing = [];
const stations = {};
for (const name of allStations()) {
  const key = norm(name);
  let hit = windows.find((w) => w.text === key);
  if (!hit) {
    const tol = Math.max(1, Math.floor(key.length * 0.2));
    let best = null;
    let bestD = Infinity;
    for (const w of windows) {
      if (Math.abs(w.text.length - key.length) > tol + 1) continue;
      const d = lev(w.text, key);
      if (d <= tol && d < bestD) {
        best = w;
        bestD = d;
      }
    }
    hit = best;
  }
  if (!hit) {
    const tokens = key.split(' ');
    let best = null;
    for (const line of merged) {
      const m = matchTokens(line, tokens);
      if (m && (!best || m.score < best.score)) best = m;
    }
    hit = best;
  }
  if (!hit) {
    missing.push(name);
    continue;
  }
  stations[name] = {
    x: (hit.x0 + hit.x1) / 2 / ocr.w,
    y: (hit.y0 + hit.y1) / 2 / ocr.h,
    w: (hit.x1 - hit.x0) / ocr.w,
    h: (hit.y1 - hit.y0) / ocr.h,
  };
}

// overrides win over OCR matches (index duplicates + unreadable labels)
for (const [name, [px, py]] of Object.entries(OVERRIDES_PX)) {
  stations[name] = {
    x: px / disp.w,
    y: py / disp.h,
    w: 0.03,
    h: 0.01,
    manual: true,
  };
}
const stillMissing = allStations().filter((s) => !stations[s]);

const out = `// metro-map-data.js — GENERATED by tools/extract-metro-map.mjs (OCR of the
// official plano). Positions as fractions (0-1) of the image, label-centered.
export const mapImage = { w: ${Math.round(disp.w)}, h: ${Math.round(disp.h)} };
export const stationPositions = ${JSON.stringify(stations, null, 1)};
`;
await writeFile(DATA_OUT, out);

console.log(`stations matched: ${Object.keys(stations).length}/${allStations().length}`);
if (stillMissing.length) console.log('STILL MISSING:', stillMissing.join(' | '));
if (missing.length) {
  console.log('OCR misses (filled by overrides):', missing.join(' | '));
  // nearest candidates for debugging
  for (const name of missing) {
    const key = norm(name);
    const near = windows
      .map((w) => ({ w, d: lev(w.text, key) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    console.log(
      `  ${name} ->`,
      near
        .map(
          (n) =>
            `"${n.w.text}"(d${n.d} @${Math.round((n.w.x0 / ocr.w) * 1000)},${Math.round(
              (n.w.y0 / ocr.h) * 1000
            )})`
        )
        .join(' ')
    );
  }
}
