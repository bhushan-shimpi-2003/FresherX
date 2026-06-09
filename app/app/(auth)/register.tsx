import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, Mail, Lock, User, ChevronLeft, CheckSquare, Square } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';
import { GraduationCap, Briefcase } from 'lucide-react-native';
import type { UserRole } from '../../constants/config';
import type { PosterType } from '../../types/recruiter.types';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeDPDP: z.boolean().refine((val) => val === true, { message: "You must agree to the DPDP and Privacy Policy" }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');


  const { control, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeDPDP: false
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await register(
      data.email, 
      data.password, 
      data.fullName, 
      selectedRole, 
      selectedRole === 'recruiter' ? 'JOB_POSTER' : undefined
    );
    if (!result.success) {
      setError('root', { message: result.error });
      return;
    }
    router.push({ pathname: '/(auth)/verify-otp', params: { email: data.email } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative background glow */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={[theme.colors.primary + '20', 'transparent']}
            style={{ height: 300, position: 'absolute', top: 0, left: 0, right: 0 }}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(50)}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Join FresherX today
          </Text>
        </Animated.View>

        {/* Glassmorphism Card */}
        <View style={[styles.glassCard, { backgroundColor: theme.colors.card + '80', borderColor: theme.colors.border }]}>
          {/* Segmented Control */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.roleSection}>
            <View style={[styles.segmentedControl, { backgroundColor: theme.colors.background }]}>
              <TouchableOpacity
                style={[styles.segment, selectedRole === 'student' && [styles.segmentActive, { backgroundColor: theme.colors.primary }]]}
                onPress={() => setSelectedRole('student')}
                activeOpacity={0.8}
              >
                <GraduationCap size={16} color={selectedRole === 'student' ? '#FFF' : theme.colors.textMuted} />
                <Text style={[styles.segmentText, { color: selectedRole === 'student' ? '#FFF' : theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semiBold }]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, selectedRole === 'recruiter' && [styles.segmentActive, { backgroundColor: theme.colors.primary }]]}
                onPress={() => setSelectedRole('recruiter')}
                activeOpacity={0.8}
              >
                <Briefcase size={16} color={selectedRole === 'recruiter' ? '#FFF' : theme.colors.textMuted} />
                <Text style={[styles.segmentText, { color: selectedRole === 'recruiter' ? '#FFF' : theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semiBold }]}>
                  Recruiter
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>



          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                leftIcon={<User size={18} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Email"
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon={<Mail size={18} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Password"
                placeholder="Min 8 characters"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
                  </TouchableOpacity>
                }
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Confirm Password"
                placeholder="Repeat password"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="agreeDPDP"
            render={({ field: { value, onChange } }) => (
              <View style={{ marginBottom: 16 }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} 
                  onPress={() => onChange(!value)}
                >
                  {value ? (
                    <CheckSquare size={20} color={theme.colors.primary} />
                  ) : (
                    <Square size={20} color={theme.colors.textMuted} />
                  )}
                  <Text style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                    I agree to the <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text> and consent to the collection of my data as per the <Text style={{ color: theme.colors.primary }}>DPDP Act</Text>.
                  </Text>
                </TouchableOpacity>
                {errors.agreeDPDP && (
                  <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>{errors.agreeDPDP.message}</Text>
                )}
              </View>
            )}
          />

          {errors.root && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.root.message}</Text>
            </View>
          )}

          <Button
            label="Create Account"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 8 }}
          />
        </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.loginRow}>
          <Text style={[styles.loginText, { color: theme.colors.textMuted }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }]}>
              {' '}Sign in
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 64, height: 64, marginBottom: 16 },
  title: { fontSize: 32, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center' },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    // Backdrop filter for native is tricky, but adding a faint overlay works
  },
  roleSection: { marginBottom: 24 },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { fontSize: 14 },
  form: { gap: 8 },
  errorBanner: { padding: 12, borderRadius: 10, marginBottom: 12 },
  errorText: { fontSize: 13, textAlign: 'center' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  loginText: { fontSize: 15 },
  loginLink: { fontSize: 15 },
});
