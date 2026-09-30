# Design: Metro dialog — spacing between text and button

## Current layout

`showMetroDialog` builds `.congrats-dialog` containing an `<h2>`, a `<p>`
message and the `.btn-primary` OK button. The paragraph keeps only its
default margin, which is small, so longer messages sit flush against the
button.

## Options

1. **Margin-top on the OK button** inside `.congrats-dialog` — simple,
   but `.congrats-dialog` is shared with congrats and mission-failed
   dialogs; scoping the rule to metro dialogs needs a marker.
2. **Class on the metro dialog root** (e.g. `.metro-dialog`) plus a CSS
   rule `.metro-dialog .btn-primary { margin-top: 1rem; }` — explicit and
   safe. The other two metro dialogs (line choice, suboptimal) already
   add their own spacing (`metro-dialog-actions`, `line-choice-list`).

## Decision

Option 2: add the `metro-dialog` class to the dialog built by
`showMetroDialog` and add one margin rule in `metro.css`. The choice
dialog (buttons list) and the suboptimal dialog (`metro-dialog-actions`
already has `margin-top: 1.5rem`) are left untouched.

## Files

- `apps/experience/src/experiences/chromatic/components/metro-dialog.js`
  — add `metro-dialog` to the dialog class list.
- `apps/experience/src/experiences/chromatic/styles/metro.css` —
  `.metro-dialog .btn-primary { margin-top: 1rem; }`.
