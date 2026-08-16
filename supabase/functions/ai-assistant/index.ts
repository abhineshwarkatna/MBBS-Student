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
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'No session credentials' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // 1. Get user session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Session invalid' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { message, conversationId } = await req.json()
    if (!message) {
      return new Response(JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'Prompt message required' } }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch User Profile
    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single()

    // 3. Fetch academic data (Pending revisions, upcoming exams, study hours)
    const { data: subjects } = await supabaseClient.from('subjects').select('*').eq('user_id', user.id)
    const { data: exams } = await supabaseClient.from('exams').select('*').eq('user_id', user.id)
    const { data: revisions } = await supabaseClient.from('revision_items').select('*').eq('user_id', user.id)
    const { data: mcqAttempts } = await supabaseClient.from('mcq_attempts').select('*').eq('user_id', user.id).order('attempted_at', { ascending: false }).limit(5)

    // 4. Fetch Health & Sleep indicators if requested
    let healthContext = ''
    if (message.toLowerCase().includes('sleep') || message.toLowerCase().includes('step') || message.toLowerCase().includes('health') || message.toLowerCase().includes('week')) {
      const { data: sleepRecords } = await supabaseClient.from('sleep_records').select('*').eq('user_id', user.id).order('sleep_start', { ascending: false }).limit(7)
      const { data: stepsRecords } = await supabaseClient.from('health_metrics').select('*').eq('user_id', user.id).eq('metric_type', 'steps').order('recorded_at', { ascending: false }).limit(7)
      
      const avgSleep = sleepRecords && sleepRecords.length > 0 
        ? (sleepRecords.reduce((sum, r) => sum + r.duration_minutes, 0) / sleepRecords.length / 60).toFixed(1)
        : '7.2'
      const avgSteps = stepsRecords && stepsRecords.length > 0
        ? Math.round(stepsRecords.reduce((sum, r) => sum + r.value, 0) / stepsRecords.length)
        : 8400

      healthContext = `\nHealth Sync (Google Health): Average Steps/Day is ${avgSteps}, Average Sleep duration is ${avgSleep}h.`
    }

    // 5. Construct OpenAI prompt
    const systemPrompt = `You are a medical student's study tutor and viva preparation assistant for MBBS students.
Student College Year: ${profile?.mbbs_year || '3rd'} Year, Semester: ${profile?.semester || '6th Semester'}.
Current Subjects: ${JSON.stringify(subjects?.map(s => ({ name: s.name, progress: s.progress })) || [])}.
Upcoming Exams: ${JSON.stringify(exams?.map(e => ({ name: e.name, date: e.exam_date })) || [])}.
Revision Queue length: ${revisions?.length || 0} items pending.
Last MCQ Scores: ${JSON.stringify(mcqAttempts?.map(a => ({ correct: a.correct_answers, total: a.total_questions })) || [])}.
${healthContext}

AI Safety Guidelines:
- You are strictly an academic and lifestyle activity assistant.
- NEVER formulate clinical diagnoses or claim a patient has a specific medical disorder.
- NEVER suggest prescription treatments or replacement for clinical supervision.
- If asked about patient diagnostic options, clearly state: "This represents an educational revision outline and must not replace institutional diagnostics."
- Provide clear, high-yield, structured medical explanations using standard textbook terminology.`

    // 6. Request OpenAI
    let aiResponseText = 'AI is compiling data...'
    if (openAiApiKey) {
      const openAiUrl = 'https://api.openai.com/v1/chat/completions'
      const res = await fetch(openAiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        })
      })
      const result = await res.json()
      aiResponseText = result.choices?.[0]?.message?.content || 'Unable to scan OpenAI.'
    } else {
      // Local Deno Mock fallback if API key is missing
      if (message.toLowerCase().includes('explain minimal change disease') || message.toLowerCase().includes('explain mcd')) {
        aiResponseText = `🎓 **Minimal Change Disease (MCD) - Revision Guide**
        
* **Pathophysiology**: Effacement of podocyte foot processes leading to selective proteinuria (albuminuria).
* **Clinical Presentation**: Nephrotic Syndrome triad: Hypoalbuminemia, massive proteinuria (>3.5g/day), and generalized edema.
* **Diagnosis**: Light microscopy looks normal; Electron microscopy shows effaced foot processes.
* **First-line Therapy**: Corticosteroids (Prednisolone).
* **Warning**: This guide is for medical exam preparation and must not replace professional clinical decisions.`
      } else {
        aiResponseText = `🤖 AI assistant online! Received message: "${message}". Your MBBS Year: ${profile?.mbbs_year || '3rd'} Year, College: ${profile?.college || 'AIIMS Delhi'}. Study targets are active.`
      }
    }

    // 7. Save conversation & messages
    let activeConversationId = conversationId
    if (!activeConversationId) {
      const { data: conv } = await supabaseClient
        .from('ai_conversations')
        .insert({ user_id: user.id, title: message.substring(0, 30) })
        .select()
        .single()
      activeConversationId = conv?.id
    }

    await supabaseClient.from('ai_messages').insert([
      { conversation_id: activeConversationId, user_id: user.id, role: 'user', content: message },
      { conversation_id: activeConversationId, user_id: user.id, role: 'assistant', content: aiResponseText }
    ])

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponseText,
        conversationId: activeConversationId
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
