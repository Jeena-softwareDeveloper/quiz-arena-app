import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface LiveCountdownProps {
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  onExpire?: () => void;
  compact?: boolean;
  variant?: 'dark' | 'light';
}

/**
 * Real-Time Dynamic Ticking Countdown Timer Component
 * Updates every 1,000ms with smooth pulsating live beacon and monospace typography
 */
export const LiveCountdown: React.FC<LiveCountdownProps> = ({
  scheduledStartTime,
  scheduledEndTime,
  onExpire,
  compact = false,
  variant = 'dark',
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const calculateRemaining = () => {
    if (!scheduledStartTime) return 0;
    return Math.max(0, Math.floor((new Date(scheduledStartTime).getTime() - Date.now()) / 1000));
  };

  const getEndTimeMs = () => {
    if (scheduledEndTime) return new Date(scheduledEndTime).getTime();
    if (scheduledStartTime) return new Date(scheduledStartTime).getTime() + 15 * 60 * 1000;
    return 0;
  };

  const [remainingSec, setRemainingSec] = useState<number>(calculateRemaining);

  // Smooth breathing pulse animation for the live countdown indicator dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (!scheduledStartTime) return;

    // Immediately calculate remaining time
    setRemainingSec(calculateRemaining());

    // Active ticking interval every second (1,000ms)
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(scheduledStartTime).getTime() - Date.now()) / 1000));
      setRemainingSec(diff);

      if (diff <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledStartTime]);

  if (!scheduledStartTime) return null;

  // When time has arrived / tournament is live or closed
  if (remainingSec <= 0) {
    const isClosed = Date.now() > getEndTimeMs();

    if (variant === 'dark') {
      return (
        <View style={styles.darkContainer}>
          <Animated.View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: isClosed ? '#ef4444' : '#10b981',
              opacity: isClosed ? 0.7 : pulseAnim,
              shadowColor: isClosed ? '#ef4444' : '#10b981',
              shadowOpacity: 0.8,
              shadowRadius: 6,
            }}
          />
          <Text
            style={{
              color: isClosed ? '#f87171' : '#34d399',
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}
          >
            {isClosed
              ? currentLang === 'ta'
                ? 'முடிவடைந்தது'
                : 'Closed'
              : currentLang === 'ta'
              ? 'இப்போதே நடக்கிறது'
              : 'Starting Now'}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.lightContainer,
          {
            backgroundColor: isClosed ? '#fef2f2' : '#ecfdf5',
            borderColor: isClosed ? '#fecaca' : '#a7f3d0',
            borderBottomColor: isClosed ? '#dc2626' : '#059669',
            borderBottomWidth: 2,
          },
        ]}
      >
        <Animated.View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: isClosed ? '#dc2626' : '#059669',
            opacity: isClosed ? 0.7 : pulseAnim,
          }}
        />
        <Text
          style={[
            styles.lightText,
            { color: isClosed ? '#991b1b' : '#065f46', fontWeight: '800' },
          ]}
        >
          {isClosed
            ? currentLang === 'ta'
              ? 'முடிவடைந்தது'
              : 'CLOSED'
            : currentLang === 'ta'
            ? 'இப்போதே நடக்கிறது'
            : 'LIVE NOW'}
        </Text>
      </View>
    );
  }

  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;

  // Monospace digital string formatting
  let formattedTime = '';
  if (hours > 0) {
    formattedTime = `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else if (minutes > 0) {
    formattedTime = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    formattedTime = `${seconds.toString().padStart(2, '0')}s`;
  }

  const isUrgent = remainingSec <= 300; // <= 5 minutes
  const isFinalMinute = remainingSec <= 60; // <= 60 seconds

  const prefix = currentLang === 'ta' ? 'தொடங்க இன்னும்: ' : 'Starts in ';

  if (variant === 'dark') {
    const textColor = isFinalMinute ? '#f87171' : isUrgent ? '#fb923c' : '#fbbf24';
    const iconColor = isFinalMinute ? '#ef4444' : isUrgent ? '#f97316' : '#f59e0b';

    return (
      <View style={styles.darkContainer}>
        {/* Pulsing Live Ticker Dot */}
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: iconColor,
            opacity: pulseAnim,
            shadowColor: iconColor,
            shadowOpacity: 0.8,
            shadowRadius: 6,
          }}
        />

        <Ionicons name="time-outline" size={13} color={iconColor} />

        <Text style={{ color: textColor, fontSize: 12, fontWeight: '700' }}>
          {!compact && prefix}
          <Text style={styles.digitalDigits}>{formattedTime}</Text>
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.lightContainer,
        {
          backgroundColor: isFinalMinute ? '#fef2f2' : isUrgent ? '#fff1f2' : '#fffbeb',
          borderColor: isFinalMinute ? '#f87171' : isUrgent ? '#fca5a5' : '#fde68a',
          borderBottomWidth: 2,
          borderBottomColor: isFinalMinute ? '#dc2626' : isUrgent ? '#e11d48' : '#d97706',
        },
      ]}
    >
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isFinalMinute ? '#dc2626' : isUrgent ? '#e11d48' : '#d97706',
          opacity: pulseAnim,
        }}
      />

      <Ionicons
        name="time-outline"
        size={11}
        color={isFinalMinute ? '#dc2626' : isUrgent ? '#e11d48' : '#b45309'}
      />

      <Text
        style={[
          styles.lightText,
          {
            color: isFinalMinute ? '#991b1b' : isUrgent ? '#9f1239' : '#92400e',
          },
        ]}
      >
        {!compact && prefix}
        <Text style={styles.digitalDigits}>{formattedTime}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  darkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  lightText: {
    fontSize: 11,
    fontWeight: '600',
  },
  digitalDigits: {
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
