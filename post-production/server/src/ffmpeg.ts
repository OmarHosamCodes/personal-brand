import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { MODELS } from "./config";

export type Probe = {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  hasVideo: boolean;
};

export async function run(
  args: string[],
  opts?: { cwd?: string; allowFail?: boolean },
): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["ffmpeg", ...args], {
    cwd: opts?.cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0 && !opts?.allowFail) {
    throw new Error(`ffmpeg failed (${code}): ${stderr.slice(-1200)}`);
  }
  return { code, stdout, stderr };
}

export async function ffprobeJson(path: string): Promise<Probe> {
  const proc = Bun.spawn(
    [
      "ffprobe",
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      path,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [out, code] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`ffprobe failed for ${path}`);
  const data = JSON.parse(out) as {
    format?: { duration?: string };
    streams?: Array<{
      codec_type?: string;
      width?: number;
      height?: number;
    }>;
  };
  const video = data.streams?.find((s) => s.codec_type === "video");
  const audio = data.streams?.find((s) => s.codec_type === "audio");
  return {
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    duration: Number(data.format?.duration ?? 0),
    hasAudio: Boolean(audio),
    hasVideo: Boolean(video),
  };
}

export function aspectOf(width: number, height: number): "horizontal" | "vertical" {
  return height > width ? "vertical" : "horizontal";
}

export function rnnoiseModelPath(): string | null {
  const candidates = [
    join(MODELS, "cb.rnnn"),
    join(MODELS, "bd.rnnn"),
    join(MODELS, "rnnoise.rnnn"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}
