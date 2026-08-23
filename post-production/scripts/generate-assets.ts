#!/usr/bin/env bun
/**
 * Generate launcher icons + animated splash preview from the OD mark.
 */
import { mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const desktop = join(root, "assets/desktop");
const icons = join(desktop, "icons");
const fontsSrc = join(root, "ui/public/fonts");
const fontsDst = join(desktop, "fonts");

mkdirSync(icons, { recursive: true });
mkdirSync(fontsDst, { recursive: true });

for (const f of ["Syne.ttf", "IBMPlexSans.ttf", "IBMPlexMono.ttf"]) {
  const src = join(fontsSrc, f);
  if (existsSync(src)) copyFileSync(src, join(fontsDst, f));
}

const iconSvg = join(desktop, "icon.svg");
const sizes = [16, 24, 32, 48, 64, 128, 256, 512];

for (const size of sizes) {
  const out = join(icons, `omar-hosam-post-${size}.png`);
  const proc = Bun.spawnSync(
    ["magick", "-background", "none", iconSvg, "-resize", `${size}x${size}`, out],
    { stdout: "inherit", stderr: "inherit" },
  );
  if (proc.exitCode !== 0) throw new Error(`icon ${size} failed`);
}

// hicolor-friendly copy
copyFileSync(join(icons, "omar-hosam-post-512.png"), join(desktop, "omar-hosam-post.png"));

// Animated mark GIF (logo) from sequenced frames
const framesDir = join(desktop, "frames");
mkdirSync(framesDir, { recursive: true });

const frames = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#121214"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#121214"/><g transform="translate(56 56) scale(8.333)"><circle cx="8" cy="32" r="6" fill="#f5f5f5"/></g></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#121214"/><g transform="translate(56 56) scale(8.333)"><circle cx="8" cy="32" r="6" fill="#f5f5f5"/><line x1="16" y1="46" x2="28" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/></g></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#121214"/><g transform="translate(56 56) scale(8.333)"><circle cx="8" cy="32" r="6" fill="#f5f5f5"/><line x1="16" y1="46" x2="28" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/><line x1="28" y1="46" x2="40" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/></g></svg>`,
];

const framePngs: string[] = [];
for (let i = 0; i < frames.length; i++) {
  const svgPath = join(framesDir, `frame-${i}.svg`);
  const pngPath = join(framesDir, `frame-${i}.png`);
  await Bun.write(svgPath, frames[i]!);
  Bun.spawnSync(["magick", "-background", "none", svgPath, pngPath], {
    stdout: "inherit",
    stderr: "inherit",
  });
  framePngs.push(pngPath);
}

// Hold final frame longer
const animArgs = [
  "magick",
  "-delay",
  "12",
  framePngs[0]!,
  "-delay",
  "10",
  framePngs[1]!,
  "-delay",
  "10",
  framePngs[2]!,
  "-delay",
  "80",
  framePngs[3]!,
  "-loop",
  "0",
  join(desktop, "logo-animated.gif"),
];
Bun.spawnSync(animArgs, { stdout: "inherit", stderr: "inherit" });

// Splash still for store/docs
Bun.spawnSync(
  [
    "magick",
    "-size",
    "1280x800",
    "xc:#070707",
    "(",
    join(icons, "omar-hosam-post-256.png"),
    ")",
    "-gravity",
    "center",
    "-compose",
    "over",
    "-composite",
    join(desktop, "splash-still.png"),
  ],
  { stdout: "inherit", stderr: "inherit" },
);

console.log("Generated icons + animated logo in", desktop);
