import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Edit3, GraduationCap,
  Briefcase, Mail, Phone, Moon, Sun, Bell, Globe, Shield, LogOut, ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../theme';
import { useAuthStore } from '../../../../store/auth.store';
import { useUserStore } from '../../../../store/user.store';
import { useSettingsStore } from '../../../../store/settings.store';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { calculateProfileCompleteness } from '../../../../utils/profileScorer';

export default function StudentProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const { themeMode, notificationsEnabled, setThemeMode, setNotificationsEnabled } = useSettingsStore();

  useEffect(() => {
    if (user) fetchProfile(user.id);
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

  const isDark = themeMode === 'dark';

  const completionPct = calculateProfileCompleteness(profile);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.primary + '05', 'transparent']}
            style={{ height: 400 }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        <ScreenHeader
          title="Profile"
          subtitle="Manage your account"
        />

        {/* Profile card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: theme.colors.card }]}>
            <Avatar uri={profile?.avatar} name={profile?.fullName ?? user?.email} size={84} />
          </View>
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {profile?.fullName ?? 'Your Name'}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            {user?.email}
          </Text>

          {/* Completion bar */}
          <View style={styles.completionArea}>
            <View style={styles.completionRow}>
              <Text style={[styles.completionLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                Profile Strength
              </Text>
              <Text style={[styles.completionPct, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                {completionPct}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressFill, { width: `${completionPct}%`, backgroundColor: theme.colors.primary }]} />
            </View>
          </View>

          <Button
            label="Edit Profile"
            variant="outline"
            size="sm"
            leftIcon={<Edit3 size={15} color={theme.colors.primary} />}
            onPress={() => router.push('/(student)/edit-profile')}
          />
        </Animated.View>

        {/* Info section */}
        {profile && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.infoSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {[
              { Icon: GraduationCap, label: profile.college ?? 'Add college', muted: !profile.college },
              { Icon: Briefcase, label: profile.degree ?? 'Add degree', muted: !profile.degree },
              { Icon: Mail, label: user?.email ?? '', muted: false },
              { Icon: Phone, label: profile.phone ?? 'Add phone', muted: !profile.phone },
            ].map(({ Icon, label, muted }) => (
              <View key={label} style={styles.infoRow}>
                <Icon size={16} color={muted ? theme.colors.textMuted : theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: muted ? theme.colors.textMuted : theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
                  {label}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Skills
            </Text>
            <View style={styles.skills}>
              {profile.skills.map((skill) => <Badge key={skill} label={skill} variant="primary" />)}
            </View>
          </Animated.View>
        )}

        {/* Appearance Settings */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.group}>
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


        {/* Account */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            ACCOUNT
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {[
              { Icon: Shield, label: 'Privacy Policy', color: theme.colors.info },
              { Icon: Globe, label: 'Language', color: theme.colors.accent },
            ].map(({ Icon, label, color }, i) => (
              <React.Fragment key={label}>
                <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                  <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                    <Icon size={18} color={color} />
                  </View>
                  <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                    {label}
                  </Text>
                  <ChevronRight size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {i < 1 && <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.group}>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error + '30' }]}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  avatarWrap: { padding: 4, borderRadius: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  profileCard: {
    alignItems: 'center', padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2
  },
  name: { fontSize: 22, letterSpacing: -0.3, marginTop: 4 },
  email: { fontSize: 14 },
  completionArea: { width: '100%', gap: 8 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  completionLabel: { fontSize: 12 },
  completionPct: { fontSize: 12 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  infoSection: { 
    padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 15, flex: 1 },
  section: { 
    padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
