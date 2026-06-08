import React, { useEffect } from 'react';
import {
  View, Text, FlatList, SafeAreaView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useNotificationsStore } from '../../../store/notifications.store';
import { NotificationCard } from '../../../components/cards/NotificationCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { Bell, CheckCheck } from 'lucide-react-native';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { notifications, isLoading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationsStore();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => user && markAllAsRead(user.id)}
            style={[styles.markAllBtn, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
          >
            <CheckCheck size={14} color={theme.colors.primary} />
            <Text style={[styles.markAllText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={notifications}
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
              description="We'll notify you about new jobs, deadlines, and updates"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, letterSpacing: -0.3 },
  unreadLabel: { fontSize: 13, marginTop: 4 },
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
});
