# Traps — How they work

Each accessibility trap has two parts:

1. **Broken HTML** in a screen/component, marked with a `data-trap="TR-XX"` attribute on the broken element.
2. **Metadata** in `registry.js`, keyed by the same `TR-XX` id.

## The `data-trap` attribute

`data-trap` is a plain data attribute. Screen readers do not announce data attributes, so it does not affect the trap's broken behavior. It serves two purposes:

- Lets the moderator overlay locate the element to annotate
- Marks the trap as intentional in the source code (so it is not "fixed" by mistake)

## Metadata fields

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier (TR-01 .. TR-19) |
| `screen` | Screen where the trap appears |
| `wcag` | WCAG 2.1 Success Criterion reference |
| `description.es` | Failure description in Spanish |
| `description.en` | Failure description in English |
| `fix` | Corrected HTML snippet (language-neutral) |
| `selector` | CSS selector matching the trapped element |

## Adding a new trap

1. Add the broken HTML to the relevant screen/component with `data-trap="TR-XX"`
2. Add a metadata entry to `registry.js` with the same id
3. The moderator mode automatically picks it up — no other wiring needed
