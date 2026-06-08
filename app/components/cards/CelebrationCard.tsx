import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { PartyPopper, ThumbsUp, MessageCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CelebrationCardProps {
  studentName: string;
  jobTitle: string;
  companyName: string;
  message: string;
  recruiterName?: string;
  likes: number;
}

export function CelebrationCard({ studentName, jobTitle, companyName, message, recruiterName, likes }: CelebrationCardProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInDown} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
          <PartyPopper size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            {studentName} got hired! 🎉
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            as {jobTitle} at {companyName}
          </Text>
        </View>
      </View>

      <Text style={[styles.message, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
        "{message}"
      </Text>

      {recruiterName && (
        <View style={[styles.attributionBox, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.attributionText, { color: theme.colors.textSecondary }]}>
            🤝 Hired via referral by <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{recruiterName}</Text>
          </Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.action}>
          <ThumbsUp size={16} color={theme.colors.textMuted} />
          <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>{likes}</Text>
        </View>
        <View style={styles.action}>
          <MessageCircle size={16} color={theme.colors.textMuted} />
          <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>Comment</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 16, marginBottom: 2 },
  subtitle: { fontSize: 14 },
  message: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', marginBottom: 16 },
  attributionBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  attributionText: { fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, gap: 24 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14 },
});
