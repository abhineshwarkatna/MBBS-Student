-- Global Achievements Seed
INSERT INTO public.achievements (id, name, description, icon, requirement_type, requirement_value) VALUES
('11111111-1111-1111-1111-111111111111', 'Early Bird', 'Log wake-up time before 6:30 AM.', 'Sunrise', 'wake_time', 6.5),
('22222222-2222-2222-2222-222222222222', 'Dedicated Learner', 'Log a total of 25 study hours.', 'BookOpen', 'study_hours', 25.0),
('33333333-3333-3333-3333-333333333333', 'MCQ Specialist', 'Achieve >85% accuracy in a quiz of 10+ questions.', 'BrainCircuit', 'mcq_accuracy', 85.0),
('44444444-4444-4444-4444-444444444444', 'Clinical Observer', 'Log 5 distinct clinical cases in the case book.', 'ClipboardList', 'cases_logged', 5.0),
('55555555-5555-5555-5555-555555555555', 'Hydration Champion', 'Meet daily water goals 5 days in a row.', 'Droplet', 'hydration_streak', 5.0),
('66666666-6666-6666-6666-666666666666', 'Streak Master', 'Maintain a 7-day study schedule streak.', 'Flame', 'study_streak', 7.0)
ON CONFLICT (name) DO UPDATE SET description = excluded.description;

-- Core MBBS Curriculum, Clinical Logbook, and Health Activity Seed
DO $$
DECLARE
  v_user_id UUID;
  v_sub_path UUID := '11111111-0000-0000-0000-000000000001';
  v_sub_pharm UUID := '11111111-0000-0000-0000-000000000002';
  v_sub_micro UUID := '11111111-0000-0000-0000-000000000003';
BEGIN
  -- Get the first user or default to a dummy UUID if no user is registered yet
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    -- If no profile exists, create a dummy placeholder uuid for local migrations
    v_user_id := '00000000-0000-0000-0000-000000000000';
    -- Temporarily disable constraint checks so mock seed runs without breaking
    ALTER TABLE public.profiles DISABLE TRIGGER ALL;
    INSERT INTO public.profiles (id, full_name, college, mbbs_year, semester)
    VALUES (v_user_id, 'Demo Health Student', 'AIIMS Delhi', 3, '6th Semester')
    ON CONFLICT DO NOTHING;
    ALTER TABLE public.profiles ENABLE TRIGGER ALL;
  END IF;
  
  -- Insert Subjects
  INSERT INTO public.subjects (id, user_id, name, description, color, target_progress) VALUES
  (v_sub_path, v_user_id, 'Pathology', 'Study of structural, biochemical, and functional changes in cells, tissues, and organs.', 'teal', 100),
  (v_sub_pharm, v_user_id, 'Pharmacology', 'Study of drugs and their actions on biological systems.', 'blue', 100),
  (v_sub_micro, v_user_id, 'Microbiology', 'Study of microscopic organisms, including bacteria, viruses, fungi, and parasites.', 'indigo', 100)
  ON CONFLICT DO NOTHING;

  -- Insert Syllabus Topics
  INSERT INTO public.syllabus_topics (user_id, subject_id, unit, title, status, difficulty, importance) VALUES
  (v_user_id, v_sub_path, 'General Pathology', 'Cell Injury, Death and Adaptations', 'completed', 'Moderate', 'High'),
  (v_user_id, v_sub_path, 'General Pathology', 'Acute and Chronic Inflammation', 'learning', 'High', 'High'),
  (v_user_id, v_sub_path, 'Systemic Pathology', 'Glomerular Diseases', 'needs_revision', 'High', 'High'),
  (v_user_id, v_sub_pharm, 'General Pharmacology', 'Pharmacokinetics and Dynamics', 'completed', 'Moderate', 'High'),
  (v_user_id, v_sub_pharm, 'Autonomic Nervous System', 'Adrenergic Receptors and Drugs', 'learning', 'High', 'High'),
  (v_user_id, v_sub_micro, 'Bacteriology', 'Staphylococcus and Streptococcus', 'completed', 'Low', 'Medium')
  ON CONFLICT DO NOTHING;

  -- Insert MCQs
  INSERT INTO public.mcq_questions (id, subject_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
  ('12345678-1111-1111-1111-111111111111', v_sub_path, 'A 45-year-old male presents with hematuria, proteinuria, and hypertension. Renal biopsy shows diffuse proliferative glomerulonephritis. Immunofluorescence shows subendothelial IgG deposits. What is the most likely diagnosis?', 'Membranous Nephropathy', 'Post-Streptococcal Glomerulonephritis', 'Membranoproliferative Glomerulonephritis', 'Minimal Change Disease', 'C', 'Membranoproliferative glomerulonephritis (MPGN) is characterized by subendothelial IgG deposits and double-contouring of the glomerular basement membrane.', 'Hard'),
  ('12345678-2222-2222-2222-222222222222', v_sub_pharm, 'Which of the following beta-blockers also possesses alpha-1 adrenergic blocking activity, making it effective for hypertensive emergencies?', 'Metoprolol', 'Propranolol', 'Labetalol', 'Atenolol', 'C', 'Labetalol is a combined alpha and beta blocker used in severe hypertension and hypertensive emergencies.', 'Medium')
  ON CONFLICT DO NOTHING;

  -- Insert clinical postings
  INSERT INTO public.clinical_postings (id, user_id, department, posting_date, location, mentor, posting_type, cases_seen, completed) VALUES
  ('22222222-1111-1111-1111-111111111111', v_user_id, 'General Medicine', '2026-08-01', 'Ward 3', 'Dr. Sandeep Sharma', 'Ward Posting', 12, false),
  ('22222222-2222-2222-2222-222222222222', v_user_id, 'Pediatrics', '2026-07-01', 'OPD Room 4', 'Dr. Anjali Mehta', 'OPD', 24, true)
  ON CONFLICT DO NOTHING;

  -- Insert Case Logs
  INSERT INTO public.case_logs (user_id, clinical_posting_id, date, department, case_type, presenting_complaint, diagnosis_discussion, learning_points, supervisor) VALUES
  (v_user_id, '22222222-1111-1111-1111-111111111111', '2026-08-16', 'General Medicine', 'Acute Presentation', 'Shortness of breath and swelling of legs', 'Mitral Stenosis secondary to Rheumatic Heart Disease', 'Auscultated mid-diastolic murmur with opening snap at apex', 'Dr. Sandeep Sharma')
  ON CONFLICT DO NOTHING;

  -- Insert Attendance Records
  INSERT INTO public.attendance (user_id, subject_id, date, class_type, attended) VALUES
  (v_user_id, v_sub_path, '2026-08-10', 'Lecture', true),
  (v_user_id, v_sub_path, '2026-08-11', 'Lecture', true),
  (v_user_id, v_sub_path, '2026-08-12', 'Lecture', false),
  (v_user_id, v_sub_pharm, '2026-08-10', 'Lecture', true),
  (v_user_id, v_sub_pharm, '2026-08-12', 'Lecture', true)
  ON CONFLICT DO NOTHING;

  -- Insert Exams
  INSERT INTO public.exams (user_id, name, exam_type, exam_date, description) VALUES
  (v_user_id, 'University Finals', 'University', '2026-09-27', 'Final MBBS Professional Exams')
  ON CONFLICT DO NOTHING;

  -- Insert Tasks
  INSERT INTO public.tasks (user_id, title, description, category, priority, due_date, status) VALUES
  (v_user_id, 'Read Renal Pathology Slides', 'Review diffuse proliferative glomerulonephritis features', 'Study', 'High', '2026-08-16', 'pending'),
  (v_user_id, 'Practice Pharmacology MCQs', 'Take beta-blockers mock quiz', 'Study', 'Medium', '2026-08-16', 'pending')
  ON CONFLICT DO NOTHING;

  -- Insert Habits
  INSERT INTO public.habits (id, user_id, name, description, target_frequency) VALUES
  ('33333333-1111-1111-1111-111111111111', v_user_id, 'Review Flashcards', 'Practice spaced-repetition deck', 'Daily'),
  ('33333333-2222-2222-2222-222222222222', v_user_id, 'Auscultate Ward Cases', 'Listen to murmurs during rounds', 'Daily')
  ON CONFLICT DO NOTHING;

  -- Insert Habit Logs
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed) VALUES
  ('33333333-1111-1111-1111-111111111111', v_user_id, '2026-08-16', true)
  ON CONFLICT DO NOTHING;

  -- Seed initial smartwatch connection state
  INSERT INTO public.device_connections (user_id, provider, connection_status, last_sync_at)
  VALUES (v_user_id, 'google-health', 'connected', '2026-08-16 09:42:00+00')
  ON CONFLICT DO NOTHING;

  -- Seed Health metrics
  INSERT INTO public.health_metrics (user_id, source, source_record_id, recorded_at, metric_type, value, unit) VALUES
  (v_user_id, 'google-health', 'steps_today_16', '2026-08-16 09:00:00+00', 'steps', 8432, 'steps'),
  (v_user_id, 'google-health', 'calories_today_16', '2026-08-16 09:00:00+00', 'calories', 420, 'kcal'),
  (v_user_id, 'google-health', 'exercise_today_16', '2026-08-16 09:00:00+00', 'active_minutes', 48, 'minutes'),
  (v_user_id, 'google-health', 'hr_today_16', '2026-08-16 09:00:00+00', 'heart_rate', 72, 'BPM')
  ON CONFLICT DO NOTHING;

  -- Seed Sleep records
  INSERT INTO public.sleep_records (user_id, source, source_record_id, sleep_start, sleep_end, duration_minutes, sleep_quality) VALUES
  (v_user_id, 'google-health', 'sleep_today_16', '2026-08-15 22:30:00+00', '2026-08-16 05:54:00+00', 444, 85)
  ON CONFLICT DO NOTHING;

  -- Seed Water log
  INSERT INTO public.water_logs (user_id, log_date, amount_ml) VALUES
  (v_user_id, '2026-08-16', 1500)
  ON CONFLICT DO NOTHING;

END $$;
