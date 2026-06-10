import { firebaseAdmin, isFirebaseInitialized } from '../config/firebase';
import { supabaseAdmin } from '../config/supabase';
import { getMessaging } from 'firebase-admin/messaging';

export interface SendPushPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export const NotificationService = {
  /**
   * Sends a push notification to all devices registered to a specific user.
   */
  async sendToUser(userId: string, payload: SendPushPayload) {
    if (!isFirebaseInitialized) {
      console.warn('Firebase Admin not initialized. Skipping push notification.');
      return;
    }

    try {
      // Get all device tokens for this user
      const { data: tokens, error } = await supabaseAdmin
        .from('user_fcm_tokens')
        .select('token')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching FCM tokens for user:', error);
        return;
      }

      if (!tokens || tokens.length === 0) {
        console.log(`No registered devices for user ${userId}`);
        return;
      }

      const deviceTokens = tokens.map((t) => t.token);

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        tokens: deviceTokens,
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      };

      const response = await getMessaging().sendEachForMulticast(message);
      
      // Handle invalid/unregistered tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              failedTokens.push(deviceTokens[idx]);
            }
          }
        });

        // Clean up invalid tokens from the database
        if (failedTokens.length > 0) {
          await supabaseAdmin
            .from('user_fcm_tokens')
            .delete()
            .in('token', failedTokens);
          console.log(`Cleaned up ${failedTokens.length} invalid tokens.`);
        }
      }

      console.log(`Push notification sent to ${response.successCount} devices for user ${userId}`);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  },

  /**
   * Sends a push notification to a specific topic.
   */
  async sendToTopic(topic: string, payload: SendPushPayload) {
    if (!isFirebaseInitialized) {
      console.warn('Firebase Admin not initialized. Skipping push notification.');
      return;
    }

    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        topic,
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      };

      await getMessaging().send(message);
      console.log(`Push notification sent to topic ${topic}`);
    } catch (error) {
      console.error(`Failed to send push notification to topic ${topic}:`, error);
    }
  },
};
