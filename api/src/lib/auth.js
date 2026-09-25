// lib/auth.js — request guards for the shared API

export function requireEventKey(request) {
  const expected = process.env.EVENT_KEY;
  if (!expected) return null; // no key configured → open (local dev default)
  const provided = request.headers.get('x-event-key');
  if (provided !== expected) {
    return { status: 401, jsonBody: { error: 'invalid event key' } };
  }
  return null;
}

export function requireAdminPin(request) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return { status: 503, jsonBody: { error: 'admin not configured' } };
  }
  const provided = request.headers.get('x-admin-pin');
  if (provided !== expected) {
    return { status: 403, jsonBody: { error: 'invalid admin pin' } };
  }
  return null;
}
