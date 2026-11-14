import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KnifeHitProps {
  room: any;
  user: any;
  onExit: () => void;
}

export default function KnifeHitScreen({ room, user, onExit }: KnifeHitProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [score, setScore] = useState(0);
  const [knivesLeft, setKnivesLeft] = useState(7);
  const [stage, setStage] = useState(1);
  const [stuckKnives, setStuckKnives] = useState<number[]>([45, 180]); // initial obstacle angles
  const [gameOver, setGameOver] = useState(false);
  const [wonStage, setWonStage] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const knifeYAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  // Rotation Animation Loop
  useEffect(() => {
    let isMounted = true;
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: Math.max(2200, 4000 - stage * 400),
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && isMounted && !gameOver) {
          startRotation();
        }
      });
    };

    rotateAnim.addListener(({ value }) => {
      currentRotation.current = value % 360;
    });

    startRotation();
    return () => {
      isMounted = false;
      rotateAnim.removeAllListeners();
    };
  }, [stage, gameOver]);

  // Shoot Knife
  const throwKnife = () => {
    if (knivesLeft <= 0 || gameOver) return;

    // Animate knife moving up
    Animated.timing(knifeYAnim, {
      toValue: -220,
      duration: 120,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      // Check collision
      // In the target's frame of reference, the knife lands at: (360 - currentRotation) % 360
      const hitAngle = Math.round((360 - currentRotation.current) % 360);

      const collision = stuckKnives.some((angle) => {
        const diff = Math.abs(angle - hitAngle);
        return diff < 18 || diff > 342;
      });

      if (collision) {
        setGameOver(true);
      } else {
        const nextKnives = knivesLeft - 1;
        setStuckKnives((prev) => [...prev, hitAngle]);
        setScore((s) => s + 15);
        setKnivesLeft(nextKnives);

        // Reset knife position
        knifeYAnim.setValue(0);

        if (nextKnives === 0) {
          // Stage Complete!
          setWonStage(true);
          setTimeout(() => {
            setStage((st) => st + 1);
            setKnivesLeft(7);
            setStuckKnives([Math.floor(Math.random() * 360)]);
            setWonStage(false);
          }, 1200);
        }
      }
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#120a01', justifyContent: 'space-between', paddingBottom: 36 }}>
      {/* Top Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: '#181002',
          borderBottomWidth: 1,
          borderBottomColor: '#4d3800',
        }}
      >
        <TouchableOpacity
          onPress={onExit}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#322300',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
          }}
        >
          <Ionicons name="arrow-back" size={16} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>
            {currentLang === 'ta' ? 'வெளியேறு' : 'Exit'}
          </Text>
        </TouchableOpacity>

        {/* Stage Badge */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>STAGE</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#f59e0b' }}>{stage}</Text>
        </View>

        {/* Score */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>SCORE</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#facc15' }}>{score}</Text>
        </View>
      </View>

      {/* Target Area */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Rotating Target Log */}
        <Animated.View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: '#78350f',
            borderWidth: 6,
            borderColor: '#92400e',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: spin }],
            position: 'relative',
          }}
        >
          <Text style={{ fontSize: 32 }}>🎯</Text>

          {/* Embedded Knives */}
          {stuckKnives.map((angle, idx) => (
            <View
              key={idx}
              style={{
                position: 'absolute',
                top: -30,
                alignItems: 'center',
                transform: [{ rotate: `${angle}deg` }, { translateY: -40 }],
              }}
            >
              <Text style={{ fontSize: 24, transform: [{ rotate: '180deg' }] }}>🔪</Text>
            </View>
          ))}
        </Animated.View>

        {wonStage && (
          <View style={{ marginTop: 20, backgroundColor: '#78350f', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ color: '#fbbf24', fontWeight: '900', fontSize: 14 }}>STAGE CLEARED! 🔥</Text>
          </View>
        )}
      </View>

      {/* Bottom Throwing Section */}
      <View style={{ alignItems: 'center', gap: 16 }}>
        {/* Animated Flying Knife */}
        <Animated.View style={{ transform: [{ translateY: knifeYAnim }] }}>
          <Text style={{ fontSize: 38 }}>🔪</Text>
        </Animated.View>

        {/* Knives Remaining Indicators */}
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: 7 }).map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 8,
                height: 20,
                borderRadius: 4,
                backgroundColor: idx < knivesLeft ? '#f59e0b' : '#1e293b',
              }}
            />
          ))}
        </View>

        {/* Tap to Throw Button */}
        <TouchableOpacity
          onPress={throwKnife}
          disabled={knivesLeft === 0 || gameOver}
          activeOpacity={0.8}
          style={{
            width: SCREEN_WIDTH - 48,
            backgroundColor: '#f59e0b',
            paddingVertical: 16,
            borderRadius: 20,
            alignItems: 'center',
            shadowColor: '#f59e0b',
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text style={{ color: '#000000', fontSize: 16, fontWeight: '900' }}>
            {currentLang === 'ta' ? 'கத்தி வீசு (TAP TO THROW)' : 'HIT TARGET 🔪'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Game Over Modal */}
      {gameOver && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 22, 14, 0.94)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 360,
              backgroundColor: '#191102',
              borderRadius: 24,
              padding: 28,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#4d3800',
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 8 }}>💥</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff' }}>
              {currentLang === 'ta' ? 'கத்தி மோதிவிட்டது!' : 'Knives Collided!'}
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {currentLang === 'ta' ? 'இறுதி ஸ்கோர்' : 'Final Score'}
            </Text>

            <View
              style={{
                marginVertical: 20,
                backgroundColor: '#362600',
                paddingHorizontal: 28,
                paddingVertical: 12,
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 36, fontWeight: '900', color: '#facc15' }}>
                {score} pts
              </Text>
            </View>

            <TouchableOpacity
              onPress={onExit}
              style={{
                width: '100%',
                backgroundColor: '#f59e0b',
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#000000', fontSize: 15, fontWeight: '900' }}>
                {currentLang === 'ta' ? 'வெளியேறு' : 'Exit Arena'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

