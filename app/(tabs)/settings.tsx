import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Settings,
  Volume2,
  Vibrate,
  Flashlight,
  Globe,
  Shield,
  Bell,
  ChevronRight,
  Info,
  Heart,
} from 'lucide-react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundMonitoring, setBackgroundMonitoring] = useState(true);
  const [autoAlert, setAutoAlert] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const alertSettings: SettingItem[] = [
    {
      id: 'vibration',
      title: 'Vibration Alerts',
      subtitle: 'Strong vibration when emergency detected',
      icon: <Vibrate size={20} color="#6B7280" />,
      type: 'toggle',
      value: vibrationEnabled,
      onToggle: (value) => {
        triggerHapticFeedback();
        setVibrationEnabled(value);
      },
    },
    {
      id: 'flash',
      title: 'Flash Alerts',
      subtitle: 'Camera flash blinking pattern',
      icon: <Flashlight size={20} color="#6B7280" />,
      type: 'toggle',
      value: flashEnabled,
      onToggle: (value) => {
        triggerHapticFeedback();
        setFlashEnabled(value);
      },
    },
    {
      id: 'sound',
      title: 'Audio Alerts',
      subtitle: 'Play assistance message',
      icon: <Volume2 size={20} color="#6B7280" />,
      type: 'toggle',
      value: soundEnabled,
      onToggle: (value) => {
        triggerHapticFeedback();
        setSoundEnabled(value);
      },
    },
  ];

  const monitoringSettings: SettingItem[] = [
    {
      id: 'background',
      title: 'Background Monitoring',
      subtitle: 'Continue monitoring when app is closed',
      icon: <Shield size={20} color="#6B7280" />,
      type: 'toggle',
      value: backgroundMonitoring,
      onToggle: (value) => {
        triggerHapticFeedback();
        setBackgroundMonitoring(value);
      },
    },
    {
      id: 'auto-alert',
      title: 'Auto Emergency Alert',
      subtitle: 'Automatically trigger alerts when sounds detected',
      icon: <Bell size={20} color="#6B7280" />,
      type: 'toggle',
      value: autoAlert,
      onToggle: (value) => {
        triggerHapticFeedback();
        setAutoAlert(value);
      },
    },
  ];

  const generalSettings: SettingItem[] = [
    {
      id: 'language',
      title: 'Language',
      subtitle: selectedLanguage,
      icon: <Globe size={20} color="#6B7280" />,
      type: 'action',
      onPress: () => {
        triggerHapticFeedback();
        // Language selection would open here
      },
    },
    {
      id: 'about',
      title: 'About WithU',
      subtitle: 'Version 1.0.0',
      icon: <Info size={20} color="#6B7280" />,
      type: 'action',
      onPress: () => {
        triggerHapticFeedback();
        // About screen would open here
      },
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        accessibilityLabel={item.title}
      >
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.settingAction}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              thumbColor={item.value ? '#DC2626' : '#F3F4F6'}
              trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
            />
          )}
          {item.type === 'action' && (
            <ChevronRight size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your emergency protection
          </Text>
        </View>

        {/* Alert Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Settings</Text>
          <View style={styles.settingsGroup}>
            {alertSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Monitoring Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoring</Text>
          <View style={styles.settingsGroup}>
            {monitoringSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsGroup}>
            {generalSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Emergency Message Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Message</Text>
          <View style={styles.messagePreview}>
            <Volume2 size={24} color="#DC2626" />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>Assistance Message</Text>
              <Text style={styles.messageText}>
                "Take me with you, don't leave me behind."
              </Text>
              <Text style={styles.messageNote}>
                This message will play loudly to alert nearby people during emergencies.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacySection}>
          <View style={styles.privacyHeader}>
            <Shield size={20} color="#16A34A" />
            <Text style={styles.privacyTitle}>Privacy First</Text>
          </View>
          <Text style={styles.privacyText}>
            WithU processes all audio locally on your device. No sound data is ever transmitted or stored externally. Your privacy and security are our top priorities.
          </Text>
        </View>

        {/* Support Info */}
        <View style={styles.supportSection}>
          <View style={styles.supportHeader}>
            <Heart size={20} color="#DC2626" />
            <Text style={styles.supportTitle}>Made with care</Text>
          </View>
          <Text style={styles.supportText}>
            WithU is designed specifically for the deaf and hard-of-hearing community. If you need assistance or have feedback, please reach out to our support team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  messageNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  privacySection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#15803D',
    lineHeight: 20,
  },
  supportSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B91C1C',
    lineHeight: 20,
  },
});