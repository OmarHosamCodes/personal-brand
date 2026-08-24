/** Single content source for the one-pager. Keep claims evidence-bounded. */

export const site = {
  name: 'Omar Hosam',
  title: 'Software Engineer',
  tagline:
    'I build product interfaces, APIs, and commerce systems founders can ship and extend.',
  location: 'Cairo, Egypt',
  portrait: {
    src: '/omar-portrait.png?v=18',
    alt: 'Omar Hosam, arms crossed, studio portrait with kinetic orange rim light',
    width: 768,
    height: 704,
  },
  /** Hero layout: C = centered lockup; portrait secondary (OD winner override) */
  heroLayout: 'C' as const,
  cta: {
    primary: {
      label: 'Get in touch',
      href: '#contact',
    },
    secondary: { label: 'See selected work', href: '#work' },
  },
  offers: [
    {
      id: 'freelance',
      label: 'Freelance',
      blurb: 'Ship a product surface, API, or integration with clear ownership.',
      href: '/?intent=freelance#contact',
    },
    {
      id: 'consultation',
      label: 'Consultation',
      blurb: 'Architecture and delivery decisions without a full build engagement.',
      href: '/?intent=consultation#contact',
    },
    {
      id: 'training',
      label: 'Training',
      blurb: '1:1 mentoring or 1:many workshops for teams shipping web systems.',
      href: '/?intent=training#contact',
    },
  ],
  contact: {
    heading: 'Tell me what you\'re building',
    intro:
      'Pick what you need, send a brief. I reply by email.',
    intents: [
      { id: 'freelance', label: 'Freelance build' },
      { id: 'consultation', label: 'Consultation' },
      { id: 'training', label: 'Training' },
      { id: 'other', label: 'Something else' },
    ] as const,
    email: 'contact@omarhosamcodes.com',
    phone: '+20 106 258 9946',
    phoneHref: 'tel:+201062589946',
    socials: [
      {
        label: 'GitHub',
        href: 'https://github.com/OmarHosamCodes',
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/omarhosamcodes/',
      },
    ],
  },
  /** Soft proof — leave empty rather than invent */
  proof: [] as { label: string; detail?: string }[],
  projects: [
    {
      id: 'ogm-reimagined',
      name: 'Tribe IT',
      line: 'Community, courses, live rooms, and operator admin in one creator platform.',
      stack: ['Next.js', 'tRPC', 'Turbo', 'PostgreSQL', 'Capacitor'],
      href: 'https://github.com/OmarHosamCodes/ogm-reimagined',
      linkLabel: 'Open on GitHub',
      frame: '/frames/ogm-reimagined.html?v=loop',
    },
    {
      id: 'brainiac',
      name: 'Orch',
      line: 'A spatial canvas with agency time tracking and an agent you approve.',
      stack: ['React', 'Hono', 'oRPC', 'PostgreSQL'],
      href: 'https://github.com/OmarHosamCodes/brainiac',
      linkLabel: 'Open on GitHub',
      frame: '/frames/brainiac.html?v=loop',
    },
    {
      id: 'atoms',
      name: 'Atoms Academy',
      line: 'Arabic lecture, homework, and exam in one student path.',
      stack: ['Next.js', 'Supabase', 'Cloudflare Stream'],
      href: 'https://atoms.academy',
      linkLabel: 'Open live site',
      frame: '/frames/atoms.html?v=loop',
    },
  ],
  experienceIntro: 'In-house and freelance roles shipping product.',
  experience: [
    {
      role: 'Software Engineer',
      org: 'School Of Marketing',
      orgHref: 'https://learn.school-of-marketing.com',
      period: 'Present',
      summary: 'Product engineering on marketing-tech surfaces and internal tools.',
    },
    {
      role: 'Freelance Software Engineer',
      org: 'Independent',
      period: '2019 — 2024',
      summary: 'Full-stack delivery across SaaS, commerce, and custom web systems.',
    },
  ],
} as const;

export type Site = typeof site;
