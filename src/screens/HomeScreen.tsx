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
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { roomService, profileService, bannerService, MobileBanner, DEFAULT_FALLBACK_BANNER, centralWalletStore } from '../services';
import MarketAssetsScreen from './MarketAssetsScreen';
import TradePredictionScreen from './TradePredictionScreen';
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
  const [showVipModal, setShowVipModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'HOME' | 'MARKET' | 'TRADE'>('HOME');
  const [selectedTradeAsset, setSelectedTradeAsset] = useState<any>(null);
  const [showAllAssetsModal, setShowAllAssetsModal] = useState(false);
  const [localBalance, setLocalBalance] = useState<number | null>(null);

  const TOP_5_LIVE_ASSETS = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      category: 'Crypto',
      price: '₹68,342.56',
      returns: '90%',
      change: '+0.82%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_btc.png'),
      iconBg: '#f7931a',
      iconType: 'fa5' as const,
      iconName: 'bitcoin',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      category: 'Crypto',
      price: '₹2,948.12',
      returns: '88%',
      change: '+1.45%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_eth.png'),
      iconBg: '#6366f1',
      iconType: 'mci' as const,
      iconName: 'ethereum',
    },
    {
      id: 'gold',
      name: 'Gold',
      category: 'Commodity',
      price: '₹6,238.40',
      returns: '85%',
      change: '-0.34%',
      isPositive: false,
      sparkline: require('../../assets/sparkline_gold.png'),
      iconBg: '#eab308',
      iconType: 'mci' as const,
      iconName: 'gold',
    },
    {
      id: 'solana',
      name: 'Solana',
      category: 'Crypto',
      price: '₹13,420.00',
      returns: '90%',
      change: '+3.20%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_sol.png'),
      iconBg: '#a855f7',
      iconType: 'mci' as const,
      iconName: 'flash',
    },
    {
      id: 'silver',
      name: 'Silver',
      category: 'Commodity',
      price: '₹78.20',
      returns: '82%',
      change: '+0.15%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_btc.png'),
      iconBg: '#94a3b8',
      iconType: 'mci' as const,
      iconName: 'diamond-stone',
    },
  ];

  const LIVE_MARKET_ASSETS = TOP_5_LIVE_ASSETS;

  const listAnim = useRef(new Animated.Value(0)).current;

  const RECENT_WITHDRAWALS = [
    {
      name: 'Senthil Kumar',
      avatarBg: '#059669',
      amount: '1,500',
      method: 'UPI Bank',
      badgeBg: 'rgba(0, 230, 118, 0.15)',
      badgeColor: '#00e676',
      time: '2 mins ago',
      timeTa: '2 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Priya Dharshini',
      avatarBg: '#0284c7',
      amount: '800',
      method: 'Paytm',
      badgeBg: 'rgba(0, 180, 255, 0.15)',
      badgeColor: '#00b0ff',
      time: '5 mins ago',
      timeTa: '5 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Ramesh K',
      avatarBg: '#8b5cf6',
      amount: '2,500',
      method: 'PhonePe',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      badgeColor: '#c084fc',
      time: '12 mins ago',
      timeTa: '12 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Kavitha Rajan',
      avatarBg: '#d97706',
      amount: '3,200',
      method: 'IMPS Bank',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeColor: '#facc15',
      time: '20 mins ago',
      timeTa: '20 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Anand Murugan',
      avatarBg: '#10b981',
      amount: '950',
      method: 'GPay UPI',
      badgeBg: 'rgba(0, 230, 118, 0.15)',
      badgeColor: '#00e676',
      time: '34 mins ago',
      timeTa: '34 நிமிடங்களுக்கு முன்',
    },
  ];

  const ALL_RECENT_WITHDRAWALS = [
    { name: 'Senthil Kumar', avatarBg: '#8b5cf6', amount: '500', method: 'UPI', txnId: 'TXN-984321', time: '5 mins ago', timeTa: '5 நிமிடங்களுக்கு முன்' },
    { name: 'Kavitha Rajan', avatarBg: '#ec4899', amount: '1,200', method: 'GPay', txnId: 'TXN-984320', time: '14 mins ago', timeTa: '14 நிமிடங்களுக்கு முன்' },
    { name: 'Priya Dharshini', avatarBg: '#0284c7', amount: '300', method: 'Paytm', txnId: 'TXN-984319', time: '28 mins ago', timeTa: '28 நிமிடங்களுக்கு முன்' },
    { name: 'Ramesh K', avatarBg: '#6366f1', amount: '1,000', method: 'PhonePe', txnId: 'TXN-984318', time: '45 mins ago', timeTa: '45 நிமிடங்களுக்கு முன்' },
    { name: 'Anand Murugan', avatarBg: '#f59e0b', amount: '750', method: 'UPI', txnId: 'TXN-984317', time: '1 hour ago', timeTa: '1 மணி நேரத்திற்கு முன்' },
    { name: 'Divya Bharathi', avatarBg: '#f59e0b', amount: '2,000', method: 'GPay', txnId: 'TXN-984316', time: '1 hour ago', timeTa: '1 மணி நேரத்திற்கு முன்' },
    { name: 'Saravanan M', avatarBg: '#f59e0b', amount: '450', method: 'PhonePe', txnId: 'TXN-984315', time: '2 hours ago', timeTa: '2 மணி நேரத்திற்கு முன்' },
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

  // Subscribe to centralized wallet store
  useEffect(() => {
    const unsub = centralWalletStore.subscribe((bal) => {
      setLocalBalance(bal);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user?.walletBalance !== undefined && user?.walletBalance > 0) {
      centralWalletStore.setBalance(user.walletBalance);
    }
  }, [user?.walletBalance]);

  const displayBalance =
    localBalance !== null
      ? localBalance
      : user?.walletBalance !== undefined && user?.walletBalance > 0
      ? user.walletBalance
      : centralWalletStore.getBalance();

  if (viewMode === 'TRADE') {
    return (
      <TradePredictionScreen
        asset={selectedTradeAsset || TOP_5_LIVE_ASSETS[0]}
        user={user ? { ...user, walletBalance: displayBalance } : { id: 'guest', name: 'Guest Trader', walletBalance: displayBalance }}
        onBack={() => setViewMode('HOME')}
        onUpdateWallet={(newBal) => {
          centralWalletStore.setBalance(newBal);
          if (onBalanceUpdated) {
            onBalanceUpdated(newBal);
          }
        }}
      />
    );
  }

  if (viewMode === 'MARKET') {
    return (
      <View style={{ flex: 1, backgroundColor: '#030705' }}>
        <MarketAssetsScreen
          user={user ? { ...user, walletBalance: displayBalance } : { id: 'guest', walletBalance: displayBalance }}
          onBack={() => setViewMode('HOME')}
          onSelectAsset={(asset) => {
            setSelectedTradeAsset(asset);
            setViewMode('TRADE');
          }}
        />
        <CheckoutPaymentModal
          isOpen={!!selectedRoomForCheckout}
          room={selectedRoomForCheckout}
          user={user}
          onClose={() => setSelectedRoomForCheckout(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <TicketConfirmedModal
          isOpen={!!confirmedTicket}
          ticketData={confirmedTicket}
          onClose={() => setConfirmedTicket(null)}
        />
      </View>
    );
  }

  const handleBalancePress = () => {
    Alert.alert(
      'Wallet Balance',
      `Available Practice Cash: ₹${displayBalance.toLocaleString('en-IN')}`,
      [
        {
          text: '+₹10,000 Recharge',
          onPress: () => {
            const newBal = centralWalletStore.recharge(10000);
            if (onBalanceUpdated) onBalanceUpdated(newBal);
            Alert.alert('Recharge Successful', '₹10,000 Practice cash added to your wallet!');
          },
        },
        {
          text: 'Open Wallet',
          onPress: () => onOpenWallet && onOpenWallet(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'P';

  return (
    <View style={{ flex: 1, height: '100%', minHeight: 0, backgroundColor: '#030705', overflow: 'hidden' }}>
      {/* QuickTrade Reference Header Bar: Brand Logo on Left, Wallet Amount + Notification Bell on Right */}
      <View
        style={{
          backgroundColor: '#030705',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 48,
        }}
      >
        {/* Left: QuickTrade Horizontal Brand Logo (Chart Icon + Bold White Text) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Image
            source={require('../../assets/quicktrade_icon.png')}
            style={{
              width: 26,
              height: 18,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: -0.3,
            }}
          >
            QuickTrade
          </Text>
        </View>

        {/* Right: Wallet Amount Pill + Notification Bell */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Wallet Amount Badge (Replaces VIP Pill) */}
          <TouchableOpacity
            onPress={handleBalancePress}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 11,
              paddingVertical: 5.5,
              borderRadius: 14,
              borderWidth: 1.2,
              borderColor: '#00e676',
              backgroundColor: 'rgba(0, 230, 118, 0.12)',
            }}
          >
            <Ionicons name="wallet" size={13} color="#00e676" />
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: '900',
                color: '#00e676',
                letterSpacing: 0.2,
              }}
            >
              ₹{displayBalance.toLocaleString('en-IN')}
            </Text>
            <Ionicons name="add-circle" size={13} color="#00e676" />
          </TouchableOpacity>

          {/* White Notification Bell */}
          <TouchableOpacity
            onPress={() => setShowNotificationsModal(true)}
            activeOpacity={0.7}
            style={{ padding: 4 }}
          >
            <Ionicons name="notifications-outline" size={21} color="#f1f5f9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* QuickTrade Reference Hero Banner: Directly Under Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            setSelectedTradeAsset(TOP_5_LIVE_ASSETS[0]); setViewMode('TRADE');
          }}
          style={{
            height: 112,
            borderRadius: 20,
            borderWidth: 1.2,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            backgroundColor: '#070f0b',
            overflow: 'hidden',
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16,
            paddingRight: 6,
            shadowColor: '#00e676',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* Subtle Golden Glow aura behind the bullion */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 15,
              top: 15,
              width: 120,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#f59e0b',
              opacity: 0.16,
            }}
          />

          {/* Left: Banner Text (Predict Green or Red) */}
          <View style={{ flex: 1, paddingRight: 6, zIndex: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.3 }}>
              Predict <Text style={{ color: '#00e676' }}>Green</Text> or <Text style={{ color: '#ef4444' }}>Red</Text>
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#cbd5e1', marginTop: 5, lineHeight: 17 }}>
              Guess the next price move{'\n'}and earn up to <Text style={{ color: '#facc15', fontWeight: '900' }}>90%</Text> profit
            </Text>
          </View>

          {/* Right: 3D Bitcoin Coin & Gold Bullion Artwork */}
          <View style={{ width: 130, height: 100, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/quicktrade_hero_seamless.png')}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 4 QuickTrade Action Categories (Predict, Deposit, Withdraw, Rewards) - 1:1 Pixel-Perfect to Reference */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginTop: 6,
          marginBottom: 10,
          gap: 10,
        }}
      >
        {/* 1. Predict */}
        <TouchableOpacity
          onPress={() => {
            setSelectedTradeAsset(TOP_5_LIVE_ASSETS[0]); setViewMode('TRADE');
          }}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: '#07120c',
            borderWidth: 1,
            borderColor: 'rgba(0, 230, 118, 0.18)',
            borderRadius: 18,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00e676',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Image
            source={require('../../assets/quicktrade_cat_predict.png')}
            style={{ width: 46, height: 44, resizeMode: 'contain' }}
          />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', marginTop: 6, letterSpacing: 0.2 }}>
            Predict
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenWallet}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: '#071216',
            borderWidth: 1,
            borderColor: 'rgba(0, 180, 255, 0.18)',
            borderRadius: 18,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00b0ff',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Image
            source={require('../../assets/quicktrade_cat_deposit.png')}
            style={{ width: 46, height: 44, resizeMode: 'contain' }}
          />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', marginTop: 6, letterSpacing: 0.2 }}>
            Deposit
          </Text>
        </TouchableOpacity>

        {/* 3. Withdraw */}
        <TouchableOpacity
          onPress={onOpenWallet}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: '#141006',
            borderWidth: 1,
            borderColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: 18,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Image
            source={require('../../assets/quicktrade_cat_withdraw.png')}
            style={{ width: 46, height: 44, resizeMode: 'contain' }}
          />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', marginTop: 6, letterSpacing: 0.2 }}>
            Withdraw
          </Text>
        </TouchableOpacity>

        {/* 4. Rewards */}
        <TouchableOpacity
          onPress={() => setShowRewardsModal(true)}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: '#120816',
            borderWidth: 1,
            borderColor: 'rgba(168, 85, 247, 0.2)',
            borderRadius: 18,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#a855f7',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Image
            source={require('../../assets/quicktrade_cat_rewards.png')}
            style={{ width: 46, height: 44, resizeMode: 'contain' }}
          />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', marginTop: 6, letterSpacing: 0.2 }}>
            Rewards
          </Text>
        </TouchableOpacity>
      </View>





      {/* Main Content ScrollView */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: selectedCategory === 'RECOMMENDED' ? 0 : 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRooms} tintColor="#00e676" />}
      >
        {selectedCategory === 'RECOMMENDED' ? (
          <View style={{ paddingBottom: 10 }}>
            {/* Live Assets (Market Trends) Section - Top 5 Live Assets */}
            <View style={{ marginBottom: 18 }}>
              {/* Header: Live Assets Title & View All */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: -0.3 }}>
                  Live Assets
                </Text>
                <TouchableOpacity
                  onPress={() => setViewMode('MARKET')}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#00e676' }}>View All</Text>
                  <Ionicons name="chevron-forward" size={13} color="#00e676" />
                </TouchableOpacity>
              </View>

              {/* 5 Live Asset Cards - with Payment, Returns % and Bid Now Button */}
              {TOP_5_LIVE_ASSETS.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  activeOpacity={0.88}
                  onPress={() => { setSelectedTradeAsset(asset); setViewMode('TRADE'); }}
                  style={{
                    backgroundColor: '#071317',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {/* Left: Squircle Icon & Symbol/Name */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 88 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 11,
                        backgroundColor: asset.iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: asset.iconBg,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.35,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {asset.iconType === 'fa5' ? (
                        <FontAwesome5 name={asset.iconName as any} size={19} color="#ffffff" />
                      ) : (
                        <MaterialCommunityIcons name={asset.iconName as any} size={20} color="#ffffff" />
                      )}
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                        {asset.name}
                      </Text>
                      <Text style={{ fontSize: 10.5, fontWeight: '500', color: '#94a3b8', marginTop: 1 }}>
                        {asset.category} • Live
                      </Text>
                    </View>
                  </View>

                  {/* Center: Glowing Sparkline */}
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Image
                      source={asset.sparkline}
                      style={{ width: 56, height: 22, resizeMode: 'contain' }}
                    />
                  </View>

                  {/* Right: Payment (Price), Returns % & Bid Now Button */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Payment Price & Returns % */}
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                        {asset.price}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 2,
                          backgroundColor: asset.isPositive ? 'rgba(0, 230, 118, 0.12)' : 'rgba(239, 68, 68, 0.14)',
                          paddingHorizontal: 5,
                          paddingVertical: 1.5,
                          borderRadius: 5,
                          marginTop: 2,
                          borderWidth: 1,
                          borderColor: asset.isPositive ? 'rgba(0, 230, 118, 0.3)' : 'rgba(239, 68, 68, 0.35)',
                        }}
                      >
                        <Ionicons
                          name={asset.isPositive ? 'trending-up' : 'trending-down'}
                          size={9}
                          color={asset.isPositive ? '#00e676' : '#ff4d4d'}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '900',
                            color: asset.isPositive ? '#00e676' : '#ff4d4d',
                          }}
                        >
                          {asset.change} • {asset.returns} Return
                        </Text>
                      </View>
                    </View>

                    {/* Bid Now Action Button */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => { setSelectedTradeAsset(asset); setViewMode('TRADE'); }}
                      style={{
                        backgroundColor: '#00c853',
                        paddingHorizontal: 11,
                        paddingVertical: 7,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#00c853',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.4,
                        shadowRadius: 5,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#ffffff', letterSpacing: 0.2 }}>
                        Bid Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Withdrawals Section - Directly Below Live Assets */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#00e676" />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
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
                    backgroundColor: 'rgba(0, 230, 118, 0.1)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 230, 118, 0.25)',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#00e676' }}>
                    {currentLang === 'ta' ? 'அனைத்தும் காண்க →' : 'View All →'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {RECENT_WITHDRAWALS.map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: 156,
                      backgroundColor: '#071317',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      padding: 12,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: w.avatarBg, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>{w.name[0]}</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', flex: 1 }} numberOfLines={1}>
                        {w.name}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 }}>
                      <Ionicons name="checkmark-circle" size={12} color="#00e676" />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#00e676' }}>
                        Withdrawal Successful
                      </Text>
                    </View>

                    <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: '#ffffff' }}>
                        ₹{w.amount}
                      </Text>
                      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#94a3b8' }}>
                          {w.method}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
                      {currentLang === 'ta' ? w.timeTa : w.time}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* QuickTrade Trust & Security Badge */}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 18,
                marginTop: 6,
                marginBottom: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={16} color="#00e676" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>
                  QuickTrade Guaranteed Security
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                256-Bit SSL Encryption • Instant Payouts • 24/7 Verified
              </Text>
            </View>
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
                    backgroundColor: '#140c01',
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: '#4a3500',
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
                          backgroundColor: '#130b01',
                          borderWidth: 1,
                          borderColor: '#4b3500',
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
                          <Ionicons name="calendar" size={14} color="#f59e0b" />
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

                        <View style={{ width: 1, height: 16, backgroundColor: '#4b3500' }} />

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
                          <Ionicons name="people" size={12} color="#d97706" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('players')}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 17, fontWeight: '900', color: '#d97706', marginTop: 2 }}>
                          {room.currentPlayers || 0}/{room.maxPlayers}
                        </Text>
                      </View>
                    </View>

                    {/* VIBRANT 3D GLOWING GOLD ACTION BUTTON (Exact Match to Mockup) */}
                    {isRegistered ? (
                      windowOpen || room.status === 'WAITING_RESULTS' ? (
                        <TouchableOpacity
                          onPress={() => handleEnterArena(room)}
                          activeOpacity={0.85}
                          style={{
                            backgroundColor: '#f59e0b',
                            borderBottomWidth: 4,
                            borderBottomColor: '#b45309',
                            borderRadius: 18,
                            paddingVertical: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 8,
                            marginTop: 14,
                            shadowColor: '#f59e0b',
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
                            backgroundColor: '#191102',
                            borderWidth: 1.5,
                            borderColor: '#f59e0b',
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
                          <Ionicons name="checkmark-circle" size={16} color="#f59e0b" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fbbf24' }}>
                            {t('slot_confirmed')} (Doors open {room.joinWindowMinutes || 10}m prior)
                          </Text>
                        </View>
                      )
                    ) : (
                      <TouchableOpacity
                        onPress={() => setSelectedRoomForCheckout(room)}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: '#f59e0b',
                          borderBottomWidth: 4,
                          borderBottomColor: '#b45309',
                          borderRadius: 18,
                          paddingVertical: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                          marginTop: 14,
                          shadowColor: '#f59e0b',
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#070f0b',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 1,
              borderColor: 'rgba(0, 230, 118, 0.2)',
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 32,
              maxHeight: '82%',
            }}
          >
            {/* Grab Handle */}
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignSelf: 'center', marginBottom: 14 }} />

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-done-circle" size={20} color="#00e676" />
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>
                    {currentLang === 'ta' ? 'அனைத்து பணப் பரிமாற்றங்கள்' : 'Live Verified Payouts'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="shield-checkmark" size={13} color="#00e676" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#00e676' }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
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
                    backgroundColor: '#0a1618',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
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
                        <Ionicons name="checkmark-circle" size={12} color="#00e676" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#00e676' }}>
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
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff' }}>
                      ₹{w.amount}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(0, 230, 118, 0.12)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#00e676' }}>
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

      {/* QuickTrade VIP Club Modal */}
      <Modal
        visible={showVipModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVipModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#070f0b',
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: '#f59e0b',
              padding: 22,
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#f59e0b',
                  }}
                >
                  <FontAwesome5 name="crown" size={16} color="#fbbf24" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>
                  QuickTrade VIP
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowVipModal(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* VIP Card Tier */}
            <View
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.25)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Current Status</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#fbbf24', marginTop: 2 }}>VIP Gold Trader</Text>
                </View>
                <View style={{ backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#000000' }}>Active</Text>
                </View>
              </View>
            </View>

            {/* VIP Perks */}
            <View style={{ gap: 10, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#00e676" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#e2e8f0' }}>Up to 90% instant prediction profit payouts</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#00e676" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#e2e8f0' }}>Instant UPI Bank withdrawals under 60 seconds</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#00e676" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#e2e8f0' }}>Zero deposit & withdrawal processing fee</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#00e676" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#e2e8f0' }}>Dedicated 24/7 VIP WhatsApp support</Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowVipModal(false)}
              activeOpacity={0.85}
              style={{
                height: 48,
                borderRadius: 24,
                backgroundColor: '#f59e0b',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#000000' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#070f0b',
              borderRadius: 24,
              borderWidth: 1.2,
              borderColor: 'rgba(255, 255, 255, 0.15)',
              padding: 22,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="notifications" size={20} color="#00e676" />
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginBottom: 20 }}>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#00e676' }}>Welcome Bonus Credited</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>₹50 joining bonus has been added to your trade wallet.</Text>
                <Text style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>Just now</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#fbbf24' }}>60s Fast Trade Arena Open</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>New BTC/USD prediction round is live with up to 90% payout.</Text>
                <Text style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>10 mins ago</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowNotificationsModal(false)}
              activeOpacity={0.85}
              style={{
                height: 46,
                borderRadius: 23,
                backgroundColor: '#00c853',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QuickTrade Rewards Modal */}
      <Modal
        visible={showRewardsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#0e0814',
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: '#a855f7',
              padding: 22,
              shadowColor: '#a855f7',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#a855f7',
                  }}
                >
                  <Ionicons name="gift" size={18} color="#c084fc" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>
                  QuickTrade Rewards
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRewardsModal(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Reward Cards */}
            <View style={{ gap: 10, marginBottom: 20 }}>
              <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.25)', borderRadius: 16, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>Welcome Trader Bonus</Text>
                    <Text style={{ fontSize: 11, color: '#c084fc', marginTop: 2 }}>₹50 Real Cash added to Wallet</Text>
                  </View>
                  <View style={{ backgroundColor: '#a855f7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>Claimed</Text>
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>Refer & Earn ₹100</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Invite friends to trade and earn cash</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.8} style={{ backgroundColor: '#00c853', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>Invite</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>90% Payout Multiplier</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Active on all Green / Red predictions</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', borderWidth: 1, borderColor: '#00e676', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#00e676' }}>Active</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => setShowRewardsModal(false)}
              activeOpacity={0.85}
              style={{
                height: 48,
                borderRadius: 24,
                backgroundColor: '#a855f7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#ffffff' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
    </View>
  );
}
