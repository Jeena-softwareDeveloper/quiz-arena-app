import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  dark?: boolean;
}

/**
 * Reusable Mobile Form Input
 * Supports both crisp dark cyberpunk and light themes
 */
export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  dark = true,
  style,
  ...props
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '800',
            color: dark ? '#a7f3d0' : '#334155',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 7,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: dark ? '#041d14' : '#ffffff',
            borderWidth: 1.5,
            borderColor: error ? '#f43f5e' : dark ? '#0b4a35' : '#cbd5e1',
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 13,
            fontSize: 15,
            fontWeight: '600',
            color: dark ? '#ffffff' : '#0f172a',
          },
          style,
        ]}
        placeholderTextColor={dark ? '#475569' : '#94a3b8'}
        {...props}
      />
      {error && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#f43f5e', marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
};
