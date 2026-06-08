import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      
      if (status === 'unauthenticated' && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (status === 'authenticated' && user) {
        // Only redirect from index or auth group to prevent interrupting deep links
        if (pathname === '/' || inAuthGroup) {
          if (user.role === 'student') router.replace('/(student)/home');
          else if (user.role === 'recruiter') router.replace('/(recruiter)/dashboard');
          else if (user.role === 'admin') router.replace('/(admin)/dashboard');
        }
      }
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
