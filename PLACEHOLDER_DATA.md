# Placeholder Data — Replace Before Going Live

This project was built without fabricating any business facts, reviews, statistics or
credentials. Everywhere real information wasn't available, a clearly-marked placeholder
was used instead — several of those have since been replaced with real details you
provided (phone numbers, WhatsApp, domain, some per-km rates). This file lists what's
real, what's still placeholder, and where to change it.

## 1. Contact details — now real (`.env`)

Confirmed from your WhatsApp Business catalog/card, already live on the site:

| Variable | Current value | Status |
|---|---|---|
| `BUSINESS_PHONE` | `+91 97410 32020` | ✅ Real |
| `BUSINESS_WHATSAPP` | `+91 98867 70099` | ✅ Real |
| `BUSINESS_EMAIL` | `info@yogitourstravels.com` | Inferred from your domain `yogitourstravels.com` — confirm this inbox actually exists/is monitored |
| `SITE_URL` | `http://localhost:3000` | ⚠️ **Still needs changing** to `https://yogitourstravels.com` (or wherever this deploys) before launch — it feeds canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `change-this-password` | ⚠️ Still placeholder — only used the *first* time `npm run seed` runs, to create the admin account. Change the password from `/admin/settings` after first login. |

All of these are centralised in `.env` (copy from `.env.example` if needed) — edit and restart the server.

## 1b. Vehicle pricing — partially real

Per-km rates shown on vehicle cards/detail pages (`ratePerKm` field, editable per-vehicle
in `/admin/vehicles`) were filled in **only** where confirmed from your WhatsApp catalog
screenshots: Sedan ₹11/km, Ertiga ₹16/km, Innova/Innova Crysta ₹18/km, 9-Seater Tempo
Traveller ₹30/km, 12-Seater Tempo Traveller ₹21/km, Luxury Tempo Traveller ₹35/km,
21-Seater Mini Bus ₹33/km. Every other vehicle (Innova Hycross, Force Urbania, tourist
buses, etc.) still shows "Get Best Quote" since no confirmed rate was available — add
real rates for these anytime via `/admin/vehicles` rather than guessing.

## 2. Address & map (`src/server/config/env.ts`)

`business.addressLine` is currently `"Bangalore, Karnataka, India"` — a truthful
city-level description, not a fabricated street address. Once you have a real
registered address, update the `business` object in `src/server/config/env.ts`.

No Google Maps embed or Google Business Profile link is included, since none was
provided — `business.googleBusinessProfile` is an empty string (see `src/server/config/env.ts`).
Add your real listing URL there once you have one; it's already wired into
`about.ejs`'s "leave us a review" link.

## 3. Social links (`src/server/config/env.ts`)

`business.social.{facebook,instagram,youtube,twitter}` are empty strings. The footer
renders the icons regardless (so the layout doesn't shift once you add them), but each
currently links to `#`. Fill in real profile URLs when available.

## 4. Photography — now partly real

All 20 tour package/destination pages and 7 featured vehicles now show **real,
properly-licensed photography** (Wikimedia Commons, CC-BY-SA/GFDL — free for commercial
reuse with attribution). Full credit list is public at `/photo-credits` and in
`IMAGE_CREDITS.json` at the project root. These are stock photos of the destinations/
vehicle models, not photos of your actual fleet or trips.

Everything else (services, remaining 14 vehicles, gallery, blog covers, the About/Contact
page images) still uses the original **branded placeholder system**
(`src/views/components/smart-image.ejs` — gradient + icon + label) rather than an
unrelated stock photo, per the original brief's "never use random images just to fill
space" rule.

**To add your own real photos** (recommended for the fleet especially, since the current
vehicle photos are stock/generic, not your actual vehicles): log into `/admin`, open any
Vehicle / Service / Tour Package / Gallery Item / Blog Post, and use the "Upload Photo"
field. Uploaded images are stored in `public/assets/uploads/` and automatically replace
whatever is currently showing (placeholder or stock) — no code changes needed.

**Hero video:** the homepage hero background (`public/assets/video/hero-background.mp4`,
desktop only — mobile shows a static image instead, for data cost reasons) is an FPV
drone clip of an Iceland canyon, added at your request. It's visually striking but not
thematically South-India travel — worth swapping for real destination/fleet footage
before launch if that mismatch matters to you.

`public/assets/images/favicon.svg` and `public/assets/images/og-default.svg` are original
brand-mark graphics (not stock imagery). Note: **`og-default.svg` should be replaced with
a rasterised 1200×630 PNG/JPG before launch** — Facebook, Twitter/X and LinkedIn's link
preview crawlers generally don't render SVG for `og:image`, so the social-share preview
card will currently be blank on some platforms until this is swapped.

## 5. Testimonials

The six testimonials seeded in the database are **explicitly marked as placeholders**
(`isPlaceholder = 1`) and every one visibly displays a "Sample review — awaiting verified
customer feedback" notice on the site — see `src/views/components/testimonial-card.ejs`.
None are presented as real. Replace them (or add real ones alongside) via
`/admin/testimonials`, unchecking "Placeholder" once a review is genuinely from a customer.

## 6. Statistics

No invented numbers ("20 years experience", "10,000 customers", "500 vehicles", star
ratings, etc.) appear anywhere on the site, per the brief. If you want to display real
figures once you have them, the natural places are the trust strip (`pages/home.ejs`)
and the About page.

## 7. Legal pages

`/privacy-policy`, `/terms-and-conditions` and `/cancellation-policy`
(`src/views/pages/legal.ejs`) contain reasonable, honestly-written generic policy text —
they are **not a substitute for legal review**. In particular, the cancellation policy
describes tiered charges in general terms ("minimal", "partial", "higher") without fixed
percentages, since no real cancellation-fee schedule was provided. Have a professional
review these before relying on them, and fill in specific numbers where you have them.

## 8. Business hours

`src/views/pages/contact.ejs` currently shows "7:00 AM – 10:00 PM" every day as a
placeholder. Update to your real hours.

## 9. Email notifications

`SMTP_*` variables in `.env` are blank by default. Enquiries are always saved to the
database and visible in `/admin/enquiries` regardless — but until SMTP is configured,
no email notification is sent for new enquiries (the server logs a note instead). Fill
in `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `NOTIFY_EMAIL_TO` to enable it.

## 10. Session store

The admin panel uses Express's in-memory session store, which is fine for a single-
instance deployment but not for multi-instance/serverless hosting (sessions would be
lost on restart and wouldn't be shared across instances). If you deploy behind a load
balancer or on a platform that scales horizontally, swap in a persistent store (e.g.
`connect-sqlite3`, using the same database) — see `src/server/app.ts`.
