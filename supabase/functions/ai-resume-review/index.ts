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
    const { recordId, resumeText } = await req.json()

    // 1. Validate request
    if (!resumeText) {
      throw new Error("Missing resumeText in request")
    }

    // 2. Call external AI API (e.g. Claude Sonnet or OpenAI)
    // For now, this is a mocked response
    const mockAnalysis = {
      atsScore: 78,
      improvements: [
        "Quantify your achievements (e.g., increased performance by 20%)",
        "Add a summary statement at the top",
      ],
      missingKeywords: ["TypeScript", "Docker", "Agile"],
      sectionAnalysis: {
        education: "Good, but missing graduation month.",
        experience: "Bullet points lack action verbs."
      }
    }

    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Return the AI results
    return new Response(
      JSON.stringify(mockAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
