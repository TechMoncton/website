# Tech Moncton Website

A bilingual (English/French) website for Tech Moncton community meetups, built with Astro, React, and Tailwind CSS.

**Live site:** https://monctontechhive.ca

## Features

- Bilingual support (EN/FR) with browser language detection
- Events display from [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) GitHub repo
- Newsletter subscription via Mailchimp
- Dark mode (follows system preference)
- Responsive design with shadcn/ui components

## Tech Stack

- **Framework:** Astro 5 with React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Newsletter:** Mailchimp
- **Hosting:** GitHub Pages

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── react/        # React components (LanguageSwitcher, ThemeToggle)
│   └── astro/        # Astro components (EventCard, Header, SubscribeForm, etc.)
├── i18n/             # Translations (en.json, fr.json)
├── layouts/          # BaseLayout
├── lib/              # Utilities (events fetching, etc.)
├── pages/
│   ├── en/           # English pages
│   └── fr/           # French pages
└── styles/           # Global CSS
```

## Local Development

### Prerequisites

- Node.js 18+

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

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Mailchimp values (from Mailchimp > Audience > Signup forms > Embedded forms).

5. Start the dev server:
   ```bash
   npm run dev
   ```

The site will be available at http://localhost:4321

## Environment Variables

### Frontend (`.env`)

```
PUBLIC_MAILCHIMP_URL=https://example.us1.list-manage.com/subscribe/post?u=XXXXX&id=XXXXX&f_id=XXXXX
PUBLIC_SITE_URL=http://localhost:4321
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run send-campaign` | Send a Mailchimp campaign with the next upcoming event |

## Deployment

The site deploys to GitHub Pages via GitHub Actions on push to `main`.

### Production Environment Variables

Set these as GitHub repository variables (Settings > Secrets and variables > Actions > Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_MAILCHIMP_URL` | Full Mailchimp form action URL | `https://example.us1.list-manage.com/subscribe/post?u=...&id=...&f_id=...` |
| `PUBLIC_SITE_URL` | Production site URL | `https://monctontechhive.ca` |

### Campaign Secrets

Set these as GitHub repository secrets (Settings > Secrets and variables > Actions > Secrets) for the **Send Campaign** workflow:

| Secret | Description |
|--------|-------------|
| `MAILCHIMP_API_KEY` | Mailchimp API key (includes dc suffix, e.g. `xxx-us19`) |
| `MAILCHIMP_LIST_ID` | Mailchimp audience / list ID |
| `MAILCHIMP_REPLY_TO` | Reply-to email address for campaigns |
| `UPDATE_FALLBACK_LINK` | (Optional) Fallback URL when no upcoming events |

To send a campaign, go to **Actions > Send Campaign > Run workflow**.

## Data Source

Events are fetched at build time from the [TechMoncton/Meetups](https://github.com/TechMoncton/Meetups) repository.

The site automatically rebuilds daily at 6am AST to pick up any event changes. If you need changes to appear sooner, you can manually trigger a rebuild from **Actions > Deploy to GitHub Pages > Run workflow**.

## License

MIT
