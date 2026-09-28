// pin-gate.js — admin PIN check for locked experiences (accessible)
// Verifies against the PIN-guarded ops endpoint when the API is
// configured; offline dev falls back to VITE_ADMIN_PIN.

import { apiEnabled, apiCheckAdminPin } from '../api/client.js';

export async function verifyAdminPin(pin) {
  if (apiEnabled()) {
    try {
      const status = await apiCheckAdminPin(pin);
      if (status === 403) return 'denied';
      if (status >= 200 && status < 300) return 'ok';
      return 'unavailable';
    } catch {
      return 'unavailable';
    }
  }
  const local = import.meta.env.VITE_ADMIN_PIN || '';
  if (!local) return 'unavailable';
  return pin === local ? 'ok' : 'denied';
}
