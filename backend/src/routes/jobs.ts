import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get paginated published jobs
router.get('/', requireAuth, async (req, res) => {
  try {
    const { keyword, jobType, isRemote, location, salaryMin, datePosted, sortBy, matchUserSkills, page = '0' } = req.query;
    const PAGE_SIZE = 20;
    const pageNum = parseInt(page as string, 10);

    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        recruiter:profiles(id, full_name, poster_type)
      `)
      .eq('status', 'published');

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,company_name.ilike.%${keyword}%,location.ilike.%${keyword}%`);
    }
    if (jobType) {
      const types = (jobType as string).split(',');
      query = query.in('job_type', types);
    }
    if (isRemote !== undefined) {
      query = query.eq('is_remote', isRemote === 'true');
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (salaryMin) {
      query = query.gte('salary_min', parseInt(salaryMin as string, 10));
    }
    if (datePosted) {
      const now = new Date();
      if (datePosted === '24h') {
        now.setHours(now.getHours() - 24);
        query = query.gte('created_at', now.toISOString());
      } else if (datePosted === '7d') {
        now.setDate(now.getDate() - 7);
        query = query.gte('created_at', now.toISOString());
      }
    }

    if (matchUserSkills === 'true' && req.user) {
      const { data: profile } = await supabaseAdmin
        .from('student_profiles')
        .select('skills')
        .eq('id', req.user.id)
        .single();
        
      if (profile && profile.skills && profile.skills.length > 0) {
        query = query.overlaps('skills', profile.skills);
      }
    }

    if (sortBy === 'popular') {
      query = query.order('views', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const { data, error } = await query;
    
    if (error) throw error;
    res.json({ data, hasMore: data.length === PAGE_SIZE });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`*, recruiter:profiles(id, full_name, poster_type)`)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Increment views
router.post('/:id/views', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.rpc('increment_job_views', { job_id: id });
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Increment applications
router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Since we don't have an RPC yet, fetch and increment
    const { data: job } = await supabaseAdmin.from('jobs').select('applications').eq('id', id).single();
    const newCount = (job?.applications || 0) + 1;
    
    const { error } = await supabaseAdmin.from('jobs').update({ applications: newCount }).eq('id', id);
    if (error) throw error;
    
    res.json({ success: true, applications: newCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
