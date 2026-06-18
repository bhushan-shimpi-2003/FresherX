import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase';

export const runNotificationCleanup = async () => {
  try {
    console.log('Running daily notification cleanup...');
    const now = new Date();
    // End of day cleanup (could delete all, or older than 24h)
    // The request said "all notification will be automatic delete at the end of day"
    // To be safe and typical, we might just delete notifications older than 24h, 
    // but we will just delete ALL notifications to match "all notification will be automatic delete"
    
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .neq('id', '0'); // Hack to delete all since Supabase requires a filter for delete()

    if (error) {
      console.error('Error cleaning up notifications:', error);
    } else {
      console.log('Successfully deleted all notifications at the end of the day.');
    }
  } catch (err) {
    console.error('Cron Cleanup Error:', err);
  }
};

export const startCleanupCron = () => {
  console.log('Starting Daily Cleanup Cron Job...');
  // Run at 23:59 (11:59 PM) every day
  cron.schedule('59 23 * * *', runNotificationCleanup, {
    timezone: 'Asia/Kolkata',
  });
};
