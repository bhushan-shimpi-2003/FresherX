import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, Sliders } from 'lucide-react-native';
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

const JOB_TYPE_FILTERS = ['All', 'Internship', 'Full-time', 'Remote', 'Part-time'];

export default function StudentHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { jobs, isLoading, isLoadingMore, hasMore, fetchJobs, fetchMoreJobs, saveJob, unsaveJob } = useJobsStore();
  const { unreadCount } = useNotificationsStore();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      // fetchProfile(user.id) // would be here
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs({}, true);
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    fetchJobs({ keyword: text || undefined }, true);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchJobs(filter === 'All' ? {} : { jobType: [filter as any] }, true);
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
      onSave={() => handleSaveToggle(item.id, item.isSaved)}
    />
  ), []);

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
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />

      {/* Filter chips */}
      <FlatList
        horizontal
        data={JOB_TYPE_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 20 }}
        renderItem={({ item }) => (
          <Chip
            label={item}
            selected={activeFilter === item}
            onPress={() => handleFilterChange(item)}
          />
        )}
      />

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
});
