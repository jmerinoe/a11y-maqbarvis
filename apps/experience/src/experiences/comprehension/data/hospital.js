// hospital.js — comprehension experience: fictional hospital model.
// Centers and specialties are invented; availability is fully
// deterministic (odd days, weekends and odd hours are busy) and
// stateless — a booked slot stays available for every participant.

// Deliberately unordered: the participant must find the required center.
export const centers = [
  'Policlínico Las Cumbres',
  'Hospital San Aurelio',
  'Centro Médico Fuente Clara',
  'Hospital Mar de Plata',
  'Clínica Mirador del Río',
  'Centro de Salud Puerto Verde',
  'Hospital Vega Norte',
  'Centro de Especialidades Torre Blanca',
  'Hospital Virgen de la Alameda',
  'Policlínico Jardines del Este',
  'Centro Médico Bahía Serena',
  'Clínica Los Fresnos',
  'Hospital Costa Dorada',
  'Centro Médico El Pinar',
  'Policlínico Ribera Alta',
  'Hospital Monte Claro',
  'Clínica Santa Irene',
  'Centro de Especialidades Los Tilos',
  'Hospital La Colina',
  'Centro Médico Valle Verde',
  'Policlínico Puerta Real',
  'Hospital Nuevo Amanecer',
  'Clínica Del Parque',
  'Centro de Salud Altavista',
  'Hospital San José del Mar',
  'Centro Médico Los Álamos',
  'Policlínico Nueva Estación',
  'Hospital Sierra Norte',
  'Clínica El Robledal',
  'Centro de Especialidades La Vega',
];

// Deliberately unordered: the participant must hunt for Algología.
export const specialties = [
  'Cardiología',
  'Aparato Digestivo',
  'Oftalmología',
  'Traumatología',
  'Neurología',
  'Dermatología',
  'Reumatología',
  'Otorrinolaringología',
  'Nefrología',
  'Psiquiatría',
  'Hematología',
  'Algología',
  'Endocrinología',
  'Ginecología',
  'Neumología',
  'Urología',
  'Oncología',
  'Alergología',
  'Pediatría',
  'Medicina Interna',
  'Rehabilitación',
  'Angiología',
  'Cirugía General',
  'Enfermedades Infecciosas',
  'Neurocirugía',
  'Medicina del Deporte',
  'Geriatría',
  'Inmunología',
  'Cirugía Plástica',
  'Anestesiología y Reanimación',
];

// Hourly appointment starts: 8:00–19:00 (each slot lasts one hour).
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

// Deterministic shuffle (seeded LCG) so the date list shows a stable
// scrambled order — sorted order would make the decoys too easy to skip.
function shuffled(arr) {
  const out = [...arr];
  let s = 42;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Dates offered by the booking form: the mission window (October 16–31)
// interleaved with November decoy dates, all in scrambled order.
export function appointmentDays(year = new Date().getFullYear()) {
  const days = [];
  for (let d = 16; d <= 31; d++) {
    days.push(`${year}-10-${String(d).padStart(2, '0')}`);
  }
  for (let d = 1; d <= 15; d++) {
    days.push(`${year}-11-${String(d).padStart(2, '0')}`);
  }
  return shuffled(days);
}

export function isWeekend(dateIso) {
  const day = new Date(`${dateIso}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

// A slot is occupied on odd-numbered days, weekends and odd hours.
export function isSlotFree(dateIso, hour) {
  const dayOfMonth = Number(dateIso.slice(-2));
  if (dayOfMonth % 2 === 1) return false;
  if (isWeekend(dateIso)) return false;
  return hour % 2 === 0;
}

export function isAfternoon(hour, mission) {
  return hour >= mission.afternoonStart && hour < mission.afternoonEnd;
}

// The mission requires the second fortnight of October (16–31).
export function isMissionDate(dateIso, mission) {
  const month = Number(dateIso.slice(5, 7));
  const day = Number(dateIso.slice(-2));
  return month === mission.month && day >= mission.dayMin && day <= mission.dayMax;
}

export function isMissionAppointment({ specialty, center, date, hour }, mission) {
  return (
    specialty === mission.specialty &&
    center === mission.center &&
    isMissionDate(date, mission) &&
    isAfternoon(hour, mission)
  );
}
