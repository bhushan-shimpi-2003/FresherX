import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export function ScreenHeader({ title, subtitle, rightAction, showBack }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.leftContent}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && <View style={styles.rightContent}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  backBtn: {
    marginRight: 12,
    justifyContent: 'center',
  },
  rightContent: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
