import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { User, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Heart, MessageCircle, CreditCard as Edit3, Save } from 'lucide-react-native';

type UserStatus = 'safe' | 'need_help' | 'emergency';

export default function StatusScreen() {
  const [currentStatus, setCurrentStatus] = useState<UserStatus>('safe');
  const [customMessage, setCustomMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [statusHistory, setStatusHistory] = useState([
    { status: 'safe', timestamp: new Date(), message: 'All good at home' },
  ]);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const updateStatus = (newStatus: UserStatus) => {
    triggerHapticFeedback();
    setCurrentStatus(newStatus);
    setStatusHistory(prev => [
      { status: newStatus, timestamp: new Date(), message: customMessage },
      ...prev.slice(0, 4)
    ]);
  };

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case 'safe':
        return {
          icon: <CheckCircle size={32} color="#16A34A" strokeWidth={2} />,
          title: "I'M SAFE",
          subtitle: 'Everything is okay',
          color: '#16A34A',
          backgroundColor: '#F0FDF4',
          borderColor: '#22C55E',
        };
      case 'need_help':
        return {
          icon: <AlertCircle size={32} color="#D97706" strokeWidth={2} />,
          title: 'NEED HELP',
          subtitle: 'Require assistance',
          color: '#D97706',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
        };
      case 'emergency':
        return {
          icon: <AlertCircle size={32} color="#DC2626" strokeWidth={2} />,
          title: 'EMERGENCY',
          subtitle: 'Immediate help needed',
          color: '#DC2626',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
        };
    }
  };

  const currentConfig = getStatusConfig(currentStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Status</Text>
          <Text style={styles.subtitle}>
            Let others know how you're doing
          </Text>
        </View>

        {/* Current Status Display */}
        <View style={[
          styles.statusDisplay,
          { 
            backgroundColor: currentConfig.backgroundColor,
            borderColor: currentConfig.borderColor,
          }
        ]}>
          <View style={styles.statusHeader}>
            {currentConfig.icon}
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: currentConfig.color }]}>
                {currentConfig.title}
              </Text>
              <Text style={styles.statusSubtitle}>
                {currentConfig.subtitle}
              </Text>
            </View>
          </View>

          <Text style={styles.statusTime}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Status Options */}
        <View style={styles.statusOptions}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'safe' && styles.statusButtonActive,
              { borderColor: '#22C55E' }
            ]}
            onPress={() => updateStatus('safe')}
            accessibilityLabel="Set status to safe"
          >
            <CheckCircle size={24} color="#16A34A" strokeWidth={2} />
            <Text style={[styles.statusButtonText, { color: '#16A34A' }]}>
              I'M SAFE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'need_help' && styles.statusButtonActive,
              { borderColor: '#F59E0B' }
            ]}
            onPress={() => updateStatus('need_help')}
            accessibilityLabel="Set status to need help"
          >
            <Heart size={24} color="#D97706" strokeWidth={2} />
            <Text style={[styles.statusButtonText, { color: '#D97706' }]}>
              NEED HELP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'emergency' && styles.statusButtonActive,
              { borderColor: '#EF4444' }
            ]}
            onPress={() => updateStatus('emergency')}
            accessibilityLabel="Set status to emergency"
          >
            <AlertCircle size={24} color="#DC2626" strokeWidth={2} />
            <Text style={[styles.statusButtonText, { color: '#DC2626' }]}>
              EMERGENCY
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Message */}
        <View style={styles.messageContainer}>
          <View style={styles.messageHeader}>
            <MessageCircle size={20} color="#6B7280" />
            <Text style={styles.messageTitle}>Custom Message</Text>
            <TouchableOpacity
              onPress={() => setIsEditingMessage(!isEditingMessage)}
              style={styles.editButton}
            >
              {isEditingMessage ? (
                <Save size={16} color="#DC2626" />
              ) : (
                <Edit3 size={16} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          {isEditingMessage ? (
            <TextInput
              style={styles.messageInput}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Add a custom message..."
              multiline
              numberOfLines={3}
              maxLength={100}
            />
          ) : (
            <Text style={styles.messageDisplay}>
              {customMessage || 'No message set'}
            </Text>
          )}
        </View>

        {/* Status History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Updates</Text>
          <View style={styles.historyList}>
            {statusHistory.map((item, index) => {
              const config = getStatusConfig(item.status);
              return (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    {config.icon}
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyStatus, { color: config.color }]}>
                      {config.title}
                    </Text>
                    <Text style={styles.historyTime}>
                      {item.timestamp.toLocaleString()}
                    </Text>
                    {item.message && (
                      <Text style={styles.historyMessage}>
                        {`"${item.message}"`}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusDisplay: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statusOptions: {
    gap: 12,
    marginBottom: 30,
  },
  statusButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusButtonActive: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.98 }],
  },
  statusButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  messageTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  messageDisplay: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    minHeight: 50,
  },
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  historyInfo: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  historyMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
  },
});