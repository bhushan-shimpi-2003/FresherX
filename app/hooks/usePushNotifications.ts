import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'expo-router';
import api from '../services/axios';

export function usePushNotifications() {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && user && !isRegistered.current) {
      registerForPushNotifications();
    }
  }, [status, user]);

  useEffect(() => {
    // Listen for token refreshes
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      if (user) {
        await saveTokenToBackend(token);
      }
    });

    // Handle incoming messages in the foreground
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      await displayLocalNotification(remoteMessage);
    });

    // Handle user clicking on a notification when the app is in the background
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationInteraction(remoteMessage);
    });

    // Handle user clicking on a notification when the app was completely terminated
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          handleNotificationInteraction(remoteMessage);
        }
      });

    // Listen to notifee foreground events (e.g. user pressing the local notification)
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        if (detail.notification?.data) {
          // You can map Notifee's data payload format to match FCM
          handleNotificationInteraction({ data: detail.notification.data as any });
        }
      }
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeNotifee();
    };
  }, [user]);

  const registerForPushNotifications = async () => {
    try {
      // 1. Request Permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('User declined push notification permissions');
        return;
      }

      // 2. Register device for remote messages (Required for iOS)
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      // 3. Get the FCM Token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // 4. Save to backend
      await saveTokenToBackend(token);
      isRegistered.current = true;
    } catch (error) {
      console.error('Failed to get push token for push notification!', error);
    }
  };

  const saveTokenToBackend = async (token: string) => {
    try {
      await api.post('/fcm/token', {
        token,
        device_type: Platform.OS,
      });
      console.log('Token successfully registered to backend');
    } catch (error) {
      console.error('Error saving token to backend', error);
    }
  };

  const displayLocalNotification = async (remoteMessage: any) => {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // make sure you have this icon or change it
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  const handleNotificationInteraction = (remoteMessage: any) => {
    // Example: Navigate to a specific screen based on data payload
    const { data } = remoteMessage;
    if (data?.job_id) {
      router.push(`/(student)/job/${data.job_id}`);
    }
  };
}
