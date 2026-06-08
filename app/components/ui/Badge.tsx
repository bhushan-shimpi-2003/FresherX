import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({ label, variant = 'default', size = 'md', style, dot = false }: BadgeProps) {
  const theme = useTheme();

  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: theme.colors.card, text: theme.colors.textSecondary },
    primary: { bg: theme.colors.primary + '20', text: theme.colors.primary },
    success: { bg: theme.colors.successBg, text: theme.colors.success },
    warning: { bg: theme.colors.warningBg, text: theme.colors.warning },
    error: { bg: theme.colors.errorBg, text: theme.colors.error },
    info: { bg: theme.colors.infoBg, text: theme.colors.info },
  };

  const { bg, text } = colorMap[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: theme.borderRadius.full,
          paddingHorizontal: size === 'sm' ? 8 : 12,
          paddingVertical: size === 'sm' ? 3 : 5,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
        },
        style,
      ]}
    >
      {dot && (
        <View style={[styles.dot, { backgroundColor: text }]} />
      )}
      <Text
        style={[
          styles.label,
          {
            color: text,
            fontSize: size === 'sm' ? 11 : 12,
            fontFamily: theme.typography.fontFamily.semiBold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {},
  label: { letterSpacing: 0.3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
