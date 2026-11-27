-- 2026-11-27: "How did you hear about us?" on the inquiry form.
--
-- Run this once in the Supabase SQL editor BEFORE deploying the matching
-- frontend change (the admin inquiries page reads this column). It is safe to
-- run more than once, and the current frontend keeps working with it.
--
-- * inquiries.heard_from: optional, one of the values in HEARD_FROM_OPTIONS
--   (src/lib/constants.js), e.g. 'google_search', 'friend'. Only the length
--   is checked here, so new options don't need a database change.

alter table public.inquiries add column if not exists heard_from text;

alter table public.inquiries drop constraint if exists inquiries_heard_from_length;
alter table public.inquiries add constraint inquiries_heard_from_length
  check (heard_from is null or char_length(heard_from) between 1 and 40);
