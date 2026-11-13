import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { walletService } from '../services';
import { AppInput } from '../components/AppInput';

interface WalletScreenProps {
  onBack: () => void;
  onBalanceUpdated: (newBalance: number) => void;
}

/**
 * Mobile Skill Wallet Screen (Cyberpunk Emerald Dark Theme)
 */
export default function WalletScreen({ onBack, onBalanceUpdated }: WalletScreenProps) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Withdraw Modal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [upiId, setUpiId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const summary = await walletService.getWalletSummary();
      setBalance(summary.balance);
      setTransactions(summary.transactions);
      onBalanceUpdated(summary.balance);
    } catch (err) {
      console.error('Failed to load wallet data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRecharge = async (amount: number) => {
    setActionLoading(true);
    try {
      await walletService.recharge(amount);
      alert('Wallet recharge successful!');
      fetchWalletData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Recharge failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!upiId || !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }
    setActionLoading(true);
    try {
      await walletService.withdraw(parseFloat(withdrawAmount), upiId);
      alert('Withdrawal request submitted successfully!');
      setShowWithdraw(false);
      fetchWalletData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#03130e' }}>
      {/* Top Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
          paddingBottom: 6,
          paddingHorizontal: 16,
          backgroundColor: '#041711',
          borderBottomWidth: 1,
          borderBottomColor: '#0a3827',
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
            borderColor: '#10b981',
          }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#34d399" />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800' }}>Skill Wallet</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Balance Card */}
        <View
          style={{
            backgroundColor: '#071f17',
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: '#10b981',
            padding: 24,
            alignItems: 'center',
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#062d21',
              borderWidth: 2,
              borderColor: '#10b981',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Ionicons name="wallet-outline" size={26} color="#10b981" />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '700', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Available Cash Balance
          </Text>

          <Text style={{ fontSize: 34, fontWeight: '900', color: '#ffffff', marginVertical: 4 }}>
            ₹{balance.toFixed(2)}
          </Text>

          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            100% Usable for entering Skill Quizzes & Tournaments
          </Text>

          <TouchableOpacity
            onPress={() => setShowWithdraw(true)}
            activeOpacity={0.8}
            style={{
              marginTop: 16,
              width: '100%',
              backgroundColor: '#07251c',
              borderWidth: 1.5,
              borderColor: '#10b981',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color="#34d399" />
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }}>Instant UPI Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Recharge Chips */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Ionicons name="flash-outline" size={14} color="#10b981" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#a7f3d0', textTransform: 'uppercase' }}>
              Quick Recharge (UPI / GPay / PhonePe)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[50, 100, 200, 500].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  borderBottomWidth: 3,
                  borderBottomColor: '#047857',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 4,
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                onPress={() => handleRecharge(amt)}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={14} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Withdrawal Form Modal */}
        {showWithdraw && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#071f17',
              borderWidth: 1.5,
              borderColor: '#f59e0b',
              borderRadius: 20,
              padding: 16,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="card-outline" size={18} color="#f59e0b" />
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>Request Cash Withdrawal</Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>Minimum: ₹20 • Instant UPI direct transfer</Text>

            <AppInput
              label="Amount (₹)"
              placeholder="e.g. 50"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              dark={true}
            />

            <AppInput
              label="UPI ID"
              placeholder="e.g. mobile@okaxis"
              value={upiId}
              onChangeText={setUpiId}
              dark={true}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => setShowWithdraw(false)}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#052017', borderWidth: 1, borderColor: '#0d4834' }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWithdraw}
                disabled={actionLoading}
                style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="checkmark" size={14} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>Confirm Payout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Transaction History / Ledger */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Ionicons name="receipt-outline" size={14} color="#10b981" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#a7f3d0', textTransform: 'uppercase' }}>
              Transaction Ledger Audit
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <View style={{ backgroundColor: '#071f17', borderWidth: 1, borderColor: '#0d4834', borderRadius: 16, padding: 24, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={32} color="#0f5139" />
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>No transactions recorded yet</Text>
            </View>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#071f17',
                    borderWidth: 1,
                    borderColor: '#0f5139',
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                    <Ionicons
                      name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={24}
                      color={isCredit ? '#10b981' : '#f43f5e'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{tx.description}</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '800',
                        color: isCredit ? '#34d399' : '#fda4af',
                      }}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>Bal: ₹{tx.balanceAfter.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
