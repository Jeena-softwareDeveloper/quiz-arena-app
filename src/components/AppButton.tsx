import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable Mobile Button Component
 * Clean typography with normal/medium font weight and crisp contrast
 */
export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  icon,
}) => {
  const variantStyles = {
    primary: 'bg-emerald-600 active:bg-emerald-700 shadow-sm',
    secondary: 'bg-slate-100 active:bg-slate-200 border border-slate-200',
    outline: 'bg-white active:bg-slate-50 border border-slate-300 shadow-sm',
    danger: 'bg-rose-50 active:bg-rose-100 border border-rose-200',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-slate-800',
    outline: 'text-slate-800',
    danger: 'text-rose-700',
  };

  return (
    <TouchableOpacity
      className={`py-3 px-4 rounded-xl items-center justify-center transition ${variantStyles[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#059669'} size="small" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className={`text-sm font-medium tracking-normal ${textStyles[variant]}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
