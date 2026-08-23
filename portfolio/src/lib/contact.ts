export type ContactIntent = 'freelance' | 'consultation' | 'training' | 'other';

export type ContactPayload = {
  name: string;
  email: string;
  intent: ContactIntent;
  message: string;
  website?: string;
};

export const CONTACT_INTENT_LABELS: Record<ContactIntent, string> = {
  freelance: 'Freelance build',
  consultation: 'Consultation',
  training: 'Training',
  other: 'Something else',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactPayload(body: unknown):
  | { ok: true; data: ContactPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body is invalid.' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.website === 'string' && raw.website.trim()) {
    return { ok: false, error: 'Request rejected.' };
  }

  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const intent = raw.intent;
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  if (name.length < 2) {
    return { ok: false, error: 'Add your name so I know who to reply to.' };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  if (intent !== 'freelance' && intent !== 'consultation' && intent !== 'training' && intent !== 'other') {
    return { ok: false, error: 'Pick what you need help with.' };
  }

  if (message.length < 20) {
    return { ok: false, error: 'Share a bit more context — at least a sentence or two.' };
  }

  if (message.length > 4000) {
    return { ok: false, error: 'Message is too long. Keep it under 4,000 characters.' };
  }

  return {
    ok: true,
    data: { name, email, intent, message },
  };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
