-- Run as the database owner in the intended NextClasses Supabase project.
-- Only named application tables are covered; no schema-wide default grants.
-- Existing RLS policies and browser-role permissions are unchanged.
begin;
grant select, insert, update, delete on table
  public.students,
  public.enrollments,
  public.daily_materials,
  public.student_progress,
  public.delivery_logs,
  public.student_reviews,
  public.whatsapp_bot_messages
to service_role;
commit;
