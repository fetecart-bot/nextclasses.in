-- All test data is rolled back. No real payment or email is sent.
begin;
do $$
declare e text:='monthly-check-'||gen_random_uuid()||'@example.invalid'; a jsonb; sid uuid; first_end timestamptz; repeated_end timestamptz; second_end timestamptz; expires timestamptz; n integer;
begin
 assert public.request_tuition_trial(e,10,'internal-test-hash');
 a:=public.claim_tuition_trial(e,'internal-test-hash','dummy-password-hash');sid:=(a->>'id')::uuid;
 select access_expires_at into expires from public.students where id=sid;
 a:=public.activate_tuition_month(sid,'course-cbse-class-10','pay_test_first','order_test_first',40000);first_end:=(a->>'accessUntil')::timestamptz;
 assert first_end=expires+interval '1 month', 'Calendar-month extension failed';
 assert exists(select 1 from public.students where id=sid and account_kind='monthly' and password_hash='dummy-password-hash'), 'Login changed';
 a:=public.activate_tuition_month(sid,'course-cbse-class-10','pay_test_first','order_test_first',40000);repeated_end:=(a->>'accessUntil')::timestamptz;
 assert repeated_end=first_end, 'Payment retry added access twice';
 a:=public.activate_tuition_month(sid,'course-cbse-class-10','pay_test_second','order_test_second',40000);second_end:=(a->>'accessUntil')::timestamptz;
 assert second_end=first_end+interval '1 month', 'Second payment failed';
 assert (select count(*) from public.tuition_payments where student_id=sid)=2;
 assert public.consume_trial_usage(sid,'question'), 'Monthly quota unavailable';
 update public.students set access_expires_at=now()-interval '1 day' where id=sid;
 assert not public.consume_trial_usage(sid,'question'), 'Expired monthly access accepted';
 -- Invalid amounts must fail without changing expiry.
 begin
  perform public.activate_tuition_month(sid,'course-cbse-class-10','pay_bad','order_bad',30000);
  raise exception 'wrong amount was accepted';
 exception when others then
  if sqlerrm='wrong amount was accepted' then raise; end if;
 end;
 -- Cost-budget checks use a far-future date? The function uses today; lock and
 -- exercise today's counter inside this rolled-back transaction only.
 perform public.reserve_trial_email_slot();
 update public.trial_email_budget set sent_count=100 where usage_date=(now() at time zone 'Asia/Kolkata')::date;
 assert not public.reserve_trial_email_slot(), 'Email budget exceeded';
end $$;
rollback;
select 'Monthly renewal and email-budget checks passed; test data rolled back' as result;
