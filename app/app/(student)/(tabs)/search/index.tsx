import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, X, Bookmark } from 'lucide-react-native';
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
  const { jobs, appliedJobs, isLoading, hasMore, fetchJobs, fetchMoreJobs, fetchAppliedJobs, saveJob, unsaveJob } = useJobsStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'applied'>('discover');

  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [referralAvailable, setReferralAvailable] = useState<boolean | undefined>(undefined);
  const [sort, setSort] = useState('Newest');

  const [showFilters, setShowFilters] = useState(false);
  const [datePosted, setDatePosted] = useState<'24h' | '7d' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const applyAdvancedFilters = () => {
    setShowFilters(false);
    fetchJobs({
      keyword: keyword || undefined,
      jobType: selectedTypes.length ? selectedTypes : undefined,
      isRemote,
      referralAvailable,
      datePosted: datePosted === 'all' ? undefined : datePosted,
      sortBy,
      matchUserSkills: false
    }, true);
  };

  const handleSearch = useCallback((text: string) => {
    setKeyword(text);
    fetchJobs({
      keyword: text || undefined,
      jobType: selectedTypes.length ? selectedTypes : undefined,
      isRemote,
      referralAvailable,
      datePosted: datePosted === 'all' ? undefined : datePosted,
      sortBy,
      matchUserSkills: false
    }, true);
  }, [selectedTypes, isRemote, referralAvailable, datePosted, sortBy]);

  const toggleJobType = (type: JobType) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    fetchJobs({ 
      keyword: keyword || undefined, 
      jobType: updated.length ? updated : undefined, 
      isRemote, 
      referralAvailable,
      datePosted: datePosted === 'all' ? undefined : datePosted,
      sortBy,
      matchUserSkills: false 
    }, true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader 
        title="Jobs" 
        subtitle={activeTab === 'discover' ? "Discover new opportunities" : "Your submitted applications"} 
        rightAction={
          <TouchableOpacity 
            onPress={() => router.push('/(student)/(tabs)/saved')} 
            style={{ padding: 8, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Bookmark size={20} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      
      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.colors.border, flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'discover' ? theme.colors.primary : 'transparent' }}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={{ fontFamily: theme.typography.fontFamily.semiBold, color: activeTab === 'discover' ? '#FFF' : theme.colors.textSecondary }}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'applied' ? theme.colors.primary : 'transparent' }}
            onPress={() => {
              setActiveTab('applied');
              fetchAppliedJobs();
            }}
          >
            <Text style={{ fontFamily: theme.typography.fontFamily.semiBold, color: activeTab === 'applied' ? '#FFF' : theme.colors.textSecondary }}>Applied</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      {activeTab === 'discover' && (
        <>
          <View style={styles.topArea}>
            <SearchBar
              value={keyword}
              onChangeText={handleSearch}
              autoFocus={false}
              style={{ flex: 1 }}
            />
            <TouchableOpacity 
              style={styles.filterBtn}
              onPress={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Job type filters */}
          <FlatList
            horizontal
            data={['Remote', ...JOB_TYPES.filter(t => t !== 'Remote')]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            renderItem={({ item }) => {

              if (item === 'Remote') {
                return (
                  <Chip
                    label="🌐 Remote"
                    selected={isRemote === true}
                    onPress={() => {
                      const newVal = isRemote === true ? undefined : true;
                      setIsRemote(newVal);
                      fetchJobs({ 
                        keyword: keyword || undefined, 
                        jobType: selectedTypes.length ? selectedTypes : undefined, 
                        isRemote: newVal, 
                        referralAvailable,
                        datePosted: datePosted === 'all' ? undefined : datePosted,
                        sortBy,
                        matchUserSkills: false 
                      }, true);
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
        </>
      )}
      {/* Results */}
      <FlatList
        data={activeTab === 'discover' ? jobs : appliedJobs}
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
          activeTab === 'discover' && (keyword || selectedTypes.length > 0 || isRemote) ? (
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
              title={activeTab === 'discover' ? (keyword ? 'No results found' : 'Search for jobs') : "No applied jobs yet"}
              description={activeTab === 'discover' ? (keyword ? 'Try different keywords or filters' : 'Enter a job title, skill, or company name') : "Jobs you apply to will appear here"}
            />
          )
        }
        ListFooterComponent={isLoading && jobs.length > 0 ? <JobCardSkeleton /> : null}
        onEndReached={hasMore ? fetchMoreJobs : undefined}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />

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
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Same as theme.colors.primary + '15'
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsText: { fontSize: 13, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  filterGroupTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12, marginTop: 8 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  applyBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
