// shared/contract.js — shared contract between experience app, kiosk, and API
// Single source of truth for endpoint paths and record shapes.

export const API_ROUTES = {
  health: '/api/health',
  users: '/api/users',
  results: '/api/results',
  ranking: '/api/ranking',
  experiences: '/api/experiences',
  adminResults: '/api/ops/results',
};

export const HEADERS = {
  eventKey: 'X-Event-Key',
  adminPin: 'X-Admin-Pin',
};

/**
 * Result record shape (stored in Table Storage, exchanged over the API):
 * {
 *   user:         string   — participant display name
 *   experienceId: string   — e.g. 'screen-reader' (becomes PartitionKey)
 *   startedAt:    ISO-8601 string
 *   endedAt:      ISO-8601 string
 *   elapsedMs:    integer  — client-measured duration
 *   routeMinutes: integer? — journey duration in minutes (chromatic only);
 *                 absent for experiences without a route or legacy records.
 *   appointmentAt: string?  — booked slot "YYYY-MM-DDTHH:MM" (comprehension
 *                 only). Ranking sorts by it first (missing = last), then
 *                 routeMinutes, then elapsedMs.
 *   result:       'completed'
 * }
 *
 * User record shape:
 * { name: string (display), normalized: string (lowercased key),
 *   experienceId: string (uniqueness is per experience — PartitionKey) }
 */
export const RESULT_STATUS = {
  COMPLETED: 'completed',
};

export function normalizeUsername(name) {
  return (name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}
