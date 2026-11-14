import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { centralWalletStore } from '../services';

interface MarketAssetsScreenProps {
  user?: any;
  onBack: () => void;
  onSelectAsset?: (asset: any) => void;
}

export const ALL_MARKET_ASSETS = [
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
  {
    id: 'tether',
    name: 'Tether USD',
    category: 'Crypto',
    price: '₹83.45',
    returns: '80%',
    change: '+0.05%',
    isPositive: true,
    sparkline: require('../../assets/sparkline_btc.png'),
    iconBg: '#10b981',
    iconType: 'io' as const,
    iconName: 'cash',
  },
  {
    id: 'crude-oil',
    name: 'Crude Oil',
    category: 'Commodity',
    price: '₹6,120.00',
    returns: '86%',
    change: '+1.10%',
    isPositive: true,
    sparkline: require('../../assets/sparkline_eth.png'),
    iconBg: '#b45309',
    iconType: 'io' as const,
    iconName: 'water',
  },
  {
    id: 'euro',
    name: 'Euro',
    category: 'Forex',
    price: '₹89.20',
    returns: '85%',
    change: '-0.08%',
    isPositive: false,
    sparkline: require('../../assets/sparkline_gold.png'),
    iconBg: '#059669',
    iconType: 'io' as const,
    iconName: 'globe-outline',
  },
];

export default function MarketAssetsScreen({ user, onBack, onSelectAsset }: MarketAssetsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRYPTO' | 'COMMODITY' | 'FOREX'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [balance, setBalance] = useState<number>(() => {
    if (user?.walletBalance !== undefined && user?.walletBalance > 0) {
      return user.walletBalance;
    }
    return centralWalletStore.getBalance();
  });

  useEffect(() => {
    const unsub = centralWalletStore.subscribe((bal) => {
      setBalance(bal);
    });
    return unsub;
  }, []);

  const displayBalance = balance;

  const filteredAssets = ALL_MARKET_ASSETS.filter((asset) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'CRYPTO' && asset.category === 'Crypto') ||
      (activeFilter === 'COMMODITY' && asset.category === 'Commodity') ||
      (activeFilter === 'FOREX' && asset.category === 'Forex');

    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#030705' }}>
      <StatusBar barStyle="light-content" backgroundColor="#030705" />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: '#030705',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#071317',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.3 }}>
            Live Market Assets
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#00e676', marginTop: 1 }}>
            ● 24/7 Fast Prediction Markets
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 13,
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
            borderWidth: 1.2,
            borderColor: '#00e676',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Ionicons name="wallet" size={12} color="#00e676" />
          <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#00e676' }}>
            ₹{displayBalance.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
        <View
          style={{
            backgroundColor: '#071317',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            height: 44,
            gap: 10,
          }}
        >
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search Bitcoin, Gold, Ethereum..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: '600',
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
        {[
          { key: 'ALL', label: 'All Markets' },
          { key: 'CRYPTO', label: 'Crypto' },
          { key: 'COMMODITY', label: 'Commodities' },
          { key: 'FOREX', label: 'Forex' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key as any)}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: isActive ? '#00c853' : '#071317',
                borderWidth: 1,
                borderColor: isActive ? '#00e676' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '800',
                  color: isActive ? '#ffffff' : '#94a3b8',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Asset List ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50, gap: 8 }}
      >
        {filteredAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            activeOpacity={0.88}
            onPress={() => onSelectAsset && onSelectAsset(asset)}
            style={{
              backgroundColor: '#071317',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              paddingHorizontal: 12,
              paddingVertical: 12,
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
            {/* Left: Squircle Icon & Clean Name (Bitcoin, Gold, etc.) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 95 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
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
                  <FontAwesome5 name={asset.iconName as any} size={20} color="#ffffff" />
                ) : asset.iconType === 'mci' ? (
                  <MaterialCommunityIcons name={asset.iconName as any} size={21} color="#ffffff" />
                ) : (
                  <Ionicons name={asset.iconName as any} size={20} color="#ffffff" />
                )}
              </View>
              <View>
                <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                  {asset.name}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '500', color: '#94a3b8', marginTop: 1 }}>
                  {asset.category} • Live
                </Text>
              </View>
            </View>

            {/* Center: Glowing Sparkline */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              {asset.sparkline && (
                <Image
                  source={asset.sparkline}
                  style={{ width: 56, height: 22, resizeMode: 'contain' }}
                />
              )}
            </View>

            {/* Right: Price, Returns % & Bid Now Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Payment Price & Returns % */}
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
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
                onPress={() => onSelectAsset && onSelectAsset(asset)}
                style={{
                  backgroundColor: '#00c853',
                  paddingHorizontal: 12,
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
      </ScrollView>
    </View>
  );
}

