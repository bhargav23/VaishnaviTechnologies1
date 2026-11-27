create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  degree text not null default 'btech' check (degree in ('btech', 'mtech', 'phd')),
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  degree_level text not null check (degree_level in ('btech', 'mtech')),
  domain text not null,
  abstract text not null,
  description text not null,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  -- NULL means the student described their own topic instead of picking a
  -- catalog project.
  project_id uuid references public.projects(id) on delete restrict,
  name text not null,
  email text not null,
  -- Required for inquiries; optional for Contact page messages.
  degree text check (degree in ('btech', 'mtech', 'phd')),
  message text not null,
  -- Optional phone / WhatsApp number, normalised to digits with an optional "+".
  phone text,
  -- One-way hash of the sender's IP, used only for rate limiting.
  client_hash text,
  -- 'inquiry' (inquiry forms) or 'contact' (Contact page), with its subject.
  source text not null default 'inquiry',
  subject text,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

-- Upgrade for databases created before PhD and "own topic" inquiries were
-- supported. Same SQL as supabase/migrations/20261119_phd_and_own_topic_inquiries.sql.
-- Safe to re-run.
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

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_name_length'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_name_length
      check (char_length(btrim(name)) between 1 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_email_length'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_email_length
      check (char_length(btrim(email)) between 3 and 254);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_message_length'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_message_length
      check (char_length(btrim(message)) between 1 and 5000);
  end if;
end;
$$;

insert into public.projects (
  title,
  degree_level,
  domain,
  abstract,
  description,
  tags,
  is_active
)
select
  seed.title,
  seed.degree_level,
  seed.domain,
  seed.abstract,
  seed.description,
  seed.tags,
  true
from (
  values
    (
      'Smart Campus Attendance with Face Recognition',
      'btech',
      'Machine Learning',
      'Automated classroom attendance using face embeddings and role-based reporting.',
      'Build a recognition pipeline with image preprocessing, face embeddings, attendance logs, and faculty/admin dashboards for semester-wide tracking.',
      ARRAY['python', 'opencv', 'flask', 'postgresql']
    ),
    (
      'Cloud-Native CI/CD for Microservices',
      'btech',
      'DevOps',
      'Hands-on CI/CD workflow for containerized microservices with monitoring.',
      'Implement Git-based CI pipelines, Docker image builds, Kubernetes deployment, and alerting with Prometheus and Grafana.',
      ARRAY['docker', 'kubernetes', 'github-actions', 'prometheus']
    ),
    (
      'Secure E-Commerce API with JWT and RBAC',
      'btech',
      'Cyber Security',
      'Backend project focused on authentication, authorization, and API hardening.',
      'Develop a production-style API with JWT auth, role-based access control, audit logs, rate limiting, and secure password management.',
      ARRAY['nodejs', 'express', 'jwt', 'postgresql']
    ),
    (
      'M.Tech Thesis: Explainable Intrusion Detection',
      'mtech',
      'Cyber Security',
      'Research-oriented IDS using interpretable ML for attack classification.',
      'Train and evaluate intrusion detection models on benchmark datasets, compare performance, and apply explainability methods for academic defense.',
      ARRAY['python', 'xgboost', 'shap', 'jupyter']
    ),
    (
      'M.Tech Thesis: Federated Learning for Healthcare',
      'mtech',
      'Machine Learning',
      'Privacy-preserving multi-client model training without centralizing data.',
      'Design a federated learning workflow, evaluate communication cost vs. accuracy, and document findings for thesis and publication support.',
      ARRAY['python', 'pytorch', 'federated-learning', 'mlops']
    ),
    (
      'M.Tech Thesis: Multi-Cloud Cost Optimization',
      'mtech',
      'Cloud Computing',
      'Policy-driven workload placement and scaling across cloud providers.',
      'Create a scheduling and autoscaling strategy, simulate cloud pricing scenarios, and present results with architecture diagrams and metrics.',
      ARRAY['terraform', 'aws', 'azure', 'finops']
    )
) as seed(title, degree_level, domain, abstract, description, tags)
where not exists (
  select 1
  from public.projects p
  where p.title = seed.title
);

create index if not exists idx_projects_degree_active on public.projects (degree_level, is_active);
create index if not exists idx_inquiries_student on public.inquiries (student_id, created_at desc);
create index if not exists idx_inquiries_status on public.inquiries (status, created_at desc);
create index if not exists idx_inquiries_email_created_at on public.inquiries (lower(btrim(email)), created_at desc);

-- Phone and spam protection. Same SQL as
-- supabase/migrations/20261123_inquiry_phone_and_spam_guard.sql. Safe to re-run.
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

-- Contact page messages. Same SQL as
-- supabase/migrations/20261124_contact_form_messages.sql. Safe to re-run.
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

-- "How did you hear about us?". Same SQL as
-- supabase/migrations/20261127_inquiry_heard_from.sql. Safe to re-run.
alter table public.inquiries add column if not exists heard_from text;

alter table public.inquiries drop constraint if exists inquiries_heard_from_length;
alter table public.inquiries add constraint inquiries_heard_from_length
  check (heard_from is null or char_length(heard_from) between 1 and 40);

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

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, full_name, degree, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  case
    when u.raw_user_meta_data->>'degree' in ('btech', 'mtech', 'phd')
      then u.raw_user_meta_data->>'degree'
    else 'btech'
  end,
  'student'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "public read active projects" on public.projects;
create policy "public read active projects"
on public.projects
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admin manage projects" on public.projects;
create policy "admin manage projects"
on public.projects
for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "students read own profile" on public.profiles;
create policy "students read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "students update own profile" on public.profiles;

drop policy if exists "students insert own profile" on public.profiles;
create policy "students insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role = 'student');

drop policy if exists "admin full profiles access" on public.profiles;

drop policy if exists "public create inquiries" on public.inquiries;
create policy "public create inquiries"
on public.inquiries
for insert
to anon, authenticated
with check (
  status = 'pending'
  and (
    student_id is null
    or student_id = auth.uid()
  )
);

drop policy if exists "students read own inquiries" on public.inquiries;
create policy "students read own inquiries"
on public.inquiries
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "admin manage inquiries" on public.inquiries;
create policy "admin manage inquiries"
on public.inquiries
for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
