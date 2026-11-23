-- 2026-11-23: optional phone number on inquiries, and stronger spam protection.
--
-- Run this once in the Supabase SQL editor BEFORE deploying the matching
-- frontend change. It is safe to run more than once, and the current
-- frontend keeps working with it (phone is optional).
--
-- * inquiries.phone: optional phone / WhatsApp number, stored as digits
--   with an optional leading "+" (10–15 digits).
-- * inquiries.client_hash: a one-way hash of the sender's IP address, used
--   only for rate limiting. The raw IP is never stored.
-- * Email addresses must look like an email address.
-- * The insert trigger now also rejects messages with more than two links,
--   limits each network to 5 inquiries an hour (on top of 3 an hour per
--   email), and caps the whole site at 30 inquiries in 10 minutes so a bot
--   flood can't bury real requests.

alter table public.inquiries add column if not exists phone text;
alter table public.inquiries add column if not exists client_hash text;

alter table public.inquiries drop constraint if exists inquiries_phone_format;
alter table public.inquiries add constraint inquiries_phone_format
  check (phone is null or phone ~ '^\+?[0-9]{10,15}$');

alter table public.inquiries drop constraint if exists inquiries_email_format;
alter table public.inquiries add constraint inquiries_email_format
  check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

create index if not exists idx_inquiries_client_created_at
  on public.inquiries (client_hash, created_at desc)
  where client_hash is not null;
create index if not exists idx_inquiries_created_at
  on public.inquiries (created_at desc);

create or replace function public.limit_inquiry_submissions()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  recent_count integer;
  normalized_email text := lower(btrim(new.email));
  request_headers json := nullif(current_setting('request.headers', true), '')::json;
  client_ip text := btrim(split_part(coalesce(
    request_headers ->> 'x-forwarded-for',
    request_headers ->> 'cf-connecting-ip',
    ''
  ), ',', 1));
begin
  new.email := normalized_email;

  -- Phone: keep digits and a leading "+"; an empty value means no phone.
  if new.phone is not null then
    new.phone := regexp_replace(btrim(new.phone), '[^0-9+]', '', 'g');
    if new.phone = '' then
      new.phone := null;
    end if;
  end if;

  -- Link spam: real inquiries rarely contain more than a couple of links.
  if (select count(*) from regexp_matches(new.message, '(https?://|www\.)', 'gi')) > 2 then
    raise exception 'Please remove links from your message and try again.'
      using errcode = 'P0001';
  end if;

  -- Per email: 3 an hour.
  perform pg_advisory_xact_lock(hashtextextended(normalized_email, 0));
  select count(*)
  into recent_count
  from public.inquiries i
  where lower(btrim(i.email)) = normalized_email
    and i.created_at > now() - interval '1 hour';
  if recent_count >= 3 then
    raise exception 'Inquiry limit reached. Please try again later.'
      using errcode = 'P0001';
  end if;

  -- Per network: 5 an hour. Only a salted hash of the IP is kept.
  new.client_hash := null;
  if client_ip <> '' then
    new.client_hash := md5(client_ip || ':vaishnavitech-inquiries');
    select count(*)
    into recent_count
    from public.inquiries i
    where i.client_hash = new.client_hash
      and i.created_at > now() - interval '1 hour';
    if recent_count >= 5 then
      raise exception 'Inquiry limit reached. Please try again later.'
        using errcode = 'P0001';
    end if;
  end if;

  -- Whole site: 30 in 10 minutes.
  select count(*)
  into recent_count
  from public.inquiries i
  where i.created_at > now() - interval '10 minutes';
  if recent_count >= 30 then
    raise exception 'We are receiving a lot of requests right now. Please try again in a few minutes or message us on WhatsApp.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists limit_inquiry_submissions on public.inquiries;
create trigger limit_inquiry_submissions
before insert on public.inquiries
for each row execute procedure public.limit_inquiry_submissions();
