import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useUserStore } from '../../../store/user.store';
import { useAuthStore } from '../../../store/auth.store';
import { JOB_TYPES } from '../../../constants/config';

export default function PreferencesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateProfile, isLoading } = useUserStore();
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Full-time']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Remote']);

  const locations = ['Remote', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleFinish = async () => {
    if (!user) return;
    const result = await updateProfile(user.id, {
      preferredJobTypes: selectedTypes,
      preferredLocations: selectedLocations,
      onboardingComplete: true,
    });
    if (result.success) {
      router.replace('/(student)/home');
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
            <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.success, width: '100%' }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.success }]}>Final Step</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            Job Preferences
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            What kind of opportunities are you looking for?
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Job Type</Text>
          <View style={styles.chipContainer}>
            {JOB_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={selectedTypes.includes(type)}
                onPress={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferred Locations</Text>
          <View style={styles.chipContainer}>
            {locations.map((loc) => (
              <Chip
                key={loc}
                label={loc}
                selected={selectedLocations.includes(loc)}
                onPress={() => toggleSelection(loc, selectedLocations, setSelectedLocations)}
              />
            ))}
          </View>
        </Animated.View>

      </ScrollView>
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button
          label="Complete Setup"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleFinish}
          rightIcon={<CheckCircle2 size={20} color="#FFF" />}
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
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
