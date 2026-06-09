import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Moon, Sun, Shield, LogOut, ChevronRight, Bell, Mail, Activity, Download, FileText, Globe, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useSettingsStore } from '../../../store/settings.store';
import { Avatar } from '../../../components/ui/Avatar';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { BottomSheetModal, BottomSheetRef } from '../../../components/ui/BottomSheet';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../../../services/api/auth.api';
import { adminApi } from '../../../services/api/admin.api';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function AdminSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    themeMode, setThemeMode,
    notificationsEnabled, setNotificationsEnabled,
    emailNotifications, setEmailNotifications,
    autoVerifyDomains, setAutoVerifyDomains,
    autoApproveJobs, setAutoApproveJobs,
    maintenanceMode, setMaintenanceMode
  } = useSettingsStore();

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [isExportingUsers, setIsExportingUsers] = useState(false);
  const [isExportingJobs, setIsExportingJobs] = useState(false);

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

  const handleDownloadFile = async (fileName: string, data: string) => {
    if (Platform.OS === 'web') {
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const fileUri = `${documentDirectory}${fileName}`;
      await writeAsStringAsync(fileUri, data, { encoding: 'utf8' });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    }
  };

  const handleExportUsers = async () => {
    try {
      setIsExportingUsers(true);
      const csvData = await adminApi.exportUsersCSV();
      await handleDownloadFile('fresherx_users_export.csv', csvData);
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export users');
    } finally {
      setIsExportingUsers(false);
    }
  };

  const handleExportJobs = async () => {
    try {
      setIsExportingJobs(true);
      const csvData = await adminApi.exportJobsCSV();
      await handleDownloadFile('fresherx_jobs_export.csv', csvData);
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export jobs');
    } finally {
      setIsExportingJobs(false);
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={[theme.colors.primary + '20', 'transparent']}
            style={{ height: 350, opacity: 0.9 }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        <ScreenHeader
          title="Settings"
          subtitle="Manage your admin preferences"
        />

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: theme.colors.card }]}>
            <Avatar name={user?.fullName || 'Admin'} size={84} />
          </View>
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {user?.fullName || 'Administrator'}
          </Text>
          <Text style={[styles.designation, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
            {user?.email}
          </Text>
          <View style={styles.badgeWrap}>
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.statusText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
                Admin Account
              </Text>
            </View>
          </View>
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

        {/* Notifications Settings */}
        <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            NOTIFICATIONS
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '20' }]}>
                <Bell size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.card}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.info + '20' }]}>
                <Mail size={18} color={theme.colors.info} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Email Alerts
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={emailNotifications ? theme.colors.primary : theme.colors.card}
              />
            </View>
          </View>
        </Animated.View>

        {/* Admin Configurations */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            ADMIN CONFIGURATIONS
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.success + '20' }]}>
                <Shield size={18} color={theme.colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Auto-Verify Trusted Domains
                </Text>
              </View>
              <Switch
                value={autoVerifyDomains}
                onValueChange={setAutoVerifyDomains}
                trackColor={{ false: theme.colors.border, true: theme.colors.success + '80' }}
                thumbColor={autoVerifyDomains ? theme.colors.success : theme.colors.card}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.success + '20' }]}>
                <Activity size={18} color={theme.colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  Auto-Approve Jobs
                </Text>
              </View>
              <Switch
                value={autoApproveJobs}
                onValueChange={setAutoApproveJobs}
                trackColor={{ false: theme.colors.border, true: theme.colors.success + '80' }}
                thumbColor={autoApproveJobs ? theme.colors.success : theme.colors.card}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.error + '20' }]}>
                <Info size={18} color={theme.colors.error} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                  System Maintenance Mode
                </Text>
                <Text style={[styles.settingHint, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.regular }]}>
                  Disables non-admin logins
                </Text>
              </View>
              <Switch
                value={maintenanceMode}
                onValueChange={setMaintenanceMode}
                trackColor={{ false: theme.colors.border, true: theme.colors.error + '80' }}
                thumbColor={maintenanceMode ? theme.colors.error : theme.colors.card}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleExportUsers} disabled={isExportingUsers}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.accent + '20' }]}>
                <Download size={18} color={theme.colors.accent} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                {isExportingUsers ? 'Exporting...' : 'Export Users Data (CSV)'}
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleExportJobs} disabled={isExportingJobs}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.accent + '20' }]}>
                <Download size={18} color={theme.colors.accent} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                {isExportingJobs ? 'Exporting...' : 'Export Jobs Data (CSV)'}
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            ACCOUNT
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => { setPasswordError(''); bottomSheetRef.current?.present(); }}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.info + '20' }]}>
                <Shield size={18} color={theme.colors.info} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                Security & Password
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* General App Info */}
        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            GENERAL
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.textMuted + '20' }]}>
                <FileText size={18} color={theme.colors.textMuted} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                Privacy Policy
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.textMuted + '20' }]}>
                <FileText size={18} color={theme.colors.textMuted} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                Terms of Service
              </Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '10' }]}>
                <Info size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, flex: 1 }]}>
                App Version
              </Text>
              <Text style={[styles.settingHint, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                v1.0.0
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.group}>
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

      {/* Change Password Modal */}
      <BottomSheetModal ref={bottomSheetRef} snapPoints={['60%']} title="Change Password">
        <View style={{ gap: 16, marginTop: 16 }}>
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password (min 6 characters)"
            secureTextEntry
            error={passwordError}
          />
          <Button
            label="Save New Password"
            onPress={handleChangePassword}
            loading={isChangingPassword}
            style={{ marginTop: 8 }}
          />
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
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
