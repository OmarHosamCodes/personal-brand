import { join } from "node:path";
import { existsSync } from "node:fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { serveStatic } from "hono/bun";
import { DESKTOP_ASSETS, EXPORT_DIR, OPEN_UI, PORT, UI_DIST } from "./config";
import { createJob, getJob, parseOptions, publicJob } from "./jobs";
import { ensureDir } from "./ffmpeg";
import { openAppWindow } from "./open-ui";

await ensureDir(EXPORT_DIR);

const api = new Hono();

api.get("/health", (c) => c.json({ ok: true }));

api.post("/jobs", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return c.json({ error: "Drop a video file to process." }, 400);
  }
  const options = parseOptions(form);
  const job = await createJob(file, options);
  return c.json(publicJob(job), 201);
});

api.get("/jobs/:id", (c) => {
  const job = getJob(c.req.param("id"));
  if (!job) return c.json({ error: "Job not found." }, 404);
  return c.json(publicJob(job));
});

api.get("/jobs/:id/events", (c) => {
  const job = getJob(c.req.param("id"));
  if (!job) return c.json({ error: "Job not found." }, 404);
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ data: JSON.stringify(publicJob(job)), event: "job" });
    await new Promise<void>((resolve) => {
      const send = (j: typeof job) => {
        void stream.writeSSE({ data: JSON.stringify(publicJob(j)), event: "job" });
        if (j.status === "done" || j.status === "error") {
          job.listeners.delete(send);
          resolve();
        }
      };
      if (job.status === "done" || job.status === "error") {
        resolve();
        return;
      }
      job.listeners.add(send);
    });
  });
});

api.get("/jobs/:id/download", async (c) => {
  const job = getJob(c.req.param("id"));
  if (!job?.outputPath) return c.json({ error: "Export not ready." }, 404);
  const file = Bun.file(job.outputPath);
  if (!(await file.exists())) return c.json({ error: "Export missing on disk." }, 404);
  return new Response(file, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${job.inputName.replace(/\.[^.]+$/, "")}-ready.mp4"`,
    },
  });
});

api.get("/export-dir", (c) => c.json({ path: EXPORT_DIR }));

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173", `http://127.0.0.1:${PORT}`],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.route("/api", api);

const hasUi = existsSync(join(UI_DIST, "index.html"));
const hasSplash = existsSync(join(DESKTOP_ASSETS, "splash.html"));

if (hasUi) {
  app.use("/assets/*", serveStatic({ root: UI_DIST }));
  app.use("/fonts/*", serveStatic({ root: UI_DIST }));
}

if (hasSplash) {
  app.get("/", async (c) => {
    if (c.req.query("nosplash") === "1" && hasUi) {
      return c.html(await Bun.file(join(UI_DIST, "index.html")).text());
    }
    let html = await Bun.file(join(DESKTOP_ASSETS, "splash.html")).text();
    html = html
      .replaceAll('url("./fonts/', 'url("/fonts/')
      .replace('location.replace("/app/");', 'location.replace("/?nosplash=1");');
    return c.html(html);
  });
  app.get("/studio", async (c) => {
    if (!hasUi) return c.text("UI not built", 404);
    return c.html(await Bun.file(join(UI_DIST, "index.html")).text());
  });
} else if (hasUi) {
  app.get("/", async (c) => c.html(await Bun.file(join(UI_DIST, "index.html")).text()));
}

console.log(`Omar post-production on http://127.0.0.1:${PORT}`);
if (OPEN_UI && hasUi) {
  void openAppWindow(`http://127.0.0.1:${PORT}/`);
}

export default {
  port: PORT,
  hostname: "127.0.0.1",
  fetch: app.fetch,
};
