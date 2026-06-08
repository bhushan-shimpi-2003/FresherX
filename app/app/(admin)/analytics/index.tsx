import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, BarChart2, TrendingUp, Users, Activity, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { formatCount } from '../../../utils/formatters';

export default function AdminAnalyticsScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Mock Data for "Charts"
  const monthlyGrowth = [40, 65, 45, 80, 55, 90, 100]; // percentages
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  
  const topSkills = [
    { name: 'React Native', percent: 85 },
    { name: 'Node.js', percent: 70 },
    { name: 'Python', percent: 60 },
    { name: 'UI/UX Design', percent: 45 },
    { name: 'Data Science', percent: 30 },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.accent + '15', 'transparent']}
          style={{ height: 400, opacity: 0.8 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Platform Insights
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* KPI Row */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
            <View style={[styles.kpiIcon, { backgroundColor: theme.colors.primary + '15' }]}>
              <TrendingUp size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              +24%
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.colors.textMuted }]}>User Growth</Text>
          </View>
          
          <View style={[styles.kpiCard, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
            <View style={[styles.kpiIcon, { backgroundColor: theme.colors.success + '15' }]}>
              <Activity size={20} color={theme.colors.success} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              99.9%
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.colors.textMuted }]}>Uptime</Text>
          </View>
        </Animated.View>

        {/* Growth Chart */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.chartCard, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Monthly Traffic
            </Text>
            <BarChart2 size={20} color={theme.colors.textMuted} />
          </View>
          
          <View style={styles.barChartContainer}>
            {monthlyGrowth.map((val, idx) => (
              <View key={idx} style={styles.barWrapper}>
                <View style={styles.barBg}>
                  <Animated.View 
                    entering={FadeInUp.delay(150 + idx * 50).springify()} 
                    style={[styles.barFill, { height: `${val}%`, backgroundColor: idx === 6 ? theme.colors.primary : theme.colors.primary + '60' }]} 
                  />
                </View>
                <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>{months[idx]}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Top Skills */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.chartCard, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Top Skills in Demand
            </Text>
            <Target size={20} color={theme.colors.textMuted} />
          </View>
          
          <View style={styles.skillsContainer}>
            {topSkills.map((skill, idx) => (
              <View key={idx} style={styles.skillRow}>
                <View style={styles.skillHeader}>
                  <Text style={[styles.skillName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                    {skill.name}
                  </Text>
                  <Text style={[styles.skillPercent, { color: theme.colors.textMuted }]}>
                    {skill.percent}%
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: theme.colors.background }]}>
                  <Animated.View 
                    entering={FadeInLeft.delay(200 + idx * 50).springify()} 
                    style={[styles.progressFill, { width: `${skill.percent}%`, backgroundColor: theme.colors.accent }]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Need to import FadeInLeft from reanimated, adding it here to avoid replacing whole file again
import { FadeInLeft } from 'react-native-reanimated';

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  
  kpiRow: { flexDirection: 'row', gap: 16 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, gap: 8 },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 28, letterSpacing: -1 },
  kpiLabel: { fontSize: 13 },
  
  chartCard: { padding: 20, borderRadius: 24, borderWidth: 1, gap: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18 },
  
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingTop: 20 },
  barWrapper: { alignItems: 'center', gap: 8 },
  barBg: { width: 12, height: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11 },
  
  skillsContainer: { gap: 16 },
  skillRow: { gap: 8 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillName: { fontSize: 14 },
  skillPercent: { fontSize: 12 },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
