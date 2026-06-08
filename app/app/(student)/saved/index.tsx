import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, SafeAreaView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookmarkX } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useJobsStore } from '../../../store/jobs.store';
import { JobCard } from '../../../components/cards/JobCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Loader } from '../../../components/ui/Loader';
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Saved Jobs
        </Text>
        <Text style={[styles.count, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          {savedJobs.length} saved
        </Text>
      </View>

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
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 24, letterSpacing: -0.3 },
  count: { fontSize: 13, marginTop: 4 },
});
