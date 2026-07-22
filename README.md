# TechHub Mentorship Platform (Phase 1)

React + Vite frontend deployed on Netlify, backed by Supabase for auth, data, and row-level security.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.
4. Start app:
   ```bash
   npm run dev
   ```

## Production notes

- `supabase/schema.sql` now creates profiles from `auth.users` automatically with a database trigger, so account creation is not dependent on the frontend.
- If Supabase email confirmation is enabled, new students must verify their email before logging in.
- Promote the owner account to admin in Supabase with:
  ```sql
  update public.profiles
  set role = 'admin'
  where email = 'your-admin-email@example.com';
  ```

## Implemented Features

- Public homepage with service tiers and CTAs
- Project catalog with degree filter (B.Tech / M.Tech)
- Project details page
- Inquiry submission flow with success state
- Student authentication (email/password)
- Student dashboard for request history and statuses
- Admin project management (add/delete)
- Admin inquiry management with status updates

## Netlify

- `netlify.toml` is included with SPA redirects.
- Set Netlify environment variables from `.env.example`.
