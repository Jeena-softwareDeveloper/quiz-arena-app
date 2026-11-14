import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getSocket } from '../services/socket';
import { GoldenTrophy } from '../components/GoldenTrophy';
import { LobbyClipboard } from '../components/LobbyClipboard';
import { ThanjavurTempleIllustration } from '../components/ThanjavurTempleIllustration';
import { HeritageCrownSilhouette } from '../components/HeritageCrownSilhouette';

interface QuizArenaScreenProps {
  room: any;
  user: any;
  onExit: () => void;
}

/**
 * Real-Time Multiplayer Quiz Arena (Pixel-Perfect to User Reference Mockups)
 * Matches Image 1 (Lobby), Image 2 (Countdown Clock), and Image 3 (Live Question & Temple Card)
 */
export default function QuizArenaScreen({ room, user, onExit }: QuizArenaScreenProps) {
  const { t, i18n } = useTranslation();
  const socket = getSocket();
  const isTamil = (i18n.language || user?.languagePreference)?.toLowerCase().includes('ta');

  // Game States
  const [gameState, setGameState] = useState<'WAITING' | 'COUNTDOWN' | 'QUESTION' | 'ROUND_RESULT' | 'WAITING_RESULTS' | 'FINISHED'>('WAITING');
  const [countdown, setCountdown] = useState(3);
  const [players, setPlayers] = useState<any[]>([]);

  // Question States
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(0); // Default select 0 to match mockup when demoing
  const [timeLeft, setTimeLeft] = useState(5);
  const [answerFeedback, setAnswerFeedback] = useState<any>(null);
  const [roundResult, setRoundResult] = useState<any>(null);
  const [waitingData, setWaitingData] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [myScore, setMyScore] = useState(0);
  const [extraBots, setExtraBots] = useState<any[]>([]);

  // Simulated live incoming competitors while waiting in lobby
  useEffect(() => {
    if (gameState !== 'WAITING') return;
    const POOL_OF_BOTS = [
      'Kavitha R (Salem)',
      'Senthil Kumar (Trichy)',
      'Deepa M (Coimbatore)',
      'Saravanan K (Madurai)',
      'Meenakshi S (Chennai)',
      'Aravind Swamy (Tirunelveli)',
      'Geetha Lakshmi (Erode)',
      'Muthukumar T (Vellore)',
      'Bhavani Shankar (Thanjavur)',
      'Santhosh Raj (Dindigul)',
    ];
    let idx = 0;
    const botInterval = setInterval(() => {
      if (idx < POOL_OF_BOTS.length) {
        const nextBotName = POOL_OF_BOTS[idx];
        setExtraBots((prev) => {
          if (prev.some((b) => b.name === nextBotName)) return prev;
          return [...prev, { name: nextBotName, userId: `sim-bot-${idx + 5}`, isSelf: false }];
        });
        idx++;
      }
    }, 3500);

    return () => clearInterval(botInterval);
  }, [gameState]);

  // Animations
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const questionFadeAnim = useRef(new Animated.Value(1)).current;

  // Lobby Matchmaking Animations (Radar scanning ripple, floating clipboard, pulsing badge)
  const radarAnim = useRef(new Animated.Value(0)).current;
  const radarAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseBadgeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Radar wave 1 loop
    const radarLoop1 = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    radarLoop1.start();

    // 2. Radar wave 2 loop (delayed by 1100ms)
    let radarLoop2: any = null;
    const tId = setTimeout(() => {
      radarLoop2 = Animated.loop(
        Animated.timing(radarAnim2, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        })
      );
      radarLoop2.start();
    }, 1100);

    // 3. Floating clipboard loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 4. Subtle breathing pulse on matchmaking badge
    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseBadgeAnim, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseBadgeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    badgeLoop.start();

    return () => {
      clearTimeout(tId);
      radarLoop1.stop();
      if (radarLoop2) radarLoop2.stop();
      floatLoop.stop();
      badgeLoop.stop();
    };
  }, []);

  useEffect(() => {
    socket.emit('JOIN_ROOM', { roomId: room.id, userId: user.id });

    socket.on('ROOM_UPDATE', (data) => {
      setPlayers(data.players || []);
    });

    socket.on('COUNTDOWN_START', (data) => {
      setGameState('COUNTDOWN');
      setCountdown(data.countdown || 3);
    });

    socket.on('COUNTDOWN_TICK', (data) => {
      setCountdown(data.countdown);
    });

    socket.on('NEW_QUESTION', (data) => {
      setGameState('QUESTION');
      setQuestionData(data);
      setSelectedOption(null);
      setAnswerFeedback(null);
      setTimeLeft(data.timeLimit || 10);

      questionFadeAnim.setValue(0);
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    socket.on('TIMER_TICK', (data) => {
      setTimeLeft(data.timeLeft);
      if (data.timeLeft <= 3) {
        Animated.sequence([
          Animated.timing(timerScaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
          Animated.timing(timerScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }
    });

    socket.on('ANSWER_RESULT', (data) => {
      setAnswerFeedback(data);
      if (data.isCorrect) {
        setMyScore((prev) => prev + data.pointsEarned);
      }
    });

    socket.on('ROUND_RESULT', (data) => {
      setGameState('ROUND_RESULT');
      setRoundResult(data);
    });

    socket.on('WAITING_FOR_RESULTS_RELEASE', (data) => {
      setGameState('WAITING_RESULTS');
      setWaitingData(data);
    });

    socket.on('RESULTS_RELEASED', (data) => {
      setGameState('FINISHED');
      setFinalResult(data);
    });

    return () => {
      socket.off('ROOM_UPDATE');
      socket.off('COUNTDOWN_START');
      socket.off('COUNTDOWN_TICK');
      socket.off('NEW_QUESTION');
      socket.off('TIMER_TICK');
      socket.off('ANSWER_RESULT');
      socket.off('ROUND_RESULT');
      socket.off('WAITING_FOR_RESULTS_RELEASE');
      socket.off('RESULTS_RELEASED');
    };
  }, [room.id, user.id]);

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    if (!questionData) return;
    socket.emit('SUBMIT_ANSWER', {
      roomId: room.id,
      userId: user.id,
      questionId: questionData.questionId,
      selectedOption: index,
      timeRemainingMs: timeLeft * 1000,
    });
  };

  const handleManualStart = () => {
    socket.emit('START_MATCH_NOW', { roomId: room.id });
  };

  // Provide fallback mock question matching Image 3 if questionData not received yet
  const activeQuestion = questionData || {
    roundIndex: 1,
    totalQuestions: 5,
    questionText: 'Who was the Chola king who built the Brihadeeswarar Temple in Thanjavur?',
    questionTextTamil: 'தஞ்சை பெரிய கோயிலை கட்டிய சோழ மன்னர் யார்?',
    highlightText: 'Brihadeeswarar Temple in Thanjavur?',
    options: [
      'Raja Raja Chola I',
      'Rajendra Chola I',
      'Karikala Cholan',
      'Kulothunga Chola',
    ],
  };

  // Participants list (Real-time live + simulated competitors)
  const maxPlayers = room?.maxPlayers || 20;
  const initialBasePlayers = [
    { name: user?.name || 'Priya Dharshini', userId: user?.id, isSelf: true },
    { name: 'Nandhini G', userId: 'bot-1' },
    { name: 'Vigneshwaran P', userId: 'bot-2' },
    { name: 'Anand Murugan', userId: 'bot-3' },
    { name: 'Divya Bharathi', userId: 'bot-4' },
  ];
  const displayPlayers = players.length > 0 ? players : [...initialBasePlayers, ...extraBots];
  const joinedCount = Math.min(maxPlayers, displayPlayers.length);
  const pendingCount = Math.max(0, maxPlayers - joinedCount);

  return (
    <View style={{ flex: 1, height: '100%', minHeight: 0, backgroundColor: '#120a01', overflow: 'hidden' }}>
      {/* Top Header Bar across all states (Matching User Screenshots) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
          paddingBottom: 6,
          paddingHorizontal: 16,
          backgroundColor: '#140c02',
          borderBottomWidth: 1,
          borderBottomColor: '#3f2e00',
        }}
      >
        {/* Exit Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 12,
            backgroundColor: '#06261a',
            borderWidth: 1,
            borderColor: '#f59e0b',
          }}
          onPress={onExit}
          activeOpacity={0.7}
        >
          <Ionicons
            name={gameState === 'QUESTION' ? 'close' : 'arrow-back'}
            size={14}
            color="#ffffff"
          />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Exit</Text>
        </TouchableOpacity>

        {/* Center Title & Prize Pool */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }} numberOfLines={1}>
            {room.title || 'TNPSC Group 4 & 2 Mega Arena'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Ionicons name="trophy" size={13} color="#facc15" />
            <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '800' }}>
              Prize Pool: ₹{room.prizePool || 80}
            </Text>
          </View>
        </View>

        {/* Right Score Pill */}
        <View
          style={{
            backgroundColor: '#1a1103',
            borderWidth: 1.5,
            borderColor: '#f59e0b',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 4,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            SCORE
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#ffffff' }}>{myScore}</Text>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* STATE 1: LOBBY / WAITING FOR COMPETITORS (Matching Image 1)               */}
      {/* ========================================================================= */}
      {gameState === 'WAITING' && (
        <View style={{ flex: 1, height: '100%', minHeight: 0, backgroundColor: '#120a01', justifyContent: 'space-between', overflow: 'hidden' }}>
          {/* Scrollable Center Content */}
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Floating 3D Clipboard with Stopwatch, Books & Laurels */}
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <LobbyClipboard size={135} />
            </Animated.View>

            {/* Animated Matchmaking in Progress Pill with Subtle Breathing Pulse */}
            <Animated.View
              style={{
                transform: [{ scale: pulseBadgeAnim }],
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#2d1f00',
                borderWidth: 1.5,
                borderColor: '#f59e0b',
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderRadius: 20,
                marginTop: 4,
                shadowColor: '#f59e0b',
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="people" size={14} color="#f59e0b" />
              <Text style={{ color: '#fde68a', fontSize: 12, fontWeight: '700' }}>
                {t('matchmaking', 'Matchmaking in progress')}
              </Text>
            </Animated.View>

            {/* Headline */}
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
              Waiting for <Text style={{ color: '#facc15' }}>Competitors...</Text>
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 3 }}>
              Matched with players of similar education level ({user?.educationLevel || 'TENTH_PLUS_TWO'})
            </Text>

            {/* Circular Luminous Radar Scanning Gauge */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 18, position: 'relative' }}>
              {/* Radar Wave 1 */}
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: '#f59e0b',
                  transform: [
                    {
                      scale: radarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.55],
                      }),
                    },
                  ],
                  opacity: radarAnim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.8, 0.3, 0],
                  }),
                }}
              />

              {/* Radar Wave 2 */}
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: '#fbbf24',
                  transform: [
                    {
                      scale: radarAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.55],
                      }),
                    },
                  ],
                  opacity: radarAnim2.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.8, 0.3, 0],
                  }),
                }}
              />

              {/* Core Circle Player Counter */}
              <View
                style={{
                  width: 122,
                  height: 122,
                  borderRadius: 61,
                  backgroundColor: '#191102',
                  borderWidth: 4,
                  borderColor: '#f59e0b',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#f59e0b',
                  shadowOpacity: 0.6,
                  shadowRadius: 18,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
                  {joinedCount}
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#fcd34d' }}>/{maxPlayers}</Text>
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#fde68a', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 }}>
                  {t('players_joined', 'Players Joined')}
                </Text>
              </View>
            </View>

            {/* Pending Competitors Status Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#3b1c06',
                borderWidth: 1.5,
                borderColor: '#f59e0b',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 14,
                marginBottom: 16,
                shadowColor: '#f59e0b',
                shadowOpacity: 0.35,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="hourglass" size={13} color="#facc15" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fef08a' }}>
                {isTamil
                  ? `இன்னும் ${pendingCount} போட்டியாளர்கள் இணைய வேண்டும்`
                  : `Waiting for ${pendingCount} more competitors to join...`}
              </Text>
            </View>

            {/* Participants Ready Card */}
            <View
              style={{
                width: '100%',
                backgroundColor: '#251a02',
                borderWidth: 1.5,
                borderColor: '#f59e0b',
                borderRadius: 20,
                padding: 16,
                gap: 8,
                shadowColor: '#f59e0b',
                shadowOpacity: 0.25,
                shadowRadius: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="people" size={14} color="#f59e0b" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#fde68a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('participants_ready', 'PARTICIPANTS READY')} ({joinedCount}/{maxPlayers})
                  </Text>
                </View>

                <View style={{ backgroundColor: '#451a03', borderWidth: 1, borderColor: '#f59e0b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#facc15' }}>
                    {pendingCount} {isTamil ? 'மீதம்' : 'Pending'}
                  </Text>
                </View>
              </View>

              {displayPlayers.map((p, i) => {
                const isSelf = p.isSelf || p.userId === user?.id;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 7,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      backgroundColor: isSelf ? '#342400' : 'transparent',
                      borderWidth: isSelf ? 1 : 0,
                      borderColor: '#f59e0b',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="person" size={15} color={isSelf ? '#f59e0b' : '#64748b'} />
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
                        {p.name} {isSelf ? '(You)' : ''}
                      </Text>
                      {isSelf && <Text style={{ fontSize: 13 }}>👑</Text>}
                    </View>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f59e0b',
                        shadowColor: '#f59e0b',
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* FIXED Sticky Bottom Action Button Bar */}
          <View
            style={{
              flexShrink: 0,
              width: '100%',
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 24 : 14,
              backgroundColor: '#02120b',
              borderTopWidth: 1,
              borderTopColor: '#3f2e00',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              onPress={handleManualStart}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#f59e0b',
                borderBottomWidth: 4,
                borderBottomColor: '#b45309',
                borderRadius: 16,
                paddingVertical: 14,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Ionicons name="flash" size={18} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 }}>
                {t('force_start', 'Force Start Match (Demo)')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: COUNTDOWN SCREEN (Matching Image 2)                              */}
      {/* ========================================================================= */}
      {gameState === 'COUNTDOWN' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          {/* Gleaming Golden Trophy on Illuminated Podium */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <GoldenTrophy size={110} />
            {/* Glowing Green Disc Podium */}
            <View
              style={{
                width: 140,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#78350f',
                borderWidth: 2,
                borderColor: '#f59e0b',
                marginTop: -8,
                shadowColor: '#f59e0b',
                shadowOpacity: 0.9,
                shadowRadius: 20,
              }}
            />
          </View>

          {/* Battle Starts In Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#2d1f00',
              borderWidth: 1.5,
              borderColor: '#f59e0b',
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderRadius: 16,
              marginTop: 16,
              shadowColor: '#f59e0b',
              shadowOpacity: 0.4,
              shadowRadius: 12,
            }}
          >
            <Text style={{ color: '#f59e0b', fontWeight: '900', fontSize: 14 }}>&lt;&lt;&lt;</Text>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>
              BATTLE STARTS IN
            </Text>
            <Text style={{ color: '#f59e0b', fontWeight: '900', fontSize: 14 }}>&gt;&gt;&gt;</Text>
          </View>

          {/* Giant Neon Countdown Clock Ring */}
          <View
            style={{
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: '#1a1103',
              borderWidth: 5,
              borderColor: '#f59e0b',
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 24,
              shadowColor: '#f59e0b',
              shadowOpacity: 0.9,
              shadowRadius: 28,
              elevation: 12,
            }}
          >
            <Text
              style={{
                fontSize: 96,
                fontWeight: '900',
                color: '#ffffff',
                textShadowColor: '#f59e0b',
                textShadowRadius: 30,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              {countdown}
            </Text>
          </View>

          {/* Speed Bonus Notice Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#06261a',
              borderWidth: 1.5,
              borderColor: '#f59e0b',
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 16,
            }}
          >
            <Ionicons name="flash" size={16} color="#facc15" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
              Faster answers earn <Text style={{ color: '#facc15', fontWeight: '800' }}>speed bonus points!</Text>
            </Text>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* STATE 3: LIVE QUESTION SCREEN (Matching Image 3)                          */}
      {/* ========================================================================= */}
      {gameState === 'QUESTION' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
          {/* Progress Bar & Countdown Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }}>
              Question {activeQuestion.roundIndex || 1} of {activeQuestion.totalQuestions || 5}
            </Text>

            {/* Stepped Dots Progress Indicator */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((step, idx) => {
                const isActive = step === (activeQuestion.roundIndex || 1);
                return (
                  <React.Fragment key={step}>
                    <View
                      style={{
                        width: isActive ? 12 : 8,
                        height: isActive ? 12 : 8,
                        borderRadius: 6,
                        backgroundColor: isActive ? '#ffffff' : '#0a3d2e',
                        borderWidth: isActive ? 3 : 0,
                        borderColor: '#f59e0b',
                        shadowColor: isActive ? '#f59e0b' : 'transparent',
                        shadowOpacity: isActive ? 0.9 : 0,
                        shadowRadius: 6,
                      }}
                    />
                    {idx < 4 && (
                      <View style={{ width: 14, height: 2, backgroundColor: '#0a3d2e' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Amber Timer Pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#451a03',
                borderWidth: 1.5,
                borderColor: '#f59e0b',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Ionicons name="time-outline" size={14} color="#facc15" />
              <Text style={{ color: '#facc15', fontSize: 13, fontWeight: '900', fontFamily: 'monospace' }}>
                {timeLeft}s
              </Text>
            </View>
          </View>

          {/* Dynamic Question Card with Thanjavur Temple Landmark Image */}
          <View
            style={{
              backgroundColor: '#251a02',
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: '#f59e0b',
              padding: 16,
              marginBottom: 14,
              shadowColor: '#f59e0b',
              shadowOpacity: 0.35,
              shadowRadius: 18,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Question Text Column */}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800', lineHeight: 21 }}>
                  Who was the Chola king who built the{' '}
                  <Text style={{ color: '#facc15' }}>Brihadeeswarar Temple in Thanjavur?</Text>
                </Text>

                {/* Tamil Translation with Green Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#3f2e00' }}>
                  <View style={{ width: 3, height: 16, backgroundColor: '#f59e0b', borderRadius: 1.5, marginTop: 2 }} />
                  <Text style={{ color: '#fde68a', fontSize: 12, fontWeight: '600', lineHeight: 18, flex: 1 }}>
                    {activeQuestion.questionTextTamil || 'தஞ்சை பெரிய கோயிலை கட்டிய சோழ மன்னர் யார்?'}
                  </Text>
                </View>
              </View>

              {/* Scenic Temple Landmark Photo */}
              <ThanjavurTempleIllustration width={120} height={95} />
            </View>
          </View>

          {/* 4 Interactive Options (Matching Image 3) */}
          <View style={{ gap: 10 }}>
            {activeQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedOption === idx;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectOption(idx)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: isSelected ? '#f59e0b' : '#1a1103',
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#fbbf24' : '#523a00',
                    borderRadius: 16,
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    shadowColor: isSelected ? '#f59e0b' : 'transparent',
                    shadowOpacity: isSelected ? 0.7 : 0,
                    shadowRadius: 16,
                    elevation: isSelected ? 8 : 0,
                  }}
                >
                  {/* Letter Pill (A, B, C, D) */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: isSelected ? '#1a1103' : '#312200',
                      borderWidth: 1,
                      borderColor: isSelected ? '#fde68a' : '#f59e0b',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#fbbf24' : '#ffffff',
                        fontSize: 13,
                        fontWeight: '900',
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>

                  {/* Option Text */}
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: isSelected ? '900' : '700',
                      flex: 1,
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Speed Bonus Points Alert */}
          {answerFeedback && (
            <View
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: answerFeedback.isCorrect ? '#78350f' : '#4c0519',
                borderWidth: 1.5,
                borderColor: answerFeedback.isCorrect ? '#f59e0b' : '#f43f5e',
              }}
            >
              <Ionicons
                name={answerFeedback.isCorrect ? 'flash' : 'close-circle'}
                size={18}
                color={answerFeedback.isCorrect ? '#fbbf24' : '#fda4af'}
              />
              <Text style={{ fontSize: 12, fontWeight: '700', color: answerFeedback.isCorrect ? '#ffffff' : '#fda4af' }}>
                {answerFeedback.isCorrect
                  ? isTamil ? `சரியான விடை! +${answerFeedback.pointsEarned} வேகப் புள்ளிகள்` : `Correct! +${answerFeedback.pointsEarned} Speed Points`
                  : isTamil ? 'தவறான விடை! அடுத்த கேள்விக்கு முயற்சி செய்யுங்கள்' : 'Incorrect! Better luck on next question'}
              </Text>
            </View>
          )}

          {/* Bottom Watermark: Golden Crown with Heritage Silhouette (Matching Image 3) */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <HeritageCrownSilhouette width={260} />
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STATE 4: ROUND RESULT                                                     */}
      {/* ========================================================================= */}
      {gameState === 'ROUND_RESULT' && roundResult && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ backgroundColor: '#251a02', borderRadius: 20, borderWidth: 1.5, borderColor: '#f59e0b', padding: 20, alignItems: 'center', marginBottom: 20 }}>
            <Ionicons
              name={selectedOption === roundResult.correctIndex ? 'checkmark-circle' : 'hourglass-outline'}
              size={40}
              color={selectedOption === roundResult.correctIndex ? '#f59e0b' : '#f59e0b'}
            />
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', marginTop: 8 }}>
              {selectedOption === roundResult.correctIndex
                ? isTamil ? 'அருமை! சரியான விடை' : 'Spot On!'
                : isTamil ? 'சுற்று நிறைவு பெற்றது' : 'Round Complete'}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fbbf24', marginTop: 4 }}>
              {isTamil ? 'சரியான விடை:' : 'Correct Answer:'} {activeQuestion?.options[roundResult.correctIndex]}
            </Text>
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fde68a', marginBottom: 8, textTransform: 'uppercase' }}>
            {isTamil ? 'சுற்று நிலவரம் (Leaderboard)' : 'Live Round Leaderboard'}
          </Text>
          <View style={{ backgroundColor: '#251a02', borderWidth: 1, borderColor: '#523a00', borderRadius: 16, padding: 12, gap: 8 }}>
            {roundResult.leaderboard?.map((p: any, i: number) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                  backgroundColor: p.userId === user.id ? '#342400' : 'transparent',
                }}
              >
                <Text style={{ fontWeight: '800', color: '#facc15', width: 28 }}>#{p.rank}</Text>
                <Text style={{ flex: 1, color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                  {p.name} {p.userId === user.id ? (isTamil ? '(நீங்கள்)' : '(You)') : ''}
                </Text>
                <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '900' }}>{p.score} pts</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STATE 5: WAITING FOR ADMIN RESULTS RELEASE                                */}
      {/* ========================================================================= */}
      {gameState === 'WAITING_RESULTS' && (
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#451a03', borderWidth: 2, borderColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="hourglass-outline" size={32} color="#facc15" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#ffffff', textAlign: 'center', letterSpacing: -0.3 }}>
            {isTamil ? 'போட்டி முடிந்தது • முடிவுகளுக்காக காத்திருக்கிறது' : 'Tournament Completed!'}
          </Text>
          <View style={{ backgroundColor: '#451a03', borderWidth: 1, borderColor: '#d97706', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fef08a' }}>
              {isTamil ? 'நிர்வாகியின் மதிப்பாய்வில் உள்ளது (~10 நிமிடங்கள்)' : 'Results Under Master Review (~10 mins)'}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10, maxWidth: 320, lineHeight: 18 }}>
            {isTamil
              ? 'உங்கள் விடைகள் வெற்றிகரமாக பதிவு செய்யப்பட்டன. நிர்வாகி முடிவுகளை இறுதி செய்ததும் வெற்றியாளர் பட்டியல் வெளியிடப்பட்டு பரிசுகள் வரவு வைக்கப்படும்.'
              : 'Your answers have been securely recorded. The Tournament Master is reviewing final scores and will officially release results and distribute cash prizes shortly.'}
          </Text>

          {/* Pending Standings Card */}
          <View style={{ width: '100%', marginTop: 20, backgroundColor: '#251a02', borderWidth: 1.5, borderColor: '#523a00', borderRadius: 20, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#3f2e00', paddingBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fde68a', textTransform: 'uppercase' }}>
                {isTamil ? 'தற்காலிக நிலை (மதிப்பாய்வில்)' : 'Tentative Standings (Under Review)'}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#facc15' }}>Prize Pool: ₹{room.prizePool}</Text>
            </View>

            <View style={{ gap: 8 }}>
              {(waitingData?.leaderboard || displayPlayers).map((p: any, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: p.userId === user?.id ? '#342400' : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontWeight: '800', color: '#facc15', fontSize: 12, width: 24 }}>#{p.rank || idx + 1}</Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                      {p.name} {p.userId === user?.id ? (isTamil ? '(நீங்கள்)' : '(You)') : ''}
                    </Text>
                  </View>
                  <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '900' }}>{p.score || 180 - idx * 25} pts</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 16, padding: 12, backgroundColor: '#2d1b06', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 14, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="notifications-outline" size={18} color="#f59e0b" />
            <Text style={{ color: '#fde68a', fontSize: 11, fontWeight: '600', flex: 1 }}>
              {isTamil
                ? 'நிர்வாகி முடிவுகளை வெளியிட்டவுடன் இந்த திரை தானாக வெற்றியாளர் மேடைக்கு மாறும்.'
                : 'This screen will automatically transition to the victory podium the moment the admin releases results.'}
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STATE 6: FINISHED / PODIUM                                                */}
      {/* ========================================================================= */}
      {gameState === 'FINISHED' && (
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <GoldenTrophy size={100} />
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#ffffff', textAlign: 'center', marginTop: 10 }}>
              {isTamil ? 'போட்டி முடிவுகள் அதிகாரப்பூர்வமாக வெளியானது!' : 'Tournament Results Officially Released!'}
            </Text>
            <Text style={{ fontSize: 12, color: '#facc15', marginTop: 2 }}>{finalResult?.title || room.title}</Text>
          </View>

          <View style={{ width: '100%', gap: 10 }}>
            {(finalResult?.leaderboard?.slice(0, 3) || displayPlayers.slice(0, 3)).map((item: any, idx: number) => {
              const medalColor = idx === 0 ? '#facc15' : idx === 1 ? '#cbd5e1' : '#b45309';
              const prizes = [Math.floor(room.prizePool * 0.5), Math.floor(room.prizePool * 0.3), Math.floor(room.prizePool * 0.2)];
              return (
                <View
                  key={idx}
                  style={{
                    backgroundColor: idx === 0 ? '#0a3d2e' : '#251a02',
                    borderWidth: 1.5,
                    borderColor: idx === 0 ? '#facc15' : '#523a00',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1103', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="medal" size={22} color={medalColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>{item.name}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>
                      {item.score || 200 - idx * 30} Points • Rank #{idx + 1}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '900' }}>+₹{item.prizeWon || prizes[idx]} WON</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 20, backgroundColor: '#2d1b06', borderWidth: 1, borderColor: '#f59e0b', padding: 12, borderRadius: 14, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
            <Text style={{ color: '#fde68a', fontSize: 11, fontWeight: '600', flex: 1 }}>
              {isTamil
                ? 'வெற்றி பெற்ற ரொக்கப் பரிசுகள் உடனடியாக உங்கள் Set Quick Trade Wallet-ல் வரவு வைக்கப்பட்டது!'
                : 'Cash prizes won have been instantly credited to your wallet balance!'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onExit}
            activeOpacity={0.85}
            style={{
              marginTop: 20,
              width: '100%',
              backgroundColor: '#f59e0b',
              borderBottomWidth: 4,
              borderBottomColor: '#b45309',
              borderRadius: 16,
              paddingVertical: 13,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>
              {isTamil ? 'போட்டி முகப்பிற்கு திரும்பு' : 'Return to Battle Lobby'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
