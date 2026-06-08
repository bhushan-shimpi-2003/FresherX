import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trash2, Edit, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { Chip } from '../../../components/ui/Chip';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { formatRelativeTime } from '../../../utils/formatters';
import { Briefcase, Eye, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Job } from '../../../types/job.types';

type Filter = 'all' | 'published' | 'pending' | 'rejected' | 'draft';
const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Draft', value: 'draft' },
];

const statusConfig: Record<string, { variant: any; dotColor?: string }> = {
  published: { variant: 'success', dotColor: '#4CAF50' },
  pending: { variant: 'warning', dotColor: '#FF9800' },
  rejected: { variant: 'error', dotColor: '#F44336' },
  draft: { variant: 'default', dotColor: '#9E9E9E' },
  archived: { variant: 'default', dotColor: '#9E9E9E' },
};

export default function RecruiterPostsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { jobs, draftJobs, isLoading, fetchJobs, deleteJob } = useRecruiterStore();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  useEffect(() => {
    if (user) fetchJobs(user.id);
  }, [user]);

  const allPosts: Job[] = [...jobs, ...draftJobs];
  const filtered = activeFilter === 'all'
    ? allPosts
    : allPosts.filter((j) => j.status === activeFilter);

  const handleDelete = (jobId: string, title: string) => {
    Alert.alert('Delete Post', `Delete "${title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJob(jobId) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="My Posts"
        subtitle={`${filtered.length} posts`}
      />

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((item) => {
            const isActive = activeFilter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setActiveFilter(item.value)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  { backgroundColor: isActive ? theme.colors.primary : theme.colors.card },
                  isActive && styles.filterChipActive
                ]}
              >
                {isActive && (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                  />
                )}
                <Text style={[
                  styles.filterText,
                  { color: isActive ? '#FFF' : theme.colors.textMuted, fontFamily: isActive ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            const conf = statusConfig[item.status] ?? { variant: 'default' };
            return (
              <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <TouchableOpacity
                  onPress={() => router.push(`/(recruiter)/post/${item.id}`)}
                  style={styles.cardMain}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Eye size={14} color={theme.colors.textMuted} />
                        <Text style={[styles.metricText, { color: theme.colors.textMuted }]}>{item.views ?? 0}</Text>
                      </View>
                      <View style={[styles.metaDot, { backgroundColor: theme.colors.border }]} />
                      <View style={styles.metricItem}>
                        <Users size={14} color={theme.colors.textMuted} />
                        <Text style={[styles.metricText, { color: theme.colors.textMuted }]}>{item.applications ?? 0}</Text>
                      </View>
                      <View style={[styles.metaDot, { backgroundColor: theme.colors.border }]} />
                      <Text style={[styles.metricText, { color: theme.colors.textMuted }]}>{formatRelativeTime(item.createdAt)}</Text>
                    </View>

                    <View style={styles.cardBadgeRow}>
                      <View style={[styles.statusBadge, { backgroundColor: conf.dotColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: conf.dotColor }]} />
                        <Text style={[styles.statusText, { color: conf.dotColor, fontFamily: theme.typography.fontFamily.medium }]}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                      </View>
                      <View style={[styles.typeBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.typeText, { color: theme.colors.textSecondary }]}>{item.jobType}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.iconButton, { backgroundColor: theme.colors.background }]}>
                    <ArrowUpRight size={18} color={theme.colors.text} />
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={[styles.cardActions, { borderTopColor: theme.colors.border }]}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Edit size={15} color={theme.colors.primary} />
                    <Text style={[styles.actionText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.title)}>
                    <Trash2 size={15} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.medium }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={<Briefcase size={48} color={theme.colors.textMuted} />}
              title="No posts found"
              description={activeFilter === 'all' ? 'Create your first job post!' : `No ${activeFilter} posts`}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filterContainer: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'transparent',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center'
  },
  filterChipActive: { borderColor: 'transparent' },
  filterText: { fontSize: 13 },
  card: { borderRadius: 24, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 20 },
  cardInfo: { flex: 1, gap: 12 },
  cardTitle: { fontSize: 18, letterSpacing: -0.3, lineHeight: 24 },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  metaDot: { width: 4, height: 4, borderRadius: 2 },
  cardBadgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  typeText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  actionText: { fontSize: 14 },
});
