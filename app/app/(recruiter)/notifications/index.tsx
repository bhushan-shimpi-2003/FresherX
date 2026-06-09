import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useNotificationsStore } from '../../../store/notifications.store';
import { NotificationCard } from '../../../components/cards/NotificationCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { Bell, CheckCheck } from 'lucide-react-native';

export default function RecruiterNotificationsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { notifications, isLoading, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationsStore();
  const [filter, setFilter] = React.useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      subscribeToNotifications(user.id);
      
      return () => unsubscribeFromNotifications();
    }
  }, [user]);

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => {
      if (filter === 'jobs' && (n.type === 'new_job' || n.type === 'saved_job')) return true;
      if (filter === 'alerts' && (n.type === 'deadline' || n.type === 'application')) return true;
      if (filter === 'system' && n.type === 'system') return true;
      return false;
    });
  }, [notifications, filter]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'system', label: 'System' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={() => user && markAllAsRead(user.id)}
              style={[styles.markAllBtn, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
            >
              <CheckCheck size={14} color={theme.colors.primary} />
              <Text style={[styles.markAllText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[
              styles.filterPill,
              filter === f.id ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.card }
            ]}
          >
            <Text style={[
              styles.filterText,
              filter === f.id ? { color: '#FFF' } : { color: theme.colors.textSecondary }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <NotificationCard
              notification={item}
              index={index}
              onPress={() => !item.isRead && markAsRead(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={48} color={theme.colors.textMuted} />}
              title="No notifications yet"
              description="We'll notify you about new applications and updates"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  markAllText: { fontSize: 12 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
