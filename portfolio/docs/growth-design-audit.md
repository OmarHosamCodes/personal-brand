# Growth Design Audit — Portfolio one-pager

Target: Astro one-pager (`src/pages/index.astro`) + OD hero B direction.
Audience: startup founders / clients.
Date: 2026-08-23

## 1. Psych Framework Analysis

**Net Perceived Value Assessment:**
- **Motivation signals found:** Clear name + senior title; three offer chips; proof-led work cards; consult CTA.
- **Friction points found:** Phone is placeholder until Omar replaces it; social proof section empty by design until real logos arrive.
- **Psych Additions present:** Offer chips as progressive disclosure into mailto subjects; work problem/contribution/outcome structure.
- **Psych Subtractions to fix:** None critical after removing badge walls and fake metrics.
- **Labor Illusion usage:** Missing — intentional for v1 static page; motion field is atmospheric not labor.

## 2. B.I.A.S. Behavioral Audit

| Dimension | Status | Finding |
| :--- | :---: | :--- |
| **Block** | Pass | Portrait + Syne name establish trust; orange CTA singular. |
| **Interpret** | Pass | Tagline states what Omar builds in founder language. |
| **Act** | Pass | One primary Book a consult; secondary See selected work. |
| **Store** | Pass | Contact section repeats email/phone/socials as calm end state. |

## 3. C.L.E.A.R. Scorecard

| Dimension | Score (1-5) | Finding |
| :--- | :---: | :--- |
| **C** - Copywriting | 4/5 | Outcome-led tagline; avoid inflated year/project counts. |
| **L** - Layout | 5/5 | Hero B two-column; section order matches Z-scan to contact. |
| **E** - Emphasis | 5/5 | Single kinetic orange primary; chips secondary. |
| **A** - Accessibility | 4/5 | Skip link, 44px targets, dark AA tokens; verify focus on all links. |
| **R** - Reward | 3/5 | Mailto opens client (system feedback); no in-page success toast needed. |
| **Total Score** | **21/25** | |

## 4. UI Rules of Thumb

- **Page Type Identified:** Landing
- **Compliance Analysis:** One primary objective (consult). Real portrait. Social proof deferred until real — better empty than fake.

## 5. Psychological Triggers

- **IKEA Effect:** Missed Opportunity — acceptable for portfolio; offers mailto subjects give light customization.
- **Zeigarnik Effect:** Present — secondary CTA pulls to #work unfinished scan.
- **Loss Aversion:** Missed Opportunity — avoid fake scarcity; keep honest availability.

## Priority 1 fixes applied / tracked

1. Dark default on `<html>` so first paint matches brand night.
2. Empty proof section instead of invented logos.
3. Phone marked placeholder in content-freeze until real number.
