import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .select('job_id, created_at, jobs(*)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:jobId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .insert({ student_id: userId, job_id: jobId });

    // Handle unique constraint errors gracefully
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: true, message: 'Job already saved' });
      }
      throw error;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:jobId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('student_id', userId)
      .eq('job_id', jobId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
