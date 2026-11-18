-- Owner-only verification in a transaction; no test account/payment is retained.
begin;
do $$
declare a jsonb; b jsonb; sid uuid; first_end timestamptz; second_end timestamptz; denied boolean;
begin
 a:=public.activate_yoga_month(null,'pay_yogaTestFirst','order_yogaTestFirst',50000,'USD','Yoga database test','yoga-database-test@example.invalid','+12025550123','yoga_database_test',repeat('a',64));
 sid:=(a->>'studentId')::uuid;first_end:=(a->>'accessUntil')::timestamptz;
 assert first_end>now()+interval '27 days';
 assert (select count(*) from public.enrollments where student_id=sid and course_id='course-international-yoga')=1;
 b:=public.activate_yoga_month(null,'pay_yogaTestFirst','order_yogaTestFirst',50000,'USD','Yoga database test','yoga-database-test@example.invalid','+12025550123','yoga_database_test',repeat('a',64));
 assert b=a,'Repeated payment must not extend access';
 b:=public.activate_yoga_month(sid,'pay_yogaTestSecond','order_yogaTestSecond',50000,'USD','','','','','');
 second_end:=(b->>'accessUntil')::timestamptz;
 assert second_end=first_end+interval '1 month','Renewal adds one calendar month';
 assert (select count(*) from public.yoga_payments where student_id=sid)=2;
 assert (select account_kind from public.students where id=sid)='yoga';
 assert (select access_expires_at from public.students where id=sid) is null,'Tuition expiry must remain unchanged';
 denied:=false;begin perform public.activate_yoga_month(sid,'pay_yogaWrongCurrency','order_yogaWrongCurrency',50000,'INR','','','','','');exception when others then denied:=true;end;assert denied,'INR must be rejected';
 denied:=false;begin perform public.activate_yoga_month(sid,'pay_yogaWrongAmount','order_yogaWrongAmount',500,'USD','','','','','');exception when others then denied:=true;end;assert denied,'Wrong amount must be rejected';
 assert not has_function_privilege('anon','public.activate_yoga_month(uuid,text,text,integer,text,text,text,text,text,text)','EXECUTE');
 assert not has_function_privilege('authenticated','public.activate_yoga_month(uuid,text,text,integer,text,text,text,text,text,text)','EXECUTE');
 assert has_function_privilege('service_role','public.activate_yoga_month(uuid,text,text,integer,text,text,text,text,text,text)','EXECUTE');
 assert not has_table_privilege('anon','public.yoga_memberships','SELECT');
 assert not has_table_privilege('authenticated','public.yoga_payments','SELECT');
end $$;
rollback;
select 'Yoga database tests passed; test records rolled back.' as result;
