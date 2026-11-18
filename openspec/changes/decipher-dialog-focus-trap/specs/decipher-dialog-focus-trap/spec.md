# Spec: DECIPHER MODE — trap focus in hospital dialogs

## Purpose

The hospital info and choice dialogs SHALL trap keyboard focus inside the dialog so Tab/Shift+Tab cycles between the dialog's buttons and never escapes to the booking form behind the overlay.

## Requirements

### REQ-1010-01: Focus trap in showHospitalDialog
When `showHospitalDialog` opens, Tab from the OK button SHALL wrap back to the dialog (or the OK button if it is the only focusable element). Shift+Tab from the dialog SHALL wrap to the OK button. The focus SHALL NOT reach any element outside the dialog.

### REQ-1010-02: Focus trap in showHospitalChoiceDialog
When `showHospitalChoiceDialog` opens, Tab from the last button SHALL wrap to the first button. Shift+Tab from the first button SHALL wrap to the last button. The focus SHALL NOT reach any element outside the dialog.

### REQ-1010-03: Existing behaviour preserved
Escape SHALL still close the dialog. The OK / keep-trying / finish buttons SHALL still close the dialog on click. Focus SHALL still move into the dialog on open and restore to the previous element on close.

## Scenarios

### Scenario: Tab cycles inside the info dialog
- **Given** a hospital info dialog is open over the booking form
- **When** the participant presses Tab from the OK button
- **Then** focus wraps back to the dialog (or stays on the OK button if it is the only focusable element), never reaching the form fields behind

### Scenario: Shift+Tab wraps in the choice dialog
- **Given** a hospital choice dialog is open with "keep trying" and "finish" buttons
- **When** the participant presses Shift+Tab from the first button
- **Then** focus wraps to the last button, never escaping the dialog
