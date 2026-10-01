# Spec: Comprehension — ordered, availability-aware selects in plain mode

## REQ-890-01 — Chronological, availability-aware date and hour selects

When `session.plainMode` is true, the booking form's date and hour
selects MUST render their options in chronological order, and options
that can never produce a free slot MUST carry the `disabled` attribute:

- a date option is disabled when the day is odd-numbered or falls on a
  weekend (no hour on that day can be free);
- an hour option is disabled when the hour is odd (it is busy on every
  offered date).

### Scenario: plain-mode retry after a completed run

Given a participant completed the comprehension mission and clicked
"Repetir misión" on the ranking, when the booking form renders, then
the date options appear in ascending order and every odd/weekend day is
disabled, and the hour options appear 08:00–19:00 with odd hours
disabled.

## REQ-890-02 — Alphabetical specialty and center selects

In `plainMode`, the "Unidad asistencial de destino" and
"Emplazamiento físico de la provisión" selects MUST render their 30
options sorted alphabetically using Spanish collation.

### Scenario: alphabetical lists

Given the same plain-mode retry, when the form renders, then the
specialty and center options are in alphabetical order, with the
mission targets (Algología, Hospital Vega Norte) still present.

## REQ-890-03 — Barrier mode unchanged

When `plainMode` is false/absent, the selects MUST keep the current
behaviour: scrambled date list mixing October and November, sequential
hours, unordered specialty and center lists, and no `disabled` options.

### Scenario: first-run barrier mode

Given a participant on a first run, when the booking form renders, then
no option is disabled and the date order matches the deterministic
shuffle.
