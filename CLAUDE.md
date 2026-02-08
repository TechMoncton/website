# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Tech Moncton website - a bilingual community site for tech meetups in Moncton, New Brunswick. Built with Astro, React, and Tailwind CSS. Newsletter subscriptions are handled by Mailchimp.

## Key Architecture Decisions

### Events Data Source

Events are fetched directly from the [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) GitHub repository at **build time** (not from a database). The event JSON files are located at:
- `MeetUps {YEAR}/MeetUps {YEAR}.json`

Event schema: `{ date, time, topic, presentation }`

### Newsletter (Mailchimp)

The subscribe form POSTs directly to Mailchimp's embedded form endpoint. No backend needed — Mailchimp handles verification, unsubscription, and sending updates natively.

Config comes from a single environment variable:
- `PUBLIC_MAILCHIMP_URL` — full Mailchimp form action URL (includes `u`, `id`, `f_id` as query params)

### Internationalization

- URL-based routing: `/en/` and `/fr/`
- Translations in `src/i18n/translations/{en,fr}.json`
- `useTranslations(lang)` function returns a `t()` helper
- Browser language detection on root page redirects to appropriate locale

## Development Commands

```bash
npm run dev                                 # Start Astro dev server
npm run build                               # Build site (runs astro check first)
```

## File Locations

| What | Where |
|------|-------|
| Translations | `src/i18n/translations/*.json` |
| shadcn components | `src/components/ui/*.tsx` |
| Page components | `src/components/astro/*.astro` |
| React components | `src/components/react/*.tsx` |

## Common Tasks

### Adding a New Translation Key

1. Add to `src/i18n/translations/en.json`
2. Add to `src/i18n/translations/fr.json`
3. Use with `t('section.key')` in components

### Creating a New Page

1. Create `src/pages/en/pagename.astro`
2. Create `src/pages/fr/pagename.astro`
3. Add nav link in `Header.astro` if needed
4. Add translations for page content

## Sending a Campaign

`npm run send-campaign` creates and sends a Mailchimp campaign with the next upcoming event. It can also be triggered manually from **Actions > Send Campaign** in GitHub.

Env vars (set as GitHub secrets for the workflow):
- `MAILCHIMP_API_KEY` — API key (includes dc suffix, e.g. `xxx-us19`)
- `MAILCHIMP_LIST_ID` — audience/list ID
- `MAILCHIMP_REPLY_TO` — reply-to email address
- `UPDATE_FALLBACK_LINK` — (optional) fallback URL when no upcoming events
- `PUBLIC_SITE_URL` — base site URL (defaults to `https://monctontechhive.ca`)

## Environment Variables

Set in `.env` locally, and as GitHub repository variables for production builds:

```
PUBLIC_MAILCHIMP_URL   # Full Mailchimp form action URL (with u, id, f_id query params)
PUBLIC_SITE_URL        # Base URL of the site
```

Campaign-specific secrets (set in GitHub Settings > Secrets):

```
MAILCHIMP_API_KEY      # Mailchimp API key (with dc suffix)
MAILCHIMP_LIST_ID      # Audience / list ID
MAILCHIMP_REPLY_TO     # Reply-to email for campaigns
UPDATE_FALLBACK_LINK   # Fallback URL when no upcoming events
```

## Production

- Site hosted on GitHub Pages
- Domain: monctontechhive.ca
- Newsletter managed via Mailchimp
