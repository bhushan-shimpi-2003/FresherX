import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../../theme';
import { useJobsStore } from '../../../../store/jobs.store';
import { useAuthStore } from '../../../../store/auth.store';
import { SearchBar } from '../../../../components/ui/SearchBar';
import { Chip } from '../../../../components/ui/Chip';
import { JobCard } from '../../../../components/cards/JobCard';
import { JobCardSkeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { JOB_TYPES } from '../../../../constants/config';
import type { JobType } from '../../../../types/job.types';

const SORT_OPTIONS = ['Newest', 'Salary: High', 'Deadline'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { jobs, isLoading, hasMore, fetchJobs, fetchMoreJobs, saveJob, unsaveJob } = useJobsStore();

  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [referralAvailable, setReferralAvailable] = useState<boolean | undefined>(undefined);
  const [sort, setSort] = useState('Newest');

  const handleSearch = useCallback((text: string) => {
    setKeyword(text);
    fetchJobs({
      keyword: text || undefined,
      jobType: selectedTypes.length ? selectedTypes : undefined,
      isRemote,
      referralAvailable,
    }, true);
  }, [selectedTypes, isRemote, referralAvailable]);

  const toggleJobType = (type: JobType) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    fetchJobs({ keyword: keyword || undefined, jobType: updated.length ? updated : undefined, isRemote, referralAvailable }, true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Search Jobs" subtitle="Discover new opportunities" />
      {/* Search bar */}
      <View style={styles.topArea}>
        <SearchBar
          value={keyword}
          onChangeText={handleSearch}
          autoFocus={false}
          style={{ flex: 1 }}
        />
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary + '30' }]}>
          <SlidersHorizontal size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Job type filters */}
      <FlatList
        horizontal
        data={['Referrals', 'Remote', ...JOB_TYPES.filter(t => t !== 'Remote')]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        renderItem={({ item }) => {
          if (item === 'Referrals') {
            return (
              <Chip
                label="🤝 Referrals"
                selected={referralAvailable === true}
                onPress={() => {
                  const newVal = referralAvailable === true ? undefined : true;
                  setReferralAvailable(newVal);
                  fetchJobs({ keyword: keyword || undefined, jobType: selectedTypes.length ? selectedTypes : undefined, isRemote, referralAvailable: newVal }, true);
                }}
              />
            );
          }
          if (item === 'Remote') {
            return (
              <Chip
                label="🌐 Remote"
                selected={isRemote === true}
                onPress={() => {
                  const newVal = isRemote === true ? undefined : true;
                  setIsRemote(newVal);
                  fetchJobs({ keyword: keyword || undefined, jobType: selectedTypes.length ? selectedTypes : undefined, isRemote: newVal, referralAvailable }, true);
                }}
              />
            );
          }
          return (
            <Chip
              label={item}
              selected={selectedTypes.includes(item as JobType)}
              onPress={() => toggleJobType(item as JobType)}
            />
          );
        }}
      />

      {/* Results */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <JobCard
            job={item}
            index={index}
            onPress={() => router.push(`/(student)/job/${item.id}`)}
            onSave={() => user && (item.isSaved ? unsaveJob(item.id, user.id) : saveJob(item.id, user.id))}
          />
        )}
        ListHeaderComponent={
          keyword || selectedTypes.length > 0 || isRemote ? (
            <Text style={[styles.resultsText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              {jobs.length} results
            </Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View>{[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}</View>
          ) : (
            <EmptyState
              title={keyword ? 'No results found' : 'Search for jobs'}
              description={keyword ? 'Try different keywords or filters' : 'Enter a job title, skill, or company name'}
            />
          )
        }
        ListFooterComponent={isLoading && jobs.length > 0 ? <JobCardSkeleton /> : null}
        onEndReached={hasMore ? fetchMoreJobs : undefined}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topArea: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resultsText: { fontSize: 13, marginBottom: 12 },
});
