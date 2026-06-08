import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, SafeAreaView, Alert, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Moon, Sun, Bell, Globe, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useSettingsStore } from '../../../store/settings.store';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { themeMode, notificationsEnabled, setThemeMode, setNotificationsEnabled } = useSettingsStore();

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            APPEARANCE
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            NOTIFICATIONS
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.warning + '20' }]}>
                <Bell size={18} color={theme.colors.warning} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingHint, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  Job alerts, deadlines, updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.card}
              />
            </View>
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            ACCOUNT
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.group}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20,
  },
  title: { fontSize: 20 },
  scroll: { paddingHorizontal: 16, paddingBottom: 60 },
  group: { marginBottom: 28 },
  groupLabel: { fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15 },
  settingHint: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 64 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1,
  },
  logoutText: { fontSize: 16 },
});
