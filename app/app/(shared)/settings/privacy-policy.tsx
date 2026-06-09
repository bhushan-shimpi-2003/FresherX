import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    title: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginBottom: 16 },
    paragraph: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text, lineHeight: 24, marginBottom: 16 },
    heading: { fontSize: 18, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Privacy Policy" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.paragraph}>Last updated: June 10, 2026</Text>
        
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us when you create an account, update your profile, apply for jobs, or communicate with us. This includes your name, email, resume data, and job preferences.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to provide, maintain, and improve our services, to match you with relevant job opportunities, and to communicate with you about your account and applications.
        </Text>

        <Text style={styles.heading}>3. Sharing of Information</Text>
        <Text style={styles.paragraph}>
          If you are a student, your profile and resume data is shared with recruiters when you apply for a job or when your profile is matched to their open positions. We do not sell your personal data to third parties.
        </Text>

        <Text style={styles.heading}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access, disclosure, or accidental loss.
        </Text>

        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, update, or delete your personal information at any time through the app settings. You can also request a copy of your data or withdraw your consent for data processing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
