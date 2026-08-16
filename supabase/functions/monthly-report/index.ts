import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'No authorization header' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Authenticate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'User session invalid' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { month, year } = await req.json()
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    const report = {
      monthly_score: 83.5,
      study_hours: 92,
      subject_progress: [
        { subject: 'Pathology', progress: 72 },
        { subject: 'Pharmacology', progress: 58 },
        { subject: 'Microbiology', progress: 45 }
      ],
      attendance: 84.6,
      clinical_activity: {
        cases_logged: 14,
        procedures_observed: 8,
        procedures_performed: 4
      },
      mcq_performance: {
        quizzes_taken: 8,
        average_accuracy: 80.5
      },
      health_summary: {
        total_steps: 254000,
        average_steps: 8466
      },
      sleep_summary: {
        average_sleep: 7.3,
        sleep_consistency: 88
      },
      comparison_with_previous_month: {
        steps_change: '+12% increase in recorded steps',
        exercise_change: '+8% increase in exercise active minutes',
        sleep_change: '-3% decrease in recorded sleep duration'
      },
      ai_summary: "📈 **Monthly Progress Report**: Study hours targets were met consistently. Recorded activity levels showed a general increase, while sleep duration slightly decreased. All calculations represent raw activity trends and are not medical conclusions."
    }

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
