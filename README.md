# TovarkaDuck — e-commerce MVP

Next.js (App Router) + PostgreSQL (Drizzle ORM) storefront and admin panel,
built for Google Ads-driven sales: guest checkout, GA4/Google Ads event
tracking, SEO-ready product pages, and an admin panel for day-to-day catalog
and order management.

This code was generated in a sandboxed environment without npm registry
access, so dependencies were never installed and `next build` was never run
here. Follow the steps below in your own machine or CI before deploying.

## 1. Install dependencies

```bash
npm install
```

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in at minimum:
- `DATABASE_URL` — a Postgres connection string (Neon, Supabase, or Vercel Postgres all work well with Vercel).
- `ADMIN_SESSION_SECRET` — any long random string (e.g. `openssl rand -hex 32`).
- `NEXT_PUBLIC_SITE_URL` — your real production domain once known.

Leave the Google Ads / GA4 / payment / Nova Poshta variables empty until
those accounts exist — the app runs correctly without them (analytics
scripts and online payment simply stay disabled, see
`src/components/layout/AnalyticsScripts.tsx` and `src/server/adapters`).

## 3. Create the database schema

```bash
npm run db:generate   # generates SQL migrations from src/server/db/schema.ts
npm run db:migrate    # applies them to DATABASE_URL
```

## 4. Create your first admin user

```bash
npm run create-admin -- admin@tovarkaduck.com "ChooseAStrongPassword123"
```

Log in at `/admin/login`.

## 5. (Optional) seed a demo product

```bash
npm run db:seed
```

This inserts one demo category/product so the storefront isn't empty on
first run. Replace it with real TovarkaDuck products via `/admin/products`
— no fake data is meant to reach production.

## 6. Run locally

```bash
npm run dev
```

## 7. Deploy

- **Frontend**: push to GitHub and import the repo in Vercel.
- **Database**: point `DATABASE_URL` at your managed Postgres instance
  (Neon/Supabase integrate with Vercel with one click).
- Set all environment variables from `.env.example` in the Vercel project
  settings (never commit `.env.local`).
- Run `npm run db:migrate` against the production database as part of your
  deploy step (or manually the first time).

## What's intentionally stubbed for MVP

- **Online payment**: `src/server/adapters/payments` defines the
  `PaymentAdapter` interface. Only a cash-on-delivery adapter is implemented.
  Add a real provider (LiqPay, Fondy, Monobank Acquiring, etc.) by
  implementing the interface and switching it in
  `src/server/adapters/payments/index.ts` — no other code needs to change.
- **Nova Poshta API**: `src/server/adapters/shipping` defines the
  `ShippingAdapter` interface. City/warehouse are free-text fields collected
  at checkout; staff create the actual shipment in Nova Poshta's own tools
  and paste the tracking number into `/admin/orders/[id]`. Swap in the real
  API the same way as payments.
- **Product image upload**: the admin panel accepts an image URL (paste
  after uploading elsewhere). Wire up direct upload to object storage
  (Vercel Blob, S3, Cloudflare R2) by replacing the URL field with an
  upload widget that calls that provider and stores the resulting URL.
- **Reviews / trust numbers**: no fake reviews, ratings, or sales figures are
  included anywhere. The reviews table and UI section are ready to receive
  real, moderated reviews.
- **Catalog filters** (price/size/color/availability): the catalog page
  lists products and supports category + new/sale views; full filter UI
  should be added once there's a real assortment large enough to filter.

## Project structure

```
src/
  app/            Route Handlers, pages (storefront + /admin), layouts
  components/     UI building blocks (layout, product, cart, admin, trust)
  server/
    db/           Drizzle schema, connection, migrate/seed scripts
    services/     Business logic (catalog, cart, orders, admin CRUD, auth)
    adapters/     Payment & shipping provider interfaces (swappable)
    validators/   Zod schemas shared by forms and server actions
    auth/         Admin JWT session handling
  lib/            Analytics (GTM/GA4 events), SEO helpers, formatting, cart cookie
  types/          Shared TypeScript types
```

## Analytics & Google Ads

Events implemented end-to-end (see `src/lib/analytics/gtag.ts` and their call
sites): `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`,
`begin_checkout`, `purchase` (deduplicated per order number on the
thank-you page at `/order/success/[orderNumber]`).

UTM parameters and `gclid` are captured on first touch by `src/middleware.ts`
and stored on the order (`orders.utm_*`, `orders.gclid`) for offline
conversion import / attribution reporting.

Set `NEXT_PUBLIC_GTM_ID` once a GTM container exists; the base snippet loads
automatically from `AnalyticsScripts`.

## Security notes

- `/admin/*` (except `/admin/login`) is gated by `src/middleware.ts`, which
  requires a valid signed session cookie.
- Passwords are hashed with bcrypt; sessions are signed JWTs in an httpOnly
  cookie (`ADMIN_SESSION_SECRET`).
- All checkout input is re-validated server-side with Zod
  (`src/server/validators/checkout.ts`), independent of client-side form
  validation.
- Stock is reserved inside a single DB transaction with row locking
  (`src/server/services/orderService.ts`) to prevent overselling.
- No secret keys are referenced from client components; payment/shipping API
  keys stay server-only in `.env`.
