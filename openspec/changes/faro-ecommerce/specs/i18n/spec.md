# Spec: Internationalization (i18n)

## Purpose

Defines the bilingual ES/EN support. All user-facing text — UI labels, product data, and moderator annotations — must be available in both Spanish and English, switchable at runtime via a toggle.

## Requirements

### REQ-I18N-01: Language toggle
The site shall provide a visible language toggle (ES/EN) accessible from every screen. Activating it shall switch all user-facing text to the selected language immediately without a page reload.

### REQ-I18N-02: UI strings
All UI strings (buttons, labels, headings, navigation, error messages, confirmation messages) shall be sourced from a centralized i18n string table. No user-facing string shall be hardcoded inline in components.

### REQ-I18N-03: Product data
Product names and descriptions shall be available in both ES and EN. The product catalog fixture shall include localized fields for each language.

### REQ-I18N-04: Moderator annotations
Moderator mode annotation text (failure descriptions, WCAG label text) shall be localized per REQ-MM-04. The WCAG SC code (e.g., "4.1.2") is language-neutral; the descriptive text around it is localized.

### REQ-I18N-05: Default language
The default language on first load shall be Spanish (the event audience is Spanish-speaking). The user shall be able to switch to English at any time.

### REQ-I18N-06: Language persistence within session
The selected language shall persist across screen navigation within the same session. (No cross-session persistence required — no backend.)

### REQ-I18N-07: html lang attribute
The `<html lang>` attribute shall update to reflect the active language ("es" or "en") so screen readers use the correct pronunciation engine.

## Scenarios

### Scenario: Switch from Spanish to English
- **Given** the site is displayed in Spanish (default)
- **When** the user activates the EN toggle
- **Then** all UI strings, product names, and moderator annotations switch to English immediately

### Scenario: Language persists across navigation
- **Given** the user has selected English on the home screen
- **When** they navigate to the product listing
- **Then** the product listing renders in English without reverting to Spanish

### Scenario: html lang updates with toggle
- **Given** the site is in Spanish with `<html lang="es">`
- **When** the user switches to English
- **Then** the `<html lang>` attribute changes to "en"

### Scenario: Product names localized
- **Given** the product catalog is loaded
- **When** the language is Spanish
- **Then** product names display in Spanish (e.g., "Camiseta azul")
- **When** the language is switched to English
- **Then** the same product displays its English name (e.g., "Blue t-shirt")
