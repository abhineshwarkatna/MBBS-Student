CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('Internal', 'Practical', 'Viva', 'University', 'Custom')),
  exam_date DATE NOT NULL,
  description TEXT,
  target_score NUMERIC DEFAULT 75,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.revision_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE CASCADE NOT NULL,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  review_count INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('High', 'Moderate', 'Low')),
  mastery_score NUMERIC DEFAULT 0
);
