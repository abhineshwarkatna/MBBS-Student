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

    // Get user academic context
    const { data: tasks } = await supabaseClient.from('tasks').select('*').eq('user_id', user.id).eq('status', 'pending')
    const { data: revisions } = await supabaseClient.from('revision_items').select('*').eq('user_id', user.id)
    const { data: posting } = await supabaseClient.from('clinical_postings').select('*').eq('user_id', user.id).eq('completed', false).limit(1)

    const tomorrowSchedule = [
      { time: '06:00 AM', title: '🌅 Wake Up', notes: 'Maintain target wake-up hour.' },
      { time: '07:00 AM', title: '🏃 Morning Walk', notes: 'Aim for daily step counts goal.' },
      { time: '09:00 AM', title: `🩺 Clinical Posting: ${posting?.[0]?.department || 'General Medicine'}`, notes: `Ward Posting at ${posting?.[0]?.location || 'Ward 3'} under ${posting?.[0]?.mentor || 'Dr. Sandeep'}.` },
      { time: '02:00 PM', title: '📚 University Lectures', notes: 'Pathology & Pharmacology sessions.' },
      { 
        time: '04:30 PM', 
        title: '🧠 Spaced Revision Replay', 
        notes: revisions && revisions.length > 0 
          ? `Review: ${revisions[0].topicName} (Stage ${revisions[0].stage})`
          : 'Review general pathology units.' 
      },
      { 
        time: '06:00 PM', 
        title: '✏️ MCQ Practice Run', 
        notes: tasks && tasks.length > 0
          ? `Pending task: ${tasks[0].title}`
          : 'Practice timed clinical MCQs.'
      },
      { time: '09:00 PM', title: '📝 Clinical Diary Log', notes: 'Log anonymized patient cases from today.' },
      { time: '11:00 PM', title: '😴 Sleep Time', notes: 'Target target: 7.5 hours.' }
    ]

    return new Response(
      JSON.stringify({
        success: true,
        plan: tomorrowSchedule
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
