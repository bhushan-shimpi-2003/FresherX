import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme';
import { Home, Search, Bookmark, Bell, User, Briefcase, BarChart2, CheckSquare, FileText, Settings, ShieldAlert, PieChart } from 'lucide-react-native';

const ICON_MAP: Record<string, React.FC<any>> = {
  // Student
  index: Home,
  search: Search,
  saved: Bookmark,
  notifications: Bell,
  profile: User,
  // Recruiter
  dashboard: BarChart2,
  posts: Briefcase,
  create: FileText,
  analytics: PieChart,
  // Admin
  verify: CheckSquare,
  jobs: Briefcase,
  users: User,
  reports: ShieldAlert,
  // Fallbacks
  settings: Settings,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const routeName = route.name.split('/')[0];
        const Icon = ICON_MAP[routeName] || Home;
        const color = isFocused ? theme.colors.primary : theme.colors.tabBarInactive;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <Icon size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />
            <Text style={[styles.label, { color, fontFamily: isFocused ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
  },
});
