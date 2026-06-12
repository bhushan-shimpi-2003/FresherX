import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { getMessaging, onTokenRefresh, onMessage, onNotificationOpenedApp, getInitialNotification, requestPermission, hasPermission, registerDeviceForRemoteMessages, getToken, AuthorizationStatus } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'expo-router';
import api from '../services/axios';

export function usePushNotifications() {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    if (status === 'authenticated' && user && !isRegistered.current) {
      registerForPushNotifications(true); // Automatically ask for permission on login
    }
  }, [status, user]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const messaging = getMessaging();

    // Listen for token refreshes
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (token) => {
      if (user) {
        await saveTokenToBackend(token);
      }
    });

    // Handle incoming messages in the foreground
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      await displayLocalNotification(remoteMessage);
    });

    // Handle user clicking on a notification when the app is in the background
    const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationInteraction(remoteMessage);
    });

    // Handle user clicking on a notification when the app was completely terminated
    getInitialNotification(messaging)
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

  const registerForPushNotifications = async (askPermission = false) => {
    if (Platform.OS === 'web') return;

    try {
      const messaging = getMessaging();

      // Check current permission first
      let authStatus = await hasPermission(messaging);
      console.log('Current push permission status before requesting:', authStatus);

      // If not determined, and we are not explicitly asking, skip
      if (authStatus === AuthorizationStatus.NOT_DETERMINED && !askPermission) {
        return;
      }

      // 1. Request Permission if needed
      if (
        (authStatus === AuthorizationStatus.NOT_DETERMINED || authStatus === AuthorizationStatus.DENIED) && 
        askPermission
      ) {
        console.log('Requesting permission from user...');
        
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const { PermissionsAndroid } = require('react-native');
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          console.log('PermissionsAndroid status:', granted);
        }

        authStatus = await requestPermission(messaging);
        console.log('Status after requesting:', authStatus);
      }

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('User declined push notification permissions or they are permanently denied.');
        return;
      }

      // 2. Register device for remote messages (Required for iOS)
      if (Platform.OS === 'ios') {
        await registerDeviceForRemoteMessages(messaging);
      }

      // 3. Get the FCM Token
      const token = await getToken(messaging);
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
    if (Platform.OS === 'web') return;

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

  return {
    requestPushPermission: () => registerForPushNotifications(true)
  };
}
