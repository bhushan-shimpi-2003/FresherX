import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Building2, Globe, MapPin, Briefcase, Users, ArrowUpRight, Moon, Sun, Bell, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { useSettingsStore } from '../../../store/settings.store';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { BottomSheetModal, BottomSheetRef } from '../../../components/ui/BottomSheet';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { authApi } from '../../../services/api/auth.api';
import { formatCount } from '../../../utils/formatters';

export default function RecruiterProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { profile, company, stats, fetchProfile, fetchStats } = useRecruiterStore();
  const { themeMode, notificationsEnabled, setThemeMode, setNotificationsEnabled } = useSettingsStore();

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) { fetchProfile(user.id); fetchStats(user.id); }
  }, [user]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    try {
      setIsChangingPassword(true);
      setPasswordError('');
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      bottomSheetRef.current?.dismiss();
      if (Platform.OS === 'web') {
        window.alert('Password successfully updated!');
      } else {
        Alert.alert('Success', 'Password successfully updated!');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isDark = themeMode === 'dark';

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
        />

        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: theme.colors.card }]}>
            <Avatar name={profile?.fullName ?? 'Recruiter'} size={84} />
          </View>
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {profile?.fullName ?? 'Job Poster'}
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



        {/* Appearance Settings */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            APPEARANCE
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '20' }]}>
                {isDark ? <Moon size={18} color={theme.colors.primary} /> : <Sun size={18} color={theme.colors.primary} />}
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingHint, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={isDark ? theme.colors.primary : theme.colors.card}
              />
            </View>
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            PREFERENCES
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => router.push('/(shared)/settings')}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.info + '20' }]}>
                <Shield size={18} color={theme.colors.info} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                Settings & Privacy
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { padding: 4, borderRadius: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  profileCard: { 
    alignItems: 'center', padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2
  },
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
  section: { 
    padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  detailsGrid: { gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailText: { fontSize: 15, flex: 1 },
  group: { marginBottom: 24 },
  groupLabel: { fontSize: 12, letterSpacing: 0.5, marginLeft: 8, marginBottom: 8 },
  settingsCard: { 
    borderRadius: 24, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, marginBottom: 2 },
  settingHint: { fontSize: 13 },
  divider: { height: 1, marginLeft: 66 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 8 },
  logoutText: { fontSize: 16 },
});
