# Release Checklist

Complete this checklist against the actual deployed build before marking the capstone finished.

## Build and publishing
- [ ] Repository is public and contains `index.html`, `style.css`, `game.js`, `README.md`, `POSTMORTEM.md`, and this checklist.
- [ ] GitHub Pages is enabled for `main` and `/(root)`.
- [ ] Live URL loads over HTTPS in a private/incognito window.
- [ ] Browser console has no errors during a full run.
- [ ] Restart, win, loss, pause, and resume flows behave as expected.

## Gameplay
- [ ] Collecting an orb increases the score exactly once.
- [ ] Reaching 10 orbs shows the win state.
- [ ] Timer reaching zero shows the loss state.
- [ ] Hazard collision removes time and temporary invulnerability prevents repeated instant penalties.
- [ ] Best score persists when local storage is available.

## Accessibility
- [ ] All buttons can be reached and activated by keyboard.
- [ ] Focus indicator is visible.
- [ ] Canvas accessible label is announced by assistive technology.
- [ ] Sound starts off and can be toggled.
- [ ] Reduced-motion toggle removes particle bursts and glow effects.
- [ ] Touch controls work without scrolling the page.
- [ ] Text remains readable at mobile widths.

## Final evidence
- [ ] Capture a screenshot of the start screen.
- [ ] Capture a screenshot during gameplay or the win state.
- [ ] Record test feedback from at least three actual players.
- [ ] Update `POSTMORTEM.md` with actual test observations.
- [ ] Confirm README controls, credits, and live URL are accurate.
