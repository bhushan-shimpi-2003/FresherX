import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useUserStore } from '../../../store/user.store';
import { useAuthStore } from '../../../store/auth.store';

const schema = z.object({
  college: z.string().min(2, 'College name is required'),
  degree: z.string().min(2, 'Degree is required'),
  branch: z.string().min(2, 'Branch/Specialization is required'),
  passingYear: z.string().regex(/^\d{4}$/, 'Enter a valid 4-digit year'),
  cgpa: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EducationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateProfile, isLoading } = useUserStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const result = await updateProfile(user.id, {
      ...data,
      passingYear: parseInt(data.passingYear, 10),
      cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
    });
    if (result.success) {
      router.push('/(student)/onboarding/skills');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '50%' }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>Step 2 of 4</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
              Academic Background
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              Recruiters use this to match you with the right opportunities.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
            <Controller control={control} name="college" render={({ field: { value, onChange, onBlur } }) => (
              <Input label="College / University *" placeholder="e.g. IIT Bombay" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.college?.message} />
            )} />
            <Controller control={control} name="degree" render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Degree *" placeholder="e.g. B.Tech, MCA, MBA" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.degree?.message} />
            )} />
            <Controller control={control} name="branch" render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Branch / Specialization *" placeholder="e.g. Computer Science" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.branch?.message} />
            )} />
            
            <View style={styles.row}>
              <Controller control={control} name="passingYear" render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Passing Year *" placeholder="e.g. 2025" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.passingYear?.message} containerStyle={styles.flex1} />
              )} />
              <Controller control={control} name="cgpa" render={({ field: { value, onChange, onBlur } }) => (
                <Input label="CGPA (Optional)" placeholder="e.g. 8.5" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.cgpa?.message} containerStyle={styles.flex1} />
              )} />
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Button label="Next Step" variant="primary" size="lg" fullWidth loading={isLoading} onPress={handleSubmit(onSubmit)} rightIcon={<ChevronRight size={20} color="#FFF" />} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  topNav: { marginHorizontal: -12, marginBottom: 8, alignItems: 'flex-start' },
  progressContainer: { marginBottom: 32, gap: 8 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { fontSize: 12, textAlign: 'right' },
  header: { marginBottom: 32, gap: 8 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16, flex: 1 },
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  footer: { marginTop: 32, paddingBottom: 20 },
});
