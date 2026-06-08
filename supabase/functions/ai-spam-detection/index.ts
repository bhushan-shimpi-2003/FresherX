import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    const job = payload.record;

    // Simulate AI spam detection logic (could call an external ML API here)
    const contentToAnalyze = `${job.title} ${job.description} ${job.apply_link}`.toLowerCase();
    
    // Very simple heuristics for demonstration
    const suspiciousKeywords = ['guaranteed money', 'crypto', 'no experience required $1000', 'whatsapp'];
    let spamScore = 0;
    
    for (const keyword of suspiciousKeywords) {
      if (contentToAnalyze.includes(keyword)) {
        spamScore += 30;
      }
    }

    if (spamScore > 50) {
      // Auto reject spam
      await supabase.from('jobs').update({ 
        status: 'rejected',
        rejection_reason: 'Automated AI Spam Detection flagged this post.'
      }).eq('id', job.id);
      
      console.log(`Job ${job.id} rejected for spam. Score: ${spamScore}`);
    } else {
      console.log(`Job ${job.id} passed spam check. Score: ${spamScore}`);
    }

    return new Response(JSON.stringify({ success: true, spamScore }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
