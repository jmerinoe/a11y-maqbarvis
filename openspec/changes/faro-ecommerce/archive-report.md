# Archive Report: Faro — Accessibility Awareness Ecommerce

## Change: faro-ecommerce
## Status: ARCHIVED

## Summary

Faro is a fictitious fashion/accessories ecommerce built for an accessibility awareness event stand. Attendees navigate a purchase flow with NVDA and encounter 19 real WCAG accessibility traps. A moderator mode (Ctrl+M) annotates each trap with its WCAG reference and corrected HTML.

## Artifacts produced

| Artifact | Path | Status |
|----------|------|--------|
| Proposal | openspec/changes/faro-ecommerce/proposal.md | Done |
| Specs (4) | openspec/changes/faro-ecommerce/specs/*/spec.md | Done |
| Design | openspec/changes/faro-ecommerce/design.md | Done |
| Tasks | openspec/changes/faro-ecommerce/tasks.md | Done (47/47) |
| Apply progress | openspec/changes/faro-ecommerce/apply-progress.md | Done |
| Verify report | openspec/changes/faro-ecommerce/verify-report.md | Done |

## Implementation

- **Stack**: Vanilla JS (ES modules) + Vite, zero runtime dependencies
- **Screens**: 6 (home, products, product-detail, cart, checkout, confirmation)
- **Traps**: 19 WCAG failures, each with data-trap marker + registry metadata
- **Moderator mode**: Ctrl+M toggle, overlay annotations, no DOM mutation
- **i18n**: Bilingual ES/EN with runtime toggle
- **Tests**: 15 structural tests (trap registry, i18n parity, moderator overlays)
- **Docs**: NVDA verification checklist, stand setup guide

## Review

- gentle-ai review start: created, risk=low, lenses=none
- gentle-ai review finalize: approved
- gentle-ai review validate --gate post-apply: allow

## Verification

- Build: PASS (27 modules, no errors)
- Tests: PASS (15/15)
- All 19 traps present in source with data-trap markers
- All spec requirements verified in verify-report.md
- Manual NVDA verification required before event (docs/verification-checklist.md)

## Delivery

- Single PR strategy with size:exception (project exceeds 400 lines by design)
- Initial commit: "feat: Faro accessibility awareness ecommerce with 19 WCAG traps and moderator mode"

## Known limitations

1. SDD dispatcher review mirror reconciliation gap — review is approved but dispatcher cannot detect the mirror. Verify proceeded based on approved review authority per orchestrator fallback policy.
2. Manual NVDA verification of all 19 traps required before event use.
3. VoiceOver support is out of scope (primary target is NVDA + Firefox/Edge).
