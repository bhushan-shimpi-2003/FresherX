import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle, XCircle, ChevronLeft, Building2, Shield, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { Avatar } from '../../../components/ui/Avatar';
import { formatRelativeTime } from '../../../utils/formatters';

type Tab = 'pending' | 'verified' | 'rejected';

export default function VerifyRecruitersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pendingRecruiters, isLoading, fetchPendingRecruiters, verifyRecruiter } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  useEffect(() => { fetchPendingRecruiters(); }, []);

  const handleAction = (recruiterId: string, name: string, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    
    if (Platform.OS === 'web') {
      const promptText = isApprove ? `Approve ${name}?\nAdd a note (optional)` : `Reject ${name}?\nProvide a reason for rejection`;
      const note = window.prompt(promptText);
      if (note !== null) {
        verifyRecruiter({ recruiterId, action, note: note || undefined })
          .then(result => { if (!result.success) window.alert(result.error); });
      }
    } else {
      Alert.prompt(
        isApprove ? `Approve ${name}?` : `Reject ${name}?`,
        isApprove ? 'Add a note (optional)' : 'Provide a reason for rejection',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isApprove ? 'Approve' : 'Reject',
            style: isApprove ? 'default' : 'destructive',
            onPress: async (note?: string) => {
              const result = await verifyRecruiter({ recruiterId, action, note });
              if (!result.success) Alert.alert('Error', result.error);
            },
          },
        ],
        'plain-text',
      );
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const data = pendingRecruiters.filter((rec) => rec.status === activeTab);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic Background Glow */}
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
          Verify Recruiters
        </Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabBg, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && [styles.activeTab, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFF' : theme.colors.textMuted, fontFamily: activeTab === tab.key ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
                {tab.label} {tab.key === 'pending' && pendingRecruiters.filter(r => r.status === 'pending').length > 0 ? `(${pendingRecruiters.filter(r => r.status === 'pending').length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && pendingRecruiters.length === 0 ? (
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
                <View style={styles.recruiterInfo}>
                  <Avatar name={item.fullName} size={48} />
                  <View style={styles.recruiterDetails}>
                    <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      {item.fullName}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                      {item.email}
                    </Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.colors.warning + '15' }]}>
                  <Shield size={12} color={theme.colors.warning} />
                  <Text style={[styles.badgeText, { color: theme.colors.warning }]}>Action Req</Text>
                </View>
              </View>

              {item.company && (
                <View style={[styles.companyRow, { backgroundColor: theme.colors.background + '80' }]}>
                  <Building2 size={16} color={theme.colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.companyName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
                      {item.company.name}
                    </Text>
                    <Text style={[styles.companyMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                      {item.company.industry} · {item.company.location}
                    </Text>
                  </View>
                  <Text style={[styles.joined, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                    Applied {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                {item.status !== 'verified' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.success + '10', borderColor: theme.colors.success + '40' }]}
                    onPress={() => handleAction(item.id, item.fullName, 'approve')}
                  >
                    <CheckCircle size={18} color={theme.colors.success} />
                    <Text style={[styles.actionText, { color: theme.colors.success, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      Approve
                    </Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'rejected' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '40' }]}
                    onPress={() => handleAction(item.id, item.fullName, 'reject')}
                  >
                    <XCircle size={18} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.semiBold }]}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Shield size={56} color={theme.colors.primary} style={{ opacity: 0.8 }} />}
              title={activeTab === 'pending' ? "All caught up!" : "No records found"}
              description={activeTab === 'pending' ? "There are no new recruiters waiting for verification right now." : `There are no ${activeTab} recruiters to display.`}
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
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recruiterInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  recruiterDetails: { flex: 1, gap: 2 },
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
