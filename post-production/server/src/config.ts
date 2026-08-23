import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

function resolveRoot(): string {
  if (process.env.OMAR_POST_HOME && existsSync(process.env.OMAR_POST_HOME)) {
    return process.env.OMAR_POST_HOME;
  }
  // Installed layout: <share>/app/server/… → share root is ../..
  const fromModule = join(dirname(fileURLToPath(import.meta.url)), "../..");
  if (existsSync(join(fromModule, "assets/brand/intro"))) return fromModule;
  // Compiled binary next to share: <share>/bin/omar-post → <share>
  const execDir = dirname(process.execPath);
  const beside = join(execDir, "..");
  if (existsSync(join(beside, "assets/brand/intro"))) return beside;
  if (existsSync(join(execDir, "assets/brand/intro"))) return execDir;
  return fromModule;
}

export const ROOT = resolveRoot();
export const ASSETS = join(ROOT, "assets/brand/intro");
export const MODELS = join(ROOT, "assets/models");
export const WORK = join(ROOT, "tmp/jobs");
export const UI_DIST = join(ROOT, "ui/dist");
export const DESKTOP_ASSETS = join(ROOT, "assets/desktop");
export const EXPORT_DIR = join(homedir(), "Videos/Omar Hosam/processed");

export const INTRO = {
  horizontal: join(ASSETS, "omar-hosam-intro-horizontal-preview.mp4"),
  vertical: join(ASSETS, "omar-hosam-intro-vertical-preview.mp4"),
} as const;

export const OUTRO = {
  horizontal: join(ASSETS, "omar-hosam-outro-horizontal-preview.mp4"),
  vertical: join(ASSETS, "omar-hosam-outro-vertical-preview.mp4"),
} as const;

export const PORT = Number(process.env.PORT ?? 8787);
export const OPEN_UI = process.env.OMAR_POST_OPEN === "1";

export type Aspect = "horizontal" | "vertical";
export type SilenceMode = "tight" | "balanced" | "loose";

export type JobOptions = {
  denoise: boolean;
  silence: boolean;
  intro: boolean;
  outro: boolean;
  silenceMode: SilenceMode;
};

export const SILENCE_PRESETS: Record<
  SilenceMode,
  { noiseDb: number; minSilence: number; pad: number }
> = {
  tight: { noiseDb: -35, minSilence: 0.3, pad: 0.15 },
  balanced: { noiseDb: -40, minSilence: 0.45, pad: 0.28 },
  loose: { noiseDb: -45, minSilence: 0.7, pad: 0.4 },
};
