import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { JOB_TYPES, POPULAR_SKILLS } from '../../../constants/config';
import type { CreateJobPayload } from '../../../types/job.types';

const STEPS = ['Basic Info', 'Skills', 'Compensation', 'Location'];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
  applyLink: z.string().url('Enter a valid URL'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  location: z.string().min(2, 'Enter a location'),
  deadline: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateJobScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { createJob, saveDraft, isLoading } = useRecruiterStore();

  const [step, setStep] = useState(0);
  const [selectedJobType, setSelectedJobType] = useState('Full-time');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isRemote, setIsRemote] = useState(false);
  const [referralAvailable, setReferralAvailable] = useState(false);
  const [referralSlots, setReferralSlots] = useState('');

  const { control, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', requirements: '', applyLink: '', location: '' },
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const nextStep = async () => {
    const fieldsByStep: (keyof FormData)[][] = [
      ['title', 'description', 'requirements'],
      [],
      ['salaryMin', 'salaryMax'],
      ['location', 'applyLink'],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const payload: CreateJobPayload = {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      skills: selectedSkills,
      jobType: selectedJobType as any,
      experienceLevel: 'Fresher',
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
      location: isRemote ? 'Remote' : data.location,
      isRemote,
      applyLink: data.applyLink,
      deadline: data.deadline,
      referralAvailable,
      referralSlots: referralAvailable && referralSlots ? parseInt(referralSlots) : 0,
    };

    const result = await createJob(user.id, payload);
    if (result.success) {
      Alert.alert('Posted!', 'Your job has been submitted for review.', [
        { text: 'View Posts', onPress: () => router.push('/(recruiter)/posts') },
      ]);
    } else {
      Alert.alert('Error', result.error ?? 'Failed to post job');
    }
  };

  const handleSaveDraft = handleSubmit(async (data) => {
    if (!user) return;
    await saveDraft(user.id, { title: data.title, description: data.description });
    Alert.alert('Saved', 'Draft saved successfully.');
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Post a Job
        </Text>
        <TouchableOpacity onPress={handleSaveDraft}>
          <Text style={[styles.draftBtn, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
            Save Draft
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((label, i) => {
          const isActive = i === step;
          const isCompleted = i < step;
          
          return (
            <React.Fragment key={label}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isCompleted ? theme.colors.primary : isActive ? theme.colors.primary + '20' : theme.colors.card,
                    borderColor: isCompleted || isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                  {isCompleted
                    ? <Check size={14} color="#FFF" />
                    : <Text style={[styles.stepNum, { color: isActive ? theme.colors.primary : theme.colors.textMuted }]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, { color: isActive || isCompleted ? theme.colors.primary : theme.colors.textMuted, fontFamily: isActive ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
                  {label}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: isCompleted ? theme.colors.primary : theme.colors.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card + '80', borderColor: theme.colors.border }]}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label="Job Title" placeholder="e.g. Frontend Developer" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )}
              />

              {/* Job type */}
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                Job Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {JOB_TYPES.map((type) => (
                  <Chip key={type} label={type} selected={selectedJobType === type} onPress={() => setSelectedJobType(type)} style={{ marginRight: 8 }} />
                ))}
              </ScrollView>

              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label="Description" placeholder="Describe the role, responsibilities..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: 'top' } as any} />
                )}
              />
              <Controller
                control={control}
                name="requirements"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label="Requirements" placeholder="Qualifications, experience..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.requirements?.message} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' } as any} />
                )}
              />
            </Animated.View>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                Required Skills ({selectedSkills.length} selected)
              </Text>
              <View style={styles.skillsGrid}>
                {POPULAR_SKILLS.map((skill) => (
                  <Chip key={skill} label={skill} selected={selectedSkills.includes(skill)} onPress={() => toggleSkill(skill)} />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Step 2: Compensation */}
          {step === 2 && (
            <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                Salary Range (LPA) — optional
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Controller control={control} name="salaryMin" render={({ field: { value, onChange } }) => (
                  <Input label="Min" placeholder="e.g. 3" keyboardType="numeric" value={value} onChangeText={onChange} containerStyle={{ flex: 1 }} />
                )} />
                <Controller control={control} name="salaryMax" render={({ field: { value, onChange } }) => (
                  <Input label="Max" placeholder="e.g. 8" keyboardType="numeric" value={value} onChangeText={onChange} containerStyle={{ flex: 1 }} />
                )} />
              </View>
              <Controller control={control} name="deadline" render={({ field: { value, onChange } }) => (
                <Input label="Application Deadline (optional)" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} />
              )} />
            </Animated.View>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
              <Chip
                label="🌐 This is a Remote Job"
                selected={isRemote}
                onPress={() => setIsRemote((v) => !v)}
                style={{ marginBottom: 16, alignSelf: 'flex-start' }}
              />
              <Chip
                label="🤝 Referral Available"
                selected={referralAvailable}
                onPress={() => setReferralAvailable((v) => !v)}
                style={{ marginBottom: 16, alignSelf: 'flex-start' }}
              />
              {referralAvailable && (
                <Input
                  label="Referral Slots"
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  value={referralSlots}
                  onChangeText={setReferralSlots}
                />
              )}
              {!isRemote && (
                <Controller control={control} name="location" render={({ field: { value, onChange, onBlur } }) => (
                  <Input label="Location" placeholder="City, State" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.location?.message} />
                )} />
              )}
              <Controller control={control} name="applyLink" render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Apply Link / Form URL" placeholder="https://..." keyboardType="url" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.applyLink?.message} />
              )} />
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {step < STEPS.length - 1 ? (
          <Button label="Next" variant="primary" size="lg" fullWidth rightIcon={<ChevronRight size={18} color="#FFF" />} onPress={nextStep} />
        ) : (
          <Button label="Submit Job" variant="primary" size="lg" fullWidth loading={isLoading} onPress={handleSubmit(onSubmit)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 20, letterSpacing: -0.3 },
  draftBtn: { fontSize: 15 },
  stepBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  stepNum: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  stepLabel: { fontSize: 11 },
  stepLine: { flex: 1, height: 2, marginBottom: 24, marginHorizontal: 4 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  formContainer: { padding: 24, borderRadius: 24, borderWidth: 1 },
  stepContent: { gap: 4 },
  fieldLabel: { fontSize: 14, marginBottom: 12 },
  chipRow: { marginBottom: 20 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bottomBar: { padding: 20, borderTopWidth: 1 },
});
