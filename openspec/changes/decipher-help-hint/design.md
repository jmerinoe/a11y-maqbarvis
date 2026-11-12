# Design: DECIPHER MODE — six-minute help hint

## Architecture

The hint must survive screen navigation (the participant may be on any of the three hospital screens when the timer hits). Two candidate hook points:

1. **`mountExperienceTimer` tick** — fires every 250 ms regardless of screen, but lives in generic HUD code; coupling it to comprehension copy/keys breaks layering.
2. **`bindHospitalNav`** — already called by all three comprehension screens (`hospital.js`, `hospital-info.js`, `booking.js`). Arming here keeps the feature inside the experience module and re-arms automatically on every navigation.

Chosen: **option 2** — `armHelpHint()` called at the end of `bindHospitalNav`.

## `help-hint.js` (new comprehension component)

```js
const HINT_AFTER_MS = 6 * 60 * 1000;
let pendingTimer = null;

export function armHelpHint() {
  clearTimeout(pendingTimer);
  const session = getSession();
  if (!session || session.experienceId !== 'comprehension') return;
  if (session.completedAt || session.hintShown || isReplaySession(session)) return;
  const remaining = HINT_AFTER_MS - (Date.now() - session.startedAt);
  const fire = () => {
    const s = getSession();                       // re-check at fire time
    if (!s || s.experienceId !== 'comprehension' || s.completedAt || s.hintShown) return;
    setSession({ ...s, hintShown: true });
    showHelpHint();
  };
  if (remaining <= 0) fire();
  else pendingTimer = setTimeout(fire, remaining);
}
```

`showHelpHint()` builds the overlay with the same markup pattern as `hospital-dialog.js` (previous-focus save, `role="dialog"`, `aria-modal`, `tabindex="-1"`, Escape → close → restore focus, single `btn.ok` button).

## Session field

`hintShown: true` — persisted by `setSession` (sessionStorage), so reloads don't re-fire. New sessions start without it; `isReplaySession` guard keeps replays hint-free.

## Copy (`copy.js`, both registers identical)

```js
'hint.title': { obf: 'Veo que necesitas ayuda.', plain: 'Veo que necesitas ayuda.' },
'hint.msg':   { obf: 'Si alguna vez has sufrido dolores como la lumb<strong>ALGIA</strong> ya conoces parte de la respuesta. El sufijo te llevará hasta la consulta que buscas…', plain: same },
```

The `<strong>` gets the same accent highlight the instruction screens use for key phrases.

## Edge cases

- Timer fires while the congrats/abandon dialog is open: `completedAt`/`abandoned` set before those dialogs → `fire()` re-check blocks it.
- Navigation at 5:59 → next screen re-arms with ~1 s remaining → fires there.
- `stopExperienceTimer` doesn't clear `pendingTimer`; `armHelpHint` clears on next arm, and `fire()` re-checks session anyway (post-completion it's a no-op).

## Test plan

- `comprehension.test.js` (existing file): render with `startedAt` already > 6 min → dialog present; `hintShown` set → second render shows nothing; `vi.useFakeTimers` to cross the threshold mid-screen; replay session → nothing; dismiss restores focus.
