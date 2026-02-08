# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Tech Moncton website - a bilingual community site for tech meetups in Moncton, New Brunswick. Built with Astro, React, and Tailwind CSS. Newsletter subscriptions are handled by EmailOctopus.

## Key Architecture Decisions

### Events Data Source

Events are fetched directly from the [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) GitHub repository at **build time** (not from a database). The event JSON files are located at:
- `MeetUps {YEAR}/MeetUps {YEAR}.json`

Event schema: `{ date, time, topic, presentation }`

### Newsletter (EmailOctopus)

The subscribe form uses an EmailOctopus JavaScript embed. No backend needed — EmailOctopus handles form rendering, validation, unsubscribe compliance, and GDPR. Campaigns are created and sent manually through the EmailOctopus dashboard.

Config comes from a single environment variable:
- `PUBLIC_EMAILOCTOPUS_FORM_ID` — UUID from EmailOctopus (Forms > Embed)

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

## Environment Variables

Set in `.env` locally, and as GitHub repository variables for production builds:

```
PUBLIC_EMAILOCTOPUS_FORM_ID   # UUID from EmailOctopus (Forms > Embed)
PUBLIC_SITE_URL               # Base URL of the site
```

## Production

- Site hosted on GitHub Pages
- Domain: monctontechhive.ca
- Newsletter managed via EmailOctopus
