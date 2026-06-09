import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart2, Eye, Users, TrendingUp } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { formatCount } from '../../../utils/formatters';

export default function RecruiterAnalyticsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { stats, jobs, fetchStats, fetchJobs } = useRecruiterStore();

  useEffect(() => {
    if (user) { fetchStats(user.id); fetchJobs(user.id); }
  }, [user]);

  const topJobs = [...jobs]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Analytics" subtitle="Track your performance" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Summary cards */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.grid}>
          {[
            { label: 'Total Views', value: stats?.totalViews ?? 0, Icon: Eye, color: theme.colors.info },
            { label: 'Applications', value: stats?.totalApplications ?? 0, Icon: Users, color: theme.colors.accent },
            { label: 'Live Jobs', value: stats?.publishedJobs ?? 0, Icon: TrendingUp, color: theme.colors.success },
            { label: 'Pending', value: stats?.pendingJobs ?? 0, Icon: BarChart2, color: theme.colors.warning },
          ].map(({ label, value, Icon, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                <Icon size={20} color={color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                {formatCount(value)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                {label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Views Chart */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Total Applications (Last 7 Days)
          </Text>
          <View style={{ marginLeft: -10 }}>
            <LineChart
              data={stats?.applicationsChart?.length ? stats.applicationsChart : [
                { value: 0, label: 'M' }, { value: 0, label: 'T' }, { value: 0, label: 'W' },
                { value: 0, label: 'T' }, { value: 0, label: 'F' }, { value: 0, label: 'S' }, { value: 0, label: 'S' }
              ]}
              width={Dimensions.get('window').width - 80}
              height={140}
              color={theme.colors.primary}
              thickness={4}
              dataPointsColor={theme.colors.primary}
              dataPointsRadius={4}
              xAxisColor={theme.colors.border}
              yAxisColor={theme.colors.border}
              rulesColor={theme.colors.border}
              yAxisTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium }}
              xAxisLabelTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium }}
              curved
              areaChart
              startFillColor={theme.colors.primary}
              endFillColor={theme.colors.primary}
              startOpacity={0.2}
              endOpacity={0.0}
              hideDataPoints={false}
              isAnimated
            />
          </View>
        </Animated.View>

        {/* Applications Bar Chart */}
        {topJobs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(130).springify()} style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Applications per Job
            </Text>
            <View style={{ marginLeft: -10 }}>
              <BarChart
                data={topJobs.slice(0, 4).map((job, idx) => ({
                  value: job.applications ?? 0,
                  label: `J${idx + 1}`,
                  frontColor: [theme.colors.primary, theme.colors.info, theme.colors.accent, theme.colors.success][idx % 4],
                }))}
                width={Dimensions.get('window').width - 80}
                height={160}
                barWidth={35}
                spacing={30}
                roundedTop
                barBorderRadius={6}
                xAxisColor={theme.colors.border}
                yAxisColor={theme.colors.border}
                rulesColor={theme.colors.border}
                yAxisTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium }}
                xAxisLabelTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium }}
                isAnimated
              />
            </View>
          </Animated.View>
        )}

        {/* Top performing jobs */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Top Performing Jobs
          </Text>
          {topJobs.map((job, i) => (
            <View key={job.id} style={[styles.jobRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.rank, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                #{i + 1}
              </Text>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]} numberOfLines={1}>
                  {job.title}
                </Text>
                <Text style={[styles.jobStats, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  {job.views ?? 0} views · {job.applications ?? 0} applications
                </Text>
              </View>
            </View>
          ))}
          {topJobs.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Post jobs to see performance analytics
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, letterSpacing: -0.5 },
  statLabel: { fontSize: 12 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, marginBottom: 4 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  rank: { fontSize: 18, width: 32, textAlign: 'center' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 14, marginBottom: 3 },
  jobStats: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
  chartCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  chartTitle: { fontSize: 16, marginBottom: 20 },
});
