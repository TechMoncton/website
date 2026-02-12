# Contributing to Moncton Tech Hive

Welcome! This project was completely vibe coded and is open to contributions of all sizes. Whether you're fixing a typo, tweaking colors, improving translations, or adding a new feature — we'd love your help.

## Ways to contribute

- **Translations** — improve or add French/English text
- **Theming & colors** — adjust the look and feel
- **Layout & components** — improve existing pages or build new ones
- **Accessibility** — make the site work better for everyone
- **Bug fixes** — squash issues you find
- **Cleanup** — refactor code, remove dead code, improve readability

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- Basic familiarity with Git and GitHub
- A code editor (VS Code recommended)

## Local setup

```bash
# 1. Fork and clone the repo
git clone https://github.com/TechMoncton/website.git TechMoncton-website
cd TechMoncton-website

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# Open http://localhost:4321

# 4. Verify the build works
npm run build
```

## Project structure

```
src/
├── pages/              # Each page has an /en/ and /fr/ version
│   ├── index.astro     # Root — redirects to browser language
│   ├── en/index.astro  # English home page
│   └── fr/index.astro  # French home page
├── layouts/
│   └── BaseLayout.astro  # Shared HTML shell (head, header, footer)
├── components/
│   ├── astro/          # Astro components (server-rendered)
│   ├── react/          # React "islands" (interactive client-side bits)
│   └── ui/             # shadcn/ui primitives (Button, Card, etc.)
├── i18n/
│   ├── index.ts        # Translation helpers
│   └── translations/
│       ├── en.json     # English strings
│       └── fr.json     # French strings
├── lib/                # Utilities (event fetching, classname helpers)
└── styles/
    └── globals.css     # CSS variables for theming + Tailwind directives
```

### How it works

**Astro** renders pages to static HTML at build time. Most of the site is plain Astro components (`.astro` files) — HTML with a frontmatter script block at the top (between `---` fences). These run on the server only.

**React "islands"** are used for interactive bits that need client-side JavaScript (theme toggle, language switcher). They are loaded using Astro's `client:load` directive.

**Tailwind CSS** handles styling. Theme colors are defined as CSS custom properties in `src/styles/globals.css` and mapped to Tailwind color names in `tailwind.config.mjs`. Both light and dark themes are defined there.

**Translations** live in JSON files under `src/i18n/translations/`. Components use `useTranslations(lang)` to get a `t()` function: `t('home.hero.title')`.

## Common recipes

### Fixing a translation

1. Open `src/i18n/translations/en.json` or `fr.json`
2. Find the key and edit the value
3. Check both languages stay in sync (same keys in both files)

### Tweaking theme colors

1. Open `src/styles/globals.css`
2. Edit the HSL values under `:root` (light) or `.dark` (dark mode)
3. The Tailwind config maps these to class names like `bg-primary`, `text-muted-foreground`, etc.

### Editing a component

- **Astro components** (`src/components/astro/`): HTML with frontmatter. Changes show up instantly in dev.
- **React components** (`src/components/react/`): Standard React + TypeScript. Hot-reloaded in dev.
- **UI primitives** (`src/components/ui/`): shadcn/ui components — usually you don't need to edit these.

## Code style

ESLint and Prettier are configured for this project. A pre-commit hook (via husky + lint-staged) automatically lints and formats your staged files when you commit, so you generally don't need to think about it.

You can also run them manually:

```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
npm run format      # Format all files with Prettier
```

CI will also run `npm run lint` and `npm run format:check` on every pull request.

## Opening a pull request

1. Create a branch from `main`: `git checkout -b my-change`
2. Make your changes
3. Commit and push — the pre-commit hook handles lint and formatting automatically
4. Open a PR against `main` — CI will validate lint, formatting, and build
5. A maintainer will review your PR

That's it! Don't hesitate to open an issue or PR even if your change is small. Every contribution helps.
