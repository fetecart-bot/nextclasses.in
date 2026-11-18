-- Dedicated USD yoga membership; does not modify tuition fees or access periods.
begin;
create table if not exists public.yoga_memberships (
 student_id uuid primary key references public.students(id),
 access_until timestamptz not null,
 updated_at timestamptz not null default now()
);
create table if not exists public.yoga_payments (
 payment_id text primary key, order_id text unique not null,
 student_id uuid not null references public.students(id),
 amount_cents integer not null check(amount_cents=50000),
 currency text not null check(currency='USD'),
 access_until timestamptz not null, created_at timestamptz not null default now()
);
create table if not exists public.yoga_resources (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('live','video','notes')),
 title text not null, url text not null check(url like 'https://%'),
 starts_at timestamptz, published boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.yoga_memberships enable row level security;
alter table public.yoga_payments enable row level security;
alter table public.yoga_resources enable row level security;
revoke all on public.yoga_memberships,public.yoga_payments,public.yoga_resources from public,anon,authenticated;
grant select,insert,update,delete on public.yoga_memberships,public.yoga_payments,public.yoga_resources to service_role;

create or replace function public.activate_yoga_month(p_student_id uuid,p_payment_id text,p_order_id text,p_amount integer,p_currency text,p_name text,p_email text,p_phone text,p_username text,p_password_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; saved public.yoga_payments; ending timestamptz; previous_end timestamptz;
begin
 if p_amount is distinct from 50000 or p_currency is distinct from 'USD' or p_payment_id !~ '^pay_[A-Za-z0-9]+$' or p_order_id !~ '^order_[A-Za-z0-9]+$' then raise exception 'Yoga payment mismatch'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_payment_id,0));
 select * into saved from public.yoga_payments where payment_id=p_payment_id;
 if found then
  if saved.order_id<>p_order_id or saved.amount_cents<>p_amount or saved.currency<>p_currency or (p_student_id is not null and saved.student_id<>p_student_id) then raise exception 'Payment mismatch'; end if;
  return jsonb_build_object('studentId',saved.student_id,'accessUntil',saved.access_until);
 end if;
 if p_student_id is null then
  if coalesce(length(trim(p_name)),0)=0 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or coalesce(length(p_password_hash),0)<>64 then raise exception 'Invalid learner details'; end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(p_email),1));
  if exists(select 1 from public.students where lower(email)=lower(p_email)) then raise exception 'Use existing account'; end if;
  insert into public.students(payment_id,name,email,phone,username,password_hash,account_kind,active)
  values(p_payment_id,p_name,lower(p_email),p_phone,p_username,p_password_hash,'yoga',true) returning id into sid;
 else
  select id into sid from public.students where id=p_student_id and active for update;
  if not found then raise exception 'Yoga account unavailable'; end if;
 end if;
 select access_until into previous_end from public.yoga_memberships where student_id=sid for update;
 ending:=greatest(now(),coalesce(previous_end,now()))+interval '1 month';
 insert into public.yoga_payments(payment_id,order_id,student_id,amount_cents,currency,access_until) values(p_payment_id,p_order_id,sid,p_amount,p_currency,ending);
 insert into public.yoga_memberships(student_id,access_until) values(sid,ending) on conflict(student_id) do update set access_until=excluded.access_until,updated_at=now();
 insert into public.enrollments(student_id,course_id,course_title,payment_amount) values(sid,'course-international-yoga','International Yoga with Kavery P P',500)
 on conflict(student_id,course_id) do nothing;
 return jsonb_build_object('studentId',sid,'accessUntil',ending);
end $$;
revoke all on function public.activate_yoga_month(uuid,text,text,integer,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.activate_yoga_month(uuid,text,text,integer,text,text,text,text,text,text) to service_role;
commit;
