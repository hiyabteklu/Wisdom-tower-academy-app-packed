-- Notifications v2, slice R1: rolled-back test script. STATUS: written, NEVER RUN (SQL tool call cancelled twice in session AX).
-- HOW TO RUN (Supabase SQL editor or an agent with SQL access):
--   1. type:  begin;
--   2. paste the whole of docs/sql/notifications_v2.sql
--   3. paste the DO block below (it ends by RAISING an exception whose message is the list of results, which also rolls everything back)
--   4. type:  rollback;
-- Read the line that starts with RESULTS. Expected values are in the comments (EXPECT). Live facts on 2026-10-15: 67 profiles,
-- 5 "3rd Year (ECE)", 4 "Freshman", 1 "Grade 9", 57 with no level.
-- Note: the test only needs one admin e-mail from private.admin_emails (it is never printed).

do $test$
declare
  r jsonb := '[]'::jsonb;
  adm text;
  v_id uuid; v_id2 uuid; v_cid uuid; v_n int; v_j jsonb; v_total int; v_url text;
begin
  select email into adm from private.admin_emails limit 1;
  select count(*) into v_total from public.profiles;
  r := r || jsonb_build_array('T1 profiles total=' || v_total);                                   -- EXPECT 67

  perform set_config('request.jwt.claims', json_build_object('email','nobody@example.invalid','role','authenticated')::text, true);
  begin
    perform public.admin_schedule_notification_v2('t','b', now()+interval '1 day');
    r := r || jsonb_build_array('T2 FAIL no error');
  exception when others then r := r || jsonb_build_array('T2 non-admin schedule -> ' || sqlerrm); end;   -- EXPECT admin_only
  begin
    perform public.admin_count_notification_audience(array['all']);
    r := r || jsonb_build_array('T2b FAIL no error');
  exception when others then r := r || jsonb_build_array('T2b non-admin count -> ' || sqlerrm); end;    -- EXPECT admin_only

  perform set_config('request.jwt.claims', json_build_object('email',adm,'role','authenticated')::text, true);

  v_id := public.admin_schedule_notification_v2('Hello','Plain preview', now()+interval '1 day', 'admin',
          '{"v":1,"blocks":[{"t":"title","text":"Hello"}]}'::jsonb, '/learning', array['Grade 9','Freshman']);
  select to_jsonb(s) into v_j from public.scheduled_notifications s where id = v_id;
  r := r || jsonb_build_array('T3 admin row: category=' || (v_j->>'category') || ' url=' || coalesce(v_j->>'url','NULL') || ' audiences=' || (v_j->>'audiences'));
                                                                                                   -- EXPECT category=admin url=NULL audiences=["Grade 9", "Freshman"] (order may differ)
  begin
    perform public.admin_schedule_notification_v2('t','b', now()+interval '1 day', 'material');
    r := r || jsonb_build_array('T4 FAIL no error');
  exception when others then r := r || jsonb_build_array('T4 material without url -> ' || sqlerrm); end;  -- EXPECT url_required_for_material

  v_id2 := public.admin_schedule_notification_v2('Contest','b', now()+interval '1 day', 'contest', null, '/anything');
  select url into v_url from public.scheduled_notifications where id = v_id2;
  r := r || jsonb_build_array('T5 contest url forced -> ' || v_url);                                -- EXPECT /competitions

  begin
    perform public.admin_schedule_notification_v2('t','b', now()+interval '1 day', 'general');
    r := r || jsonb_build_array('T6 FAIL no error');
  exception when others then r := r || jsonb_build_array('T6 bad category -> ' || sqlerrm); end;       -- EXPECT bad_category
  begin
    perform public.admin_schedule_notification_v2('t','b', now()+interval '1 day', 'admin', '{"v":2,"blocks":[]}'::jsonb);
    r := r || jsonb_build_array('T7 FAIL no error');
  exception when others then r := r || jsonb_build_array('T7 bad content -> ' || sqlerrm); end;        -- EXPECT bad_content
  begin
    perform public.admin_schedule_notification_v2('t','b', now()-interval '1 hour');
    r := r || jsonb_build_array('T8 FAIL no error');
  exception when others then r := r || jsonb_build_array('T8 past time -> ' || sqlerrm); end;          -- EXPECT send_at_must_be_in_future

  r := r || jsonb_build_array('T9 all=' || (select count(*) from public.resolve_notification_audience(array['all']))
        || ' null=' || (select count(*) from public.resolve_notification_audience(null))
        || ' ece=' || (select count(*) from public.resolve_notification_audience(array['3rd Year (ECE)']))
        || ' fresh+ece(case-insens)=' || (select count(*) from public.resolve_notification_audience(array['freshman','3RD YEAR (ece)']))
        || ' grade9 twice=' || (select count(*) from public.resolve_notification_audience(array['Grade 9','Grade 9']))
        || ' grade12=' || (select count(*) from public.resolve_notification_audience(array['Grade 12'])));
                                                                                                   -- EXPECT all=67 null=67 ece=5 fresh+ece=9 grade9 twice=1 grade12=0

  v_cid := public.admin_add_notification_audience('Test crew', array['Grade 9'], '{}');
  r := r || jsonb_build_array('T10 custom=' || (select count(*) from public.resolve_notification_audience(array['custom:' || v_cid::text]))
        || ' custom+freshman=' || (select count(*) from public.resolve_notification_audience(array['custom:' || v_cid::text, 'Freshman']))
        || ' list=' || public.admin_list_notification_audiences()::text);                         -- EXPECT custom=1 custom+freshman=5 list shows Test crew with students 1
  begin
    perform public.admin_add_notification_audience('Test crew', array['Grade 9'], '{}');
    r := r || jsonb_build_array('T11 FAIL no error');
  exception when others then r := r || jsonb_build_array('T11 duplicate label -> ' || sqlerrm); end;     -- EXPECT unique violation on notification_audiences_label_key
  begin
    perform public.admin_add_notification_audience('Empty', '{}', '{}');
    r := r || jsonb_build_array('T11b FAIL no error');
  exception when others then r := r || jsonb_build_array('T11b empty rule -> ' || sqlerrm); end;       -- EXPECT needs_a_level_or_package

  perform public.admin_schedule_notification_v2('Uses custom','b', now()+interval '2 days', 'admin', null, null, array['custom:' || v_cid::text]);
  begin
    perform public.admin_delete_notification_audience(v_cid);
    r := r || jsonb_build_array('T12 FAIL no error');
  exception when others then r := r || jsonb_build_array('T12 delete in use -> ' || sqlerrm); end;       -- EXPECT in_use_by_pending_schedule

  perform public.admin_update_scheduled_notification_v2(v_id, 'Hello 2','Plain 2', now()+interval '3 days', 'admin', null, null, array['all']);
  select to_jsonb(s) into v_j from public.scheduled_notifications s where id = v_id;
  r := r || jsonb_build_array('T13 updated: title=' || (v_j->>'title') || ' audiences=' || (v_j->>'audiences') || ' content=' || coalesce(v_j->>'content','NULL'));
                                                                                                   -- EXPECT title=Hello 2 audiences=["all"] content=NULL
  perform public.admin_cancel_scheduled_notification(v_id);
  begin
    perform public.admin_update_scheduled_notification_v2(v_id, 'x','y', now()+interval '3 days');
    r := r || jsonb_build_array('T14 FAIL no error');
  exception when others then r := r || jsonb_build_array('T14 update cancelled -> ' || sqlerrm); end;  -- EXPECT not_pending_or_not_found

  v_j := public.admin_list_scheduled_notifications_v2(10);
  r := r || jsonb_build_array('T15 list v2 rows=' || jsonb_array_length(v_j) || ' first has category key=' || ((v_j->0) ? 'category'));
                                                                                                   -- EXPECT rows>=3 and true
  v_j := public.admin_audience_level_counts();
  r := r || jsonb_build_array('T16 level counts=' || v_j::text);                                    -- EXPECT total 67, no_level 57, levels ECE 5, Freshman 4, Grade 9 1
  r := r || jsonb_build_array('T17 count fn all=' || public.admin_count_notification_audience(array['all'])
        || ' ece+fresh=' || public.admin_count_notification_audience(array['3rd Year (ECE)','Freshman']));   -- EXPECT 67 and 9

  r := r || jsonb_build_array('T18 resolver exec: anon=' || has_function_privilege('anon','public.resolve_notification_audience(text[])','execute')
        || ' authenticated=' || has_function_privilege('authenticated','public.resolve_notification_audience(text[])','execute')
        || ' service_role=' || has_function_privilege('service_role','public.resolve_notification_audience(text[])','execute')
        || ' | v2 schedule anon=' || has_function_privilege('anon','public.admin_schedule_notification_v2(text,text,timestamptz,text,jsonb,text,text[],text,uuid)','execute'));
                                                                                                   -- EXPECT anon=false authenticated=false service_role=true | anon=false

  perform set_config('request.jwt.claims', json_build_object('email','nobody@example.invalid','role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_n from public.notification_audiences;
  reset role;
  r := r || jsonb_build_array('T19 RLS non-admin sees ' || v_n || ' audience rows (expect 0)');     -- EXPECT 0

  raise exception 'RESULTS: %', r::text;
end $test$;
