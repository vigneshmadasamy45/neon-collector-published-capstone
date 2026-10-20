# Neon Collector — Published Game Capstone

A compact browser arcade game built with HTML, CSS, JavaScript, and the Canvas API. Collect 10 cyan energy orbs in 30 seconds while avoiding moving red hazards.

## Play

After enabling GitHub Pages for this repository, open:

`https://vigneshmadasamy45.github.io/neon-collector-published-capstone/`

If your GitHub username or repository name differs, update the URL accordingly. The live link becomes available after GitHub Pages finishes deploying.

## Controls

- **Move:** WASD or arrow keys
- **Pause / resume:** Pause button or `Escape`
- **Restart:** Restart button
- **Touch screens:** Use the on-screen directional pad
- **Sound:** Starts muted; use the Sound button to enable or disable tones
- **Reduced motion:** Toggle under Comfort settings

## Rules

- Collect 10 energy orbs before the 30-second timer ends to win.
- Touching a red hazard removes 2 seconds. A short invulnerability window prevents repeated instant hits.
- Your best score is stored locally in the browser when local storage is available.

## Accessibility and performance notes

- Semantic buttons and visible keyboard focus.
- Canvas has an accessible label; game events are announced through a live region.
- Keyboard and touch controls are supported.
- Sound is optional and initially off.
- Reduced-motion mode removes particle bursts and glow effects.
- Responsive layout and no external game-art assets.
- Best score storage is guarded in case browser storage is unavailable.

## Credits and asset licensing

- Game concept, interface, and Canvas-rendered shapes: original project implementation.
- No third-party images, sound files, or sprites are bundled.
- The optional sound is generated with the browser Web Audio API.
- The page loads Space Grotesk and DM Mono from Google Fonts when online; system fonts are fallbacks. For a fully offline release, remove the Google Fonts import in `style.css`.

## Run locally

Open `index.html` in a modern browser. No build tools or dependencies are required.

## Project files

- `index.html` — semantic page structure and game UI
- `style.css` — responsive visual design and focus styles
- `game.js` — game loop, controls, collision, score, sound, and persistence
- `POSTMORTEM.md` — goals, challenges, results, and next steps
- `RELEASE_CHECKLIST.md` — final manual release checks

## Postmortem

See [`POSTMORTEM.md`](POSTMORTEM.md). Replace the testing placeholders with your actual observations before submitting.
