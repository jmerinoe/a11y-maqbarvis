# Proposal: Metro dialog — spacing between text and button

## Why

In the chromatic experience, informational popups (e.g. "Debes partir de
San Nicasio…", "La estación de origen no puede ser la misma…") render the
message paragraph directly above the OK button with no extra gap, so the
text feels glued to the button.

## What changes

- Add visual spacing between the dialog message and the primary button in
  the shared `showMetroDialog` template (same line-choice and suboptimal
  dialogs keep their existing layout).
- Purely presentational: one margin rule in CSS; no markup or JS changes
  beyond what the rule requires.

## Out of scope

- Dialog content, wording, focus management and Escape handling stay as
  they are.
- No changes to congrats or mission-failed dialogs (separate templates).
