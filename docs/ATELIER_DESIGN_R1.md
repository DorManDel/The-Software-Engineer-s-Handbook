# Engineering Codex — Atelier R1 design language

Status: **review proposal, not a production rollout**.

## Reference & deliberate adaptation

The visual direction was extracted from MyPortfolio's `develop` source at `DorManDel/Dor-s-Profile-Site` (`index.html` blob SHA `54658616a73ee37503a7f6f24d888822de03c64d`). Its source uses a deep ocean background `#051226`, an icy sky accent `#a4d6ee`, the Georgia family for display headings, a system sans for UI, semi-transparent glass, and layered/prismatic interaction experiments.

This implementation **does not copy** MyPortfolio's app, media assets, project code or its private settings. It is a small standalone visual system suitable for public documentation. The title card is a CSS-drawn decorative sculpture, not a real 3D/CSS framework or actual optical refraction simulation.

## Experience rules

1. **Editorial first**: oversized headline, generous negative space, serif accent phrase, calm type density.
2. **Apple-like restraint**: no decorative button boxes or labels repeated across the content. Navigation is a translucent sticky masthead with animated underlines.
3. **Liquid-like material**: selective frosted-glass surfaces, subtle internal highlights and moving reflections. Do not imply native iOS material or true displacement optics.
4. **Motion with meaning**: gentle floating sculpture and orbital arcs, cursor-responsive depth and reflections, hover lift, scroll reveal. No auto-playing videos or audio.
5. **Learning UX remains primary**: terminal and memory visualizer retain clear controls, accessible names, keyboard support and explanatory notices.
6. **Performance boundaries**: no GSAP/Three.js/WebGL dependencies for this baseline; no always-on JS render loop. Pointer tilt runs RAF only while moving and settling. The course/source catalogs omit repeated backdrop filters.
7. **Accessibility**: system reduced-motion preference is honored and cannot be overridden by the site. Manual Motion On/Off is persisted when storage is available. Cards remain readable when effects are disabled; focus indicators persist.
8. **Responsive**: desktop (1512px), tablet (820px), phone (390px) tested with no horizontal document overflow. The nav row itself scrolls horizontally on narrow viewports.

## Implementation inventory

- `index.html`: replaces the sidebar with a semantic masthead; reworks the hero into an editorial title + CSS sculpture; keeps learning-section IDs.
- `styles.css`: full theme rewrite, typography, glass primitives, responsive grids, simulation panes, motion/reduced-motion rules and print fallback.
- `src/app.mjs`: decorative motion controller layered over the existing terminal/pointer/registry logic.
- `tests/design-contract.test.mjs`: offline structural checks.

## Verification performed locally

- `node --test tests/*.test.mjs`
- `python3 scripts/validate.py`
- `python3 scripts/build_pages.py` → exactly seven allowlisted public files
- Playwright headless Chromium DOM-interaction tests using local HTML/CSS and injected JS/data (browser navigation to HTTP/file URLs was blocked by the local test environment): tested 1512x982, 820x1180, 390x844; no page errors; 56 curriculum entries and 31 source cards; page navigation, terminal command, pointer slider and manual motion toggle.
- Separate `prefers-reduced-motion: reduce` check confirms motion is paused and the toggle is disabled.

**Not yet verified**: physical devices and scroll/hover feel on actual high-refresh screens; the appearance of the deployed GitHub Pages preview (Pages only deploys `main`); full WCAG audit; Lighthouse/real-world GPU measurements. Merge and publish only after visual review.

## PCM boundary

No private PCM API, lecture PDFs or personal Drive records are included. PCM can receive only the approved PR/commit reference and acceptance status.
