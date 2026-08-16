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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Initialize user-scoped client to authenticate user session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'User session invalid' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize service client to manage Strava tokens safely
    const adminClient = createClient(supabaseUrl, supabaseServiceRole)

    const body = await req.json()
    const { action } = body

    const stravaClientId = Deno.env.get('STRAVA_CLIENT_ID') ?? '56789'
    const stravaClientSecret = Deno.env.get('STRAVA_CLIENT_SECRET') ?? 'dummy_secret'

    if (action === 'exchange-token') {
      const { code } = body
      if (!code) {
        return new Response(JSON.stringify({ success: false, error: 'Authorization code required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 1. Exchange OAuth code for token
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: stravaClientId,
          client_secret: stravaClientSecret,
          code,
          grant_type: 'authorization_code'
        })
      })

      const tokenData = await tokenResponse.json()
      if (tokenData.errors || !tokenData.access_token) {
        return new Response(JSON.stringify({ success: false, error: 'Token exchange failed', details: tokenData }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 2. Save tokens in DB
      const expiresAt = new Date(tokenData.expires_at * 1000).toISOString()
      const { error: dbError } = await adminClient
        .from('strava_connections')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          athlete_id: String(tokenData.athlete?.id || '')
        }, { onConflict: 'user_id' })

      if (dbError) throw dbError;

      // 3. Mark device connection as connected
      await adminClient
        .from('device_connections')
        .upsert({
          user_id: user.id,
          provider: 'strava',
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        }, { onConflict: 'user_id,provider' })

      return new Response(JSON.stringify({ success: true, message: 'Strava connected successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'sync-activities') {
      // 1. Fetch current user tokens
      const { data: connection, error: fetchErr } = await adminClient
        .from('strava_connections')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchErr || !connection) {
        return new Response(JSON.stringify({ success: false, error: 'Strava connection not linked' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      let accessToken = connection.access_token
      let expiresAt = new Date(connection.expires_at)

      // 2. Refresh token if expired or near expiry (within 5 minutes)
      if (expiresAt.getTime() - Date.now() < 300000) {
        const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
            refresh_token: connection.refresh_token,
            grant_type: 'refresh_token'
          })
        })

        const refreshData = await refreshResponse.json()
        if (refreshData.access_token) {
          accessToken = refreshData.access_token
          const newExpiry = new Date(refreshData.expires_at * 1000).toISOString()
          await adminClient
            .from('strava_connections')
            .update({
              access_token: accessToken,
              refresh_token: refreshData.refresh_token || connection.refresh_token,
              expires_at: newExpiry
            })
            .eq('user_id', user.id)
        }
      }

      // 3. Fetch activities from Strava
      const lastSync = connection.last_sync_at ? new Date(connection.last_sync_at) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const afterEpoch = Math.floor(lastSync.getTime() / 1000)

      const activitiesResponse = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      const activities = await activitiesResponse.json()
      if (activities.errors || !Array.isArray(activities)) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch athlete activities from Strava', details: activities }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      let insertedCount = 0
      let totalSteps = 0
      let totalCalories = 0
      let totalActiveMinutes = 0

      // 4. Save activities in public tables
      for (const act of activities) {
        const durationMinutes = Math.round(act.moving_time / 60.0)
        const distanceKm = Number((act.distance / 1000.0).toFixed(2))
        
        let estSteps = 0
        if (act.type === 'Run') estSteps = durationMinutes * 155
        else if (act.type === 'Walk') estSteps = durationMinutes * 115

        let estCalories = act.calories || 0
        if (!estCalories) {
          const met = act.type === 'Run' ? 8.0 : act.type === 'Walk' ? 4.0 : 6.0
          estCalories = Math.round(durationMinutes * met * 7.5)
        }

        // Save workout
        await adminClient.from('workouts').upsert({
          user_id: user.id,
          source: 'strava',
          source_record_id: `strava_${act.id}`,
          workout_type: act.type,
          started_at: act.start_date,
          ended_at: new Date(new Date(act.start_date).getTime() + act.elapsed_time * 1000).toISOString(),
          duration_minutes: durationMinutes,
          distance_km: distanceKm,
          calories: estCalories,
          metadata: { strava_id: act.id, name: act.name, heart_rate_avg: act.average_heartrate }
        }, { onConflict: 'user_id,source,source_record_id' })

        // Save steps health metrics
        if (estSteps > 0) {
          totalSteps += estSteps
          await adminClient.from('health_metrics').upsert({
            user_id: user.id,
            source: 'strava',
            source_record_id: `strava_steps_${act.id}`,
            recorded_at: act.start_date,
            metric_type: 'steps',
            value: estSteps,
            unit: 'steps'
          }, { onConflict: 'user_id,source,source_record_id,metric_type,recorded_at' })
        }

        if (estCalories > 0) {
          totalCalories += estCalories
          await adminClient.from('health_metrics').upsert({
            user_id: user.id,
            source: 'strava',
            source_record_id: `strava_cals_${act.id}`,
            recorded_at: act.start_date,
            metric_type: 'calories',
            value: estCalories,
            unit: 'kcal'
          }, { onConflict: 'user_id,source,source_record_id,metric_type,recorded_at' })
        }

        totalActiveMinutes += durationMinutes
        insertedCount++
      }

      // 5. Update last sync timestamp
      await adminClient
        .from('strava_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', user.id)

      await adminClient
        .from('device_connections')
        .upsert({
          user_id: user.id,
          provider: 'strava',
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        }, { onConflict: 'user_id,provider' })

      return new Response(JSON.stringify({
        success: true,
        workoutsSynced: insertedCount,
        caloriesEst: totalCalories,
        stepsEst: totalSteps,
        activeMinutes: totalActiveMinutes,
        lastSync: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'disconnect') {
      // 1. Delete Strava connection row
      await adminClient
        .from('strava_connections')
        .delete()
        .eq('user_id', user.id)

      // 2. Disconnect in device_connections
      await adminClient
        .from('device_connections')
        .upsert({
          user_id: user.id,
          provider: 'strava',
          connection_status: 'disconnected',
          last_sync_at: null
        }, { onConflict: 'user_id,provider' })

      return new Response(JSON.stringify({ success: true, message: 'Strava disconnected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: false, error: 'Action invalid' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
