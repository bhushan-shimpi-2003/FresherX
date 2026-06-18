import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useResumeStore } from '../../../../store/resume.store';
import { useUserStore } from '../../../../store/user.store';
import { generateResumePDF } from '../../../../utils/resumePdfGenerator';
import { useTheme } from '../../../../theme';
import { palette } from '../../../../constants/colors';
import {
  Download, Plus, Trash2, ArrowRight, ArrowLeft,
  User, Mail, Phone, MapPin, Link, FileText,
  BookOpen, Briefcase, Layers, Award, Code2, CheckCircle2,
} from 'lucide-react-native';
import { profileApi } from '../../../../services/api/profile.api';
import { Button } from '../../../../components/ui/Button';

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Summary', icon: FileText },
  { label: 'Education', icon: BookOpen },
  { label: 'Experience', icon: Briefcase },
  { label: 'Projects', icon: Layers },
  { label: 'Skills', icon: Code2 },
  { label: 'Extras', icon: Award },
];

export default function ResumeBuilderScreen() {
  const theme = useTheme();
  const { profile, setProfile } = useUserStore();
  const store = useResumeStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // ── Data isolation guard ──
  useEffect(() => {
    if (!profile) return;
    if (store.data.email && store.data.email !== profile.email) store.reset();
    if (profile.resumeData) {
      store.updateData(profile.resumeData);
    } else if (!store.data.fullName) {
      store.updateData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: profile.skills?.join(', ') || '',
      });
    }
  }, [profile]);

  const handleDownload = async () => {
    setIsSaving(true);
    try {
      if (profile?.userId) {
        const updated = await profileApi.updateProfile(profile.userId, { resumeData: store.data });
        setProfile(updated);
      }
      await generateResumePDF(store.data);
    } catch (err) {
      console.log('Failed to generate resume', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => { if (currentStep < 7) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // Styled input helper
  const SInput = ({
    placeholder, value, onChangeText, multiline = false, icon: Icon,
  }: any) => (
    <View style={[sStyles.inputWrap, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {Icon && <Icon size={16} color={theme.colors.textMuted} style={{ marginRight: 10, flexShrink: 0 }} />}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[
          sStyles.input,
          { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular },
          multiline && { height: 90, textAlignVertical: 'top', paddingTop: 4 },
        ]}
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="1">
            <SInput placeholder="Full Name" value={store.data.fullName} onChangeText={(t: string) => store.updateData({ fullName: t })} icon={User} />
            <SInput placeholder="Email Address" value={store.data.email} onChangeText={(t: string) => store.updateData({ email: t })} icon={Mail} />
            <SInput placeholder="Phone Number" value={store.data.phone} onChangeText={(t: string) => store.updateData({ phone: t })} icon={Phone} />
            <SInput placeholder="City, Country (e.g. Pune, India)" value={store.data.location} onChangeText={(t: string) => store.updateData({ location: t })} icon={MapPin} />
            <SInput placeholder="LinkedIn URL (optional)" value={store.data.linkedin} onChangeText={(t: string) => store.updateData({ linkedin: t })} icon={Link} />
            <SInput placeholder="Portfolio URL (optional)" value={store.data.portfolio} onChangeText={(t: string) => store.updateData({ portfolio: t })} icon={Link} />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="2">
            <Text style={[sStyles.fieldHint, { color: theme.colors.textMuted }]}>
              Write 2–3 lines about who you are, your key skills, and your career goal.
            </Text>
            <SInput placeholder="e.g. Final-year B.Tech student passionate about full-stack development…" value={store.data.summary} onChangeText={(t: string) => store.updateData({ summary: t })} multiline />
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="3">
            {store.data.education.map((edu, index) => (
              <View key={edu.id} style={[sStyles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={sStyles.cardHeader}>
                  <Text style={[sStyles.cardBadge, { color: theme.colors.primary, backgroundColor: theme.colors.primary + '15' }]}>
                    #{index + 1}
                  </Text>
                  <TouchableOpacity onPress={() => store.removeEducation(edu.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <SInput placeholder="Institution Name" value={edu.institution} onChangeText={(t: string) => { const a = [...store.data.education]; a[index].institution = t; store.updateData({ education: a }); }} icon={BookOpen} />
                <SInput placeholder="Degree (e.g. B.Tech)" value={edu.degree} onChangeText={(t: string) => { const a = [...store.data.education]; a[index].degree = t; store.updateData({ education: a }); }} icon={Award} />
                <SInput placeholder="Year (e.g. 2020 – 2024)" value={edu.year} onChangeText={(t: string) => { const a = [...store.data.education]; a[index].year = t; store.updateData({ education: a }); }} icon={FileText} />
                <SInput placeholder="CGPA / Percentage" value={edu.score} onChangeText={(t: string) => { const a = [...store.data.education]; a[index].score = t; store.updateData({ education: a }); }} icon={CheckCircle2} />
              </View>
            ))}
            <TouchableOpacity
              style={[sStyles.addBtn, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]}
              onPress={() => store.addEducation({ id: Date.now().toString(), institution: '', degree: '', year: '', score: '' })}
            >
              <Plus size={16} color={theme.colors.primary} />
              <Text style={[sStyles.addBtnText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }]}>Add Education</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="4">
            {store.data.experience.map((exp, index) => (
              <View key={exp.id} style={[sStyles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={sStyles.cardHeader}>
                  <Text style={[sStyles.cardBadge, { color: palette.warning, backgroundColor: palette.warningBg }]}>#{index + 1}</Text>
                  <TouchableOpacity onPress={() => store.removeExperience(exp.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <SInput placeholder="Company Name" value={exp.company} onChangeText={(t: string) => { const a = [...store.data.experience]; a[index].company = t; store.updateData({ experience: a }); }} icon={Briefcase} />
                <SInput placeholder="Your Role / Title" value={exp.role} onChangeText={(t: string) => { const a = [...store.data.experience]; a[index].role = t; store.updateData({ experience: a }); }} icon={User} />
                <SInput placeholder="Duration (e.g. Jan 2023 – Present)" value={exp.duration} onChangeText={(t: string) => { const a = [...store.data.experience]; a[index].duration = t; store.updateData({ experience: a }); }} icon={FileText} />
                <SInput placeholder="What did you achieve? (bullet points work great)" value={exp.description} onChangeText={(t: string) => { const a = [...store.data.experience]; a[index].description = t; store.updateData({ experience: a }); }} multiline />
              </View>
            ))}
            <TouchableOpacity
              style={[sStyles.addBtn, { borderColor: palette.warning, backgroundColor: palette.warningBg }]}
              onPress={() => store.addExperience({ id: Date.now().toString(), company: '', role: '', duration: '', description: '' })}
            >
              <Plus size={16} color={palette.warning} />
              <Text style={[sStyles.addBtnText, { color: palette.warning, fontFamily: theme.typography.fontFamily.semiBold }]}>Add Experience</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 5:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="5">
            {store.data.projects.map((proj, index) => (
              <View key={proj.id} style={[sStyles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={sStyles.cardHeader}>
                  <Text style={[sStyles.cardBadge, { color: palette.accent, backgroundColor: palette.successBg }]}>#{index + 1}</Text>
                  <TouchableOpacity onPress={() => store.removeProject(proj.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <SInput placeholder="Project Name" value={proj.name} onChangeText={(t: string) => { const a = [...store.data.projects]; a[index].name = t; store.updateData({ projects: a }); }} icon={Layers} />
                <SInput placeholder="GitHub / Live Link (optional)" value={proj.link} onChangeText={(t: string) => { const a = [...store.data.projects]; a[index].link = t; store.updateData({ projects: a }); }} icon={Link} />
                <SInput placeholder="Brief description and tech stack used" value={proj.description} onChangeText={(t: string) => { const a = [...store.data.projects]; a[index].description = t; store.updateData({ projects: a }); }} multiline />
              </View>
            ))}
            <TouchableOpacity
              style={[sStyles.addBtn, { borderColor: palette.accent, backgroundColor: palette.successBg }]}
              onPress={() => store.addProject({ id: Date.now().toString(), name: '', description: '', link: '' })}
            >
              <Plus size={16} color={palette.accent} />
              <Text style={[sStyles.addBtnText, { color: palette.accent, fontFamily: theme.typography.fontFamily.semiBold }]}>Add Project</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 6:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="6">
            <Text style={[sStyles.fieldHint, { color: theme.colors.textMuted }]}>
              Separate skills with commas. Recruiters scan for keywords, so be specific!
            </Text>
            <SInput placeholder="React Native, TypeScript, Node.js, PostgreSQL…" value={store.data.skills} onChangeText={(t: string) => store.updateData({ skills: t })} multiline />
            {store.data.skills?.length > 0 && (
              <View style={sStyles.pillWrap}>
                {store.data.skills.split(',').filter(s => s.trim()).map((s, i) => (
                  <View key={i} style={[sStyles.pill, { backgroundColor: theme.colors.primary + '18' }]}>
                    <Text style={[sStyles.pillText, { color: theme.colors.primary }]}>{s.trim()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        );
      case 7:
        return (
          <Animated.View entering={FadeInRight.duration(300)} key="7">
            <Text style={[sStyles.fieldLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>Hobbies & Interests</Text>
            <Text style={[sStyles.fieldHint, { color: theme.colors.textMuted }]}>Optional — adds a human touch to your resume.</Text>
            <SInput placeholder="Reading, Open-source, Travel…" value={store.data.hobbies} onChangeText={(t: string) => store.updateData({ hobbies: t })} multiline />

            <Text style={[sStyles.fieldLabel, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold, marginTop: 20 }]}>Certifications</Text>
            {store.data.certifications?.map((cert, index) => (
              <View key={cert.id} style={[sStyles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={sStyles.cardHeader}>
                  <Text style={[sStyles.cardBadge, { color: palette.info, backgroundColor: palette.infoBg }]}>#{index + 1}</Text>
                  <TouchableOpacity onPress={() => store.removeCertification(cert.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <SInput placeholder="Certification Name" value={cert.name} onChangeText={(t: string) => { const a = [...store.data.certifications]; a[index].name = t; store.updateData({ certifications: a }); }} icon={Award} />
                <SInput placeholder="Issuing Body (e.g. Coursera, Google)" value={cert.issuer} onChangeText={(t: string) => { const a = [...store.data.certifications]; a[index].issuer = t; store.updateData({ certifications: a }); }} icon={CheckCircle2} />
                <SInput placeholder="Year (e.g. 2024)" value={cert.year} onChangeText={(t: string) => { const a = [...store.data.certifications]; a[index].year = t; store.updateData({ certifications: a }); }} icon={FileText} />
              </View>
            ))}
            <TouchableOpacity
              style={[sStyles.addBtn, { borderColor: palette.info, backgroundColor: palette.infoBg }]}
              onPress={() => store.addCertification({ id: Date.now().toString(), name: '', issuer: '', year: '' })}
            >
              <Plus size={16} color={palette.info} />
              <Text style={[sStyles.addBtnText, { color: palette.info, fontFamily: theme.typography.fontFamily.semiBold }]}>Add Certification</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / 7) * 100;
  const StepIcon = STEPS[currentStep - 1]?.icon ?? FileText;

  return (
    <SafeAreaView style={[sStyles.safe, { backgroundColor: theme.colors.background }]}>
      {/* ── Header ── */}
      <View style={[sStyles.headerGrad, { backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
        {/* Title row */}
        <View style={sStyles.headerRow}>
          <View>
            <Text style={[sStyles.headerTitle, { color: theme.colors.text }]}>Resume Builder</Text>
            <Text style={[sStyles.headerSub, { color: theme.colors.textSecondary }]}>
              Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.label}
            </Text>
          </View>
          <View style={[sStyles.stepIconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
            <StepIcon size={22} color={theme.colors.primary} />
          </View>
        </View>

        {/* Step dots */}
        <View style={sStyles.dotsRow}>
          {STEPS.map((_, i) => {
            const done = i + 1 < currentStep;
            const active = i + 1 === currentStep;
            return (
              <View
                key={i}
                style={[
                  sStyles.dot,
                  { backgroundColor: theme.colors.border },
                  active && [sStyles.dotActive, { backgroundColor: theme.colors.primary }],
                  done && [sStyles.dotDone, { backgroundColor: theme.colors.primary + '25' }],
                ]}
              >
                {done && <CheckCircle2 size={10} color={theme.colors.primary} strokeWidth={3} />}
              </View>
            );
          })}
        </View>

        {/* Progress bar */}
        <View style={[sStyles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <View style={[sStyles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
        </View>
      </View>

      {/* ── Step Content ── */}
      <ScrollView
        contentContainerStyle={sStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step card */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[sStyles.stepCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
          <View style={sStyles.stepCardHeader}>
            <View style={[sStyles.stepIconSmall, { backgroundColor: theme.colors.primary + '15' }]}>
              <StepIcon size={16} color={theme.colors.primary} />
            </View>
            <Text style={[sStyles.stepTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {STEPS[currentStep - 1]?.label}
            </Text>
          </View>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* ── Footer Buttons ── */}
      <View style={[sStyles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <View style={sStyles.btnRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              style={[sStyles.backBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            >
              <ArrowLeft size={18} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {currentStep < 7 ? (
            <Button
              label="Continue"
              onPress={handleNext}
              rightIcon={<ArrowRight size={18} color="#fff" />}
              style={{ flex: 1, height: 48, borderRadius: 14 }}
            />
          ) : (
            <Button
              label={isSaving ? 'Saving…' : 'Download PDF'}
              onPress={handleDownload}
              loading={isSaving}
              leftIcon={!isSaving ? <Download size={18} color="#fff" /> : undefined}
              style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: palette.accent }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const sStyles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Header ──
  headerGrad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  stepIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dot: {
    width: 24, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { width: 36 },
  dotDone: { width: 24 },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  // ── Body ──
  scroll: { padding: 16, paddingBottom: 120 },
  stepCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  stepCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  stepIconSmall: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 17, letterSpacing: -0.3 },

  // ── Inputs ──
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 12,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 10 },
  fieldLabel: { fontSize: 15, marginBottom: 4 },
  fieldHint: { fontSize: 12, lineHeight: 18, marginBottom: 12 },

  // ── Cards (education / experience / project) ──
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardBadge: { fontSize: 11, fontFamily: 'Inter_700Bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },

  // ── Add button ──
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 14, marginTop: 4 },
  addBtnText: { fontSize: 14 },

  // ── Skills pills ──
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // ── Footer ──
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
  btnRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
});
