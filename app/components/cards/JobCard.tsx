import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeInDown,
} from 'react-native-reanimated';
import { Bookmark, MapPin, Clock, Briefcase, Star } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { Job } from '../../types/job.types';
import { formatSalary, formatDeadline, formatRelativeTime, getMatchColor } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onSave?: () => void;
  index?: number;
}

export function JobCard({ job, onPress, onSave, index = 0 }: JobCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const saveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.98); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  const handleSave = () => {
    saveScale.value = withSpring(1.3, {}, () => { saveScale.value = withSpring(1); });
    onSave?.();
  };

  const matchColor = job.matchScore ? getMatchColor(job.matchScore) : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={[
        cardStyle,
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.xl,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            {job.company?.logo ? (
              <Image source={{ uri: job.company.logo }} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={[styles.logoFallback, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                {job.company?.name?.[0] ?? '?'}
              </Text>
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={[styles.companyName, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}
              numberOfLines={1}
            >
              {job.company?.name ?? 'Unknown Company'}
            </Text>
            <Text
              style={[styles.postedAt, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}
            >
              {formatRelativeTime(job.createdAt)}
            </Text>
          </View>

          {/* Match score */}
          {job.matchScore && (
            <View style={[styles.matchBadge, { backgroundColor: matchColor + '18', borderColor: matchColor + '30' }]}>
              <Star size={11} color={matchColor!} fill={matchColor!} />
              <Text style={[styles.matchText, { color: matchColor!, fontFamily: theme.typography.fontFamily.bold }]}>
                {job.matchScore}%
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}
          numberOfLines={2}
        >
          {job.title}
        </Text>

        {/* Meta row */}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MapPin size={13} color={theme.colors.textMuted} />
            <Text style={[styles.metaText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]} numberOfLines={1}>
              {job.isRemote ? 'Remote' : job.location}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Briefcase size={13} color={theme.colors.textMuted} />
            <Text style={[styles.metaText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              {job.jobType}
            </Text>
          </View>
          {job.deadline && (
            <View style={styles.metaItem}>
              <Clock size={13} color={theme.colors.warning} />
              <Text style={[styles.metaText, { color: theme.colors.warning, fontFamily: theme.typography.fontFamily.medium }]}>
                {formatDeadline(job.deadline)}
              </Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {job.skills.length > 0 && (
          <View style={styles.skills}>
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} label={skill} variant="primary" size="sm" />
            ))}
            {job.skills.length > 3 && (
              <Badge label={`+${job.skills.length - 3}`} variant="default" size="sm" />
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.salary, { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.semiBold }]}>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Text>
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Animated.View style={saveStyle}>
              <Bookmark
                size={20}
                color={job.isSaved ? theme.colors.primary : theme.colors.textMuted}
                fill={job.isSaved ? theme.colors.primary : 'transparent'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  logo: { width: 40, height: 40 },
  logoFallback: { fontSize: 20 },
  headerInfo: { flex: 1 },
  companyName: { fontSize: 13, marginBottom: 2 },
  postedAt: { fontSize: 11 },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  matchText: { fontSize: 12 },
  title: { fontSize: 16, lineHeight: 22, marginBottom: 10 },
  meta: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  skills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  salary: { fontSize: 15 },
});
