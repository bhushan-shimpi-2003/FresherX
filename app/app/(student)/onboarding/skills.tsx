import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useUserStore } from '../../../store/user.store';
import { useAuthStore } from '../../../store/auth.store';
import { POPULAR_SKILLS } from '../../../constants/config';

export default function SkillsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateProfile, isLoading } = useUserStore();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = async () => {
    if (!user) return;
    const result = await updateProfile(user.id, { skills: selectedSkills });
    if (result.success) {
      router.push('/(student)/onboarding/preferences');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '75%' }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>Step 3 of 4</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            Top Skills
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Select the skills you're most confident in. We'll use this to match you with jobs.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.skillsContainer}>
          {POPULAR_SKILLS.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              selected={selectedSkills.includes(skill)}
              onPress={() => toggleSkill(skill)}
            />
          ))}
        </Animated.View>

      </ScrollView>
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button
          label="Next Step"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleNext}
          disabled={selectedSkills.length === 0}
          rightIcon={<ChevronRight size={20} color="#FFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 },
  topNav: { marginHorizontal: -12, marginBottom: 8, alignItems: 'flex-start' },
  progressContainer: { marginBottom: 32, gap: 8 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { fontSize: 12, textAlign: 'right' },
  header: { marginBottom: 32, gap: 8 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
