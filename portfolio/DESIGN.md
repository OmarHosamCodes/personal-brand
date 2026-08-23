---
name: Omar Hosam Portfolio
description: Technical editorial portfolio identity — Creator Broadcast Pipeline on web.
colors:
  paper: "oklch(98.5% 0 89.9)"
  surface: "oklch(97.8% 0.002 89.9)"
  ink: "oklch(17.8% 0 89.9)"
  muted: "oklch(52.1% 0.008 88.7)"
  border: "oklch(92.8% 0.006 264.5)"
  kinetic-orange: "oklch(61.7% 0.205 37.4)"
  kinetic-orange-hover: "oklch(68% 0.19 37.4)"
  soft-surface: "oklch(96.5% 0.006 264.5)"
  code-surface: "oklch(13% 0.005 264)"
  camera-surface: "oklch(26% 0.007 264)"
  dark-muted: "oklch(72% 0.006 89.9)"
  border-dark: "oklch(30% 0.006 264)"
typography:
  display:
    fontFamily: '"Syne Variable", "Avenir Next", "Segoe UI", sans-serif'
    fontSize: "clamp(44px, 8.2vw, 112px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline:
    fontFamily: '"Syne Variable", "Avenir Next", "Segoe UI", sans-serif'
    fontSize: "clamp(28px, 3.2vw, 44px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Syne Variable", "Avenir Next", "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"IBM Plex Sans Variable", "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
  arabic-signature:
    fontFamily: '"Noto Sans Arabic Variable", Tahoma, sans-serif'
    fontSize: "clamp(32px, 5vw, 70px)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
rounded:
  sm: "6px"
  control: "10px"
  card: "10px"
  surface: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  2xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.kinetic-orange}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.kinetic-orange-hover}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  live-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "7px"
    padding: "8px 10px"
---

# Design System: Omar Hosam Portfolio

## Overview

**Creative North Star: "The Creator Broadcast Pipeline"**

The portfolio inherits Omar Hosam's technical editorial identity: a near-white working surface, near-black framing, cool-gray structure, compact technical typography, and one kinetic orange signal. Interfaces stay calm so authored moments — mark, bilingual lockup, primary action — remain recognizable.

Engineering reads as deliberate systems craft. Egyptian and Arabic point of view is carried by typography and rhythm (Syne + IBM Plex + Noto Sans Arabic), never by decorative cultural shorthand.

**Key Characteristics:**

- High-contrast, technical editorial composition
- One orange accent reserved for state, progress, and primary action
- Compact Latin display type paired with comfortably led Arabic
- Flat surfaces, fine rules, and selective structural depth
- One forward-building motion language derived from the mark
- shadcn/ui primitives themed to the broadcast tokens (light + dark)

## Colors

The palette preserves the supplied near-white, near-black, gray, and orange identity. Surfaces are subtly tinted (never pure white or black) for shadcn theme quality while staying true to the Open Design source.

### Primary

- **Kinetic Orange** (`oklch(61.7% 0.205 37.4)` / `#E54600`): Slash geometry, live indicators, progress, the one primary action, and interruption states. Hover (`oklch(68% 0.19 37.4)`) is a state change, not a second brand accent.

### Neutral

- **Paper** (`oklch(98.5% 0 89.9)`): Default light canvas (`--background`)
- **Surface** (`oklch(97.8% 0.002 89.9)`): Cards, popovers, reversed text on dark
- **Ink** (`oklch(17.8% 0 89.9)`): Primary text, structural frames, active navigation, terminal dot
- **Muted** (`oklch(52.1% 0.008 88.7)`): Supporting copy and inactive controls
- **Border** (`oklch(92.8% 0.006 264.5)`): Fine dividers and quiet component boundaries
- **Soft Surface** (`oklch(96.5% 0.006 264.5)`): Hover fills, secondary/muted/accent surfaces
- **Code Surface** (`oklch(13% 0.005 264)`): Dark-mode canvas (broadcast night)
- **Camera Surface** (`oklch(26% 0.007 264)`): Dark secondary/muted fills

**The One Signal Rule.** Orange is kinetic, not decorative. Use it to communicate live state, progress, one primary action, or a deliberate interruption; otherwise ration it.

**The Full-Field Exception.** A full orange background is reserved for high-recognition interruption states. It is not a routine content background.

## Typography

**Display Font:** Syne Variable (with Avenir Next / Segoe UI fallbacks)  
**Body Font:** IBM Plex Sans Variable (with Segoe UI fallback)  
**Label/Mono Font:** IBM Plex Mono (with SFMono-Regular / Consolas fallbacks)  
**Arabic Signature Font:** Noto Sans Arabic Variable (with Tahoma fallback)

**Character:** Syne gives headlines a compact, assertive silhouette; IBM Plex Sans keeps explanations calm; IBM Plex Mono makes state and metadata easy to scan. Arabic is a first-class signature with its own rhythm, direction, and leading.

### Hierarchy

- **Display** (600, `clamp(44px, 8.2vw, 112px)`, 0.9, -0.03em): Hero names and decisive headlines. Keep lines short.
- **Headline** (600, `clamp(28px, 3.2vw, 44px)`, 1.08, -0.02em): Page and section headings.
- **Title** (600, 18px, 1.1, -0.01em): Compact section titles.
- **Body** (400, 15px, 1.55): Explanations; prefer ~30–65ch measure.
- **Label** (500, 11px, 1, 0.08em): Uppercase status, metadata, technical identifiers.
- **Arabic Signature** (600, `clamp(32px, 5vw, 70px)`, 1.35, 0): عمر حسام on its own RTL, right-aligned line.

**The Separate Rhythm Rule.** Do not compress Arabic into Syne's tight Latin rhythm. Set `lang="ar"`, use right-to-left direction, keep letter spacing at zero, and give the Arabic name its own comfortably led line or block.

**The Short Display Rule.** Large Syne headlines are terse and architectural. Move explanations into body copy.

## Layout

Portfolio foundation uses a calm content column (max ~72rem), generous section gaps on a 4px base grid, and safe margins so mark/framing elements never collide with essential copy. Responsive behavior should stack navigation and tighten padding below ~760px without inventing a second visual language.

Prefer established spacing steps (`4 / 8 / 12 / 18 / 22 / 28px`) over one-off gaps.

## Elevation & Depth

The system is flat by default. Near-white and near-black planes, fine cool-gray dividers, overlap, and proportion carry most hierarchy. No gradients, glass effects, or ambient decorative glows.

### Shadow Vocabulary

- **Stage lift** (`0 20px 48px` tinted near-black ~12%): Framed preview / elevated panels only
- **Card lift** (composed `--shadow` / `--shadow-md`): Functional overlap, not resting chrome

**The Structural Depth Rule.** Apply shadow only where one functional layer overlaps another. Resting controls, navigation, and ordinary cards remain flat (border + tone).

## Shapes

Gently compact radii: ~7–12px for badges, cards, controls; 16px for larger surfaces. Global shadcn `--radius` is `0.625rem` (10px). Dots are circular. The mark geometry stays intact: 48×48 view box; ink terminal at `(8, 32)` r=`6`; slash one `line (16,46)→(28,18)`; slash two `line (28,46)→(40,18)`; stroke width `4` with round caps.

**The Intact Mark Rule.** The dot and both slashes are one indivisible signature. Animation may sequence their arrival; layout and color may not separate them.

## Components

### Buttons

- **Shape:** 10px radius (`rounded-lg` / control), 44px minimum height
- **Primary:** Kinetic-orange fill, ink text, matching border; hover uses kinetic-orange-hover; once per decision cluster
- **Secondary / Outline:** White or soft surface, ink text, quiet border; hover to soft surface
- **Focus:** Kinetic-orange ring (`--ring`) with visible offset

### Badges / Live chip

- White (or card) field, ink mono label, optional orange status dot, ~7px radius, 8×10px padding

### Cards

- Card surface, 8–12px radii, border for quiet separation, shadow only for functional overlap
- Internal padding 16–20px

### Inputs

- Stroke border, surface/background fill, control radius
- Focus: kinetic-orange ring; error uses destructive without inventing a second accent language

### Navigation

- Plain-language labels; selected state may reverse to ink with surface text and an orange status cue
- Mobile: sticky horizontal strip when vertical rail is impractical

### Mark and bilingual lockup

- Primary mark: ink terminal + two kinetic-orange rising slashes
- Latin lockup: Syne semibold, compact leading, slight negative tracking
- Arabic lockup: عمر حسام in its own RTL block with comfortable leading

## Do's and Don'ts

### Do:

- **Do** use orange for live state, progress, one primary action, or a deliberate interruption
- **Do** keep Arabic on its own right-to-left, comfortably led line or block
- **Do** keep resting UI flat; reserve shadow for functional overlap
- **Do** retain keyboard navigation, 44px targets, visible focus, and reduced-motion settle behavior
- **Do** theme shadcn primitives from these tokens — do not introduce a second palette

### Don't:

- **Don't** recolor individual mark pieces or use orange as routine decoration / default content background
- **Don't** force Arabic into Latin tracking, leading, alignment, or typeface conventions
- **Don't** add gradients, glass effects, ornamental jargon, or decorative shadows
- **Don't** fabricate metrics, customers, testimonials, audience claims, or technical proof
- **Don't** use Geist, Inter, or other default stacks as the brand voice
