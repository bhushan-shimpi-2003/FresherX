import { Tabs } from 'expo-router';
import { LayoutDashboard, Shield, Briefcase, Users, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminTabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 64 + Math.max(insets.bottom, 8),
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs/index"
        options={{
          title: 'Review Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="verify/index"
        options={{
          title: 'Verify',
          tabBarIcon: ({ color, focused }) => (
            <Shield size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="users/index"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, focused }) => (
            <Users size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <SettingsIcon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="analytics/index" options={{ href: null }} />
      <Tabs.Screen name="create/index" options={{ href: null }} />
      <Tabs.Screen name="jobs/edit/[id]" options={{ href: null }} />
    </Tabs>
  );
}
