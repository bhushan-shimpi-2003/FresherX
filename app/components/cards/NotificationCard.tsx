import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle, Briefcase, Clock, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Notification } from '../../store/notifications.store';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  index?: number;
}

const iconMap = {
  new_job: Briefcase,
  deadline: Clock,
  saved_job: CheckCircle,
  application: CheckCircle,
  system: AlertCircle,
};

const colorMap = {
  new_job: '#6C63FF',
  deadline: '#FFB84D',
  saved_job: '#43D9AD',
  application: '#43D9AD',
  system: '#4DAFFF',
};

export function NotificationCard({ notification, onPress, index = 0 }: NotificationCardProps) {
  const theme = useTheme();
  const Icon = iconMap[notification.type] ?? Bell;
  const iconColor = colorMap[notification.type] ?? theme.colors.primary;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: notification.isRead ? theme.colors.card : theme.colors.primary + '0D',
            borderBottomColor: theme.colors.border,
          },
        ]}
        activeOpacity={0.75}
      >
        <View style={[styles.iconWrapper, { backgroundColor: iconColor + '20' }]}>
          <Icon size={18} color={iconColor} />
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: notification.isRead
                  ? theme.typography.fontFamily.regular
                  : theme.typography.fontFamily.semiBold,
              },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            style={[styles.body, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}
            numberOfLines={2}
          >
            {notification.body}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        {!notification.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 14 },
  body: { fontSize: 13, lineHeight: 19 },
  time: { fontSize: 11, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
