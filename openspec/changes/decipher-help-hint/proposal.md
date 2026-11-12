# Proposal: DECIPHER MODE — six-minute help hint

## Why

DECIPHER MODE participants who can't crack the bureaucratic language get stuck without feedback. Facilitators currently intervene manually. A timed, in-character hint at the 6-minute mark nudges stuck players toward the answer (the suffix *-ALGIA* → Algología → pain consultation) without spoiling the exercise for faster players — and matches how the workshop actually runs.

## What Changes

### Scope

1. **Timed hint dialog** — when a comprehension run reaches `elapsedMs >= 6 minutes` without completing, an overlay dialog appears on whichever hospital screen the participant is on:
   - Title: `Veo que necesitas ayuda.`
   - Body: `Si alguna vez has sufrido dolores como la lumbALGIA ya conoces parte de la respuesta. El sufijo te llevará hasta la consulta que buscas…` — with `ALGIA` emphasised (`<strong>`, same blue highlight used for key phrases).
   - One dismiss button (`btn.ok` copy key → "Entendido").
2. **Same dialog pattern** — `congrats-overlay` + `congrats-dialog metro-dialog` classes, `role="dialog"`, `aria-modal`, labelled title, managed focus, Escape closes. No timer pause (consistent with every other dialog).
3. **Once per run** — a `hintShown` flag on the session prevents re-firing on navigation or page reload.
4. **Copy** — new `hint.title`/`hint.msg` keys in comprehension `copy.js` (same text in `obf` and `plain`: the hint is facilitator help, not barrier content — always plain).

### Out of scope

- No hint for the other two experiences (the trigger is comprehension-specific).
- No timer pause, no change to scoring/ranking — the run continues normally.
- Replay mode (barrier-free retry): no hint — in `plainMode` the specialty is already labelled "Algología - Unidad del Dolor", so the hint adds nothing.

## How

- New component `comprehension/components/help-hint.js`:
  - `armHelpHint()` — clears any pending timer, checks the session (`comprehension`, `startedAt` set, `!completedAt`, `!hintShown`, `!isReplaySession`), then shows the dialog immediately if 6 min already elapsed, else `setTimeout` for the remainder (re-checking session at fire time in case the run ended or navigated away).
  - `showHelpHint()` — builds the overlay (same pattern as `hospital-dialog.js`), marks `hintShown` in the session, restores focus on close.
- `bindHospitalNav()` (`hospital-shell.js`) calls `armHelpHint()` — all three comprehension screens already call it, so the hint is armed wherever the participant is, and re-armed on every navigation.
- `copy.js` — `hint.title` + `hint.msg` entries (`obf`/`plain` identical).

## Test plan

- Dialog appears when rendering a screen with `startedAt` > 6 min ago.
- Dialog does not appear before 6 min; appears when fake timers cross the threshold.
- `hintShown` prevents a second fire on re-render/reload.
- No dialog during replay (`isReplaySession`) or after completion.
- Escape / "Entendido" closes and restores focus.
