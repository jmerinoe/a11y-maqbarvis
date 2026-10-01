# Design: Comprehension — ordered, availability-aware selects in plain mode

## Current layout

`renderBooking` (screens/booking.js) maps `appointmentDays()`,
`HOURS`, `specialties` and `centers` straight into `<option>` lists.
`appointmentDays()` already returns a deterministic LCG shuffle mixing
October mission dates with November decoys; `HOURS` is 8–19; the
specialty and center arrays are deliberately unordered.

Availability (`isSlotFree`) depends on **date + hour together**: odd
day → busy, weekend → busy, odd hour → busy.

## What "disabled" means per select

Because occupancy combines both dimensions, disabling is defined at the
granularity that is unambiguous:

- A **date option** is disabled iff that day can never offer a free
  slot: odd-numbered day OR weekend (`isDateFullyBusy` helper).
- An **hour option** is disabled iff that hour is busy on every date:
  odd hours (`hour % 2 === 1`).

So in plain mode an even weekday stays selectable, and the occupied
feedback still appears if a participant somehow submits an invalid
combination — but the picker itself now teaches the pattern.

## Sorting

- Dates: chronological — `appointmentDays()` returns a shuffled list,
  so plain mode re-sorts by ISO string (`sort()` on `YYYY-MM-DD` is
  chronological). October mission dates come first, November decoys
  after; disabled entries keep their position in the sorted list.
- Hours: `HOURS` is already ascending; sorted anyway for clarity.
- Specialties / centers: `[...arr].sort((a, b) => a.localeCompare(b, 'es'))`.

## Implementation

In `renderBooking`, branch on the existing `plain` flag when building
each option list:

```js
const dates = plain ? [...appointmentDays()].sort() : appointmentDays();
const dateOpts = dates.map((d) => option(d, fmtDate(d), plain && isDateFullyBusy(d)));
```

`option` gains a `disabled` third parameter emitting the `disabled`
attribute. New pure helpers in `data/hospital.js`:

- `isDateFullyBusy(dateIso)` — odd day or weekend (no hour can be free).
- `isHourAlwaysBusy(hour)` — odd hour.

Both helpers derive from the same rules as `isSlotFree`, so the source
of truth stays single.

## Files

- `apps/experience/src/experiences/comprehension/data/hospital.js` —
  `isDateFullyBusy`, `isHourAlwaysBusy` helpers.
- `apps/experience/src/experiences/comprehension/screens/booking.js` —
  conditional sort + disabled options in plain mode.
- `apps/experience/src/tests/comprehension.test.js` — assert ordering
  and `disabled` attributes in plain mode, and that barrier mode keeps
  the scrambled, fully-enabled lists.
