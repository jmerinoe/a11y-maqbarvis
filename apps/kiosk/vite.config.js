import { defineConfig } from 'vite';

export default defineConfig({
  base: '/kiosko/',
  // Build stamp — theme choice is invalidated on every deploy
  define: { __KIOSK_BUILD__: JSON.stringify(new Date().toISOString()) },
});
