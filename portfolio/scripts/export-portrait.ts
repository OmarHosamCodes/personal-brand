#!/usr/bin/env bun
/** Pixel-accurate portrait bakes via headless Chrome + source alpha composite. */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets/omar-portrait-source.png');
const heroOutput = path.join(root, 'public/omar-portrait.png');
const flatOutput = path.join(root, 'assets/omar-portrait-flat.png');

/** Desktop hero img used size (w-full max-w-3xl + md:max-h-[44rem]). */
const OUT_W = 768;
const OUT_H = 704;
const DPR = 2;
const FOCUS_X = 0.5;
const FOCUS_Y = 0.12;

/** Creator Broadcast Pipeline `--background`: oklch(13% 0.005 264) */
const PAGE_BG = 'oklch(13% 0.005 264)';

const CHROME =
  process.env.CHROME_PATH ??
  spawnSync('bash', ['-lc', 'command -v google-chrome || command -v chromium'], {
    encoding: 'utf8',
  }).stdout.trim();

type Variant = 'hero' | 'flat';

function coverExtract(
  iw: number,
  ih: number,
  tw: number,
  th: number,
  fx: number,
  fy: number,
) {
  const scale = Math.max(tw / iw, th / ih);
  const sw = Math.round(iw * scale);
  const sh = Math.round(ih * scale);
  const left = Math.round(Math.max(0, Math.min(sw - tw, fx * sw - fx * tw)));
  const top = Math.round(Math.max(0, Math.min(sh - th, fy * sh - fy * th)));
  return { sw, sh, left, top };
}

async function cropSourceAlpha(dest: string) {
  const meta = await sharp(source).metadata();
  const iw = meta.width ?? 0;
  const ih = meta.height ?? 0;
  if (!iw || !ih) throw new Error('Could not read source dimensions');

  const { sw, sh, left, top } = coverExtract(iw, ih, OUT_W, OUT_H, FOCUS_X, FOCUS_Y);
  await sharp(source)
    .resize(sw, sh)
    .extract({ left, top, width: OUT_W, height: OUT_H })
    .png()
    .toFile(dest);
}

function bakeHtml(sourceFile: string, variant: Variant) {
  const srcUrl = `file://${sourceFile}`;
  const transparent = variant === 'hero';

  const overlay = transparent
    ? ''
    : `
  .hero-portrait::after {
    content: '';
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 22%;
    background: linear-gradient(
      to top,
      ${PAGE_BG} 0%,
      color-mix(in oklch, ${PAGE_BG} 88%, transparent) 22%,
      color-mix(in oklch, ${PAGE_BG} 45%, transparent) 58%,
      transparent 100%
    );
  }`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    width: ${OUT_W}px;
    height: ${OUT_H}px;
    overflow: hidden;
    background: ${transparent ? '#000' : PAGE_BG};
  }
  .hero-portrait {
    position: relative;
    margin: 0;
    width: ${OUT_W}px;
    height: ${OUT_H}px;
  }
  .hero-portrait img {
    display: block;
    width: ${OUT_W}px;
    height: ${OUT_H}px;
    object-fit: cover;
    object-position: center 12%;
    filter: hue-rotate(165deg) saturate(1.2);
  }${overlay}
</style></head>
<body>
  <figure class="hero-portrait"><img src="${srcUrl}" alt="" /></figure>
</body></html>`;
}

async function waitForPort(port: number, timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = createConnection({ port, host: '127.0.0.1' }, () => {
          socket.end();
          resolve();
        });
        socket.on('error', reject);
      });
      return;
    } catch {
      await Bun.sleep(50);
    }
  }
  throw new Error(`Chrome debug port ${port} did not open`);
}

type CdpMessage = { id: number; method: string; params?: Record<string, unknown> };

async function captureChrome(htmlPath: string, pngPath: string) {
  if (!CHROME) throw new Error('Chrome/Chromium not found (set CHROME_PATH)');

  const port = 9333 + Math.floor(Math.random() * 200);
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-sandbox',
      `--remote-debugging-port=${port}`,
      `--window-size=${OUT_W},${OUT_H}`,
      `--force-device-scale-factor=${DPR}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' },
  );

  try {
    await waitForPort(port);
    const targets = (await fetch(`http://127.0.0.1:${port}/json/list`).then((r) =>
      r.json(),
    )) as Array<{ webSocketDebuggerUrl: string; type: string }>;
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('No CDP page target');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => resolve());
      ws.addEventListener('error', reject);
    });

    let id = 0;
    const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String(event.data)) as {
        id?: number;
        result?: unknown;
        error?: { message: string };
      };
      if (!msg.id) return;
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    });

    const send = (method: string, params: Record<string, unknown> = {}) =>
      new Promise<unknown>((resolve, reject) => {
        const msgId = ++id;
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params } satisfies CdpMessage));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: OUT_W,
      height: OUT_H,
      deviceScaleFactor: DPR,
      mobile: false,
    });

    await send('Page.navigate', { url: `file://${htmlPath}` });
    await Bun.sleep(400);

    await send('Runtime.evaluate', {
      expression: `new Promise((resolve) => {
        const img = document.querySelector('img');
        if (!img) return resolve(false);
        if (img.complete && img.naturalWidth) return resolve(true);
        img.addEventListener('load', () => resolve(true), { once: true });
        img.addEventListener('error', () => resolve(false), { once: true });
      })`,
      awaitPromise: true,
    });

    const shot = (await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
      omitBackground: false,
    })) as { data: string };

    writeFileSync(pngPath, Buffer.from(shot.data, 'base64'));
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

function resizePng(pngPath: string, rgba: boolean) {
  const args = rgba
    ? ['-background', 'none', '-alpha', 'on', '-resize', `${OUT_W}x${OUT_H}!`]
    : ['-resize', `${OUT_W}x${OUT_H}!`, '-alpha', 'off', '-define', 'png:color-type=2'];
  const result = spawnSync('magick', [pngPath, ...args, pngPath], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'magick resize failed');
}

/** Apply source alpha to Chrome-filtered RGB (no extra bottom cut — source alpha is canonical). */
function composeHeroTransparent(filteredPath: string, alphaSourcePath: string, dest: string) {
  const result = spawnSync(
    'magick',
    [
      filteredPath,
      alphaSourcePath,
      '-compose',
      'CopyOpacity',
      '-composite',
      '-background',
      'none',
      dest,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(result.stderr || 'alpha composite failed');
}

async function exportVariant(variant: Variant, dest: string) {
  const tmp = mkdtempSync(path.join(tmpdir(), `portrait-${variant}-`));
  const htmlPath = path.join(tmp, 'bake.html');
  const chromePath = path.join(tmp, 'chrome.png');
  const alphaPath = path.join(tmp, 'alpha.png');

  try {
    writeFileSync(htmlPath, bakeHtml(source, variant));
    await captureChrome(htmlPath, chromePath);
    resizePng(chromePath, false);

    if (variant === 'hero') {
      await cropSourceAlpha(alphaPath);
      composeHeroTransparent(chromePath, alphaPath, dest);
    } else {
      writeFileSync(dest, readFileSync(chromePath));
    }

    const final = spawnSync('magick', ['identify', '-format', '%wx%h %b', dest], {
      encoding: 'utf8',
    });
    console.log(
      `export-portrait (${variant}): ${path.relative(root, source)} → ${path.relative(root, dest)} (${final.stdout.trim()})`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  if (!existsSync(source)) throw new Error(`Missing source portrait: ${source}`);

  await exportVariant('hero', heroOutput);
  await exportVariant('flat', flatOutput);
}

await main();
