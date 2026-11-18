-- 2026-11-19: PhD scholars and "own topic" inquiries.
--
-- Run this once in the Supabase SQL editor BEFORE deploying the matching
-- frontend change. It is safe to run more than once.
--
-- * inquiries.project_id becomes optional (NULL = student's own topic).
-- * 'phd' becomes a valid degree for inquiries and student profiles.
-- * New sign-ups that choose PhD keep that degree on their profile.

alter table public.inquiries alter column project_id drop not null;

do $$
declare
  c record;
begin
  -- Replace whatever degree check constraints exist (their names depend on
  -- how the tables were first created) with ones that allow 'phd'.
  for c in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.inquiries'::regclass, 'public.profiles'::regclass)
      and pg_get_constraintdef(oid) ~ '\mdegree\M'
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end;
$$;

alter table public.inquiries
  add constraint inquiries_degree_check
  check (degree in ('btech', 'mtech', 'phd'));

alter table public.profiles
  add constraint profiles_degree_check
  check (degree in ('btech', 'mtech', 'phd'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, degree, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when new.raw_user_meta_data->>'degree' in ('btech', 'mtech', 'phd')
        then new.raw_user_meta_data->>'degree'
      else 'btech'
    end,
    'student'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    degree = excluded.degree;

  return new;
end;
$$;
