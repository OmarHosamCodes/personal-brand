# Omar Hosam — Post-Production Studio

Local finishing tool for framed OBS recordings: denoise, smart silence trim, optional brand intro/outro.

## Requirements

- [Bun](https://bun.sh) 1.1+
- `ffmpeg` and `ffprobe` on `PATH`
- Chrome/Chromium recommended (App window from the launcher)
- Optional: place an `arnndn` model at `assets/models/cb.rnnn` (falls back to `afftdn` if missing)

## Install (Linux App Launcher)

```bash
cd post-production
bun install
bun run install:linux
```

This installs:

- App: **Omar Hosam Post-Production** in your Activities / App Grid
- Command: `omar-post-production` (`~/.local/bin`)
- Files: `~/.local/share/omar-hosam-post`
- Icons + animated logo: mark sequence GIF and splash from the Open Design brand mark

Launch from the menu or:

```bash
omar-post-production
```

Exports write to `~/Videos/Omar Hosam/processed/<name>-ready.mp4`.

### Portable / another machine

Copy `~/.local/share/omar-hosam-post` anywhere, set `OMAR_POST_HOME` to that folder, and run `bin/omar-post-production` (Bun required unless the compiled `bin/omar-post-server` is present for the same OS/arch).

## Dev

```bash
bun install
bun run dev:server   # API http://127.0.0.1:8787
bun run dev:ui       # UI  http://127.0.0.1:5173
bun run assets       # regenerate icons / animated logo
bun run self-check
```

## Pipeline

1. Probe aspect → horizontal or vertical brand assets  
2. Denoise audio (`arnndn` or `afftdn`) + loudnorm  
3. Smart silence cut (A/V in sync, padded speech edges)  
4. Concat matching intro/outro preview MP4s when enabled  

Brand media lives in `assets/brand/intro/` (from Open Design Omar Personal Brand renders). Desktop splash/logo assets live in `assets/desktop/`.
