import { Stack } from 'expo-router';

export default function StudentRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" />
      {/* 
        All other directories in (student) like 'job', 'onboarding', 'chat' 
        will implicitly inherit this Stack layout behavior automatically! 
      */}
    </Stack>
  );
}
