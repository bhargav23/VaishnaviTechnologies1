create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  degree text not null default 'btech' check (degree in ('btech', 'mtech')),
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
  project_id uuid not null references public.projects(id) on delete restrict,
  name text not null,
  email text not null,
  degree text not null check (degree in ('btech', 'mtech')),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

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
      when new.raw_user_meta_data->>'degree' in ('btech', 'mtech')
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
    when u.raw_user_meta_data->>'degree' in ('btech', 'mtech')
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
create policy "students update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

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
