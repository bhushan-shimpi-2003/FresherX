import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, TouchableOpacityProps,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.lg,
      ...(fullWidth ? { width: '100%' } : {}),
    };

    const sizeStyles: Record<Size, ViewStyle> = {
      sm: { paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
      md: { paddingHorizontal: 24, paddingVertical: 18, gap: 8 },
      lg: { paddingHorizontal: 32, paddingVertical: 20, gap: 10 },
    };

    const variantStyles: Record<Variant, ViewStyle> = {
      primary: { backgroundColor: theme.colors.primary },
      secondary: { backgroundColor: theme.colors.secondary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
      },
      ghost: { backgroundColor: 'transparent' },
      danger: { backgroundColor: theme.colors.error },
    };

    return {
      ...base,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeMap: Record<Size, number> = { sm: 13, md: 15, lg: 17 };

    return {
      fontSize: sizeMap[size],
      fontFamily: theme.typography.fontFamily.semiBold,
      color: variant === 'outline' || variant === 'ghost'
        ? theme.colors.primary
        : '#FFFFFF',
      letterSpacing: 0.3,
    };
  };

  return (
    <AnimatedTouchable
      style={[animStyle, getContainerStyle(), style]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{label}</Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  );
}
