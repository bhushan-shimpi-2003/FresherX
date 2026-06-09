import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Edit, Trash2, Users, Eye } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { Badge } from '../../../components/ui/Badge';
import { Loader } from '../../../components/ui/Loader';
import { Job } from '../../../types/job.types';

export default function RecruiterJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { jobs, deleteJob } = useRecruiterStore();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const foundJob = jobs.find((j) => j.id === id);
    if (foundJob) setJob(foundJob);
  }, [id, jobs]);

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Are you sure you want to delete this job post? This action cannot be undone.');
      if (confirmDelete && id) {
        deleteJob(id).then((res) => {
          if (!res.success) {
            window.alert('Failed to delete job.');
          } else {
            router.back();
          }
        });
      }
    } else {
      Alert.alert('Delete Job Post', 'Are you sure you want to delete this job post? This action cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              const res = await deleteJob(id);
              if (!res.success) throw new Error();
              router.back();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete job.');
            }
          },
        },
      ]);
    }
  };

  if (!job) {
    return <Loader fullScreen />;
  }

  const statusVariant = {
    published: 'success',
    pending: 'warning',
    draft: 'default',
    rejected: 'error',
    archived: 'error',
  }[job.status] as any;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Job Details
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Edit size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Trash2 size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {job.title}
            </Text>
            <Badge label={job.status} variant={statusVariant} size="sm" dot />
          </View>
          <Text style={[styles.meta, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            {job.jobType} · {job.experienceLevel} · {job.location}
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
              <Eye size={18} color={theme.colors.primary} />
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                  {job.views ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Views</Text>
              </View>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
              <Users size={18} color={theme.colors.accent} />
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                  {job.applications ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Applications</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>Description</Text>
          <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>{job.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>Requirements</Text>
          <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>{job.requirements}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>Skills</Text>
          <View style={styles.skillsRow}>
            {job.skills.map((skill) => (
              <View key={skill} style={[styles.skillBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.skillText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  scroll: { padding: 16 },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 22, flex: 1 },
  meta: { fontSize: 14, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 12 },
  section: { marginBottom: 24, gap: 12 },
  sectionTitle: { fontSize: 18 },
  paragraph: { fontSize: 15, lineHeight: 24 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 13 },
});
