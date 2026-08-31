import { site } from '../content/site';

const SITE = 'https://omarhosamcodes.com';

export function siteOrigin(): string {
  return SITE;
}

/** Short index for agents (llms.txt). */
export function llmsTxt(): string {
  const projects = site.projects
    .map((p) => `- [${p.name}](${SITE}/#work): ${p.line}`)
    .join('\n');
  const offers = site.offers.map((o) => `- ${o.label}: ${o.blurb}`).join('\n');

  return `# ${site.name}

> ${site.tagline}

- Title: ${site.title}
- Location: ${site.location}
- Site: ${SITE}
- Email: ${site.contact.email}
- Phone: ${site.contact.phone}

## Offers

${offers}

## Selected work

${projects}

## Contact

Prefer the brief form at ${SITE}/#contact or \`POST ${SITE}/api/contact\` (see ${SITE}/openapi.json).
Direct email: ${site.contact.email}

## For agents

- Sitemap: ${SITE}/sitemap.xml
- Full page as markdown: ${SITE}/index.md or ${SITE}/llms-full.txt
- OpenAPI: ${SITE}/openapi.json
- API catalog: ${SITE}/.well-known/api-catalog

## Skips (not applicable)

This is a personal portfolio one-pager. MCP, A2A, OAuth, NLWeb, and commerce protocols are not offered.
Web Bot Auth (AR-IDEN-01) is not implemented — no agent signature directory on this host.
`;
}

/** Full ingestible page copy. */
export function llmsFullTxt(): string {
  const projects = site.projects
    .map(
      (p) => `### ${p.name}

${p.line}
`,
    )
    .join('\n');

  const experience = site.experience
    .map(
      (e) => `- **${e.role}** — ${e.org} (${e.period}): ${e.summary}`,
    )
    .join('\n');

  const intents = site.contact.intents.map((i) => `- ${i.label}`).join('\n');

  return `# ${site.name} — ${site.title}

${site.tagline}

## Offers

${site.offers.map((o) => `### ${o.label}\n\n${o.blurb}`).join('\n\n')}

## Selected work

${projects}

## Experience

${site.experienceIntro}

Currently learning: ${site.currentlyLearning.topic}

${experience}

## Contact

${site.contact.heading}

${site.contact.intro}

Intents:
${intents}

- Email: ${site.contact.email}
- Phone: ${site.contact.phone}
- GitHub: ${site.contact.socials.find((s) => s.label === 'GitHub')?.href ?? ''}
- LinkedIn: ${site.contact.socials.find((s) => s.label === 'LinkedIn')?.href ?? ''}

Machine interface: \`POST /api/contact\` — OpenAPI at ${SITE}/openapi.json
`;
}

export function homepageMarkdown(): string {
  return llmsFullTxt();
}

export function personJsonLd() {
  const sameAs = site.contact.socials.map((s) => s.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.title,
    description: site.tagline,
    url: SITE,
    email: site.contact.email,
    telephone: site.contact.phoneHref.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    sameAs,
    image: `${SITE}/omar-portrait.png`,
  };
}

export function professionalServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${site.name} — Software Engineering`,
    description: site.tagline,
    url: SITE,
    telephone: site.contact.phoneHref.replace('tel:', ''),
    email: site.contact.email,
    areaServed: 'Worldwide',
    provider: {
      '@type': 'Person',
      name: site.name,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Engagements',
      itemListElement: site.offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.label,
        description: offer.blurb,
        url: `${SITE}/?intent=${offer.id}#contact`,
      })),
    },
  };
}

export function openApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${site.name} portfolio contact API`,
      version: '1.0.0',
      description:
        'Submit a brief from the portfolio contact form. Human-facing UI: /#contact. Rate-limited; same-origin browsers only.',
      contact: {
        name: site.name,
        email: site.contact.email,
        url: SITE,
      },
    },
    servers: [{ url: SITE }],
    paths: {
      '/api/contact': {
        post: {
          operationId: 'submitContactBrief',
          summary: 'Send a contact brief',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactPayload' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Brief accepted and emailed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['ok'],
                    properties: { ok: { type: 'boolean', const: true } },
                  },
                },
              },
            },
            '400': {
              description: 'Validation or honeypot failure',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
            '403': {
              description: 'Missing or disallowed Origin/Referer',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
            '429': {
              description: 'Rate limited',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
            '502': {
              description: 'Upstream email provider failure',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
            '503': {
              description: 'Email not configured',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ContactIntent: {
          type: 'string',
          enum: ['freelance', 'consultation', 'training', 'other'],
        },
        ContactPayload: {
          type: 'object',
          required: ['name', 'email', 'intent', 'message'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            intent: { $ref: '#/components/schemas/ContactIntent' },
            message: { type: 'string', minLength: 20, maxLength: 4000 },
            website: {
              type: 'string',
              description: 'Honeypot — must be empty or omitted',
              maxLength: 0,
            },
          },
        },
        ErrorBody: {
          type: 'object',
          required: ['error'],
          properties: {
            error: { type: 'string' },
            mailto: { type: 'string', format: 'uri' },
          },
        },
      },
    },
  };
}

export function apiCatalogLinkset() {
  return {
    linkset: [
      {
        anchor: `${SITE}/`,
        'service-desc': [
          {
            href: `${SITE}/openapi.json`,
            type: 'application/openapi+json',
          },
        ],
        'service-doc': [
          {
            href: `${SITE}/llms.txt`,
            type: 'text/plain',
          },
        ],
      },
    ],
  };
}

export function robotsTxt(): string {
  const bots = [
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Google-Extended',
    'PerplexityBot',
    'Applebot-Extended',
  ];

  const named = bots
    .map(
      (bot) => `User-agent: ${bot}
Allow: /
Disallow: /api/
Disallow: /system
`,
    )
    .join('\n');

  return `${named}
User-agent: *
Allow: /
Disallow: /api/
Disallow: /system

Sitemap: ${SITE}/sitemap.xml
`;
}

export function sitemapXml(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}
