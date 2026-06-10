import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Secure routes
router.use(requireAuth);

/**
 * Register a device FCM token
 */
router.post('/token', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, device_type } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Upsert the token
    const { error } = await supabaseAdmin
      .from('user_fcm_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_type: device_type || 'unknown',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );

    if (error) {
      console.error('Error saving FCM token:', error);
      return res.status(500).json({ error: 'Failed to save token', details: error });
    }

    return res.json({ success: true, message: 'Token registered successfully' });
  } catch (error: any) {
    console.error('FCM register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Remove a device FCM token (e.g. on logout)
 */
router.delete('/token', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const { error } = await supabaseAdmin
      .from('user_fcm_tokens')
      .delete()
      .eq('token', token)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting FCM token:', error);
      return res.status(500).json({ error: 'Failed to delete token' });
    }

    return res.json({ success: true, message: 'Token unregistered successfully' });
  } catch (error: any) {
    console.error('FCM unregister error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Send a test push notification to the logged-in user
 */
import { NotificationService } from '../services/notification.service';

router.post('/test', async (req, res) => {
  try {
    const userId = req.user.id;
    
    await NotificationService.sendToUser(userId, {
      title: 'It Works! 🎉',
      body: 'Your FCM push notifications are successfully set up!',
      data: { test: 'true' }
    });

    return res.json({ success: true, message: 'Test notification sent! Check your device.' });
  } catch (error: any) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router;
