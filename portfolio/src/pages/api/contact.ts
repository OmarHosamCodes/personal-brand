export const prerender = false;

import { Resend } from 'resend';
import type { APIRoute } from 'astro';
import { CONTACT_TO, RESEND_API_KEY, RESEND_FROM } from 'astro:env/server';

import {
  CONTACT_INTENT_LABELS,
  escapeHtml,
  parseContactPayload,
} from '../../lib/contact';
import { clientIp, isAllowedContactOrigin } from '../../lib/contact-guard';
import { checkRateLimit } from '../../lib/rate-limit';
import { site } from '../../content/site';

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedContactOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Request origin is not allowed.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = clientIp(request);
  const limited = checkRateLimit(`contact:${ip}`);
  if (!limited.ok) {
    return new Response(
      JSON.stringify({
        error: 'Too many messages. Try again later or email me directly.',
        mailto: `mailto:${site.contact.email}`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(limited.retryAfterSec),
        },
      },
    );
  }

  const apiKey = RESEND_API_KEY;
  const from = RESEND_FROM ?? 'onboarding@resend.dev';
  const to = CONTACT_TO ?? site.contact.email;

  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is missing');
    return new Response(
      JSON.stringify({
        error: "Message couldn't send. Email me directly instead.",
        mailto: `mailto:${site.contact.email}`,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body is invalid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = parseContactPayload(body);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, intent, message } = parsed.data;
  const intentLabel = CONTACT_INTENT_LABELS[intent];
  const resend = new Resend(apiKey);

  const html = `
    <h2>New portfolio message</h2>
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Intent:</strong> ${escapeHtml(intentLabel)}</p>
    <hr />
    <pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(message)}</pre>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `[Portfolio] ${intentLabel} — ${name}`,
    html,
    text: `From: ${name} <${email}>\nIntent: ${intentLabel}\n\n${message}`,
  });

  if (error) {
    console.error('contact: resend error', error);
    return new Response(
      JSON.stringify({
        error: "Couldn't send your message. Try email instead.",
        mailto: `mailto:${site.contact.email}?subject=${encodeURIComponent(`${intentLabel} — ${name}`)}`,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
