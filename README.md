# Vaishnavi Technologies Project Studio

React + Vite frontend deployed on Netlify, backed by Supabase for auth, data, and row-level security.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the SQL in `supabase/schema.sql` in your Supabase SQL editor. It is safe to re-run; it also upgrades existing databases.
4. Start app:
   ```bash
   npm run dev
   ```

## Production notes

- `supabase/schema.sql` now creates profiles from `auth.users` automatically with a database trigger, so account creation is not dependent on the frontend.
- `supabase/schema.sql` also seeds a starter catalog (B.Tech + M.Tech projects) with idempotent inserts.
- If Supabase email confirmation is enabled, new students must verify their email before logging in.
- Promote the owner account to admin in Supabase with:
  ```sql
  update public.profiles
  set role = 'admin'
  where email = 'your-admin-email@example.com';
  ```

## Database migrations

When a change needs a database update, the SQL lives in `supabase/migrations/` and is also folded into `supabase/schema.sql`. Run the migration in the Supabase SQL editor **before** the frontend change is deployed.

- `20261119_phd_and_own_topic_inquiries.sql`: lets PhD scholars sign up and inquire, and lets anyone inquire about their own topic instead of a catalog project.

One-off data cleanups live in `supabase/data/` (for example `20261119_normalize_project_domains.sql`, which folds the catalog's domain names into a short list). Review them before running.

## Analytics and Google Ads

Tracking is off unless these Netlify environment variables are set (see `.env.example`):

- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID (`G-...`).
- `VITE_GOOGLE_ADS_ID`: Google Ads tag ID (`AW-...`).
- `VITE_GOOGLE_ADS_LEAD_LABEL`: conversion label fired when an inquiry is submitted.
- `VITE_GOOGLE_ADS_CONTACT_LABEL`: conversion label fired on WhatsApp, phone, and email clicks.

Events sent: `generate_lead` (inquiry saved) and `contact_click` with `method` = `whatsapp`, `phone`, `email`, or `email_form`. Rebuild the site after changing these variables.

## Implemented Features

- Public homepage with service tiers and CTAs
- Project catalog with degree filter (B.Tech / M.Tech)
- Project details page
- Inquiry submission flow with success state (catalog project or own topic; B.Tech, M.Tech, or PhD)
- WhatsApp chat button on every page
- Student authentication (email/password)
- Student dashboard for request history and statuses
- Admin project management (add/delete)
- Admin inquiry management with status updates

## Netlify

- `netlify.toml` is included with SPA redirects and security headers (Content-Security-Policy and friends). If you add a third-party script, iframe, or API, add its domain to the CSP in both `netlify.toml` and `netlify/functions/project-preview.mjs`.
- Set Netlify environment variables from `.env.example`.
- Dynamic project previews and the sitemap use Netlify Functions and the same Supabase environment variables.
