# Spec: Metro dialog — spacing between text and button

## REQ-870-01 — Breathing room above the OK button

Informational dialogs produced by `showMetroDialog` (chain errors,
same-station, same-line, interrupted, cut, too-slow) MUST render extra
spacing between the message paragraph and the primary button —
`margin-top: 1rem` on the button inside the metro dialog.

### Scenario: chain-start dialog

Given the participant picks a first origin other than San Nicasio, when
the "Tramo inconexo" dialog opens, then the dialog element carries the
`metro-dialog` class so the OK button has top margin.

## REQ-870-02 — Other dialogs unchanged

The line-choice and suboptimal dialogs MUST keep their current layout;
the new rule MUST NOT alter congrats or mission-failed dialogs.
