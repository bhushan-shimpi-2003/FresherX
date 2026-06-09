import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Globe, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function HelpSupportScreen() {
  const theme = useTheme();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@fresherx.com?subject=App Support Request');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    title: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginBottom: 16 },
    paragraph: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text, lineHeight: 24, marginBottom: 24 },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingLabel: {
      flex: 1,
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Help & Support" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.paragraph}>
          If you are experiencing issues with the app, need help with your account, or want to report a bug, please reach out to our support team.
        </Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleEmailSupport}>
            <View style={styles.iconWrap}>
              <Mail size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingLabel}>Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
