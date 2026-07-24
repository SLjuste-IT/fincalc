# KakouCalc

**A free suite of 77 financial, investment, loan, retirement, and stock calculators.**

🔗 **Live:** <https://kakoucalc.serverkakoulabs.org>

KakouCalc is a fast, static, privacy-friendly calculator site. Every calculation runs
entirely in the visitor's browser — no accounts, no data collection — and every
calculator ships as a real, server-rendered page with a genuine worked example, so it's
useful before a single line of JavaScript runs.

## Features

- **77 calculators** across 7 categories: Finance & Investment, Loan & Mortgage,
  Retirement, Stock, Credit Card, Auto Loan & Lease, and Miscellaneous.
- **Static & multi-page** — one real, crawlable URL per calculator (`/calc/<id>`), each
  prerendered with a real computed example (not a `$0.00` shell).
- **Editorial layer** — hand-written guides (formula, worked example, key terms, FAQ) on
  the deepest-covered calculators, plus an auto-generated *How to use* + *Worked example*
  on every page, derived from each tool's real fields and the engine's own numbers.
- **Independently verified math** — a standalone suite recomputes every calculator from
  first principles and checks every quoted example figure (`scripts/verify-math.mjs`).
- **Embeddable widgets** — each calculator has an `/embed/<id>` iframe version for other
  sites, with attribution links back to KakouCalc.
- **Blog + trust pages** — explainer articles, plus About, Methodology, Privacy, Terms,
  and Contact.
- **Privacy-first** — calculations never leave the browser; the site's own code runs no
  analytics and sets no cookies (only a light light/dark theme preference in
  `localStorage`).

## Tech stack

- **[Astro](https://astro.build)** — static site generator (`output: "static"`)
- Dependency-light: no UI framework; result charts are hand-rolled inline SVG
- **Cloudflare Pages** — hosting and CI builds
- **Node 22** (see [`.nvmrc`](.nvmrc))

## Getting started

Prerequisites: **Node.js 20+** (22 recommended) and npm.

```bash
npm install            # install dependencies

npm run dev            # dev server at http://localhost:4321
npm run build          # production build → dist/ (refreshes FX/CPI first)
npm run build:offline  # build using committed data, no network fetch
npm run preview        # preview the production build locally

node scripts/verify-math.mjs   # run the math verification suite
```

Absolute URLs (canonical, sitemap, Open Graph) come from `SITE_URL`. Set it when
building outside Cloudflare so they don't fall back to `localhost`:

```powershell
$env:SITE_URL="https://kakoucalc.serverkakoulabs.org"; npm run build
```

On Cloudflare Pages, `SITE_URL` is an environment variable (with `CF_PAGES_URL` as a
fallback).

## Project structure

```
src/
  pages/       Routes: index, calc/[id], embed/[id], blog, about, methodology,
               privacy, terms, contact, 404, robots.txt
  layouts/     Base.astro — shared <head>, header, sidebar, footer
  lib/         calculators.js  the DOM-free calculation engine (all 77 tools)
               render.js       form + result HTML builders (build- and client-side)
               explain.js      auto-generated How-to-use + worked example
               charts.js       inline-SVG result charts
               display.js      label helpers
  data/        site.js         identity / editorial constants
               guides.js       hand-written full guides
               explainers.js   hand-written formula + key terms + FAQ (added in batches)
               examples.js     realistic example inputs, one set per calculator
               articles.js     blog posts
               reference.json  FX / CPI data, refreshed at build time
  scripts/     client-side calculator + UI behavior
  styles/      global.css
scripts/       fetch-data.mjs    refresh FX/CPI at build time
               verify-math.mjs   independent math verification
               gen-og-image.mjs  social-card generator
public/        static assets (favicon.svg, og-image.png)
```

## Adding content

- **A new calculator** — add its definition (fields + `compute()`) to
  `src/lib/calculators.js`; a real `/calc/<id>` page, an `/embed/<id>` widget, and a
  sitemap entry all fall out automatically. Add a realistic example to
  `src/data/examples.js`.
- **A guide, or formula/FAQ depth** — add an entry to `src/data/guides.js` (full guide)
  or `src/data/explainers.js` (formula + terms + FAQ). Every figure quoted must match the
  engine — `verify-math.mjs` enforces it.
- **A blog post** — add to `src/data/articles.js`.

## Deployment

Static build deployed to **Cloudflare Pages** (Git-connected): build command
`npm run build`, output directory `dist`. See **[DEPLOY.md](DEPLOY.md)** for the full
deployment guide, the daily data-refresh setup, and the reasoning behind the
architecture.

## Disclaimer

KakouCalc is for **education and general information only** — not financial, investment,
tax, or legal advice. Results are estimates based on the inputs you provide. See the
[methodology](https://kakoucalc.serverkakoulabs.org/methodology) page for how the tools
are built and verified.

## License

Personal project. The source is provided as-is and is **not** currently released under an
open-source license — please don't republish the content or code wholesale. (Add a
`LICENSE` file to change this.)
