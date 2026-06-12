import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft, MapPin, Briefcase, Clock, DollarSign, ExternalLink,
  Bookmark, Share2, Bell, Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useJobsStore } from '../../../store/jobs.store';
import { useAuthStore } from '../../../store/auth.store';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { formatSalary, formatDeadline, formatRelativeTime, getMatchColor } from '../../../utils/formatters';
import { palette } from '../../../constants/colors';
import { jobsApi } from '@/services/api/jobs.api';
import { useApplyAd } from '../../../hooks/useApplyAd';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedJob, isLoading, fetchJobById, saveJob, unsaveJob, applyJob } = useJobsStore();
  
  const { showAdIfAvailable } = useApplyAd();

  useEffect(() => {
    if (id) {
      fetchJobById(id);
      jobsApi.incrementView(id).catch(console.warn);
    }
  }, [id]);

  if (isLoading || !selectedJob) {
    return <Loader fullScreen />;
  }

  const job = selectedJob;
  const matchColor = job.matchScore ? getMatchColor(job.matchScore) : theme.colors.primary;

  const handleApply = () => {
    if (job.applyLink) {
      const onSuccess = async () => {
        try {
          await applyJob(job.id);
          Alert.alert('Success', 'Application submitted successfully! This job is now in your Applied tab.');
        } catch (err) {
          console.warn('Failed to apply', err);
        }
        Linking.openURL(job.applyLink!);
      };

      const onSkipped = () => {
        Alert.alert('Action Required', 'Please watch the short ad to continue applying for this job.');
      };

      showAdIfAvailable(onSuccess, onSkipped);
    }
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out this job: ${job.title}` });
  };

  const handleSaveToggle = () => {
    if (!user) return;
    if (job.isSaved) unsaveJob(job.id, user.id);
    else saveJob(job.id, user.id);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={[styles.iconBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Share2 size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveToggle} style={[styles.iconBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Bookmark size={18} color={job.isSaved ? theme.colors.primary : theme.colors.text} fill={job.isSaved ? theme.colors.primary : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Company hero */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.hero}>

          <Text style={[styles.jobTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            {job.title}
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 18, color: theme.colors.primary, marginTop: 8, fontFamily: theme.typography.fontFamily.semiBold }}>
            {job.companyName}
          </Text>
          <Text style={{ textAlign: 'center', color: theme.colors.textMuted, marginTop: 4, fontFamily: theme.typography.fontFamily.regular }}>
            Posted by {job.recruiter?.fullName ?? 'Unknown'}
          </Text>

          {/* Match score */}
          {job.matchScore && (
            <View style={[styles.matchRow, { backgroundColor: matchColor + '15', borderColor: matchColor + '30' }]}>
              <Star size={14} color={matchColor} fill={matchColor} />
              <Text style={[styles.matchText, { color: matchColor, fontFamily: theme.typography.fontFamily.semiBold }]}>
                {job.matchScore}% match with your profile
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick info */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.infoGrid}>
          {[
            { icon: MapPin, label: job.isRemote ? 'Remote' : job.location, color: theme.colors.info },
            { icon: Briefcase, label: job.jobType, color: theme.colors.secondary },
            { icon: DollarSign, label: formatSalary(job.salaryMin, job.salaryMax), color: theme.colors.accent },
            { icon: Clock, label: formatDeadline(job.deadline), color: theme.colors.warning },
          ].map(({ icon: Icon, label, color }) => (
            <View key={label} style={[styles.infoItem, { backgroundColor: color + '12', borderColor: color + '25' }]}>
              <Icon size={16} color={color} />
              <Text style={[styles.infoText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Skills */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Required Skills
          </Text>
          <View style={styles.skills}>
            {job.skills.map((skill, idx) => (
              <Badge key={idx} label={skill} variant="primary" />
            ))}
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Job Description
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
            {job.description}
          </Text>
        </Animated.View>

        {/* Requirements */}
        {job.requirements && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Requirements
            </Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
              {job.requirements}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Apply Button */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.applyBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}
      >
        <Text style={[styles.postedText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          Posted {formatRelativeTime(job.createdAt)}
        </Text>
        <Button
          label="Apply Now"
          variant="primary"
          size="lg"
          rightIcon={<ExternalLink size={16} color="#FFF" />}
          onPress={handleApply}
          style={{ flex: 1 }}
        />
      </Animated.View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  scroll: { paddingHorizontal: 16 },
  hero: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  jobTitle: { fontSize: 24, textAlign: 'center', lineHeight: 30, letterSpacing: -0.3 },
  matchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  matchText: { fontSize: 13 },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    flex: 1, minWidth: '45%',
  },
  infoText: { fontSize: 13 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 12 },
  sectionTitle: { fontSize: 16 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  applyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1,
  },
  postedText: { fontSize: 12 },
});
