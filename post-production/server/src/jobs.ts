import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { EXPORT_DIR, WORK, type JobOptions, type SilenceMode } from "./config";
import { ensureDir } from "./ffmpeg";
import { exportPathFor, processVideo } from "./pipeline";

export type JobStatus = "queued" | "running" | "done" | "error";

export type Job = {
  id: string;
  status: JobStatus;
  stage: string;
  percent: number;
  message: string;
  error?: string;
  inputName: string;
  outputPath?: string;
  aspect?: string;
  durationIn?: number;
  durationOut?: number;
  createdAt: number;
  updatedAt: number;
  listeners: Set<(job: Job) => void>;
};

const jobs = new Map<string, Job>();

function emit(job: Job) {
  job.updatedAt = Date.now();
  for (const listener of job.listeners) listener(job);
}

function parseBool(v: unknown, fallback: boolean): boolean {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v;
  return String(v) === "true" || String(v) === "1" || String(v) === "on";
}

export function parseOptions(form: FormData): JobOptions {
  const mode = String(form.get("silenceMode") ?? "balanced") as SilenceMode;
  const silenceMode: SilenceMode =
    mode === "tight" || mode === "loose" || mode === "balanced" ? mode : "balanced";
  return {
    denoise: parseBool(form.get("denoise"), true),
    silence: parseBool(form.get("silence"), true),
    intro: parseBool(form.get("intro"), true),
    outro: parseBool(form.get("outro"), true),
    silenceMode,
  };
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export async function createJob(file: File, options: JobOptions): Promise<Job> {
  await ensureDir(WORK);
  await ensureDir(EXPORT_DIR);
  const id = randomUUID();
  const workDir = join(WORK, id);
  await ensureDir(workDir);
  const inputName = file.name || "recording.mp4";
  const inputPath = join(workDir, `input${extOf(inputName)}`);
  await Bun.write(inputPath, file);

  const job: Job = {
    id,
    status: "queued",
    stage: "queued",
    percent: 0,
    message: "Queued",
    inputName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    listeners: new Set(),
  };
  jobs.set(id, job);

  void runJob(job, inputPath, options);
  return job;
}

async function runJob(job: Job, inputPath: string, options: JobOptions) {
  job.status = "running";
  emit(job);
  try {
    const outputPath = exportPathFor(job.inputName);
    const result = await processVideo(inputPath, outputPath, options, (stage, percent, message) => {
      job.stage = stage;
      job.percent = percent;
      job.message = message;
      emit(job);
    });
    job.status = "done";
    job.stage = "export";
    job.percent = 100;
    job.message = "Ready";
    job.outputPath = outputPath;
    job.aspect = result.aspect;
    job.durationIn = result.durationIn;
    job.durationOut = result.durationOut;
    emit(job);
  } catch (err) {
    job.status = "error";
    job.error = err instanceof Error ? err.message : String(err);
    job.message = job.error;
    emit(job);
  }
}

export function publicJob(job: Job) {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    percent: job.percent,
    message: job.message,
    error: job.error,
    inputName: job.inputName,
    outputPath: job.outputPath,
    aspect: job.aspect,
    durationIn: job.durationIn,
    durationOut: job.durationOut,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i) : ".mp4";
}
