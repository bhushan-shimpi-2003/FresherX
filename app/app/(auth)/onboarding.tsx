import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import api from '../../services/axios';

const ROLES = [
  'Software Developer', 'Frontend Engineer', 'Backend Engineer',
  'Full Stack Engineer', 'Mobile Developer', 'Data Scientist',
  'UI/UX Designer', 'Product Manager', 'QA Engineer'
];

const SKILLS = [
  'React', 'React Native', 'Node.js', 'Python', 'Java', 'C++',
  'JavaScript', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'Figma'
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedRoles.length === 0) {
        Alert.alert('Hold up', 'Please select at least one role to continue.');
        return;
      }
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.put('/profile', {
        preferredRoles: selectedRoles,
        skills: selectedSkills,
        onboardingComplete: true
      });
      // Route based on role
      router.replace('/(student)/(tabs)/home');
    } catch (err) {
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center' }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Check size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold, textAlign: 'center' }]}>
            {step === 1 ? 'What roles are you looking for?' : 'What are your top skills?'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center' }]}>
            {step === 1 ? 'Select the roles that match your career goals.' : 'Select the skills you want to highlight to recruiters.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.grid}>
          {(step === 1 ? ROLES : SKILLS).map(item => {
            const isSelected = (step === 1 ? selectedRoles : selectedSkills).includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.card,
                  { 
                    backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => step === 1 ? toggleRole(item) : toggleSkill(item)}
              >
                <Text style={{ 
                  color: isSelected ? theme.colors.primary : theme.colors.text,
                  fontFamily: isSelected ? theme.typography.fontFamily.bold : theme.typography.fontFamily.medium 
                }}>
                  {item}
                </Text>
                {isSelected && <Check size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Button
          label={step === 1 ? "Next" : "Complete Setup"}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, marginBottom: 8, marginTop: 16 },
  subtitle: { fontSize: 16, marginBottom: 16, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: '45%',
    flexGrow: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  }
});
