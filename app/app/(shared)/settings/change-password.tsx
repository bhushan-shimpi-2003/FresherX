import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../../../services/api/auth.api';

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (Platform.OS === 'web') {
        window.alert('Password successfully updated!');
      } else {
        Alert.alert('Success', 'Password successfully updated!');
      }
      router.back();
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    title: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textMuted, marginBottom: 24 },
    error: { color: theme.colors.error, marginBottom: 16, fontFamily: theme.typography.fontFamily.medium },
    submitButton: { marginTop: 16 },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Change Password" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Secure your account</Text>
        <Text style={styles.subtitle}>Please enter your current password and choose a new one.</Text>
        
        {!!passwordError && <Text style={styles.error}>{passwordError}</Text>}

        <Input
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
        />
        
        <Input
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password (min 6 chars)"
          secureTextEntry
        />
        
        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          secureTextEntry
        />

        <Button 
          label="Update Password"
          onPress={handleChangePassword}
          loading={isChangingPassword}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
