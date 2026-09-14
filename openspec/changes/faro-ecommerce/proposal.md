# Proposal: Faro — Accessibility Awareness Ecommerce

## Why

Digital accessibility is still widely treated as an afterthought. Developers, QA engineers, and technical audiences understand the *theory* of WCAG, but few have *felt* what it is like to navigate a broken site with a screen reader. A slide deck cannot transfer that experience; only lived friction does.

**Faro** is a fictitious fashion/accessories ecommerce built specifically for an accessibility awareness event stand. Attendees sit at a computer with NVDA running and attempt to complete a routine purchase flow using only keyboard and screen reader. The site contains deliberate, realistic accessibility traps — the same WCAG failures that plague real ecommerce sites every day. A built-in **moderator mode** (`Ctrl+M`) overlays each trap with its diagnosis: what fails, which Success Criterion it violates, and the correct HTML.

The goal is pedagogical transfer: attendees who experience the frustration firsthand internalize why these failures matter and how to fix them in their own work.

## What Changes

This is a greenfield project. We build a complete static single-page application (no backend) that implements a full ecommerce purchase flow with intentional accessibility defects and a moderator annotation layer.

### Scope — the purchase flow (6 screens)

1. **Home** — hero, search bar, featured products
2. **Product listing** — filterable grid of products (talla/color filters)
3. **Product detail** — variant selectors (talla/color), price, add-to-cart
4. **Cart** — quantity adjustment, item removal, total, checkout entry
5. **Checkout** — shipping + payment form with validation
6. **Confirmation** — order confirmed message

### Scope — the accessibility traps (19 traps across 6 screens)

Each trap is a real, common WCAG failure. They are not invented — they are the patterns that actually break screen reader navigation in production sites.

### Scope — moderator mode

A keyboard-triggered overlay (`Ctrl+M`) that annotates every trap in-place with: failure description, WCAG Success Criterion reference, and corrected HTML snippet. The overlay is purely visual — it never mutates the DOM of the traps, so toggling it off restores the original (broken) experience.

### Scope — bilingual ES/EN

A language toggle switches all UI strings, product data, and moderator annotations between Spanish and English.

### Out of scope

- Real payment gateway (checkout is simulated, no transaction)
- User accounts / authentication
- Backend, database, or API server (fully static/client-side)
- VoiceOver support (primary target is NVDA + Firefox/Edge on Windows; VoiceOver is a possible future bonus)
- Responsive/mobile layout (the stand runs on desktop)
- E-commerce business logic beyond the demo flow (no real inventory, shipping, etc.)

## How

### Architecture approach

A **client-side single-page application** with no backend. Product data lives in a static JSON fixture loaded at runtime. State (cart, language, moderator mode, current route) is managed in memory. This keeps the site fully offline-capable — critical for an event stand with unreliable Wi-Fi.

The architecture separates three concerns:

1. **App shell + routing** — minimal hash-based or in-memory router for the 6 screens
2. **Data layer** — static product catalog + i18n string tables (ES/EN)
3. **Trap layer** — each accessibility trap is a self-contained, annotated component. The moderator mode reads trap metadata (failure description, WCAG SC, correct HTML) and renders overlays without touching the broken DOM.

### Technology selection (to be finalized in design phase)

The stack will be chosen in the `design` phase based on: zero-backend constraint, offline capability, fast cold-start, and ease of embedding accessibility traps in raw HTML. Candidates range from a framework (React/Vue with Vite) to vanilla JS + a lightweight build tool. The design phase evaluates tradeoffs and locks the choice.

### Testing strategy (to be finalized in design phase)

Since the site's *value* is its broken behavior, testing is unusual: we must verify that traps ARE broken (for the demo) AND that moderator annotations ARE correct (for the teaching). The design phase defines whether automated tests are feasible or whether manual verification checklists suffice for a demo project.

### Delivery

Single PR strategy. If the implementation exceeds ~400 lines, a `size:exception` is recorded before apply, as agreed in session config.

## Assumptions

- The stand has a Windows PC with NVDA installed and Firefox or Edge as the browser
- An event moderator is present to guide attendees and trigger moderator mode during debrief
- Attendees have basic familiarity with web development (the moderator annotations reference WCAG SCs and HTML)
- The site runs locally (file:// or localhost) — no internet dependency at the stand
- Stand time per attendee is short (2-4 min) but may extend; the full flow is built regardless so the "inability to finish" itself becomes part of the lesson

## Risks

| Risk | Mitigation |
|------|------------|
| Traps too subtle — attendees don't notice them | Moderator mode + moderator guidance during debrief |
| Traps too obvious — breaks realism | Traps are modeled on real-world patterns, not caricatures |
| NVDA behavior differs across browser versions | Test on the exact stand configuration before the event |
| Bilingual toggle doubles string maintenance | Centralized i18n table, no inline strings |
| No automated tests for "broken" behavior | Design phase decides on manual checklist vs. structural tests |
