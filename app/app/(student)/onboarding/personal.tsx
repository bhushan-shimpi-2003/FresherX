import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useUserStore } from '../../../store/user.store';
import { useAuthStore } from '../../../store/auth.store';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  bio: z.string().max(250, 'Bio must be less than 250 characters').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function PersonalInfoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateProfile, isLoading } = useUserStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '', bio: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const result = await updateProfile(user.id, data);
    if (result.success) {
      router.push('/(student)/onboarding/education');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '25%' }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>Step 1 of 4</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
              Let's get to know you
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              Basic information to set up your student profile.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Full Name" placeholder="John Doe" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fullName?.message} />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Phone Number (Optional)" placeholder="+91 9876543210" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} />
              )}
            />
            <Controller
              control={control}
              name="bio"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label="Short Bio (Optional)" placeholder="I am a passionate developer looking for..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.bio?.message} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' } as any} />
              )}
            />
          </Animated.View>

          <View style={styles.footer}>
            <Button
              label="Next Step"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              rightIcon={<ChevronRight size={20} color="#FFF" />}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, flexGrow: 1 },
  progressContainer: { marginBottom: 32, gap: 8 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { fontSize: 12, textAlign: 'right' },
  header: { marginBottom: 32, gap: 8 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16, flex: 1 },
  footer: { marginTop: 32, paddingBottom: 20 },
});
