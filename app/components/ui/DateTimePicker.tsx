import React from 'react';
import { View, Platform, Text } from 'react-native';
import { Input } from './Input';
import { useTheme } from '../../theme';
import { Calendar } from 'lucide-react-native';

interface DateTimePickerProps {
  label?: string;
  value: string; // ISO string or empty
  onChangeText: (val: string) => void;
  error?: string;
}

export function DateTimePicker({ label, value, onChangeText, error }: DateTimePickerProps) {
  const theme = useTheme();

  // On Web, we can just use the native HTML5 input type="date"
  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: 16 }}>
        {label && (
          <Text style={{ fontSize: 13, marginBottom: 8, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }}>
            {label}
          </Text>
        )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: error ? theme.colors.error : theme.colors.border,
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: 16,
          height: 54,
        }}>
          {React.createElement('input', {
            type: 'date',
            value: value,
            onChange: (e: any) => onChangeText(e.target.value),
            style: {
              flex: 1,
              height: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: theme.typography.fontSize.base,
            }
          })}
          <Calendar size={20} color={theme.colors.textMuted} style={{ marginLeft: 10 }} />
        </View>
        {error ? (
          <Text style={{ fontSize: 12, marginTop: 6, marginLeft: 4, color: theme.colors.error }}>{error}</Text>
        ) : null}
      </View>
    );
  }

  // Fallback text input for native mobile (YYYY-MM-DD)
  return (
    <View>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        error={error}
        rightIcon={<Calendar size={20} color={theme.colors.textMuted} />}
      />
    </View>
  );
}
