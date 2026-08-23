/** Allowed origins for browser POSTs to /api/contact. */

const PRODUCTION = 'https://omarhosamcodes.com';

export function isAllowedContactOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  const allowed = new Set<string>([PRODUCTION]);
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    // Local / preview hosts (astro, node adapter)
    if (
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.endsWith('.local')
    ) {
      allowed.add(`${proto}://${host}`);
      allowed.add(`http://${host}`);
    } else if (host === 'omarhosamcodes.com' || host === 'www.omarhosamcodes.com') {
      allowed.add(`https://${host}`);
    }
  }

  if (origin && allowed.has(origin)) return true;

  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowed.has(refOrigin)) return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}
