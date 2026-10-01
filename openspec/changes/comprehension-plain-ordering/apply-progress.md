# Apply progress: Comprehension — ordered, availability-aware selects in plain mode

## What was done

- `data/hospital.js`: added `isDateFullyBusy(dateIso)` (odd day or
  weekend — no hour can be free) and `isHourAlwaysBusy(hour)` (odd hour),
  derived from the same rules as `isSlotFree`.
- `screens/booking.js`: when `session.plainMode` is true the option
  lists are sorted (dates chronologically, hours ascending, specialties
  and centers alphabetically with `localeCompare('es')`) and never-free
  date/hour options render `disabled`. Barrier mode is untouched.
- `tests/comprehension.test.js`: two new tests — plain-mode ordering +
  disabled attributes, and barrier mode keeping the scrambled,
  fully-enabled lists.

## Status

- REQ-890-01 chronological + disabled date/hour options: implemented
- REQ-890-02 alphabetical specialty/center: implemented
- REQ-890-03 barrier mode unchanged: implemented
