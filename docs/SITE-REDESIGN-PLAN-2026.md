# www.jesse-wunderlich.com — 2026 Redesign Plan

**Status:** Direction locked in — Phase 0 next
**Author:** Yishai (research + synthesis)
**Date:** 2026-09-24 (updated after audit + second research pass)
**Ask:** "Wipe the codebase, start fresh, go all out for a fresh new experience." (2026-09-16) → "What do you recommend? Do as much research as needed." → "Comprehensive plan doc." → "Drop the /now page. Yes, wipe the codebase and start fresh. Audit the doc and do more research."

**Round 4 audit — a real, live-breaking bug found and fixed:**
- `vercel.json`'s CSP uses a strict hash-based `script-src` allowlist (`'sha256-...'`) rather than `'unsafe-inline'`. The Round 3 inline scroll-reveal `<script>` I'd added to `BaseLayout.astro` was **not** in that allowlist — in production the browser would have silently blocked it as a CSP violation. Since every `.reveal` element starts at `opacity:0` and only becomes visible once that script runs, **this would have made most of the page content invisible on every page, permanently**, with no visible error to a normal visitor. Caught by actually computing the inline script's hash and diffing it against the CSP, not by reading the code and assuming it was fine.
  - **Fix:** moved the script out of the page into `public/reveal.js`, loaded via `<script type="module" src="/reveal.js">`. CSP already allows `script-src 'self'`, so a same-origin external file needs no hash at all — and this way it can never break again just because the script's content changes on a future edit (a hash has to be recomputed and re-pinned every time; a `src=` reference doesn't).
  - Verified post-fix: rebuilt, confirmed via a small Python script that only one inline `<script>` remains in the built HTML (the pre-existing JSON-LD block, whose hash already matched the CSP before this project started and is unchanged).
- Re-ran the full grep sweep for old-palette hex codes (`#2a0845`, `#ff3e88`, `#00e5ff`, `#ffd700`) and dropped tropes (`marquee`, `blink`) across `src/` and `public/` — clean.
- Verified sitemap output lists exactly the 6 live pages (home/about/guestbook/links/projects/uses), no `/now`, matching `llms.txt` and the nav.
- Checked the "married in 2021" line on About against memory/USER.md before assuming it was safe to keep: it was **already live on the pre-redesign site** (confirmed via `git show main:src/pages/about.astro`), not something invented during this rebuild, so it's preserved content, not a new fabrication risk.

**Round 3 audit (this pass) — implementation gaps found and closed:**
- View Transitions were *documented* (Section 2.6) but never actually wired up. Fixed: added Astro's `<ClientRouter />` (from `astro:transitions` — this is the current Astro 6 name; it replaced `<ViewTransitions />` in Astro 5) to `BaseLayout.astro`.
- `public/favicon.svg` and `public/og-image.png` were both still the *old* purple/pink/cyan design — a real, visible inconsistency (a redesigned dark amber site sharing a mismatched purple browser-tab icon and social-card image). Fixed: hand-wrote a new favicon in the Flight Log palette; generated a new OG image (near-black background, amber monospace wordmark, HUD-style corner ticks) and cropped it to the correct 1200×630. `favicon.ico` and `apple-touch-icon.png` (raster, harder to hand-edit) are still old-style — flagged as a small remaining inconsistency, not blocking, since browsers prefer the SVG favicon when present.
- Attempted an automated accessibility pass (`@axe-core/cli` against a local `astro preview` server) to verify contrast beyond the one token checked by hand. The tooling itself didn't cooperate in this sandbox (chromedriver/webdriver connection errors, not a site problem) — reporting this honestly rather than claiming a pass that didn't actually run. The manual WCAG relative-luminance contrast math in Section 2.8 still stands (that's real, computed math, not a tool claim); a real Lighthouse/axe run from an ordinary browser DevTools is the recommended final check before merge, and is a five-minute thing Jesse can do himself against the live Vercel preview.

**Confirmed decisions (earlier pass):**
- Drop the `/now` page entirely — Jesse doesn't want the upkeep burden. Site goes from 7 pages to 6 + 404.
- "Wipe and start fresh" confirmed = full design/template/copy rebuild inside the existing repo. Git history, Vercel project, domain, and the real Upstash visitor-count data stay intact (no reason to lose them; re-reading the original ask, "fresh" was never about infrastructure).
- Flight Log direction is a go — no objection raised across two rounds of "what do you recommend," and it's the strongest, most-Jesse-specific answer research supports. Treating it as approved rather than re-asking a third time.

---

## 1. TL;DR Recommendation

Don't throw away what's working. **Keep Astro, keep the GeoCities-adjacent personality, keep the real visitor counter and IndieWeb bones — but execute the *design* at an award-winning 2026 level instead of a literal 90s pastiche.**

The 2026 award-winning pattern isn't "more retro" or "more minimal" — it's **one distinctive signature idea, executed with restraint, fast, and accessible.** Right now the site has a good *personality* (hand-coded, no trackers, real counter, guestbook) wrapped in a *generic* retro skin (marquee, blink, purple gradient). The fix isn't deleting the personality — it's finding the one signature visual idea that's actually *Jesse's* and building the whole site around it, then dropping the parts that are just "retro cosplay" (marquee, blink tag) that add noise without adding meaning.

**My specific recommendation: "Flight Log" as the signature idea.**
Jesse flies the ScanEagle for a living. A UAS operator's world is telemetry: altitude, heading, status, timestamps, mission logs. That's a genuinely distinctive, personal, ownable visual language — nobody else's portfolio can honestly use it. Concretely:
- Hero renders like a heads-up flight instrument panel — bearing, "altitude" (years building), status line — built in CSS/SVG, not a gimmick video.
- Section transitions read like log entries / mission timestamps (`MISSION LOG · ENTRY 04 — Nova Net Worth`).
- The real visitor counter survives as an odometer, restyled to match — it's still a great, honest, funny detail that fits "no trackers, real numbers."
- Dark instrument-panel palette (near-black + amber/green phosphor accent) instead of purple gradient — ties the "counter" aesthetic and "cockpit" aesthetic into one coherent system instead of two competing bits.
- Motion is restrained: CSS + `IntersectionObserver` reveal-on-scroll, Astro View Transitions between pages, zero heavy JS framework. No WebGL, no scroll-jacking.

This satisfies every 2026 signal from research below (minimal-but-distinctive, one signature idea, fast, accessible) while staying 100% honest to who Jesse actually is instead of chasing a generic trend.

**Everything else below is the supporting research, the full content/technical plan, and the open decisions I need from you before writing code.**

---

## 2. Research Synthesis (2026 personal-site landscape)

### 2.1 What's actually winning right now
- **Minimal editorial + one signature idea beats "more effects."** Awwwards/CSS Winner 2026 pattern: strong typography, huge whitespace, a single memorable visual/interaction motif, purposeful motion — not five competing effects. Overloaded retro skins (marquees, autoplay blink text, gradients-for-their-own-sake) read as dated *because* they're generic 90s tropes, not because retro-as-a-concept is dead.
- **Projects-first, evidence-first.** Best personal/dev sites put 2-4 real things above the fold fast. Badge collections and skill-soup are out; "here's what I shipped" is in.
- **Bento/modular grids** are a strong secondary pattern for showing multiple kinds of proof (military service + drone job + Nova + family) without a wall of prose — useful for the About/home content mix Jesse already has.
- **Performance and accessibility are table stakes for "award-winning," not nice-to-haves.** Every 2026 trend piece pairs "bold" with "fast" and "usable on a mid-range phone."

### 2.2 IndieWeb / personal-site content patterns (still current, keep leaning in)
- `/uses` remains a live, recognized indie-web convention (uses.tech) — keep it, finish the TODOs.
- **`/now` dropped by explicit decision** — Jesse doesn't want the ongoing upkeep of a page that goes stale (exactly the failure mode the current one is already in: it still reads like it's pre-June 2026). Its indie-web purpose ("what's got my attention right now, not a résumé") gets folded into a single always-current sentence on About instead of a whole page that requires a maintenance habit.
- **h-card microformat** (already added to `BaseLayout.astro`) is correct and current — canonical identity card for the IndieWeb.
- **Digital garden / notes-as-you-go**: deliberately excluded from this rebuild. A `/writing` or `/log` section is the same upkeep-debt shape as `/now` — another page that decays without a maintenance habit. Not doing it unless/until there's an actual backlog of things Jesse wants to publish.
- **Webmentions**: researched (webmention.io + `rel=me` + a `rel="webmention"` endpoint tag is the standard 2026 static-site pattern), but **recommend skipping it**. It's a third-party account to maintain and a new endpoint to keep working — the same upkeep-burden category Jesse just opted out of with `/now`. The guestbook (giscus) already covers "people can respond to me" without adding a dependency. Revisit only if Jesse starts publishing long-form writing that draws external replies worth surfacing.

### 2.3 llms.txt / GEO (generative engine optimization)
AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews) are now a real discovery surface even for personal sites. Recommended, low-cost additions:
- `/llms.txt` at site root: short, curated list of the site's real pages (About, Projects, Now, Uses) with one-line descriptions — a map for AI crawlers, not a blocking mechanism.
- Keep JSON-LD `Person` schema (already present) — this is exactly what GEO guides recommend as structured, machine-readable identity.
- The actual lever is content quality: answer-dense, clearly headed pages — which the content plan below already does.

### 2.4 Performance budget (2026 field-data thresholds)
Target Core Web Vitals at the 75th percentile:
- **LCP ≤ 2.5s**
- **INP ≤ 200ms**
- **CLS ≤ 0.1**
- **Total JS: keep near-zero.** The current site is already almost entirely static HTML/CSS (only the giscus guestbook embed loads JS) — this is a genuine competitive advantage and the plan preserves it. New motion (scroll reveals, view transitions) should stay CSS + native browser APIs (`IntersectionObserver`, Astro View Transitions), not a client framework or animation library, to keep JS at effectively zero.
- **Images:** compress/serve WebP/AVIF via Astro's built-in image pipeline where any imagery is added (there's currently almost none — an opportunity, see content plan).

### 2.5 Accessibility (WCAG 2.2 AA, non-negotiable for "award-winning")
- Current site already has a skip link and semantic landmarks — good foundation.
- New requirements to carry forward: color contrast ≥ 4.5:1 for body text against the new dark instrument-panel palette (amber-on-near-black needs an actual contrast check, not eyeballing), visible focus states on every interactive element, `prefers-reduced-motion` fallback that disables all scroll-reveal/transition motion, no motion-only affordances (marquee/blink fail this outright — another reason to drop them).

### 2.6 Astro 6 technical approach for motion
- **Astro View Transitions** (native, `docs.astro.build/en/guides/view-transitions/`) for page-to-page continuity — e.g. the nav "instrument label" can persist/morph between pages.
- **Scroll reveals via CSS + `IntersectionObserver`**, re-initialized on `astro:page-load` so it survives view transitions. No GSAP/Lenis needed for a site this scope — those are for scroll-jacking WebGL galleries, which is explicitly *not* the direction here.
- Net effect: **zero new client-side framework dependencies**, keeps the "no trackers, real hand-coded corner of the web" identity intact and technically true.

### 2.7 Aviation HUD/instrument design references (grounding the Flight Log motif)
Real reference points so "Flight Log" doesn't stay abstract:
- **Collins Aerospace head-up display** — real-world HUD reference for authentic symbology (bearing tape, horizon line, status readouts) rather than generic sci-fi.
- **Aviation Dashboard / Flight Control Web Interface** and **Military Aircraft UI** patterns (Dribbble) — layered panels, transparent overlays, fast-scan flight metrics; the layered-panel idea maps well onto a bento-style content grid.
- **Futuristic Aircraft HUD / FUI** (Behance) — useful for reticle/readout detailing on the hero, used sparingly (this is the "one signature idea, not five effects" line — pull one or two motifs, not the whole genre).
- Steer *away* from full sci-fi/game-HUD excess (glitch effects, scan-line overlays, cyberpunk neon) — that reads as costume, not identity. The goal is instrument authenticity (clean, legible, functional readouts) not movie UI.

### 2.8 Color tokens — accessible amber-phosphor system
Concrete, contrast-aware starting palette (verify actual rendered contrast in Phase 1, these are starting values):

| Role | Hex | Use |
|---|---:|---|
| Background | `#0a0704` | Page background |
| Surface | `#1a1208` | Panel/box backgrounds |
| Dim text | `#8a6a2a` | Secondary/metadata text, status-line labels |
| Primary text | `#ffb000` | Body copy, primary accent |
| Bright accent | `#ffcc33` | Links, focus states, active nav |
| Success/secondary | `#4a9d5f` (muted green) | Secondary accent — counter increments, "online" states |
| Highlight | `#fff5cc` | Rare emphasis only |

One accent family (amber, one green secondary) replaces the current three-way fight between purple gradient, amber counter, and neon-green border. Every color pairing gets a real contrast check (target 4.5:1 body text, 3:1 large text/UI) in Phase 1 before it ships — "amber on near-black" is usually fine but the *dim* tone needs verification since it's the one most likely to fail against a near-black background.

### 2.9 Image optimization (Astro 6, `astro:assets`)
Current site has almost no imagery (favicon, one static `og-image.png`). If the redesign adds any real images (a portrait, a ScanEagle photo, project screenshots):
- Put source images in `src/`, use `astro:assets`'s `<Image />` component — Astro auto-generates responsive, optimized output (AVIF/WebP) instead of hand-rolled `srcset`.
- Explicit width/height (or let `<Image />` infer them) to avoid layout shift (protects the CLS budget in 2.4).
- Icons/logos stay SVG; only `public/` for assets that intentionally skip processing (favicons, the existing static OG fallback).
- Lazy-load anything below the fold; eager-load only a true hero/LCP image.

### 2.10 OG image generation
Current site has one static `og-image.png` shared across every page. Two options:
- **Keep it simple (recommended for this scope):** one well-designed static OG image in the new Flight Log style, shared site-wide. Zero build complexity, zero new dependencies — fits the "don't add upkeep" theme running through this whole revision.
- **Per-page dynamic OG images:** Astro + Satori + resvg generated at *build time* (not runtime — the site is fully static, so this stays consistent with zero-SSR). Gives each page (home/about/projects) its own titled social card. Nice-to-have, not required — flag as a Phase 5 stretch goal only if time allows, not a blocker to launch.

---

## 3. Content Architecture

Six pages + 404 (down from seven — `/now` is dropped by decision, see Section 2.2). Redesign is visual + structural polish plus this one scope cut, not an expansion.

| Page | Keep as-is | Change |
|---|---|---|
| **Home** | Core narrative ("oldest of seven, Marine turned drone operator...") | Rebuild as flight-log hero + bento-style "short version" facts instead of a plain bulleted list; drop marquee |
| **About** | All content (bio, vitals) | Restyle; add one current-status line (what has Jesse's attention right now) to absorb the one honest thing `/now` was doing, without becoming a page that needs its own maintenance habit |
| ~~Now~~ | — | **Removed.** Was stale anyway (still reads pre-June-2026 in September); dropping it removes an upkeep obligation rather than fixing content that will just go stale again |
| **Projects** | Nova / Sardonyx / temperat.io | Keep; consider one-line "status" per project (live, deploying, sunset) for the projects-first pattern research calls out |
| **Uses** | Structure | Has three open TODOs (Mac/monitor/keyboard, editor/terminal, nothing on cameras/flight gear) — needs Jesse's input to finish, listed in open questions |
| **Links/webring** | Concept | Keep — small-web webring linking is a genuine, current IndieWeb practice, not dated retro |
| **Guestbook** | giscus-backed | Keep as-is; it's the one interactive/social element and it's already zero-tracking |
| **404** | Custom branded page | Keep, restyle to match new system |

---

## 4. Visual Design System

### 4.1 Direction: "Flight Log" (dark instrument-panel minimalism)
- **Palette:** near-black background (`#0a0d0a` range) with a single phosphor accent — amber (`#ffb000`-ish, matching the existing counter) as primary accent, a muted green as secondary/success state. One accent family, not purple gradient + amber counter + neon green border all competing (current site has this exact problem — three accent systems fighting).
- **Typography:** one strong monospace or monospace-adjacent display face for headings/labels (instrument-panel feel), one clean readable sans/serif for body copy. Two-typeface system max, per the minimal-editorial research.
- **Signature motif:** flight/mission-log framing — section headers as log entries, a subtle "status line" (bearing/altitude/timestamp-style metadata) as a recurring visual anchor across pages, real visitor counter kept and restyled as an odometer instrument.
- **Drop:** the `<marquee>`-style scrolling banner and any `blink` animation. These are the actual "dated 90s" markers research flags as failing both the accessibility bar (motion-only, no pause) and the "signature idea vs generic trope" test. The h-card badges (`EST. 1995`, `MADE BY HAND`, `NO TRACKERS`, `100% ME`) can stay — they're honest, static, and on-brand.

### 4.2 Interaction
- Scroll-triggered reveals for section entry (CSS + IntersectionObserver), respecting `prefers-reduced-motion`.
- Astro View Transitions for cross-page nav continuity (nav label / instrument readout morphs rather than hard page-cuts).
- Hover/focus micro-interactions on nav items and project cards — small, purposeful, not decorative.

---

## 5. Technical Plan

- **Framework:** Keep Astro 6 (already upgraded on the `harden/security-headers-astro6` branch — that work should merge to `main` before or as part of this redesign, not get lost).
- **Rendering:** Stay fully static, zero client JS framework. Current JS footprint is effectively just the giscus guestbook iframe — preserve that.
- **Hosting/deploy:** Keep Vercel — already correctly linked to the right project/scope after the June deployment-mismatch fix; no reason to touch this.
- **Security headers/CSP:** Keep and re-verify after the redesign — the existing `vercel.json` CSP is already tightly scoped (self + giscus only); any new inline scripts/styles for motion must stay CSP-compliant (prefer CSS-only where possible to avoid CSP churn).
- **Counter:** Keep `/api/counter.js` (Upstash-backed, bot-filtered, real) — restyle its SVG output to match the new instrument-panel palette. This is a genuinely good, rare feature (a *real* counter, not a decorative one) and directly supports the "no trackers, hand-coded" brand.
- **New additions:**
  - `/llms.txt` — curated AI-crawler page map (Section 2.3), listing About/Projects/Uses/Links/Guestbook.
  - One-line current-status sentence added to About, replacing the removed `/now` page (Section 3).
  - Skipping webmentions and a writing/digital-garden section by decision (Section 2.2) — not carried forward as future work unless content demand actually shows up.
- **Removals:** delete `src/pages/now.astro`, its nav entry in `BaseLayout.astro`, and its sitemap/llms.txt references.

---

## 6. Remaining Open Question

Everything else is decided (Flight Log direction, 6-page scope, wipe = design/content not infra, `harden/security-headers-astro6` merges first). One item genuinely needs Jesse, not research — it's his desk, not a best-practice lookup:

1. **`/uses` page TODOs** — which Mac/monitor/keyboard/desk setup, which editor/terminal/shell, and (optional, fun crossover detail) any flight-relevant gear worth listing (radios, GCS hardware)? Can ship without this (leave TODOs as-is a little longer) if Jesse wants to keep moving — it's not a launch blocker, just an accuracy gap on one page.

---

## 7. Phased Execution Plan (once direction is confirmed)

- **Phase 0 — Housekeeping:** merge `harden/security-headers-astro6` → `main`, confirm build is green, branch redesign work from clean `main`.
- **Phase 1 — Design system:** new palette/typography/tokens in `global.css`, restyle `BaseLayout.astro` (drop marquee/blink, keep h-card + badges), rebuild nav as instrument-panel style.
- **Phase 2 — Page-by-page rebuild:** home (bento + flight-log hero), about, projects, links, 404 — visual rebuild only, content mostly preserved per Section 3.
- **Phase 3 — Content refresh:** delete `/now` page + nav entry, add its one-liner to About, fill `/uses` TODOs (needs Jesse's input, non-blocking).
- **Phase 4 — Motion pass:** IntersectionObserver reveals + View Transitions, `prefers-reduced-motion` fallback, counter SVG restyle.
- **Phase 5 — QA/launch:** Lighthouse/axe pass against the budget in Section 2.4/2.5, `/llms.txt` added, verify CSP still passes with any new inline styles, deploy, verify live on `www.jesse-wunderlich.com`.

Each phase ships as its own PR against `main` (small, reviewable, revertible) rather than one giant rewrite commit — consistent with standing engineering discipline (new commits, verify before claiming done, full lint/typecheck/test pass per PR).

---

## 8. What This Plan Deliberately Does NOT Do

- Does not add a JS framework (React/Vue/etc.) — no reason to pay that performance cost for a mostly-static personal site.
- Does not add third-party analytics/trackers — the real self-hosted counter already does the one honest thing a counter should do.
- Does not chase WebGL/scroll-jacking "wow" effects — research is consistent that these hurt performance/accessibility and read as dated faster than restrained minimal design.
- Does not touch the guestbook (giscus) integration — it works, it's zero-tracking, out of scope.
- Does not rewrite git history or delete the Vercel project — "fresh" means the experience, not the infrastructure.
