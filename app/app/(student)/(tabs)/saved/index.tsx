import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Sliders, X } from 'lucide-react-native';
import { useTheme } from '../../../../theme';
import { useAuthStore } from '../../../../store/auth.store';
import { useJobsStore } from '../../../../store/jobs.store';
import { JobCard } from '../../../../components/cards/JobCard';
import { JobCardSkeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { Chip } from '../../../../components/ui/Chip';

const JOB_TYPE_FILTERS = ['All', 'Full-time', 'Internship', 'Remote', 'Freelance'];

export default function StudentSavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { savedJobs, isSavedLoading, fetchSavedJobs, saveJob, unsaveJob } = useJobsStore();
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [datePosted, setDatePosted] = useState<'24h' | '7d' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const filteredJobs = useMemo(() => {
    let result = [...savedJobs];
    if (activeFilter !== 'All') {
      if (activeFilter === 'Remote') {
        result = result.filter(j => j.isRemote);
      } else {
        result = result.filter(j => j.jobType && j.jobType.includes(activeFilter));
      }
    }
    if (datePosted !== 'all') {
      const now = new Date();
      if (datePosted === '24h') {
        now.setHours(now.getHours() - 24);
      } else if (datePosted === '7d') {
        now.setDate(now.getDate() - 7);
      }
      result = result.filter(j => new Date(j.createdAt) >= now);
    }
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [savedJobs, activeFilter, datePosted, sortBy]);

  useEffect(() => {
    if (user) {
      fetchSavedJobs(user.id);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchSavedJobs(user.id);
    setRefreshing(false);
  }, [user]);

  const handleSaveToggle = (jobId: string, isSaved: boolean) => {
    if (!user) return;
    if (isSaved) unsaveJob(jobId, user.id);
    else saveJob(jobId, user.id);
  };

  const renderItem = useCallback(({ item, index }: any) => (
    <JobCard
      job={item}
      index={index}
      onPress={() => router.push(`/(student)/job/${item.id}`)}
      onSave={() => handleSaveToggle(item.id, item.isSaved)}
    />
  ), []);

  const renderHeader = () => (
    <>
      <ScreenHeader
        title="Saved Jobs"
        subtitle={`${filteredJobs.length} opportunities`}
        showBack={false}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <FlatList
          horizontal
          data={JOB_TYPE_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, gap: 8 }}
          renderItem={({ item }) => (
            <Chip
              label={item}
              selected={activeFilter === item}
              onPress={() => setActiveFilter(item)}
            />
          )}
        />
        <TouchableOpacity
          style={{
            marginRight: 16,
            marginLeft: 8,
            width: 50,
            height: 50,
            borderRadius: 12,
            backgroundColor: theme.colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setShowFilters(true)}
        >
          <Sliders size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {isSavedLoading && savedJobs.length === 0 ? (
        <>
          {renderHeader()}
          {renderSkeleton()}
        </>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No saved jobs"
              description="Jobs you save will appear here"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Advanced Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterGroupTitle, { color: theme.colors.textMuted }]}>Date Posted</Text>
            <View style={styles.chipGroup}>
              {[{ label: 'All Time', val: 'all' }, { label: 'Last 24 Hours', val: '24h' }, { label: 'Last 7 Days', val: '7d' }].map(opt => (
                <Chip
                  key={opt.val}
                  label={opt.label}
                  selected={datePosted === opt.val}
                  onPress={() => setDatePosted(opt.val as any)}
                  style={{ marginBottom: 12, marginRight: 8 }}
                />
              ))}
            </View>

            <Text style={[styles.filterGroupTitle, { color: theme.colors.textMuted }]}>Sort By</Text>
            <View style={styles.chipGroup}>
              {[{ label: 'Most Recent', val: 'recent' }, { label: 'Most Relevant', val: 'popular' }].map(opt => (
                <Chip
                  key={opt.val}
                  label={opt.label}
                  selected={sortBy === opt.val}
                  onPress={() => setSortBy(opt.val as any)}
                  style={{ marginBottom: 12, marginRight: 8 }}
                />
              ))}
            </View>

            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  filterGroupTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12, marginTop: 8 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  applyBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
