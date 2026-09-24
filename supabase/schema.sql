create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  payment_id text unique not null,
  name text not null,
  email text not null,
  phone text,
  username text unique not null,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id text not null,
  course_title text not null,
  payment_amount numeric(12,2),
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create table if not exists public.daily_materials (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_title text not null,
  material_date date not null,
  title text not null,
  focus text not null,
  lesson jsonb not null default '[]'::jsonb,
  practice jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','published','rejected')),
  generated_by text not null default 'system',
  reviewed_by text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(course_id, material_date)
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  material_id uuid not null references public.daily_materials(id) on delete cascade,
  opened_at timestamptz,
  completed_at timestamptz,
  score numeric(5,2),
  unique(student_id, material_id)
);

create table if not exists public.delivery_logs (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references public.daily_materials(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  channel text not null check (channel in ('email','whatsapp','portal')),
  status text not null check (status in ('queued','sent','failed','skipped')),
  provider_reference text,
  error_message text,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_materials_course_date on public.daily_materials(course_id, material_date desc);
create index if not exists idx_materials_status on public.daily_materials(status);
create index if not exists idx_delivery_status on public.delivery_logs(status, attempted_at desc);

alter table public.students enable row level security;
alter table public.enrollments enable row level security;
alter table public.daily_materials enable row level security;
alter table public.student_progress enable row level security;
alter table public.delivery_logs enable row level security;

revoke all on public.students from anon, authenticated;
revoke all on public.enrollments from anon, authenticated;
revoke all on public.daily_materials from anon, authenticated;
revoke all on public.student_progress from anon, authenticated;
revoke all on public.delivery_logs from anon, authenticated;

comment on table public.daily_materials is 'Course material generated once per course and day, reviewed by admin before publishing.';
comment on table public.delivery_logs is 'Email, WhatsApp and portal delivery audit records.';
