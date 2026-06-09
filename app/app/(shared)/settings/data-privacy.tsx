import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function DataPrivacyScreen() {
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
      <ScreenHeader title="Data & Privacy" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Data Safety & Privacy</Text>
        
        <Text style={styles.heading}>Data Deletion</Text>
        <Text style={styles.paragraph}>
          As per Google Play Store policies, you have full control over your data. You can completely delete your account and all associated data by going to Settings &gt; Delete Account. This action is irreversible.
        </Text>

        <Text style={styles.heading}>What data do we collect?</Text>
        <Text style={styles.paragraph}>
          - Email address (for authentication){'\n'}
          - Name and Profile Information (to build your resume){'\n'}
          - Device Information (for analytics and crash reporting)
        </Text>

        <Text style={styles.heading}>Is data encrypted?</Text>
        <Text style={styles.paragraph}>
          Yes. All data is encrypted in transit using HTTPS, and sensitive data like passwords are cryptographically hashed in our database.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
