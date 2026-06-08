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
    const { targetRole, currentSkills } = await req.json()

    if (!targetRole) {
      throw new Error("Missing targetRole in request")
    }

    // 2. Call external AI API (e.g. Claude Sonnet or OpenAI)
    // For now, this is a mocked response
    const mockRoadmap = {
      targetRole,
      phases: [
        {
          title: "Phase 1: Foundations",
          description: `Learn the core concepts required for ${targetRole}.`,
          resources: ["FreeCodeCamp", "Official Documentation"],
          milestones: ["Understand basic syntax", "Build a simple project"]
        },
        {
          title: "Phase 2: Advanced Topics",
          description: "Dive deep into specialized areas and frameworks.",
          resources: ["Udemy Courses", "GitHub Open Source"],
          milestones: ["Master state management", "Implement authentication"]
        },
        {
          title: "Phase 3: Interview Prep",
          description: "Prepare for technical interviews and build a portfolio.",
          resources: ["LeetCode", "FresherX AI Resume Builder"],
          milestones: ["Solve 50 easy problems", "Deploy 2 full-stack apps"]
        }
      ]
    }

    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Return the AI results
    return new Response(
      JSON.stringify(mockRoadmap),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
