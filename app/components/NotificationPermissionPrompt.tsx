import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal } from 'react-native';
import { useNotificationPermissions } from '../hooks/useNotificationPermissions';
import * as Notifications from 'expo-notifications';
import api from '../services/axios';

/**
 * Example Integration of Notification Permissions
 * 
 * You can mount this component in your root layout or main authenticated screen.
 * It will automatically check for permissions and show the native prompt if appropriate.
 * If the user previously denied permissions, it shows a custom modal explaining why they should enable them,
 * mimicking Instagram/LinkedIn behavior.
 */
export function NotificationPermissionExample() {
  const { 
    permissionStatus, 
    pushToken, 
    requestPermission, 
    openSettings,
    isProcessing,
    isDenied
  } = useNotificationPermissions({
    onTokenReceived: async (token) => {
      // Backend token registration example
      try {
        console.log('Sending Expo Push Token to backend:', token);
        await api.post('/expo-push-token', {
          token,
          device_type: Platform.OS,
        });
      } catch (error) {
        console.error('Failed to register token with backend:', error);
      }
    },
    onNotificationReceived: (notification) => {
      console.log('Foreground notification received:', notification);
    },
    onNotificationTapped: (response) => {
      console.log('Notification tapped:', response);
      // Example: Navigate to specific screen based on payload
      // const data = response.notification.request.content.data;
      // if (data?.url) router.push(data.url);
    }
  });

  const [showExplanationModal, setShowExplanationModal] = useState(false);

  useEffect(() => {
    // Only automatically request if not yet determined.
    // In a real app, you might trigger this after a specific action (like finishing onboarding or logging in).
    if (permissionStatus === Notifications.PermissionStatus.UNDETERMINED) {
      requestPermission();
    } else if (permissionStatus === Notifications.PermissionStatus.DENIED) {
      // If they previously denied it, we might want to show them a custom soft prompt 
      // explaining the benefits, but not spam them every time.
      // E.g., check AsyncStorage if we've shown this explanation recently.
      setShowExplanationModal(true);
    }
  }, [permissionStatus]);

  if (!showExplanationModal || !isDenied) {
    return null; // Return nothing if we don't need to show the explanation
  }

  return (
    <Modal visible={showExplanationModal} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.description}>
            Enable notifications to never miss out on important updates, new messages, and opportunities.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              setShowExplanationModal(false);
              openSettings();
            }}
          >
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setShowExplanationModal(false)}
          >
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
