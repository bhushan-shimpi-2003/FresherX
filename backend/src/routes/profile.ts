import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Allow null if not found
    res.json(data || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Convert camelCase keys to snake_case for Supabase
    const payload = {
      full_name: updates.fullName,
      phone: updates.phone,
      bio: updates.bio,
      college: updates.college,
      degree: updates.degree,
      branch: updates.branch,
      passing_year: updates.passingYear,
      cgpa: updates.cgpa,
      skills: updates.skills,
      languages: updates.languages,
      preferred_job_types: updates.preferredJobTypes,
      preferred_locations: updates.preferredLocations,
      preferred_salary_min: updates.preferredSalaryMin,
      preferred_roles: updates.preferredRoles,
      onboarding_complete: updates.onboardingComplete,
    };

    // Remove undefined keys
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    const { data, error } = await supabaseAdmin
      .from('student_profiles')
      .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
