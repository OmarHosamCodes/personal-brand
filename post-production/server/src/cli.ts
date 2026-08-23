import { basename, resolve } from "node:path";
import { exportPathFor, processVideo, type JobOptions } from "./pipeline";

const input = process.argv[2];
if (!input) {
  console.error("Usage: bun src/cli.ts <video> [--no-denoise] [--no-silence] [--no-intro] [--no-outro] [--tight|--loose]");
  process.exit(1);
}

const args = new Set(process.argv.slice(3));
const options: JobOptions = {
  denoise: !args.has("--no-denoise"),
  silence: !args.has("--no-silence"),
  intro: !args.has("--no-intro"),
  outro: !args.has("--no-outro"),
  silenceMode: args.has("--tight") ? "tight" : args.has("--loose") ? "loose" : "balanced",
};

const inputPath = resolve(input);
const outputPath = exportPathFor(basename(inputPath));
const result = await processVideo(inputPath, outputPath, options, (s, p, m) =>
  console.log(`${p}% ${s}: ${m}`),
);
console.log(JSON.stringify({ outputPath, ...result }, null, 2));
