import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { supabase } from '../../../lib/supabase/client';
import { useAuthStore } from '../../../store/auth.store';

// Mock questions for demonstration
const MOCK_QUESTIONS = [
  { id: 1, question: "What is the primary purpose of this technology?", options: ["Frontend", "Backend", "Database", "Styling"], answer: 0 },
  { id: 2, question: "Which command installs dependencies?", options: ["npm run", "npm install", "npm build", "npm start"], answer: 1 },
  { id: 3, question: "How do you declare a constant?", options: ["var", "let", "const", "static"], answer: 2 },
  { id: 4, question: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Integration", "Apple Pie Ingredients", "Automated Process Instance"], answer: 0 },
  { id: 5, question: "Which symbol is used for strict equality in JS?", options: ["=", "==", "===", "=>"], answer: 2 },
];

export default function QuizScreen() {
  const { skill } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (index: number) => {
    setSelectedOptions(prev => ({ ...prev, [currentQuestion]: index }));
  };

  const handleNext = () => {
    if (currentQuestion < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correctCount = 0;
    MOCK_QUESTIONS.forEach((q, idx) => {
      if (selectedOptions[idx] === q.answer) correctCount++;
    });
    
    const finalScore = Math.round((correctCount / MOCK_QUESTIONS.length) * 100);
    setScore(finalScore);
    setIsFinished(true);

    if (user && finalScore >= 80) {
      // Record verification
      try {
        await supabase.from('skill_verifications').insert({
          user_id: user.id,
          skill: (skill as string).toUpperCase(),
          score: finalScore,
          passed: true,
        });
      } catch (err) {
        console.error("Failed to save verification", err);
      }
    }
  };

  if (isFinished) {
    const passed = score >= 80;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.resultContainer}>
          {passed ? (
            <CheckCircle2 size={80} color={theme.colors.success} />
          ) : (
            <XCircle size={80} color={theme.colors.error} />
          )}
          <Text style={[styles.resultTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {passed ? 'Verification Passed!' : 'Verification Failed'}
          </Text>
          <Text style={[styles.resultScore, { color: passed ? theme.colors.success : theme.colors.error, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Score: {score}%
          </Text>
          <Text style={[styles.resultDesc, { color: theme.colors.textMuted }]}>
            {passed ? `You are now a verified ${skill} developer.` : 'You need at least 80% to pass. Better luck next time!'}
          </Text>
          <Button label="Back to Profile" variant="primary" fullWidth onPress={() => router.back()} style={{ marginTop: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  const question = MOCK_QUESTIONS[currentQuestion];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {skill} Quiz
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
          Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}
        </Text>
      </View>

      <Animated.View key={currentQuestion} entering={FadeInRight} style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
          {question.question}
        </Text>
        
        <View style={styles.optionsContainer}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOptions[currentQuestion] === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelect(idx)}
                style={[
                  styles.optionCard,
                  { backgroundColor: theme.colors.card, borderColor: isSelected ? theme.colors.primary : theme.colors.border }
                ]}
              >
                <View style={[
                  styles.radio,
                  { borderColor: isSelected ? theme.colors.primary : theme.colors.border },
                  isSelected && { backgroundColor: theme.colors.primary }
                ]} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button
          label={currentQuestion === MOCK_QUESTIONS.length - 1 ? "Finish" : "Next"}
          variant="primary"
          fullWidth
          disabled={selectedOptions[currentQuestion] === undefined}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18 },
  progressContainer: { paddingHorizontal: 20, marginBottom: 24 },
  progressBar: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%' },
  progressText: { fontSize: 13, textAlign: 'right' },
  questionContainer: { flex: 1, paddingHorizontal: 20 },
  questionText: { fontSize: 20, marginBottom: 24, lineHeight: 28 },
  optionsContainer: { gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  optionText: { fontSize: 16, flex: 1 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  resultTitle: { fontSize: 28, marginTop: 24, marginBottom: 12 },
  resultScore: { fontSize: 24, marginBottom: 12 },
  resultDesc: { fontSize: 16, textAlign: 'center' },
});
