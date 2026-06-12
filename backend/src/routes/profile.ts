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
      resume_data: updates.resumeData,
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

router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;

    // Supabase Auth Admin can delete the user directly from the auth.users table.
    // If you have `ON DELETE CASCADE` set up on your `profiles` table referencing `auth.users`,
    // this will automatically delete the user's profile and everything else linked to it.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      // If for some reason the user wasn't in auth.users (e.g. custom auth system),
      // we just delete from profiles table manually.
      console.warn('Auth deletion warning:', authError.message);
    }

    // Manually delete the public profile to be absolutely sure
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error: any) {
    console.error('Account Deletion Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-skill', async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, score, passed } = req.body;

    if (!skill || score === undefined || passed === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('skill_verifications')
      .insert({
        user_id: userId,
        skill: skill,
        score: score,
        passed: passed
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
