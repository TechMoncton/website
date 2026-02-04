# Tech Moncton Website

A bilingual (English/French) website for Tech Moncton community meetups, built with Astro, React, and Supabase Edge Functions.

**Live site:** https://monctontechhive.ca

## Features

- Bilingual support (EN/FR) with browser language detection
- Events display from [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) GitHub repo
- Newsletter subscription with email verification
- Unsubscribe support
- Dark mode (follows system preference)
- Responsive design with shadcn/ui components

## Tech Stack

- **Framework:** Astro 5 with React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase Edge Functions (Deno)
- **Email:** Resend
- **Hosting:** GitHub Pages

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── react/        # React components (SubscribeForm, etc.)
│   └── astro/        # Astro components (EventCard, Header, etc.)
├── i18n/             # Translations (en.json, fr.json)
├── layouts/          # BaseLayout
├── lib/              # Utilities (events fetching, etc.)
├── pages/
│   ├── en/           # English pages
│   └── fr/           # French pages
└── styles/           # Global CSS

supabase/
├── functions/        # Edge Functions
│   ├── subscribe/    # Newsletter signup
│   ├── verify/       # Email verification
│   ├── unsubscribe/  # Unsubscribe handler
│   └── send-update/  # Monthly update emails
└── migrations/       # Database schema
```

## Local Development

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/TechMoncton/tech-moncton-site.git
   cd tech-moncton-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment files:
   ```bash
   cp .env.example .env
   cp supabase/.env.example supabase/.env
   ```

4. Start Supabase locally:
   ```bash
   supabase start
   ```

5. Run database migrations:
   ```bash
   supabase db reset
   ```

6. Start Edge Functions:
   ```bash
   supabase functions serve --env-file supabase/.env
   ```

7. Start the dev server (in a new terminal):
   ```bash
   npm run dev
   ```

The site will be available at http://localhost:4321

## Environment Variables

### Frontend (`.env`)

```
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SITE_URL=http://localhost:4321
```

### Edge Functions (`supabase/.env`)

```
SITE_URL=http://localhost:4321
ADMIN_KEY=<generate-a-secure-key>
UPDATE_FALLBACK_LINK=https://facebook.com/your-page
RESEND_API_KEY=re_xxxxx  # Optional for local dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run send-update` | Trigger monthly update email |

## Edge Functions

### subscribe

Handles newsletter signups. Validates email, creates/updates subscriber record, sends verification email.

**Endpoint:** `POST /functions/v1/subscribe`

### verify

Verifies email addresses via token. Marks subscriber as verified.

**Endpoint:** `GET /functions/v1/verify?token=<uuid>`

### unsubscribe

Removes subscribers from the mailing list.

**Endpoint:** `GET /functions/v1/unsubscribe?token=<uuid>`

### send-update

Sends update emails to verified subscribers. Automatically fetches the next upcoming event from the GitHub Meetups repo and includes it in the email. If no upcoming events exist, uses `UPDATE_FALLBACK_LINK` instead.

**Endpoint:** `POST /functions/v1/send-update`

**Authentication:** Requires `x-admin-key` header matching the `ADMIN_KEY` environment variable.

**Local testing:**
```bash
npm run send-update
```

**Manual curl request:**
```bash
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/send-update \
  -H "x-admin-key: YOUR_ADMIN_KEY"
```

**Generating an ADMIN_KEY:**
```bash
# Generate a secure 32-byte hex key
openssl rand -hex 32
```

**Setting up scheduled sends (production):**

Option 1: Use a cron service (cron-job.org, EasyCron, etc.) to POST to the endpoint monthly.

Option 2: Use GitHub Actions with a scheduled workflow:
```yaml
# .github/workflows/send-update.yml
name: Send Monthly Update
on:
  schedule:
    - cron: '0 14 1 * *'  # 2pm UTC on the 1st of each month
  workflow_dispatch:  # Allow manual trigger

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/send-update \
            -H "x-admin-key: ${{ secrets.ADMIN_KEY }}"
```

## Deployment

The site deploys to GitHub Pages via GitHub Actions on push to `main`.

### Production Environment Variables

Set these in your Supabase project dashboard under Edge Functions > Secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `SITE_URL` | Production URL for email links | `https://monctontechhive.ca` |
| `ADMIN_KEY` | Secure key for send-update auth | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend API key for sending emails | `re_xxxxx` |
| `EMAIL_FROM` | From address for emails | `Tech Moncton <noreply@monctontechhive.ca>` |
| `UPDATE_FALLBACK_LINK` | Link to use if no upcoming events | `https://facebook.com/yourpage` |

If using GitHub Actions for scheduled sends, also add to repository secrets:
- `SUPABASE_URL` - Your Supabase project URL
- `ADMIN_KEY` - Same key as above

## Data Source

Events are fetched at build time from the [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) repository.

The site automatically rebuilds daily at 6am AST to pick up any event changes. If you need changes to appear sooner, you can manually trigger a rebuild from **Actions > Deploy to GitHub Pages > Run workflow**.

## License

MIT
