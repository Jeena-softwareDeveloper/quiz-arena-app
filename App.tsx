import './global.css';
import './src/i18n';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  NotoSansTamil_400Regular,
  NotoSansTamil_500Medium,
  NotoSansTamil_600SemiBold,
  NotoSansTamil_700Bold,
} from '@expo-google-fonts/noto-sans-tamil';
import { authService, getStoredToken } from './src/services';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuizArenaScreen from './src/screens/QuizArenaScreen';
import FruitSlicerScreen from './src/screens/FruitSlicerScreen';
import KnifeHitScreen from './src/screens/KnifeHitScreen';
import SpeedMathScreen from './src/screens/SpeedMathScreen';
import SpeedLudoScreen from './src/screens/SpeedLudoScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

function AppContent() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'ARENA' | 'WALLET' | 'PROFILE'>('HOME');
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Load High-Definition Google Fonts for Native & Web
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSansTamil_400Regular,
    NotoSansTamil_500Medium,
    NotoSansTamil_600SemiBold,
    NotoSansTamil_700Bold,
  });

  // Smooth Screen Fade Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchScreen = (screen: 'HOME' | 'ARENA' | 'WALLET' | 'PROFILE') => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setCurrentScreen(screen);
  };

  // Auto-authenticate on startup if valid JWT token is stored
  useEffect(() => {
    const verifyStoredToken = async () => {
      const token = getStoredToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const user = await authService.getMe();
        setCurrentUser(user);
        if (user?.languagePreference) {
          i18n.changeLanguage(user.languagePreference.toLowerCase());
        }
      } catch (err) {
        authService.logout();
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyStoredToken();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    switchScreen('HOME');
  };

  const handleJoinRoom = (room: any) => {
    setActiveRoom(room);
    switchScreen('ARENA');
  };

  const handleExitArena = () => {
    setActiveRoom(null);
    switchScreen('HOME');
  };

  const handleBalanceUpdated = (newBalance: number) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, walletBalance: newBalance });
    }
  };

  if (checkingAuth || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#010805', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="flash" size={44} color="#10b981" />
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#6ee7b7', marginTop: 14, letterSpacing: 0.5 }}>
          Initializing Quiz Arena HD...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%', height: '100%', maxHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined, backgroundColor: '#010805', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <View
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100%',
          maxHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
          flex: 1,
          minHeight: 0,
          paddingTop: Platform.OS === 'ios' ? insets.top : 0,
          backgroundColor: '#03130e',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#0a3827',
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 25,
          elevation: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <StatusBar style="light" backgroundColor="#041711" translucent={false} />

        {Platform.OS === 'web' && (
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');
            html, body, #root {
              height: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background-color: #010805 !important;
            }
            body, #root, input, textarea, button, select, p, span, div, h1, h2, h3, h4, h5, h6 {
              font-family: 'Plus Jakarta Sans', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Hide scrollbars across Chrome, Safari, Edge and Firefox for pure mobile app feel */
            ::-webkit-scrollbar {
              display: none !important;
              width: 0px !important;
              height: 0px !important;
              background: transparent !important;
            }
            * {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          `}} />
        )}

        <Animated.View style={{ flex: 1, minHeight: 0, height: '100%', opacity: fadeAnim, overflow: 'hidden' }}>
          {!currentUser ? (
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          ) : currentScreen === 'HOME' ? (
            <HomeScreen
              user={currentUser}
              onJoinRoom={handleJoinRoom}
              onOpenWallet={() => switchScreen('WALLET')}
              onOpenProfile={() => switchScreen('PROFILE')}
              onBalanceUpdated={handleBalanceUpdated}
              onLanguageChange={(lang) => {
                setCurrentUser({ ...currentUser, languagePreference: lang.toUpperCase() });
                i18n.changeLanguage(lang);
              }}
            />
          ) : currentScreen === 'ARENA' && activeRoom ? (
            activeRoom.category === 'FRUIT_SLICER' ? (
              <FruitSlicerScreen
                room={activeRoom}
                user={currentUser}
                onExit={handleExitArena}
              />
            ) : activeRoom.category === 'KNIFE_HIT' ? (
              <KnifeHitScreen
                room={activeRoom}
                user={currentUser}
                onExit={handleExitArena}
              />
            ) : activeRoom.category === 'SPEED_MATH' ? (
              <SpeedMathScreen
                room={activeRoom}
                user={currentUser}
                onExit={handleExitArena}
              />
            ) : activeRoom.category === 'SPEED_LUDO' ? (
              <SpeedLudoScreen
                room={activeRoom}
                user={currentUser}
                onExit={handleExitArena}
              />
            ) : (
              <QuizArenaScreen
                room={activeRoom}
                user={currentUser}
                onExit={handleExitArena}
              />
            )
          ) : currentScreen === 'WALLET' ? (
            <WalletScreen
              onBack={() => switchScreen('HOME')}
              onBalanceUpdated={handleBalanceUpdated}
            />
          ) : currentScreen === 'PROFILE' ? (
            <ProfileScreen
              user={currentUser}
              onBack={() => switchScreen('HOME')}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
              onLogout={() => {
                authService.logout();
                setCurrentUser(null);
                switchScreen('HOME');
              }}
            />
          ) : null}
        </Animated.View>

        {/* Persistent Vector-Icon Mobile Bottom Navigation Bar (Cyberpunk Emerald) */}
        {currentUser && currentScreen !== 'ARENA' && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: '#020d09',
              borderTopWidth: 1,
              borderTopColor: '#072b1e',
              paddingTop: 8,
              paddingBottom: Math.max(6, Math.min(insets.bottom, 10)),
              paddingHorizontal: 16,
            }}
          >
            {/* Arenas Tab */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 2, paddingHorizontal: 16 }}
              onPress={() => switchScreen('HOME')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={currentScreen === 'HOME' ? 'game-controller' : 'game-controller-outline'}
                size={23}
                color={currentScreen === 'HOME' ? '#00ff88' : '#cbd5e1'}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: currentScreen === 'HOME' ? '900' : '600',
                  marginTop: 3,
                  color: currentScreen === 'HOME' ? '#00ff88' : '#cbd5e1',
                  letterSpacing: 0.3,
                }}
              >
                {t('arenas_tab')}
              </Text>
              {currentScreen === 'HOME' && (
                <View
                  style={{
                    width: 26,
                    height: 3,
                    backgroundColor: '#00ff88',
                    borderRadius: 2,
                    marginTop: 4,
                    shadowColor: '#00ff88',
                    shadowOpacity: 1,
                    shadowRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>

            {/* Wallet Tab */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 2, paddingHorizontal: 16 }}
              onPress={() => switchScreen('WALLET')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={currentScreen === 'WALLET' ? 'wallet' : 'wallet-outline'}
                size={23}
                color={currentScreen === 'WALLET' ? '#00ff88' : '#cbd5e1'}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: currentScreen === 'WALLET' ? '900' : '600',
                  marginTop: 3,
                  color: currentScreen === 'WALLET' ? '#00ff88' : '#cbd5e1',
                  letterSpacing: 0.3,
                }}
              >
                {t('wallet_tab')}
              </Text>
              {currentScreen === 'WALLET' && (
                <View
                  style={{
                    width: 26,
                    height: 3,
                    backgroundColor: '#00ff88',
                    borderRadius: 2,
                    marginTop: 4,
                    shadowColor: '#00ff88',
                    shadowOpacity: 1,
                    shadowRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 2, paddingHorizontal: 16 }}
              onPress={() => switchScreen('PROFILE')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={currentScreen === 'PROFILE' ? 'person' : 'person-outline'}
                size={23}
                color={currentScreen === 'PROFILE' ? '#00ff88' : '#cbd5e1'}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: currentScreen === 'PROFILE' ? '900' : '600',
                  marginTop: 3,
                  color: currentScreen === 'PROFILE' ? '#00ff88' : '#cbd5e1',
                  letterSpacing: 0.3,
                }}
              >
                {t('profile_tab')}
              </Text>
              {currentScreen === 'PROFILE' && (
                <View
                  style={{
                    width: 26,
                    height: 3,
                    backgroundColor: '#00ff88',
                    borderRadius: 2,
                    marginTop: 4,
                    shadowColor: '#00ff88',
                    shadowOpacity: 1,
                    shadowRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
