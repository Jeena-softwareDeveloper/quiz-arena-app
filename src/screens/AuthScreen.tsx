import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services';
import { QuickTradeLogo } from '../components/QuickTradeLogo';
import { CandlestickChartBackground } from '../components/CandlestickChartBackground';
import { BitcoinBullionGraphic } from '../components/BitcoinBullionGraphic';
import { NeonWaveMesh } from '../components/NeonWaveMesh';
import { OnboardingCarousel } from '../components/OnboardingCarousel';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

type AuthStep = 'LANDING' | 'LOGIN' | 'REGISTER';

/**
 * Pixel-Perfect QuickTrade Authentication Flow
 * Implements the 3 screens from the user's reference mockup:
 * 1. Landing / Onboarding with 3D Bitcoin & Bullion graphic, "Predict Green or Red", and action pills
 * 2. Welcome Back (Sign In) with mobile number, password, social buttons, and forgot password
 * 3. Create Your Account with full name, mobile, password, confirm password, terms agreement, and ₹50 bonus
 */
export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('LANDING');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Transition Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateTo = (step: AuthStep) => {
    setErrorMsg('');
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 15,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAuthStep(step);
      slideAnim.setValue(-15);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await authService.login({ email: trimmedEmail, password });
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const data = await authService.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        educationLevel: 'GRADUATE',
        interests: ['TRADING', 'CRYPTO'],
        languagePreference: 'EN',
      });
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoPhone: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await authService.quickDemoLogin(demoPhone);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg('Failed to connect demo guest');
    } finally {
      setLoading(false);
    }
  };

  if (authStep === 'LANDING') {

    return (
      <View style={{ flex: 1, backgroundColor: '#030705', position: 'relative' }}>
        {/* Background Candlesticks & Bottom Waves */}
        <CandlestickChartBackground />
        <NeonWaveMesh />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            paddingTop: Platform.OS === 'web' ? 24 : 16,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1, justifyContent: 'space-between' }}>
            {/* Top Brand Logo */}
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <QuickTradeLogo size="lg" showTagline={true} />
            </View>

            {/* Middle Hero: Interactive Swipeable Carousel ("Predict Green or Red") */}
            <View style={{ marginVertical: 6, alignItems: 'center' }}>
              <OnboardingCarousel />
            </View>


            {/* Bottom Action Buttons */}
            <View style={{ gap: 12, marginTop: 10, zIndex: 10 }}>
              {/* Primary Glowing Neon Green Login Pill */}
              <TouchableOpacity
                onPress={() => navigateTo('LOGIN')}
                activeOpacity={0.85}
                style={{
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: '#00e676',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: '#00e676',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.65,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Ionicons name="person-outline" size={19} color="#ffffff" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 }}>
                  Login
                </Text>
              </TouchableOpacity>

              {/* Secondary Dark Translucent Register Pill */}
              <TouchableOpacity
                onPress={() => navigateTo('REGISTER')}
                activeOpacity={0.8}
                style={{
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1.2,
                  borderColor: 'rgba(255, 255, 255, 0.16)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="gift-outline" size={19} color="#ffffff" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff', letterSpacing: 0.2 }}>
                  Register (Get ₹50)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickDemo('9876543211')}
                activeOpacity={0.7}
                style={{ paddingVertical: 8, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.2 }}>
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // SCREEN 2: WELCOME BACK (LOGIN)
  // =========================================================================
  if (authStep === 'LOGIN') {
    return (
      <View style={{ flex: 1, backgroundColor: '#030705', position: 'relative' }}>
        {/* Compact Candlesticks at Top & Bottom Waves */}
        <CandlestickChartBackground compact={true} />
        <NeonWaveMesh />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            paddingTop: Platform.OS === 'web' ? 24 : 16,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1, justifyContent: 'space-between' }}>
            {/* Top Navigation Row: Back Button + Centered Logo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
              <TouchableOpacity
                onPress={() => navigateTo('LANDING')}
                activeOpacity={0.7}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>

              <QuickTradeLogo size="sm" showTagline={false} />

              <View style={{ width: 40 }} />
            </View>

            {/* Vertically Centered Login Form Card */}
            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 26 }}>
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 }}>
                  Welcome Back!
                </Text>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#94a3b8', marginTop: 6 }}>
                  Log in to your QuickTrade account
                </Text>
              </View>

              {errorMsg ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.14)',
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    padding: 12,
                    borderRadius: 14,
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={17} color="#fca5a5" />
                  <Text style={{ color: '#fca5a5', fontSize: 12.5, fontWeight: '600', flex: 1 }}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Form Input: Email Address (High-Contrast & Clear Text) */}
              <View
                style={{
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: '#0e1612',
                  borderWidth: 1.2,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  marginBottom: 14,
                }}
              >
                <Ionicons name="mail-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
                <TextInput
                  style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Form Input: Password */}
              <View
                style={{
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: '#0e1612',
                  borderWidth: 1.2,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                <Ionicons name="lock-closed-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
                <TextInput
                  style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={19} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link (Soft Mint, Not Glaring) */}
              <TouchableOpacity activeOpacity={0.7} style={{ alignSelf: 'flex-end', paddingVertical: 6, marginBottom: 22 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#34d399' }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Action Button: Sign In (Balanced Emerald Glow) */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: '#00c853',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#00c853',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 }}>
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Link: Don't have an account? Register Now */}
            <View style={{ alignItems: 'center', paddingVertical: 12, zIndex: 10 }}>
              <TouchableOpacity onPress={() => navigateTo('REGISTER')} activeOpacity={0.7} style={{ padding: 6 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#94a3b8' }}>
                  Don't have an account?{' '}
                  <Text style={{ fontWeight: '800', color: '#34d399' }}>Register Now</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // SCREEN 3: CREATE YOUR ACCOUNT (REGISTER)
  // =========================================================================
  return (
    <View style={{ flex: 1, backgroundColor: '#030705', position: 'relative' }}>
      {/* Compact Candlesticks at Top & Bottom Waves */}
      <CandlestickChartBackground compact={true} />
      <NeonWaveMesh />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 22,
          paddingTop: Platform.OS === 'web' ? 24 : 16,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1, justifyContent: 'space-between' }}>
          {/* Top Navigation Row: Back Button + Centered Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
            <TouchableOpacity
              onPress={() => navigateTo('LANDING')}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.14)',
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>

            <QuickTradeLogo size="sm" showTagline={false} />

            <View style={{ width: 40 }} />
          </View>

          {/* Vertically Centered Register Form Card */}
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 14 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 }}>
                Create Your Account
              </Text>
              <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#94a3b8', marginTop: 6 }}>
                Join QuickTrade and get ₹50 bonus
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.14)',
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 14,
                }}
              >
                <Ionicons name="alert-circle-outline" size={17} color="#fca5a5" />
                <Text style={{ color: '#fca5a5', fontSize: 12.5, fontWeight: '600', flex: 1 }}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form Input: Full Name */}
            <View
              style={{
                height: 52,
                borderRadius: 16,
                backgroundColor: '#0e1612',
                borderWidth: 1.2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Ionicons name="person-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Form Input: Email Address (No Phone Number!) */}
            <View
              style={{
                height: 52,
                borderRadius: 16,
                backgroundColor: '#0e1612',
                borderWidth: 1.2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Ionicons name="mail-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Form Input: Password */}
            <View
              style={{
                height: 52,
                borderRadius: 16,
                backgroundColor: '#0e1612',
                borderWidth: 1.2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Ionicons name="lock-closed-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                placeholder="Password"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={19} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Form Input: Confirm Password */}
            <View
              style={{
                height: 52,
                borderRadius: 16,
                backgroundColor: '#0e1612',
                borderWidth: 1.2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 16,
              }}
            >
              <Ionicons name="lock-closed-outline" size={19} color="#94a3b8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' }}
                placeholder="Confirm Password"
                placeholderTextColor="#64748b"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={19} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: agreedTerms ? '#00c853' : '#0e1612',
                  borderWidth: 1.5,
                  borderColor: agreedTerms ? '#00c853' : '#64748b',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {agreedTerms && <Ionicons name="checkmark" size={16} color="#ffffff" />}
              </View>

              <Text style={{ fontSize: 12.5, fontWeight: '500', color: '#cbd5e1', flex: 1, lineHeight: 18 }}>
                I agree to the{' '}
                <Text style={{ color: '#34d399', fontWeight: '700' }}>Terms & Conditions</Text>{' '}
                and{' '}
                <Text style={{ color: '#34d399', fontWeight: '700' }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Action Button: Register & Get ₹50 */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                height: 54,
                borderRadius: 27,
                backgroundColor: '#00c853',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#00c853',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="gift-outline" size={20} color="#ffffff" />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 }}>
                    Register & Get ₹50
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Link: Already have an account? Login */}
          <View style={{ alignItems: 'center', paddingVertical: 12, zIndex: 10 }}>
            <TouchableOpacity onPress={() => navigateTo('LOGIN')} activeOpacity={0.7} style={{ padding: 6 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#94a3b8' }}>
                Already have an account?{' '}
                <Text style={{ fontWeight: '800', color: '#34d399' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );

}
