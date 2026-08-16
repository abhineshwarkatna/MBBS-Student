-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  college TEXT,
  mbbs_year INTEGER CHECK (mbbs_year BETWEEN 1 AND 4),
  semester TEXT,
  academic_year TEXT,
  age INTEGER,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  wake_time TIME DEFAULT '06:00:00',
  sleep_time TIME DEFAULT '23:00:00',
  daily_study_target INTEGER DEFAULT 4,
  daily_step_target INTEGER DEFAULT 10000,
  daily_sleep_target NUMERIC DEFAULT 7.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger function to automatically spawn a profile row on authentication signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    mbbs_year, 
    semester, 
    college, 
    daily_study_target, 
    daily_step_target, 
    daily_sleep_target
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Abhineshwar'),
    new.raw_user_meta_data->>'avatar_url',
    3, -- Default 3rd MBBS
    '6th Semester', -- Default 6th Semester
    COALESCE(new.raw_user_meta_data->>'college', 'AIIMS Delhi'),
    4.5, -- Daily study target
    10000, -- Steps target
    7.5 -- Sleep hours target
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user creation trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
