import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FruitItem {
  id: number;
  emoji: string;
  name: string;
  x: number;
  y: Animated.Value;
  xOffset: Animated.Value;
  points: number;
  isBomb: boolean;
  sliced: boolean;
}

const FRUIT_TYPES = [
  { emoji: '🍉', name: 'Watermelon', points: 15 },
  { emoji: '🍊', name: 'Orange', points: 10 },
  { emoji: '🍍', name: 'Pineapple', points: 20 },
  { emoji: '🍎', name: 'Apple', points: 10 },
  { emoji: '🍌', name: 'Banana', points: 15 },
  { emoji: '🍓', name: 'Strawberry', points: 25 },
];

interface FruitSlicerProps {
  room: any;
  user: any;
  onExit: () => void;
}

export default function FruitSlicerScreen({ room, user, onExit }: FruitSlicerProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [slashPoints, setSlashPoints] = useState<{ x: number; y: number }[]>([]);

  const fruitCounter = useRef(0);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  // 60-Second Game Countdown
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Fruit Spawner
  useEffect(() => {
    if (gameOver) return;
    const spawner = setInterval(() => {
      spawnFruit();
    }, 900);
    return () => clearInterval(spawner);
  }, [gameOver]);

  const spawnFruit = () => {
    fruitCounter.current += 1;
    const isBomb = Math.random() < 0.22; // 22% bomb chance
    const fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

    const startX = 40 + Math.random() * (SCREEN_WIDTH - 120);
    const startY = new Animated.Value(SCREEN_HEIGHT * 0.7);
    const xOffset = new Animated.Value(startX);

    const newFruit: FruitItem = {
      id: fruitCounter.current,
      emoji: isBomb ? '💣' : fruitType.emoji,
      name: isBomb ? 'Bomb' : fruitType.name,
      x: startX,
      y: startY,
      xOffset,
      points: isBomb ? -50 : fruitType.points,
      isBomb,
      sliced: false,
    };

    setFruits((prev) => [...prev.slice(-8), newFruit]);

    // Arc Physics: launch upward then drop
    const peakY = SCREEN_HEIGHT * 0.2 + Math.random() * 80;
    const targetX = startX + (Math.random() * 80 - 40);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(startY, {
          toValue: peakY,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(xOffset, {
          toValue: (startX + targetX) / 2,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(startY, {
          toValue: SCREEN_HEIGHT + 80,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(xOffset, {
          toValue: targetX,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setFruits((current) => current.filter((f) => f.id !== newFruit.id));
    });
  };

  // Slice Fruit Handler
  const sliceFruit = (fruitId: number) => {
    setFruits((prev) =>
      prev.map((f) => {
        if (f.id === fruitId && !f.sliced) {
          if (f.isBomb) {
            setScore((s) => Math.max(0, s - 50));
            setCombo(1);
          } else {
            const addPoints = f.points * combo;
            setScore((s) => s + addPoints);
            setCombo((c) => Math.min(5, c + 1));
          }
          return { ...f, sliced: true };
        }
        return f;
      })
    );
  };

  // Touch Swipe Gesture Responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setSlashPoints((prev) => [...prev.slice(-4), { x: pageX, y: pageY }]);

        // Check intersection with active fruits
        fruits.forEach((fruit) => {
          if (!fruit.sliced) {
            const currentY = (fruit.y as any)._value || SCREEN_HEIGHT * 0.5;
            const currentX = (fruit.xOffset as any)._value || fruit.x;
            const dist = Math.hypot(pageX - currentX, pageY - currentY);
            if (dist < 48) {
              sliceFruit(fruit.id);
            }
          }
        });
      },
      onPanResponderRelease: () => {
        setSlashPoints([]);
      },
    })
  ).current;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#02160e',
        position: 'relative',
        overflow: 'hidden',
      }}
      {...panResponder.panHandlers}
    >
      {/* Top Game Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: '#032417',
          borderBottomWidth: 1,
          borderBottomColor: '#0b4a35',
        }}
      >
        <TouchableOpacity
          onPress={onExit}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#053120',
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

        {/* Timer */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>
            {currentLang === 'ta' ? 'மீதமுள்ள நேரம்' : 'TIME LEFT'}
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '900',
              color: timeLeft <= 10 ? '#ef4444' : '#10b981',
            }}
          >
            {timeLeft}s
          </Text>
        </View>

        {/* Score & Combo */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="trophy" size={14} color="#facc15" />
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#facc15' }}>
              {score}
            </Text>
          </View>
          {combo > 1 && (
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#34d399' }}>
              Combo x{combo} 🔥
            </Text>
          )}
        </View>
      </View>

      {/* Arena Title Badge */}
      <View
        style={{
          alignSelf: 'center',
          marginTop: 12,
          backgroundColor: '#042719',
          paddingHorizontal: 14,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#0b4a35',
        }}
      >
        <Text style={{ color: '#34d399', fontSize: 11, fontWeight: '800' }}>
          🍉 {room.title || 'Fruit Slicer 60s Blitz'} • ₹{room.prizePool} Prize
        </Text>
      </View>

      {/* Floating Fruit Elements */}
      {fruits.map((fruit) => (
        <Animated.View
          key={fruit.id}
          style={{
            position: 'absolute',
            transform: [{ translateX: fruit.xOffset }, { translateY: fruit.y }],
            opacity: fruit.sliced ? 0.3 : 1,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => sliceFruit(fruit.id)}
            style={{
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: fruit.sliced ? 24 : 44 }}>
              {fruit.sliced ? '✨' : fruit.emoji}
            </Text>
            {fruit.sliced && !fruit.isBomb && (
              <Text
                style={{
                  position: 'absolute',
                  top: -12,
                  color: '#facc15',
                  fontWeight: '900',
                  fontSize: 16,
                }}
              >
                +{fruit.points * combo}
              </Text>
            )}
            {fruit.sliced && fruit.isBomb && (
              <Text
                style={{
                  position: 'absolute',
                  top: -12,
                  color: '#ef4444',
                  fontWeight: '900',
                  fontSize: 16,
                }}
              >
                -50 💥
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Game Over Screen */}
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
              backgroundColor: '#042217',
              borderRadius: 24,
              padding: 28,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#0b4a35',
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🏆</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff' }}>
              {currentLang === 'ta' ? 'ஆட்டம் முடிந்தது!' : 'Match Finished!'}
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {currentLang === 'ta' ? 'உங்கள் இறுதி மதிப்பெண்' : 'Your Final Score'}
            </Text>

            <View
              style={{
                marginVertical: 20,
                backgroundColor: '#073322',
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
                backgroundColor: '#10b981',
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#000000', fontSize: 15, fontWeight: '900' }}>
                {currentLang === 'ta' ? 'வெற்றி விவரங்கள் காண்க' : 'Claim Results & Exit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
