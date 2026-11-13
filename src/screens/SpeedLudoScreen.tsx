import React, { useState, useEffect } from 'react';
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

interface SpeedLudoProps {
  room: any;
  user: any;
  onExit: () => void;
}

export default function SpeedLudoScreen({ room, user, onExit }: SpeedLudoProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState(24);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [diceNumber, setDiceNumber] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [turnTimer, setTurnTimer] = useState(10);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [opponentPosition, setOpponentPosition] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Turn Countdown Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          // Pass turn automatically
          switchTurn();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, gameOver, turnsLeft]);

  const switchTurn = () => {
    setTurnsLeft((t) => {
      if (t <= 1) {
        setGameOver(true);
        return 0;
      }
      return t - 1;
    });

    setTurnTimer(10);
    setIsPlayerTurn((prev) => !prev);
  };

  // AI Opponent auto-play when it's their turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const delay = setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(roll);
        setOpponentScore((s) => s + roll);
        setOpponentPosition((p) => Math.min(28, p + roll));

        setTimeout(() => {
          switchTurn();
        }, 700);
      }, 900);

      return () => clearTimeout(delay);
    }
  }, [isPlayerTurn, gameOver]);

  // Roll Dice Handler
  const handleRollDice = () => {
    if (!isPlayerTurn || isRolling || gameOver) return;

    setIsRolling(true);
    let count = 0;
    const rollInterval = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 6) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(finalRoll);
        setIsRolling(false);

        // Update score & position
        setPlayerScore((s) => s + finalRoll);
        setPlayerPosition((p) => Math.min(28, p + finalRoll));

        setTimeout(() => {
          switchTurn();
        }, 800);
      }
    }, 80);
  };

  const getDiceEmoji = (num: number) => {
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[num - 1] || '🎲';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#02160e', justifyContent: 'space-between', paddingBottom: 36 }}>
      {/* Top Header */}
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

        {/* Turns Remaining */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>
            {currentLang === 'ta' ? 'சுற்றுகள் மீதம்' : 'TURNS LEFT'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#10b981' }}>
            {turnsLeft} / 24
          </Text>
        </View>

        {/* Turn Timer */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '800' }}>TIMER</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: turnTimer <= 3 ? '#ef4444' : '#facc15' }}>
            {turnTimer}s
          </Text>
        </View>
      </View>

      {/* 2-Player Versus Banner */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 }}>
        {/* Player Card */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: isPlayerTurn ? '#063f2c' : '#042217',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: isPlayerTurn ? '#10b981' : '#0b4a35',
            flex: 1,
            marginRight: 8,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Text style={{ color: '#000000', fontWeight: '900', fontSize: 14 }}>YOU</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>
            {user?.name?.split(' ')[0] || 'Player'}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#facc15', marginTop: 2 }}>
            {playerScore} pts
          </Text>
        </View>

        <Text style={{ color: '#64748b', fontWeight: '900', fontSize: 14 }}>VS</Text>

        {/* Opponent Card */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: !isPlayerTurn ? '#063f2c' : '#042217',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: !isPlayerTurn ? '#10b981' : '#0b4a35',
            flex: 1,
            marginLeft: 8,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 14 }}>RIVAL</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>Karthik</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#38bdf8', marginTop: 2 }}>
            {opponentScore} pts
          </Text>
        </View>
      </View>

      {/* Mini Turbo Track Board */}
      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#042217',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#0b4a35',
          }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
            🎲 LUDO TURBO BATTLE TRACK (HOME BASE: 28)
          </Text>

          {/* Player Progress Bar */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#34d399', fontSize: 11, fontWeight: '800' }}>Your Token</Text>
              <Text style={{ color: '#34d399', fontSize: 11, fontWeight: '800' }}>{playerPosition} / 28</Text>
            </View>
            <View style={{ height: 12, backgroundColor: '#073221', borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.min(100, (playerPosition / 28) * 100)}%`, backgroundColor: '#10b981', borderRadius: 6 }} />
            </View>
          </View>

          {/* Opponent Progress Bar */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '800' }}>Opponent Token</Text>
              <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '800' }}>{opponentPosition} / 28</Text>
            </View>
            <View style={{ height: 12, backgroundColor: '#073221', borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.min(100, (opponentPosition / 28) * 100)}%`, backgroundColor: '#3b82f6', borderRadius: 6 }} />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Dice Roll Section */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ color: isPlayerTurn ? '#34d399' : '#94a3b8', fontSize: 14, fontWeight: '900' }}>
          {isPlayerTurn ? (currentLang === 'ta' ? '👉 உங்கள் முறை! தாயக்கட்டையை உருட்டுங்கள்' : '👉 YOUR TURN! ROLL THE DICE') : (currentLang === 'ta' ? 'எதிராளி விளையாடுகிறார்...' : 'Opponent is thinking...')}
        </Text>

        {/* Big Dice Roller */}
        <TouchableOpacity
          onPress={handleRollDice}
          disabled={!isPlayerTurn || isRolling || gameOver}
          activeOpacity={0.8}
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: isPlayerTurn ? '#10b981' : '#1e293b',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: isPlayerTurn ? '#34d399' : '#334155',
            shadowColor: '#10b981',
            shadowOpacity: isPlayerTurn ? 0.6 : 0,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 50, color: isPlayerTurn ? '#000000' : '#64748b' }}>
            {getDiceEmoji(diceNumber)}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700' }}>
          {isPlayerTurn ? 'TAP DICE TO ROLL' : 'WAIT FOR OPPONENT'}
        </Text>
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
              backgroundColor: '#042217',
              borderRadius: 24,
              padding: 28,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#0b4a35',
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 8 }}>
              {playerScore >= opponentScore ? '🏆' : '🥈'}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff' }}>
              {playerScore >= opponentScore
                ? (currentLang === 'ta' ? 'நீங்கள் வென்றுவிட்டீர்கள்!' : 'YOU WON!')
                : (currentLang === 'ta' ? 'அடுத்த முறை வெல்லலாம்!' : 'Good Effort!')}
            </Text>

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#94a3b8' }}>
                Your Score: <Text style={{ color: '#facc15', fontWeight: '900' }}>{playerScore} pts</Text>
              </Text>
              <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                Opponent: <Text style={{ color: '#38bdf8', fontWeight: '900' }}>{opponentScore} pts</Text>
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
                {currentLang === 'ta' ? 'பரிசு விவரங்கள் காண்க' : 'Claim Results & Exit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
