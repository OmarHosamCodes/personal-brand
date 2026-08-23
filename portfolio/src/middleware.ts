import { defineMiddleware } from 'astro:middleware';

import {
  apiCatalogLinkset,
  homepageMarkdown,
  llmsFullTxt,
  llmsTxt,
  openApiDocument,
  robotsTxt,
  sitemapXml,
} from './lib/agent-content';

const SITE = 'https://omarhosamcodes.com';

const CSP = [
  "default-src 'self'",
  // ponytail: Astro island bootstraps are inline modules. Ceiling: no nonce yet. Upgrade: Astro experimental CSP nonces.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ');

const LINK_HEADER = [
  `<${SITE}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
  `<${SITE}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${SITE}/.well-known/api-catalog>; rel="api-catalog"`,
  `<${SITE}/openapi.json>; rel="service-desc"; type="application/openapi+json"`,
].join(', ');

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CSP,
} as const;

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const parts = accept.split(',').map((part) => {
    const [type, ...params] = part.trim().split(';');
    const q = params.find((p) => p.trim().startsWith('q='));
    const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
    return { type: type.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 1 };
  });
  const md = parts.find((p) => p.type === 'text/markdown');
  const html = parts.find((p) => p.type === 'text/html');
  if (!md) return false;
  if (!html) return md.quality > 0;
  return md.quality > html.quality;
}

function textResponse(
  body: string,
  contentType: string,
  extra?: HeadersInit,
): Response {
  return new Response(body, {
    status: 200,
    headers: {
      ...SECURITY,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      Link: LINK_HEADER,
      ...extra,
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  switch (pathname) {
    case '/robots.txt':
      return textResponse(robotsTxt(), 'text/plain; charset=utf-8');
    case '/sitemap.xml':
      return textResponse(sitemapXml(), 'application/xml; charset=utf-8');
    case '/llms.txt':
      return textResponse(llmsTxt(), 'text/plain; charset=utf-8');
    case '/llms-full.txt':
      return textResponse(llmsFullTxt(), 'text/plain; charset=utf-8');
    case '/index.md':
      return textResponse(homepageMarkdown(), 'text/markdown; charset=utf-8');
    case '/openapi.json':
      return textResponse(
        JSON.stringify(openApiDocument(), null, 2),
        'application/openapi+json; charset=utf-8',
      );
    case '/.well-known/api-catalog':
      return textResponse(
        JSON.stringify(apiCatalogLinkset(), null, 2),
        'application/linkset+json; charset=utf-8',
      );
    default:
      break;
  }

  if (pathname === '/' && prefersMarkdown(context.request.headers.get('Accept'))) {
    return textResponse(homepageMarkdown(), 'text/markdown; charset=utf-8');
  }

  const response = await next();
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY)) {
    headers.set(key, value);
  }

  const contentType = headers.get('Content-Type') ?? '';
  if (contentType.includes('text/html')) {
    headers.set('Link', LINK_HEADER);
  }

  if (pathname === '/system' || pathname.startsWith('/system/')) {
    headers.set('X-Robots-Tag', 'noindex');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
