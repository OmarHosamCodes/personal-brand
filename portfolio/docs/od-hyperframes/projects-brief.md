# Portfolio animated hyperframes — project briefs

Replace the four static Broadcast case cards with three autoplaying **1:1 product-native** UI showcases.

## Hyperframe contract (all three)

- **Canvas:** strict **1:1** square; scale-to-fit inside an iframe (`aspect-square`)
- **Self-contained:** single HTML file, no build step, no external app server
- **Autoplay loop:** ~10–16s cycle, seamless restart; GSAP or CSS timeline
- **No prototype chrome:** omit director bars, play/pause transport, module toggles — portfolio cards autoplay only
- **`prefers-reduced-motion`:** freeze on the strongest static hero frame; disable loop
- **A11y:** `pointer-events: none` on animated stage; meaningful `<title>`; no fabricated metrics/testimonials
- **Branding:** use **each product’s own tokens** inside the iframe — portfolio Broadcast orange stays outside in the card shell

Deliverable filenames:
1. `frame-ogm-reimagined.html`
2. `frame-brainiac.html`
3. `frame-atoms.html`

---

## 1. frame-ogm-reimagined.html — Tribe IT (community + admin in ONE loop)

**Sources**
- Local monorepo: `/home/omar/Projects/ogm-reimagined` (Tribe IT)
- OD admin recreation: project `4bb1261d-0bcd-4d4c-9b2b-60955dbfb24f` (`dashboard.html`, etc.)
- OD community tour motion language: `community-product-tour-hyperframes`

**Scene beats (single square stage, crossfade/push)**
1. Community Home — Skool-class chrome: spaces rail, composer, one post row
2. Learn — course module list + lesson progress chip
3. Live — live room entry state
4. Admin Command Center — attention band + metric strip + queue item highlight
5. Loop back

**Copy**
- Display name: **Tribe IT** (repo: ogm-reimagined)
- Problem: Creators need community, courses, live, and ops in one platform—not disconnected tools
- Stack: Next.js · tRPC · Turbo · PostgreSQL · Capacitor
- Outcome: Full-stack creator platform spanning member app and operator admin

**MUST:** both member community AND operator admin appear in the same square loop.

---

## 2. frame-brainiac.html — Orch

**Sources**
- Local: `/home/omar/Projects/brainiac` — PRODUCT.md, DESIGN.md
- OD imported prototype: `16b2b6df-1980-4f32-82b4-045e5deac589`

**Scene beats**
1. Canvas — spatial board with 2–3 nodes; subtle pan; one node expands
2. Agent composer — bottom dock streams a proposal card (Approve/Reject — no fake “magic” glow)
3. Agency tracker — timer bar + My Tasks rail tick
4. Loop

**Copy**
- Display name: **Orch**
- Problem: Knowledge work sprawls across docs and ops tools without a shared spatial model
- Stack: React · Hono · oRPC · PostgreSQL
- Outcome: Canvas + agency ops + embedded agent in one workspace

**Aesthetic:** quiet instrument (Orch DESIGN.md). Anti-refs: purple AI slop, neon glows, SaaS-cream templates, violet-as-wallpaper.

---

## 3. frame-atoms.html — Atoms Academy

**Sources**
- Local: `/home/omar/Projects/atoms`
- OD reference: `atoms-hero-a-lms-walkthrough-290a` (`atoms-lms-path-hero.html`)

**Scene beats** (RTL Arabic UI)
1. Topics / course hub
2. Lecture player frame
3. Homework submission state
4. Timed exam countdown chip
5. Loop

**Copy**
- Display name: **Atoms Academy**
- Problem: Arabic-first LMS needs lecture, homework, and exam flows in one journey
- Stack: Next.js · Supabase · Cloudflare Stream
- Outcome: Production LMS at atoms.academy

Use real Arabic labels; Almarai + product green lab palette; no lorem.
