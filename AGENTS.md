## Learned User Preferences

- Prefer Astro for the personal portfolio (over Next.js or Vite SPA).
- Keep Creator Broadcast Pipeline branding (Syne / IBM Plex / kinetic orange); portfolio site is dark-only (no light theme or theme toggle).
- Portfolio conversion mix: freelance, consultation, and training (1:1 and 1:many); optimize primarily for startup founders / clients.
- Portfolio site English-only; contact section includes intent-based form with deep-links plus listed email, phone, and socials.
- Design featured project case studies in Open Design first (1:1 hyperframes); ship hero layout C (chosen after evaluating all three in OD).
- Hero chrome stays minimal: brand wordmark (mark ink/slashes stand in for O/H), offer chips + CTAs only — no location, title line, or supporting subhead; site header is mark-only (no name text).
- Hero motion: React Bits `CurvedLoop` full-width behind the borderless portrait for "Software Engineer" (logo-circle separators, slower speed); always respect `prefers-reduced-motion`.
- Soft social proof only when real; never fabricate testimonials or metrics.
- Hero portrait keeps the original studio photo with background intact (no background removal); rim light stays photographic only — do not CSS-retheme the brand accent away from kinetic orange.
- Post-production v1 input is one finished (already framed) OBS recording — not raw webcam/screen compositing.
- When implementing an attached plan, do not edit the plan file; mark existing todos in progress rather than recreating them.

## Learned Workspace Facts

- Workspace root has sibling apps: `portfolio/` (Astro + React islands + Tailwind v4 + shadcn) and `post-production/` (Vite UI + Bun/Hono + ffmpeg).
- Visual source of truth is Open Design **Omar Hosam Design system** (Creator Broadcast Pipeline); related OD project **Omar Personal Brand** holds live frames and intro/outro renders.
- Intended custom domain for the portfolio is `omarhosamcodes.com` (deploy target undecided).
- Canonical brand mark: 48×48 viewBox; ink terminal at `(8,32)` r=`6`; orange slashes `(16,46)→(28,18)` and `(28,46)→(40,18)`, stroke width 4, round caps (`portfolio/src/components/BrandMark.tsx`, `post-production/assets/desktop/mark.svg`).
- Planned one-pager sections: Hero, Selected work, Experience/timeline, About/POV, Contact, Social proof.
- Featured selected work: Tribe IT (`ogm-reimagined`), Orch (`brainiac`), Atoms Academy (`atoms`); hyperframes live under `portfolio/public/frames/` with sources in `portfolio/docs/od-hyperframes/`.
- Linux App Launcher package: `omar-post-production` → `~/.local/share/omar-hosam-post`; exports to `~/Videos/Omar Hosam/processed/`.
- Portfolio product/design docs: `portfolio/PRODUCT.md`, `portfolio/DESIGN.md`, and `portfolio/.impeccable/design.json`.
- Portfolio ships AgentReady surfaces (per agentready.org), security headers, and optimized favicon/manifest assets.
