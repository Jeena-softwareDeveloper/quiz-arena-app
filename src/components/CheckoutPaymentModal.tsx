import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { roomService } from '../services';
import { LiveCountdown } from './LiveCountdown';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  room: any;
  user: any;
  onClose: () => void;
  onPaymentSuccess: (result: { newBalance: number; ticketId: string; room: any }) => void;
  onRechargeRequired?: () => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
  isOpen,
  room,
  user,
  onClose,
  onPaymentSuccess,
  onRechargeRequired,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !room) return null;

  const entryFee = room.entryFee || 10;
  const currentBalance = user?.walletBalance || 0;
  const isBalanceSufficient = currentBalance >= entryFee;
  const balanceAfter = Math.max(0, currentBalance - entryFee);

  const handleConfirmPayment = async () => {
    if (!isBalanceSufficient) {
      setErrorMsg(t('insufficient_balance'));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await roomService.joinRoom(room.id);
      const newBal = (res as any).newWalletBalance !== undefined ? (res as any).newWalletBalance : balanceAfter;
      const tktId = (res as any).ticketId || `TKT-${room.id.substring(0, 6).toUpperCase()}`;

      onPaymentSuccess({
        newBalance: newBal,
        ticketId: tktId,
        room: { ...room, isRegistered: true },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledTime = (timeStr?: string) => {
    if (!timeStr) return '15m from now';
    return new Date(timeStr).toLocaleString('en-IN', {
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

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(1, 8, 5, 0.85)',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 430,
            backgroundColor: '#071f17',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 0,
            padding: 24,
            paddingBottom: 36,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Top Notch Indicator */}
          <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: '#0f5139', alignSelf: 'center', marginBottom: 16 }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#ffffff' }}>{t('checkout_title')}</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t('checkout_subtitle')}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#052017', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Tournament Summary Card */}
          <View
            style={{
              backgroundColor: '#052017',
              borderRadius: 18,
              padding: 16,
              borderWidth: 0,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ backgroundColor: '#063728', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#34d399' }}>{room.category}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#451a03', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Ionicons name="trophy" size={11} color="#facc15" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#facc15' }}>Prize: ₹{room.prizePool}</Text>
              </View>
            </View>

            <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff', lineHeight: 20 }}>{room.title}</Text>

            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#0a3827', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="play" size={11} color="#10b981" />
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                    {t('starts_at', 'Starts')}: <Text style={{ fontWeight: '700', color: '#34d399' }}>{formatScheduledTime(room.scheduledStartTime)}</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="flag" size={11} color="#f59e0b" />
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                    {t('closes_at', 'Closes')}: <Text style={{ fontWeight: '700', color: '#fbbf24' }}>{getClosingTime(room.scheduledStartTime, room.scheduledEndTime)}</Text>
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                <LiveCountdown scheduledStartTime={room.scheduledStartTime} scheduledEndTime={room.scheduledEndTime} variant="dark" />
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={{ backgroundColor: '#051b14', borderRadius: 16, padding: 14, borderWidth: 0, marginBottom: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('entry_fee_due')}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>₹{entryFee.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('platform_fee')}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#34d399' }}>₹0.00 (FREE)</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#0c3d2c', marginVertical: 2 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>{t('total_payable')}</Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#34d399' }}>₹{entryFee.toFixed(2)}</Text>
            </View>
          </View>

          {/* Wallet Balance Status */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: isBalanceSufficient ? '#06281e' : '#450a0a',
              borderRadius: 14,
              borderWidth: 0,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={isBalanceSufficient ? 'wallet' : 'alert-circle'}
                size={18}
                color={isBalanceSufficient ? '#10b981' : '#f87171'}
              />
              <View>
                <Text style={{ fontSize: 11, color: isBalanceSufficient ? '#a7f3d0' : '#fca5a5' }}>
                  {t('wallet_balance')}: ₹{currentBalance.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: isBalanceSufficient ? '#34d399' : '#f87171' }}>
                  {isBalanceSufficient
                    ? `${t('balance_after')}: ₹${balanceAfter.toFixed(2)}`
                    : t('insufficient_balance')}
                </Text>
              </View>
            </View>

            {!isBalanceSufficient && onRechargeRequired && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onRechargeRequired();
                }}
                style={{ backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>Recharge</Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMsg ? (
            <Text style={{ fontSize: 11, color: '#f87171', marginBottom: 12, textAlign: 'center' }}>{errorMsg}</Text>
          ) : null}

          {/* 3D Action Pay Button */}
          <TouchableOpacity
            onPress={handleConfirmPayment}
            disabled={loading || !isBalanceSufficient}
            activeOpacity={0.85}
            style={{
              backgroundColor: isBalanceSufficient ? '#10b981' : '#475569',
              borderBottomWidth: 4,
              borderBottomColor: isBalanceSufficient ? '#047857' : '#334155',
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              shadowColor: isBalanceSufficient ? '#10b981' : 'transparent',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={16} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>
                  {t('pay_and_confirm')} (₹{entryFee})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
