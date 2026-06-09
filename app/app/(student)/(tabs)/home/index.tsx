import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, Modal } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, Sliders, X, UserCheck, Bookmark as BookmarkIcon, BellRing, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../theme';
import { useAuthStore } from '../../../../store/auth.store';
import { useJobsStore } from '../../../../store/jobs.store';
import { useNotificationsStore } from '../../../../store/notifications.store';
import { SearchBar } from '../../../../components/ui/SearchBar';
import { Chip } from '../../../../components/ui/Chip';
import { JobCard } from '../../../../components/cards/JobCard';
import { JobCardSkeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Avatar } from '../../../../components/ui/Avatar';
import { useUserStore } from '../../../../store/user.store';
import { TouchableOpacity } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { calculateProfileCompleteness } from '../../../../utils/profileScorer';

const JOB_TYPE_FILTERS = ['All', 'Internship', 'Full-time', 'Remote', 'Part-time'];

export default function StudentHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { 
    jobs, isLoading, isLoadingMore, hasMore, fetchJobs, fetchMoreJobs, saveJob, unsaveJob,
    recommendedJobs, isRecommendedLoading, fetchRecommendedJobs
  } = useJobsStore();
  const { unreadCount } = useNotificationsStore();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchRecommendedJobs();
    if (user) {
      // fetchProfile(user.id) // would be here
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchJobs(undefined, true),
      fetchRecommendedJobs()
    ]);
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    fetchJobs({ keyword: text || undefined }, true);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchJobs({ jobType: filter === 'All' ? undefined : filter as any }, true);
  };

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
      onSave={() => handleSaveToggle(item.id, item.isSaved ?? false)}
    />
  ), []);

  const [showFilters, setShowFilters] = useState(false);
  const [datePosted, setDatePosted] = useState<'24h' | '7d' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const applyAdvancedFilters = () => {
    setShowFilters(false);
    fetchJobs({ datePosted: datePosted === 'all' ? undefined : datePosted, sortBy }, true);
  };

  const renderHeader = () => (
    <>
      <ScreenHeader
        title={profile?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Fresher'}
        subtitle="Good morning 👋"
        rightAction={
          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => router.push('/(student)/notifications')}
              style={[styles.iconBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Bell size={20} color={theme.colors.text} />
              {unreadCount > 0 && <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
              <Avatar uri={profile?.avatar} name={profile?.fullName} size={40} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search */}
      <SearchBar
        value={searchText}
        onChangeText={handleSearch}
        style={{ marginHorizontal: 16, marginBottom: 20 }}
      />

      {/* KPI Cards */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 28, gap: 12 }}>

        
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: theme.colors.accent + '15', padding: 16, borderRadius: 20 }}
          onPress={() => router.push('/(student)/(tabs)/saved')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <BookmarkIcon size={20} color={theme.colors.accent} />
            <Text style={{ fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.accent }}>
              {saveJob?.length ?? 0}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textSecondary }}>
            Saved Jobs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: theme.colors.warning + '15', padding: 16, borderRadius: 20 }}
          onPress={() => router.push('/(student)/notifications')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <BellRing size={20} color={theme.colors.warning} />
            <Text style={{ fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.warning }}>
              {unreadCount ?? 0}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textSecondary }}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resume Builder Banner */}
      <TouchableOpacity 
        style={{ marginHorizontal: 16, marginBottom: 28, backgroundColor: theme.colors.primary, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        onPress={() => router.push('/(student)/(tabs)/resume')}
      >
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 18, fontFamily: theme.typography.fontFamily.bold, marginBottom: 4 }}>
            Build your ATS Resume
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: theme.typography.fontFamily.regular }}>
            Create a professional, parser-friendly PDF resume in seconds.
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16 }}>
          <FileText size={24} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }}>
              Recommended for you
            </Text>
            <TouchableOpacity onPress={() => router.push('/(student)/(tabs)/search')}>
              <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 }}>
                See all {'>'}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recommendedJobs}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
            renderItem={({ item, index }) => (
              <JobCard
                job={item}
                index={index}
                variant="compact"
                onPress={() => router.push(`/(student)/job/${item.id}`)}
                onSave={() => handleSaveToggle(item.id, item.isSaved ?? false)}
              />
            )}
          />
        </View>
      )}

      {/* Feed Header */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }}>
          Discover Jobs
        </Text>
      </View>

      {/* Filter chips & Advanced Filters */}
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
              onPress={() => handleFilterChange(item)}
            />
          )}
        />
        <TouchableOpacity
          style={{
            marginRight: 16,
            marginLeft: 8,
            width: 44,
            height: 44,
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

      {/* Section title */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
          Latest Opportunities
        </Text>
        <Text style={[styles.sectionCount, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          {jobs.length} jobs
        </Text>
      </Animated.View>
    </>
  );

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {isLoading && jobs.length === 0 ? (
        <>
          {renderHeader()}
          {renderSkeleton()}
        </>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No jobs found"
              description="Try adjusting your filters or search terms"
            />
          }
          ListFooterComponent={isLoadingMore ? <JobCardSkeleton /> : null}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onEndReached={hasMore ? fetchMoreJobs : undefined}
          onEndReachedThreshold={0.4}
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
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

            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]} onPress={applyAdvancedFilters}>
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
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18 },
  sectionCount: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  filterGroupTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12, marginTop: 8 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  applyBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
