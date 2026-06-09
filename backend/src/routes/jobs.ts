import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get paginated published jobs
router.get('/', requireAuth, async (req, res) => {
  try {
    const { keyword, jobType, isRemote, location, salaryMin, page = '0' } = req.query;
    const PAGE_SIZE = 20;
    const pageNum = parseInt(page as string, 10);

    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        recruiter:profiles(id, full_name, avatar, poster_type)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
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
      .select(`*, recruiter:profiles(id, full_name, avatar, poster_type)`)
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
