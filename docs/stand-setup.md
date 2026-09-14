# Faro — Stand Setup Guide

Instructions for setting up the Faro accessibility demo at an event stand.

## Prerequisites

- Windows PC (the stand machine)
- NVDA screen reader installed ([nvaccess.org](https://www.nvaccess.org))
- Firefox or Edge browser
- Node.js 18+ (only needed if running from source; not needed if using pre-built files)

## Option A: Run from pre-built files (recommended for the stand)

1. Build the site on a development machine:
   ```
   npm install
   npm run build
   ```
2. Copy the `dist/` folder to the stand machine
3. On the stand machine, serve the files locally:
   ```
   npx serve dist
   ```
   Or use any static file server. Open the provided URL in Firefox/Edge.

4. Alternatively, open `dist/index.html` directly — but a local server is more reliable for hash routing.

## Option B: Run from source

1. Copy the entire project to the stand machine
2. ```
   npm install
   npm run preview
   ```
3. Open the provided URL (usually http://localhost:4173) in Firefox/Edge

## NVDA configuration

1. Launch NVDA (Ctrl+Alt+N, or from the Start menu)
2. Ensure NVDA speech is audible through speakers or headphones
3. Default settings work — no special configuration needed

## Running the demo

### For the attendee (the experience)

1. Open the site in Firefox/Edge with NVDA running
2. Tell the attendee: "Try to buy a blue t-shirt using only the keyboard and screen reader"
3. Let them navigate. Do NOT help them find things — the frustration is the lesson.
4. Typical flow: Home → search "camiseta" → product listing → product detail → add to cart → cart → checkout → confirmation
5. Most attendees will NOT complete the flow in 2-4 minutes. That is expected and part of the lesson.

### For the moderator (the debrief)

1. After the attendee struggles, press **Ctrl+M** to activate moderator mode
2. Annotation overlays appear on each trap on the current screen
3. Walk the attendee through each annotation:
   - What the trap is (the failure description)
   - Which WCAG Success Criterion it violates
   - What the correct HTML looks like (the fix snippet)
4. Press **Ctrl+M** again to deactivate moderator mode
5. Optionally, let the attendee try the next screen with moderator mode OFF to experience more traps

### Language toggle

- The site defaults to Spanish
- Use the EN/ES toggle in the header to switch languages
- Moderator annotations follow the active language

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Site doesn't load | Ensure a local server is running (not just opening the file directly in some browsers) |
| Ctrl+M doesn't work | Ensure focus is on the page (click on the page first), then try again |
| NVDA not speaking | Check NVDA is running and speakers/headphones are connected |
| Carousel focus stealing is too aggressive | This is intentional (TR-03). If it makes the demo impossible, you can navigate away from the home screen quickly. |
