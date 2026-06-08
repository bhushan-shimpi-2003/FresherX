import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Eye, Users, TrendingUp, Plus, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { formatCount, formatRelativeTime } from '../../../utils/formatters';
import { palette } from '../../../constants/colors';

const statusConfig: Record<string, { label: string; variant: any; dotColor?: string }> = {
  published: { label: 'Live', variant: 'success', dotColor: '#4CAF50' },
  pending: { label: 'Pending', variant: 'warning', dotColor: '#FF9800' },
  rejected: { label: 'Rejected', variant: 'error', dotColor: '#F44336' },
  archived: { label: 'Archived', variant: 'default', dotColor: '#9E9E9E' },
  draft: { label: 'Draft', variant: 'default', dotColor: '#9E9E9E' },
};

export default function RecruiterDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, company, jobs, stats, isLoading, fetchProfile, fetchJobs, fetchStats } = useRecruiterStore();

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchJobs(user.id);
      fetchStats(user.id);
    }
  }, [user]);

  if (isLoading && !profile) return <Loader fullScreen />;

  const statCards = [
    { label: 'Total Posts', value: stats?.totalJobs ?? 0, Icon: Briefcase, color: theme.colors.primary },
    { label: 'Total Views', value: stats?.totalViews ?? 0, Icon: Eye, color: theme.colors.info },
    { label: 'Applications', value: stats?.totalApplications ?? 0, Icon: Users, color: theme.colors.accent },
    { label: 'This Week', value: stats?.thisWeekJobs ?? 0, Icon: TrendingUp, color: theme.colors.secondary },
  ];

  const recentJobs = jobs.slice(0, 5);

  const statusMap: Record<string, { label: string; variant: any }> = {
    published: { label: 'Live', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'error' },
    archived: { label: 'Archived', variant: 'default' },
    draft: { label: 'Draft', variant: 'default' },
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic Ambient Glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.primary + '15', 'transparent']}
          style={{ height: 400, opacity: 0.8 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header section */}
        <ScreenHeader
          title={company?.name ?? profile?.fullName ?? 'Recruiter'}
          subtitle="Welcome back 👋"
          rightAction={
            <TouchableOpacity
              onPress={() => router.push('/(recruiter)/create')}
              style={[styles.postBtn, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFF" />
              <Text style={styles.postBtnText}>Post Job</Text>
            </TouchableOpacity>
          }
        />
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerContainer}>


          {/* Verification status */}
          {profile?.status !== 'verified' && (
            <View style={[styles.verificationBanner, { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning + '30' }]}>
              <AlertCircle size={16} color={theme.colors.warning} />
              <Text style={[styles.verificationText, { color: theme.colors.warning }]}>
                {profile?.status === 'pending'
                  ? 'Your account is pending verification by admin'
                  : 'Your account was rejected — contact support'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsGrid}>
          {statCards.map(({ label, value, Icon, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                {formatCount(value)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
                {label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Recent posts */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Recent Posts
            </Text>
            <TouchableOpacity onPress={() => router.push('/(recruiter)/posts')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {recentJobs.length === 0 ? (
            <View style={[styles.emptyPosts, { backgroundColor: theme.colors.card + '80', borderColor: theme.colors.border }]}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.primary + '10' }]}>
                <Briefcase size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                No job posts yet. Create your first one!
              </Text>
              <TouchableOpacity onPress={() => router.push('/(recruiter)/create')}>
                <Text style={[styles.emptyAction, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
                  Post a Job
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentJobs.map((job) => {
              const statusInfo = statusConfig[job.status] ?? { label: job.status, variant: 'default' };
              return (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.jobRow, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}
                  onPress={() => router.push(`/(recruiter)/post/${job.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <View style={styles.jobMetaRow}>
                      <Text style={[styles.jobMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                        {formatRelativeTime(job.createdAt)}
                      </Text>
                      <View style={[styles.metaDot, { backgroundColor: theme.colors.textMuted }]} />
                      <Text style={[styles.jobMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                        {job.views ?? 0} views
                      </Text>
                    </View>
                  </View>
                  <View style={styles.jobRight}>
                    <View style={[styles.statusIndicator, { backgroundColor: statusInfo.dotColor + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusInfo.dotColor }]} />
                      <Text style={[styles.statusText, { color: statusInfo.dotColor, fontFamily: theme.typography.fontFamily.medium }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                    <ArrowUpRight size={16} color={theme.colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 16, gap: 16 },
  postBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  postBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  verificationBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  verificationText: { fontSize: 13, flex: 1, lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%', padding: 18, borderRadius: 20,
    borderWidth: 1, gap: 12,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, letterSpacing: -0.5 },
  statLabel: { fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  seeAll: { fontSize: 14 },
  emptyPosts: {
    alignItems: 'center', gap: 12, padding: 40,
    marginHorizontal: 16, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed',
  },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  emptyAction: { fontSize: 14, marginTop: 4 },
  jobRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 20, borderWidth: 1,
  },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, marginBottom: 6 },
  jobMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobMeta: { fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  jobRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12 },
});
