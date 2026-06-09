import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Middleware to ensure admin access only (based on user metadata or role table)
const requireAdmin = async (req: any, res: any, next: any) => {
  // Assuming role is checked by joining profiles
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();
    
  if (data?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

router.use(requireAuth, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [
      { count: students },
      { count: recruiters },
      { count: jobs },
      { count: pendingRec },
      { count: pendingJobs },
      { count: reports },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'recruiter'),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('recruiter_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    res.json({
      totalStudents: students ?? 0,
      totalRecruiters: recruiters ?? 0,
      totalJobs: jobs ?? 0,
      pendingRecruiters: pendingRec ?? 0,
      pendingJobs: pendingJobs ?? 0,
      totalReports: reports ?? 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recruiters', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_profiles')
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/recruiters/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    
    const { error } = await supabaseAdmin
      .from('recruiter_profiles')
      .update({
        status: action === 'approve' ? 'verified' : 'rejected',
        verification_note: note,
        verified_at: action === 'approve' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`*, recruiter:profiles(full_name, email)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const statusMap: Record<string, string> = { approve: 'published', reject: 'rejected', spam: 'archived' };
    
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ status: statusMap[action], rejection_reason: reason })
      .eq('id', id);

    if (error) throw error;

    if (action === 'approve') {
      // Fetch the job details
      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('title, company_name, skills')
        .eq('id', id)
        .single();
        
      if (job && job.skills && job.skills.length > 0) {
        // Find students whose skills overlap with job skills
        const { data: matchingStudents } = await supabaseAdmin
          .from('student_profiles')
          .select('user_id')
          .overlaps('skills', job.skills);

        if (matchingStudents && matchingStudents.length > 0) {
          const notifications = matchingStudents.map(student => ({
            user_id: student.user_id,
            title: 'New Matching Job!',
            body: `${job.company_name || 'A company'} just posted a new job: ${job.title} that matches your skills. Apply fast!`,
            type: 'job_alert',
            data: { job_id: id }
          }));
          // Insert notifications in batches if needed, but for now we do it in one go
          await supabaseAdmin.from('notifications').insert(notifications);
        }
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const updateData: any = {};
    if (payload.title) updateData.title = payload.title;
    if (payload.companyName) updateData.company_name = payload.companyName;
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

    const { error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, status, created_at, last_seen, recruiter_profiles(auto_verified)')
      .order('created_at', { ascending: false })
      .range(page * 50, (page + 1) * 50 - 1);

    if (error) throw error;
    
    // Flatten the recruiter_profiles object for easier frontend consumption
    const formattedData = data.map(user => ({
      ...user,
      auto_verified: user.recruiter_profiles ? (user.recruiter_profiles as any).auto_verified : false,
      recruiter_profiles: undefined
    }));

    res.json(formattedData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/:id/auto-verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { autoVerified } = req.body;
    
    // Only applies to recruiters, we just update or insert their recruiter_profile
    const { error } = await supabaseAdmin
      .from('recruiter_profiles')
      .upsert({ user_id: id, auto_verified: autoVerified }, { onConflict: 'user_id' });

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: action === 'suspend' ? 'suspended' : 'active' })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const { error } = await supabaseAdmin
      .from('reports')
      .update({ status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'open' })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', async (req, res) => {
  try {
    const [profilesData, jobsData, reportsData] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('jobs').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('reports').select('id, type, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const activities: any[] = [];
    if (profilesData.data) {
      profilesData.data.forEach(p => activities.push({ id: `p-${p.id}`, title: `New ${p.role} signed up: ${p.full_name || 'Unknown'}`, time: p.created_at, type: 'user' }));
    }
    if (jobsData.data) {
      jobsData.data.forEach(j => activities.push({ id: `j-${j.id}`, title: `New job posted: ${j.title}`, time: j.created_at, type: 'job' }));
    }
    if (reportsData.data) {
      reportsData.data.forEach(r => activities.push({ id: `r-${r.id}`, title: `New report submitted: ${r.type}`, time: r.created_at, type: 'report' }));
    }

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    res.json(activities.slice(0, 10));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
