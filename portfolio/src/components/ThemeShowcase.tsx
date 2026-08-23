import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const tabClass =
  'inline-flex h-12 items-center gap-2.5 rounded-[10px] px-3 text-[15px] transition-[background-color,border-color,color] duration-[var(--duration-control)] ease-[var(--ease-broadcast)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring';

function ThemePanel({ mode }: { mode: 'light' | 'dark' }) {
  const isDark = mode === 'dark';
  return (
    <section
      className={isDark ? 'dark' : undefined}
      data-mode={mode}
      aria-label={`${mode} theme panel`}
    >
      <div className="space-y-8 rounded-[16px] border border-border bg-background p-6 text-foreground md:p-8">
        <header className="space-y-5">
          <p className="font-label text-muted-foreground">
            {isDark ? 'Broadcast night' : 'Paper canvas'} · {mode}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <BrandMark className="size-12 shrink-0 text-foreground" decorative />
            <div className="min-w-0 space-y-3">
              <h2 className="font-display m-0 text-[clamp(2rem,6vw,3.5rem)] font-semibold text-foreground">
                Omar Hosam
              </h2>
              <p
                className="font-arabic m-0 text-[clamp(1.5rem,4vw,2.5rem)] font-semibold text-foreground"
                lang="ar"
                dir="rtl"
              >
                عمر حسام
              </p>
            </div>
          </div>

          <p className="m-0 max-w-[55ch] text-[15px] leading-[1.55] text-muted-foreground">
            Systems craft theme check — primitives on the Creator Broadcast
            Pipeline tokens.
          </p>
        </header>

        <Separator />

        <div className="space-y-3">
          <p className="font-label text-muted-foreground">Buttons</p>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-label text-muted-foreground">Badge · input</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-2.5 py-2 font-mono text-[11px] font-medium tracking-[0.08em] text-foreground uppercase">
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              Live
            </span>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Input
              className="max-w-xs"
              placeholder="you@example.com"
              aria-label="Email sample"
            />
            <Input
              className="max-w-xs"
              placeholder="Disabled"
              disabled
              aria-label="Disabled email sample"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-label text-muted-foreground">Nav tabs</p>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Sample nav"
          >
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className={`${tabClass} bg-foreground text-background`}
            >
              Work
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              className={`${tabClass} border border-border bg-transparent text-foreground hover:bg-muted`}
            >
              Writing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              className={`${tabClass} border border-border bg-transparent text-foreground hover:bg-muted`}
            >
              About
            </button>
          </div>
        </div>

        <Card className="shadow-none ring-1 ring-border">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-serif)] text-[18px] tracking-tight">
              Flat card
            </CardTitle>
            <CardDescription className="text-[15px] leading-[1.55]">
              Resting cards use border + tone. Shadow is reserved for functional
              overlap.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[15px] leading-[1.55]">
            Primary, ring, and chart tokens share the kinetic orange family.
            WCAG AA pairs validated for light and dark.
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="font-label text-muted-foreground">Type scale</p>
          <div className="space-y-3">
            <p className="font-display m-0 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold">
              Display / Syne
            </p>
            <p className="m-0 text-[18px] font-semibold tracking-tight font-[family-name:var(--font-serif)]">
              Title eighteen
            </p>
            <p className="m-0 max-w-[65ch] text-[15px] leading-[1.55]">
              Body fifteen — IBM Plex Sans for explanations and calm measure.
            </p>
            <p className="font-label m-0 text-muted-foreground">
              Label eleven mono
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-label text-muted-foreground">Chart ramp</p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Chart colors">
            {(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const).map(
              (token) => (
                <span
                  key={token}
                  role="listitem"
                  className="size-8 rounded-[8px] border border-border"
                  style={{ background: `var(--${token})` }}
                  title={token}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ThemeShowcase() {
  return (
    <div className="space-y-10">
      <ThemePanel mode="dark" />
    </div>
  );
}
