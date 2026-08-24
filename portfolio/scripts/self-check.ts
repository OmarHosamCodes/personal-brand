#!/usr/bin/env bun
// ponytail: one runnable check — contrast + content freeze + agent/safety invariants.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { site } from '../src/content/site';
import { parseContactPayload } from '../src/lib/contact';
import { robotsTxt, siteOrigin } from '../src/lib/agent-content';
import { checkRateLimit, resetRateLimitsForTests } from '../src/lib/rate-limit';
import { isAllowedContactOrigin } from '../src/lib/contact-guard';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert(site.heroLayout === 'C', 'heroLayout must be C');
assert(site.title === 'Software Engineer', 'title must be Software Engineer');
assert(site.projects.length >= 3, 'need at least 3 featured projects');
assert(site.contact.email.includes('@'), 'email required');
assert(site.contact.intents.length >= 3, 'contact intents required');
assert(site.cta.primary.href === '#contact', 'primary CTA must link to contact form');
assert(
  site.offers.every((o) => o.href.includes('intent=') && o.href.includes('#contact')),
  'offer chips must deep-link to contact form intents',
);
assert(siteOrigin() === 'https://omarhosamcodes.com', 'canonical site origin');

const robots = robotsTxt();
assert(robots.includes('GPTBot'), 'robots.txt must name GPTBot');
assert(robots.includes('ClaudeBot'), 'robots.txt must name ClaudeBot');
assert(robots.includes('Sitemap: https://omarhosamcodes.com/sitemap.xml'), 'robots sitemap URL');

assert(
  parseContactPayload({
    name: 'Test',
    email: 'test@example.com',
    intent: 'freelance',
    message: 'Need help shipping a product surface for founders.',
  }).ok,
  'valid contact payload must parse',
);
assert(
  !parseContactPayload({
    name: 'Bot',
    email: 'bot@example.com',
    intent: 'other',
    message: 'spam message with enough length here.',
    website: 'https://spam.test',
  }).ok,
  'honeypot must reject filled website field',
);
assert(site.proof.length === 0 || site.proof.every((p) => p.label), 'proof labels only when real');

resetRateLimitsForTests();
for (let i = 0; i < 5; i++) {
  assert(checkRateLimit('self-check').ok, `rate limit allows hit ${i + 1}`);
}
assert(!checkRateLimit('self-check').ok, 'rate limit rejects 6th hit');

assert(
  isAllowedContactOrigin(
    new Request('https://omarhosamcodes.com/api/contact', {
      headers: { origin: 'https://omarhosamcodes.com' },
    }),
  ),
  'production origin allowed',
);
assert(
  !isAllowedContactOrigin(
    new Request('https://omarhosamcodes.com/api/contact', {
      headers: { origin: 'https://evil.example' },
    }),
  ),
  'foreign origin rejected',
);

for (const file of [
  'public/favicon.svg',
  'public/favicon.ico',
  'public/favicon-32x32.png',
  'public/icon-192.png',
  'public/apple-touch-icon.png',
  'public/og.png',
  'public/site.webmanifest',
  'public/omar-portrait.png',
  'assets/omar-portrait-source.png',
  'assets/omar-portrait-flat.png',
  'public/logos/capsule-community-32.png',
  'public/logos/capsule-community-64.png',
  'public/logos/school-of-marketing-32.png',
  'public/logos/school-of-marketing-64.png',
  'public/frames/vendor/gsap.min.js',
]) {
  assert(existsSync(path.join(root, file)), `asset missing: ${file}`);
}

const iconSizes: [string, number, number][] = [
  ['public/favicon-32x32.png', 32, 32],
  ['public/icon-192.png', 192, 192],
  ['public/apple-touch-icon.png', 180, 180],
  ['public/og.png', 1200, 630],
];
for (const [rel, w, h] of iconSizes) {
  const out = spawnSync('magick', ['identify', '-format', '%w %h', path.join(root, rel)], {
    encoding: 'utf8',
  });
  assert(out.status === 0, `identify failed: ${rel}`);
  const [iw, ih] = (out.stdout ?? '').trim().split(/\s+/).map(Number);
  assert(iw === w && ih === h, `${rel} must be ${w}×${h}, got ${iw}×${ih}`);
}

{
  const out = spawnSync(
    'magick',
    ['identify', '-format', '%w %h', path.join(root, 'public/omar-portrait.png')],
    { encoding: 'utf8' },
  );
  assert(out.status === 0, 'identify failed: public/omar-portrait.png');
  const [iw, ih] = (out.stdout ?? '').trim().split(/\s+/).map(Number);
  assert(
    iw === site.portrait.width && ih === site.portrait.height,
    `omar-portrait.png must be ${site.portrait.width}×${site.portrait.height}, got ${iw}×${ih}`,
  );
}

const faviconSvg = spawnSync('cat', [path.join(root, 'public/favicon.svg')], { encoding: 'utf8' });
assert(faviconSvg.stdout?.includes('translate(3 -8)'), 'favicon mark must be centered on tile');

const themeJson = path.join(root, 'tmp', 'theme.json');
const script = path.join(
  process.env.HOME ?? '',
  '.cursor/skills/shadcn-theme-generator/scripts/check_contrast.py'
);

const result = spawnSync('python3', [script, themeJson], {
  cwd: root,
  encoding: 'utf8',
});

process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
if (result.status !== 0) process.exit(result.status === null ? 1 : result.status);

console.log('self-check: content freeze + agent/safety + contrast OK');

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(`self-check failed: ${msg}`);
    process.exit(1);
  }
}
