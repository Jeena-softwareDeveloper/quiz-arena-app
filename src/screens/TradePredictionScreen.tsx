import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tradingService, CandleData, TradeAssetData, TradeBetResult } from '../services/tradingService';
import { centralWalletStore } from '../services';
import { getSocket } from '../services/socket';
import QuotexTradingViewChart from '../components/QuotexTradingViewChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TradePredictionScreenProps {
  asset: {
    id: string;
    name: string;
    symbol?: string;
    price: string | number;
    change?: string;
    isPositive?: boolean;
    returns?: string;
    category?: string;
  };
  user: any;
  onBack: () => void;
  onUpdateWallet?: (newBalance: number) => void;
}

export default function TradePredictionScreen({
  asset,
  user,
  onBack,
  onUpdateWallet,
}: TradePredictionScreenProps) {
  // Parsing initial price
  const parseNumPrice = (p: string | number) => {
    if (typeof p === 'number') return p;
    return parseFloat(p.replace(/[^0-9.]/g, '')) || 68342.56;
  };

  const initialPrice = parseNumPrice(asset.price);
  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);
  const [isPositive, setIsPositive] = useState<boolean>(asset.isPositive ?? true);
  const [changeText, setChangeText] = useState<string>(asset.change || '+0.82%');
  const [payoutRate, setPayoutRate] = useState<number>(
    parseInt(asset.returns?.replace('%', '') || '90', 10)
  );

  // Timeframe
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1m');
  const timeframes = ['1m', '5m', '15m', '30m', '1H'];

  // Quotex / Binomo Chart Type ('candles' or 'area' mountain wave)
  const [chartType, setChartType] = useState<'candles' | 'area'>('candles');

  // Amount selection
  const presetAmounts = [100, 500, 1000, 5000];
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);

  // Candlestick data
  const [candles, setCandles] = useState<CandleData[]>([]);

  // Active Trade State
  const [activeTrade, setActiveTrade] = useState<TradeBetResult | null>(null);
  const [tradeTimeLeft, setTradeTimeLeft] = useState<number>(0);
  const [orderToast, setOrderToast] = useState<{
    message: string;
    entry: number;
    direction: 'UP' | 'DOWN';
  } | null>(null);
  const [tradeResultModal, setTradeResultModal] = useState<{
    visible: boolean;
    isWin: boolean;
    amount: number;
    winPayout: number;
    entryPrice: number;
    resultPrice: number;
    direction: 'UP' | 'DOWN';
  } | null>(null);

  const initialBal = user?.walletBalance !== undefined && user?.walletBalance > 0 ? user.walletBalance : centralWalletStore.getBalance();
  const [walletBalance, setWalletBalance] = useState<number>(initialBal);

  // Subscribe to centralized wallet store
  useEffect(() => {
    const unsub = centralWalletStore.subscribe((bal) => {
      setWalletBalance(bal);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user?.walletBalance !== undefined && user?.walletBalance > 0) {
      centralWalletStore.setBalance(user.walletBalance);
    }
  }, [user?.walletBalance]);

  // Smooth animated price ticker (interpolates every 40ms for buttery-smooth glide)
  const targetPriceRef = useRef<number>(initialPrice);
  const [animatedDisplayPrice, setAnimatedDisplayPrice] = useState<number>(initialPrice);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    targetPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    // 60fps micro-interpolation for buttery smooth price movement
    const animInterval = setInterval(() => {
      setAnimatedDisplayPrice((prev) => {
        const target = targetPriceRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.01) return target;
        return prev + diff * 0.22;
      });
    }, 40);

    // Glowing pulse animation for current price beacon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(animInterval);
  }, []);

  // Live Socket connection & fallback polling
  useEffect(() => {
    let isMounted = true;

    // Initial fetch from API
    tradingService.getCandles(asset.id).then((res) => {
      if (!isMounted) return;
      if (res.candles && res.candles.length > 0) {
        setCandles(res.candles);
        const last = res.candles[res.candles.length - 1];
        setCurrentPrice(last.close);
      } else {
        // Generate simulated candles
        setCandles(generateSimulatedCandles(initialPrice, 28));
      }
      if (res.asset) {
        setPayoutRate(res.asset.payoutRate);
        setIsPositive(res.asset.isPositive);
        setChangeText(res.asset.change);
      }
    });

    // Socket listener
    const socket = getSocket();
    let lastSocketTime = 0;

    const handlePriceTick = (data: {
      assetId: string;
      price: number;
      change?: string;
      isPositive?: boolean;
      candle: CandleData;
    }) => {
      if (data.assetId === asset.id) {
        lastSocketTime = Date.now();
        setCurrentPrice(data.price);
        if (data.change) setChangeText(data.change);
        if (data.isPositive !== undefined) setIsPositive(data.isPositive);

        setCandles((prev) => {
          if (prev.length === 0) return [data.candle];
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx].time === data.candle.time) {
            updated[lastIdx] = data.candle;
          } else {
            updated.push(data.candle);
            if (updated.length > 30) updated.shift();
          }
          return updated;
        });
      }
    };

    const handleAssetUpdated = (updatedAsset: TradeAssetData) => {
      if (updatedAsset.id === asset.id) {
        setPayoutRate(updatedAsset.payoutRate);
        setIsPositive(updatedAsset.isPositive);
        setChangeText(updatedAsset.change);
        setCurrentPrice(updatedAsset.price);
      }
    };

    socket.on('trade:price_tick', handlePriceTick);
    socket.on('trade:asset_updated', handleAssetUpdated);

    // Watchdog fallback ticker (runs ONLY if socket has been quiet for > 3 seconds)
    const fallbackTicker = setInterval(() => {
      if (Date.now() - lastSocketTime < 3000) return; // Prevent double-ticker clash

      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        const delta = (Math.random() - 0.49) * (last.close * 0.0003);
        const nextPrice = Math.round((last.close + delta) * 100) / 100;
        last.close = nextPrice;
        last.high = Math.max(last.high, nextPrice);
        last.low = Math.min(last.low, nextPrice);
        updated[updated.length - 1] = last;
        setCurrentPrice(nextPrice);
        return updated;
      });
    }, 1500);

    return () => {
      isMounted = false;
      socket.off('trade:price_tick', handlePriceTick);
      socket.off('trade:asset_updated', handleAssetUpdated);
      clearInterval(fallbackTicker);
    };
  }, [asset.id]);

  // Active Trade Countdown Timer
  useEffect(() => {
    if (!activeTrade) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSec = Math.max(0, Math.ceil((activeTrade.expiresAt - now) / 1000));
      setTradeTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(interval);
        // Settle trade
        const isWin =
          activeTrade.direction === 'UP'
            ? currentPrice >= activeTrade.entryPrice
            : currentPrice <= activeTrade.entryPrice;

        const winAmount = isWin ? activeTrade.potentialWin : 0;
        if (isWin) {
          const newBal = centralWalletStore.addWin(winAmount, `${asset.name} Trade Win Payout (+₹${winAmount.toLocaleString('en-IN')})`);
          if (onUpdateWallet) onUpdateWallet(newBal);
        }

        setTradeResultModal({
          visible: true,
          isWin,
          amount: activeTrade.amount,
          winPayout: activeTrade.potentialWin,
          entryPrice: activeTrade.entryPrice,
          resultPrice: currentPrice,
          direction: activeTrade.direction,
        });

        setActiveTrade(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [activeTrade, currentPrice, walletBalance]);

  // Handle User Prediction
  const handlePredict = async (direction: 'UP' | 'DOWN') => {
    if (activeTrade) {
      Alert.alert('Trade in Progress', 'Please wait for current round to settle before placing another trade.');
      return;
    }

    if (walletBalance < selectedAmount) {
      Alert.alert(
        'Practice Balance Low',
        `Your balance is ₹${walletBalance.toLocaleString('en-IN')}. Would you like to recharge ₹10,000 free practice cash to place your prediction?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Recharge ₹10,000',
            onPress: () => {
              const newBal = centralWalletStore.recharge(10000);
              if (onUpdateWallet) onUpdateWallet(newBal);
            },
          },
        ]
      );
      return;
    }

    // Call backend API
    const res = await tradingService.placePrediction({
      assetId: asset.id,
      amount: selectedAmount,
      direction,
    });

    const now = Date.now();
    const expiresAt = now + 30 * 1000;
    const potentialWin = Math.round(selectedAmount * (1 + payoutRate / 100));
    const entryPriceNumber = Number(currentPrice);

    // Instant Visual Order Placed Feedback
    setOrderToast({
      message: `🎯 ₹${selectedAmount} ${direction === 'UP' ? 'CALL (UP)' : 'PUT (DOWN)'} Placed!`,
      entry: entryPriceNumber,
      direction,
    });
    setTimeout(() => {
      setOrderToast(null);
    }, 4000);

    if (res.success && res.bet) {
      setActiveTrade({
        ...res.bet,
        entryPrice: Number(res.bet.entryPrice || entryPriceNumber),
      });
      if (res.newWalletBalance !== undefined) {
        centralWalletStore.setBalance(res.newWalletBalance);
        if (onUpdateWallet) onUpdateWallet(res.newWalletBalance);
      } else {
        centralWalletStore.deduct(selectedAmount, `${asset.name} Trade Prediction (${direction})`);
        if (onUpdateWallet) onUpdateWallet(centralWalletStore.getBalance());
      }
    } else {
      // Local optimistic trade
      centralWalletStore.deduct(selectedAmount, `${asset.name} Trade Prediction (${direction})`);
      if (onUpdateWallet) onUpdateWallet(centralWalletStore.getBalance());

      setActiveTrade({
        id: `LOCAL-${Date.now()}`,
        userId: user?.id || 'guest',
        assetId: asset.id,
        amount: selectedAmount,
        direction,
        entryPrice: entryPriceNumber,
        payoutRate,
        potentialWin,
        placedAt: now,
        expiresAt,
        status: 'ACTIVE',
      });
    }

    setTradeTimeLeft(30);
  };

  // Helper to generate initial dummy candles if backend is starting
  function generateSimulatedCandles(base: number, count: number): CandleData[] {
    const list: CandleData[] = [];
    const now = Date.now();
    let runningPrice = base;
    const volatility = base * 0.0006;
    for (let i = 0; i < count; i++) {
      const time = now - i * 60000;
      const close = Math.round(runningPrice * 100) / 100;
      const delta = (Math.random() - 0.49) * volatility;
      const open = Math.round((runningPrice - delta) * 100) / 100;
      const wickExtra = Math.random() * (volatility * 0.5);
      const high = Math.round((Math.max(open, close) + wickExtra) * 100) / 100;
      const low = Math.round((Math.min(open, close) - wickExtra) * 100) / 100;
      list.unshift({ time, open, high, low, close });
      runningPrice = open;
    }
    return list;
  }

  // Display symbol
  const displaySymbol = asset.symbol || (asset.id === 'bitcoin' ? 'BTC/USDT' : asset.id === 'gold' ? 'XAU/USD' : `${asset.name.toUpperCase()}/USDT`);

  return (
    <View style={{ flex: 1, backgroundColor: '#030806' }}>
      {/* Top Header */}
      <View
        style={{
          paddingTop: 50,
          paddingBottom: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
          backgroundColor: '#020604',
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#ffffff', letterSpacing: 0.3 }}>
            {displaySymbol}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00e676' }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8' }}>
              Live Market • {selectedTimeframe} Candlestick
            </Text>
          </View>
        </View>

        {/* Balance Badge with Quick Recharge */}
        <TouchableOpacity
          onPress={() => {
            const newBal = centralWalletStore.recharge(10000);
            if (onUpdateWallet) onUpdateWallet(newBal);
            Alert.alert('Practice Balance Recharged', '₹10,000 Practice cash added to your wallet!');
          }}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#00e676',
          }}
        >
          <Ionicons name="wallet" size={13} color="#00e676" />
          <Text style={{ fontSize: 12, fontWeight: '900', color: '#00e676' }}>
            ₹{walletBalance.toLocaleString('en-IN')}
          </Text>
          <Ionicons name="add-circle" size={13} color="#00e676" />
        </TouchableOpacity>
      </View>

      {/* Instant Order Placed Floating Toast */}
      {orderToast && (
        <View
          style={{
            position: 'absolute',
            top: 104,
            left: 14,
            right: 14,
            backgroundColor: orderToast.direction === 'UP' ? '#042713' : '#450a0a',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: orderToast.direction === 'UP' ? '#00e676' : '#ef4444',
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 9999,
            shadowColor: orderToast.direction === 'UP' ? '#00e676' : '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.9,
            shadowRadius: 10,
            elevation: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons
              name={orderToast.direction === 'UP' ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={22}
              color={orderToast.direction === 'UP' ? '#00e676' : '#ef4444'}
            />
            <View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>
                {orderToast.message}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8' }}>
                Entry: ₹{orderToast.entry.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: orderToast.direction === 'UP' ? '#00e676' : '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#000000' }}>30s ACTIVE</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Price & Change Section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
              ₹{animatedDisplayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                backgroundColor: isPositive ? 'rgba(0, 230, 118, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isPositive ? 'rgba(0, 230, 118, 0.35)' : 'rgba(239, 68, 68, 0.35)',
              }}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={11}
                color={isPositive ? '#00e676' : '#ff4d4d'}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '900',
                  color: isPositive ? '#00e676' : '#ff4d4d',
                }}
              >
                {changeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Quotex & Binomo Official Lightweight Charts Canvas Engine */}
        <QuotexTradingViewChart
          candles={candles}
          currentPrice={animatedDisplayPrice}
          isPositive={isPositive}
          activeTrade={activeTrade}
          chartType={chartType}
          onChangeChartType={setChartType}
          height={290}
          timeframes={timeframes}
          selectedTimeframe={selectedTimeframe}
          onSelectTimeframe={setSelectedTimeframe}
        />

        {activeTrade && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              backgroundColor: '#0a1711',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1.5,
              borderColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              shadowColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
                  }}
                />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>
                  Active {activeTrade.direction === 'UP' ? 'GREEN' : 'RED'} Trade (₹{activeTrade.amount})
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#facc15' }}>
                  ⏳ {tradeTimeLeft}s
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                Entry: <Text style={{ color: '#ffffff', fontWeight: '800' }}>₹{activeTrade.entryPrice}</Text>
              </Text>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                Potential Win: <Text style={{ color: '#00e676', fontWeight: '900' }}>₹{activeTrade.potentialWin}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Select Amount Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff', marginBottom: 10 }}>
            Select Amount
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {presetAmounts.map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.8}
                  onPress={() => setSelectedAmount(amt)}
                  style={{
                    flex: 1,
                    backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.18)' : '#07120c',
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                    shadowColor: isSelected ? '#38bdf8' : undefined,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.3 : 0,
                    shadowRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '900',
                      color: isSelected ? '#38bdf8' : '#ffffff',
                    }}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Predict Next Move Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>
              Predict Next Move
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#00e676' }}>
              Payout {payoutRate}%
            </Text>
          </View>

          {/* GREEN & RED Big Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* GREEN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePredict('UP')}
              style={{
                flex: 1,
                backgroundColor: '#00c853',
                borderRadius: 18,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#00e676',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="arrow-up" size={18} color="#ffffff" />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 }}>
                  GREEN
                </Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                (Price will go up)
              </Text>
            </TouchableOpacity>

            {/* RED BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePredict('DOWN')}
              style={{
                flex: 1,
                backgroundColor: '#d32f2f',
                borderRadius: 18,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="arrow-down" size={18} color="#ffffff" />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 }}>
                  RED
                </Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                (Price will go down)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Trade Settlement Result Modal */}
      <Modal
        visible={!!tradeResultModal?.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setTradeResultModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              backgroundColor: '#0c1a14',
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: tradeResultModal?.isWin ? '#00e676' : '#ef4444',
              shadowColor: tradeResultModal?.isWin ? '#00e676' : '#ef4444',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: tradeResultModal?.isWin ? 'rgba(0, 230, 118, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Ionicons
                name={tradeResultModal?.isWin ? 'trophy' : 'close-circle'}
                size={34}
                color={tradeResultModal?.isWin ? '#00e676' : '#ef4444'}
              />
            </View>

            <Text style={{ fontSize: 20, fontWeight: '900', color: '#ffffff', textAlign: 'center' }}>
              {tradeResultModal?.isWin ? '🎉 Trade Won!' : 'Trade Expired'}
            </Text>

            <Text
              style={{
                fontSize: tradeResultModal?.isWin ? 26 : 14,
                fontWeight: '900',
                color: tradeResultModal?.isWin ? '#00e676' : '#94a3b8',
                marginTop: 6,
                textAlign: 'center',
              }}
            >
              {tradeResultModal?.isWin ? `+₹${tradeResultModal?.winPayout}` : 'Better luck next round!'}
            </Text>

            <View
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 14,
                padding: 12,
                marginTop: 16,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>Invested:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>
                  ₹{tradeResultModal?.amount}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>Entry Price:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>
                  ₹{tradeResultModal?.entryPrice}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>Exit Price:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>
                  ₹{tradeResultModal?.resultPrice}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setTradeResultModal(null)}
              style={{
                width: '100%',
                backgroundColor: tradeResultModal?.isWin ? '#00c853' : '#334155',
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#ffffff' }}>
                Continue Trading
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
