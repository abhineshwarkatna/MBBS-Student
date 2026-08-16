-- Strava Integration credentials table
CREATE TABLE IF NOT EXISTS public.strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  athlete_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.strava_connections ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can manage their own Strava tokens" ON public.strava_connections
  FOR ALL USING (auth.uid() = user_id);
