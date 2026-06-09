import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../../../services/api/auth.api';
import { useAuthStore } from '../../../store/auth.store';
import { TriangleAlert } from 'lucide-react-native';

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const { logout } = useAuthStore();
  
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleDeleteAccount = async () => {
    setErrorText('');
    if (confirmationText !== 'DELETE') {
      setErrorText('Please type DELETE exactly to confirm.');
      return;
    }

    try {
      setIsDeleting(true);
      await authApi.deleteAccount();
      
      if (Platform.OS === 'web') {
        window.alert('Your account has been permanently deleted.');
      } else {
        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      }
      
      // Clear token and redirect to login
      logout();
      
    } catch (err: any) {
      setErrorText(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    alertBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.error + '15',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
      marginBottom: 24,
    },
    alertTextContainer: { flex: 1, marginLeft: 12 },
    alertTitle: { fontSize: 16, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.error, marginBottom: 4 },
    alertBody: { fontSize: 14, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text, lineHeight: 20 },
    instruction: { fontSize: 16, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text, marginBottom: 12 },
    error: { color: theme.colors.error, marginBottom: 16, fontFamily: theme.typography.fontFamily.medium },
    submitButton: { marginTop: 16, backgroundColor: theme.colors.error },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Delete Account" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.alertBox}>
          <TriangleAlert size={24} color={theme.colors.error} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>This action is permanent</Text>
            <Text style={styles.alertBody}>
              Deleting your account will permanently erase all your personal data, job applications, saved jobs, and profile information from our servers. This action cannot be undone.
            </Text>
          </View>
        </View>

        {!!errorText && <Text style={styles.error}>{errorText}</Text>}

        <Text style={styles.instruction}>
          To confirm deletion, please type the word <Text style={{ fontFamily: theme.typography.fontFamily.bold, color: theme.colors.error }}>DELETE</Text> below:
        </Text>

        <Input
          value={confirmationText}
          onChangeText={setConfirmationText}
          placeholder="Type DELETE to confirm"
          autoCapitalize="characters"
        />

        <Button 
          label="Permanently Delete Account"
          onPress={handleDeleteAccount}
          loading={isDeleting}
          style={styles.submitButton}
          disabled={confirmationText !== 'DELETE'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
