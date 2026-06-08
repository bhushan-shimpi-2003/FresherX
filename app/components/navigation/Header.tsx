import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = true,
  onBack,
  rightElement,
  transparent = false,
}: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: transparent ? 'transparent' : theme.colors.background }]}>
      <View style={[styles.container, { borderBottomColor: transparent ? 'transparent' : theme.colors.border, borderBottomWidth: transparent ? 0 : 1 }]}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.center}>
          {title && (
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {rightElement}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
