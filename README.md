# Yogi Tours & Travels

A dynamic, database-backed website for a Bangalore tours & travels agency — cars, Tempo
Travellers, mini buses, tourist buses, airport transfers, outstation trips and tour
packages — with a working enquiry pipeline and an admin panel to manage every piece of
content without touching code.

**⚠️ Before going live:** read [`PLACEHOLDER_DATA.md`](./PLACEHOLDER_DATA.md) — it lists
every placeholder (phone/WhatsApp/email, address, photos, testimonials) and exactly
where to replace it. No business facts, statistics or reviews were fabricated; every
unknown was left as a clearly-marked placeholder instead.

## Stack

- **Server:** Node.js + Express, TypeScript, server-rendered EJS views (no client-side framework)
- **Database:** SQLite via Node's built-in `node:sqlite` — zero native dependencies, zero setup
- **Frontend:** Tailwind CSS (compiled, not CDN) + vanilla TypeScript (bundled with esbuild) for all interactivity — mobile menu, booking widget tabs, form validation/submission, FAQ accordion, gallery lightbox, testimonial carousel, scroll reveal
- **Admin panel:** session-authenticated (`/admin`), config-driven CRUD for vehicles, services, tour packages, FAQs, testimonials, gallery and blog posts, plus an enquiries inbox

Why a real backend instead of a static site: content (fleet, pricing-free "get quote"
services, packages, blog, gallery) is meant to change over time without a developer
editing code, and every booking/contact form genuinely persists to a database rather
than just composing a WhatsApp link.

## Project structure

```
src/
  server/
    app.ts            Express app, middleware, route mounting
    config/            env.ts (business info + settings), nav.ts (menu structure)
    db/                schema.ts, connection.ts, seed.ts, repo.ts (generic CRUD), content.ts, enquiries.ts
    middleware/         auth, csrf, upload (multer), view locals, error handling
    routes/             one file per site area (pages, vehicles, services, packages, gallery, blog, api, seo)
      admin/            login/auth, dashboard, enquiries, generic resource CRUD factory
    utils/               slug, whatsapp message builder, validators, schema.org JSON-LD, mailer
    types/               shared TypeScript interfaces
  views/                EJS templates
    partials/            header, footer, mobile menu, booking widget, enquiry modal, icons, SEO head
    components/           vehicle-card, service-card, package-card, testimonial-card, faq-item, smart-image
    pages/                one template per public page
    admin/                admin panel views (generic-list/generic-form drive all 7 content types)
  client/               TypeScript, bundled to public/js/main.js
    modules/              one module per interactive feature
  styles/                main.css (Tailwind + hand-rolled component classes)
public/                  compiled CSS/JS + static assets + uploaded photos land here
data/                    app.db (SQLite file, gitignored)
scripts/                 smoke-test.ts — crawls the whole site and reports broken links
```

## Getting started

```bash
npm install
cp .env.example .env        # already done for local dev — edit values as needed
npm run seed                 # creates tables + seeds vehicles/services/packages/faqs/etc. + the admin user
npm run dev                   # starts the server (tsx watch), Tailwind (watch) and esbuild (watch) together
```

Visit `http://localhost:3000`. Admin panel: `http://localhost:3000/admin/login`
(credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` — change the password
from `/admin/settings` after first login).

`npm run seed` is idempotent — re-running it never duplicates content; each content
table is only seeded once (checked via row count), so it's safe to run again.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Full dev environment: server (auto-restart on change), Tailwind (watch), client TS (watch) |
| `npm run build` | Production build: typecheck → compile CSS (minified) → bundle client TS (minified) → compile server TS to `dist/` |
| `npm start` | Runs the compiled production build (`node dist/server/app.js`) — run `npm run build` first |
| `npm run typecheck` | Strict TypeScript check across server, client and scripts — no `any` used without reason |
| `npm run seed` | Populate/verify the database |
| `npm run smoke` | Crawls the running site from `/` and reports any broken internal link (set `SMOKE_BASE_URL` to point elsewhere) |

## Deployment notes

- Needs a Node.js host that can run a persistent server (Render, Railway, Fly.io, a VPS,
  etc.) — this is **not** a static site, so static-only hosts (GitHub Pages, plain S3)
  won't work.
- Set every variable in `.env.example` as real environment variables on the host,
  especially `SITE_URL` (real domain), `SESSION_SECRET` (a long random string —
  `openssl rand -hex 32`), and `ADMIN_PASSWORD`.
- The SQLite database (`data/app.db`) is a single file — back it up regularly. On
  platforms with ephemeral filesystems (some serverless/container platforms reset local
  disk on redeploy), mount `data/` and `public/assets/uploads/` on persistent storage,
  or migrate to a hosted Postgres/MySQL later.
- Sessions use Express's in-memory store by default (see `PLACEHOLDER_DATA.md` §10) —
  fine for a single instance, swap to a persistent store before scaling horizontally.

## What's real vs. placeholder

Everything about the *site itself* — every route, form, validation rule, admin CRUD
action, the database schema, the enquiry pipeline — is fully functional, not mocked.
What's placeholder is *business information that wasn't provided*: phone/WhatsApp/email
(usable but not real numbers), address (city-level only, no fabricated street address),
photography (branded placeholder graphics, swappable via `/admin`), testimonials
(clearly labelled as samples), and statistics (deliberately absent rather than invented).
Full list: [`PLACEHOLDER_DATA.md`](./PLACEHOLDER_DATA.md).
