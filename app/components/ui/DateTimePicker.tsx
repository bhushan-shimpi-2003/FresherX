import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, Text } from 'react-native';
import DateTimePickerNative from '@react-native-community/datetimepicker';
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
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const dateObj = value ? new Date(value) : new Date();

  // On Web, we can just use the native HTML5 input type="datetime-local"
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

  // Native iOS/Android implementation
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      // Just keep the date part, append a standard time so it parses correctly but we only care about the date
      const newStr = selectedDate.toISOString().split('T')[0];
      onChangeText(newStr);
    }
  };

  const showDatepicker = () => {
    setMode('date');
    setShow(true);
  };

  const displayValue = value ? new Date(value).toLocaleDateString() : '';

  return (
    <View>
      <TouchableOpacity onPress={showDatepicker} activeOpacity={0.8}>
        <View pointerEvents="none">
          <Input
            label={label}
            value={displayValue}
            placeholder="Select Date & Time"
            error={error}
            rightIcon={<Calendar size={20} color={theme.colors.textMuted} />}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {show && (
        <DateTimePickerNative
          testID="dateTimePicker"
          value={dateObj}
          mode={mode}
          is24Hour={true}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
