import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService, DEFAULT_METADATA } from '../services';
import { AppInput } from '../components/AppInput';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

/**
 * Mobile Authentication Screen (Cyberpunk Emerald Dark Theme)
 */
export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [phone, setPhone] = useState('9876543211'); // Priya Dharsini
  const [password, setPassword] = useState('user123');
  const [name, setName] = useState('');
  const [educationLevel, setEducationLevel] = useState('DEGREE');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['TNPSC', 'GENERAL_GK']);

  // Dynamic Options with built-in resilient defaults
  const [educationOptions, setEducationOptions] = useState<{ label: string; value: string }[]>(
    DEFAULT_METADATA.educationLevels
  );
  const [interestOptions, setInterestOptions] = useState<string[]>(DEFAULT_METADATA.categories);

  // Smooth Entrance Animation
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    const loadMetadata = async () => {
      try {
        const meta = await authService.getMetadataOptions();
        setEducationOptions(meta.educationLevels);
        setInterestOptions(meta.categories);
      } catch (err: any) {
        console.warn('Metadata loaded from local defaults:', err?.message || err);
      }
    };
    loadMetadata();
  }, []);

  const toggleInterest = (val: string) => {
    if (selectedInterests.includes(val)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== val));
    } else {
      setSelectedInterests([...selectedInterests, val]);
    }
  };

  const handleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name || !phone || !password) {
          setErrorMsg('Please enter your name, mobile number, and password');
          setLoading(false);
          return;
        }
        const data = await authService.register({
          phone,
          password,
          name,
          educationLevel,
          interests: selectedInterests,
        });
        onLoginSuccess(data.user);
      } else {
        const data = await authService.login({ phone, password });
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed');
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
      setErrorMsg('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      style={{ backgroundColor: '#03130e', padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: enterAnim,
          transform: [
            {
              translateY: enterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        }}
      >
        {/* Brand Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#072b1e',
              borderWidth: 1.5,
              borderColor: '#10b981',
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 20,
              marginBottom: 12,
            }}
          >
            <Ionicons name="trophy" size={14} color="#10b981" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Skill Tournament Arena
            </Text>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
            Quiz Arena
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#a7f3d0', textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }}>
            {isRegister
              ? 'Set your education tier for personalized matchups'
              : 'Enter live battles and win cash prizes with your knowledge'}
          </Text>
        </View>

        {/* Form Container */}
        <View
          style={{
            backgroundColor: '#071f17',
            borderWidth: 1.5,
            borderColor: '#10b981',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {errorMsg ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#4c0519',
                borderWidth: 1,
                borderColor: '#f43f5e',
                padding: 12,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#fda4af" />
              <Text style={{ color: '#fda4af', fontSize: 12, flex: 1 }}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Segmented Control */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#052017',
              padding: 4,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#0b4a35',
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: !isRegister ? '#10b981' : 'transparent',
              }}
              onPress={() => setIsRegister(false)}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: !isRegister ? '#ffffff' : '#6ee7b7' }}>
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: isRegister ? '#10b981' : 'transparent',
              }}
              onPress={() => setIsRegister(true)}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: isRegister ? '#ffffff' : '#6ee7b7' }}>
                Register (Get ₹50)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          {isRegister && (
            <AppInput
              label="Full Name"
              placeholder="e.g. Priya Dharsini"
              value={name}
              onChangeText={setName}
            />
          )}

          <AppInput
            label="Mobile Number"
            placeholder="10-digit Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <AppInput
            label="Password"
            placeholder="Secret Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Action Sign In Button */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#10b981',
              borderBottomWidth: 4,
              borderBottomColor: '#047857',
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              marginTop: 12,
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 }}>
              {loading
                ? 'Connecting Arena...'
                : isRegister
                ? 'Claim ₹50 Bonus & Register'
                : 'Sign In to Arena'}
            </Text>
          </TouchableOpacity>

          {/* One-Click Demo Accounts */}
          <View style={{ marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#0b4a35' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#6ee7b7', textAlign: 'center', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
              One-Click Demo Accounts
            </Text>

            <View style={{ gap: 10 }}>
              {/* Karthik */}
              <TouchableOpacity
                onPress={() => handleQuickDemo('9876543210')}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#05241b',
                  borderWidth: 1.5,
                  borderColor: '#0b4a35',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#063728', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="school" size={18} color="#34d399" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>Karthik Raja</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#a7f3d0' }}>Graduate • TNPSC Focus</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color="#10b981" />
              </TouchableOpacity>

              {/* Priya */}
              <TouchableOpacity
                onPress={() => handleQuickDemo('9876543211')}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#05241b',
                  borderWidth: 1.5,
                  borderColor: '#10b981',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  shadowColor: '#10b981',
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#063728', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="film" size={18} color="#fbbf24" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>Priya Dharshini</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#a7f3d0' }}>12th Student • Cinema Focus</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
