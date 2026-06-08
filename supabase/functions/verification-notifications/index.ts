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
    const recruiter = payload.record;
    const oldRecruiter = payload.old_record;

    // Trigger on status change from pending
    if (recruiter.status !== oldRecruiter?.status && oldRecruiter?.status === 'pending') {
      let title = '';
      let body = '';

      if (recruiter.status === 'verified') {
        title = 'Account Verified!';
        body = 'Your recruiter account has been approved. You can now post jobs.';
      } else if (recruiter.status === 'rejected') {
        title = 'Account Update';
        body = recruiter.verification_note || 'Your account verification requires attention.';
      }

      if (title) {
        // Insert notification
        await supabase.from('notifications').insert({
          user_id: recruiter.user_id,
          type: 'system',
          title,
          body,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
