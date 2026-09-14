# Design: Faro — Accessibility Awareness Ecommerce

## 1. Technology decision

### Choice: Vanilla JS (ES modules) + Vite

**Why not a framework (React/Vue/Svelte)?**

The core artifact of this project is *authentic broken HTML*. The traps must be the same broken DOM that real screen readers encounter on real broken sites. Frameworks fight this goal:

- React/Vue abstract the DOM through a virtual DOM and component model. Writing `<div onClick>` instead of `<button>` is possible, but the framework's reconciliation, synthetic events, and rendering lifecycle add a layer between what you write and what NVDA receives. That layer can mask or alter trap behavior unpredictably.
- Focus management, DOM order, and ARIA semantics — the exact things the traps target — are harder to control deliberately in a framework because the framework owns rendering.
- A framework is overhead for a 6-screen demo with no complex state, no data fetching, and no reusable component library beyond the traps themselves.

**Why vanilla JS + Vite specifically?**

- **What you write is what the DOM gets.** No virtual DOM, no reconciliation. The broken HTML in the source is the broken HTML NVDA reads. Maximum authenticity and control.
- **Vite** provides a dev server with hot reload for fast iteration, ES module support for clean code organization, and a production build to static files that runs anywhere (localhost or `file://`) with zero server. Offline-ready for the stand.
- **Minimal dependencies.** The project stays small, cold-starts fast, and has no supply-chain surface. The only dev dependency is Vite itself.

### Tradeoffs acknowledged

| Tradeoff | Acceptance rationale |
|----------|---------------------|
| No component framework → more manual DOM code | The screens are simple and static; manual rendering is straightforward and keeps traps honest |
| Manual routing/state → no library safety net | Hash-based router + a single store object is ~50 lines; complexity doesn't justify a library |
| Less "modern" stack | The audience is devs who know HTML/JS; vanilla makes the trap source code readable and educational in itself |

## 2. Architecture

### Layered separation

```
┌─────────────────────────────────────────────┐
│                 App Shell                     │
│  (router, screen mount points, layout)       │
├─────────────────────────────────────────────┤
│  Store        │  i18n         │  Traps        │
│  (cart, lang, │  (ES/EN       │  (metadata +  │
│   route, mod) │   string      │   registry)   │
│               │   tables)     │               │
├─────────────────────────────────────────────┤
│              Moderator Layer                  │
│  (overlay renderer, reads trap metadata)     │
├─────────────────────────────────────────────┤
│              Data Layer                       │
│  (static product catalog JSON fixture)       │
└─────────────────────────────────────────────┘
```

### Routing

Hash-based router (`#/home`, `#/products`, `#/product/:id`, `#/cart`, `#/checkout`, `#/confirmation`). Hash routing works on both `localhost` and `file://` with no server configuration — essential for offline stand operation.

### State management

A single in-memory `store` object with a lightweight pub/sub pattern:

```js
store = {
  route: 'home',
  language: 'es',
  moderatorMode: false,
  cart: [],          // [{ productId, size, color, quantity }]
  filters: { sizes: [], colors: [] },
  searchQuery: '',
}
```

Screens subscribe to store changes and re-render. No external state library.

## 3. File structure

```
blind-ecommerce/
├── index.html                  # App shell, script entry
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # Entry point: init router, store, i18n
│   ├── router.js               # Hash-based router
│   ├── store.js                # In-memory state + pub/sub
│   ├── i18n/
│   │   ├── index.js            # t(key) function, language switching
│   │   ├── es.js               # Spanish string table
│   │   └── en.js               # English string table
│   ├── data/
│   │   └── products.js         # Static product catalog (ES/EN fields)
│   ├── traps/
│   │   ├── registry.js         # Trap metadata registry (all 19 traps)
│   │   └── README.md           # How traps are structured
│   ├── moderator/
│   │   └── moderator.js        # Ctrl+M handler, overlay renderer
│   ├── screens/
│   │   ├── home.js
│   │   ├── products.js         # Listing + filters
│   │   ├── product-detail.js
│   │   ├── cart.js
│   │   ├── checkout.js
│   │   └── confirmation.js
│   ├── components/
│   │   ├── header.js           # Contains TR-01, TR-02, TR-03
│   │   ├── search-bar.js       # Contains TR-04, TR-05
│   │   ├── product-card.js     # Contains TR-07, TR-08
│   │   ├── filters.js          # Contains TR-06
│   │   ├── variant-selector.js # Contains TR-09
│   │   └── cart-item.js        # Contains TR-13, TR-14
│   └── styles/
│       ├── main.css
│       └── moderator.css       # Overlay styles
└── openspec/                   # SDD artifacts
```

## 4. Trap implementation pattern

Each trap is implemented as **broken HTML rendered by a screen/component**, paired with **metadata in the trap registry**. The two are linked by trap ID.

### Trap metadata structure (registry.js)

```js
{
  id: 'TR-04',
  screen: 'home',
  wcag: '4.1.2 Name, Role, Value',
  description: {
    es: 'El botón de búsqueda es un <div> con onclick. No tiene role de botón ni nombre accesible, y no se puede activar con Enter o Espacio.',
    en: 'The search button is a <div> with onclick. It has no button role or accessible name, and cannot be activated with Enter or Space.',
  },
  fix: '<button type="submit" aria-label="Search">Search</button>',
  selector: '[data-trap="TR-04"]',  // CSS selector to locate the trapped element
}
```

### How traps are embedded in components

Each trapped element carries a `data-trap="TR-XX"` attribute. This attribute:
1. Lets the moderator overlay locate the element to annotate
2. Serves as a code-level marker that this is an intentional trap (not an accidental bug)

Example (search-bar.js):
```js
// BROKEN: div instead of button (TR-04)
`<div data-trap="TR-04" onclick="handleSearch()">🔍</div>`
```

The `data-trap` attribute itself is harmless to screen readers (it's a data attribute, not announced). It does not affect the trap's broken behavior.

## 5. Moderator mode implementation

### Activation
A global `keydown` listener on `Ctrl+M` toggles `store.moderatorMode`. When toggled ON, the moderator module queries all `[data-trap]` elements on the current screen, looks up their metadata from the registry, and injects an absolutely-positioned overlay near each element.

### Overlay rendering
Overlays are appended as siblings of the trapped element (NOT replacing it). They are purely visual — `position: absolute`, high z-index, styled to look like annotation callouts. They never modify the trapped element's DOM, attributes, or event listeners.

### Toggle OFF
When toggled OFF, all overlay elements are removed from the DOM. The trapped elements are untouched — they were never modified, so the page is exactly as before.

### Mode indicator
A fixed-position badge in the top-right corner shows "Moderator mode: ON" when active, per REQ-MM-06.

## 6. Data model

### Product (products.js)

```js
{
  id: 'p001',
  name: { es: 'Camiseta azul', en: 'Blue t-shirt' },
  price: 19.99,
  currency: 'EUR',
  image: '/images/p001.jpg',   // or placeholder
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['blue', 'black', 'white'],
  description: { es: '...', en: '...' },
}
```

At least 8 products. Images can be simple SVG placeholders or solid-color blocks (no need for real product photography — the focus is on the accessibility experience, not visual design).

### Cart item

```js
{ productId: 'p001', size: 'M', color: 'blue', quantity: 2 }
```

## 7. i18n implementation

- `i18n/index.js` exports `t(key)` that reads from the active language table.
- `es.js` and `en.js` export flat key-value objects: `{ 'search.placeholder': 'Buscar...', 'cart.checkout': 'Finalizar compra' }`
- Switching language updates `store.language`, sets `document.documentElement.lang`, and triggers a re-render of the current screen.
- Product names/descriptions are accessed via `product.name[store.language]`.

## 8. Testing strategy

This project is unusual: the "broken" behavior is the feature. Automated testing of screen reader behavior is not feasible in this environment. The strategy combines:

### Automated (structural)
- **Trap registry integrity test**: verify all 19 trap IDs exist, have required metadata fields (wcag, description.es, description.en, fix, selector), and IDs are unique.
- **i18n completeness test**: verify every key in `es.js` exists in `en.js` and vice versa (no missing translations).
- **Moderator overlay test**: verify that toggling moderator mode ON injects overlays for all `[data-trap]` elements on a screen, and toggling OFF removes them without altering trapped elements.

These are run with Vitest (Vite's native test runner — zero extra config).

### Manual verification checklist
A checklist document (`docs/verification-checklist.md`) that a human runs with NVDA on the stand configuration, confirming each trap's broken behavior and each moderator annotation's correctness. This is the authoritative verification for the event.

### Why not full E2E
E2E with Playwright could verify DOM structure (e.g., "the search button is a div, not a button") but cannot verify what NVDA announces. Given the project is a demo, the structural tests + manual checklist provide sufficient confidence without the overhead of an E2E suite.

## 9. Build and run

- **Dev**: `npm run dev` → Vite dev server with HMR
- **Build**: `npm run build` → static files in `dist/`
- **Preview**: `npm run preview` → serve the built files locally
- **Test**: `npm test` → Vitest (structural tests)
- **Stand setup**: run `npm run build`, then open `dist/index.html` via a simple local server (`npm run preview`) or directly. No internet needed.

## 10. Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| vite | devDependency | Build tool + dev server |
| vitest | devDependency (optional) | Structural tests |

Zero runtime dependencies. The production build is plain HTML/CSS/JS.

## 11. Design risks and mitigations

| Risk | Mitigation |
|------|------------|
| `data-trap` attributes leak into screen reader output | Data attributes are not announced by AT; verified safe. No ARIA attributes added to trapped elements. |
| Moderator overlays interfere with layout | Overlays are `position: absolute` with high z-index; they overlay visually but don't reflow content |
| Hash routing breaks on `file://` in some browsers | Test on the stand's exact browser; fallback is `npm run preview` (localhost) |
| Product images missing | Use CSS-generated placeholders (colored blocks with product name) — no image files needed, and ironically avoids the alt-text trap being masked by broken images |
