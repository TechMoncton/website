# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Tech Moncton website - a bilingual community site for tech meetups in Moncton, New Brunswick. Built with Astro, React, and Supabase Edge Functions.

## Key Architecture Decisions

### Events Data Source

Events are fetched directly from the [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) GitHub repository at **build time** (not from a database). The event JSON files are located at:
- `MeetUps {YEAR}/MeetUps {YEAR}.json`

Event schema: `{ date, time, topic, presentation }`

### No Supabase Client on Frontend

The frontend does NOT use `@supabase/supabase-js`. All Supabase interactions go through Edge Functions via direct `fetch()` calls. This simplifies the architecture and avoids exposing the anon key.

### Database Access

The `subscribers` table has Row Level Security (RLS) enabled with NO policies for anonymous users. All database operations happen through Edge Functions using the `service_role` key.

### Internationalization

- URL-based routing: `/en/` and `/fr/`
- Translations in `src/i18n/translations/{en,fr}.json`
- `useTranslations(lang)` function returns a `t()` helper
- Browser language detection on root page redirects to appropriate locale

## Development Commands

```bash
# Start everything for local development:
supabase start                              # Start local Supabase
supabase functions serve --env-file supabase/.env  # Start Edge Functions
npm run dev                                 # Start Astro dev server

# Useful commands:
npm run build                               # Build site (runs astro check first)
npm run send-update                         # Trigger update email (local)
supabase db reset                           # Reset database with migrations
```

## File Locations

| What | Where |
|------|-------|
| Translations | `src/i18n/translations/*.json` |
| Edge Functions | `supabase/functions/*/index.ts` |
| Database schema | `supabase/migrations/*.sql` |
| shadcn components | `src/components/ui/*.tsx` |
| Page components | `src/components/astro/*.astro` |
| React components | `src/components/react/*.tsx` |

## Edge Functions Environment

Edge Functions run on Deno, not Node.js. Key differences:
- Use `Deno.env.get()` instead of `process.env`
- Import from URLs: `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`
- The `supabase/` directory is excluded from TypeScript checking (see `tsconfig.json`)

### Required Environment Variables for Edge Functions

```
SITE_URL              # Base URL for links in emails
SUPABASE_URL          # Auto-provided by Supabase
SUPABASE_SERVICE_ROLE_KEY  # Auto-provided by Supabase
ADMIN_KEY             # For send-update authentication
RESEND_API_KEY        # For sending emails (optional locally)
UPDATE_FALLBACK_LINK  # Fallback URL if no upcoming events
EMAIL_FROM            # From address (default: Tech Moncton <noreply@monctontechhive.ca>)
```

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

### Adding a New Edge Function

1. Create `supabase/functions/function-name/index.ts`
2. Add config to `supabase/config.toml`:
   ```toml
   [functions.function-name]
   enabled = true
   verify_jwt = false
   ```
3. Restart `supabase functions serve`

## Security Notes

- CORS is restricted to `SITE_URL` (not `*`)
- All user-facing messages use `textContent` (not `innerHTML`) to prevent XSS
- Email validation includes length checks and format validation
- Unsubscribe returns success even for invalid tokens (prevents enumeration)
- `verification_token` is used for both verify and unsubscribe (same token)

## Production

- Site hosted on GitHub Pages
- Edge Functions hosted on Supabase
- Domain: monctontechhive.ca
- Emails sent via Resend
