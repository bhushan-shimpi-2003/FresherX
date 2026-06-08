import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, X, ShieldAlert, ChevronLeft, Building2, Search, Filter, Briefcase, MapPin, DollarSign, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AdminJob } from '../../../types/admin.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'pending' | 'approved' | 'rejected';

export default function AdminJobsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pendingJobs, isLoading, fetchPendingJobs, reviewJob } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleAction = (jobId: string, action: 'approve' | 'reject' | 'spam') => {
    const title = `${action.charAt(0).toUpperCase() + action.slice(1)} Job`;
    const msg = `Are you sure you want to ${action} this job post?`;

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        reviewJob({ jobId, action });
      }
    } else {
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
            await reviewJob({ jobId, action });
          },
        },
      ]);
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const data = pendingJobs.filter((job) => {
    if (activeTab === 'pending') return job.status === 'pending';
    if (activeTab === 'approved') return job.status === 'published';
    if (activeTab === 'rejected') return job.status === 'rejected';
    return false;
  });

  const renderJob = ({ item, index }: { item: AdminJob; index: number }) => {
    const isExpanded = expandedJobId === item.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={[styles.card, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand(item.id)}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.jobTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                {item.title}
              </Text>
              <View style={styles.companyRow}>
                <Building2 size={14} color={theme.colors.textMuted} />
                <Text style={[styles.companyName, { color: theme.colors.textMuted }]}>{item.company.name}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Badge label={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} variant={activeTab === 'pending' ? 'warning' : activeTab === 'approved' ? 'success' : 'error'} size="sm" />
              {isExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
            </View>
          </View>
        </TouchableOpacity>

        {item.reportCount > 0 && (
          <View style={[styles.reportWarning, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30', borderWidth: 1 }]}>
            <ShieldAlert size={14} color={theme.colors.error} />
            <Text style={[styles.reportText, { color: theme.colors.error }]}>{item.reportCount} Reports Flagged</Text>
          </View>
        )}

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.location || 'Not specified'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Briefcase size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.type || 'Not specified'}</Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.salary ? `${item.salary.currency}${item.salary.min}-${item.salary.max}` : 'Not specified'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.descContainer}>
              <Text style={[styles.descTitle, { color: theme.colors.text }]}>Description</Text>
              <Text style={[styles.descText, { color: theme.colors.textMuted }]} numberOfLines={3}>
                {item.description || 'No description provided.'}
              </Text>
            </View>

            <View style={styles.actions}>
              {item.status !== 'published' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success + '40' }]}
                  onPress={() => handleAction(item.id, 'approve')}
                >
                  <Check size={18} color={theme.colors.success} />
                  <Text style={[styles.actionText, { color: theme.colors.success }]}>Approve</Text>
                </TouchableOpacity>
              )}
              
              {item.status !== 'rejected' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '40' }]}
                  onPress={() => handleAction(item.id, 'reject')}
                >
                  <X size={18} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>Reject</Text>
                </TouchableOpacity>
              )}

              {item.status !== 'archived' && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => handleAction(item.id, 'spam')}
                >
                  <ShieldAlert size={18} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic Background Glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.warning + '08', 'transparent']}
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
          Job Approvals
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtnHeader}>
            <Search size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnHeader}>
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(t) => t.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                { backgroundColor: activeTab === item.key ? theme.colors.text : theme.colors.card + '80', borderColor: activeTab === item.key ? theme.colors.text : theme.colors.border }
              ]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.filterPillText, { color: activeTab === item.key ? theme.colors.background : theme.colors.textMuted, fontFamily: activeTab === item.key ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
                {item.label} {item.key === 'pending' && pendingJobs.filter(j => j.status === 'pending').length > 0 ? `(${pendingJobs.filter(j => j.status === 'pending').length})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading && pendingJobs.length === 0 ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={<Briefcase size={56} color={theme.colors.primary} style={{ opacity: 0.8 }} />}
              title={activeTab === 'pending' ? "No pending jobs" : "No records found"}
              description={activeTab === 'pending' ? "There are no new job posts waiting for your review." : `There are no ${activeTab} job posts to display.`}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: -8 },
  iconBtnHeader: { padding: 8 },
  filterContainer: { marginBottom: 8 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillText: { fontSize: 13 },
  list: { padding: 16, gap: 16 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flex: 1, gap: 4 },
  jobTitle: { fontSize: 17 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyName: { fontSize: 13 },
  reportWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10 },
  reportText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  expandedContent: { gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  metaText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  descContainer: { gap: 4 },
  descTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  descText: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  actionText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  iconBtn: { padding: 12, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
});
