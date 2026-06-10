import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { NotificationService } from '../services/notification.service';
import { getDateStringIST } from '../utils/timezone';

const router = Router();
router.use(requireAuth);

router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('recruiter_profiles')
      .select(`*`)
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
      .select(`*`)
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
    
    const { data: profile } = await supabaseAdmin
      .from('recruiter_profiles')
      .select('auto_verified')
      .eq('user_id', userId)
      .single();

    const isAutoVerified = profile?.auto_verified === true;
    const initialStatus = payload.status || (isAutoVerified ? 'published' : 'pending');

    console.log('[DEBUG JOB POST]', payload);

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        recruiter_id: userId,
        company_name: payload.companyName,
        title: payload.title,
        description: payload.description,
        requirements: payload.requirements,
        skills: payload.skills,
        job_type: payload.jobType || 'Full-time',
        experience_level: payload.experienceLevel || 'Fresher',
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        location: payload.location,
        is_remote: payload.isRemote ?? false,
        apply_link: payload.applyLink,
        deadline: payload.deadline,
        status: initialStatus,
      })
      .select()
      .single();

    if (error) throw error;

    if (initialStatus === 'published') {
      // Auto-verified: trigger notification to all students immediately
      const { data: allStudents } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (allStudents && allStudents.length > 0) {
        const notifications = allStudents.map(student => ({
          user_id: student.id,
          title: '🚀 New Job Posted!',
          body: `Exciting news! ${payload.companyName || 'A company'} just posted a new role: ${payload.title}. Apply now! ✨`,
          type: 'new_job',
          data: { job_id: data.id }
        }));
        await supabaseAdmin.from('notifications').insert(notifications);

        // Send actual FCM push notifications
        await NotificationService.sendToUsers(
          allStudents.map(student => student.id),
          {
            title: '🚀 New Job Posted!',
            body: `Exciting news! ${payload.companyName || 'A company'} just posted a new role: ${payload.title}. Apply now! ✨`,
            data: { job_id: data.id }
          }
        );
      }
    } else {
      // Pending: Send notification to all admins for verification
      const { data: admins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
        
      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'New Job Requires Verification',
          body: `${payload.companyName || 'A recruiter'} posted a new job: ${payload.title}. Please review it.`,
          type: 'job_verification',
          data: { job_id: data.id }
        }));
        await supabaseAdmin.from('notifications').insert(notifications);

        // Send actual FCM push notifications
        await NotificationService.sendToUsers(
          admins.map(admin => admin.id),
          {
            title: 'New Job Requires Verification',
            body: `${payload.companyName || 'A recruiter'} posted a new job: ${payload.title}. Please review it.`,
            data: { job_id: data.id }
          }
        );
      }
    }

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

router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cleanup related records first to avoid foreign key constraints
    await supabaseAdmin.from('job_matches').delete().eq('job_id', id);
    await supabaseAdmin.from('saved_jobs').delete().eq('job_id', id);
    await supabaseAdmin.from('applications').delete().eq('job_id', id);

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
      { data: jobsData },
      { count: thisWeekJobs },
    ] = await Promise.all([
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId).eq('status', 'published'),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId).eq('status', 'pending'),
      supabaseAdmin.from('jobs').select('views').eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('applications').eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('id').eq('recruiter_id', userId),
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const totalViews = (viewData ?? []).reduce((sum: number, j: any) => sum + (j.views ?? 0), 0);
    const totalApplications = (appData ?? []).reduce((sum: number, j: any) => sum + (j.applications ?? 0), 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const applicationsChart = Array(7).fill(0).map((_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      return {
        date: getDateStringIST(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        value: 0
      };
    });

    const jobIds = jobsData?.map((j: any) => j.id) || [];
    if (jobIds.length > 0) {
      const { data: recentApps } = await supabaseAdmin
        .from('applications')
        .select('created_at')
        .in('job_id', jobIds)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentApps) {
        recentApps.forEach((app: any) => {
          const dateStr = getDateStringIST(app.created_at);
          const dayStats = applicationsChart.find(d => d.date === dateStr);
          if (dayStats) dayStats.value += 1;
        });
      }
    }

    res.json({
      totalJobs: totalJobs ?? 0,
      publishedJobs: publishedJobs ?? 0,
      pendingJobs: pendingJobs ?? 0,
      totalViews,
      totalApplications,
      thisWeekJobs: thisWeekJobs ?? 0,
      applicationsChart,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
