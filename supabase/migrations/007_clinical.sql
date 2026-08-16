CREATE TABLE IF NOT EXISTS public.clinical_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  department TEXT NOT NULL,
  posting_date DATE NOT NULL,
  location TEXT,
  mentor TEXT,
  posting_type TEXT CHECK (posting_type IN ('Ward Posting', 'OPD', 'OT', 'Labor Room')),
  cases_seen INTEGER DEFAULT 0,
  procedures_observed INTEGER DEFAULT 0,
  procedures_performed INTEGER DEFAULT 0,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.case_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clinical_posting_id UUID REFERENCES public.clinical_postings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  department TEXT,
  case_type TEXT,
  presenting_complaint TEXT NOT NULL,
  history_notes TEXT,
  examination_notes TEXT,
  investigation_notes TEXT,
  diagnosis_discussion TEXT NOT NULL,
  management_discussion TEXT,
  learning_points TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
