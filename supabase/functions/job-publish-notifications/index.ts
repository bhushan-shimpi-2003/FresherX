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
    const oldJob = payload.old_record;

    // Only trigger if status changed to 'published'
    if (job.status === 'published' && oldJob?.status !== 'published') {
      console.log(`Job ${job.id} published. Sending notifications...`);
      
      // Fanout notification logic to all students who match the job preferences
      // Here you would insert into the 'notifications' table and trigger FCM
      
      return new Response(JSON.stringify({ success: true, message: 'Notifications queued' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Ignored: Not a publish event' }), {
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
