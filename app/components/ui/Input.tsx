import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle, Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  onFocus,
  onBlur,
  value,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useSharedValue(0);
  const labelAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: borderAnim.value === 1
      ? theme.colors.primary
      : error
        ? theme.colors.error
        : theme.colors.border,
    shadowColor: error ? theme.colors.error : theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: borderAnim.value * 0.2,
    shadowRadius: borderAnim.value * 8,
    elevation: borderAnim.value * 4,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderAnim.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderAnim.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
          },
          borderStyle,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: theme.typography.fontSize.base,
              flex: 1,
              ...(Platform.OS === 'web' && {
                outlineStyle: 'none',
                transition: 'background-color 5000s ease-in-out 0s',
                backgroundColor: 'transparent',
              }),
            } as any,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value ?? ''}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>
      {error ? (
        <Text style={[styles.hint, { color: theme.colors.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  input: { paddingVertical: 14, height: '100%' },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  hint: { fontSize: 12, marginTop: 6, marginLeft: 4 },
});
