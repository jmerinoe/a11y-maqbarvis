# Proposal: DECIPHER MODE — trap focus in hospital dialogs

## Why

When the participant books the correct appointment in DECIPHER MODE, a success (or keep-trying) dialog opens over the booking form. The dialog has `role="dialog"` and moves focus into itself, but Tab/Shift+Tab is NOT trapped — the focus escapes behind the overlay to the form fields underneath. The participant cannot reach the dialog's button ("Proceder con la ejecución de la acción previamente configurada" / "Entendido") with the keyboard alone.

## What Changes

### Scope

1. **Focus trap in `showHospitalDialog`** — the single-button info dialog (occupied slot, off-mission, etc.) SHALL trap Tab/Shift+Tab inside the dialog so the focus cycles between the dialog and its OK button.
2. **Focus trap in `showHospitalChoiceDialog`** — the two-button choice dialog (keep-trying vs. finish) SHALL trap Tab/Shift+Tab inside the dialog so the focus cycles between the two buttons.
3. **Pattern** — same focus-trap already used in the BLIND BUY cart modal (`cart.js` `bindCartDialog`): listen for Tab on the overlay, prevent default when the focus would escape, and wrap to the first/last focusable element.

### Out of scope

- No changes to dialog content, copy, or styling.
- No changes to the congrats dialog (`congrats-dialog.js`) — it already moves focus to its close button and the participant can click it; the issue is specific to the hospital dialogs where the booking form behind has many focusable fields.
- No changes to the six-minute help hint dialog (`help-hint.js`) — it uses the same `congrats-overlay` pattern but has no form behind it; however, applying the trap there too would be consistent. Decision: apply only to `hospital-dialog.js` for now unless the user requests it elsewhere.

## How

- `hospital-dialog.js`: in both `showHospitalDialog` and `showHospitalChoiceDialog`, after `dialog.focus()`, add a `keydown` listener on the overlay that traps Tab/Shift+Tab — same code as `cart.js` `bindCartDialog` lines 83-100.

## Test plan

- New test: after opening a hospital dialog, Tab cycles inside the dialog (focus stays on the dialog's buttons, does not reach the form fields behind).
- New test: Shift+Tab wraps from the first button to the last.
- Existing tests (dialog opens, Escape closes, button click closes) stay green.
