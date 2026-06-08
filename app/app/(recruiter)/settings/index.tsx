import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, Bell, Shield, Moon, CircleHelp } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';

export default function RecruiterSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const sections = [
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Appearance', icon: Moon },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'security', label: 'Security & Password', icon: Shield },
        { id: 'help', label: 'Help & Support', icon: CircleHelp },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map((section, sIdx) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(sIdx * 100).springify()} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isLast = iIdx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.row,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                    ]}
                  >
                    <Icon size={20} color={theme.colors.textSecondary} />
                    <Text style={[styles.rowText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                      {item.label}
                    </Text>
                    <ChevronLeft size={20} color={theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.error + '50' }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={theme.colors.error} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 8 },
  title: { fontSize: 20 },
  scroll: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 0.8, marginBottom: 10, marginLeft: 8 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowText: { flex: 1, fontSize: 15 },
  logoutSection: { marginTop: 12, marginBottom: 40 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { fontSize: 16 },
});
