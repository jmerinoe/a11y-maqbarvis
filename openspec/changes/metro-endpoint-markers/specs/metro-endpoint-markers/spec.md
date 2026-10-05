# Spec: Metro map — mark mission origin and destination

## REQ-910-01 — Visible endpoint markers

The metro map MUST render a distinct visual marker on the hotspots of
the mission `origin` and `destination` stations read from
`experience.mission` (not hard-coded names). The marker MUST be visible
in grayscale mode and after colour reveal, and MUST move with the map
under zoom and pan.

### Scenario: mission endpoints highlighted

Given the chromatic mission origin "San Nicasio" and destination
"Aeropuerto T4", when the map renders, then the San Nicasio hotspot
carries `mission-origin` and the Aeropuerto T4 hotspot carries
`mission-destination`, while no other station carries either class.

## REQ-910-02 — Markers do not alter interaction or labelling

The markers MUST be non-interactive overlays (`pointer-events:none`);
clicking the marked station MUST still select it as a leg endpoint, and
the hotspot `aria-label` MUST remain the bare station name.

### Scenario: clicking the marked origin

Given the map with endpoint markers, when the participant clicks the
San Nicasio marker area, then the click behaves exactly as clicking the
San Nicasio hotspot — it is picked as a leg endpoint.
