import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileService, authService } from '../services';
import { AppInput } from '../components/AppInput';

interface ProfileScreenProps {
  user: any;
  onBack: () => void;
  onProfileUpdated: (updatedUser: any) => void;
  onLogout: () => void;
}

/**
 * Mobile User Profile & Matchmaking Settings Screen (Cyberpunk Gold Dark Theme)
 */
export default function ProfileScreen({ user, onBack, onProfileUpdated, onLogout }: ProfileScreenProps) {
  const [name, setName] = useState(user?.name || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'DEGREE');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.examInterests || ['TNPSC']);
  const [saving, setSaving] = useState(false);

  // Dynamic Options from API
  const [educationOptions, setEducationOptions] = useState<{ label: string; value: string }[]>([
    { label: 'School (Below 10th)', value: 'BELOW_10TH' },
    { label: '10th / +2 Passed', value: 'TENTH_PLUS_TWO' },
    { label: 'Graduate / Degree', value: 'GRADUATE' },
    { label: 'Post Graduate / Doctorate', value: 'POST_GRADUATE' },
  ]);
  const [interestOptions, setInterestOptions] = useState<string[]>([
    'TNPSC',
    'CINEMA',
    'GENERAL_GK',
    'SCIENCE',
    'TECH',
  ]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const meta = await profileService.getMetadataOptions();
        setEducationOptions(meta.educationLevels);
        setInterestOptions(meta.categories);
      } catch (err: any) {
        console.warn('Using local metadata defaults in profile:', err?.message || err);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        name,
        educationLevel,
        interests: selectedInterests,
      });
      alert('Profile updated! Your room recommendations will now refresh.');
      onProfileUpdated({ ...user, ...(updated.user || updated) });
      onBack();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutPress = () => {
    authService.logout();
    onLogout();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#120a01' }}>
      {/* Top Header */}
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
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: '#07251c',
            borderWidth: 1,
            borderColor: '#f59e0b',
          }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#fbbf24" />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800' }}>Profile & Matchmaking</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* User Card */}
        <View
          style={{
            backgroundColor: '#251a02',
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: '#f59e0b',
            padding: 20,
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#f59e0b',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              shadowColor: '#f59e0b',
              shadowOpacity: 0.6,
              shadowRadius: 10,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '900' }}>
              {name.charAt(0).toUpperCase() || 'P'}
            </Text>
          </View>

          <Text style={{ fontSize: 17, fontWeight: '800', color: '#ffffff' }}>{name}</Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user?.phone}</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#fef3c7',
              borderWidth: 1,
              borderColor: '#fde68a',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Ionicons name="star" size={12} color="#b45309" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#b45309' }}>
              Skill Rating: {user?.skillRating || 1040} ELO
            </Text>
          </View>
        </View>

        {/* Edit Name */}
        <AppInput
          label="Your Name"
          value={name}
          onChangeText={setName}
          placeholder="Name"
          dark={true}
        />

        {/* Education Level (Dynamic from API) */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="school-outline" size={14} color="#f59e0b" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fde68a' }}>
              Education Level (Matchmaking Engine)
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
            Rooms and difficulty are dynamically matched to this selection.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {educationOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: educationLevel === opt.value ? '#f59e0b' : '#1a1103',
                  borderWidth: 1,
                  borderColor: educationLevel === opt.value ? '#fbbf24' : '#463100',
                }}
                onPress={() => setEducationLevel(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: educationLevel === opt.value ? '800' : '500',
                    color: educationLevel === opt.value ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exam Interests (Dynamic from API) */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="book-outline" size={14} color="#f59e0b" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fde68a' }}>
              Topic & Exam Interests
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {interestOptions.map((cat) => {
              const isSelected = selectedInterests.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: isSelected ? '#f59e0b' : '#1a1103',
                    borderWidth: 1,
                    borderColor: isSelected ? '#fbbf24' : '#463100',
                  }}
                  onPress={() => toggleInterest(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: isSelected ? '800' : '500',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#f59e0b',
            borderBottomWidth: 4,
            borderBottomColor: '#b45309',
            borderRadius: 16,
            paddingVertical: 13,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>
            {saving ? 'Saving...' : 'Save Matchmaking Preferences'}
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#4c0519',
            borderWidth: 1,
            borderColor: '#f43f5e',
            borderRadius: 16,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
            marginTop: 12,
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="#fda4af" />
          <Text style={{ color: '#fda4af', fontSize: 13, fontWeight: '700' }}>Logout Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
