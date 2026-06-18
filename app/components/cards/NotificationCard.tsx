import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Bell, CheckCircle, Briefcase, Clock, AlertCircle, Trash2 } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Notification } from '../../store/notifications.store';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete?: () => void;
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

export function NotificationCard({ notification, onPress, onDelete, index = 0 }: NotificationCardProps) {
  const theme = useTheme();
  const Icon = iconMap[notification.type] ?? Bell;
  const iconColor = colorMap[notification.type] ?? theme.colors.primary;

  const formattedTitle = React.useMemo(() => {
    if ((notification.type === 'new_job' || notification.type === 'saved_job') && notification.data) {
      const role = notification.data.job_title || notification.data.role;
      const company = notification.data.company;
      if (role && company) {
        return `💼 ${role} at ${company}`;
      } else if (role) {
        return `💼 ${role}`;
      }
    }
    return notification.title;
  }, [notification]);

  const formattedBody = React.useMemo(() => {
    if (notification.type === 'new_job' || notification.type === 'saved_job') {
      return 'Matches your skills. Be one of the first to apply!';
    }
    return notification.body;
  }, [notification]);

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
            {formattedTitle}
          </Text>
          <Text
            style={[styles.body, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}
            numberOfLines={2}
          >
            {formattedBody}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.time, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              {formatRelativeTime(notification.createdAt)}
            </Text>
            {(notification.type === 'new_job' || notification.type === 'saved_job') && notification.data?.job_id && (
              <Text style={[styles.viewJob, { color: iconColor }]}>View Job →</Text>
            )}
          </View>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={{ padding: 4, marginLeft: 8 }}>
            <Trash2 size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
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
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  time: { fontSize: 11 },
  viewJob: { fontSize: 11, fontWeight: '600' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
