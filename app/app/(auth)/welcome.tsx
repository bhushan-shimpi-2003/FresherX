import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';
import { Briefcase, GraduationCap, Shield } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { palette } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background gradient blob */}
      <LinearGradient
        colors={[theme.colors.primary + '30', 'transparent']}
        style={styles.blob}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Logo area */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoArea}>
        <LinearGradient
          colors={palette.gradientPrimary}
          style={styles.logoCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Briefcase size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.appName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.extraBold }]}>
          FresherX
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
          Your first job, made simple
        </Text>
      </Animated.View>

      {/* Feature highlights */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.features}>
        {[
          { Icon: GraduationCap, text: 'For freshers & students', color: theme.colors.primary },
          { Icon: Briefcase, text: 'Top companies hiring now', color: theme.colors.secondary },
          { Icon: Shield, text: 'Verified recruiters only', color: theme.colors.accent },
        ].map(({ Icon, text, color }, i) => (
          <Animated.View
            key={text}
            entering={SlideInLeft.delay(300 + i * 80).springify()}
            style={[styles.featureRow, { backgroundColor: color + '12', borderColor: color + '25' }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
              <Icon size={18} color={color} />
            </View>
            <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>
              {text}
            </Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* CTA buttons */}
      <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.cta}>
        <Button
          label="Get Started"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/register')}
        />
        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold }]}>
              {' '}Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  blob: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  logoArea: { alignItems: 'center', marginBottom: 60 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: { fontSize: 38, letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: 'center' },
  features: { gap: 12, marginBottom: 'auto' },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: 15 },
  cta: { gap: 16 },
  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14 },
});
