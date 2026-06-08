// @ts-ignore - Deno import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { studentProfile, jobDetails, recruiterProfile } = await req.json()

    if (!studentProfile || !jobDetails) {
      throw new Error("Missing profile or job details")
    }

    // 2. Call external AI API to generate a personalized pitch
    // For now, returning a mock pitch
    const mockPitch = `Hi ${recruiterProfile?.fullName || 'Recruiter'},\n\nI noticed the ${jobDetails.title} opening at ${jobDetails.companyName || 'your company'} and I'm very interested. With my background in ${studentProfile.skills?.[0] || 'software development'} and my recent projects at ${studentProfile.college || 'university'}, I believe I could be a great fit for the team. Could we connect briefly to discuss this opportunity?`;

    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({ pitch: mockPitch }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
