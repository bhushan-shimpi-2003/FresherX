import { Router } from 'express';
import { runJobAlerts } from '../cron/jobAlerts';

const router = Router();

// Endpoint for Vercel Cron
router.get('/job-alerts', async (req, res) => {
  try {
    // Optional: Add authorization here to verify the request comes from Vercel
    // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Run the cron job logic manually
    await runJobAlerts();
    
    return res.status(200).json({ success: true, message: 'Job alerts executed successfully' });
  } catch (error) {
    console.error('Manual cron trigger failed:', error);
    return res.status(500).json({ error: 'Failed to execute job alerts' });
  }
});

export default router;
