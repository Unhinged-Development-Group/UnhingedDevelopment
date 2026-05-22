---
name: unhinged-development-design
description: Use this skill to generate well-branded interfaces and assets for Unhinged Development Group (UDG) — the parent brand — and its sub-brands Groomr and Paper & Ponder. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for production work, prototypes, decks, and throwaway mocks.
user-invocable: true
---

Read the `README.md` file within this skill first. It carries the company context, content fundamentals, visual foundations, iconography rules, and a manifest of the rest of the system.

Other files to know:

- `SKILL.md` — Agent skill metadata (Claude Code compatible).
- `colors_and_type.css` — All design tokens (colour, type, spacing, radii, shadows). Three brand scopes — `.brand-udg` (default), `.brand-groomr`, `.brand-pp` — selectable via a body class.
- `assets/` — Logos and marks for all three brands, plus the chaos icon generator at `assets/unhinged/icons/unhinged-icons.js`.
- `preview/` — One-card-per-concept specimens that render in the Design System tab. `icon-library.html` holds the full 45+ icon set with click-to-copy SVG.
- `ui_kits/unhinged-marketing/` — Pixel-faithful HTML/JSX recreation of the UDG marketing site.

### Sub-brand systems

For Groomr or Paper & Ponder work, switch to their dedicated design systems — they go much deeper than the cross-brand tokens captured here:

- **Groomr** — https://claude.ai/design/p/ee599b08-8b37-474c-8a82-ae284ddfbc07
- **Paper & Ponder** — https://claude.ai/design/p/019e1ed5-beac-748b-ba24-bd2dcef761a7

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing pages, etc.), copy the assets you need out of `assets/` and produce static HTML files for the user to view. Pull tokens from `colors_and_type.css` rather than inventing new values. If working on production code, copy the assets and read the rules in `README.md` to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask some focused questions (which brand — UDG / Groomr / P&P; what surface — marketing, portal, slide, social; what tone — playful, formal, technical), then act as an expert designer who outputs HTML artifacts or production code as needed.

Brand voice reminder: dry, self-aware, faintly Scottish. Sentence case. No emoji. No exclamation marks. Confident understatement. *"Built differently."*
