import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import {
  ChevronLeft, Download, FileText, User, BookOpen, Zap, AlignLeft, Edit3, Check
} from 'lucide-react-native';
import { useUserStore } from '../../../store/user.store';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResumeBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useUserStore();

  const [isExporting, setIsExporting] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(
    profile?.bio || 'A passionate software developer looking to solve real-world problems and contribute to scalable products.'
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 48px; color: #1a1a2e; background: #fff; }
              .header { border-bottom: 3px solid #6C63FF; padding-bottom: 20px; margin-bottom: 28px; }
              .name { font-size: 30px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
              .contact { font-size: 13px; color: #64748b; margin-top: 6px; }
              .contact span { margin-right: 16px; }
              .section { margin-bottom: 24px; }
              .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6C63FF; margin-bottom: 10px; }
              .item-title { font-size: 15px; font-weight: 700; color: #1a1a2e; }
              .item-sub { font-size: 13px; color: #475569; margin-top: 3px; }
              .item-desc { font-size: 13px; color: #64748b; margin-top: 6px; line-height: 1.6; }
              .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
              .skill-tag { background: #ede9fe; color: #6C63FF; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="name">${profile?.fullName || 'John Doe'}</div>
              <div class="contact">
                <span>📧 ${profile?.email || 'john.doe@example.com'}</span>
                <span>📞 ${profile?.phone || '+91 9876543210'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">About Me</div>
              <div class="item-desc">${bio}</div>
            </div>

            <div class="section">
              <div class="section-title">Education</div>
              <div class="item-title">${profile?.college || 'University of Engineering'}</div>
              <div class="item-sub">${profile?.degree || 'B.Tech'} in ${profile?.branch || 'Computer Science'}</div>
              <div class="item-desc">Expected Graduation: ${profile?.passingYear || '2025'} &nbsp;|&nbsp; CGPA: ${profile?.cgpa || 'N/A'}</div>
            </div>

            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills-wrap">
                ${(profile?.skills?.length ? profile.skills : ['React', 'Node.js', 'TypeScript', 'PostgreSQL'])
                  .map((s: string) => `<span class="skill-tag">${s}</span>`).join('')}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Resume',
          UTI: 'com.adobe.pdf',
        });
      } else {
        alert('Sharing is not available on this device');
      }
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const completionSections = [
    { label: 'Personal Info', done: !!profile?.fullName, icon: User },
    { label: 'Education', done: !!profile?.college, icon: BookOpen },
    { label: 'Skills', done: (profile?.skills?.length ?? 0) > 0, icon: Zap },
    { label: 'Summary', done: !!bio, icon: AlignLeft },
  ];
  const completedCount = completionSections.filter(s => s.done).length;
  const completionPct = Math.round((completedCount / completionSections.length) * 100);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Resume Builder
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Completion Banner */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.completionBanner}
        >
          <View style={styles.completionTop}>
            <Text style={styles.completionLabel}>Profile Strength</Text>
            <Text style={styles.completionPct}>{completionPct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
          </View>
          <View style={styles.completionItems}>
            {completionSections.map(({ label, done, icon: Icon }) => (
              <View key={label} style={styles.completionItem}>
                <View style={[styles.completionDot, { backgroundColor: done ? '#43D9AD' : 'rgba(255,255,255,0.3)' }]}>
                  {done && <Check size={10} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={[styles.completionItemText, { opacity: done ? 1 : 0.6 }]}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Resume Preview Paper */}
        <View style={[styles.previewPaper, { shadowColor: '#000' }]}>
          {/* Name & Contact */}
          <View style={styles.paperHeader}>
            <Text style={styles.resName}>{profile?.fullName || 'Your Name'}</Text>
            <View style={styles.resContactRow}>
              <Text style={styles.resContact}>{profile?.phone || 'Phone'}</Text>
              <Text style={styles.resContactDot}>·</Text>
              <Text style={styles.resContact}>{profile?.email || 'Email'}</Text>
            </View>
            <View style={styles.divider} />
          </View>

          {/* About / Bio Section — editable */}
          <View style={styles.resSection}>
            <View style={styles.resSectionHeader}>
              <Text style={styles.resSectionTitle}>ABOUT ME</Text>
              <TouchableOpacity onPress={() => setEditingBio(!editingBio)} style={styles.editIconBtn}>
                {editingBio
                  ? <Check size={13} color="#6C63FF" strokeWidth={2.5} />
                  : <Edit3 size={13} color="#94a3b8" />
                }
              </TouchableOpacity>
            </View>
            {editingBio ? (
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                style={styles.bioInput}
                autoFocus
              />
            ) : (
              <Text style={styles.resItemDesc}>{bio}</Text>
            )}
          </View>

          {/* Education */}
          <View style={styles.resSection}>
            <Text style={styles.resSectionTitle}>EDUCATION</Text>
            <Text style={styles.resItemTitle}>{profile?.college || 'University of Engineering'}</Text>
            <Text style={styles.resItemSub}>
              {profile?.degree || 'B.Tech'} in {profile?.branch || 'Computer Science'}
            </Text>
            <Text style={styles.resItemDesc}>
              Graduating {profile?.passingYear || '2025'}
              {profile?.cgpa ? `  ·  CGPA: ${profile.cgpa}` : ''}
            </Text>
          </View>

          {/* Skills */}
          <View style={[styles.resSection, { marginBottom: 0 }]}>
            <Text style={styles.resSectionTitle}>SKILLS</Text>
            <View style={styles.skillsWrap}>
              {(profile?.skills?.length ? profile.skills : ['React', 'Node.js', 'TypeScript', 'PostgreSQL']).map((s: string, i: number) => (
                <View key={i} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          ✏️ Tap the edit icon to customise your summary before exporting.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <Button
          label={isExporting ? 'Generating PDF…' : 'Export & Share PDF'}
          variant="primary"
          leftIcon={isExporting ? undefined : <Download size={16} color="#FFF" />}
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  container: { padding: 16, paddingBottom: 40 },

  // Completion banner
  completionBanner: { borderRadius: 16, padding: 16, marginBottom: 16 },
  completionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  completionLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  completionPct: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  completionItems: { flexDirection: 'row', justifyContent: 'space-between' },
  completionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completionDot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  completionItemText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Paper
  previewPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    marginBottom: 12,
  },
  paperHeader: { marginBottom: 16 },
  resName: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5, marginBottom: 4 },
  resContactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resContact: { fontSize: 12, color: '#64748b' },
  resContactDot: { color: '#94a3b8', fontSize: 14 },
  divider: { height: 2, backgroundColor: '#6C63FF', marginTop: 12, borderRadius: 2 },

  resSection: { marginBottom: 16 },
  resSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  resSectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#6C63FF', textTransform: 'uppercase', marginBottom: 6 },
  editIconBtn: { padding: 4 },
  bioInput: {
    fontSize: 12, color: '#374151', lineHeight: 18, borderWidth: 1,
    borderColor: '#6C63FF', borderRadius: 6, padding: 8, minHeight: 60,
    textAlignVertical: 'top',
  },
  resItemTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  resItemSub: { fontSize: 12, color: '#475569', marginBottom: 3 },
  resItemDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },

  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  skillTag: { backgroundColor: '#ede9fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  skillTagText: { fontSize: 11, color: '#6C63FF', fontFamily: 'Inter_600SemiBold' },

  hint: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});
