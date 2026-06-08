import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle, MessageSquare, Flag, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Report } from '../../../types/admin.types';

type Tab = 'open' | 'resolved';

export default function AdminReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { reports, isLoading, fetchReports, resolveReport } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>('open');

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = (reportId: string, action: 'resolve' | 'dismiss') => {
    Alert.alert(
      action === 'resolve' ? 'Resolve Report' : 'Dismiss Report',
      `Are you sure you want to ${action} this report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await resolveReport(reportId, action);
          },
        },
      ]
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'open', label: 'Open Tickets' },
    { key: 'resolved', label: 'Resolved' },
  ];

  // API only fetches open reports right now, mock for resolved
  const data = activeTab === 'open' ? reports : [];

  const getPriority = (type: string) => {
    if (type.includes('harassment') || type.includes('scam') || type.includes('fake')) return { label: 'High Priority', color: theme.colors.error };
    if (type.includes('spam') || type.includes('inappropriate')) return { label: 'Medium Priority', color: theme.colors.warning };
    return { label: 'Low Priority', color: theme.colors.primary };
  };

  const renderReport = ({ item, index }: { item: Report; index: number }) => {
    const priority = getPriority(item.type);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={[styles.card, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            <View style={[styles.iconWrapper, { backgroundColor: priority.color + '15' }]}>
              <Flag size={14} color={priority.color} />
            </View>
            <View>
              <Text style={[styles.type, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                {item.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.reason, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            {item.reason}
          </Text>
          {item.description && (
            <View style={[styles.descriptionBox, { backgroundColor: theme.colors.background + '60', borderColor: theme.colors.border }]}>
              <MessageSquare size={14} color={theme.colors.textSecondary} style={{ marginTop: 2 }} />
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
          )}
          <Text style={[styles.reporter, { color: theme.colors.textMuted }]}>
            Reported by: <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }}>{item.reportedBy.email}</Text>
          </Text>
        </View>

        {activeTab === 'open' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success + '40' }]}
              onPress={() => handleResolve(item.id, 'resolve')}
            >
              <CheckCircle size={16} color={theme.colors.success} />
              <Text style={[styles.actionText, { color: theme.colors.success }]}>Resolve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => handleResolve(item.id, 'dismiss')}
            >
              <Trash2 size={16} color={theme.colors.error} />
              <Text style={[styles.actionText, { color: theme.colors.error }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.error + '08', 'transparent']}
          style={{ height: 250, opacity: 0.8 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Support Tickets
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <View style={[styles.tabBg, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && [styles.activeTab, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFF' : theme.colors.textMuted, fontFamily: activeTab === tab.key ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
                {tab.label} {tab.key === 'open' && reports.length > 0 ? `(${reports.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && activeTab === 'open' ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={<CheckCircle size={56} color={theme.colors.success} style={{ opacity: 0.8 }} />}
              title={activeTab === 'open' ? "All caught up!" : "No records found"}
              description={activeTab === 'open' ? "There are no open reports requiring your attention right now." : "You have no resolved reports in your history."}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, letterSpacing: -0.5 },
  tabContainer: { paddingHorizontal: 16, marginBottom: 8 },
  tabBg: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13 },
  list: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  type: { fontSize: 13, letterSpacing: 0.5 },
  priorityText: { fontSize: 11, marginTop: 2, fontFamily: 'Inter_500Medium' },
  date: { fontSize: 12 },
  content: { gap: 10 },
  reason: { fontSize: 16 },
  descriptionBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  description: { flex: 1, fontSize: 13, lineHeight: 20 },
  reporter: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  actionText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
