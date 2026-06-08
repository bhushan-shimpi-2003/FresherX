import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useRecruiterStore } from '../../../store/recruiter.store';
import { useAuthStore } from '../../../store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Company name is required'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  industry: z.string().min(2, 'Industry is required'),
  size: z.string().min(1, 'Company size is required'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().max(500).optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function CompanySetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { createCompany, isLoading } = useRecruiterStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', website: '', industry: '', size: '', location: '', description: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await createCompany(user.id, { ...data, description: data.description ?? '' });
      // Ensure Recruiter profile is updated to 'onboarding_complete = true' in a real app
      router.replace('/(recruiter)/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
              Setup Company
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              Tell us about your company to start posting jobs.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Company Name *" placeholder="e.g. Acme Corp" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="website"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Website" placeholder="https://acme.com" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.website?.message} />
              )}
            />
            
            <View style={styles.row}>
              <Controller control={control} name="industry" render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Industry *" placeholder="Technology" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.industry?.message} containerStyle={styles.flex1} />
              )} />
              <Controller control={control} name="size" render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Company Size *" placeholder="e.g. 50-200" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.size?.message} containerStyle={styles.flex1} />
              )} />
            </View>

            <Controller
              control={control}
              name="location"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="HQ Location *" placeholder="e.g. Bangalore" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.location?.message} />
              )}
            />
            
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Company Description" placeholder="Briefly describe what your company does..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' } as any} />
              )}
            />
          </Animated.View>

          <View style={styles.footer}>
            <Button
              label="Complete Setup"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              rightIcon={<CheckCircle2 size={20} color="#FFF" />}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, flexGrow: 1, paddingTop: 40 },
  header: { marginBottom: 32, gap: 8 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16, flex: 1 },
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  footer: { marginTop: 32, paddingBottom: 20 },
});
