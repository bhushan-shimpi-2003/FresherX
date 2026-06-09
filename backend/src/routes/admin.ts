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

router.get('/analytics', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const isoDate = sevenDaysAgo.toISOString();

    const [
      { data: recentProfiles },
      { data: recentJobs },
      { data: allSkills },
      { data: companiesData },
      { data: recentApps }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('created_at, role').gte('created_at', isoDate),
      supabaseAdmin.from('jobs').select('created_at').gte('created_at', isoDate),
      supabaseAdmin.from('student_profiles').select('skills'),
      supabaseAdmin.from('jobs').select('applications, company_name'),
      supabaseAdmin.from('applications').select('created_at').gte('created_at', isoDate),
    ]);

    // 1. Growth Data
    const growthData = Array(7).fill(0).map((_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), students: 0, recruiters: 0, jobs: 0 };
    });

    (recentProfiles || []).forEach((p: any) => {
      const dStr = new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      const day = growthData.find(d => d.date === dStr);
      if (day) {
        if (p.role === 'student') day.students++;
        if (p.role === 'recruiter') day.recruiters++;
      }
    });

    (recentJobs || []).forEach((j: any) => {
      const dStr = new Date(j.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      const day = growthData.find(d => d.date === dStr);
      if (day) day.jobs++;
    });

    // 2. Top Skills
    const skillCounts: Record<string, number> = {};
    (allSkills || []).forEach((p: any) => {
      (p.skills || []).forEach((s: string) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    // 3. Top Companies
    const companyStats: Record<string, { jobs: number; applications: number }> = {};
    (companiesData || []).forEach((j: any) => {
      const name = j.company_name || 'Unknown';
      if (!companyStats[name]) companyStats[name] = { jobs: 0, applications: 0 };
      companyStats[name].jobs++;
      companyStats[name].applications += (j.applications || 0);
    });
    const topCompanies = Object.entries(companyStats)
      .sort((a, b) => b[1].jobs - a[1].jobs)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats }));

    // 4. Application Stats
    const applicationStats = Array(7).fill(0).map((_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: 0 };
    });
    (recentApps || []).forEach((a: any) => {
      const dStr = new Date(a.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      const day = applicationStats.find(d => d.date === dStr);
      if (day) day.count++;
    });

    res.json({
      growthData,
      topSkills,
      topCompanies,
      applicationStats,
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

    // Notify recruiter
    await supabaseAdmin.from('notifications').insert([{
      user_id: id,
      title: 'Profile Verification',
      body: `Your recruiter profile has been ${action === 'approve' ? 'verified' : 'rejected'}.${note ? ` Note: ${note}` : ''}`,
      type: 'system'
    }]);

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
        .select('title, company_name, skills, recruiter_id')
        .eq('id', id)
        .single();
        
      if (job) {
        // Find all students to notify them about the new job
        const { data: allStudents } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('role', 'student');

        if (allStudents && allStudents.length > 0) {
          const notifications = allStudents.map(student => ({
            user_id: student.id,
            title: 'New Job Posted!',
            body: `${job.company_name || 'A company'} just posted a new job: ${job.title}. Check it out!`,
            type: 'new_job',
            data: { job_id: id }
          }));
          // Insert notifications in batches if needed, but for now we do it in one go
          await supabaseAdmin.from('notifications').insert(notifications);
        }
      }

      // Notify recruiter of approval
      if (job?.recruiter_id) {
        await supabaseAdmin.from('notifications').insert([{
          user_id: job.recruiter_id,
          title: 'Job Approved',
          body: `Your job posting '${job.title}' has been approved and is now live.`,
          type: 'system',
          data: { job_id: id }
        }]);
      }
    } else {
      // If rejected/spam, notify recruiter
      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('title, recruiter_id')
        .eq('id', id)
        .single();

      if (job?.recruiter_id) {
        await supabaseAdmin.from('notifications').insert([{
          user_id: job.recruiter_id,
          title: 'Job Review Update',
          body: `Your job posting '${job.title}' has been ${statusMap[action]}.${reason ? ` Reason: ${reason}` : ''}`,
          type: 'system',
          data: { job_id: id }
        }]);
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

router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Also delete associated applications and saved jobs
    await supabaseAdmin.from('applied_jobs').delete().eq('job_id', id);
    await supabaseAdmin.from('saved_jobs').delete().eq('job_id', id);
    
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
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

// ==========================================
// CSV EXPORT ROUTES
// ==========================================

const escapeCSV = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

router.get('/export/users', async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let csvContent = 'ID,Email,Full Name,Role,Created At\n';
    
    profiles?.forEach(p => {
      csvContent += [
        escapeCSV(p.id),
        escapeCSV(p.email),
        escapeCSV(p.full_name),
        escapeCSV(p.role),
        escapeCSV(p.created_at)
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
    res.send(csvContent);
  } catch (error: any) {
    console.error('Export Users Error:', error);
    res.status(500).json({ error: 'Failed to export users data' });
  }
});

router.get('/export/jobs', async (req, res) => {
  try {
    // We join the jobs with their creator's profile if possible
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*, recruiter:recruiter_id(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let csvContent = 'ID,Title,Company,Type,Status,Recruiter,Created At\n';
    
    jobs?.forEach((j: any) => {
      const companyName = j.company?.name || 'Unknown';
      const recruiterName = j.recruiter?.full_name || 'Unknown';
      
      csvContent += [
        escapeCSV(j.id),
        escapeCSV(j.title),
        escapeCSV(companyName),
        escapeCSV(j.job_type),
        escapeCSV(j.status),
        escapeCSV(recruiterName),
        escapeCSV(j.created_at)
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs_export.csv"');
    res.send(csvContent);
  } catch (error: any) {
    console.error('Export Jobs Error:', error);
    res.status(500).json({ error: 'Failed to export jobs data' });
  }
});

export default router;
