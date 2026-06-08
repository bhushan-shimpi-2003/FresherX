import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Send, ChevronLeft } from 'lucide-react-native';

export default function ReferralRequestScreen() {
  const { jobId } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    // Simulate AI API call
    setTimeout(() => {
      setMessage("Hi there,\n\nI noticed the opening for this role and I'm very interested. With my background in software development and my recent projects, I believe I could be a great fit for the team. Could we connect briefly to discuss a potential referral?\n\nBest,\n[Your Name]");
      setIsGenerating(false);
    }, 1200);
  };

  const handleSend = () => {
    // Submit referral logic
    alert('Referral request sent!');
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button variant="ghost" leftIcon={<ChevronLeft size={24} color={theme.colors.text} />} onPress={() => router.back()} />
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Request Referral</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
          Write a short, polite message to the recruiter asking for a referral.
        </Text>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            multiline
            placeholder="Write your pitch here..."
            placeholderTextColor={theme.colors.textMuted}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <Button 
            label="Generate AI Pitch" 
            variant="outline" 
            leftIcon={<Sparkles size={16} color={theme.colors.primary} />}
            onPress={handleGenerateAI}
            loading={isGenerating}
            style={{ flex: 1 }}
          />
          <Button 
            label="Send" 
            variant="primary" 
            leftIcon={<Send size={16} color="#FFF" />}
            onPress={handleSend}
            disabled={!message.trim()}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 },
  headerTitle: { fontSize: 18 },
  container: { flexGrow: 1, padding: 20 },
  inputContainer: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 200, marginBottom: 24 },
  input: { flex: 1, fontSize: 16, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 12 },
});
