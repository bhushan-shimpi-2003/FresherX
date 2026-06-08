import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Building2, Globe, MapPin, Briefcase, Users, Settings, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { formatCount } from '../../../utils/formatters';
import { palette } from '../../../constants/colors';

export default function RecruiterProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { profile, company, stats, fetchProfile, fetchStats } = useRecruiterStore();

  useEffect(() => {
    if (user) { fetchProfile(user.id); fetchStats(user.id); }
  }, [user]);

  const verificationVariant = { verified: 'success', pending: 'warning', rejected: 'error' }[profile?.status ?? 'pending'] as any;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Ambient Top Glow */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={[theme.colors.primary + '20', 'transparent']}
            style={{ height: 350, opacity: 0.9 }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        <ScreenHeader
          title="Profile"
          subtitle="Manage your company details"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/(recruiter)/settings' as any)} style={[styles.settingsBtn, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
              <Settings size={20} color={theme.colors.text} />
            </TouchableOpacity>
          }
        />

        {/* Profile card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: theme.colors.card + 'A0', borderColor: theme.colors.border }]}>
          <View style={styles.avatarWrap}>
            <Avatar name={company?.name ?? profile?.fullName} size={80} />
          </View>
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {company?.name ?? 'Setup Company'}
          </Text>
          <Text style={[styles.designation, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
            {profile?.designation ?? profile?.fullName} · {user?.email}
          </Text>
          
          <View style={styles.badgeWrap}>
            <View style={[styles.statusBadge, { backgroundColor: (theme.colors as any)[verificationVariant] + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: (theme.colors as any)[verificationVariant] }]} />
              <Text style={[styles.statusText, { color: (theme.colors as any)[verificationVariant], fontFamily: theme.typography.fontFamily.medium }]}>
                {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          {stats && (
            <View style={styles.statsRow}>
              {[
                { label: 'Total Jobs', value: stats.totalJobs },
                { label: 'Post Views', value: stats.totalViews },
                { label: 'Applications', value: stats.totalApplications },
              ].map(({ label, value }) => (
                <View key={label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                    {formatCount(value)}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Company details */}
        {company && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.section, { backgroundColor: theme.colors.card + '80', borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                Company Overview
              </Text>
            </View>
            <View style={styles.detailsGrid}>
              {[
                { Icon: Building2, label: company.industry, color: '#4CAF50' },
                { Icon: Users, label: `${company.size} employees`, color: '#2196F3' },
                { Icon: MapPin, label: company.location, color: '#FF9800' },
                { Icon: Globe, label: company.website ?? 'No website', color: '#9C27B0' },
              ].map(({ Icon, label, color }) => (
                <View key={label} style={styles.detailRow}>
                  <View style={[styles.detailIconWrap, { backgroundColor: color + '15' }]}>
                    <Icon size={16} color={color} />
                  </View>
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {!company && (
          <Button label="Setup Company Profile" variant="primary" size="lg" fullWidth onPress={() => router.push('/(recruiter)/onboarding/company-setup' as any)} />
        )}

        <Button label="Log Out" variant="outline" size="md" fullWidth onPress={logout} style={{ marginTop: 16 }} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 10 },
  avatarWrap: { padding: 4, borderRadius: 44, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  name: { fontSize: 22, letterSpacing: -0.5, marginTop: 4 },
  designation: { fontSize: 14, marginBottom: 4 },
  badgeWrap: { marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, letterSpacing: -0.5 },
  statLabel: { fontSize: 12 },
  section: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 16 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  detailsGrid: { gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailText: { fontSize: 15, flex: 1 },
});
