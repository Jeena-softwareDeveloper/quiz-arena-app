import React from 'react';
import { View, Text } from 'react-native';

interface AppBadgeProps {
  label: string;
  variant?: 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

/**
 * Reusable Mobile Badge Component
 * Normal weight with high text visibility and contrast
 */
export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'emerald',
  size = 'md',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    amber: 'bg-amber-50 border-amber-300 text-amber-800',
    sky: 'bg-sky-50 border-sky-300 text-sky-800',
    rose: 'bg-rose-50 border-rose-300 text-rose-800',
    slate: 'bg-slate-100 border-slate-300 text-slate-800',
  };

  const textStyles = {
    emerald: 'text-emerald-800',
    amber: 'text-amber-800',
    sky: 'text-sky-800',
    rose: 'text-rose-800',
    slate: 'text-slate-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
  };

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <View className={`rounded-md border self-start ${variantStyles[variant]} ${sizeStyles[size]}`}>
      <Text className={`font-normal tracking-wide ${textSize} ${textStyles[variant]}`}>
        {label}
      </Text>
    </View>
  );
};
