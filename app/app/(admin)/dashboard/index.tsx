import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users, Briefcase, Shield, AlertTriangle, ChevronRight,
  Activity, CheckCircle, BarChart2, Star
} from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { Loader } from '../../../components/ui/Loader';
import { formatCount, formatRelativeTime } from '../../../utils/formatters';
import { palette } from '../../../constants/colors';
import { useAuthStore } from '../../../store/auth.store';

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, activities, isLoading, fetchDashboardStats, fetchActivities } = useAdminStore();

  useEffect(() => { 
    fetchDashboardStats();
    fetchActivities();
  }, []);

  if (isLoading && !stats) return <Loader fullScreen />;

  const quickActions = [
    { label: 'Manage Users', value: stats?.totalStudents ?? 0, route: '/(admin)/users', Icon: Users, color: theme.colors.textSecondary, urgent: false },
    { label: 'Verify Recruiters', value: stats?.pendingRecruiters ?? 0, route: '/(admin)/verify', Icon: Shield, color: theme.colors.primary, urgent: (stats?.pendingRecruiters ?? 0) > 0 },
    { label: 'Review Jobs', value: stats?.pendingJobs ?? 0, route: '/(admin)/jobs', Icon: Briefcase, color: theme.colors.warning, urgent: (stats?.pendingJobs ?? 0) > 0 },
  ];

  const platformStats = [
    { label: 'Students', value: stats?.totalStudents ?? 0, Icon: Users, color: theme.colors.primary, trend: '+12% this week' },
    { label: 'Recruiters', value: stats?.totalRecruiters ?? 0, Icon: Shield, color: theme.colors.secondary, trend: '+5% this week' },
    { label: 'Total Jobs', value: stats?.totalJobs ?? 0, Icon: Briefcase, color: theme.colors.accent, trend: '+24% this month' },
  ];

  const getIconForActivity = (type: string) => {
    switch (type) {
      case 'user': return { icon: Users, color: theme.colors.secondary };
      case 'job': return { icon: Briefcase, color: theme.colors.primary };
      case 'report': return { icon: AlertTriangle, color: theme.colors.error };
      default: return { icon: Activity, color: theme.colors.textSecondary };
    }
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
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Admin Control Center ⚡</Text>
              <Text style={[styles.companyName, { color: theme.colors.text }]}>
                {user?.fullName ?? 'Administrator'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(admin)/analytics')} style={[styles.analyticsBtn, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
              <BarChart2 size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Platform stats */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsGrid}>
          {platformStats.map(({ label, value, Icon, color, trend }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                  <Icon size={18} color={color} />
                </View>
                <Text style={[styles.trendText, { color }]}>{trend}</Text>
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

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Action Required
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {quickActions.map(({ label, value, route, Icon, color, urgent }) => (
              <TouchableOpacity
                key={label}
                onPress={() => router.push(route as any)}
                style={[
                  styles.actionCard,
                  {
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    backgroundColor: urgent ? color + '10' : theme.colors.card + '90',
                    borderColor: urgent ? color + '30' : theme.colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                {urgent && (
                  <View style={[styles.urgentDot, { backgroundColor: color, position: 'absolute', top: 12, right: 12 }]} />
                )}
                <View style={[styles.actionIcon, { backgroundColor: color + '20', marginBottom: 6 }]}>
                  <Icon size={20} color={color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold, textAlign: 'center', fontSize: 13 }]} numberOfLines={2}>
                  {label}
                </Text>
                <Text style={[styles.actionValue, { color: urgent ? color : theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, marginTop: 2, fontSize: 11, textAlign: 'center' }]}>
                  {value} {urgent ? 'pending' : 'total'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity Mock */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Recent Activity
            </Text>
            <Activity size={18} color={theme.colors.primary} />
          </View>
          <View style={[styles.activityCard, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
            {activities?.slice(0, 5).map((act, index) => {
              const { icon: ActIcon, color } = getIconForActivity(act.type);
              return (
                <View key={act.id} style={[styles.activityRow, index < Math.min(activities.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                  <View style={[styles.activityIconWrap, { backgroundColor: color + '15' }]}>
                    <ActIcon size={16} color={color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                      {act.title}
                    </Text>
                    <Text style={[styles.activityTime, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                      {formatRelativeTime(act.time)}
                    </Text>
                  </View>
                </View>
              );
            })}
            {activities?.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textMuted }}>No recent activities</Text>
              </View>
            )}
          </View>
        </Animated.View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  welcomeText: { color: '#888', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  companyName: { fontSize: 24, letterSpacing: -0.5 },
  analyticsBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 20, borderWidth: 1, gap: 10 },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trendText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statValue: { fontSize: 26, letterSpacing: -0.5 },
  statLabel: { fontSize: 13 },
  section: { paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 15 },
  actionValue: { fontSize: 13, marginTop: 2 },
  urgentDot: { width: 8, height: 8, borderRadius: 4 },
  activityCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  activityIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14 },
  activityTime: { fontSize: 12, marginTop: 2 },
});
