# Apply progress: Metro dialog — spacing between text and button

## Applied

- `metro-dialog.js`: the `showMetroDialog` dialog element now carries the
  `metro-dialog` class alongside `congrats-dialog`.
- `metro.css`: `.metro-dialog .btn-primary { margin-top: 1rem; }` adds
  breathing room between the message and the OK button.
- `chromatic.test.js`: the chain-start test asserts the `metro-dialog`
  marker class is present.

## Not changed (per spec)

- `showLineChoiceDialog` and `showSuboptimalDialog` keep their existing
  spacing (`line-choice-list`, `metro-dialog-actions`).
- Congrats / mission-failed dialogs untouched.
