# Omar Hosam Portfolio Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Establish the Omar Hosam portfolio design-system foundation (PRODUCT.md, DESIGN.md, validated shadcn theme, primitives, verification page) from the Open Design Creator Broadcast Pipeline system.

**Architecture:** Astro static site with React islands for shadcn/ui; Tailwind v4 CSS variables (OKLCH) map Open Design tokens into a full light/dark shadcn theme; impeccable PRODUCT.md + DESIGN.md + `.impeccable/design.json` sidecar document the world.

**Tech Stack:** Astro 7, React 19, Tailwind CSS 4, shadcn/ui (base-nova), bun, Syne / IBM Plex Sans / IBM Plex Mono / Noto Sans Arabic (fontsource)

## Global Constraints

- Kinetic orange ONLY for state / progress / one primary action / interruption
- Arabic never compressed into Latin tracking (RTL, zero letter-spacing)
- Flat by default; shadows only for functional overlap
- No gradients, glass, fabricated metrics
- Existing `post-production/` remains untouched
- WCAG AA on all shadcn base/foreground pairs (22/22 pass)

---

### Task 1: Scaffold Astro portfolio

**Files:**
- Create: `portfolio/` (Astro minimal)
- Modify: `portfolio/astro.config.mjs`, `portfolio/tsconfig.json`
- Create: `portfolio/src/styles/global.css`, `portfolio/src/layouts/Layout.astro`, `portfolio/src/lib/utils.ts`

- [x] **Step 1:** `bunx create-astro@latest portfolio --template minimal --typescript strict --install --no-git --yes`
- [x] **Step 2:** Install React, Tailwind v4, fonts, CVA/clsx/tailwind-merge, tw-animate-css
- [x] **Step 3:** Wire Vite Tailwind plugin + React integration + `@/*` paths
- [x] **Step 4:** Layout with fontsource imports

### Task 2: PRODUCT.md (impeccable init)

**Files:**
- Create: `portfolio/PRODUCT.md`

- [x] **Step 1:** Run `context.mjs --target portfolio`
- [x] **Step 2:** Write PRODUCT.md (platform web, stack Astro delegated, honesty constraint, brand commitments, undecided IA/deploy)

### Task 3: shadcn theme from Open Design tokens

**Files:**
- Create: `portfolio/tmp/theme.json` (hex for contrast checker)
- Modify: `portfolio/src/styles/global.css`
- Create: `portfolio/scripts/self-check.ts`

- [x] **Step 1:** Map OD OKLCH → shadcn tokens (light paper / dark code-surface)
- [x] **Step 2:** Convert to HEX via culori; write `tmp/theme.json`
- [x] **Step 3:** `python3 check_contrast.py` → 22/22 pass
- [x] **Step 4:** Export OKLCH `:root` / `.dark` + `@theme inline` into `global.css`
- [x] **Step 5:** Add `bun run self-check`

### Task 4: shadcn primitives

**Files:**
- Create: `portfolio/components.json`
- Create: `portfolio/src/components/ui/{button,card,input,badge,separator}.tsx`
- Modify: `portfolio/src/components/ui/button.tsx` (44px default, kinetic hover)

- [x] **Step 1:** `bunx shadcn@latest init --defaults`
- [x] **Step 2:** Restore theme tokens after init overwrite (remove Geist)
- [x] **Step 3:** `add button card input badge separator`
- [x] **Step 4:** Align primary hover + 44px target height to brand

### Task 5: DESIGN.md + sidecar

**Files:**
- Create: `portfolio/DESIGN.md`
- Create: `portfolio/.impeccable/design.json`

- [x] **Step 1:** Port Creator Broadcast Pipeline into canonical DESIGN.md sections
- [x] **Step 2:** Write schemaVersion 2 sidecar (ramps, motion, 7 ds- components)

### Task 6: Verification page + QA

**Files:**
- Create: `portfolio/src/components/ThemeShowcase.tsx`
- Modify: `portfolio/src/pages/index.astro`

- [x] **Step 1:** Light + dark showcase of all primitives + bilingual lockup + mark
- [x] **Step 2:** `bun run self-check` + `bun run build` pass
- [x] **Step 3:** Browser QA desktop 1440 + mobile 390; fix Live badge to quiet field + orange dot
- [x] **Step 4:** `detect.mjs` → no findings

### Task 7: Plan record

- [x] **Step 1:** Save this implementation record

---

## Delta summary (shipped)

| Area | Result |
|------|--------|
| Primary | Kinetic orange `oklch(61.7% 0.205 37.4)` / `#E54600`, ink foreground |
| Surfaces | Paper light / code-surface dark; tinted cards (no pure #fff/#000) |
| Fonts | Syne (display), IBM Plex Sans, IBM Plex Mono, Noto Sans Arabic |
| Radius | `0.625rem` (10px controls) |
| Contrast | 22/22 WCAG AA pairs |
| Primitives | button, card, input, badge, separator |
| Verify | `/` light+dark panel; `bun run self-check` |
