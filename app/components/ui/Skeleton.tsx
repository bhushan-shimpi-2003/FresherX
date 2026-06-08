import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [theme.colors.card, theme.colors.muted],
      ),
    };
  });

  return (
    <Animated.View
      style={[
        animStyle,
        { width, height, borderRadius },
        style,
      ]}
    />
  );
}

/** Pre-built Job Card skeleton */
export function JobCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="80%" height={18} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={80} height={28} borderRadius={20} />
        <Skeleton width={80} height={28} borderRadius={20} />
        <Skeleton width={60} height={28} borderRadius={20} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
});
