import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LiveCountdown } from './LiveCountdown';

interface TicketConfirmedModalProps {
  isOpen: boolean;
  ticketData: {
    ticketId: string;
    roomTitle: string;
    category: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    entryFee: number;
  } | null;
  onClose: () => void;
}

export const TicketConfirmedModal: React.FC<TicketConfirmedModalProps> = ({
  isOpen,
  ticketData,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !ticketData) return null;

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Scheduled Match';
    return new Date(timeStr).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getClosingTime = (startTimeStr?: string, endTimeStr?: string) => {
    if (endTimeStr) return formatTime(endTimeStr);
    if (!startTimeStr) return null;
    const end = new Date(new Date(startTimeStr).getTime() + 15 * 60 * 1000);
    return formatTime(end.toISOString());
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(1, 8, 5, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: '#071f17',
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            borderWidth: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* 3D Success Icon Badge */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#062d21',
              borderWidth: 2,
              borderColor: '#10b981',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -8,
              marginBottom: 12,
              shadowColor: '#10b981',
              shadowOpacity: 0.6,
              shadowRadius: 12,
            }}
          >
            <Ionicons name="checkmark-circle" size={40} color="#10b981" />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', textAlign: 'center', letterSpacing: -0.3 }}>
            {t('ticket_title')}
          </Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 3, marginBottom: 16 }}>
            {t('ticket_subtitle')}
          </Text>

          {/* 3D Event Pass Ticket Box */}
          <View
            style={{
              width: '100%',
              backgroundColor: '#052017',
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#0f5139',
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#0a3827', borderStyle: 'dashed' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="ticket" size={16} color="#10b981" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#cbd5e1' }}>{t('ticket_id')}</Text>
              </View>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: '800', color: '#34d399', backgroundColor: '#063728', borderWidth: 1, borderColor: '#10b981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                {ticketData.ticketId}
              </Text>
            </View>

            <View style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '700', color: '#6ee7b7' }}>
                {ticketData.category} Arena
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff', marginTop: 2 }}>
                {ticketData.roomTitle}
              </Text>
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#0a3827', gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="play" size={11} color="#10b981" />
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                      {t('starts_at', 'Starts')}: <Text style={{ fontWeight: '700', color: '#34d399' }}>{formatTime(ticketData.scheduledStartTime)}</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="flag" size={11} color="#f59e0b" />
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                      {t('closes_at', 'Closes')}: <Text style={{ fontWeight: '700', color: '#fbbf24' }}>{getClosingTime(ticketData.scheduledStartTime, ticketData.scheduledEndTime)}</Text>
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                  <LiveCountdown scheduledStartTime={ticketData.scheduledStartTime} scheduledEndTime={ticketData.scheduledEndTime} variant="dark" />
                </View>
              </View>
            </View>

            <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: '#0a3827', borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>Entry Fee Paid</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#34d399' }}>₹{ticketData.entryFee} (Wallet)</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#451a03', borderWidth: 1, borderColor: '#d97706', borderRadius: 12, padding: 10, width: '100%', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="notifications-outline" size={16} color="#fbbf24" />
            <Text style={{ fontSize: 11, color: '#fef08a', fontWeight: '600', flex: 1 }}>
              {t('doors_reminder')}
            </Text>
          </View>

          {/* 3D Action Done Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              borderBottomWidth: 4,
              borderBottomColor: '#047857',
              borderRadius: 16,
              paddingVertical: 13,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>{t('done')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
