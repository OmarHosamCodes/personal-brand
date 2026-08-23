# Deploy notes — omarhosamcodes.com

Host undecided. Node adapter (`@astrojs/node` standalone) required for contact API,
middleware AgentReady routes, CSP headers, and SSR homepage.

Before public DNS:

1. Point project `href`s to exact repos
2. Add real logos to `site.proof` if available
3. Confirm School Of Marketing naming permission
4. Set `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO` in the host env
5. After deploy, run [AgentReady Deep Scan](https://www.agentready.org/) on `https://omarhosamcodes.com`

AgentReady surfaces (middleware): `/robots.txt`, `/sitemap.xml`, `/llms.txt`,
`/llms-full.txt`, `/index.md`, `/openapi.json`, `/.well-known/api-catalog`.

Icon regen: `bash scripts/generate-icons.sh`

Possible hosts: Railway / Fly / any Node host. Static-only hosts will miss SSR + API.
