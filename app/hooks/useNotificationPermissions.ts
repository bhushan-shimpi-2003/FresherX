import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationPermissionService from '../services/NotificationPermissionService';

interface UseNotificationPermissionsOptions {
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

export function useNotificationPermissions(options?: UseNotificationPermissionsOptions) {
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // 1. Initialize configuration for notifications (channels, handlers)
    NotificationPermissionService.initializeNotifications();

    // 2. Check current status
    checkCurrentPermission();

    // 3. Setup listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      options?.onNotificationReceived?.(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      options?.onNotificationTapped?.(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const checkCurrentPermission = async () => {
    const status = await NotificationPermissionService.checkPermission();
    setPermissionStatus(status);
    
    // If already granted, automatically grab the token
    if (status === Notifications.PermissionStatus.GRANTED) {
      await fetchAndHandleToken();
    }
  };

  const fetchAndHandleToken = async () => {
    const token = await NotificationPermissionService.getPushToken();
    if (token) {
      setPushToken(token);
      options?.onTokenReceived?.(token);
    }
  };

  const requestPermission = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const status = await NotificationPermissionService.requestPermission();
      setPermissionStatus(status);
      
      if (status === Notifications.PermissionStatus.GRANTED) {
        await fetchAndHandleToken();
      }
      
      return status;
    } finally {
      setIsProcessing(false);
    }
  };

  const openSettings = async () => {
    await NotificationPermissionService.openSettings();
  };

  return {
    permissionStatus,
    pushToken,
    isProcessing,
    isGranted: permissionStatus === Notifications.PermissionStatus.GRANTED,
    isDenied: permissionStatus === Notifications.PermissionStatus.DENIED,
    requestPermission,
    checkCurrentPermission,
    openSettings,
  };
}
