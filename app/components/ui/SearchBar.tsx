import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search jobs, companies...',
  onClear,
  style,
  autoFocus = false,
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius['2xl'],
        },
        style,
      ]}
    >
      <Search size={18} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={autoFocus}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily.regular,
            fontSize: theme.typography.fontSize.base,
          },
        ]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.clearBtn, { backgroundColor: theme.colors.muted }]}>
              <X size={12} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  input: { flex: 1 },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
