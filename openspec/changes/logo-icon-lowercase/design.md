# Design: Logo Icon — Lowercase "f" in Times New Roman

## 1. Overview

A single-attribute edit inside the SVG data-URI in `src/components/header.js`. No structural changes.

## 2. The edit

Current logo markup (header.js line 19):

```html
<img data-trap="TR-02" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231c1917' rx='20'/%3E%3Ctext x='20' y='28' font-size='22' text-anchor='middle' font-family='serif' fill='%23f59e0b'%3EF%3C/text%3E%3C/svg%3E" />
```

Decoded SVG for readability:

```xml
<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
  <rect width='40' height='40' fill='#1c1917' rx='20'/>
  <text x='20' y='28' font-size='22' text-anchor='middle' font-family='serif' fill='#f59e0b'>F</text>
</svg>
```

Changes inside the data-URI:

| Part | Before | After |
|------|--------|-------|
| Letter | `>F</text>` | `>f</text>` |
| Font | `font-family='serif'` | `font-family='Times New Roman'` |
| Size | `font-size='22'` | `font-size='28'` (per product feedback — slightly larger) |
| Position | `x='20' y='28'` | `x='20' y='20' dominant-baseline='central'` (optical centering; baseline y=28 left the descender-less 'f' visually high) |

Result:

```html
<img data-trap="TR-02" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231c1917' rx='20'/%3E%3Ctext x='20' y='20' font-size='28' text-anchor='middle' dominant-baseline='central' font-family='Times New Roman' fill='%23f59e0b'%3Ef%3C/text%3E%3C/svg%3E" />
```

### Notes

- **Spaces**: `Times New Roman` keeps literal spaces — the data-URI already contains literal spaces (`width='40' height='40'`), and browsers handle them.
- **Position**: lowercase "f" has different glyph metrics than "F" (narrower, ascender, no descender). The original baseline `y='28'` left it visually high in the circle; `dominant-baseline='central'` at `y='20'` centers it optically.
- **Fallback**: if Times New Roman is missing, the generic serif renders — acceptable for the demo.

## 3. Trap preservation

TR-02 is "logo image without `alt`". The `<img>` element, its `data-trap` marker, and the absence of `alt` are untouched — only the image *content* (the inline SVG) changes. `registry.js` unchanged (18 traps).

## 4. New structural test: `logo-icon.test.js`

New file `src/tests/logo-icon.test.js` (jsdom):

```js
describe('Logo icon', () => {
  it('renders a lowercase f in Times New Roman', () => {
    // renderHeader() → img[data-trap="TR-02"] src contains '>f<' and "font-family='Times New Roman'"
  });

  it('keeps TR-02 intact (no alt, data-trap present)', () => {
    // alt attribute absent; data-trap === 'TR-02'
  });

  it('keeps the Faro wordmark', () => {
    // .logo-link span text === 'Faro'
  });
});
```

## 5. Documentation

No checklist changes needed — TR-02's verification steps (tab to logo, NVDA announces "image", moderator annotation) are unaffected by the glyph change. apply-progress and verify-report record the change.

## 6. Files changed

| File | Change |
|------|--------|
| `src/components/header.js` | SVG data-URI: `F`→`f`, `serif`→`Times New Roman` |
| `src/tests/logo-icon.test.js` | New — 3 tests |

## 7. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Glyph slightly misaligned in the circle | `text-anchor='middle'`; visual check in dev |
| Escaping issues in the data-URI | Spaces are literal, matching existing content; verified in dev + build |
| TR-02 accidentally repaired | Only text content/font inside the URI edited; test asserts no `alt` |
