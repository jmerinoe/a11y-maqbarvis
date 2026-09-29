// metro.js — Madrid metro graph model for the chromatic experience
// Lines modeled with their official station lists (plano esquemático).
// Status: 'operative' | 'restricted' (×multiplier) | 'interrupted' (no tramos,
// edges excluded from the optimal-route computation).

export const metroLines = [
  {
    id: 'L1',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Pinar de Chamartín', 'Bambú', 'Chamartín', 'Plaza de Castilla',
      'Valdeacederas', 'Tetuán', 'Estrecho', 'Alvarado', 'Cuatro Caminos',
      'Ríos Rosas', 'Iglesia', 'Bilbao', 'Tribunal', 'Gran Vía', 'Sol',
      'Tirso de Molina', 'Antón Martín', 'Estación del Arte',
      'Atocha', 'Menéndez Pelayo', 'Pacífico', 'Puente de Vallecas',
      'Nueva Numancia', 'Portazgo', 'Buenos Aires', 'Alto del Arenal',
      'Miguel Hernández', 'Sierra de Guadalupe', 'Villa de Vallecas',
      'Congosto', 'La Gavia', 'Las Suertes', 'Valdecarros',
    ],
  },
  {
    id: 'L2',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Las Rosas', 'Avenida de Guadalajara', 'Alsacia', 'La Almudena',
      'La Elipa', 'Ventas', 'Manuel Becerra', 'Goya', 'Príncipe de Vergara',
      'Retiro', 'Banco de España', 'Sevilla', 'Sol', 'Ópera',
      'Santo Domingo', 'Noviciado', 'San Bernardo', 'Quevedo', 'Canal',
      'Cuatro Caminos',
    ],
  },
  {
    id: 'L3',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Villaverde Alto', 'San Cristóbal', 'Villaverde Bajo Cruce',
      'Ciudad de los Ángeles', 'San Fermín-Orcasur', 'Hospital 12 de Octubre',
      'Almendrales', 'Legazpi', 'Delicias', 'Palos de la Frontera',
      'Embajadores', 'Lavapiés', 'Sol', 'Callao', 'Plaza de España',
      'Ventura Rodríguez', 'Argüelles', 'Moncloa',
    ],
  },
  {
    id: 'L4',
    status: 'restricted',
    multiplier: 3,
    minutesPerStop: 2,
    stations: [
      'Argüelles', 'San Bernardo', 'Bilbao', 'Alonso Martínez', 'Colón',
      'Serrano', 'Velázquez', 'Goya', 'Lista', 'Diego de León',
      'Avenida de América', 'Prosperidad', 'Alfonso XIII', 'Avenida de la Paz',
      'Arturo Soria', 'Esperanza', 'Canillas', 'Mar de Cristal', 'San Lorenzo',
      'Parque de Santa María', 'Hortaleza', 'Manoteras', 'Pinar de Chamartín',
    ],
  },
  {
    id: 'L5',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Alameda de Osuna', 'El Capricho', 'Canillejas', 'Torre Arias',
      'Suanzes', 'Ciudad Lineal', 'Pueblo Nuevo', 'Quintana', 'El Carmen',
      'Ventas', 'Diego de León', 'Núñez de Balboa', 'Rubén Darío',
      'Alonso Martínez', 'Chueca', 'Gran Vía', 'Callao', 'Ópera',
      'La Latina', 'Puerta de Toledo', 'Acacias', 'Pirámides',
      'Marqués de Vadillo', 'Urgel', 'Oporto', 'Vista Alegre', 'Carabanchel',
      'Eugenia de Montijo', 'Aluche', 'Empalme', 'Campamento',
      'Casa de Campo',
    ],
  },
  {
    id: 'L6',
    status: 'interrupted',
    multiplier: 1,
    minutesPerStop: 2,
    circular: true,
    stations: [
      'Nuevos Ministerios', 'Cuatro Caminos', 'Guzmán el Bueno',
      'Vicente Aleixandre', 'Ciudad Universitaria', 'Moncloa', 'Argüelles',
      'Príncipe Pío', 'Puerta del Ángel', 'Alto de Extremadura', 'Lucero',
      'Laguna', 'Carpetana', 'Oporto', 'Opanel', 'Plaza Elíptica', 'Usera',
      'Legazpi', 'Arganzuela-Planetario', 'Méndez Álvaro', 'Pacífico',
      'Conde de Casal', 'Sainz de Baranda', "O'Donnell", 'Manuel Becerra',
      'Diego de León', 'Avenida de América', 'República Argentina',
    ],
  },
  {
    id: 'L7',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Hospital del Henares', 'Henares', 'Jarama', 'San Fernando',
      'La Rambla', 'Coslada Central', 'Barrio del Puerto',
      'Estadio Metropolitano', 'Las Musas', 'San Blas', 'Simancas',
      'García Noblejas', 'Ascao', 'Pueblo Nuevo', 'Barrio de la Concepción',
      'Parque de las Avenidas', 'Cartagena', 'Avenida de América',
      'Gregorio Marañón', 'Alonso Cano', 'Canal', 'Islas Filipinas',
      'Guzmán el Bueno', 'Francos Rodríguez', 'Valdezarza',
      'Antonio Machado', 'Peñagrande', 'Avenida de la Ilustración',
      'Lacoma', 'Pitis',
    ],
  },
  {
    id: 'L8',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Nuevos Ministerios', 'Colombia', 'Mar de Cristal', 'Feria de Madrid',
      'Campo de las Naciones', 'Aeropuerto T1-T2-T3', 'Barajas',
      'Aeropuerto T4',
    ],
  },
  {
    id: 'L9',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Paco de Lucía', 'Mirasierra', 'Herrera Oria', 'Barrio del Pilar',
      'Ventilla', 'Plaza de Castilla', 'Duque de Pastrana', 'Pio XII',
      'Colombia', 'Concha Espina', 'Cruz del Rayo', 'Avenida de América',
      'Núñez de Balboa', 'Príncipe de Vergara', 'Ibiza', 'Sainz de Baranda',
      'Estrella', 'Vinateros', 'Artilleros', 'Pavones', 'Valdebernardo',
      'Vicálvaro', 'San Cipriano', 'Puerta de Arganda',
      'Rivas Urbanizaciones', 'Rivas Futura', 'Rivas Vaciamadrid',
      'La Poveda', 'Arganda del Rey',
    ],
  },
  {
    id: 'L10',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Hospital Infanta Sofía', 'Reyes Católicos', 'Baunatal',
      'Manuel de Falla', 'Marqués de la Valdavia', 'La Moraleja', 'La Granja',
      'Ronda de la Comunicación', 'Las Tablas', 'Montecarmelo', 'Tres Olivos',
      'Fuencarral', 'Begoña', 'Chamartín', 'Plaza de Castilla', 'Cuzco',
      'Santiago Bernabéu', 'Nuevos Ministerios', 'Gregorio Marañón',
      'Alonso Martínez', 'Tribunal', 'Plaza de España', 'Noviciado',
      'Príncipe Pío', 'Puerta del Ángel', 'Lago', 'Batán', 'Casa de Campo',
      'Colonia Jardín', 'Aviación Española', 'Cuatro Vientos',
      'Joaquín Vilumbrales', 'Puerta del Sur',
    ],
  },
  {
    id: 'L11',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Plaza Elíptica', 'Abrantes', 'Pan Bendito', 'San Francisco',
      'Carabanchel Alto', 'La Fortuna', 'La Peseta',
    ],
  },
  {
    id: 'L12',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    circular: true,
    stations: [
      'Puerta del Sur', 'San Nicasio', 'Leganés Central',
      'Hospital Severo Ochoa', 'Casa del Reloj', 'Julián Besteiro',
      'El Carrascal', 'El Casar', 'Juan de la Cierva', 'Getafe Central',
      'Alonso de Mendoza', 'El Bercial', 'Los Espartales', 'Conservatorio',
      'Arroyo Culebro', 'Parque de los Estados', 'Parque Europa',
      'Fuenlabrada Central', 'Hospital Infanta Sofía', 'Loranca',
      'Manuela Malasaña', 'Hospital de Móstoles', 'Pradillo',
      'Móstoles Central', 'Universidad Rey Juan Carlos', 'Parque Oeste',
      'Alcorcón Central', 'Parque Lisboa',
    ],
  },
  {
    id: 'R',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: ['Ópera', 'Príncipe Pío'],
  },
  {
    id: 'ML1',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Pinar de Chamartín', 'Fuente de la Mora', 'Virgen del Cortijo',
      'Antonio Saura', 'Álvarez de Villaamil', 'Blasco Ibáñez',
      'María Tudor', 'Palas de Rey', 'Las Tablas',
    ],
  },
  {
    id: 'ML2',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Colonia Jardín', 'Prado de la Vega', 'Colonia de los Ángeles',
      'Prado del Rey', 'Somosaguas Sur', 'Somosaguas Centro',
      'Pozuelo Oeste', 'Bélgica', 'Dos Castillas', 'Campus de Somosaguas',
      'Avenida de Europa', 'Berna', 'Estación de Aravaca',
    ],
  },
  {
    id: 'ML3',
    status: 'operative',
    multiplier: 1,
    minutesPerStop: 2,
    stations: [
      'Colonia Jardín', 'Ciudad de la Imagen', 'José Isbert',
      'Ciudad del Cine', 'Cocheras', 'Retamas', 'Montepríncipe',
      'Ventorro del Cano', 'Prado del Espino', 'Cantabria',
      'Ferial de Boadilla', 'Boadilla del Centro', 'Nuevo Mundo',
      'Siglo XXI', 'Infante Don Luis', 'Ciudad Financiera',
      'Puerta de Boadilla',
    ],
  },
];

export const LINE_STATUS = ['operative', 'restricted', 'interrupted'];

// Stations where the line is cut: no trains enter or leave. Edges to and
// from them are excluded from the network, and tramos whose segment
// crosses them are not possible.
export const cutStations = ['Alonso Martínez'];

export function getLine(lineId) {
  return metroLines.find((l) => l.id === lineId);
}

// All stations across modeled lines, deduplicated, alphabetized by locale.
export function allStations() {
  return [...new Set(metroLines.flatMap((l) => l.stations))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
}

// Stop count between two stations on one line; circular lines take the
// shorter arc.
export function stopsBetween(line, from, to) {
  const i = line.stations.indexOf(from);
  const j = line.stations.indexOf(to);
  if (i === -1 || j === -1) return null;
  const diff = Math.abs(i - j);
  return line.circular ? Math.min(diff, line.stations.length - diff) : diff;
}

// Duration of a tramo on a given line, status multiplier applied.
export function tramoMinutes(lineId, from, to) {
  const line = getLine(lineId);
  if (!line) return null;
  const stops = stopsBetween(line, from, to);
  return stops === null ? null : stops * line.minutesPerStop * line.multiplier;
}

// The cut station lying on the shorter-arc segment between from/to on
// `line`, or null when the tramo can be ridden.
function segmentCut(line, from, to) {
  const i = line.stations.indexOf(from);
  const j = line.stations.indexOf(to);
  if (i === -1 || j === -1) return null;
  const n = line.stations.length;
  const arc = (step) => {
    const out = [from];
    for (let k = i; k !== j; k = (k + step + n) % n)
      out.push(line.stations[(k + step + n) % n]);
    return out;
  };
  const [a, b] = i < j ? [i, j] : [j, i];
  const fwd = line.circular ? arc(1) : line.stations.slice(a, b + 1);
  const bwd = line.circular ? arc(-1) : null;
  const segment = !bwd || fwd.length <= bwd.length ? fwd : bwd;
  return segment.find((s) => cutStations.includes(s)) ?? null;
}

// Lines that can serve an origin→destination pair. Returns
// { options: [{line, minutes}] } — one entry per usable serving line,
// cheapest first — or { error: 'different-lines' | 'interrupted' | 'cut' |
// 'closed-station' | 'same-station', station? }.
export function tramoOptions(from, to) {
  if (from === to) return { error: 'same-station' };
  const closed = [from, to].find((s) => cutStations.includes(s));
  if (closed) return { error: 'closed-station', station: closed };
  const serving = metroLines.filter(
    (l) => l.stations.includes(from) && l.stations.includes(to)
  );
  if (serving.length === 0) return { error: 'different-lines' };
  const options = serving
    .filter((l) => l.status !== 'interrupted' && !segmentCut(l, from, to))
    .map((l) => ({ line: l, minutes: tramoMinutes(l.id, from, to) }))
    .sort((a, b) => a.minutes - b.minutes);
  if (options.length === 0) {
    const cutLine = serving.find(
      (l) => l.status !== 'interrupted' && segmentCut(l, from, to)
    );
    if (cutLine) {
      return { error: 'cut', station: segmentCut(cutLine, from, to) };
    }
    return { error: 'interrupted', line: serving[0] };
  }
  return { options };
}


// --- Optimal route -------------------------------------------------------
// Nodes are station names (same name on several lines = implicit transfer).
// Edges = consecutive stations on operative/restricted lines, weighted by
// minutes per stop × multiplier. Dijkstra from `from` to `to`.

function buildGraph() {
  const adj = new Map();
  const addEdge = (a, b, w) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push({ to: b, w });
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
      addEdge(a, b, w);
      addEdge(b, a, w);
    }
  }
  return adj;
}

// Minutes of the optimal route (Infinity if unreachable). Tramo list needed
// for leg reconstruction is unnecessary — only the optimum is compared.
export function optimalRouteMinutes(from, to) {
  const adj = buildGraph();
  const dist = new Map([[from, 0]]);
  const visited = new Set();
  while (true) {
    let cur = null;
    let best = Infinity;
    for (const [node, d] of dist) {
      if (!visited.has(node) && d < best) {
        best = d;
        cur = node;
      }
    }
    if (cur === null) break;
    if (cur === to) return best;
    visited.add(cur);
    for (const { to: next, w } of adj.get(cur) || []) {
      if (best + w < (dist.get(next) ?? Infinity)) dist.set(next, best + w);
    }
  }
  return Infinity;
}

// A submitted route (list of tramos) is valid when it starts at `from`,
// each tramo begins where the previous ended, and it finishes at `to`.
export function routeConnects(tramos, from, to) {
  if (tramos.length === 0) return false;
  if (tramos[0].from !== from) return false;
  for (let i = 1; i < tramos.length; i++) {
    if (tramos[i].from !== tramos[i - 1].to) return false;
  }
  return tramos[tramos.length - 1].to === to;
}

export function routeMinutes(tramos) {
  return tramos.reduce((sum, t) => sum + t.minutes, 0);
}
