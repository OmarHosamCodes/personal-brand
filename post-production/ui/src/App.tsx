import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from "react";
import {
  createJob,
  downloadUrl,
  exportDir,
  watchJob,
  type JobOptions,
  type JobPublic,
  type SilenceMode,
} from "./api";

type Phase = "idle" | "ready" | "processing" | "done" | "error";

const STAGES = [
  { id: "denoise", label: "Denoise" },
  { id: "silence", label: "Trim silence" },
  { id: "brand", label: "Intro / outro" },
  { id: "export", label: "Export" },
] as const;

function Mark({ className, playing }: { className?: string; playing?: boolean }) {
  return (
    <svg
      className={`${className ?? ""}${playing ? " is-playing" : ""}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <circle className="mark-piece" cx="8" cy="32" r="6" fill="currentColor" />
      <line
        className="mark-piece"
        x1="16"
        y1="46"
        x2="28"
        y2="18"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        className="mark-piece"
        x1="28"
        y1="46"
        x2="40"
        y2="18"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDuration(sec?: number) {
  if (sec == null || Number.isNaN(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function aspectGuess(url: string): Promise<"horizontal" | "vertical" | "unknown"> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      resolve(video.videoHeight > video.videoWidth ? "vertical" : "horizontal");
    };
    video.onerror = () => resolve("unknown");
  });
}

function runPhaseTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
    return;
  }
  update();
}

export function App() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptTimer = useRef<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState<"horizontal" | "vertical" | "unknown">("unknown");
  const [duration, setDuration] = useState<number | undefined>();
  const [dragOver, setDragOver] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [markPlaying, setMarkPlaying] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<JobPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportPath, setExportPath] = useState<string>("");
  const [options, setOptions] = useState<JobOptions>({
    denoise: true,
    silence: true,
    intro: true,
    outro: true,
    silenceMode: "balanced",
  });

  useEffect(() => {
    void exportDir().then(setExportPath).catch(() => setExportPath("~/Videos/Omar Hosam/processed"));
    const t = window.setTimeout(() => setMarkPlaying(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (acceptTimer.current) window.clearTimeout(acceptTimer.current);
    };
  }, [previewUrl]);

  const flashAccept = () => {
    setAccepting(true);
    if (acceptTimer.current) window.clearTimeout(acceptTimer.current);
    acceptTimer.current = window.setTimeout(() => setAccepting(false), 700);
  };

  const acceptFile = async (next: File | null) => {
    if (!next) return;
    if (!next.type.startsWith("video/") && !/\.(mp4|mov|mkv|webm)$/i.test(next.name)) {
      setError("Use a video file from OBS (mp4, mov, mkv, or webm).");
      setPhase("error");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(next);
    flashAccept();
    runPhaseTransition(() => {
      setFile(next);
      setPreviewUrl(url);
      setError(null);
      setJob(null);
      setPhase("ready");
    });
    setAspect(await aspectGuess(url));
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => setDuration(video.duration);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    void acceptFile(f ?? null);
  };

  const process = async () => {
    if (!file) return;
    runPhaseTransition(() => {
      setPhase("processing");
      setError(null);
    });
    try {
      const created = await createJob(file, options);
      setJob(created);
      const stop = watchJob(created.id, (j) => {
        setJob(j);
        if (j.status === "done") {
          runPhaseTransition(() => setPhase("done"));
          stop();
        }
        if (j.status === "error") {
          setPhase("error");
          setError(j.error || j.message || "Processing failed.");
          stop();
        }
      });
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    runPhaseTransition(() => {
      setFile(null);
      setPreviewUrl(null);
      setJob(null);
      setError(null);
      setDuration(undefined);
      setAspect("unknown");
      setPhase("idle");
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const stageState = useMemo(() => {
    const current = job?.stage ?? "";
    const order = ["probe", "denoise", "silence", "brand", "export"];
    const idx = order.indexOf(current);
    return STAGES.map((s) => {
      const si = order.indexOf(s.id);
      if (phase === "done") return "done" as const;
      if (si < 0) return "pending" as const;
      if (si < idx) return "done" as const;
      if (si === idx || (s.id === "denoise" && current === "probe")) return "active" as const;
      return "pending" as const;
    });
  }, [job, phase]);

  const canProcess = Boolean(file) && phase !== "processing";
  const dropClass = [
    "drop",
    dragOver ? "is-drag" : "",
    accepting ? "is-accept" : "",
    phase === "processing" ? "is-processing" : "",
    phase === "done" ? "is-done" : "",
    file ? "is-ready" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="studio" data-phase={phase}>
      {/*
        THESIS: One finishing machine — drop a framed OBS take and leave with a publish-ready export.
        OWN-WORLD: Dark Creator Broadcast stage — code grid, kinetic orange blade, Syne + IBM Plex.
        STORY: Omar drops a recording, chooses denoise/silence/intro/outro, hits Process, downloads the result.
        FIRST VIEWPORT: Brand lockup top; dominant drop stage left; inspector toggles right; one Process CTA.
        FORM: Operate drop studio; dark polish + broadcast-machine overdrive; seed key: omar-post-dark-blade.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}
      <header className="topbar">
        <div className="brand">
          <Mark className="brand-mark" playing={markPlaying} />
          <div className="brand-copy">
            <strong>Omar Hosam</strong>
            <span>Post-production</span>
          </div>
        </div>
        <p className="meta">Local finishing · OBS framed takes</p>
      </header>

      <main className="shell">
        <section className="stage-panel" aria-label="Recording stage">
          <div>
            <h1 className="stage-heading">Finish the take</h1>
            <p className="stage-sub">
              Drop a framed OBS recording. Denoise, trim silence, and stitch the brand intro and
              outro in one pass.
            </p>
          </div>

          <div
            className={dropClass}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="drop-inner">
              {!file && (
                <div className="drop-panel" key="empty">
                  <p className="drop-label">Input · OBS recording</p>
                  <p className="drop-title">Drop video here</p>
                  <p className="drop-hint">
                    Horizontal 1920×1080 or vertical 1080×1920. Already framed — this studio does
                    not recompose sources.
                  </p>
                  <div className="actions" style={{ marginTop: 22, justifyContent: "center" }}>
                    <label className="btn btn-ghost" htmlFor={inputId}>
                      Choose file
                    </label>
                  </div>
                </div>
              )}

              {file && previewUrl && phase !== "done" && (
                <div className="drop-panel file-chip" key="ready">
                  <p className="drop-label">Loaded</p>
                  <strong>{file.name}</strong>
                  <div className="badges">
                    <span className="badge">
                      <em aria-hidden="true" />
                      {aspect === "unknown" ? "Aspect…" : aspect}
                    </span>
                    <span className="badge">{formatDuration(duration)}</span>
                    <span className="badge">
                      {Math.max(1, Math.round(file.size / (1024 * 1024)))} MB
                    </span>
                  </div>
                  {phase !== "processing" && (
                    <div className="preview">
                      <video src={previewUrl} controls preload="metadata" />
                    </div>
                  )}
                  {phase === "processing" && (
                    <div className="processing-status" role="status" aria-live="polite">
                      <p>
                        {job?.message ?? "Processing…"} · {job?.percent ?? 0}%
                      </p>
                      <div className="progress" style={{ width: "100%" }} aria-hidden="true">
                        <span style={{ width: `${job?.percent ?? 8}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {phase === "done" && job && (
                <div className="drop-panel file-chip" key="done">
                  <p className="drop-label">Ready</p>
                  <strong>{job.inputName.replace(/\.[^.]+$/, "")}-ready.mp4</strong>
                  <div className="badges">
                    <span className="badge">
                      <em aria-hidden="true" />
                      {job.aspect ?? aspect}
                    </span>
                    <span className="badge">
                      {formatDuration(job.durationIn)} → {formatDuration(job.durationOut)}
                    </span>
                  </div>
                  <div className="preview">
                    <video src={downloadUrl(job.id)} controls preload="metadata" />
                  </div>
                  {job.outputPath && (
                    <p className="drop-hint">Saved to {job.outputPath}</p>
                  )}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              id={inputId}
              className="sr-only"
              type="file"
              accept="video/*,.mp4,.mov,.mkv,.webm"
              onChange={(e) => void acceptFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="actions">
            {phase !== "done" && (
              <button
                type="button"
                className={`btn btn-primary${phase === "processing" ? " is-busy" : ""}`}
                disabled={!canProcess}
                onClick={() => void process()}
              >
                {phase === "processing" ? "Processing…" : "Process"}
              </button>
            )}
            {phase === "done" && job && (
              <>
                <a className="btn btn-primary" href={downloadUrl(job.id)} download>
                  Download
                </a>
                <button type="button" className="btn" onClick={reset}>
                  Process another
                </button>
              </>
            )}
            {file && phase !== "processing" && phase !== "done" && (
              <button type="button" className="btn" onClick={reset}>
                Clear
              </button>
            )}
          </div>

          {error && (
            <p className="error" role="alert">
              {error} Check the file and try again.
            </p>
          )}
        </section>

        <aside className="inspector" aria-label="Pipeline controls">
          <h2>Pipeline</h2>

          <div className="field">
            <span>Passes</span>
            <div>
              <Toggle
                label="Denoise"
                checked={options.denoise}
                onChange={(denoise) => setOptions((o) => ({ ...o, denoise }))}
                disabled={phase === "processing"}
              />
              <Toggle
                label="Smart silence"
                checked={options.silence}
                onChange={(silence) => setOptions((o) => ({ ...o, silence }))}
                disabled={phase === "processing"}
              />
              <Toggle
                label="Intro"
                checked={options.intro}
                onChange={(intro) => setOptions((o) => ({ ...o, intro }))}
                disabled={phase === "processing"}
              />
              <Toggle
                label="Outro"
                checked={options.outro}
                onChange={(outro) => setOptions((o) => ({ ...o, outro }))}
                disabled={phase === "processing"}
              />
            </div>
          </div>

          <div className="field">
            <span>Silence aggressiveness</span>
            <div className="segment" role="group" aria-label="Silence aggressiveness">
              {(["tight", "balanced", "loose"] as SilenceMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={options.silenceMode === mode}
                  disabled={phase === "processing" || !options.silence}
                  onClick={() => setOptions((o) => ({ ...o, silenceMode: mode }))}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Progress</span>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${phase === "done" ? 100 : job?.percent ?? 0}%` }} />
            </div>
            <div className="pipeline" role="list">
              {STAGES.map((s, i) => (
                <div
                  key={s.id}
                  className={`step${stageState[i] === "active" ? " is-active" : ""}${stageState[i] === "done" ? " is-done" : ""}`}
                  role="listitem"
                >
                  <span className="dot" />
                  <span>{s.label}</span>
                  <span>
                    {stageState[i] === "done" ? "ok" : stageState[i] === "active" ? "…" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {exportPath && (
            <p className="success-note">
              Exports land in <code>{exportPath}</code>
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="toggle-row">
      <label htmlFor={id}>{label}</label>
      <span className="switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <i aria-hidden="true" />
      </span>
    </div>
  );
}
