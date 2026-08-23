---
name: Omar Hosam Post-Production
description: Dark Operate finishing studio for framed OBS takes inside the Creator Broadcast Pipeline.
colors:
  bg: "#070707"
  panel: "oklch(17% 0.006 264)"
  panel-lift: "oklch(20% 0.007 264)"
  ink: "oklch(96% 0 89.9)"
  muted: "oklch(72% 0.006 89.9)"
  faint: "oklch(100% 0 89.9 / 0.55)"
  border: "oklch(100% 0 89.9 / 0.12)"
  border-strong: "oklch(100% 0 89.9 / 0.28)"
  accent: "oklch(61.7% 0.205 37.4)"
  accent-hover: "oklch(68% 0.19 37.4)"
  accent-soft: "oklch(61.7% 0.205 37.4 / 0.16)"
  danger: "oklch(72% 0.17 25)"
typography:
  display: '"Syne", "Avenir Next", "Segoe UI", sans-serif'
  body: '"IBM Plex Sans", "Segoe UI", sans-serif'
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
---

# Design System: Post-Production Studio

## Overview

**Creative North Star:** A dark finishing machine on the Creator Broadcast stage — drop a framed take, watch the orange blade work, leave with a publish-ready file.

Full dark shell (`#070707`), panel surfaces, kinetic orange as the only action/progress signal. Syne + IBM Plex. No purple, glass chrome, or light paper canvas.

## Mode

Operate. Motion thesis: **broadcast-machine** — mark-sequence brand open, drop accept blade sweep, processing blade loop, View Transitions between idle/ready/done when supported. Routine controls stay ≤180ms.

## Components

- **Drop stage:** dark code grid (drifting), strong rule border, stage shadow, accept/processing blade overlays.
- **Primary button:** kinetic orange on near-black ink label; busy shimmer while processing.
- **Inspector:** dark panel with toggles, silence segments, staged progress dots.
- **Focus:** 3px orange outline, 3px offset.

## Accessibility

`prefers-reduced-motion` kills grid drift, blades, mark sequence, and shimmers; settles to final states.
