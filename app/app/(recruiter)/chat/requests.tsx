import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export default function RecruiterChatRequestsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Message Requests</Text>
      <Text style={{ color: theme.colors.textSecondary }}>No pending requests.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 64 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
