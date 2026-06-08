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
import { Eye, EyeOff, Mail, Lock, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await login(data.email, data.password);
    if (!result.success) {
      setError('root', { message: result.error });
      return;
    }
    // Navigation handled by index.tsx via auth state
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

        {/* Back button */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.back}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Sign in to your FresherX account
          </Text>
        </Animated.View>

        {/* Glassmorphism Card */}
        <View style={[styles.glassCard, { backgroundColor: theme.colors.card + '80', borderColor: theme.colors.border }]}>
          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
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
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                    {showPassword
                      ? <EyeOff size={18} color={theme.colors.textMuted} />
                      : <Eye size={18} color={theme.colors.textMuted} />}
                  </TouchableOpacity>
                }
              />
            )}
          />

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Root error */}
          {errors.root && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
              <Text style={[styles.errorText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.medium }]}>
                {errors.root.message}
              </Text>
            </View>
          )}

          <Button
            label="Sign In"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </Animated.View>
        </View>

        {/* Register link */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.registerRow}>
          <Text style={[styles.registerText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={[styles.registerLink, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }]}>
              {' '}Create one
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
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 64, height: 64, marginBottom: 16 },
  title: { fontSize: 32, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center' },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  form: { gap: 8 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotText: { fontSize: 14 },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, textAlign: 'center' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  registerText: { fontSize: 15 },
  registerLink: { fontSize: 15 },
});
