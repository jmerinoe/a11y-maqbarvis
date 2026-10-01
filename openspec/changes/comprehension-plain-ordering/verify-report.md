# Verify report: Comprehension — ordered, availability-aware selects in plain mode

## Commands run

- `npx vitest run src/tests/comprehension.test.js` — 20/20 passed
- `npx vitest run` (full experience suite) — 192/192 passed
- `npm run build` (Vite production build) — succeeded

## Requirement coverage

| Req | Verified by | Result |
|-----|-------------|--------|
| REQ-890-01 | "plain mode sorts selects and disables never-free options" | Pass |
| REQ-890-02 | same test — alphabetical specialty/center assertions | Pass |
| REQ-890-03 | "barrier mode keeps scrambled, fully-enabled selects" | Pass |

## Notes

- Disabled is computed only where it is unambiguous: a date is disabled
  when no hour on it can be free (odd day or weekend); an hour is
  disabled when it is busy on every offered date (odd hours).
- Disabled options cannot be submitted via the select, but the occupied
  dialog path is kept as a safety net.
