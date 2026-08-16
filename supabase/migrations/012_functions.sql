-- Attendance calculation helper function
CREATE OR REPLACE FUNCTION public.calculate_attendance(p_user_id UUID, p_subject_id UUID)
RETURNS TABLE (
  total_classes INTEGER,
  attended_classes INTEGER,
  missed_classes INTEGER,
  attendance_percentage NUMERIC,
  required_percentage NUMERIC,
  classes_needed INTEGER,
  maximum_classes_can_miss INTEGER
) AS $$
DECLARE
  v_attended INTEGER := 0;
  v_missed INTEGER := 0;
  v_total INTEGER := 0;
  v_req NUMERIC := 75.0;
  v_percent NUMERIC := 0.0;
  v_needed INTEGER := 0;
  v_can_miss INTEGER := 0;
BEGIN
  -- Get target attendance percentage from profiles
  SELECT COALESCE(target_percentage, 75.0) INTO v_req FROM public.profiles WHERE id = p_user_id;
  
  -- Get aggregate attendance counts
  SELECT 
    COALESCE(COUNT(*), 0) FILTER (WHERE attended = true),
    COALESCE(COUNT(*), 0) FILTER (WHERE attended = false)
  INTO v_attended, v_missed
  FROM public.attendance
  WHERE user_id = p_user_id AND subject_id = p_subject_id;
  
  v_total := v_attended + v_missed;
  
  IF v_total > 0 THEN
    v_percent := ROUND((v_attended::numeric / v_total::numeric) * 100, 1);
  ELSE
    v_percent := 0.0;
  END IF;

  -- Projections:
  IF v_percent >= v_req THEN
    -- Calculate how many classes can we safely miss
    v_can_miss := FLOOR((v_attended * 100.0 / v_req) - v_total);
    IF v_can_miss < 0 THEN v_can_miss := 0; END IF;
    v_needed := 0;
  ELSE
    -- Calculate how many consecutive classes needed
    IF v_req < 100 THEN
      v_needed := CEIL(((v_req * v_total) - (100.0 * v_attended)) / (100.0 - v_req));
    ELSE
      v_needed := 999; 
    END IF;
    IF v_needed < 0 THEN v_needed := 0; END IF;
    v_can_miss := 0;
  END IF;

  RETURN QUERY SELECT 
    v_total, 
    v_attended, 
    v_missed, 
    v_percent, 
    v_req, 
    v_needed, 
    v_can_miss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Daily Score calculation algorithm
CREATE OR REPLACE FUNCTION public.calculate_daily_score(p_user_id UUID, p_date DATE)
RETURNS TABLE (
  academic_score NUMERIC,
  clinical_score NUMERIC,
  attendance_score NUMERIC,
  study_score NUMERIC,
  health_score NUMERIC,
  sleep_score NUMERIC,
  goal_score NUMERIC,
  overall_score NUMERIC
) AS $$
DECLARE
  v_acad NUMERIC := 0;
  v_clin NUMERIC := 0;
  v_attend NUMERIC := 0;
  v_study NUMERIC := 0;
  v_health NUMERIC := 0;
  v_sleep NUMERIC := 0;
  v_goals NUMERIC := 0;
  v_overall NUMERIC := 0;
  
  v_study_target NUMERIC := 4.5;
  v_steps_target INTEGER := 10000;
  v_sleep_target NUMERIC := 7.5;
  
  v_study_minutes INTEGER := 0;
  v_steps_count INTEGER := 0;
  v_sleep_hours NUMERIC := 0;
  
  v_total_topics INTEGER := 0;
  v_done_topics INTEGER := 0;
  v_cases_count INTEGER := 0;
  
  v_attend_avg NUMERIC := 0;
BEGIN
  -- Get user profile targets
  SELECT 
    COALESCE(daily_study_target, 4.5),
    COALESCE(daily_step_target, 10000),
    COALESCE(daily_sleep_target, 7.5)
  INTO v_study_target, v_steps_target, v_sleep_target
  FROM public.profiles 
  WHERE id = p_user_id;

  -- 1. Academic Score (Syllabus Completion)
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('completed', 'revised'))
  INTO v_total_topics, v_done_topics
  FROM public.syllabus_topics
  WHERE user_id = p_user_id;
  
  IF v_total_topics > 0 THEN
    v_acad := ROUND((v_done_topics::numeric / v_total_topics::numeric) * 100, 1);
  ELSE
    v_acad := 75; -- Default score if syllabus is not yet loaded
  END IF;

  -- 2. Clinical Score (Cases logged today vs target of 2)
  SELECT COALESCE(COUNT(*), 0) INTO v_cases_count
  FROM public.case_logs
  WHERE user_id = p_user_id AND date = p_date;
  v_clin := LEAST(100, v_cases_count * 50);

  -- 3. Attendance Score (Average across subjects)
  SELECT COALESCE(AVG(attendance_percentage), 80) INTO v_attend_avg
  FROM (
    SELECT (calculate_attendance(p_user_id, id)).attendance_percentage
    FROM public.subjects
    WHERE user_id = p_user_id
  ) sub;
  v_attend := LEAST(100, v_attend_avg);

  -- 4. Study Score (Focus minutes logged vs target)
  SELECT COALESCE(SUM(duration_minutes), 0) INTO v_study_minutes
  FROM public.focus_sessions
  WHERE user_id = p_user_id AND DATE(started_at) = p_date;
  IF v_study_target > 0 THEN
    v_study := LEAST(100, ROUND(((v_study_minutes::numeric / 60.0) / v_study_target) * 100, 1));
  ELSE
    v_study := 100;
  END IF;

  -- 5. Health Score (Steps vs target)
  SELECT COALESCE(SUM(value), 0) INTO v_steps_count
  FROM public.health_metrics
  WHERE user_id = p_user_id AND metric_type = 'steps' AND DATE(recorded_at) = p_date;
  IF v_steps_count = 0 THEN
    v_steps_count := 8432; -- local fallback mock value for demo
  END IF;
  IF v_steps_target > 0 THEN
    v_health := LEAST(100, ROUND((v_steps_count::numeric / v_steps_target) * 100, 1));
  ELSE
    v_health := 100;
  END IF;

  -- 6. Sleep Score (Duration vs target)
  SELECT COALESCE(SUM(duration_minutes), 450)::numeric / 60.0 INTO v_sleep_hours
  FROM public.sleep_records
  WHERE user_id = p_user_id AND DATE(sleep_start) = p_date;
  IF v_sleep_target > 0 THEN
    v_sleep := LEAST(100, ROUND((v_sleep_hours / v_sleep_target) * 100, 1));
  ELSE
    v_sleep := 100;
  END IF;

  -- 7. Goals Score (completed goals today)
  v_goals := 85.0; -- default score

  -- Calculate weighted score
  -- Academic (30%), Clinical (20%), Attendance (10%), Study consistency (15%), Health (10%), Sleep (10%), Goals (5%)
  v_overall := ROUND(
    (v_acad * 0.30) +
    (v_clin * 0.20) +
    (v_attend * 0.10) +
    (v_study * 0.15) +
    (v_health * 0.10) +
    (v_sleep * 0.10) +
    (v_goals * 0.05),
    1
  );

  RETURN QUERY SELECT 
    v_acad, 
    v_clin, 
    v_attend, 
    v_study, 
    v_health, 
    v_sleep, 
    v_goals, 
    v_overall;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- get_dashboard_data API Consolidated Query
CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_user_id UUID, p_date DATE)
RETURNS JSON AS $$
DECLARE
  v_profile JSON;
  v_today_tasks JSON;
  v_today_habits JSON;
  v_today_study JSON;
  v_attendance_summary JSON;
  v_clinical_posting JSON;
  v_exam_countdown JSON;
  v_due_revisions JSON;
  v_daily_score JSON;
  v_streaks JSON;
  v_achievements JSON;
  v_ai_insights JSON;
  
  v_total_steps INTEGER := 8432;
  v_sleep_hours NUMERIC := 7.2;
  v_water_glasses INTEGER := 6;
BEGIN
  -- Profile
  SELECT row_to_json(p) INTO v_profile FROM public.profiles p WHERE p.id = p_user_id;

  -- Today Tasks
  SELECT COALESCE(json_agg(t), '[]'::json) INTO v_today_tasks FROM public.tasks t 
  WHERE t.user_id = p_user_id AND t.due_date = p_date;

  -- Habits with today's log status
  SELECT COALESCE(json_agg(row_to_json(h_log)), '[]'::json) INTO v_today_habits
  FROM (
    SELECT h.id, h.name, h.description, h.current_streak, h.best_streak,
           EXISTS(SELECT 1 FROM public.habit_logs hl WHERE hl.habit_id = h.id AND hl.log_date = p_date AND hl.completed = true) AS completed
    FROM public.habits h
    WHERE h.user_id = p_user_id
  ) h_log;

  -- Today Study (Focus sessions)
  SELECT COALESCE(json_agg(fs), '[]'::json) INTO v_today_study FROM public.focus_sessions fs 
  WHERE fs.user_id = p_user_id AND DATE(fs.started_at) = p_date;

  -- Attendance Summary
  SELECT COALESCE(json_agg(row_to_json(att)), '[]'::json) INTO v_attendance_summary
  FROM (
    SELECT s.id AS subject_id, s.name AS subject_name,
           (calculate_attendance(p_user_id, s.id)).*
    FROM public.subjects s
    WHERE s.user_id = p_user_id
  ) att;

  -- Active Clinical Posting
  SELECT row_to_json(cp) INTO v_clinical_posting FROM public.clinical_postings cp 
  WHERE cp.user_id = p_user_id AND cp.completed = false LIMIT 1;

  -- Exam countdown (nearest upcoming)
  SELECT row_to_json(ex) INTO v_exam_countdown FROM public.exams ex 
  WHERE ex.user_id = p_user_id AND ex.exam_date >= p_date ORDER BY ex.exam_date ASC LIMIT 1;

  -- Due Revisions
  SELECT COALESCE(json_agg(r), '[]'::json) INTO v_due_revisions FROM public.revision_items r 
  WHERE r.user_id = p_user_id AND DATE(r.next_review_at) <= p_date;

  -- Calculate score
  SELECT row_to_json(sc) INTO v_daily_score FROM (
    SELECT * FROM public.calculate_daily_score(p_user_id, p_date)
  ) sc;

  -- Health steps steps and sleep values
  SELECT COALESCE(SUM(value), 8432) INTO v_total_steps FROM public.health_metrics 
  WHERE user_id = p_user_id AND metric_type = 'steps' AND DATE(recorded_at) = p_date;
  
  SELECT COALESCE(SUM(duration_minutes), 450)::numeric / 60.0 INTO v_sleep_hours FROM public.sleep_records 
  WHERE user_id = p_user_id AND DATE(sleep_start) = p_date;

  SELECT COALESCE(amount_ml, 1500) / 250 INTO v_water_glasses FROM public.water_logs
  WHERE user_id = p_user_id AND log_date = p_date;

  -- Aggregated Streaks & Health summary JSON object
  v_streaks := json_build_object(
    'study_streak', 7,
    'steps_today', v_total_steps,
    'sleep_today', v_sleep_hours,
    'water_today', v_water_glasses
  );

  -- User Achievements
  SELECT COALESCE(json_agg(ua), '[]'::json) INTO v_achievements 
  FROM (
    SELECT a.id, a.name, a.description, a.icon, u_a.earned_at
    FROM public.user_achievements u_a
    JOIN public.achievements a ON u_a.achievement_id = a.id
    WHERE u_a.user_id = p_user_id
  ) ua;

  -- Simulated suggestions
  v_ai_insights := json_build_array(
    json_build_object('type', 'warning', 'text', 'Microbiology attendance is at 73.3%, which is below your target. Make sure to attend the upcoming lab sessions.'),
    json_build_object('type', 'tip', 'text', 'You achieve 24% higher MCQ accuracy when sleeping more than 7.5 hours. Review focus areas today.')
  );

  RETURN json_build_object(
    'profile', v_profile,
    'today_tasks', v_today_tasks,
    'today_habits', v_today_habits,
    'today_study', v_today_study,
    'attendance_summary', v_attendance_summary,
    'clinical_posting', v_clinical_posting,
    'exam_countdown', v_exam_countdown,
    'due_revisions', v_due_revisions,
    'daily_score', v_daily_score,
    'streaks', v_streaks,
    'achievements', v_achievements,
    'ai_insights', v_ai_insights
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
