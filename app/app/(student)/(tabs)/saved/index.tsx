import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, SafeAreaView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookmarkX } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../../theme';
import { useAuthStore } from '../../../../store/auth.store';
import { useJobsStore } from '../../../../store/jobs.store';
import { JobCard } from '../../../../components/cards/JobCard';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { SearchBar } from '../../../../components/ui/SearchBar';
import { Loader } from '../../../../components/ui/Loader';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { Bookmark } from 'lucide-react-native';

export default function SavedJobsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { savedJobs, isSavedLoading, fetchSavedJobs, unsaveJob } = useJobsStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchSavedJobs(user.id);
  }, [user]);

  const filtered = savedJobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Saved Jobs" subtitle={`${savedJobs.length} saved`} />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search saved jobs..."
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />

      {isSavedLoading ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              index={index}
              onPress={() => router.push(`/(student)/job/${item.id}`)}
              onSave={() => user && unsaveJob(item.id, user.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Bookmark size={48} color={theme.colors.textMuted} />}
              title="No saved jobs"
              description="Jobs you bookmark will appear here. Start exploring!"
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
});
