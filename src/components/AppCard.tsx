import React from 'react';
import { View } from 'react-native';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Mobile Surface Card for Light Theme
 */
export const AppCard: React.FC<AppCardProps> = ({ children, className = '' }) => {
  return (
    <View className={`bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm ${className}`}>
      {children}
    </View>
  );
};

