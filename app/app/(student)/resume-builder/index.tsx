import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Download, FileText, LayoutTemplate, Share } from 'lucide-react-native';
import { useUserStore } from '../../../store/user.store';

export default function ResumeBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useUserStore();

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsExporting(false);
      alert('Resume exported successfully as PDF!');
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          AI Resume Builder
        </Text>
        <TouchableOpacity>
          <LayoutTemplate size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          We've automatically compiled your profile data into an ATS-friendly format. Review it below and export it as a PDF.
        </Text>

        {/* Live Preview Paper */}
        <View style={[styles.previewPaper, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
          <Text style={[styles.resName, { color: '#111827' }]}>
            {profile?.fullName || 'John Doe'}
          </Text>
          <Text style={[styles.resContact, { color: '#4B5563' }]}>
            {profile?.phone || '+91 9876543210'} | {profile?.email || 'john.doe@example.com'}
          </Text>

          <View style={styles.resSection}>
            <Text style={[styles.resSectionTitle, { color: '#111827', borderBottomColor: '#E5E7EB' }]}>
              EDUCATION
            </Text>
            <Text style={[styles.resItemTitle, { color: '#1F2937' }]}>
              {profile?.college || 'University of Engineering'}
            </Text>
            <Text style={[styles.resItemDesc, { color: '#4B5563' }]}>
              {profile?.degree || 'B.Tech'} in {profile?.branch || 'Computer Science'} • {profile?.passingYear || '2025'}
            </Text>
          </View>

          <View style={styles.resSection}>
            <Text style={[styles.resSectionTitle, { color: '#111827', borderBottomColor: '#E5E7EB' }]}>
              SKILLS
            </Text>
            <Text style={[styles.resItemDesc, { color: '#4B5563' }]}>
              {profile?.skills?.length ? profile.skills.join(', ') : 'React, Node.js, TypeScript, PostgreSQL'}
            </Text>
          </View>

          <View style={styles.resSection}>
            <Text style={[styles.resSectionTitle, { color: '#111827', borderBottomColor: '#E5E7EB' }]}>
              ABOUT ME
            </Text>
            <Text style={[styles.resItemDesc, { color: '#4B5563' }]}>
              {profile?.bio || 'A passionate software developer looking to solve real-world problems and contribute to scalable products.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <Button 
          label="Export PDF" 
          variant="primary" 
          leftIcon={isExporting ? undefined : <Download size={18} color="#FFF" />}
          loading={isExporting}
          onPress={handleExportPDF}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18 },
  container: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  previewPaper: { 
    padding: 24, 
    borderRadius: 8, 
    minHeight: 450, 
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  resName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  resContact: { fontSize: 12, textAlign: 'center', marginBottom: 24 },
  resSection: { marginBottom: 20 },
  resSectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 4 },
  resItemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  resItemDesc: { fontSize: 13, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1 },
});
