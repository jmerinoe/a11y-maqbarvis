// One-shot: enumerate simple paths San Nicasio -> Aeropuerto T4 with
// duration <= 60 min, using Yen's algorithm on the modelled graph
// (same rules as metro.js buildGraph: interrupted lines excluded,
// edges touching cutStations excluded, weight = minutesPerStop*multiplier).
import {
  metroLines,
  cutStations,
  allStations,
} from '../apps/experience/src/experiences/chromatic/data/metro.js';

const FROM = 'San Nicasio';
const TO = 'Aeropuerto T4';
const MAX_MIN = 60;
const MAX_PATHS = 10000; // safety cap

// --- graph: adj[u] = [{to, w, lineId}] ----------------------------------
const adj = new Map();
const addEdge = (a, b, w, lineId) => {
  if (!adj.has(a)) adj.set(a, []);
  adj.get(a).push({ to: b, w, lineId });
};
for (const line of metroLines) {
  if (line.status === 'interrupted') continue;
  const w = line.minutesPerStop * line.multiplier;
  const n = line.stations.length;
  const last = line.circular ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = line.stations[i];
    const b = line.stations[(i + 1) % n];
    if (cutStations.includes(a) || cutStations.includes(b)) continue;
    addEdge(a, b, w, line.id);
    addEdge(b, a, w, line.id);
  }
}

// Dijkstra. bannedNodes: stations that cannot appear; bannedEdges: Set of
// 'u>v' directed edges. Returns {cost, path:[stations], lines:[lineId per hop]}
// or null.
function dijkstra(src, dst, bannedNodes, bannedEdges) {
  const dist = new Map([[src, 0]]);
  const prev = new Map(); // node -> {from, lineId}
  const visited = new Set();
  while (true) {
    let cur = null,
      best = Infinity;
    for (const [n, d] of dist)
      if (!visited.has(n) && d < best) (best = d), (cur = n);
    if (cur === null) return null;
    if (cur === dst) break;
    visited.add(cur);
    for (const e of adj.get(cur) || []) {
      if (bannedNodes.has(e.to) && e.to !== dst) continue;
      if (bannedEdges.has(cur + '>' + e.to)) continue;
      const nd = best + e.w;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, { from: cur, lineId: e.lineId });
      }
    }
  }
  const path = [dst];
  const lines = [];
  let n = dst;
  while (n !== src) {
    const p = prev.get(n);
    lines.unshift(p.lineId);
    path.unshift(p.from);
    n = p.from;
  }
  return { cost: dist.get(dst), path, lines };
}

// --- Yen -----------------------------------------------------------------
const first = dijkstra(FROM, TO, new Set(), new Set());
if (!first) {
  console.log('no route');
  process.exit(0);
}
const A = [first]; // accepted paths, in order
const B = new Map(); // key -> candidate

while (A.length < MAX_PATHS) {
  const prev = A[A.length - 1];
  for (let i = 0; i < prev.path.length - 1; i++) {
    const spur = prev.path[i];
    const root = prev.path.slice(0, i + 1);
    const bannedEdges = new Set();
    for (const p of [...A, ...B.values()]) {
      if (
        p.path.length > i &&
        p.path.slice(0, i + 1).every((s, j) => s === root[j])
      )
        bannedEdges.add(p.path[i] + '>' + p.path[i + 1]);
    }
    const bannedNodes = new Set(root.slice(0, -1));
    const spurPath = dijkstra(spur, TO, bannedNodes, bannedEdges);
    if (!spurPath) continue;
    const rootCost = A.reduce(
      (c) => c,
      0
    ); // placeholder (recomputed below)
    // cost of root: recompute from prev lines
    let rc = 0;
    for (let k = 0; k < i; k++) {
      const e = (adj.get(prev.path[k]) || []).find(
        (x) => x.to === prev.path[k + 1] && x.lineId === prev.lines[k]
      );
      rc += e.w;
    }
    const cand = {
      cost: rc + spurPath.cost,
      path: [...root.slice(0, -1), ...spurPath.path],
      lines: [...prev.lines.slice(0, i), ...spurPath.lines],
    };
    B.set(cand.path.join('>'), cand);
  }
  if (B.size === 0) break;
  let bestKey = null,
    best = null;
  for (const [k, c] of B) if (!best || c.cost < best.cost) (best = c), (bestKey = k);
  B.delete(bestKey);
  if (best.cost > MAX_MIN) break;
  A.push(best);
}

const routes = A.filter((r) => r.cost <= MAX_MIN);
console.log(`routes ${FROM} -> ${TO} with duration <= ${MAX_MIN} min: ${routes.length}`);
const byCost = new Map();
for (const r of routes) byCost.set(r.cost, (byCost.get(r.cost) ?? 0) + 1);
console.log('\nper duration:');
for (const [c, n] of [...byCost].sort((a, b) => a[0] - b[0]))
  console.log(`  ${c} min: ${n} route(s)`);

// Group legs by consecutive same-line hops.
const legsOf = (r) => {
  const legs = [];
  for (let i = 0; i < r.lines.length; i++) {
    const lastLeg = legs[legs.length - 1];
    if (lastLeg && lastLeg.lineId === r.lines[i]) {
      lastLeg.to = r.path[i + 1];
      lastLeg.stops++;
    } else {
      legs.push({ lineId: r.lines[i], from: r.path[i], to: r.path[i + 1], stops: 1 });
    }
  }
  return legs;
};

console.log('\nroutes (up to 40):');
routes.slice(0, 40).forEach((r, i) => {
  const legs = legsOf(r)
    .map((l) => `${l.lineId} ${l.from}→${l.to} (${l.stops})`)
    .join(' | ');
  console.log(`#${i + 1} ${r.cost} min: ${legs}`);
});
if (routes.length > 40) console.log(`… and ${routes.length - 40} more`);
