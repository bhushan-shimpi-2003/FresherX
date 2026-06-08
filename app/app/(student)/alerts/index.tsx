import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { ChevronLeft, Bell, Plus, Trash2 } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';

// Mock data for alerts
const MOCK_ALERTS = [
  { id: '1', keyword: 'Frontend Developer', type: 'Full-time', active: true },
  { id: '2', keyword: 'React Native', isRemote: true, active: false },
];

export default function JobAlertsScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Job Alerts
        </Text>
        <TouchableOpacity>
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
          We will notify you when new jobs matching your alerts are published.
        </Text>

        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.alertCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.alertInfo}>
                <Text style={[styles.alertKeyword, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                  {item.keyword}
                </Text>
                <View style={styles.tags}>
                  {item.type && (
                    <Text style={[styles.tag, { backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }]}>
                      {item.type}
                    </Text>
                  )}
                  {item.isRemote && (
                    <Text style={[styles.tag, { backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }]}>
                      Remote
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.alertActions}>
                <Switch
                  value={item.active}
                  onValueChange={() => toggleAlert(item.id)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
                <TouchableOpacity onPress={() => deleteAlert(item.id)} style={{ padding: 4 }}>
                  <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bell size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No alerts set</Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textMuted }]}>Create an alert to never miss a job opportunity.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
  description: { fontSize: 14, marginBottom: 20 },
  alertCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  alertInfo: { flex: 1 },
  alertKeyword: { fontSize: 16, marginBottom: 8 },
  tags: { flexDirection: 'row', gap: 8 },
  tag: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  alertActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});
