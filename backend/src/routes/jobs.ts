import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { sensitiveRouteLimiter } from '../middleware/rateLimiter';
import { NotificationService } from '../services/notification.service';

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
      // Use Full-Text Search index
      const ftsQuery = (keyword as string).split(' ').filter(Boolean).join(' | ');
      query = query.textSearch('fts', ftsQuery);
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

    // 1. Exclude applied jobs for this user
    if (req.user) {
      const { data: applied } = await supabaseAdmin
        .from('applied_jobs')
        .select('job_id')
        .eq('user_id', req.user.id);
      
      if (applied && applied.length > 0) {
        const appliedIds = applied.map(a => a.job_id);
        query = query.not('id', 'in', `(${appliedIds.join(',')})`);
      }
    }

    // 2. Recommended jobs (matchUserSkills)
    if (matchUserSkills === 'true' && req.user) {
      const { data: profile } = await supabaseAdmin
        .from('student_profiles')
        .select('skills, preferred_roles')
        .eq('id', req.user.id)
        .single();
        
      if (profile) {
        // Must be posted in last 3 days for recommended
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        query = query.gte('created_at', threeDaysAgo.toISOString());

        // Match skills OR preferred roles
        // We will do this by chaining .or() 
        const orConditions = [];
        if (profile.skills && profile.skills.length > 0) {
          // .ov means overlap, meaning at least ONE skill matches
          orConditions.push(`skills.ov.{${profile.skills.join(',')}}`);
        }
        if (profile.preferred_roles && profile.preferred_roles.length > 0) {
          // Construct ILIKE conditions for each role against the title
          const roleConditions = profile.preferred_roles.map((r: string) => `title.ilike.%${r}%`);
          orConditions.push(roleConditions.join(','));
        }
        
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        }
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
    if (!req.user) throw new Error('Unauthorized');
    const { id } = req.params;
    
    const { error } = await supabaseAdmin.from('job_views').insert({
      job_id: id,
      user_id: req.user.id
    });
    
    // Handle duplicate view errors (23505 = unique_violation) gracefully
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: true, message: 'Already viewed' });
      }
      throw error;
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Increment applications
router.post('/:id/apply', requireAuth, sensitiveRouteLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Atomically increment the application count using our custom RPC
    const { error: incrementError } = await supabaseAdmin.rpc('increment_job_applications', { p_job_id: id });
    if (incrementError) throw incrementError;

    // 2. Fetch the updated job data for notification context
    const { data: job, error: fetchError } = await supabaseAdmin.from('jobs').select('title, applications, recruiter_id').eq('id', id).single();
    if (fetchError) throw fetchError;
    const newCount = job?.applications || 0;
    
    // Track in applied_jobs
    if (req.user) {
      const { error: applyError } = await supabaseAdmin.from('applied_jobs').insert({
        user_id: req.user.id,
        job_id: id
      });
      // Handle duplicate application error (23505 = unique_violation)
      if (applyError) {
        if (applyError.code === '23505') {
          return res.status(409).json({ error: 'You have already applied to this job.' });
        }
        throw applyError;
      }
    }

    // Notify recruiter
    if (job?.recruiter_id) {
      await supabaseAdmin.from('notifications').insert([{
        user_id: job.recruiter_id,
        title: '🎉 New Application Received!',
        body: `Great news! A candidate just applied for your role: ${job.title}. Tap to review their profile 🚀`,
        type: 'application',
        data: { job_id: id }
      }]);

      // Send actual FCM push notification
      await NotificationService.sendToUser(
        job.recruiter_id,
        {
          title: '🎉 New Application Received!',
          body: `Great news! A candidate just applied for your role: ${job.title}. Tap to review their profile 🚀`,
          data: { job_id: id as string }
        }
      );
    }
    
    res.json({ success: true, applications: newCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get applied jobs
router.get('/me/applied', requireAuth, async (req, res) => {
  try {
    if (!req.user) throw new Error('Unauthorized');
    
    const { data: applied, error: appliedError } = await supabaseAdmin
      .from('applied_jobs')
      .select('job_id')
      .eq('user_id', req.user.id);
      
    if (appliedError) throw appliedError;
    
    if (!applied || applied.length === 0) {
      return res.json({ data: [] });
    }
    
    const jobIds = applied.map(a => a.job_id);
    const PAGE_SIZE = 20;
    const pageNum = parseInt(req.query.page as string || '0', 10);

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`*, recruiter:profiles(id, full_name, poster_type)`)
      .in('id', jobIds)
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);
      
    if (error) throw error;
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
