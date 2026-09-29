// extract-metro-map-svg.mjs — derives the interactive chromatic map from
// the schematic SVG (public/metro/metro-map.svg):
//   1. rasterizes the SVG via resvg (text is outlined, not extractable)
//   2. OCRs it (normal + inverted for white-on-black interchange boxes)
//      and locates each modelled station's label → data/metro-map-data.js
//      with fractional (0-1) positions of the SVG viewBox.
// The PDF variant lives in extract-metro-map.mjs; the matching machinery
// is duplicated here to keep both pipelines independent.
// Usage: node tools/extract-metro-map-svg.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import { createWorker } from 'tesseract.js';
import { allStations } from '../apps/experience/src/experiences/chromatic/data/metro.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SVG = join(root, 'apps/experience/public/metro/metro-map.svg');
const DATA_OUT = join(
  root,
  'apps/experience/src/experiences/chromatic/data/metro-map-data.js'
);
const OCR_WIDTH = 3400; // raster width for OCR — small labels need pixels
const CACHE = join(root, 'tools/tmp/ocr-cache-svg.json');

// Manual label positions (OCR-raster px) for stations OCR cannot read
// (white-on-black boxes, dense interchanges, split labels). Read off
// region crops of tools/tmp/svg-ocr.png.
// Note: 'Campo de las Naciones' is not drawn on this schematic — its
// hotspot sits on the L8 curve where the station would be.
const OVERRIDES_PX = {
  'Alonso Martínez': [1775, 1851],
  Argüelles: [1196, 1737],
  'Avenida de América': [1915, 1549],
  'Campo de las Naciones': [2800, 1035],
  Chamartín: [1788, 875],
  'Colonia Jardín': [957, 2416],
  'Conde de Casal': [2041, 2205],
  'Cuatro Caminos': [1414, 1365],
  'Diego de León': [2127, 1608],
  'El Casar': [1657, 3170],
  'Gregorio Marañón': [1806, 1614],
  'Guzmán el Bueno': [1258, 1413],
  'Hospital Severo Ochoa': [1112, 3095],
  'Julián Besteiro': [1245, 3092],
  'Las Tablas': [1699, 462],
  'Manuel Becerra': [2185, 1778],
  'Méndez Álvaro': [1847, 2395],
  Moncloa: [1188, 1701],
  Noviciado: [1566, 1856],
  'Nuevos Ministerios': [1636, 1364],
  Pacífico: [2022, 2365],
  'Parque de los Estados': [1152, 3575],
  'Parque Lisboa': [545, 2925],
  'Pinar de Chamartín': [1957, 861],
  'Plaza de Castilla': [1685, 1115],
  'Plaza Elíptica': [1587, 2502],
  'República Argentina': [1826, 1473],
  'Sainz de Baranda': [2193, 1971],
  'San Bernardo': [1404, 1677],
  Tribunal: [1583, 1778],
  'Universidad Rey Juan Carlos': [236, 3185],
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

// --- rasterize ---
const svgSrc = await readFile(SVG, 'utf8');
const vb = svgSrc.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
if (!vb) throw new Error('SVG viewBox not found');
const vbW = parseFloat(vb[1]);
const vbH = parseFloat(vb[2]);

const resvg = new Resvg(svgSrc, {
  fitTo: { mode: 'width', value: OCR_WIDTH },
  background: 'white',
});
const png = resvg.render().asPng();
const decoded = PNG.sync.read(png);
const ocr = { w: decoded.width, h: decoded.height, png };
console.log(`SVG viewBox: ${vbW}x${vbH} · OCR raster: ${ocr.w}x${ocr.h}`);
await mkdir(join(root, 'tools/tmp'), { recursive: true });
await writeFile(join(root, 'tools/tmp/svg-ocr.png'), png);

// --- OCR (cached per pass — each takes minutes) ---
let data, invData, cache = {};
try {
  cache = JSON.parse(await readFile(CACHE, 'utf8'));
  console.log('ocr cache hit');
} catch {
  /* cold cache */
}
({ data, invData } = cache);
if (!data || !invData) {
  const worker = await createWorker('spa');
  await worker.setParameters({ tessedit_pageseg_mode: '11' }); // sparse text
  if (!data) ({ data } = await worker.recognize(ocr.png, {}, { blocks: true }));
  if (!invData) {
    // white-on-black station boxes need an inverted pass
    const inv = PNG.sync.read(png);
    for (let i = 0; i < inv.data.length; i += 4) {
      inv.data[i] = 255 - inv.data[i];
      inv.data[i + 1] = 255 - inv.data[i + 1];
      inv.data[i + 2] = 255 - inv.data[i + 2];
    }
    ({ data: invData } = await worker.recognize(
      PNG.sync.write(inv),
      {},
      { blocks: true }
    ));
  }
  await worker.terminate();
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
const medH = allWordHeights([...words, ...invWords]) || 10;
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

// overrides win over OCR matches (unreadable / ambiguous labels).
// OCR-raster pixels → viewBox fractions.
for (const [name, [px, py]] of Object.entries(OVERRIDES_PX)) {
  stations[name] = {
    x: px / ocr.w,
    y: py / ocr.h,
    w: 0.03,
    h: 0.01,
    manual: true,
  };
}

const stillMissing = allStations().filter((s) => !stations[s]);
const outOfBounds = Object.keys(stations).filter((n) => {
  const p = stations[n];
  return p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1;
});

const out = `// metro-map-data.js — GENERATED by tools/extract-metro-map-svg.mjs (OCR of
// metro-map.svg). Positions as fractions (0-1) of the image, label-centered.
export const mapImage = { w: ${vbW}, h: ${vbH} };
export const stationPositions = ${JSON.stringify(stations, null, 1)};
`;
await writeFile(DATA_OUT, out);

console.log(
  `stations matched: ${Object.keys(stations).length}/${allStations().length}`
);
if (stillMissing.length) console.log('STILL MISSING:', stillMissing.join(' | '));
if (outOfBounds.length)
  console.log('OUT OF BOUNDS:', outOfBounds.join(' | '));
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
