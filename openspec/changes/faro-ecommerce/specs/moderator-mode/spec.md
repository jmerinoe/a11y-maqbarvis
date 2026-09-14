# Spec: Moderator Mode

## Purpose

Defines the moderator annotation overlay that reveals each accessibility trap during the debrief. This is the teaching layer — it transforms the lived frustration into a concrete, correctable lesson.

## Requirements

### REQ-MM-01: Activation
Moderator mode shall be toggled on and off with the keyboard shortcut `Ctrl+M`. The toggle shall work on any screen.

### REQ-MM-02: Visual annotation
When moderator mode is ON, each trap shall display a visible annotation overlay positioned near the trapped element. The overlay shall contain:
- The trap ID (e.g., TR-04)
- A short failure description
- The WCAG Success Criterion reference (e.g., SC 4.1.2)
- The corrected HTML snippet

### REQ-MM-03: No DOM mutation of traps
Moderator mode shall NOT alter, fix, or replace the broken DOM of any trap. The overlays are purely additive visual annotations. When moderator mode is toggled OFF, the page returns to the exact original broken state.

### REQ-MM-04: Language awareness
All annotation text (failure description, WCAG reference label, corrected HTML comments) shall follow the active UI language (ES/EN). The corrected HTML snippet itself is language-neutral code.

### REQ-MM-05: Non-intrusive to flow
Moderator mode overlays shall not block keyboard navigation or trap focus. An attendee could theoretically continue navigating with overlays visible.

### REQ-MM-06: Visible state indicator
When moderator mode is ON, there shall be a subtle persistent visual indicator (e.g., a badge in a corner) so the moderator knows the mode is active without checking each trap.

### REQ-MM-07: Annotation data source
Trap annotations shall be driven by the same trap metadata defined in the accessibility-traps spec (REQ-AT-05). There shall be no duplicate or divergent annotation data.

## Scenarios

### Scenario: Toggle moderator mode on
- **Given** the attendee/moderator is on any screen with moderator mode OFF
- **When** they press Ctrl+M
- **Then** annotation overlays appear on all traps present on the current screen and the mode-active indicator is shown

### Scenario: Toggle moderator mode off
- **Given** moderator mode is ON with overlays visible
- **When** they press Ctrl+M
- **Then** all overlays disappear and the page returns to its original broken state with no DOM changes

### Scenario: Annotation shows WCAG reference and fix
- **Given** moderator mode is ON and the search button trap (TR-04) is on screen
- **When** the overlay for TR-04 is rendered
- **Then** it displays "SC 4.1.2 Name, Role, Value", a description of the div-onclick failure, and the corrected `<button>` HTML

### Scenario: Annotations follow language toggle
- **Given** moderator mode is ON and the UI language is Spanish
- **When** the user toggles the language to English
- **Then** all annotation text switches to English (descriptions and labels), while HTML snippets remain code

### Scenario: Moderator mode does not fix traps
- **Given** moderator mode is ON
- **When** a screen reader user navigates a trapped element
- **Then** the trap still behaves as broken (e.g., the div-onclick search button still does not respond to Enter) — the overlay is visual only
