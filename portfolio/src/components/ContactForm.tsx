import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type ContactIntent,
  type ContactPayload,
} from '@/lib/contact';
import { cn } from '@/lib/utils';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  mailto: string;
  intents: readonly { id: ContactIntent; label: string }[];
  headingId: string;
  initialIntent?: ContactIntent;
};

type FieldErrors = Partial<Record<'name' | 'email' | 'intent' | 'message', string>>;

const INTENT_IDS: ContactIntent[] = ['freelance', 'consultation', 'training', 'other'];

export function parseContactIntent(raw: string | null | undefined): ContactIntent {
  if (raw && INTENT_IDS.includes(raw as ContactIntent)) return raw as ContactIntent;
  return 'freelance';
}

function validateClient(payload: ContactPayload): FieldErrors {
  const errors: FieldErrors = {};
  if (payload.name.trim().length < 2) errors.name = 'Add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = 'Enter a valid email.';
  }
  if (!payload.intent) errors.intent = 'Pick what you need.';
  if (payload.message.trim().length < 20) {
    errors.message = 'Share a bit more context.';
  }
  return errors;
}

function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn('bg-primary size-1.5 shrink-0 rounded-full', className)}
      aria-hidden="true"
    />
  );
}

export function ContactForm({
  mailto,
  intents,
  headingId,
  initialIntent = 'freelance',
}: Props) {
  const formId = useId();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<ContactPayload>({
    name: '',
    email: '',
    intent: initialIntent,
    message: '',
    website: '',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const clientErrors = validateClient(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(null);
      setStatus('idle');
      return;
    }

    setFieldErrors({});
    setError(null);
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { error?: string; mailto?: string };

      if (!response.ok) {
        setError(data.error ?? "Couldn't send your message.");
        setStatus('error');
        return;
      }

      setStatus('success');
      setValues({
        name: '',
        email: '',
        intent: 'freelance',
        message: '',
        website: '',
      });
    } catch {
      setError('Connection lost. Check your network or email me directly.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        className="border-border bg-card flex min-h-88 flex-col justify-center gap-4 rounded-[16px] border p-5 md:p-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <LiveDot />
          <p className="font-display m-0 text-[18px] leading-[1.1] font-semibold tracking-[-0.01em]">
            Brief sent
          </p>
        </div>
        <p className="text-muted-foreground m-0 max-w-[42ch] text-[15px] leading-[1.6]">
          Thanks — I&apos;ll read your brief and reply by email.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-1 w-fit"
          onClick={() => setStatus('idle')}
        >
          Send another brief
        </Button>
      </div>
    );
  }

  return (
    <form
      id={formId}
      className="border-border bg-card relative flex flex-col gap-7 rounded-[16px] border p-5 md:p-6"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={headingId}
    >
      <div
        className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <input
          tabIndex={-1}
          autoComplete="off"
          name="website"
          value={values.website}
          onChange={(event) =>
            setValues((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-name`} className="text-foreground block text-[15px] font-medium">
            Your name
          </label>
          <Input
            id={`${formId}-name`}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
            disabled={status === 'submitting'}
            required
          />
          {fieldErrors.name ? (
            <p id={`${formId}-name-error`} className="text-destructive m-0 text-sm">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-email`} className="text-foreground block text-[15px] font-medium">
            Email
          </label>
          <Input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="you@company.com"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
            disabled={status === 'submitting'}
            required
          />
          {fieldErrors.email ? (
            <p id={`${formId}-email-error`} className="text-destructive m-0 text-sm">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-foreground mb-2.5 block text-[15px] font-medium">
          What do you need?
        </legend>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {intents.map((intent) => {
            const selected = values.intent === intent.id;
            return (
              <label
                key={intent.id}
                className={cn(
                  'focus-within:ring-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-[15px] transition-colors focus-within:ring-3',
                  selected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                )}
              >
                <input
                  type="radio"
                  name="intent"
                  value={intent.id}
                  checked={selected}
                  onChange={() =>
                    setValues((current) => ({ ...current, intent: intent.id }))
                  }
                  className="sr-only"
                  disabled={status === 'submitting'}
                />
                {selected ? <LiveDot /> : <span className="size-1.5 shrink-0 rounded-full bg-transparent" aria-hidden="true" />}
                {intent.label}
              </label>
            );
          })}
        </div>
        {fieldErrors.intent ? (
          <p className="text-destructive m-0 text-sm">{fieldErrors.intent}</p>
        ) : null}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-message`} className="text-foreground block text-[15px] font-medium">
          Your brief
        </label>
        <Textarea
          id={`${formId}-message`}
          name="message"
          value={values.message}
          onChange={(event) =>
            setValues((current) => ({ ...current, message: event.target.value }))
          }
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
          disabled={status === 'submitting'}
          placeholder="Scope, timeline, and where you're stuck — enough to start a useful reply."
          required
        />
        {fieldErrors.message ? (
          <p id={`${formId}-message-error`} className="text-destructive m-0 text-sm">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive m-0 text-sm leading-normal" role="alert">
          {error}{' '}
          <a href={mailto} className="text-foreground underline underline-offset-4">
            Email me instead
          </a>
        </p>
      ) : null}

      <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground m-0 max-w-[34ch] text-[15px] leading-[1.55]">
          I reply to the email you enter.
        </p>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-40"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending brief…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
