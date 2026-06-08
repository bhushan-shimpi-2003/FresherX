import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../../theme';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';

export default function RecruiterChatInboxScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Messages" subtitle="Connect with candidates" />
      <View style={styles.content}>
        <Text style={{ color: theme.colors.textSecondary }}>Chat inbox coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
});
