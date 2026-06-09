import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle, XCircle, ChevronLeft, Building2, Shield, Search, Briefcase, Edit2, Trash2, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { formatRelativeTime } from '../../../utils/formatters';

type Tab = 'pending' | 'published' | 'rejected';
type TimeFilter = 'all' | '24h' | '7d' | '30d';

export default function ReviewJobsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pendingJobs, isLoading, fetchPendingJobs, reviewJob, deleteJob } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  useEffect(() => { fetchPendingJobs(); }, []);

  const handleAction = (jobId: string, title: string, action: 'approve' | 'reject' | 'spam') => {
    const isApprove = action === 'approve';
    
    if (Platform.OS === 'web') {
      const promptText = isApprove ? `Approve "${title}"?\nAdd a note (optional)` : `Reject "${title}"?\nProvide a reason for rejection`;
      const note = window.prompt(promptText);
      if (note !== null || isApprove) {
        reviewJob({ jobId, action, reason: note || undefined })
          .then(result => { if (!result.success) window.alert(result.error); });
      }
    } else {
      Alert.prompt(
        isApprove ? `Approve "${title}"?` : `Reject "${title}"?`,
        isApprove ? 'Add a note (optional)' : 'Provide a reason for rejection',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isApprove ? 'Approve' : 'Reject',
            style: isApprove ? 'default' : 'destructive',
            onPress: async (note?: string) => {
              const result = await reviewJob({ jobId, action, reason: note });
              if (!result.success) Alert.alert('Error', result.error);
            },
          },
        ],
        'plain-text',
      );
    }
  };

  const handleDelete = (jobId: string, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to completely delete "${title}"? This cannot be undone.`)) {
        deleteJob(jobId).then(res => {
          if (!res.success) window.alert(res.error);
        });
      }
    } else {
      Alert.alert(
        'Delete Job',
        `Are you sure you want to completely delete "${title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              const res = await deleteJob(jobId);
              if (!res.success) Alert.alert('Error', res.error);
            }
          }
        ]
      );
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'published', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const data = React.useMemo(() => {
    return pendingJobs.filter((job) => {
      if (job.status !== activeTab) return false;
      
      if (timeFilter !== 'all') {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - jobDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (timeFilter === '24h' && diffDays > 1) return false;
        if (timeFilter === '7d' && diffDays > 7) return false;
        if (timeFilter === '30d' && diffDays > 30) return false;
      }
      
      return true;
    });
  }, [pendingJobs, activeTab, timeFilter]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.primary + '10', 'transparent']}
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
          Review Jobs
        </Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={theme.colors.text} />
        </TouchableOpacity>
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
                {tab.label} {tab.key === 'pending' && pendingJobs.filter(j => j.status === 'pending').length > 0 ? `(${pendingJobs.filter(j => j.status === 'pending').length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Filter size={16} color={theme.colors.textMuted} style={{ marginRight: 4, alignSelf: 'center' }} />
          {[
            { id: 'all', label: 'All Time' },
            { id: '24h', label: 'Last 24h' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, timeFilter === f.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setTimeFilter(f.id as TimeFilter)}
            >
              <Text style={[styles.filterChipText, timeFilter === f.id && { color: '#FFF', fontFamily: theme.typography.fontFamily.semiBold }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && pendingJobs.length === 0 ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 60).springify()}
              style={[styles.card, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.jobInfo}>
                  <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Briefcase size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.jobDetails}>
                    <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                      By {item.recruiter?.fullName || 'Unknown Recruiter'}
                    </Text>
                  </View>
                </View>
                {activeTab === 'pending' && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.warning + '15' }]}>
                    <Shield size={12} color={theme.colors.warning} />
                    <Text style={[styles.badgeText, { color: theme.colors.warning }]}>Action Req</Text>
                  </View>
                )}
              </View>

              <View style={[styles.companyRow, { backgroundColor: theme.colors.background + '80' }]}>
                <Building2 size={16} color={theme.colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.companyMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                    {item.location || 'Remote'} · {item.type || 'Full Time'}
                  </Text>
                </View>
                <Text style={[styles.joined, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  Posted {formatRelativeTime(item.createdAt)}
                </Text>
              </View>

              <View style={styles.actions}>
                {item.status !== 'published' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.success + '10', borderColor: theme.colors.success + '40' }]}
                    onPress={() => handleAction(item.id, item.title, 'approve')}
                  >
                    <CheckCircle size={18} color={theme.colors.success} />
                    <Text style={[styles.actionText, { color: theme.colors.success, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      Approve
                    </Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'rejected' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.warning + '10', borderColor: theme.colors.warning + '40' }]}
                    onPress={() => handleAction(item.id, item.title, 'reject')}
                  >
                    <XCircle size={18} color={theme.colors.warning} />
                    <Text style={[styles.actionText, { color: theme.colors.warning, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '40' }]}
                  onPress={() => router.push(`/(admin)/jobs/edit/${item.id}`)}
                >
                  <Edit2 size={18} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '40' }]}
                  onPress={() => handleDelete(item.id, item.title)}
                >
                  <Trash2 size={18} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.semiBold }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Briefcase size={56} color={theme.colors.primary} style={{ opacity: 0.8 }} />}
              title={activeTab === 'pending' ? "All caught up!" : "No records found"}
              description={activeTab === 'pending' ? "There are no new jobs waiting for verification right now." : `There are no ${activeTab} jobs to display.`}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, letterSpacing: -0.5 },
  searchBtn: { padding: 8, marginRight: -8 },
  tabContainer: { paddingHorizontal: 16, marginBottom: 8 },
  tabBg: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13 },
  filterContainer: { marginBottom: 12 },
  filterScroll: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  filterChipText: { fontSize: 12, color: '#6B7280', fontFamily: 'Inter_500Medium' },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  jobDetails: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
  email: { fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14 },
  companyName: { fontSize: 14 },
  companyMeta: { fontSize: 12, marginTop: 2 },
  joined: { fontSize: 11, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  actionText: { fontSize: 15 },
});
