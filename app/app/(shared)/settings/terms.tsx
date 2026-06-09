import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function TermsScreen() {
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
      <ScreenHeader title="Terms & Conditions" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.paragraph}>Last updated: June 10, 2026</Text>
        
        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using FresherX, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
        </Text>

        <Text style={styles.heading}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for safeguarding the password that you use to access the app and for any activities or actions under your password.
        </Text>

        <Text style={styles.heading}>3. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to use the app to post any misleading, fraudulent, or inappropriate job listings or resumes. We reserve the right to terminate accounts that violate these terms.
        </Text>

        <Text style={styles.heading}>4. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
