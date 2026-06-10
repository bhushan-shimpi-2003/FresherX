import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase';
import { NotificationService } from '../services/notification.service';

export const runJobAlerts = async () => {
  try {
    // Find jobs expiring within the next 2 hours
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const { data: expiringJobs, error } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name, skills, deadline')
      .eq('status', 'published')
      .eq('expiration_alert_sent', false)
      .gte('deadline', now.toISOString())
      .lte('deadline', twoHoursFromNow.toISOString());

    if (error) {
      console.error('Error fetching expiring jobs:', error);
      return;
    }

    if (!expiringJobs || expiringJobs.length === 0) {
      return;
    }

    for (const job of expiringJobs) {
      // Find matching students for this job
      if (job.skills && job.skills.length > 0) {
        const { data: matchingStudents } = await supabaseAdmin
          .from('student_profiles')
          .select('user_id')
          .overlaps('skills', job.skills);

        if (matchingStudents && matchingStudents.length > 0) {
          const notifications = matchingStudents.map(student => ({
            user_id: student.user_id,
            title: 'Urgent: Job Expiring Soon!',
            body: `Only 2 hours remaining! Apply fast for ${job.title} at ${job.company_name || 'a company'}.`,
            type: 'job_alert',
            data: { job_id: job.id }
          }));
          
          await supabaseAdmin.from('notifications').insert(notifications);

          // Send actual FCM push notifications
          await NotificationService.sendToUsers(
            matchingStudents.map(student => student.user_id),
            {
              title: 'Urgent: Job Expiring Soon!',
              body: `Only 2 hours remaining! Apply fast for ${job.title} at ${job.company_name || 'a company'}.`,
              data: { job_id: job.id }
            }
          );
        }
      }
      
      // Mark as sent so we don't spam
      await supabaseAdmin
        .from('jobs')
        .update({ expiration_alert_sent: true })
        .eq('id', job.id);
        
      console.log(`Expiration alert sent for job ${job.id}`);
    }
  } catch (err) {
    console.error('Cron Job Error:', err);
    throw err;
  }
};

export const startJobAlertsCron = () => {
  console.log('Starting Job Expiration Alerts Cron Job...');
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', runJobAlerts, {
    timezone: 'Asia/Kolkata',
  });
};
