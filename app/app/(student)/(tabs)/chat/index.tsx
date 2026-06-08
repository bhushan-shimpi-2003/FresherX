import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../../../theme';
import { MessageSquare } from 'lucide-react-native';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Button } from '../../../../components/ui/Button';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { useRouter } from 'expo-router';

export default function StudentChatInboxScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Messages" subtitle="Connect with recruiters" />
      <View style={styles.content}>
        <EmptyState 
          icon={<MessageSquare size={48} color={theme.colors.textMuted} />}
          title="No active chats" 
          description="When recruiters respond to your referral requests or reach out, they will appear here."
        />
        <Button 
          label="Browse Jobs" 
          variant="outline" 
          onPress={() => router.push('/(student)/search')}
          style={{ marginTop: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 60 }
});
