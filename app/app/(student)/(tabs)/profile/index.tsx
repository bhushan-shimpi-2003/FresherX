import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Edit3, FileText, Settings, ChevronRight, GraduationCap,
  Briefcase, MapPin, Mail, Phone, Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../theme';
import { useAuthStore } from '../../../../store/auth.store';
import { useUserStore } from '../../../../store/user.store';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { palette } from '../../../../constants/colors';
import { calculateProfileCompleteness } from '../../../../utils/profileScorer';

export default function StudentProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useUserStore();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user]);

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploading(true);
      const file = result.assets[0];

      // In a real implementation, upload to Supabase Storage via backend.
      // Simulating the update for now:
      if (user) {
        await updateProfile(user.id, {
          resumeUrl: `https://dummy.url/${file.name}`,
          resumeName: file.name,
        });
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const completionPct = calculateProfileCompleteness(profile);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header gradient */}
        <LinearGradient
          colors={[theme.colors.primary + '30', 'transparent']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <ScreenHeader
          title="Profile"
          subtitle="Manage your account"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/(student)/settings')}>
              <Settings size={22} color={theme.colors.text} />
            </TouchableOpacity>
          }
        />

        {/* Profile card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Avatar uri={profile?.avatar} name={profile?.fullName ?? user?.email} size={72} />
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {profile?.fullName ?? 'Your Name'}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            {user?.email}
          </Text>

          {/* Completion bar */}
          <View style={styles.completionArea}>
            <View style={styles.completionRow}>
              <Text style={[styles.completionLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                Profile Strength
              </Text>
              <Text style={[styles.completionPct, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                {completionPct}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressFill, { width: `${completionPct}%`, backgroundColor: theme.colors.primary }]} />
            </View>
          </View>

          <Button
            label="Edit Profile"
            variant="outline"
            size="sm"
            leftIcon={<Edit3 size={15} color={theme.colors.primary} />}
            onPress={() => router.push('/(student)/edit-profile')}
          />
        </Animated.View>

        {/* Info section */}
        {profile && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.infoSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {[
              { Icon: GraduationCap, label: profile.college ?? 'Add college', muted: !profile.college },
              { Icon: Briefcase, label: profile.degree ?? 'Add degree', muted: !profile.degree },
              { Icon: Mail, label: user?.email ?? '', muted: false },
              { Icon: Phone, label: profile.phone ?? 'Add phone', muted: !profile.phone },
            ].map(({ Icon, label, muted }) => (
              <View key={label} style={styles.infoRow}>
                <Icon size={16} color={muted ? theme.colors.textMuted : theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: muted ? theme.colors.textMuted : theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
                  {label}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
              Skills
            </Text>
            <View style={styles.skills}>
              {profile.skills.map((skill) => <Badge key={skill} label={skill} variant="primary" />)}
            </View>
          </Animated.View>
        )}

        {/* Resume */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleUploadResume} disabled={uploading}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                Resume
              </Text>
              {uploading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <ChevronRight size={16} color={theme.colors.textMuted} />
              )}
            </View>
            {profile?.resumeUrl ? (
              <View>
                <View style={[styles.resumeItem, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '25', marginTop: 12 }]}>
                  <FileText size={18} color={theme.colors.primary} />
                  <Text style={[styles.resumeName, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]} numberOfLines={1}>
                    {profile.resumeName ?? 'resume.pdf'}
                  </Text>
                </View>
                <Button 
                  label="Analyze Resume with AI" 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Star size={15} color={theme.colors.primary} />}
                  onPress={() => alert('AI Review triggered!')}
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <Text style={[styles.emptyResume, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, marginTop: 12 }]}>
                Tap here to upload a PDF resume
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  profileCard: {
    alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 10,
  },
  name: { fontSize: 20, letterSpacing: -0.3 },
  email: { fontSize: 14 },
  completionArea: { width: '100%', gap: 8 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  completionLabel: { fontSize: 12 },
  completionPct: { fontSize: 12 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  infoSection: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, flex: 1 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resumeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  resumeName: { fontSize: 14, flex: 1 },
  emptyResume: { fontSize: 14 },
});
