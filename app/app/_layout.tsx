import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../theme';
import { useAuthStore } from '../store/auth.store';
import { useSettingsStore } from '../store/settings.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, status, user } = useAuthStore();
  const { themeMode, loadSettings } = useSettingsStore();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    async function bootstrap() {
      await loadSettings();
      await initialize();
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded && status !== 'loading' && status !== 'idle') {
      SplashScreen.hideAsync();
      
      const inAuthGroup = segments[0] === '(auth)';
      
      const handleRouting = async () => {
        if (status === 'unauthenticated' && !inAuthGroup) {
          router.replace('/(auth)/welcome');
        } else if (status === 'authenticated' && user) {
          // Only redirect from index or auth group to prevent interrupting deep links
          if (pathname === '/' || inAuthGroup) {
            
            let hasPendingReferrer = false;
            if (Platform.OS === 'android') {
              try {
                const hasChecked = await AsyncStorage.getItem('has_checked_referrer');
                if (!hasChecked) {
                  const referrer = await Application.getInstallReferrerAsync();
                  if (referrer && referrer.includes('job_id=')) {
                    const match = referrer.match(/job_id=([^&]+)/);
                    if (match && match[1]) {
                      hasPendingReferrer = true;
                      router.replace(`/(student)/job/${match[1]}`);
                    }
                  }
                  await AsyncStorage.setItem('has_checked_referrer', 'true');
                }
              } catch (e) {
                console.warn('Failed to read install referrer', e);
              }
            }

            if (!hasPendingReferrer) {
              if (user.role === 'student') {
                if (user.onboardingComplete === false) {
                  router.replace('/(auth)/onboarding');
                } else {
                  router.replace('/(student)/home');
                }
              }
              else if (user.role === 'recruiter') router.replace('/(recruiter)/dashboard');
              else if (user.role === 'admin') router.replace('/(admin)/dashboard');
            }
          }
        }
      };

      handleRouting();
    }
  }, [fontsLoaded, status, user, segments, pathname]);

  if (!fontsLoaded) return null;

  const themeOverride = themeMode === 'system' ? null : themeMode;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider override={themeOverride}>
          <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(recruiter)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
