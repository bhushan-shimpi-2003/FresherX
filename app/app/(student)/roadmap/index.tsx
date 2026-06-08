import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Map, Sparkles, Target, BookOpen, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function CareerRoadmapScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [targetRole, setTargetRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const generateRoadmap = () => {
    if (!targetRole.trim()) return;
    setIsGenerating(true);
    // Simulate AI API call
    setTimeout(() => {
      setRoadmap({
        targetRole,
        phases: [
          {
            title: "Phase 1: Foundations",
            description: `Master the core concepts required for ${targetRole}.`,
            milestones: ["Understand core syntax", "Build 2 simple projects"]
          },
          {
            title: "Phase 2: Advanced Concepts",
            description: "Dive deep into specialized frameworks and architecture.",
            milestones: ["Learn state management", "Implement API integration"]
          },
          {
            title: "Phase 3: Interview Prep",
            description: "Prepare for technical interviews and build a portfolio.",
            milestones: ["Solve 50 coding challenges", "Deploy a full-stack app"]
          }
        ]
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          AI Career Roadmap
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {!roadmap ? (
          <Animated.View entering={FadeInDown} style={styles.inputSection}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <Map size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              Map Your Career Journey
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Enter your dream role, and our AI will generate a personalized step-by-step learning path for you.
            </Text>

            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Target size={20} color={theme.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="e.g. Frontend Developer"
                placeholderTextColor={theme.colors.textMuted}
                value={targetRole}
                onChangeText={setTargetRole}
              />
            </View>

            <Button
              label="Generate Roadmap"
              variant="primary"
              leftIcon={<Sparkles size={18} color="#FFF" />}
              onPress={generateRoadmap}
              loading={isGenerating}
              disabled={!targetRole.trim()}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp}>
            <View style={styles.roadmapHeader}>
              <Text style={[styles.roadmapRole, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                {roadmap.targetRole} Roadmap
              </Text>
              <Button label="Regenerate" variant="outline" size="sm" onPress={() => setRoadmap(null)} />
            </View>

            <View style={styles.timeline}>
              {roadmap.phases.map((phase: any, index: number) => (
                <View key={index} style={styles.phaseItem}>
                  <View style={[styles.phaseDot, { backgroundColor: theme.colors.primary }]} />
                  {index !== roadmap.phases.length - 1 && (
                    <View style={[styles.phaseLine, { backgroundColor: theme.colors.border }]} />
                  )}
                  
                  <View style={[styles.phaseCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.phaseTitle, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                      {phase.title}
                    </Text>
                    <Text style={[styles.phaseDesc, { color: theme.colors.textSecondary }]}>
                      {phase.description}
                    </Text>
                    
                    <View style={styles.milestones}>
                      {phase.milestones.map((ms: string, idx: number) => (
                        <View key={idx} style={styles.milestoneRow}>
                          <CheckCircle size={14} color={theme.colors.success} />
                          <Text style={[styles.milestoneText, { color: theme.colors.text }]}>{ms}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18 },
  container: { padding: 20, flexGrow: 1 },
  inputSection: { alignItems: 'center', paddingTop: 40 },
  iconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1, width: '100%', marginBottom: 16, gap: 12 },
  input: { flex: 1, fontSize: 16 },
  roadmapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  roadmapRole: { fontSize: 22, flex: 1 },
  timeline: { paddingLeft: 10 },
  phaseItem: { position: 'relative', paddingLeft: 30, paddingBottom: 32 },
  phaseDot: { position: 'absolute', left: -6, top: 0, width: 14, height: 14, borderRadius: 7, zIndex: 10 },
  phaseLine: { position: 'absolute', left: 0, top: 14, bottom: 0, width: 2 },
  phaseCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  phaseTitle: { fontSize: 16, marginBottom: 8 },
  phaseDesc: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  milestones: { gap: 8 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  milestoneText: { fontSize: 14 },
});
