# Proposal: Comprehension — ordered, availability-aware selects in plain mode

## Why

In the comprehension experience, the barrier-free retry (plain mode,
reached via "Repetir misión" on the ranking) still renders the booking
selects with the scrambled option order and offers no hint about which
slots are occupied. Since the whole point of plain mode is removing
comprehension barriers, the option lists themselves should stop being a
barrier too.

## What changes

- In `plainMode` only, the four booking selects change behaviour:
  - **Date** ("Jornada temporal pretendida" / "Elige un día"): options
    sorted chronologically, and days with no free slot at all (odd days,
    weekends) rendered `disabled`.
  - **Hour**: options sorted chronologically, and hours that are never
    free (odd hours) rendered `disabled`.
  - **Specialty** and **Center**: options sorted alphabetically
    (Spanish collation).
- Obfuscated mode (first run) keeps the current scrambled,
  fully-enabled lists — the barrier is intentional there.

## Out of scope

- No changes to availability rules, mission targets, dialogs or flow.
- No server/booked-state tracking; availability stays deterministic.
- Ranking, retry and plain-mode activation stay as they are.
