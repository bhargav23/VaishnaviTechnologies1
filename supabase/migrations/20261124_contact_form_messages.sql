-- 2026-11-24: messages from the Contact page are saved as inquiries.
--
-- Run this once in the Supabase SQL editor BEFORE deploying the matching
-- frontend change. It is safe to run more than once, and the current
-- frontend keeps working with it.
--
-- * inquiries.source: 'inquiry' (inquiry forms) or 'contact' (Contact page).
-- * inquiries.subject: optional subject line from the Contact page.
-- * degree is optional for Contact page messages, still required for
--   inquiries.
--
-- Contact page messages go through the same insert trigger, so they get the
-- same spam protection and rate limits as inquiries.

alter table public.inquiries add column if not exists source text not null default 'inquiry';
alter table public.inquiries add column if not exists subject text;
alter table public.inquiries alter column degree drop not null;

alter table public.inquiries drop constraint if exists inquiries_source_check;
alter table public.inquiries add constraint inquiries_source_check
  check (source in ('inquiry', 'contact'));

alter table public.inquiries drop constraint if exists inquiries_subject_length;
alter table public.inquiries add constraint inquiries_subject_length
  check (subject is null or char_length(subject) <= 150);

alter table public.inquiries drop constraint if exists inquiries_degree_required;
alter table public.inquiries add constraint inquiries_degree_required
  check (source = 'contact' or degree is not null);
