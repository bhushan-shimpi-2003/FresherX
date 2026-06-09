import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function AboutScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1 },
    logoPlaceholder: {
      width: 100,
      height: 100,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    logoText: {
      fontSize: 32,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    title: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginBottom: 8 },
    version: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textMuted, marginBottom: 24 },
    copyright: { fontSize: 14, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textMuted },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="About" showBack />
      <View style={styles.content}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.title}>FresherX</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
        
        <Text style={styles.copyright}>© 2026 FresherX. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
}
