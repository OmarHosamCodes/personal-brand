import { basename, dirname, extname, join } from "node:path";
import {
  EXPORT_DIR,
  INTRO,
  OUTRO,
  SILENCE_PRESETS,
  type Aspect,
  type JobOptions,
  type SilenceMode,
} from "./config";
import {
  aspectOf,
  ensureDir,
  ffprobeJson,
  rnnoiseModelPath,
  run,
} from "./ffmpeg";

export type ProgressFn = (stage: string, percent: number, message: string) => void;

type Segment = { start: number; end: number };

function parseSilence(stderr: string, duration: number, minSilence: number): Segment[] {
  const starts: number[] = [];
  const ends: number[] = [];
  for (const line of stderr.split("\n")) {
    const s = line.match(/silence_start:\s*([-\d.]+)/);
    if (s) starts.push(Number(s[1]));
    const e = line.match(/silence_end:\s*([-\d.]+)/);
    if (e) ends.push(Number(e[1]));
  }
  const silences: Segment[] = [];
  const n = Math.min(starts.length, ends.length);
  for (let i = 0; i < n; i++) {
    if (ends[i]! - starts[i]! >= minSilence) {
      silences.push({ start: starts[i]!, end: ends[i]! });
    }
  }
  const keep: Segment[] = [];
  let cursor = 0;
  for (const sil of silences) {
    if (sil.start > cursor + 0.05) keep.push({ start: cursor, end: sil.start });
    cursor = sil.end;
  }
  if (cursor < duration - 0.05) keep.push({ start: cursor, end: duration });
  return keep.length ? keep : [{ start: 0, end: duration }];
}

function padSegments(segs: Segment[], duration: number, pad: number): Segment[] {
  const out: Segment[] = [];
  for (const s of segs) {
    const start = Math.max(0, s.start - (s.start <= 0.01 ? 0 : pad));
    const end = Math.min(duration, s.end + (s.end >= duration - 0.01 ? 0 : pad));
    const last = out[out.length - 1];
    if (last && start <= last.end + 0.05) {
      last.end = Math.max(last.end, end);
    } else {
      out.push({ start, end });
    }
  }
  return out;
}

async function denoiseAudio(input: string, outputWav: string, on: ProgressFn) {
  on("denoise", 12, "Cleaning speech noise");
  const model = rnnoiseModelPath();
  const af = model
    ? `arnndn=m=${model},loudnorm=I=-16:TP=-1.5:LRA=11`
    : `afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11`;
  await run(["-y", "-i", input, "-vn", "-af", af, "-ar", "48000", "-ac", "2", outputWav]);
}

async function detectKeepSegments(
  media: string,
  mode: SilenceMode,
  duration: number,
): Promise<Segment[]> {
  const preset = SILENCE_PRESETS[mode];
  const { stderr } = await run(
    [
      "-i",
      media,
      "-af",
      `silencedetect=noise=${preset.noiseDb}dB:d=${preset.minSilence}`,
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  return padSegments(parseSilence(stderr, duration, preset.minSilence), duration, preset.pad);
}

async function encodeSegment(
  videoIn: string,
  audioIn: string | null,
  start: number,
  dur: number,
  outPath: string,
) {
  const args = ["-y", "-ss", String(start), "-t", String(dur), "-i", videoIn];
  if (audioIn) {
    args.push(
      "-ss",
      String(start),
      "-t",
      String(dur),
      "-i",
      audioIn,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "18",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-pix_fmt",
      "yuv420p",
      outPath,
    );
  } else {
    args.push(
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "18",
      "-an",
      "-pix_fmt",
      "yuv420p",
      outPath,
    );
  }
  await run(args);
}

async function cutKeepSegments(
  videoIn: string,
  audioIn: string | null,
  segments: Segment[],
  outPath: string,
  workDir: string,
) {
  const parts: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const part = join(workDir, `part-${i}.mp4`);
    await encodeSegment(videoIn, audioIn, seg.start, Math.max(0.05, seg.end - seg.start), part);
    parts.push(part);
  }
  if (parts.length === 1) {
    await Bun.write(outPath, Bun.file(parts[0]!));
    return;
  }
  const listPath = join(workDir, "parts.txt");
  await Bun.write(listPath, parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"));
  await run(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outPath]);
}

async function normalizeClip(
  src: string,
  dest: string,
  w: number,
  h: number,
) {
  const probe = await ffprobeJson(src);
  if (probe.hasAudio) {
    await run([
      "-y",
      "-i",
      src,
      "-vf",
      `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0x070707,setsar=1,fps=30`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      dest,
    ]);
    return;
  }
  await run([
    "-y",
    "-i",
    src,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-vf",
    `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0x070707,setsar=1,fps=30`,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    dest,
  ]);
}

async function concatBrand(
  body: string,
  aspect: Aspect,
  options: JobOptions,
  outPath: string,
  workDir: string,
) {
  const files: string[] = [];
  if (options.intro) files.push(INTRO[aspect]);
  files.push(body);
  if (options.outro) files.push(OUTRO[aspect]);
  if (files.length === 1) {
    await Bun.write(outPath, Bun.file(body));
    return;
  }

  const probe = await ffprobeJson(body);
  const w = probe.width || (aspect === "vertical" ? 1080 : 1920);
  const h = probe.height || (aspect === "vertical" ? 1920 : 1080);
  const normalized: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const dest = join(workDir, `norm-${i}.mp4`);
    await normalizeClip(files[i]!, dest, w, h);
    normalized.push(dest);
  }
  const listPath = join(workDir, "brand.txt");
  await Bun.write(
    listPath,
    normalized.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
  );
  await run([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outPath,
  ]);
}

export function exportPathFor(inputName: string): string {
  const stem = basename(inputName, extname(inputName)).replace(/[^\w.\-]+/g, "_");
  return join(EXPORT_DIR, `${stem}-ready.mp4`);
}

export async function processVideo(
  inputPath: string,
  outputPath: string,
  options: JobOptions,
  on: ProgressFn = () => {},
): Promise<{ aspect: Aspect; durationIn: number; durationOut: number }> {
  const workDir = join(dirname(outputPath), `.work-${Date.now()}`);
  await ensureDir(workDir);
  await ensureDir(dirname(outputPath));

  on("probe", 5, "Reading recording");
  const probe = await ffprobeJson(inputPath);
  if (!probe.hasVideo) throw new Error("Input has no video stream");
  const aspect = aspectOf(probe.width, probe.height);

  let audioWav: string | null = null;
  if (options.denoise && probe.hasAudio) {
    audioWav = join(workDir, "clean.wav");
    await denoiseAudio(inputPath, audioWav, on);
    on("denoise", 28, "Noise removed");
  } else {
    on("denoise", 28, options.denoise ? "No audio to denoise" : "Denoise skipped");
  }

  on("silence", 35, options.silence ? "Trimming silence" : "Keeping full timeline");
  const body = join(workDir, "body.mp4");

  if (options.silence && probe.hasAudio) {
    const keep = await detectKeepSegments(
      audioWav ?? inputPath,
      options.silenceMode,
      probe.duration,
    );
    on("silence", 55, `Keeping ${keep.length} speech segment${keep.length === 1 ? "" : "s"}`);
    await cutKeepSegments(inputPath, audioWav, keep, body, workDir);
  } else if (audioWav) {
    await run([
      "-y",
      "-i",
      inputPath,
      "-i",
      audioWav,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "-movflags",
      "+faststart",
      body,
    ]);
  } else {
    await run(["-y", "-i", inputPath, "-c", "copy", "-movflags", "+faststart", body]);
  }

  on(
    "brand",
    70,
    options.intro || options.outro ? "Stitching intro and outro" : "Skipping brand stitch",
  );
  if (options.intro || options.outro) {
    await concatBrand(body, aspect, options, outputPath, workDir);
  } else {
    await run(["-y", "-i", body, "-c", "copy", "-movflags", "+faststart", outputPath]);
  }

  on("export", 95, "Writing export");
  const outProbe = await ffprobeJson(outputPath);
  on("export", 100, "Ready");
  return { aspect, durationIn: probe.duration, durationOut: outProbe.duration };
}

export type { JobOptions, SilenceMode };
