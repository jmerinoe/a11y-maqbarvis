# Design: User identification, experience selection, and purchase-flow timing

## 1. Overview

A pre-Faro session flow wraps the existing app: `#/login` → `#/experiences` → `#/instructions` → `#/home` → purchase → congrats dialog → `#/ranking`. A session module owns persistence and the timer overlay lives outside `#app` so it survives screen re-renders.

## 2. Data model

```js
// localStorage['faro-users'] — registered usernames
[{ name: 'Ana', normalized: 'ana' }]

// localStorage['faro-results'] — completed runs
[{ user: 'Ana', experienceId: 'screen-reader',
   startedAt: '2026-10-06T10:32:15.000Z', endedAt: '2026-10-06T10:38:42.000Z',
   elapsedMs: 387000, result: 'completed' }]

// sessionStorage['faro-session'] — active session (per tab)
{ user: 'Ana', experienceId: 'screen-reader', startedAt: 1759815135000 }
```

- `normalized = name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()` — uniqueness is trim/case-insensitive; `name` keeps the trimmed original for display.
- `elapsedMs` stored in milliseconds for precise ranking; displayed as `MM:SS`.

## 3. `src/data/experiences.js` — registry

```js
export const experiences = [
  {
    id: 'screen-reader',
    name: { es: 'Experiencia con lectores de voz', en: 'Screen reader experience' },
    instructions: {
      es: 'Realiza un flujo de compra de una camiseta azul, talla M, utilizando la tarjeta 4000056655665556. …',
      en: 'Complete a purchase of a blue t-shirt, size M, using card 4000056655665556. …',
    },
    requiredItem: { productId: 'p001', size: 'M', color: 'blue' },
  },
];

export function getExperienceById(id) { … }
export function isCompletedOrder(items, experience) {
  // The order must be exactly the required item — extra items invalidate
  // completion (owner decision).
  return items.length === 1 && isRequiredItem(items[0], experience);
}
```

Future experiences (keyboard, low-vision) = new entries with their own `requiredItem` — flow code stays generic.

## 4. `src/session/session.js`

```js
registerUser(rawName)          // → {ok:true, name} | {ok:false, reason:'empty'|'duplicate'}
getSession()                   // parsed sessionStorage['faro-session'] | null
setSession({user, experienceId})
startExperienceTimer()         // writes startedAt: Date.now() into session, mounts overlay
stopExperienceTimer()          // returns elapsedMs, removes overlay
saveResult(record)             // appends to faro-results
getRanking(experienceId, n=10) // sorted asc by elapsedMs, tie: earlier endedAt, then user
clearSession()
```

## 5. New screens (all trap-free)

- **`login.js`** — `<label for>` + input + submit button. Errors in a `role="alert"` span (associated via `aria-describedby`). Duplicate → "Este nombre de usuario ya está registrado. Introduce otro nombre." Success → `registerUser` + `setSession` + `navigate('#/experiences')`.
- **`experience-select.js`** — list of experiences as real links `#/instructions` (sets `experienceId` in session on click via delegated handler or hash param — chosen: click handler sets session then navigates).
- **`instructions.js`** — localized instructions text + timer-start notice + **Continuar** button → `startExperienceTimer()` + `navigate('#/home')`.
- **`ranking.js`** — table Posición/Usuario/Tiempo (top 10 of the current experience), plus "Nuevo participante" button → `clearSession()` + `#/login`.

## 6. Timer overlay (`src/components/experience-timer.js`)

```js
// mounted on document.body — NOT inside #app, so hash navigation
// (container.innerHTML rewrites) never removes it
<div id="experience-timer" role="timer" aria-label="Tiempo de experiencia">
  ⏱ 04:27
</div>
```

- `setInterval` ~250ms computes `Date.now() - startedAt` (timestamp-based, not a visual counter).
- CSS: fixed top-right, dark badge, monospace, accent border — visually "external instrumentation", not Faro chrome. `aria-hidden` on the icon; no `aria-live` (no announcement spam).
- `stopExperienceTimer()` clears interval + removes node.

## 7. Completion hook (`checkout.js` + `confirmation.js`)

In `handleSubmit`'s success path (after the order is built, before `navigate`):

```js
const session = getSession();
if (session && isCompletedOrder(order.items, getExperienceById(session.experienceId))) {
  const elapsedMs = stopExperienceTimer();
  saveResult({ user: session.user, experienceId: session.experienceId,
               startedAt: new Date(session.startedAt).toISOString(),
               endedAt: new Date().toISOString(), elapsedMs, result: 'completed' });
  sessionStorage.setItem('faro-pending-congrats', '1');
}
navigate('#/confirmation'); // unchanged for both paths
```

`renderConfirmation` renders normally (TR-19 untouched); if `faro-pending-congrats` is set, it opens `congrats-dialog` with the elapsed time and clears the flag; the dialog's close action navigates to `#/ranking`.

Non-matching orders (wrong variant/item) → session continues, timer keeps running, normal confirmation.

## 8. Router changes

```js
routes += ['#/login', '#/experiences', '#/instructions', '#/ranking'];
```

- `initRouter`: no hash → `#/login` if no session, `#/home` if active session.
- `handleRouteChange`: Faro routes (home/products/product-detail/cart/checkout/confirmation) without session → redirect `#/login`.
- On init, if a session has `startedAt`, remount the timer overlay (reload resilience).

## 9. i18n keys (es/en parity enforced by `i18n.test.js`)

`session.loginTitle`, `session.username`, `session.continue`, `session.errorRequired`, `session.errorDuplicate`, `experience.selectTitle`, `instructions.title`, `instructions.timerNotice`, `instructions.continue`, `congrats.title`, `congrats.message`, `congrats.time`, `congrats.close`, `ranking.title`, `ranking.position`, `ranking.user`, `ranking.time`, `ranking.empty`, `ranking.newParticipant`, `timer.label`.

## 10. Tests — `src/tests/user-experience-timer.test.js`

| # | Case |
|---|------|
| 1 | Username validation: empty rejected, duplicate rejected after normalization (`' Ana '` vs `'ana'`), valid registers + session set |
| 2 | Experience list renders from registry with a selectable link |
| 3 | Instructions render does NOT start timer; Continuar sets `startedAt` and mounts `#experience-timer` on `document.body` |
| 4 | Overlay persists across a simulated screen re-render (`#app.innerHTML` rewrite) |
| 5 | Order with exactly p001+blue+M completes: timer stopped, result saved, pending-congrats flag set; wrong variant OR extra items do NOT complete |
| 6 | Congrats dialog: `role="dialog"`, `aria-modal`, labelled; close navigates to `#/ranking` |
| 7 | Ranking: ascending sort, deterministic tie-break, max 10 rows |
| 8 | Session guard: `#/products` without session redirects to `#/login` |

## 11. Files

| File | Change |
|------|--------|
| `src/data/experiences.js` | New — experience registry |
| `src/session/session.js` | New — users, session, results, ranking |
| `src/components/experience-timer.js` | New — global overlay |
| `src/components/congrats-dialog.js` | New — accessible modal |
| `src/screens/{login,experience-select,instructions,ranking}.js` | New screens |
| `src/screens/index.js`, `src/router.js` | New routes + session guard + default entry |
| `src/screens/checkout.js` | Completion hook in success path |
| `src/screens/confirmation.js` | Pending-congrats dialog + ranking navigation |
| `src/i18n/{es,en}.js` | New keys |
| `src/styles/main.css` | Timer overlay + new screens + dialog styles |
| `src/tests/user-experience-timer.test.js` | New — 8 cases |
