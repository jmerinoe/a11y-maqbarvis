# Spec: DNF ordering — longest survival first

## Purpose

Abandoned runs SHALL keep ranking after every completed run, and among themselves SHALL be ordered by elapsed time **descending** — the participant who spent longer in the experience before abandoning ranks first among DNFs.

## Requirements

### REQ-950-01: DNF block position unchanged
Every `result === 'abandoned'` row SHALL rank after all `result === 'completed'` rows in the app ranking and in `GET /api/ranking`.

### REQ-950-02: DNF intra-order descending
Within the abandoned group, rows SHALL sort by `elapsedMs` descending (longest time-to-abandon first). Ties SHALL fall back to earlier `endedAt`, then `user` ascending.

### REQ-950-03: Completed ordering unchanged
The relative order of completed rows SHALL NOT change: appointment → route minutes → elapsed → end → user.

### REQ-950-04: Parity between local and API ranking
`getRanking` and the API ranking endpoint SHALL produce the same order for identical data.

## Scenarios

### Scenario: Two DNFs, different times
- **Given** completed runs of 01:00 and 02:00, and abandoned runs of 00:30 and 01:30
- **When** the ranking renders
- **Then** positions are: completed-01:00, completed-02:00, DNF-01:30, DNF-00:30 — the longer survival ranks first among DNFs
