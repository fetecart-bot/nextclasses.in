-- Apply as project owner before enabling NEXTCLASSES_TRIAL_ENABLED.
-- Additive: existing paid accounts and their course assignments are preserved.
begin;
alter table public.students add column if not exists account_kind text not null default 'paid';
alter table public.students add column if not exists access_expires_at timestamptz;
create table if not exists public.trial_requests (
 email text primary key, grade integer not null check (grade between 5 and 12),
 code_hash text not null, expires_at timestamptz not null,
 attempts integer not null default 0, sent_at timestamptz not null default now(),
 sent_day date not null default current_date, sent_count integer not null default 1,
 consumed boolean not null default false
);
create table if not exists public.trial_daily_usage (
 student_id uuid not null references public.students(id) on delete cascade,
 usage_date date not null, kind text not null check (kind in ('question','speech','transcription')),
 used integer not null default 0, primary key(student_id,usage_date,kind)
);
alter table public.trial_requests enable row level security;
alter table public.trial_daily_usage enable row level security;
revoke all on public.trial_requests,public.trial_daily_usage from anon,authenticated;
grant select,insert,update,delete on public.trial_requests,public.trial_daily_usage to service_role;

create or replace function public.request_tuition_trial(p_email text,p_grade integer,p_code_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare r public.trial_requests; begin
 if p_grade not between 5 and 12 then return false; end if;
 if exists(select 1 from public.students where lower(email)=p_email) then return false; end if;
 insert into public.trial_requests(email,grade,code_hash,expires_at)
 values(p_email,p_grade,p_code_hash,now()+interval '10 minutes') on conflict do nothing;
 select * into r from public.trial_requests where email=p_email for update;
 -- First insert already holds the fresh hash; retries must respect cooldown.
 if r.code_hash=p_code_hash then return true; end if;
 if r.consumed or r.sent_at>now()-interval '60 seconds' or (r.sent_day=current_date and r.sent_count>=5) then return false; end if;
 update public.trial_requests set grade=p_grade,code_hash=p_code_hash,expires_at=now()+interval '10 minutes',attempts=0,sent_at=now(),sent_count=case when sent_day=current_date then sent_count+1 else 1 end,sent_day=current_date where email=p_email;
 return true; end $$;

create or replace function public.claim_tuition_trial(p_email text,p_code_hash text,p_password_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.trial_requests; s public.students; cid text; begin
 select * into r from public.trial_requests where email=p_email for update;
 if not found or r.consumed or r.expires_at<=now() or r.attempts>=5 then return null; end if;
 if r.code_hash<>p_code_hash then
  update public.trial_requests set attempts=attempts+1 where email=p_email; return null;
 end if;
 if exists(select 1 from public.students where lower(email)=p_email) then return null; end if;
 cid:='course-cbse-class-'||r.grade;
 insert into public.students(payment_id,name,email,username,password_hash,account_kind,access_expires_at)
 values('trial_'||gen_random_uuid(),'Parent-managed learner',p_email,'nc_trial_'||replace(gen_random_uuid()::text,'-',''),p_password_hash,'trial',now()+interval '30 days') returning * into s;
 insert into public.enrollments(student_id,course_id,course_title,payment_amount)
 values(s.id,cid,'CBSE Class '||r.grade||' Tuition — All Offered Subjects',0);
 update public.trial_requests set consumed=true where email=p_email;
 return jsonb_build_object('id',s.id,'name',s.name,'email',s.email,'username',s.username,'courseId',cid,'courseTitle','CBSE Class '||r.grade||' Tuition — All Offered Subjects','enrolledCourseIds',jsonb_build_array(cid),'registeredAt',current_date,'paymentReference',s.payment_id,'trialExpiresAt',s.access_expires_at);
 end $$;

create or replace function public.consume_trial_usage(p_student_id uuid,p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer; today date := (now() at time zone 'Asia/Kolkata')::date; begin
 if p_kind not in ('question','speech','transcription') then return false; end if;
 if not exists(select 1 from public.students where id=p_student_id and active and account_kind='trial' and access_expires_at>now()) then return false; end if;
 insert into public.trial_daily_usage(student_id,usage_date,kind,used) values(p_student_id,today,p_kind,1)
 on conflict(student_id,usage_date,kind) do update set used=public.trial_daily_usage.used+1 where public.trial_daily_usage.used<5 returning used into n;
 return n is not null; end $$;
revoke all on function public.request_tuition_trial(text,integer,text),public.claim_tuition_trial(text,text,text),public.consume_trial_usage(uuid,text) from public,anon,authenticated;
grant execute on function public.request_tuition_trial(text,integer,text),public.claim_tuition_trial(text,text,text),public.consume_trial_usage(uuid,text) to service_role;
commit;
