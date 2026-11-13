import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { roomService, profileService, bannerService, MobileBanner, DEFAULT_FALLBACK_BANNER } from '../services';
import { CheckoutPaymentModal } from '../components/CheckoutPaymentModal';
import { TicketConfirmedModal } from '../components/TicketConfirmedModal';
import { LiveCountdown } from '../components/LiveCountdown';
import { GoldenTrophy } from '../components/GoldenTrophy';
import { HERO_BANNER_BASE64 } from '../components/HeroBannerAsset';

interface HomeScreenProps {
  user: any;
  onJoinRoom: (room: any) => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
  onLanguageChange?: (lang: 'en' | 'ta') => void;
}

export default function HomeScreen({
  user,
  onJoinRoom,
  onOpenWallet,
  onOpenProfile,
  onBalanceUpdated,
  onLanguageChange,
}: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [selectedCategory, setSelectedCategory] = useState('RECOMMENDED');
  const [categories, setCategories] = useState<{ label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<MobileBanner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // 3D Checkout & Ticket Modals
  const [selectedRoomForCheckout, setSelectedRoomForCheckout] = useState<any>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<any>(null);
  const [showWithdrawalsModal, setShowWithdrawalsModal] = useState(false);

  const listAnim = useRef(new Animated.Value(0)).current;

  const RECENT_WITHDRAWALS = [
    {
      name: 'Senthil Kumar',
      avatarBg: '#8b5cf6',
      amount: '500',
      method: 'UPI',
      badgeBg: '#ffffff',
      badgeColor: '#0f766e',
      time: '2 hours ago',
      timeTa: '2 மணி நேரத்திற்கு முன்',
    },
    {
      name: 'Priya Dharshini',
      avatarBg: '#0284c7',
      amount: '300',
      method: 'Paytm',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      time: '4 hours ago',
      timeTa: '4 மணி நேரத்திற்கு முன்',
    },
    {
      name: 'Ramesh K',
      avatarBg: '#6366f1',
      amount: '1,000',
      method: 'PhonePe',
      badgeBg: '#ede9fe',
      badgeColor: '#5b21b6',
      time: '6 hours ago',
      timeTa: '6 மணி நேரத்திற்கு முன்',
    },
  ];

  const ALL_RECENT_WITHDRAWALS = [
    { name: 'Senthil Kumar', avatarBg: '#8b5cf6', amount: '500', method: 'UPI', txnId: 'TXN-984321', time: '5 mins ago', timeTa: '5 நிமிடங்களுக்கு முன்' },
    { name: 'Kavitha Rajan', avatarBg: '#ec4899', amount: '1,200', method: 'GPay', txnId: 'TXN-984320', time: '14 mins ago', timeTa: '14 நிமிடங்களுக்கு முன்' },
    { name: 'Priya Dharshini', avatarBg: '#0284c7', amount: '300', method: 'Paytm', txnId: 'TXN-984319', time: '28 mins ago', timeTa: '28 நிமிடங்களுக்கு முன்' },
    { name: 'Ramesh K', avatarBg: '#6366f1', amount: '1,000', method: 'PhonePe', txnId: 'TXN-984318', time: '45 mins ago', timeTa: '45 நிமிடங்களுக்கு முன்' },
    { name: 'Anand Murugan', avatarBg: '#10b981', amount: '750', method: 'UPI', txnId: 'TXN-984317', time: '1 hour ago', timeTa: '1 மணி நேரத்திற்கு முன்' },
    { name: 'Divya Bharathi', avatarBg: '#f59e0b', amount: '2,000', method: 'GPay', txnId: 'TXN-984316', time: '1 hour ago', timeTa: '1 மணி நேரத்திற்கு முன்' },
    { name: 'Saravanan M', avatarBg: '#14b8a6', amount: '450', method: 'PhonePe', txnId: 'TXN-984315', time: '2 hours ago', timeTa: '2 மணி நேரத்திற்கு முன்' },
    { name: 'Meenakshi S', avatarBg: '#a855f7', amount: '800', method: 'Paytm', txnId: 'TXN-984314', time: '2 hours ago', timeTa: '2 மணி நேரத்திற்கு முன்' },
    { name: 'Vigneshwaran P', avatarBg: '#3b82f6', amount: '1,500', method: 'UPI', txnId: 'TXN-984313', time: '3 hours ago', timeTa: '3 மணி நேரத்திற்கு முன்' },
    { name: 'Nandhini G', avatarBg: '#ef4444', amount: '250', method: 'PhonePe', txnId: 'TXN-984312', time: '3 hours ago', timeTa: '3 மணி நேரத்திற்கு முன்' },
    { name: 'Deepak Raj', avatarBg: '#eab308', amount: '600', method: 'GPay', txnId: 'TXN-984311', time: '4 hours ago', timeTa: '4 மணி நேரத்திற்கு முன்' },
    { name: 'Pooja Krishnan', avatarBg: '#06b6d4', amount: '950', method: 'UPI', txnId: 'TXN-984310', time: '5 hours ago', timeTa: '5 மணி நேரத்திற்கு முன்' },
  ];

  const DEFAULT_RECOMMENDED_ROOMS = [
    {
      id: 'f58c5e01-f6b9-47a1-a4f2-02e45dbb9b20',
      title: 'Tamil Nadu GK Challenge',
      category: 'TNPSC',
      entryFee: 10,
      prizePool: 80,
      currentPlayers: 5,
      maxPlayers: 20,
      totalQuestions: 5,
      timePerQuestion: 10,
      status: 'SCHEDULED',
      scheduledStartTime: new Date().toISOString(),
    },
  ];

  // Toggle user language preference using i18next library
  const handleToggleLanguage = async () => {
    const nextLang = currentLang === 'en' ? 'ta' : 'en';
    await i18n.changeLanguage(nextLang);
    try {
      await profileService.updateLanguage(nextLang.toUpperCase() as 'EN' | 'TA');
      if (onLanguageChange) onLanguageChange(nextLang);
    } catch (err) {
      console.error('Failed to update language', err);
    }
  };

  const getCategoryLabel = (cat: string): string => {
    switch (cat.toUpperCase()) {
      case 'SPEED_LUDO':
        return currentLang === 'ta' ? 'ஸ்பீடு லூடோ' : 'Speed Ludo';
      case 'FRUIT_SLICER':
        return currentLang === 'ta' ? 'ஃப்ரூட் ஸ்லைசர்' : 'Fruit Slicer';
      case 'KNIFE_HIT':
        return currentLang === 'ta' ? 'நைஃப் ஹிட்' : 'Knife Hit';
      case 'SPEED_MATH':
        return currentLang === 'ta' ? 'ஸ்பீடு மேத்ஸ்' : 'Speed Math';
      case 'TAMIL_QUIZ':
      case 'TNPSC':
        return currentLang === 'ta' ? 'தமிழ் வினாடி வினா' : 'Tamil Quiz';
      case 'CINEMA':
        return currentLang === 'ta' ? 'சினிமா' : 'Cinema';
      case 'GENERAL_GK':
        return currentLang === 'ta' ? 'பொது அறிவு' : 'General GK';
      default:
        return cat;
    }
  };

  const getCategoryIcon = (cat: string): keyof typeof Ionicons.glyphMap => {
    switch (cat.toUpperCase()) {
      case 'SPEED_LUDO':
        return 'dice';
      case 'FRUIT_SLICER':
        return 'nutrition';
      case 'KNIFE_HIT':
        return 'flash';
      case 'SPEED_MATH':
        return 'calculator';
      case 'TAMIL_QUIZ':
      case 'TNPSC':
        return 'book';
      case 'CINEMA':
        return 'film';
      case 'GENERAL_GK':
        return 'bulb';
      default:
        return 'game-controller';
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiCategories = await roomService.getCategories();
        setCategories([
          { label: t('for_you'), value: 'RECOMMENDED', icon: 'sparkles' },
          ...apiCategories.map((c: string) => ({
            label: getCategoryLabel(c),
            value: c,
            icon: getCategoryIcon(c),
          })),
        ]);
      } catch (err: any) {
        console.warn('Using default categories:', err?.message || err);
        const fallbackCats = [
          'SPEED_LUDO',
          'FRUIT_SLICER',
          'KNIFE_HIT',
          'SPEED_MATH',
          'TAMIL_QUIZ',
          'CINEMA',
          'GENERAL_GK',
        ];
        setCategories([
          { label: t('for_you'), value: 'RECOMMENDED', icon: 'sparkles' },
          ...fallbackCats.map((c: string) => ({
            label: getCategoryLabel(c),
            value: c,
            icon: getCategoryIcon(c),
          })),
        ]);
      }
    };
    loadCategories();
  }, [currentLang]);

  const fetchBanners = async () => {
    try {
      const bannerList = await bannerService.getActiveBanners();
      setBanners(bannerList);
    } catch (err) {
      console.warn('Failed to load banners', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-cycle banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerPress = (banner: MobileBanner) => {
    if (banner.actionType === 'OPEN_CATEGORY' && banner.actionTarget) {
      setSelectedCategory(banner.actionTarget);
    } else if (banner.actionType === 'EXTERNAL_LINK' && banner.actionTarget) {
      Linking.openURL(banner.actionTarget).catch((err) => console.warn('Failed to open URL', err));
    } else {
      const targetCat = banner.actionTarget || 'TNPSC';
      const featured = rooms.find((r) => r.category === targetCat) || rooms[0] || DEFAULT_RECOMMENDED_ROOMS[0];
      if (featured) {
        setSelectedRoomForCheckout(featured);
      } else {
        setSelectedCategory(targetCat);
      }
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    listAnim.setValue(0);
    try {
      fetchBanners();
      const data =
        selectedCategory === 'RECOMMENDED'
          ? await roomService.getRecommendedRooms()
          : await roomService.getRoomsByCategory(selectedCategory);
      setRooms(data);
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Failed to load rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory]);

  const handlePaymentSuccess = (result: { newBalance: number; ticketId: string; room: any }) => {
    if (onBalanceUpdated) {
      onBalanceUpdated(result.newBalance);
    }

    setConfirmedTicket({
      ticketId: result.ticketId,
      roomTitle: result.room.title,
      category: result.room.category,
      scheduledStartTime: result.room.scheduledStartTime,
      scheduledEndTime: result.room.scheduledEndTime,
      entryFee: result.room.entryFee,
    });

    fetchRooms();
  };

  // Enter the live arena once join window opens via roomService
  const handleEnterArena = async (room: any) => {
    try {
      const res = await roomService.enterArena(room.id);
      if ((res as any).canEnter || res.success) {
        onJoinRoom(room);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Joining window not open yet');
    }
  };

  const formatScheduledTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const date = new Date(timeStr);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getClosingTime = (startTimeStr?: string, endTimeStr?: string) => {
    if (endTimeStr) return formatScheduledTime(endTimeStr);
    if (!startTimeStr) return null;
    const end = new Date(new Date(startTimeStr).getTime() + 15 * 60 * 1000);
    return formatScheduledTime(end.toISOString());
  };

  const isJoinWindowOpen = (room: any) => {
    if (!room.scheduledStartTime) return true;
    const now = Date.now();
    const scheduledMs = new Date(room.scheduledStartTime).getTime();
    const joinWindowOpensMs = scheduledMs - (room.joinWindowMinutes || 10) * 60 * 1000;
    return now >= joinWindowOpensMs;
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'P';

  return (
    <View style={{ flex: 1, height: '100%', minHeight: 0, backgroundColor: '#03130e', overflow: 'hidden' }}>
      {/* 3D Cyberpunk Emerald Header Bar (Matching Reference Image) */}
      <View
        style={{
          backgroundColor: '#041711',
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: '#0a3827',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* User Profile Avatar & Name */}
        <TouchableOpacity
          onPress={onOpenProfile}
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          {/* Vibrant Green Avatar Circle */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#10b981',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#10b981',
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900' }}>
              {userInitial}
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>
              {user?.name || 'Priya Dharsini'}
            </Text>

            {/* Amber Star ELO Badge (Matching Mockup) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#f59e0b',
                borderWidth: 1,
                borderColor: '#fbbf24',
                paddingHorizontal: 8,
                paddingVertical: 1.5,
                borderRadius: 8,
                alignSelf: 'flex-start',
                marginTop: 3,
              }}
            >
              <Ionicons name="star" size={10} color="#000000" />
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#000000' }}>
                {user?.skillRating || 1040} ELO
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right Badges: Language & Wallet */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Dark Frosted Language Pill */}
          <TouchableOpacity
            onPress={handleToggleLanguage}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: '#041f17',
              borderWidth: 1.5,
              borderColor: '#0284c7',
              borderRadius: 16,
              paddingHorizontal: 11,
              paddingVertical: 5,
            }}
          >
            <Ionicons name="language" size={13} color="#38bdf8" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>
              {currentLang === 'ta' ? 'தமிழ்' : 'EN'}
            </Text>
          </TouchableOpacity>

          {/* Dark Green Glowing Wallet Pill */}
          <TouchableOpacity
            onPress={onOpenWallet}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#032417',
              borderWidth: 1.5,
              borderColor: '#10b981',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 5,
              shadowColor: '#10b981',
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Ionicons name="wallet" size={15} color="#10b981" />
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#ffffff' }}>
              ₹{user?.walletBalance !== undefined ? user.walletBalance.toFixed(2) : '65.00'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Category Filter Pills (Clean, Premium, Glare-Free) */}
      <View style={{ backgroundColor: '#020f09', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#072b1e' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 18,
                  backgroundColor: isSelected ? '#10b981' : '#031a12',
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#34d399' : '#0b4a35',
                  shadowColor: isSelected ? '#10b981' : 'transparent',
                  shadowOpacity: isSelected ? 0.35 : 0,
                  shadowRadius: isSelected ? 8 : 0,
                  elevation: isSelected ? 4 : 0,
                }}
                onPress={() => setSelectedCategory(cat.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={15}
                  color={isSelected ? '#ffffff' : '#10b981'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '900' : '700',
                    color: '#ffffff',
                    letterSpacing: 0.3,
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Top Hero Banner: Shown only for specific categories, Compact Height (~85px) */}
      {selectedCategory !== 'RECOMMENDED' && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 10,
            marginBottom: 2,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: '#0b4a35',
            backgroundColor: '#041f17',
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            {/* Active Tournaments Counter Pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#032417',
                borderWidth: 1,
                borderColor: '#059669',
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
                alignSelf: 'flex-start',
                marginBottom: 4,
              }}
            >
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#10b981' }} />
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#34d399' }}>
                {rooms.length} {t('active_tournaments')}
              </Text>
            </View>

            {/* Dynamic Category Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: '900',
                fontStyle: 'italic',
                color: '#ffffff',
                letterSpacing: 0.5,
              }}
            >
              {selectedCategory}
            </Text>

            {/* Golden Subtitle */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#facc15',
                marginTop: 1,
                letterSpacing: 0.2,
              }}
            >
              {currentLang === 'ta'
                ? 'நேரலை போட்டிகளில் பங்கேற்று வெற்றி பெறுங்கள்'
                : `${selectedCategory} Skill Tournaments`}
            </Text>
          </View>

          {/* Compact 3D Golden Championship Trophy */}
          <GoldenTrophy size={62} />
        </View>
      )}

      {/* Main Content ScrollView */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: selectedCategory === 'RECOMMENDED' ? 0 : 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRooms} tintColor="#10b981" />}
      >
        {selectedCategory === 'RECOMMENDED' ? (
          <View style={{ paddingBottom: 10 }}>
            {/* 1. Hero Carousel Banner (Dynamic Admin Upload Support) */}
            {(() => {
              const currentBanner = banners[activeBannerIndex] || DEFAULT_FALLBACK_BANNER;
              const rawTitle = (currentLang === 'ta' && currentBanner.titleTamil) ? currentBanner.titleTamil : (currentBanner.title || 'TNPSC Quiz Challenge');
              const words = rawTitle.trim().split(' ');
              const lastWord = words.length > 1 ? words.pop() : '';
              const firstPart = words.join(' ');

              const bannerSubtitle = (currentLang === 'ta' && currentBanner.subtitleTamil)
                ? currentBanner.subtitleTamil
                : (currentBanner.subtitle || 'Test Your Knowledge • Win Real Cash');

              const bannerCta = (currentLang === 'ta' && currentBanner.actionTextTamil)
                ? currentBanner.actionTextTamil
                : (currentBanner.actionText || (currentLang === 'ta' ? 'இப்போதே விளையாடு' : 'Play Now'));

              const hasCustomImage = Boolean(currentBanner.imageUrl && currentBanner.imageUrl.length > 10);

              return (
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => handleBannerPress(currentBanner)}
                  style={{
                    height: 144,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: '#0b4a35',
                    backgroundColor: '#022116',
                    overflow: 'hidden',
                    position: 'relative',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Artwork Image (Admin uploaded image or default local asset) */}
                  <Image
                    source={hasCustomImage ? { uri: currentBanner.imageUrl } : require('../components/banner_artwork.png')}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: hasCustomImage ? '60%' : 230,
                      height: 144,
                      opacity: 0.88,
                    }}
                    resizeMode="cover"
                  />

                  {/* Gradient-like Dark Overlay on left for contrast */}
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '65%',
                      backgroundColor: '#022116',
                      opacity: 0.88,
                    }}
                  />

                  <View style={{ zIndex: 2, flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Ionicons name="trophy" size={16} color="#fbbf24" />
                        <Text style={{ fontSize: 18, fontWeight: '900', fontStyle: 'italic', color: '#ffffff', letterSpacing: 0.5 }}>
                          {firstPart}{' '}
                        </Text>
                        {lastWord ? (
                          <Text style={{ fontSize: 18, fontWeight: '900', fontStyle: 'italic', color: '#fbbf24', letterSpacing: 0.5 }}>
                            {lastWord}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#cbd5e1', marginTop: 4 }}>
                        {bannerSubtitle}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleBannerPress(currentBanner)}
                      activeOpacity={0.85}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#fbbf24',
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        borderRadius: 20,
                        alignSelf: 'flex-start',
                        shadowColor: '#fbbf24',
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Ionicons name="play" size={13} color="#000000" />
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#000000' }}>
                        {bannerCta}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })()}

            {/* Carousel Pagination Dots */}
            {banners.length > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 16 }}>
                {banners.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveBannerIndex(idx)}
                    activeOpacity={0.7}
                    style={{
                      width: activeBannerIndex === idx ? 20 : 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: activeBannerIndex === idx ? '#10b981' : '#334155',
                    }}
                  />
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 16 }}>
                <View style={{ width: 20, height: 5, borderRadius: 2.5, backgroundColor: '#10b981' }} />
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#334155' }} />
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#334155' }} />
              </View>
            )}

            {/* 2. Play Games Section */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Ionicons name="game-controller" size={18} color="#10b981" />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff' }}>
                  {currentLang === 'ta' ? 'விளையாட்டுகள்' : 'Play Games'}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: 8 }}
              >
                {/* 1. Speed Ludo */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory('SPEED_LUDO')}
                  activeOpacity={0.8}
                  style={{
                    width: 100,
                    alignItems: 'center',
                    backgroundColor: '#041f17',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#072e21', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 26 }}>🎲</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textAlign: 'center' }} numberOfLines={1}>
                    {currentLang === 'ta' ? 'ஸ்பீடு லூடோ' : 'Speed Ludo'}
                  </Text>
                  <View style={{ marginTop: 4, backgroundColor: '#063f2c', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#34d399' }}>2m Turbo</Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Fruit Slicer */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory('FRUIT_SLICER')}
                  activeOpacity={0.8}
                  style={{
                    width: 100,
                    alignItems: 'center',
                    backgroundColor: '#041f17',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#072e21', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 26 }}>🍉</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textAlign: 'center' }} numberOfLines={1}>
                    {currentLang === 'ta' ? 'ஃப்ரூட் ஸ்லைசர்' : 'Fruit Slicer'}
                  </Text>
                  <View style={{ marginTop: 4, backgroundColor: '#451a03', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#fbbf24' }}>60s Blitz</Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Knife Hit */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory('KNIFE_HIT')}
                  activeOpacity={0.8}
                  style={{
                    width: 100,
                    alignItems: 'center',
                    backgroundColor: '#041f17',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#072e21', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 26 }}>🔪</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textAlign: 'center' }} numberOfLines={1}>
                    {currentLang === 'ta' ? 'நைஃப் ஹிட்' : 'Knife Hit'}
                  </Text>
                  <View style={{ marginTop: 4, backgroundColor: '#450a0a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#f87171' }}>Target</Text>
                  </View>
                </TouchableOpacity>

                {/* 4. Speed Math */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory('SPEED_MATH')}
                  activeOpacity={0.8}
                  style={{
                    width: 100,
                    alignItems: 'center',
                    backgroundColor: '#041f17',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#072e21', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 26 }}>⚡</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textAlign: 'center' }} numberOfLines={1}>
                    {currentLang === 'ta' ? 'ஸ்பீடு மேத்ஸ்' : 'Speed Math'}
                  </Text>
                  <View style={{ marginTop: 4, backgroundColor: '#172554', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#60a5fa' }}>Mental 1v1</Text>
                  </View>
                </TouchableOpacity>

                {/* 5. Tamil Quiz */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory('TAMIL_QUIZ')}
                  activeOpacity={0.8}
                  style={{
                    width: 100,
                    alignItems: 'center',
                    backgroundColor: '#041f17',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#072e21', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 26 }}>📝</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textAlign: 'center' }} numberOfLines={1}>
                    {currentLang === 'ta' ? 'தமிழ் வினாடி வினா' : 'Tamil Quiz'}
                  </Text>
                  <View style={{ marginTop: 4, backgroundColor: '#3b0764', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#c084fc' }}>TNPSC & GK</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* 3. Recent Withdrawals Section */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="cash" size={16} color="#facc15" />
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#ffffff' }}>
                    {currentLang === 'ta' ? 'சமீபத்திய பணப் பரிமாற்றம்' : 'Recent Withdrawals'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowWithdrawalsModal(true)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: '#032417',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#0b4a35',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#10b981' }}>
                    {currentLang === 'ta' ? 'அனைத்தும் காண்க →' : 'View All →'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {RECENT_WITHDRAWALS.map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: 145,
                      backgroundColor: '#031a12',
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: '#0d4a36',
                      padding: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: w.avatarBg, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>{w.name[0]}</Text>
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', flex: 1 }} numberOfLines={1}>
                        {w.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Ionicons name="checkmark-circle" size={11} color="#10b981" />
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#34d399' }}>
                        Withdrawal Successful
                      </Text>
                    </View>
                    <Text style={{ fontSize: 17, fontWeight: '900', color: '#ffffff', marginTop: 3 }}>
                      ₹{w.amount}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <View style={{ backgroundColor: w.badgeBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: w.badgeColor }}>
                          {w.method}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 9, color: '#64748b' }}>
                        {currentLang === 'ta' ? w.timeTa : w.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 4. Recommended for You Section */}
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Ionicons name="flame" size={18} color="#f97316" />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff' }}>
                  {currentLang === 'ta' ? 'உங்களுக்கான பரிந்துரைகள்' : 'Recommended for You'}
                </Text>
              </View>

              {(rooms.length > 0 ? rooms : DEFAULT_RECOMMENDED_ROOMS).map((room) => {
                return (
                  <View
                    key={room.id}
                    style={{
                      backgroundColor: '#031911',
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: '#0b4a35',
                      padding: 14,
                      marginBottom: 14,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      elevation: 4,
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                      <Image
                        source={require('../components/temple_thumb_square.png')}
                        style={{ width: 84, height: 84, borderRadius: 16, borderWidth: 1, borderColor: '#0d4834' }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#032417',
                              borderWidth: 1,
                              borderColor: '#10b981',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                            }}
                          >
                            <Ionicons name={getCategoryIcon(room.category)} size={11} color="#10b981" />
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#10b981' }}>
                              {room.category}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 3,
                              backgroundColor: '#dc2626',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                            }}
                          >
                            <Ionicons name="flame" size={10} color="#ffffff" />
                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#ffffff' }}>
                              Popular
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff', lineHeight: 21 }} numberOfLines={2}>
                          {room.title}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                          <Ionicons name="disc" size={12} color="#f97316" />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8' }}>
                            {room.totalQuestions || 5} Questions • {room.timePerQuestion || 10}s per Question
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#021810',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#0b3d2b',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        marginTop: 12,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="ticket-outline" size={15} color="#10b981" />
                        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>Entry</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>₹{room.entryFee || 10}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="trophy" size={15} color="#fbbf24" />
                        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>Prize</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#fbbf24' }}>₹{room.prizePool || 80}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="people" size={15} color="#38bdf8" />
                        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>Players</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>
                          {room.currentPlayers || 5}/{room.maxPlayers || 20}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (room.isRegistered) {
                          handleEnterArena(room);
                        } else {
                          setSelectedRoomForCheckout(room);
                        }
                      }}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: '#10b981',
                        borderRadius: 14,
                        paddingVertical: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 12,
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Ionicons name="play" size={16} color="#ffffff" />
                      <Text style={{ fontSize: 14, fontWeight: '900', color: '#ffffff' }}>
                        {room.isRegistered
                          ? (currentLang === 'ta' ? 'அரங்கில் நுழைக' : 'Enter Arena')
                          : (currentLang === 'ta' ? 'இப்போதே சேரவும்' : 'Join Now')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ) : loading && rooms.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ fontSize: 12, color: '#6ee7b7', fontWeight: '500', marginTop: 12 }}>
              Loading arenas...
            </Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: '#071f17', borderRadius: 20, borderWidth: 1, borderColor: '#0d4834', padding: 20 }}>
            <Ionicons name="game-controller-outline" size={40} color="#34d399" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', marginTop: 8 }}>
              No active rooms in this category
            </Text>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
              Check back shortly or select another category
            </Text>
          </View>
        ) : (
          <Animated.View
            style={{
              gap: 16,
              opacity: listAnim,
              transform: [
                {
                  translateY: listAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            {rooms.map((room) => {
              const isRegistered = room.isRegistered;
              const windowOpen = isJoinWindowOpen(room);

              return (
                <View
                  key={room.id}
                  style={{
                    backgroundColor: '#031911',
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: '#0b4a35',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                    overflow: 'hidden',
                  }}
                >
                  {/* INNER CARD BODY */}
                  <View style={{ padding: 18 }}>
                    {/* Room Title */}
                    <Text style={{ fontSize: 17, fontWeight: '800', color: '#ffffff', marginTop: 0, lineHeight: 24 }}>
                      {room.title}
                    </Text>

                    {/* Scheduled Battle Time, Closing Time & Active Status Bar */}
                    {room.scheduledStartTime && (
                      <View
                        style={{
                          backgroundColor: '#021810',
                          borderWidth: 1,
                          borderColor: '#0f4834',
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="calendar" size={14} color="#10b981" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>
                            {formatScheduledTime(room.scheduledStartTime)}
                          </Text>
                          {room.scheduledEndTime && (
                            <>
                              <Text style={{ fontSize: 11, color: '#64748b' }}>-</Text>
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fbbf24' }}>
                                {getClosingTime(room.scheduledStartTime, room.scheduledEndTime)}
                              </Text>
                            </>
                          )}
                        </View>

                        <View style={{ width: 1, height: 16, backgroundColor: '#0f4834' }} />

                        <LiveCountdown
                          scheduledStartTime={room.scheduledStartTime}
                          scheduledEndTime={room.scheduledEndTime}
                          onExpire={fetchRooms}
                          variant="dark"
                        />
                      </View>
                    )}

                    {/* Education & Questions Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                      <Ionicons name="school" size={14} color="#ffffff" />
                      <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: '700' }}>
                        {room.targetEducation}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>•</Text>
                      <Ionicons name="help-circle" size={14} color="#ffffff" />
                      <Text style={{ fontSize: 12, color: '#e2e8f0', fontWeight: '600' }}>
                        {room.totalQuestions} Questions (10s timer)
                      </Text>
                    </View>

                    {/* 3D High-Contrast Metrics Box (Exact Match to Mockup) */}
                    <View
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginTop: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                      }}
                    >
                      {/* Entry Fee Column */}
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="layers" size={12} color="#64748b" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('entry_fee')}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 17, fontWeight: '900', color: '#0f172a', marginTop: 2 }}>
                          ₹{room.entryFee}
                        </Text>
                      </View>

                      {/* Divider */}
                      <View style={{ width: 1, height: 28, backgroundColor: '#e2e8f0' }} />

                      {/* Prize Pool Column */}
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="trophy" size={12} color="#f59e0b" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('prize_pool')}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 19, fontWeight: '900', color: '#f59e0b', marginTop: 2 }}>
                          ₹{room.prizePool}
                        </Text>
                      </View>

                      {/* Divider */}
                      <View style={{ width: 1, height: 28, backgroundColor: '#e2e8f0' }} />

                      {/* Players Column */}
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="people" size={12} color="#059669" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('players')}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 17, fontWeight: '900', color: '#059669', marginTop: 2 }}>
                          {room.currentPlayers || 0}/{room.maxPlayers}
                        </Text>
                      </View>
                    </View>

                    {/* VIBRANT 3D GLOWING GREEN ACTION BUTTON (Exact Match to Mockup) */}
                    {isRegistered ? (
                      windowOpen || room.status === 'WAITING_RESULTS' ? (
                        <TouchableOpacity
                          onPress={() => handleEnterArena(room)}
                          activeOpacity={0.85}
                          style={{
                            backgroundColor: '#10b981',
                            borderBottomWidth: 4,
                            borderBottomColor: '#047857',
                            borderRadius: 18,
                            paddingVertical: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 8,
                            marginTop: 14,
                            shadowColor: '#10b981',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.6,
                            shadowRadius: 18,
                            elevation: 8,
                          }}
                        >
                          <Ionicons
                            name="bar-chart"
                            size={18}
                            color="#ffffff"
                          />
                          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 }}>
                            {room.status === 'WAITING_RESULTS'
                              ? currentLang === 'ta'
                                ? 'முடிவுகளை காண்க >>'
                                : 'View Standings & Results >>'
                              : currentLang === 'ta'
                              ? 'போட்டிக்குள் நுழைக >>'
                              : 'Enter Live Arena Now >>'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#032619',
                            borderWidth: 1.5,
                            borderColor: '#10b981',
                            borderRadius: 16,
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6,
                            marginTop: 14,
                          }}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#34d399' }}>
                            {t('slot_confirmed')} (Doors open {room.joinWindowMinutes || 10}m prior)
                          </Text>
                        </View>
                      )
                    ) : (
                      <TouchableOpacity
                        onPress={() => setSelectedRoomForCheckout(room)}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: '#10b981',
                          borderBottomWidth: 4,
                          borderBottomColor: '#047857',
                          borderRadius: 18,
                          paddingVertical: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                          marginTop: 14,
                          shadowColor: '#10b981',
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.6,
                          shadowRadius: 18,
                          elevation: 8,
                        }}
                      >
                        <Ionicons name="ticket" size={18} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 }}>
                          {currentLang === 'ta'
                            ? `முன்பதிவு செய் (₹${room.entryFee})`
                            : `Pre-Register Slot (₹${room.entryFee})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* 3D Payment Checkout Bottom Sheet */}
      <CheckoutPaymentModal
        isOpen={!!selectedRoomForCheckout}
        room={selectedRoomForCheckout}
        user={user}
        onClose={() => setSelectedRoomForCheckout(null)}
        onPaymentSuccess={handlePaymentSuccess}
        onRechargeRequired={onOpenWallet}
      />

      {/* 3D Golden Event Ticket Confirmation Modal */}
      <TicketConfirmedModal
        isOpen={!!confirmedTicket}
        ticketData={confirmedTicket}
        onClose={() => setConfirmedTicket(null)}
      />

      {/* Recent Withdrawals Live Proofs Modal */}
      <Modal
        visible={showWithdrawalsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawalsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#031911',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 0,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 32,
              maxHeight: '82%',
            }}
          >
            {/* Grab Handle */}
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: '#0f5139', alignSelf: 'center', marginBottom: 14 }} />

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="cash" size={20} color="#facc15" />
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>
                    {currentLang === 'ta' ? 'அனைத்து பணப் பரிமாற்றங்கள்' : 'Live Verified Payouts'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#34d399' }}>
                    {currentLang === 'ta' ? '100% உடனடி பட்டுவாடா சரிபார்க்கப்பட்டது' : '100% Instant Verified Payouts'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowWithdrawalsModal(false)}
                activeOpacity={0.8}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#042418',
                  borderWidth: 1,
                  borderColor: '#0b4a35',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* List of Withdrawals */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
              {ALL_RECENT_WITHDRAWALS.map((w, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#021810',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#0b402e',
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: w.avatarBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff' }}>{w.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }} numberOfLines={1}>
                        {w.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#34d399' }}>
                          {w.txnId}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>•</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>
                          {currentLang === 'ta' ? w.timeTa : w.time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#10b981' }}>
                      ₹{w.amount}
                    </Text>
                    <View style={{ backgroundColor: '#042418', borderWidth: 1, borderColor: '#0b4a35', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#facc15' }}>
                        {w.method}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
