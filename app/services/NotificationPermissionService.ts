import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';

class NotificationPermissionService {
  /**
   * Initializes the notification handler and Android channels.
   * This should be called early in the app lifecycle (e.g., in a root layout or _app.tsx).
   */
  initializeNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Checks the current notification permission status without prompting the user.
   */
  async checkPermission(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  /**
   * Requests notification permissions from the user.
   * Triggers the native prompt if not already granted or permanently denied.
   */
  async requestPermission(): Promise<Notifications.PermissionStatus> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      // For development in simulators, we might return UNDETERMINED to avoid crashes,
      // but you won't get a real token.
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus;
  }

  /**
   * Gets the Expo Push Token for the device.
   */
  async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
         console.warn('Cannot get push token on simulator/emulator.');
         return null;
      }
      
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data;
    } catch (error) {
      console.error('Error fetching push token:', error);
      return null;
    }
  }

  /**
   * Opens the device settings page for the app to let the user manually enable permissions.
   */
  async openSettings() {
    Linking.openSettings();
  }
}

export default new NotificationPermissionService();
