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
      .select(`*, company:companies(*)`)
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
      .select(`*, company:companies(*), recruiter:profiles(full_name, email)`)
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
      .select('id, email, full_name, role, status, created_at, last_seen')
      .order('created_at', { ascending: false })
      .range(page * 50, (page + 1) * 50 - 1);

    if (error) throw error;
    res.json(data);
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
