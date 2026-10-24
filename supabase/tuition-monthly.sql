-- Calendar-month renewal, with no recurring charge or mandate.
begin;
-- Bound outbound verification-email cost even if automated signups are attempted.
create table if not exists public.trial_email_budget (
 usage_date date primary key, sent_count integer not null default 0
);
alter table public.trial_email_budget enable row level security;
revoke all on public.trial_email_budget from anon,authenticated;
grant select,insert,update,delete on public.trial_email_budget to service_role;
create or replace function public.reserve_trial_email_slot()
returns boolean language plpgsql security definer set search_path='' as $budget$
declare n integer; today date := (now() at time zone 'Asia/Kolkata')::date;
begin
 insert into public.trial_email_budget(usage_date,sent_count) values(today,1)
 on conflict(usage_date) do update set sent_count=public.trial_email_budget.sent_count+1 where public.trial_email_budget.sent_count<100 returning sent_count into n;
 return n is not null;
end $budget$;
revoke all on function public.reserve_trial_email_slot() from public,anon,authenticated;
grant execute on function public.reserve_trial_email_slot() to service_role;
create table if not exists public.tuition_payments (
 payment_id text primary key, order_id text unique not null,
 student_id uuid not null references public.students(id), course_id text not null,
 amount_paise integer not null, access_until timestamptz not null,
 created_at timestamptz not null default now()
);
alter table public.tuition_payments enable row level security;
revoke all on public.tuition_payments from anon,authenticated;
grant select,insert,update,delete on public.tuition_payments to service_role;
create or replace function public.activate_tuition_month(p_student_id uuid,p_course_id text,p_payment_id text,p_order_id text,p_amount integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.students; saved public.tuition_payments; g integer; fee integer; ending timestamptz;
begin
 select * into s from public.students where id=p_student_id and active for update;
 if not found or s.account_kind not in ('trial','monthly') then raise exception 'Tuition account unavailable'; end if;
 if p_course_id !~ '^course-cbse-class-([5-9]|1[0-2])$' then raise exception 'Invalid class'; end if;
 g:=substring(p_course_id from '([0-9]+)$')::integer;
 fee:=case when g<=7 then 20000 when g<=9 then 30000 else 40000 end;
 if p_amount<>fee or not exists(select 1 from public.enrollments where student_id=p_student_id and course_id=p_course_id) then raise exception 'Course or amount mismatch'; end if;
 select * into saved from public.tuition_payments where payment_id=p_payment_id;
 if found then
  if saved.student_id<>p_student_id or saved.course_id<>p_course_id or saved.order_id<>p_order_id or saved.amount_paise<>p_amount then raise exception 'Payment mismatch'; end if;
  return jsonb_build_object('accessUntil',saved.access_until);
 end if;
 ending:=greatest(now(),coalesce(s.access_expires_at,now()))+interval '1 month';
 insert into public.tuition_payments(payment_id,order_id,student_id,course_id,amount_paise,access_until) values(p_payment_id,p_order_id,p_student_id,p_course_id,p_amount,ending);
 update public.students set account_kind='monthly',access_expires_at=ending where id=p_student_id;
 return jsonb_build_object('accessUntil',ending);
end $$;
revoke all on function public.activate_tuition_month(uuid,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.activate_tuition_month(uuid,text,text,text,integer) to service_role;
-- Reuse the tested atomic daily allowance for trial and monthly tuition accounts.
create or replace function public.consume_trial_usage(p_student_id uuid,p_kind text)
returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; today date:=(now() at time zone 'Asia/Kolkata')::date;
begin
 if p_kind not in ('question','speech','transcription') then return false; end if;
 if not exists(select 1 from public.students where id=p_student_id and active and account_kind in ('trial','monthly') and access_expires_at>now()) then return false; end if;
 insert into public.trial_daily_usage(student_id,usage_date,kind,used) values(p_student_id,today,p_kind,1)
 on conflict(student_id,usage_date,kind) do update set used=public.trial_daily_usage.used+1 where public.trial_daily_usage.used<5 returning used into n;
 return n is not null;
end $$;
commit;
