import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { walletService, centralWalletStore, WalletLedgerItem } from '../services';
import { AppInput } from '../components/AppInput';

interface WalletScreenProps {
  user?: any;
  onBack: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

/**
 * Mobile Centralized QuickTrade & Skill Wallet Screen (Obsidian Green & Gold Theme)
 */
export default function WalletScreen({ user, onBack, onBalanceUpdated }: WalletScreenProps) {
  const [balance, setBalance] = useState<number>(() => centralWalletStore.getBalance());
  const [transactions, setTransactions] = useState<WalletLedgerItem[]>(() => centralWalletStore.getTransactions());
  const [loading, setLoading] = useState(false);

  // Withdraw Modal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [upiId, setUpiId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe to central wallet changes across the app
  useEffect(() => {
    const unsubscribe = centralWalletStore.subscribe((newBal) => {
      setBalance(newBal);
      setTransactions(centralWalletStore.getTransactions());
      if (onBalanceUpdated) onBalanceUpdated(newBal);
    });
    return unsubscribe;
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const summary = await walletService.getWalletSummary();
      if (summary && typeof summary.balance === 'number' && summary.balance > 0) {
        centralWalletStore.setBalance(summary.balance);
      }
      if (summary && summary.transactions && summary.transactions.length > 0) {
        setTransactions(summary.transactions);
      }
    } catch (err) {
      // Practice / offline mode resilience - keep centralized store balance
      console.log('Using centralized wallet store balance:', centralWalletStore.getBalance());
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
      const newBal = centralWalletStore.recharge(amount);
      if (onBalanceUpdated) onBalanceUpdated(newBal);
      Alert.alert('Recharge Successful', `₹${amount.toLocaleString('en-IN')} practice cash added to your wallet!`);
      walletService.recharge(amount).catch(() => {});
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > balance) {
      Alert.alert('Insufficient Balance', `Your current balance is ₹${balance.toLocaleString('en-IN')}.`);
      return;
    }
    if (!upiId || !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }

    setActionLoading(true);
    try {
      const ok = centralWalletStore.deduct(amt, `Instant UPI Payout (${upiId})`);
      if (ok) {
        const newBal = centralWalletStore.getBalance();
        if (onBalanceUpdated) onBalanceUpdated(newBal);
        setShowWithdraw(false);
        Alert.alert('Payout Initiated', `₹${amt.toLocaleString('en-IN')} payout sent to ${upiId}.`);
        walletService.withdraw(amt, upiId).catch(() => {});
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020604' }}>
      {/* Top Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: '#07150e',
          borderBottomWidth: 1,
          borderBottomColor: '#153e28',
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
            borderWidth: 1,
            borderColor: '#00e676',
          }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#00e676" />
          <Text style={{ color: '#00e676', fontSize: 12, fontWeight: '800' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 }}>
          Central Wallet
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(0, 230, 118, 0.1)',
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#00e676',
          }}
        >
          <Ionicons name="wallet" size={12} color="#00e676" />
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#00e676' }}>
            ₹{balance.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Master Balance Card */}
        <View
          style={{
            backgroundColor: '#071710',
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: '#00e676',
            padding: 24,
            alignItems: 'center',
            shadowColor: '#00e676',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: 'rgba(0, 230, 118, 0.15)',
              borderWidth: 2,
              borderColor: '#00e676',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Ionicons name="wallet-outline" size={28} color="#00e676" />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '800', color: '#69f0ae', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Available Cash Balance
          </Text>

          <Text style={{ fontSize: 36, fontWeight: '900', color: '#ffffff', marginVertical: 6, letterSpacing: 0.5 }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00e676' }} />
            <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>
              Centralized across Home, Markets & Trading
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowWithdraw(true)}
            activeOpacity={0.8}
            style={{
              marginTop: 18,
              width: '100%',
              backgroundColor: 'rgba(0, 230, 118, 0.15)',
              borderWidth: 1.5,
              borderColor: '#00e676',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color="#00e676" />
            <Text style={{ color: '#00e676', fontSize: 13, fontWeight: '900' }}>Instant UPI Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Recharge Chips */}
        <View style={{ marginTop: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="flash" size={15} color="#ffd700" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fde68a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Instant Practice Cash Recharge
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[100, 500, 1000, 10000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={{
                  flex: 1,
                  backgroundColor: '#0a2318',
                  borderWidth: 1.5,
                  borderColor: '#00e676',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 3,
                  shadowColor: '#00e676',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => handleRecharge(amt)}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={16} color="#00e676" />
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '900' }}>
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Withdrawal Form Modal */}
        {showWithdraw && (
          <View
            style={{
              marginTop: 18,
              backgroundColor: '#071710',
              borderWidth: 1.5,
              borderColor: '#00e676',
              borderRadius: 20,
              padding: 16,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="card-outline" size={18} color="#00e676" />
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>Request Cash Withdrawal</Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>Minimum: ₹20 • Instant UPI direct bank transfer</Text>

            <AppInput
              label="Amount (₹)"
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              dark={true}
            />

            <AppInput
              label="UPI ID"
              placeholder="e.g. mobile@okhdfcbank"
              value={upiId}
              onChangeText={setUpiId}
              dark={true}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => setShowWithdraw(false)}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#0a2318', borderWidth: 1, borderColor: '#153e28' }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWithdraw}
                disabled={actionLoading}
                style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#00e676', flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="checkmark" size={14} color="#020604" />
                <Text style={{ color: '#020604', fontSize: 12, fontWeight: '900' }}>Confirm Payout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Transaction History / Ledger */}
        <View style={{ marginTop: 26 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="receipt-outline" size={15} color="#00e676" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#69f0ae', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Centralized Transaction Ledger Audit
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#00e676" style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <View style={{ backgroundColor: '#071710', borderWidth: 1, borderColor: '#153e28', borderRadius: 16, padding: 24, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={32} color="#153e28" />
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
                    backgroundColor: '#071710',
                    borderWidth: 1,
                    borderColor: '#153e28',
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                    <Ionicons
                      name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={24}
                      color={isCredit ? '#00e676' : '#ff5252'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{tx.description}</Text>
                      <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '800',
                        color: isCredit ? '#00e676' : '#ff5252',
                      }}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
                      Bal: ₹{tx.balanceAfter ? tx.balanceAfter.toLocaleString('en-IN') : balance.toLocaleString('en-IN')}
                    </Text>
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
