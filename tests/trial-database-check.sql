-- Disposable database checks. All created test records are rolled back.
begin;
do $$
declare e text := 'nextclasses-check-'||gen_random_uuid()||'@example.invalid'; a jsonb; sid uuid; n integer; x boolean;
begin
 assert public.request_tuition_trial(e,8,'test-hash'), 'Initial request failed';
 assert not public.request_tuition_trial(e,8,'different-hash'), 'Cooldown not enforced';
 assert public.claim_tuition_trial(e,'wrong-hash','dummy-password-hash') is null, 'Wrong code accepted';
 a:=public.claim_tuition_trial(e,'test-hash','dummy-password-hash');
 assert a is not null, 'Correct code rejected';
 assert a->>'courseId'='course-cbse-class-8', 'Wrong course';
 sid:=(a->>'id')::uuid;
 assert exists(select 1 from public.students where id=sid and account_kind='trial' and access_expires_at between now()+interval '29 days' and now()+interval '31 days'), 'Expiry incorrect';
 assert public.claim_tuition_trial(e,'test-hash','another-hash') is null, 'Code reuse accepted';
 assert not public.request_tuition_trial(e,8,'another-hash'), 'Repeat trial accepted';
 for n in 1..5 loop assert public.consume_trial_usage(sid,'question'), 'Quota denied too early'; end loop;
 assert not public.consume_trial_usage(sid,'question'), 'Quota allowed sixth request';
 assert public.consume_trial_usage(sid,'speech'), 'Speech quota not independent';
 assert not public.consume_trial_usage(sid,'invalid'), 'Invalid quota kind accepted';
 update public.students set access_expires_at=now()-interval '1 minute' where id=sid;
 assert not public.consume_trial_usage(sid,'speech'), 'Expired trial accepted';
 -- Verify an exhausted verification attempt budget cannot be bypassed.
 e:='nextclasses-attempt-check-'||gen_random_uuid()||'@example.invalid';
 assert public.request_tuition_trial(e,7,'valid-hash');
 for n in 1..5 loop assert public.claim_tuition_trial(e,'bad-hash','dummy') is null; end loop;
 assert public.claim_tuition_trial(e,'valid-hash','dummy') is null, 'Attempt limit bypassed';
end $$;
rollback;
select 'Trial database checks passed; temporary test records rolled back' as result;
