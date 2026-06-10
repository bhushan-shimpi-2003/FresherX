import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

/**
 * Requests permission for push notifications (iOS requires explicit permission).
 */
export async function requestUserPermission() {
  if (Platform.OS === 'web') return false;
  
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  return enabled;
}

/**
 * Gets the FCM token for the device.
 * This token should be sent to the backend (Supabase) and saved to the user's profile.
 */
export async function getFCMToken() {
  if (Platform.OS === 'web') return null;

  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Sets up listeners for foreground and background push notifications.
 */
export function setupPushNotifications() {
  if (Platform.OS === 'web') return () => {};

  // Handle messages when app is in foreground
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    // In a real app, you might want to show a custom toast or update a notification store
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || ''
    );
  });

  // Handle background/quit state messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // Background tasks like updating local database or badge count
  });

  // Handle notification opened from background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
    // Navigate to specific screen based on remoteMessage.data
  });

  // Handle notification opened from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        // Navigate to specific screen based on remoteMessage.data
      }
    });

  return unsubscribe;
}
