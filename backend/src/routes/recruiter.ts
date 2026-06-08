import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('recruiter_profiles')
      .select(`*, company:companies(*)`)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`*, company:companies(*)`)
      .eq('recruiter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        recruiter_id: userId,
        company_id: payload.companyId,
        title: payload.title,
        description: payload.description,
        requirements: payload.requirements,
        skills: payload.skills,
        job_type: payload.jobType,
        experience_level: payload.experienceLevel,
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        location: payload.location,
        is_remote: payload.isRemote ?? false,
        apply_link: payload.applyLink,
        deadline: payload.deadline,
        status: payload.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // ensure job belongs to user
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('recruiter_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Convert camelCase payload to snake_case if necessary, or just use payload directly
    // based on how the frontend sends it
    const updateData: any = {};
    if (payload.title) updateData.title = payload.title;
    if (payload.description) updateData.description = payload.description;
    if (payload.requirements) updateData.requirements = payload.requirements;
    if (payload.skills) updateData.skills = payload.skills;
    if (payload.jobType) updateData.job_type = payload.jobType;
    if (payload.experienceLevel) updateData.experience_level = payload.experienceLevel;
    if (payload.salaryMin !== undefined) updateData.salary_min = payload.salaryMin;
    if (payload.salaryMax !== undefined) updateData.salary_max = payload.salaryMax;
    if (payload.location) updateData.location = payload.location;
    if (payload.isRemote !== undefined) updateData.is_remote = payload.isRemote;
    if (payload.applyLink) updateData.apply_link = payload.applyLink;
    if (payload.deadline) updateData.deadline = payload.deadline;
    if (payload.status) updateData.status = payload.status;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .eq('recruiter_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/company', async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    const { data, error } = await supabaseAdmin
      .from('companies')
      .upsert({
        created_by: userId,
        name: payload.name,
        logo: payload.logo,
        website: payload.website,
        industry: payload.industry,
        size: payload.size,
        location: payload.location,
        description: payload.description,
        linked_in: payload.linkedIn,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const [
      { count: totalJobs },
      { count: publishedJobs },
      { count: pendingJobs },
      { data: viewData },
      { data: appData },
    ] = await Promise.all([
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId).eq('status', 'published'),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId).eq('status', 'pending'),
      supabaseAdmin.from('jobs').select('views').eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('applications').eq('recruiter_id', userId),
    ]);

    const totalViews = (viewData ?? []).reduce((sum: number, j: any) => sum + (j.views ?? 0), 0);
    const totalApplications = (appData ?? []).reduce((sum: number, j: any) => sum + (j.applications ?? 0), 0);

    res.json({
      totalJobs: totalJobs ?? 0,
      publishedJobs: publishedJobs ?? 0,
      pendingJobs: pendingJobs ?? 0,
      totalViews,
      totalApplications,
      thisWeekJobs: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
