import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';

export default function VerifyOTPScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP, isLoading } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const token = otp.join('');
    if (token.length < 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code');
      return;
    }

    const result = await verifyOTP(email, token);
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Verification Failed', result.error ?? 'Invalid code. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View entering={FadeInDown.delay(50)}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
          <Mail size={32} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
          Verify your email
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }}>
            {email}
          </Text>
        </Text>
      </Animated.View>

      {/* OTP Input */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { if (ref) inputs.current[i] = ref; }}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), i)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: digit ? theme.colors.primary : theme.colors.border,
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily.bold,
                fontSize: 22,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actions}>
        <Button
          label="Verify"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleVerify}
        />
        <TouchableOpacity style={styles.resendBtn}>
          <Text style={[styles.resendText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Didn't get the code?{' '}
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }}>
              Resend
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  back: { marginBottom: 40 },
  header: { alignItems: 'center', marginBottom: 48, gap: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  otpRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 40 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
  },
  actions: { gap: 20 },
  resendBtn: { alignItems: 'center' },
  resendText: { fontSize: 14 },
});
