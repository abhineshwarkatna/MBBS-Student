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

    const payload = await req.json()
    const { metrics = [], sleep = [], workouts = [] } = payload

    let stepsCount = 0
    let sleepCount = 0
    let workoutCount = 0

    // 1. Process health metrics (Steps, calories, heart rate, active minutes)
    for (const m of metrics) {
      const { data, error } = await supabaseClient
        .from('health_metrics')
        .upsert({
          user_id: user.id,
          source: m.source || 'google-health',
          source_record_id: m.source_record_id,
          recorded_at: m.recorded_at,
          metric_type: m.metric_type,
          value: m.value,
          unit: m.unit,
          metadata: m.metadata || {}
        }, { onConflict: 'user_id,source,source_record_id,metric_type,recorded_at' })

      if (!error) stepsCount++
    }

    // 2. Process Sleep records
    for (const s of sleep) {
      const { data, error } = await supabaseClient
        .from('sleep_records')
        .upsert({
          user_id: user.id,
          source: s.source || 'google-health',
          source_record_id: s.source_record_id,
          sleep_start: s.sleep_start,
          sleep_end: s.sleep_end,
          duration_minutes: s.duration_minutes,
          sleep_quality: s.sleep_quality,
          metadata: s.metadata || {}
        }, { onConflict: 'user_id,source,source_record_id' })

      if (!error) sleepCount++
    }

    // 3. Process Workouts
    for (const w of workouts) {
      const { data, error } = await supabaseClient
        .from('workouts')
        .upsert({
          user_id: user.id,
          source: w.source || 'google-health',
          source_record_id: w.source_record_id,
          workout_type: w.workout_type,
          started_at: w.started_at,
          ended_at: w.ended_at,
          duration_minutes: w.duration_minutes,
          distance_km: w.distance_km,
          calories: w.calories,
          metadata: w.metadata || {}
        }, { onConflict: 'user_id,source,source_record_id' })

      if (!error) workoutCount++
    }

    // Update connection status
    await supabaseClient
      .from('device_connections')
      .upsert({
        user_id: user.id,
        provider: 'google-health',
        connection_status: 'connected',
        last_sync_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' })

    const lastSyncStr = new Date().toISOString()

    return new Response(
      JSON.stringify({
        success: true,
        stepsRecords: stepsCount,
        sleepRecords: sleepCount,
        workoutRecords: workoutCount,
        lastSync: lastSyncStr
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
