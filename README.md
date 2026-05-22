# Unhinged Development Group — Design System

> A little unhinged, but we get stuff done.

This is the brand and product design system for **Unhinged Development Group (UDG)** — an independent software company based in Glasgow, Scotland, and parent to the consumer brands **Groomr** and **Paper & Ponder**. The system covers the parent identity in depth and includes the cross‑brand tokens used inside the shared staff portal.

---

## 1. Company & products

**Unhinged Development Group Ltd.** Founded in 2026 in Glasgow, Scotland, out of a period of unemployment and "a fair amount of spare time." The team builds products rooted in problems they've personally lived with. The voice is dry, self-aware, faintly Scottish; the visual identity is hand-scrawled marks on near-black with one electric lime accent. The brand line: *"Built differently."*

UDG operates a small portfolio of operating companies:

| Brand | Status | What it is | Launches |
|---|---|---|---|
| **Unhinged Development Group** | Live | Parent company — public site + internal staff portal | — |
| **Groomr** | In development | UK dog groomer booking platform connecting owners to local, independent groomers — and a complete business hub for groomers to run an efficient business. Sub-brand tagline: *"Your dog deserves a regular."* | August 2027 |
| **Paper & Ponder** | In development | An AI journaling companion that uses your hand-written journal entries to analyse, discuss and reflect on your feelings. | September 2027 |

### Sub-brand design systems

Groomr and Paper & Ponder each have their own full design system projects — pull from those for sub-brand work. They cover palettes, type, components, marketing screens, and brand voice in much greater depth than this parent system does.

- **Groomr design system** — https://claude.ai/design/p/ee599b08-8b37-474c-8a82-ae284ddfbc07
- **Paper & Ponder design system** — https://claude.ai/design/p/019e1ed5-beac-748b-ba24-bd2dcef761a7

### Sources

- **Codebase (read-only, mounted):** `UnhingedDevelopment/` — Next.js 15 + React 19 + Tailwind 3 + Supabase. Key files explored:
  - `tailwind.config.ts` — full brand colour palette (`ink`, `unhinged-green`, `ember`)
  - `src/app/globals.css` — base styles, noise texture, selection colour, glow utilities
  - `src/components/Hero.tsx`, `Navbar.tsx`, `PageFooter.tsx`, `ContactForm.tsx` — landing page + nav system
  - `src/components/ScotlandPulse.tsx` + `src/components/scotland-path.ts` — animated Scotland silhouette on the *Who we are* page (canonical path data lives in this design system at `assets/unhinged/scotland-path.{ts,js}`)
  - `src/app/who-we-are/`, `projects/`, `contact/` — marketing pages
  - `src/app/portal/` + `src/app/portal/[company]/` — staff portal with three brand themes (UDG / Groomr / Paper & Ponder)
- **Uploaded assets:** `uploads/IMG_0771.PNG` (scrawled UDG wordmark) and `uploads/IMG_0772.PNG` (scrawled chevron mark).
- **Remote assets (Cloudinary, copied into `assets/`):**
  - UDG cleaned chevron — `https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png`
  - Groomr horizontal lockup (deep slate) — `https://res.cloudinary.com/dr8adq7nl/image/upload/v1774753252/Horizontal_Lockup_-_DEEP_SLATE_lg5q91.png`
  - Paper & Ponder monogram (SVG) — `https://res.cloudinary.com/dr8adq7nl/image/upload/v1778999178/monogram_pdyhij.svg`
  - Paper & Ponder wordmark — copied from `UnhingedDevelopment/public/pp-wordmark.png`

---

## 2. Content fundamentals

> Tone: dry, self-aware, faintly Scottish. Confident but never corporate. The brand is in on its own joke.

### Voice & person

- **First person plural ("we") for the company.** Second person ("you") for the reader. Examples from the marketing site: *"We started building during a period of unemployment."* / *"Got a project in mind, a question, or just want to say hello? Drop us a message."*
- **Contractions on.** *"we're", "don't", "we'd", "we've"* — never the stiff full form.
- **Idiom is welcome.** "Without the faff." "Punch well above their weight." "No politics, no bullshit." Slight Scottish register, but never opaque.

### Casing

- **Sentence case** for all UI labels, buttons, page titles, and section headings: *"Who we are"*, *"Send message"*, *"What we're building."*
- **ALL-CAPS + wide tracking (0.2em–0.3em)** reserved for eyebrows / micro-labels. e.g. `WHO WE ARE`, `MISSION`, `SECURE ACCESS`. Always paired with a 24px hairline accent rule to its left.
- **Title Case is avoided.** It feels corporate.

### Punctuation & rhythm

- **Short sentences. Then a longer one that explains. Then a punchy fragment.** This three-beat rhythm shows up everywhere — keep it.
- **The full stop is a brand element.** Marketing headings frequently end in a period: *"Built differently."*, *"Let's talk."*, *"Your dog deserves a regular."*, *"What we're building."* — even when grammatically optional, the period anchors the line.
- Em dashes ` — ` (with spaces, en-dash with thin spaces also OK) for asides. The codebase uses both.
- Smart quotes (`'`, `"`) in marketing copy. Apostrophes only on the user side — `&apos;` is the codebase's escape habit.

### What is *not* used

- **No emoji.** Not a single one in the codebase. Avoid.
- **No exclamation marks.** Confidence comes from understatement.
- **No corporate filler.** Don't write "leveraging synergies", "best-in-class", "passionate about". The team would mock anyone who did.
- **No marketing superlatives.** "We're not interested in shipping something we wouldn't use" is the tone, not "the world's best".

### Recurring phrases & motifs

- *"Built differently."* — top-level wordmark line.
- *"Built for the world."* / *"Registered in Scotland. Built for the world."* — closing line on the about page.
- *"Without the faff."* — Groomr-flavoured.
- *"Ship things worth talking about. Avoid the safe, forgettable middle."* — internal value.
- *"Keep it real. Honest communication, no politics, no bullshit."* — internal value.

### Concrete examples

| Context | Copy |
|---|---|
| Landing hero (no body text — logo carries the message) | *(image only)* |
| Page H1 | *Built<br/>differently.* |
| Page H1 | *What we're<br/>building.* |
| Page H1 | *Let's talk.* |
| Eyebrow | `WHO WE ARE` |
| Project status pill | `In Development` |
| Project metadata | *"Expected launch — August 2027"* |
| Form success state | *"Message sent. We'll be in touch shortly."* |
| Footer | *"© 2026 / Unhinged Development Group Ltd. / All rights reserved."* + *"Registered in / Scotland. 🏴󠁧󠁢󠁳󠁣󠁴󠁿"* |
| Portal pill | *"UDG Team Portal"* with pulsing dot |
| Portal eyebrow | `SECURE ACCESS` |

---

## 3. Visual foundations

The UDG identity is built on a contradiction: **hand-scrawled, raw marks sitting on a precise, near-black, slightly grainy surface, lit by one electric lime accent.** The chaos is in the logo and the brand voice; everything around them is disciplined.

### Colour

**Primary surface — `ink`.** A near-black scale, *not* pure black. It softens contrast and lets the noise texture breathe.

- `--ink-950 #030303` — page background
- `--ink-900 #080808` — cards & surfaces
- `--ink-800 #0e0e0e` — raised surfaces, button bodies
- `--ink-700 #141414` — hover / pressed surface

**Signature accent — `unhinged-green`.** The single, electric lime used sparingly for emphasis. Anything important is this colour.

- `--unhinged-green   #D2FF14` — primary
- `--unhinged-green-light #E4FF6B` — hover / glow
- `--unhinged-green-dark  #A8CC00` — pressed (also `--ember`)

**Secondary — `ember`.** A muted version of the lime, used as the second stop in the only gradient the brand allows (`from-unhinged-green to-ember`).

**Neutrals — zinc.** Tailwind `zinc-100 → zinc-900` as the body / muted / border ladder.

- Body text: `zinc-300 #D4D4D8` to `zinc-100 #FAFAFA`
- Muted: `zinc-400 #A1A1AA`, `zinc-500 #71717A`, `zinc-600 #52525B`
- Borders: `zinc-800 #27272A`, `zinc-900 #18181B`

**Sub-brand palettes** (used inside the portal, never on UDG marketing):
- **Groomr** — official palette: *Alabaster Cream* `#F9F8F4`, *Groomr Gold* `#EAE45C`, *Sage Leaf* `#88A096`, *Muted Terracotta* `#C87964`, *Pebble Grey* `#95A5A6`. Supporting: deep slate `#2C3E50` (primary body text).
- **Paper & Ponder** — own design system project (https://claude.ai/design/p/019e1ed5-beac-748b-ba24-bd2dcef761a7). Official palette ("Warm Clay"): Alabaster `#FAFAF9`, Sand `#FFEDD5`, Charcoal `#1C1917`, Deep Clay `#7C2D12`, Terracotta `#FB923C`. Type: Dancing Script (display), Montserrat Light (body), Space Mono Bold (eyebrows). Always pair handwritten script with wide-tracked uppercase mono — that's the brand's signature texture move.

### Typography

Three families on UDG. Each has one job — do not cross-cast.

| Role | Family | Where |
|---|---|---|
| **Display** | `Bitcount Grid Single` (self-hosted, variable: weight + slant + cursive + element shape/expansion) | All H1–H3, navigation links, eyebrows, project titles, large numbers. The brand's "voice on the page." A pixel-grid display face — chunky, slightly weird, geometric. Always weight 300. |
| **Sans body** | `Inter` (Google Fonts, weights 300–900) | All running text, UI labels, buttons, form fields, captions, helper text. |
| **Mono** | `JetBrains Mono` (Google Fonts, weights 400–600) | Code blocks, terminal-style chrome, technical metadata. Rare. |

### Self-hosted fonts

Every brand font is self-hosted in `/fonts/` and wired up via `@font-face` in `colors_and_type.css`. No external font CDN — the system works offline.

| Family | Brand | Use | File |
|---|---|---|---|
| **Bitcount Grid Single** | UDG | Display (H1–H3, nav, eyebrows). Variable axes: weight, slant, cursive, element shape/expansion. | `BitcountGridSingle-VariableFont_CRSV_ELSH_ELXP_slnt_wght.ttf` |
| **Inter** | UDG | Body, UI, buttons. Variable: optical size + weight. Regular + italic. | `Inter-VariableFont_opsz,wght.ttf` (+ italic) |
| **JetBrains Mono** | UDG | Code & technical chrome. Variable weight. Regular + italic. | `JetBrainsMono-VariableFont_wght.ttf` (+ italic) |
| **Nunito** | Groomr | Body & UI. Variable weight 200–1000. Regular + italic. | `Nunito-VariableFont_wght.ttf` (+ italic) |
| **Fredoka** | Groomr | Display. Variable weight 300–700, width 75–125%. | `Fredoka-VariableFont_wdth_wght.ttf` |
| **Dancing Script** | P&P | Wordmark / handwritten script. Variable weight. | `DancingScript-VariableFont_wght.ttf` |
| **Montserrat** | P&P | Body & UI structure. Variable weight 100–900. Regular + italic. | `Montserrat-VariableFont_wght.ttf` (+ italic) |
| **Space Mono** | P&P | Eyebrows, hex codes, monospaced labels. Static 400/700, regular + italic. | `SpaceMono-{Regular,Italic,Bold,BoldItalic}.ttf` |

**Display always sits at `font-weight: 300` (light)** — the airy, light Bitcount is the brand's distinct fingerprint. Avoid heavier weights of Bitcount in marketing.

**Carve-out — product/brand names.** Where a tile or card displays the *name of a product or sub-brand* (e.g. the `Groomr.` / `Paper & Ponder` titles on the projects page), the codebase uses `font-montserrat` semibold rather than Bitcount. The reasoning: those names belong to their own brands and shouldn't be re-styled in UDG's signature display face. Anywhere else — page H1–H3, eyebrows, nav, large numbers — stays Bitcount.

**Type scale** — see `colors_and_type.css`. Headings use `line-height: 0.95–1.15`; body 1.55–1.6. Headings have `letter-spacing: -0.01em`; eyebrows have `letter-spacing: 0.2em`.

> ℹ️  **All brand fonts self-hosted** — every family is in `/fonts/` as a variable (or static, for Space Mono) TTF. No external font CDN required.

### Backgrounds

- **No imagery on marketing pages.** The hero is just the wordmark, centred. The page background is `ink-950` with two soft, low-opacity radial orbs — one lime, one ember — placed off-centre.
- **Always include the noise texture overlay** on dark surfaces. It's a fixed `position: fixed; inset: 0` SVG fractal noise at `opacity: 0.04` on a `0.35` opacity layer. The codebase calls it the "subtle noise texture overlay" and it lives in `globals.css`. This is non-negotiable on UDG dark pages — it kills the cheap "flat black" look.
- **No full-bleed photography.** No repeating patterns. No conic / aurora gradients.
- **Bespoke illustration is rare and earned.** The only illustration in shipped UDG marketing today is the animated Scotland silhouette on the *Who we are* page — a faint lime outline of every island with a slow lime stroke tracing the mainland coast. See *Decorative shapes* below and `preview/scotland-pulse.html`. Treat this as the bar: a piece of bespoke illustration has to carry meaning the wordmark can't, and it has to render in the brand's stroke vocabulary (thin lime line on ink, drop-shadow glow, slow motion).
- **Gradients exist in exactly two places:** (a) text gradient `from-unhinged-green to-ember` for highlighted runs, (b) the primary CTA button's background `bg-gradient-to-r from-unhinged-green to-ember`. Don't invent new ones.

### Animation

The motion vocabulary is small and pragmatic.

- **Fade-up (600ms ease-out)** — used on mount for hero content. `opacity 0→1`, `translateY 20px→0`.
- **Fade-in (800ms ease-out)** — slower opacity-only transition for incoming sections.
- **Pulse (4s cubic-bezier(0.4,0,0.6,1), infinite)** — the lime "live" dot next to the portal pill. Soft, slow, never urgent.
- **Hover transitions: 200ms** ease, applied with `transition-all` or `transition-colors` / `transition-opacity`.
- **Mobile drawer: 300ms `ease-in-out`** translate + backdrop fade.
- **Smooth scroll** at the document level.
- **Scotland trace (5s linear, infinite, no pause)** — on the *Who we are* page, a lime stroke traces the mainland coastline using a long `stroke-dasharray` + animated `stroke-dashoffset`. Trail length is `2.5%` of the total path length so it survives swapping the SVG source. Drop-shadow glow on both the faint base outline and the moving pulse. Lives in `src/components/ScotlandPulse.tsx`.
- **No bounce, no overshoot, no spring physics.** No scroll-jacking, no parallax, no particle effects. The brand voice is dry — motion should be too.

### Hover states

- **Text links / nav:** drop opacity to `0.7–0.8` on hover. That's it.
- **Pills / cards:** border colour ramps from `zinc-800` → `zinc-700`, optionally → `unhinged-green/50` for emphasis. Sometimes the text also brightens from `zinc-300` → `white`.
- **Primary buttons:** `hover:opacity-90`, no scale change.
- **Iconography in buttons:** translate `0.5–2px` in the action direction (chevrons move right) over 200ms. This is the only "playful" hover detail.

### Press / active states

- Buttons: `disabled:opacity-50` is the only explicit pressed treatment; otherwise the same `opacity-90` hover is used as a hint.
- **No `scale(0.97)` on press, no inset shadow.** The brand is flat.
- Form fields on focus: `focus:border-unhinged-green/50` + a faint `focus:ring-1 focus:ring-unhinged-green/30`.

### Borders

- **`1px solid` only.** No thick outlines, no dashed/dotted by default.
- **Border colour hierarchy:** `zinc-900` (hairline) → `zinc-800` (default) → `zinc-700` (hover) → `unhinged-green/30–50` (focus/emphasis).
- Sub-brand portals use their own pebble border (`rgba(149,165,166,0.25)` for Groomr; `#E7E5E4` for P&P).
- The codebase exposes one decorative gradient border utility (`.border-gradient` — `border-image: linear-gradient(135deg, #ff6b2b, #ffb347) 1`). It's defined but unused in shipped pages; treat it as latent / optional.

### Shadows

- **Dark UDG surfaces use almost no shadows.** Elevation is conveyed through the noise overlay + brighter borders, not drop shadow. If a card needs lift, prefer `border-zinc-700` over a shadow.
- **The glow shadow** (`text-shadow: 0 0 40px rgba(210,255,20,0.35)` on the lime wordmark) is the brand's *only* signature shadow.
- **Light sub-brand surfaces use soft, low-opacity drop shadows** — `0 1px 2px rgba(28,25,23,0.06)` (P&P), `0 4px 6px -1px rgba(149,165,166,0.10)` (Groomr).
- No inner shadows anywhere.

### Capsules vs. protection gradients

The codebase **prefers capsules and pills** for chrome elements (the portal CTA, status pills, tag chips, "back" links). The "rounded-full" `border + bg-ink-800` pill is the dominant control shape on UDG.

**Status pill variants** — see `preview/status-pill.html`. Three recurring shapes:
- **Portal "live" pill** — `border-zinc-800 bg-ink-800`, `zinc-300` text, leading `6×6` lime dot on a slow `4s` pulse, trailing chevron that nudges `0.5px` on hover. The *only* place lime appears as a status colour.
- **Project status pill** — fully neutral. `border-zinc-700 bg-zinc-800/60`, `zinc-400` text, `4×4` `zinc-500` dot. Used for *"In Development"* on project tiles. **Never lime** — the lime dot is reserved for the live portal pill.
- **Tag chip** — outline-only. `border-zinc-800`, `zinc-500` text, no fill, no dot.

The lime hero wordmark uses a soft *protection glow* — `drop-shadow(0 0 16px rgba(210,255,20,0.40))` plus `mix-blend-mode: screen`. This is the closest the brand gets to a "protection gradient," and it appears only on the hero lockup.

### Layout rules

- **Max content width** on text pages: `max-w-3xl` (≈ 48rem / 768px). Project grid uses `max-w-4xl` (64rem / 1024px).
- **Page padding** — `px-6` mobile, `sm:px-10`, `lg:px-16` desktop. Vertical `py-10`.
- **Fixed elements** — the mobile drawer (`fixed top-0 left-0 z-30`), backdrop (`fixed z-20`), portal top bar (`sticky top-0 z-20`), mobile bottom tab bar (`fixed bottom-0 z-20`), noise texture (`fixed inset-0 z-0`). Z-index ladder is `0 (noise) < 10 (content) < 20 (chrome) < 30 (drawer) < 40 (nav)`.
- **Grid gaps:** 4–6 (`gap-4` for chips, `gap-6` for cards). Never use ad-hoc margin to space siblings.
- **The nav is left-aligned, the CTA is right-aligned.** The mobile menu opens from the *left* (`-translate-x-full → 0`) — the logo doubles as the menu trigger.

### Transparency & blur

- The mobile drawer **backdrop**: `bg-black/60 backdrop-blur-sm`.
- The portal top bar: `bg-ink-950/90 backdrop-blur-sm`. Quiet, structural blur — only on overlay chrome.
- Decorative orbs: `radial-gradient` ellipses at `opacity 0.06–0.13`, no blur applied (the low opacity does the work).
- **Never blur photography. Never frosted-glass cards.** It would clash with the noise texture.

### Imagery direction

Right now there's no photography in the marketing site — the hero is purely typographic. If photography is introduced:
- Treat photos as **cool / desaturated black-and-white with film grain**. The brand has a "dark glasgow flat at 2am" temperature.
- Avoid warm sun, lifestyle stock, "tech startup" stock photography entirely.
- **Sub-brands carry the warmth.** Groomr is warm cream + sage; P&P is alabaster + clay. Don't blend the worlds — UDG is the dark frame around them.

### Corner radii

Per `--radius-*` token. Used as follows:

- `--radius-sm 6px` — code chips, inline metadata
- `--radius-md 10px` — small buttons, inline pills (rare)
- `--radius-lg 14px` — *not commonly used; for cards on light surfaces*
- `--radius-xl 20px` — primary buttons, form inputs (`rounded-xl`), most cards on dark surfaces
- `--radius-2xl 24px` — large cards, project tiles
- `--radius-full` — pills, status chips, the "UDG Team Portal" CTA, status dots

Sharp / 0-radius corners are not used.

### Cards

The recurring UDG card recipe:

```
border: 1px solid zinc-800;     /* --border-2 */
background: ink-900;            /* --bg-surface */
border-radius: 24px;            /* --radius-2xl */
padding: 28px;                  /* p-7 */
display: flex;
flex-direction: column;
gap: 16px;                      /* gap-4 */
transition: border-color 0.2s;
:hover { border-color: zinc-700; }
```

No drop shadow, no inner shadow. Lift is purely from the brighter border on hover.

---

## 4. Iconography

UDG ships its own **procedurally-generated "chaos" icon set** — designed to echo the scrawled energy of the wordmark while staying readable at small sizes. The technique: for each Heroicons-shaped path, stack six copies with small translate / rotate / opacity jitter, then over-stroke the top layer in `--unhinged-green`. Same hand-drawn vibe as the wordmark, no hand-drawing required.

### The generator

`assets/unhinged/icons/unhinged-icons.js` exposes a tiny runtime:

```html
<script src="assets/unhinged/icons/unhinged-icons.js"></script>

<!-- Declarative -->
<span data-unhinged-icon="lightning" data-size="22"></span>

<!-- Programmatic -->
<script>
  document.body.insertAdjacentHTML(
    'beforeend',
    UnhingedIcon('rocket', { size: 32, main: '#FFFFFF', accent: '#D2FF14' })
  );
</script>
```

Themes:
- **Dark UI** — `main: #FFFFFF`, `accent: #D2FF14` (Unhinged Green)
- **Light UI** — `main: #000000`, `accent: #A8CC00` (Ember)

The full **45+ icon library** with copyable SVG lives at `preview/icon-library.html` — open it directly to grab raw SVG for any icon. Categories: *Brand & Identity · Core UI · Tech & Dev · Files & System · Comms & Devices · Data & Metrics*.

### Substitution policy

If you need an icon that isn't in the set, **add it to `unhinged-icons.js` rather than mixing in a clean Heroicon** — the chaotic stacking is the icon system. The path data is Heroicons-style outline (24×24, no fills), so any Heroicons outline glyph can be ported as-is.

> 💬 The icon set is still evolving (in collaboration with the founder). Treat the current 45+ icons as a working v1, not a frozen contract.

### What's already inlined

The chrome icons used inside the staff portal are hand-rolled inline SVGs in the standard Heroicons-outline silhouette (24×24, stroke 1.5, `currentColor`). These are *not* run through the chaos generator — clean strokes work better in dense application chrome. Use the generator for marketing surfaces, hero accents, big illustrative moments, and any spot that wants to feel a little unhinged.

Inlined in the codebase:

- Chevron right (`M9 5l7 7-7 7`) — CTAs, drawer items
- Chevron left (`M15 19l-7-7 7-7`) — back links
- Chevron down (`M19 9l-7 7-7-7`) — select dropdown
- Folder (`M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8...`) — Documents nav
- Shield-check (`M9 12l2 2 4-4m5.618-4.016...`) — Policies nav
- Pencil (`M15.232 5.232l3.536 3.536...`) — Designs nav
- 2×2 grid (`M4 6a2 2 0 012-2...`) — Projects nav
- People (`M17 20h5v-2...`) — Team nav
- User-circle (`M16 7a4 4 0 11-8 0 4 4 0 018 0z...`) — Account nav
- Home (`M3 12l2-2m0 0l7-7 7 7...`) — Overview
- Envelope (`M3 8l7.89 5.26...`) — magic link confirmation
- Document (`M7 21h10a2 2 0 002-2V9.414...`) — generic file
- Image (`M4 16l4.586-4.586...`) — image file

### Logos & marks

| File | Use |
|---|---|
| `assets/unhinged/wordmark.png` | The scrawled "UNHINGED Development Group" hand-lettered wordmark. The signature mark. Always inverted on dark (filter: `invert(1)`) with optional `mix-blend-mode: screen` to drop the white background, plus the lime drop-shadow glow on hero. |
| `assets/unhinged/chevron-mark.png` | The scrawled chevron / "greater-than" symbol. The icon mark. |
| `assets/unhinged/chevron-mark-clean.png` | Same chevron, exported cleanly from Cloudinary. Use this version when filtering colours (the green-tint filter in `Hero.tsx`). |
| `assets/groomr/horizontal-lockup-deep-slate.png` | Groomr horizontal lockup, dark slate version (the only Groomr lockup in the codebase). |
| `assets/paper-and-ponder/monogram.png` | P&P circle monogram — serif P&P lockup with cursive ampersand on a stitched-border circle. |
| `assets/paper-and-ponder/logo.png` | P&P wordmark — *Paper & Ponder* in a flowing script with terracotta ampersand. |

**Favicon** — the codebase generates the favicon on the fly from the cleaned chevron via a Cloudinary transform (`e_negate/co_rgb:D2FF14,e_colorize:100/c_fit,h_64,w_64/f_png`). It's the chevron mark tinted to `--unhinged-green`. Apple touch icon uses the same recipe at 180×180. Keep this approach — don't bake a static lime favicon into `/assets/`.

### Unicode

- The **Scottish saltire** is drawn inline as a small SVG flag in the footer (white X on `#003893` blue). Not a flag emoji — emoji aren't used.
- The em dash ` — ` is a typographic icon in itself.

### Decorative shapes (non-icon)

- The **1px × 24px accent rule** that precedes every eyebrow (`h-px w-6 bg-unhinged-green`) is the brand's smallest visual atom. Use it.
- The **pulsing 6×6 lime dot** (`h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse`) used in the portal pill to indicate "live".
- The **animated Scotland silhouette** on `/who-we-are` — see *Animation* + `preview/scotland-pulse.html`. Faint base outline of every island in `rgba(210,255,20,0.12)` at `0.6u` stroke, lime mainland pulse at `0.9u` stroke, both with drop-shadow glow.
- The **mobile drawer logo flip.** On mobile, the chevron logo doubles as the menu trigger: while the drawer is open it horizontally flips (`scaleX(-1)`) and swaps from white-inverted to a lime-tinted Cloudinary variant (`e_negate/co_rgb:D2FF14,e_colorize:100`). 300ms ease-in-out. The lime swap is *after* the flip, on a 150ms timer, so the colour change reads as separate from the flip. This is the only place the brand gets a little playful with the mark.

---

## 5. Index — what's in this design system

```
README.md                       you are here
SKILL.md                        Claude Code / Agent Skill metadata
colors_and_type.css             all tokens (colour, type, spacing, radius, shadow, motion)

assets/
  unhinged/
    wordmark.png                  scrawled hand-lettered wordmark
    chevron-mark.png              scrawled chevron icon mark
    chevron-mark-clean.png        cloudinary cleaned export of the chevron
    scotland-path.ts              SVG path data for the Scotland silhouette (source from codebase)
    scotland-path.js              same data exposed as window globals for static HTML
    icons/
      unhinged-icons.js           procedural "chaos" icon generator (30+ named icons)
  groomr/
    horizontal-lockup-deep-slate.png
    horizontal-lockup-groomr-gold.png   (alt colourway)
    logo-mark-deep-slate.png
    logo-mark-groomr-gold.png
    wordmark-deep-slate.png
  paper-and-ponder/
    monogram.png                  P&P circle monogram (stitched border, P&P serif lockup)
    logo.png                      P&P wordmark (Dancing Script-style)

preview/                        Design System tab cards
  brand-stack.html
  logos.html
  ink-scale.html
  green-accent.html
  zinc-neutrals.html
  udg-palette.html              consolidated UDG palette (ink + lime + zinc)
  groomr-palette.html
  pp-palette.html
  type-display.html
  type-scale.html
  eyebrow-pattern.html
  spacing-scale.html
  radii.html
  shadows-glow.html
  motion.html
  scotland-pulse.html           animated Scotland coastline trace
  iconography.html              compact 16-icon dark+light demo
  icon-library.html             full 45+ icon library — click to copy SVG
  cards.html
  buttons.html
  inputs.html
  pills-badges.html
  status-pill.html              project / portal / tag chip variants
  nav-pill.html

```

Groomr and Paper & Ponder UI kits live in their own design system projects:
- Groomr: https://claude.ai/design/p/ee599b08-8b37-474c-8a82-ae284ddfbc07
- Paper & Ponder: https://claude.ai/design/p/019e1ed5-beac-748b-ba24-bd2dcef761a7

---

## 6. Caveats & open questions

- **ScotlandPulse — pause to be removed in codebase.** The design system now specifies a continuous 5s loop. The live `src/components/ScotlandPulse.tsx` still has `PAUSE_S = 0.8` and a three-stop keyframe that holds at the end. Update the component to a two-stop `0% → 100%` keyframe and drop the `PAUSE_S` constant when convenient.
- **Paper & Ponder product framing:** the codebase now describes P&P simply as *"an AI journaling companion that uses your hand-written journal entries to analyse, discuss and reflect on your feelings."* The earlier Obsidian Journal / stationery-brand framing has been retired from shipped marketing copy. The deeper product framing (handwriting capture, paired physical journal) still lives in the Paper & Ponder sub-brand design system.
- **All brand fonts are self-hosted.** Eight families live in `/fonts/`. No Google Fonts CDN; the system works offline.
- **Icon set is v1.** 30+ icons in `unhinged-icons.js`; the full 45+ library at `preview/icon-library.html` is the source of truth. Still evolving in collaboration with the founder.
- **Photography direction is theoretical.** No photos ship in the marketing site today — the imagery guidance is extrapolated from the prevailing dark + grain tone.
