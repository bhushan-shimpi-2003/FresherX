import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, Lock, FileText, Shield, HelpCircle, Info, Trash2, LogOut, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function SettingsIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();

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

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', route: '/(shared)/settings/edit-profile' as any },
        { icon: Lock, label: 'Change Password', route: '/(shared)/settings/change-password' as any },
      ],
    },
    {
      title: 'Legal & Privacy',
      items: [
        { icon: FileText, label: 'Privacy Policy', route: '/(shared)/settings/privacy-policy' as any },
        { icon: Shield, label: 'Terms & Conditions', route: '/(shared)/settings/terms' as any },
        { icon: Shield, label: 'Data & Privacy', route: '/(shared)/settings/data-privacy' as any },
      ],
    },
    {
      title: 'Support & Info',
      items: [
        { icon: HelpCircle, label: 'Help & Support', route: '/(shared)/settings/help-support' as any },
        { icon: Info, label: 'About App', route: '/(shared)/settings/about' as any },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: 20, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.textMuted,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingLabel: {
      flex: 1,
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text,
    },
    divider: { height: 1, backgroundColor: theme.colors.border },
    dangerIconWrap: { backgroundColor: theme.colors.error + '15' },
    dangerText: { color: theme.colors.error },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Settings" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(sectionIndex * 100).springify()}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.card}>
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.label}>
                      <TouchableOpacity 
                        style={styles.settingRow} 
                        activeOpacity={0.7}
                        onPress={() => router.push(item.route)}
                      >
                        <View style={styles.iconWrap}>
                          <Icon size={18} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <ChevronRight size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                      {index < section.items.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.settingRow} 
                activeOpacity={0.7} 
                onPress={handleLogout}
              >
                <View style={[styles.iconWrap, styles.dangerIconWrap]}>
                  <LogOut size={18} color={theme.colors.error} />
                </View>
                <Text style={[styles.settingLabel, styles.dangerText]}>Log Out</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.settingRow} 
                activeOpacity={0.7} 
                onPress={() => router.push('/(shared)/settings/delete-account' as any)}
              >
                <View style={[styles.iconWrap, styles.dangerIconWrap]}>
                  <Trash2 size={18} color={theme.colors.error} />
                </View>
                <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
                <ChevronRight size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
