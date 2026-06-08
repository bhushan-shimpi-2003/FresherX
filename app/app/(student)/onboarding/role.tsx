import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';

export default function RoleSelectionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter' | null>(null);

  const handleNext = () => {
    if (selectedRole === 'student') {
      router.push('/(student)/onboarding/personal');
    } else if (selectedRole === 'recruiter') {
      router.push('/(recruiter)/onboarding/company-setup');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            How do you want to use FresherX?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            We'll tailor your experience based on your choice. You can't change this later.
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {/* Student Option */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card, borderColor: selectedRole === 'student' ? theme.colors.primary : theme.colors.border },
                selectedRole === 'student' && styles.selectedCard,
              ]}
              onPress={() => setSelectedRole('student')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <GraduationCap size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                  I'm a Student / Fresher
                </Text>
                <Text style={[styles.optionDesc, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  Find entry-level jobs, internships, and build your career profile.
                </Text>
              </View>
              <View style={[styles.radio, { borderColor: selectedRole === 'student' ? theme.colors.primary : theme.colors.border }]}>
                {selectedRole === 'student' && <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Recruiter Option */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card, borderColor: selectedRole === 'recruiter' ? theme.colors.accent : theme.colors.border },
                selectedRole === 'recruiter' && styles.selectedCard,
              ]}
              onPress={() => setSelectedRole('recruiter')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
                <Briefcase size={32} color={theme.colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                  I'm a Recruiter
                </Text>
                <Text style={[styles.optionDesc, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
                  Post jobs, hire top entry-level talent, and manage applications.
                </Text>
              </View>
              <View style={[styles.radio, { borderColor: selectedRole === 'recruiter' ? theme.colors.accent : theme.colors.border }]}>
                {selectedRole === 'recruiter' && <View style={[styles.radioInner, { backgroundColor: theme.colors.accent }]} />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedRole}
            onPress={handleNext}
            rightIcon={<ChevronRight size={20} color="#FFF" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { marginTop: 40, marginBottom: 40, gap: 12 },
  title: { fontSize: 32, letterSpacing: -0.5, lineHeight: 40 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  optionsContainer: { gap: 16, flex: 1 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    gap: 16,
  },
  selectedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 4 },
  optionTitle: { fontSize: 18 },
  optionDesc: { fontSize: 14, lineHeight: 20 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  footer: { paddingBottom: 20 },
});
