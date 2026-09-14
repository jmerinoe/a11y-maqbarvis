# Faro — Accessibility Awareness Ecommerce

Faro is a fictitious fashion and accessories ecommerce built for an accessibility awareness event stand. Attendees navigate a purchase flow using only a keyboard and screen reader (NVDA), and encounter 19 real WCAG accessibility traps. A moderator mode (`Ctrl+M`) annotates each trap with its WCAG reference and corrected HTML.

## Why?

The best way to understand accessibility barriers is to experience them firsthand. Faro lets developers and QA engineers feel the frustration of navigating an inaccessible site with a screen reader, then see exactly what's broken and how to fix it.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in Firefox or Edge.

## The 19 accessibility traps

| Screen | Trap | WCAG | What fails |
|--------|------|------|------------|
| Home | TR-01 | SC 2.4.1 | No skip-to-content link |
| Home | TR-02 | SC 1.1.1 | Logo image without `alt` |
| Home | TR-03 | SC 2.2.2 | Auto-rotating carousel steals focus |
| Home | TR-04 | SC 4.1.2 | Search button is a `<div onclick>` (not a real button) |
| Home | TR-05 | SC 1.3.1, 3.3.2 | Search input uses placeholder as only label |
| Listing | TR-06 | SC 1.3.1, 3.3.2 | Filter checkboxes without `<label>` |
| Listing | TR-07 | SC 2.4.4 | Generic "Buy" links with no product context |
| Listing | TR-08 | SC 1.3.2, 2.4.3 | Broken tab order via positive `tabindex` |
| Detail | TR-09 | SC 4.1.2 | Custom size selector without role or accessible name |
| Detail | TR-10 | SC 1.3.1 | Price disconnected from product name in the DOM |
| Detail | TR-11 | SC 4.1.3 | Add-to-cart gives no live feedback |
| Cart | TR-12 | SC 2.4.3 | Modal with no focus management |
| Cart | TR-13 | SC 1.1.1, 4.1.2 | Remove button with icon-only (no text label) |
| Cart | TR-14 | SC 4.1.3 | Quantity change not announced |
| Checkout | TR-15 | SC 1.4.1 | Validation errors indicated only by color |
| Checkout | TR-16 | SC 1.3.1, 3.3.2 | Form fields without `<label>` |
| Checkout | TR-17 | SC 3.3.1, 4.1.3 | Error messages not associated via `aria-describedby` |
| Checkout | TR-18 | SC 2.4.3, 3.3.1 | Focus not moved to first invalid field |
| Confirmation | TR-19 | SC 4.1.3 | Confirmation message without `role="status"` |

## Moderator mode

Press `Ctrl+M` to toggle moderator mode. Each trap gets a compact `TR-XX` badge. Click any badge to see:
- The WCAG Success Criterion it violates
- A description of the failure (in the active language)
- The corrected HTML

Click again (or click outside) to close. Only one panel open at a time.

## Languages

Toggle ES/EN with the button in the header. All UI strings, product content, and moderator annotations switch languages.

## Testing

```bash
npm test        # run once
npm run build   # production build
```

18 structural tests validate the trap registry, i18n parity, and moderator behavior.

## Running the demo at an event

See [`docs/stand-setup.md`](docs/stand-setup.md) for stand setup instructions and [`docs/verification-checklist.md`](docs/verification-checklist.md) for the NVDA verification checklist.

## Tech stack

- Vanilla JavaScript (ES modules) — no framework, so the broken HTML is exactly what NVDA reads
- Vite for dev server and build
- Vitest for structural tests
- In-memory store with pub/sub
- Hash-based router
- Static product catalog (8 products)
- All images bundled locally (offline-capable)

## License

MIT
