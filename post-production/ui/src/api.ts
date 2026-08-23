export type SilenceMode = "tight" | "balanced" | "loose";

export type JobOptions = {
  denoise: boolean;
  silence: boolean;
  intro: boolean;
  outro: boolean;
  silenceMode: SilenceMode;
};

export type JobPublic = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  stage: string;
  percent: number;
  message: string;
  error?: string;
  inputName: string;
  outputPath?: string;
  aspect?: string;
  durationIn?: number;
  durationOut?: number;
};

const API = "/api";

export async function createJob(file: File, options: JobOptions): Promise<JobPublic> {
  const form = new FormData();
  form.set("file", file);
  form.set("denoise", String(options.denoise));
  form.set("silence", String(options.silence));
  form.set("intro", String(options.intro));
  form.set("outro", String(options.outro));
  form.set("silenceMode", options.silenceMode);
  const res = await fetch(`${API}/jobs`, { method: "POST", body: form });
  const data = (await res.json()) as JobPublic & { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not start processing.");
  return data;
}

export function watchJob(id: string, onUpdate: (job: JobPublic) => void): () => void {
  const es = new EventSource(`${API}/jobs/${id}/events`);
  es.addEventListener("job", (ev) => {
    onUpdate(JSON.parse((ev as MessageEvent).data) as JobPublic);
  });
  es.onerror = () => {
    // fall back to poll if SSE drops
    void poll();
  };

  let cancelled = false;
  async function poll() {
    while (!cancelled) {
      try {
        const res = await fetch(`${API}/jobs/${id}`);
        if (!res.ok) break;
        const job = (await res.json()) as JobPublic;
        onUpdate(job);
        if (job.status === "done" || job.status === "error") break;
      } catch {
        break;
      }
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return () => {
    cancelled = true;
    es.close();
  };
}

export function downloadUrl(id: string): string {
  return `${API}/jobs/${id}/download`;
}

export async function exportDir(): Promise<string> {
  const res = await fetch(`${API}/export-dir`);
  const data = (await res.json()) as { path: string };
  return data.path;
}
