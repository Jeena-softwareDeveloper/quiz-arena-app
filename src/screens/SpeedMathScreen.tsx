import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MathProblem {
  question: string;
  correctAnswer: number;
  options: number[];
}

interface SpeedMathProps {
  room: any;
  user: any;
  onExit: () => void;
}

export default function SpeedMathScreen({ room, user, onExit }: SpeedMathProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const fuseAnim = useRef(new Animated.Value(1)).current;

  // Generate dynamic math problem
  const generateProblem = (): MathProblem => {
    const ops = ['+', '-', 'x'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let correct = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 45) + 5;
      b = Math.floor(Math.random() * 45) + 5;
      correct = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * 20) + 1;
      correct = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      correct = a * b;
    }

    // Generate 3 fake options
    const options = new Set<number>([correct]);
    while (options.size < 4) {
      const delta = Math.floor(Math.random() * 9) - 4;
      const fake = correct + (delta === 0 ? 3 : delta);
      if (fake > 0) options.add(fake);
    }

    // Shuffle
    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
    return {
      question: `${a} ${op === 'x' ? '×' : op} ${b}`,
      correctAnswer: correct,
      options: shuffled,
    };
  };

  // Next Question with 3-second fuse
  const nextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    const newProb = generateProblem();
    setProblem(newProb);

    fuseAnim.setValue(1);
    Animated.timing(fuseAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        // Time ran out on this question
        setStreak(0);
        nextQuestion();
      }
    });
  };

  // 60-Second Match Countdown
  useEffect(() => {
    nextQuestion();

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
  }, []);

  const handleSelectAnswer = (ans: number) => {
    if (selectedOption !== null || !problem || gameOver) return;

    setSelectedOption(ans);
    fuseAnim.stopAnimation();

    if (ans === problem.correctAnswer) {
      setIsCorrect(true);
      const points = 10 + streak * 2;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
    } else {
      setIsCorrect(false);
      setStreak(0);
    }

    setTimeout(() => {
      nextQuestion();
    }, 350);
  };

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
          borderBottomColor: '#4a3500',
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

        {/* Timer */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>TIME</Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '900',
              color: timeLeft <= 10 ? '#ef4444' : '#f59e0b',
            }}
          >
            {timeLeft}s
          </Text>
        </View>

        {/* Score & Streak */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#facc15' }}>{score}</Text>
          {streak > 1 && (
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#fbbf24' }}>
              Streak {streak}x 🔥
            </Text>
          )}
        </View>
      </View>

      {/* Fuse Bar */}
      <View style={{ width: '100%', height: 4, backgroundColor: '#241903' }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: '#f59e0b',
            width: fuseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {/* Math Question Board */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#1a1202',
            borderRadius: 24,
            paddingVertical: 36,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: isCorrect === true ? '#f59e0b' : isCorrect === false ? '#ef4444' : '#4a3500',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 44, fontWeight: '900', color: '#ffffff', letterSpacing: 2 }}>
            {problem?.question} = ?
          </Text>
        </View>
      </View>

      {/* 4 Answer Options (2x2 Grid) */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {problem?.options.slice(0, 2).map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isRight = opt === problem.correctAnswer;
            let bgColor = '#201603';
            let borderColor = '#4a3500';

            if (selectedOption !== null) {
              if (isRight) {
                bgColor = '#b45309';
                borderColor = '#f59e0b';
              } else if (isSelected) {
                bgColor = '#b91c1c';
                borderColor = '#ef4444';
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectAnswer(opt)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: bgColor,
                  borderWidth: 1.5,
                  borderColor,
                  paddingVertical: 18,
                  borderRadius: 18,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#ffffff' }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {problem?.options.slice(2, 4).map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isRight = opt === problem.correctAnswer;
            let bgColor = '#201603';
            let borderColor = '#4a3500';

            if (selectedOption !== null) {
              if (isRight) {
                bgColor = '#b45309';
                borderColor = '#f59e0b';
              } else if (isSelected) {
                bgColor = '#b91c1c';
                borderColor = '#ef4444';
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectAnswer(opt)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: bgColor,
                  borderWidth: 1.5,
                  borderColor,
                  paddingVertical: 18,
                  borderRadius: 18,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#ffffff' }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
              borderColor: '#4a3500',
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 8 }}>⚡</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff' }}>
              {currentLang === 'ta' ? 'நேரம் முடிந்தது!' : 'Time Up!'}
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {currentLang === 'ta' ? 'கணித மதிப்பெண்' : 'Math Score'}
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
                {currentLang === 'ta' ? 'முடிவுகள் காண்க' : 'Claim Results'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

