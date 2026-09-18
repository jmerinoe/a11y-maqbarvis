# Spec: TR-03 Removal — Carousel Without Focus Stealing

## Purpose

Defines the corrected behavior of the home hero carousel after the removal of the TR-03 trap: the carousel may keep auto-rotating, but it SHALL never move keyboard focus, and it SHALL not auto-rotate when the user prefers reduced motion. This spec also records the registry correction (18 → 17 traps).

## Requirements

### REQ-T3R-01: Rotation never steals focus
The carousel rotation SHALL update only the active slide's visual state (`.active` class). It SHALL NOT call `focus()` or otherwise move the document's active element at any time — whether the user is tabbing through the page, focused inside the carousel, or has focus on `document.body`.

### REQ-T3R-02: Respect prefers-reduced-motion
When `prefers-reduced-motion: reduce` matches at render time, the auto-rotation interval SHALL NOT start — the carousel displays the first slide statically. When the preference changes while the page is open, rotation SHALL stop (on `reduce`) or start (on `no-preference`) accordingly.

### REQ-T3R-03: Graceful degradation without matchMedia
If `window.matchMedia` is unavailable, the carousel SHALL treat the preference as "no preference" and auto-rotate (without focus stealing, per REQ-T3R-01).

### REQ-T3R-04: Slides remain keyboard-focusable
The existing `tabindex="0"` on slides SHALL be kept — users may still move focus to a slide manually. Only *automatic* focus movement is removed.

### REQ-T3R-05: Removal of TR-03 trap
The TR-03 entry SHALL be removed from `src/traps/registry.js` (18 → 17 traps). The `data-trap="TR-03"` attribute SHALL be removed from the carousel section. The structural test SHALL expect 17 traps and the ID set TR-01, TR-02, TR-04…TR-10, TR-12…TR-19. `src/traps/README.md` and `docs/verification-checklist.md` SHALL be updated.

### REQ-T3R-06: No regression to other traps
This evolution SHALL NOT modify, fix, or remove any other trap (TR-01, TR-02, TR-04 through TR-19, excluding corrected TR-11). The carousel markup beyond the `data-trap` attribute is unchanged.

## Scenarios

### Scenario: Rotation does not interrupt keyboard navigation
- **Given** the attendee is tabbing through the home page with focus on a nav link
- **When** the 3-second rotation interval fires
- **Then** the next slide becomes active visually AND focus remains on the nav link

### Scenario: Rotation continues under no preference
- **Given** the system has no reduced-motion preference
- **When** the home screen renders and 3+ seconds pass
- **Then** the carousel advances slides normally (visual rotation preserved)

### Scenario: No auto-rotation under reduced motion
- **Given** the OS is set to `prefers-reduced-motion: reduce`
- **When** the home screen renders and 3+ seconds pass
- **Then** the carousel remains on the first slide — no rotation occurs

### Scenario: Preference toggles while page is open
- **Given** the carousel is auto-rotating
- **When** the system preference changes to `reduce`
- **Then** the rotation stops
- **When** the preference changes back to `no-preference`
- **Then** the rotation resumes

### Scenario: Manual focus on a slide still works
- **Given** the attendee navigates by keyboard
- **When** they Tab to a carousel slide
- **Then** the slide receives focus normally (tabindex preserved)

### Scenario: TR-03 no longer present
- **Given** the evolution is applied
- **When** the structural test runs
- **Then** the registry contains 17 traps with no `TR-03` entry
- **And** no element carries `data-trap="TR-03"`, so the moderator overlay no longer annotates the carousel
