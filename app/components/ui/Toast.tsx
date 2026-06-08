import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react-native';
import { useTheme } from '../../theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const config = {
    success: { icon: CheckCircle2, color: theme.colors.success, bg: theme.colors.successBg },
    error: { icon: XCircle, color: theme.colors.error, bg: theme.colors.errorBg },
    warning: { icon: AlertCircle, color: theme.colors.warning, bg: theme.colors.warningBg },
    info: { icon: Info, color: theme.colors.info, bg: theme.colors.card },
  };

  const { icon: Icon, color, bg } = config[type];

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp}
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: color + '40' },
      ]}
    >
      <Icon size={20} color={color} />
      <Text style={[styles.message, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Safe area top + padding
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
