import { Tabs } from 'expo-router';
import { Home, Bookmark, Search, Bell, User } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useNotificationsStore } from '../../store/notifications.store';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ Icon, color, focused, badgeCount }: { Icon: any; color: string; focused: boolean; badgeCount?: number }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
      {!!badgeCount && badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: '#FF5E5E' }]}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function StudentTabsLayout() {
  const theme = useTheme();
  const { unreadCount } = useNotificationsStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 4,
          height: 64,
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
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved/index"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Bookmark} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Search} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Bell} color={color} focused={focused} badgeCount={unreadCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={User} color={color} focused={focused} />,
        }}
      />
      {/* Hidden screens (no tab bar item) */}
      <Tabs.Screen name="job/[id]" options={{ href: null }} />
      <Tabs.Screen name="edit-profile/index" options={{ href: null }} />
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="onboarding/role" options={{ href: null }} />
      <Tabs.Screen name="onboarding/personal" options={{ href: null }} />
      <Tabs.Screen name="onboarding/education" options={{ href: null }} />
      <Tabs.Screen name="onboarding/skills" options={{ href: null }} />
      <Tabs.Screen name="onboarding/preferences" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
});
