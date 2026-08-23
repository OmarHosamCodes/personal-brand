import { join } from "node:path";
import { ROOT, WORK } from "./config";
import { ensureDir, ffprobeJson, run } from "./ffmpeg";
import { processVideo } from "./pipeline";

const dir = join(WORK, "self-check");
await ensureDir(dir);
const sample = join(dir, "sample.mp4");
const audio = join(dir, "sample-audio.wav");

// Speech-like tones with long silences between (6s total)
await run([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=f=440:d=2",
  "-f",
  "lavfi",
  "-i",
  "anullsrc=r=48000:cl=stereo:d=2",
  "-f",
  "lavfi",
  "-i",
  "sine=f=550:d=1",
  "-filter_complex",
  "[0:a][1:a][2:a]concat=n=3:v=0:a=1[a]",
  "-map",
  "[a]",
  audio,
]);

await run([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=0x070707:s=1280x720:d=5:r=30",
  "-i",
  audio,
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-shortest",
  sample,
]);

const out = join(dir, "out.mp4");
const result = await processVideo(
  sample,
  out,
  {
    denoise: true,
    silence: true,
    intro: false,
    outro: false,
    silenceMode: "balanced",
  },
  (stage, percent, message) => console.log(`${percent}% ${stage}: ${message}`),
);

const outProbe = await ffprobeJson(out);
if (!(outProbe.duration < result.durationIn - 0.8)) {
  console.error("FAIL: expected silence trim to shorten duration", {
    in: result.durationIn,
    out: outProbe.duration,
  });
  process.exit(1);
}
if (!outProbe.hasVideo) {
  console.error("FAIL: output missing video");
  process.exit(1);
}

// Brand stitch smoke
const branded = join(dir, "branded.mp4");
const brandedResult = await processVideo(
  sample,
  branded,
  {
    denoise: false,
    silence: false,
    intro: true,
    outro: true,
    silenceMode: "balanced",
  },
  (stage, percent, message) => console.log(`brand ${percent}% ${stage}: ${message}`),
);
if (!(brandedResult.durationOut > brandedResult.durationIn + 2)) {
  console.error("FAIL: intro+outro should add ~4s", brandedResult);
  process.exit(1);
}

console.log("PASS", {
  silence: { in: result.durationIn.toFixed(2), out: result.durationOut.toFixed(2) },
  brand: { in: brandedResult.durationIn.toFixed(2), out: brandedResult.durationOut.toFixed(2) },
  root: ROOT,
});
