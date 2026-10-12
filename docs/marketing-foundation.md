# ScriptFX marketing foundation

Implemented October 6, 2026 in the marketing repository and the existing ScriptFX Hono backend. This is a local implementation. Production activation is pending the launch decisions below.

## Public site

The homepage retains the existing cinematic design and adds the Writing → Production → Market journey. Shared navigation and the footer connect all public routes. Writing has four feature pages; Production and Market are explicitly in development and excluded from indexing. Public pricing is not invented: the pricing page explains that plans have not been announced.

The site includes Technology, About, FAQ, Contact, privacy and website terms drafts, a journal with three original articles, and a downloadable Fountain scene starter. Articles validate their metadata, reject invalid slugs, exclude drafts and future publication dates, and share the same heading identifiers between contents links and article headings. The old demonstration article remains in the repository as a draft.

The legal pages are prelaunch drafts. Complete the operator identity, jurisdiction, retention policy, processor disclosures, and actual application terms before public launch. Product feature copy needs a final availability review and real demonstrations before indexing.

## Local development

Marketing checkout: `/Users/peterperezjr/ScriptFX Landing`.

Application checkout: `/Users/peterperezjr/Documents/Clients/ScriptfXV1/scriptfxv1`.

Use Node.js 22.13 or later for the backend. The default system Node.js was version 20 during implementation; verification used the installed Node.js 23 runtime.

1. In the marketing checkout, create `.env.local` using `docs/marketing-environment.example` as a reference. For local use, set `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000`, `SCRIPTFX_API_URL=http://127.0.0.1:3002`, and a random `MARKETING_PROXY_SECRET` of at least 32 characters. Keep `SITE_INDEXABLE=false`.
2. In the application checkout's `backend` directory, run `npm run dev:marketing` with the same `MARKETING_PROXY_SECRET` in the environment.
3. Run `npm run dev -- --hostname 127.0.0.1 --port 3000` in the marketing checkout.

The local harness runs the production Hono marketing routes against an isolated, persistent PGlite Postgres database in `backend/.marketing-local/`. Its small local REST bridge listens on `127.0.0.1:54329`; the API listens on `127.0.0.1:3002`. It does not connect to production Supabase, call audio providers, or send email. The database directory is ignored by Git. A local helper is not a substitute for a production Supabase deployment test.

Stop the Next.js development server before running a production build. Both use `.next`.

## Submission contract

The browser submits to the same-origin Next.js proxy:

- `POST /api/marketing/leads`
- `POST /api/marketing/contact`

The proxy forwards to the existing Hono API:

- `POST /api/public/marketing/leads`
- `POST /api/public/marketing/contact`

Both require JSON and an `Idempotency-Key` UUID. The browser never receives the proxy secret or Supabase service key. The API mounts before the application's existing authentication middleware but accepts only requests bearing the server-side proxy secret. Browser origin checks live in the Next.js proxy.

Common fields: normalized `email`, optional `name`, relative `source`, allowlisted `attribution` (`utm_source`, `utm_medium`, `utm_campaign`), and an empty `website` bot-trap field. Leads require affirmative `consent` and an interest (`writing`, `production`, `market`, or `all`). Contacts require a category and a message of 10–5,000 characters. Maximum request size is 16 KiB.

Responses: `202` with `{ "accepted": true }` after commit; `400` for invalid input; `403` for an untrusted proxy; `409` for a reused key with a different payload; `429` for rate limits; `503` when persistence is unavailable. The UI retains entered values on failure and displays success only after acceptance. A changed payload receives a new request key; an unchanged retry keeps its original key.

## Persistence and access

Migration: `supabase/migrations/20261006215122_marketing_foundation.sql` in the application repository.

Tables: `marketing_leads`, `marketing_contacts`, `marketing_requests`, `marketing_rate_limits`, and `marketing_email_outbox`. All have RLS enabled and no grants to `anon` or `authenticated`. Only the server's service role can read or write them or execute the marketing RPCs.

`submit_marketing` saves the submission, idempotency receipt, and notification event in one transaction. It normalizes and deduplicates lead emails. Repeated signups do not overwrite an existing lead's consent or status. A shared database limiter permits five fresh requests per email hash per 15 minutes and 500 globally per 15 minutes; adjust after observing legitimate traffic. It does not store raw IP addresses. The existing API's coarse in-memory public-route limit remains an additional guard.

Review records through the restricted Supabase dashboard. A public or application admin inbox, admission workflow, email ownership verification, referrals, and exports are not implemented. They depend on the final launch workflow. Do not interpret a pending lead as verified email ownership. A deletion request should remove related lead/contact records and notification references according to the final retention policy.

## Optional email delivery

The existing worker process can drain the notification outbox when `MARKETING_EMAIL_ENABLED=true`, `RESEND_API_KEY`, `MARKETING_EMAIL_FROM`, and `MARKETING_NOTIFY_TO` are configured. The from address must belong to a verified sender domain. Notifications go only to the configured staff recipient and contain a record reference rather than submitted personal details. No automatic email goes to a person who fills out the form.

Workers lease rows using `FOR UPDATE SKIP LOCKED` and a lease token, use a stable Resend idempotency key, and retry transient errors with exponential backoff. Permanent failures stop retrying. Attempts stop before the provider's 24-hour idempotency window expires; old ambiguous deliveries require manual review. A provider failure does not affect the saved submission. The current implementation was tested with simulated provider responses, not a live email send.

## Search and analytics

Configure the confirmed canonical `NEXT_PUBLIC_SITE_URL`. Indexing stays off unless `SITE_INDEXABLE=true`, the canonical URL is configured, and the deployment is not a Vercel preview. The sitemap includes ready routes and published articles. The default local sitemap is empty. Draft product chapters, pricing, entry routes, and prelaunch legal drafts remain `noindex`.

Metadata, Open Graph images, Organization/WebSite data, article data, and feature breadcrumbs are generated from shared sources. The site does not fabricate ratings, prices, or reviews. Search Console verification, sitemap submission, and live ranking measurements require the production domain and account access.

If `NEXT_PUBLIC_GA_ID` is configured, Google Analytics loads only after a visitor chooses Allow analytics. The visitor can disable it from the footer. Events distinguish `access_cta_click`, `lead_accepted`, and `contact_accepted`. Event payloads exclude form contents and emails. Product activation events still belong in the existing application and are outside the marketing form implementation.

## Deployment

1. Confirm domain, app URL, API URL, launch mode, product claims, legal/operator details, and approved public plans.
2. Apply the reviewed migration to the intended Supabase environment and verify role grants and RPC behavior there.
3. Deploy the Hono API and worker with matching proxy configuration. Keep email disabled until sender and recipient are approved.
4. Deploy marketing to Vercel with the configuration in `docs/marketing-environment.example`. The proxy uses a separate API origin; do not set it to the marketing origin.
5. Verify forms, redirects, privacy choices, unknown-route 404s, and canonical URLs on the deployed site before enabling indexing.
6. Connect Search Console and analytics. Measure production mobile performance and real conversions; no field performance or ranking result is established by local checks.

The implementation supports separate marketing/application hosts through configuration. A Cloudflare same-domain router is not deployed; add it only after the domain and path ownership are confirmed. Existing application login is reused through `/sign-in`.

The quality workflow checks lint, the production build, and route/link smoke tests. Scheduled article publication has an opt-in daily Vercel deploy-hook workflow. Enable `SCHEDULED_PUBLISH_ENABLED` and configure `VERCEL_DEPLOY_HOOK` only after a production project exists. A successful hook request is not proof that deployment finished; inspect deployment status and the dated article after publication.

## Verification

- Marketing TypeScript passed before the final build.
- Marketing ESLint: zero errors, 13 existing warnings.
- Backend TypeScript passed.
- Backend suite: 43 files, 265 tests passed, including real local Postgres migration, deduplication, transaction rollback, access restrictions, rate limits, worker leases, and provider retry behavior.
- Browser waitlist submission passed through Next.js and Hono and reached a saved success state in the isolated local database.
- Production build, route sweep, database restart persistence, and responsive verification results are recorded below when complete.

## Remaining release decisions

The implementation does not establish the Production and Market workflows, launch dates, paid plan entitlements, legal terms, or public domain. Those cannot be inferred from the previous Slabfy implementation. Production launch, live database migration, notification delivery, and indexing remain pending these inputs.

### Completed local checks

The production build passed and generated 29 pages. The production HTTP sweep passed for 22 public pages and 24 internal destinations, plus draft/unknown 404s, the login redirect, robots, sitemap, social image, and template download. Restarting the local database preserved one test lead and its notification record. These records use an `.example.test` address and no email was sent.

Peter subsequently requested tighter headlines. The global heading token and font-picker default now use Manrope 600 with `-0.04rem` tracking; body text remains 500 with `0em`. The font-picker settings storage version changed so the previous wide experiment does not override the new default. The production build result above precedes this CSS/default-setting adjustment.

Mobbin was connected during implementation. Reviewed references include [Linear’s compact headline layout](https://mobbin.com/sites/sections/b3297fc3-e235-42d0-b693-b826a9aca786) and [Runway’s cinematic opening](https://mobbin.com/sites/sections/754769a3-efe7-48cb-98bb-547e66bfdfee). They support a restrained type hierarchy and image-led storytelling; no third-party assets were copied.

### Visual page system

Public pages now share a GSAP motion wrapper with entrance reveals and desktop media parallax. Motion is scoped to the active route, cleaned up on navigation, and disabled for reduced-motion preferences. Content remains visible in server-rendered HTML without JavaScript.

The shared page shell provides a large labeled image placeholder. Feature pages use alternating visual sections with concise supporting copy. Writing cards and journal cards include media placeholders; articles include a visual cover. The placeholders are CSS compositions, not screenshots of shipped functionality. Replace them with approved product images or footage before launch.

Typography remains Manrope 600 with `-0.04rem` headline spacing and Manrope 500 with `0em` body spacing. Browser inspection confirmed four media panels on the screenplay-editor page and no horizontal overflow at the inspected desktop width.
