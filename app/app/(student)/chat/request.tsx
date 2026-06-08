import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../theme';

export default function SendChatRequestScreen() {
  const { recruiterId } = useLocalSearchParams();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Send Chat Request</Text>
      <Text style={{ color: theme.colors.textSecondary }}>To Recruiter: {recruiterId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 64 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
