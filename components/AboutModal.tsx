import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Shield, Heart, Users, Globe, Mail, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AboutModal({ isVisible, onClose }: AboutModalProps) {
  const { t } = useTranslation();

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClose = () => {
    triggerHapticFeedback();
    onClose();
  };

  const features = [
    {
      icon: <Shield size={20} color="#16A34A" />,
      title: 'Real-time Sound Detection',
      description: 'Advanced AI-powered detection of emergency sounds including fire alarms, smoke detectors, and sirens.',
    },
    {
      icon: <Heart size={20} color="#DC2626" />,
      title: 'Accessibility First',
      description: 'Designed specifically for the deaf and hard-of-hearing community with visual and haptic alerts.',
    },
    {
      icon: <Users size={20} color="#7C3AED" />,
      title: 'Status Sharing',
      description: 'Let others know your safety status during emergencies with customizable messages.',
    },
    {
      icon: <Globe size={20} color="#0369A1" />,
      title: 'Multi-language Support',
      description: 'Available in English, Turkish, and Arabic with more languages coming soon.',
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Shield size={32} color="#DC2626" strokeWidth={2.5} />
              <View style={styles.headerText}>
                <Text style={styles.appName}>WithU</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close about screen"
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Mission Statement */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Mission</Text>
              <Text style={styles.missionText}>
                WithU is dedicated to creating a safer world for the deaf and hard-of-hearing community. 
                We believe everyone deserves to be aware of emergency situations and have the tools to 
                respond appropriately.
              </Text>
            </View>

            {/* Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.featuresList}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      {feature.icon}
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Privacy & Security */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
              <View style={styles.privacyCard}>
                <Shield size={24} color="#16A34A" />
                <View style={styles.privacyContent}>
                  <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
                  <Text style={styles.privacyText}>
                    All audio processing happens locally on your device. No sound data is ever 
                    transmitted, stored, or shared with external servers. Your privacy and security 
                    are our top priorities.
                  </Text>
                </View>
              </View>
            </View>

            {/* Technology */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technology</Text>
              <Text style={styles.technologyText}>
                WithU uses advanced Web Audio API and machine learning algorithms to detect emergency 
                sounds in real-time. The app is built with React Native and Expo, ensuring cross-platform 
                compatibility and optimal performance.
              </Text>
            </View>

            {/* Support */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support & Feedback</Text>
              <View style={styles.supportCard}>
                <Mail size={20} color="#DC2626" />
                <View style={styles.supportContent}>
                  <Text style={styles.supportTitle}>Need Help?</Text>
                  <Text style={styles.supportText}>
                    We're here to help! If you have questions, feedback, or need assistance, 
                    please reach out to our support team.
                  </Text>
                  <Text style={styles.supportEmail}>support@withu-app.com</Text>
                </View>
              </View>
            </View>

            {/* Acknowledgments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acknowledgments</Text>
              <Text style={styles.acknowledgmentText}>
                Special thanks to the deaf and hard-of-hearing community for their invaluable 
                feedback and insights that made this app possible. WithU is built with love and 
                dedication to serve those who need it most.
              </Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingHeader}>
                <Star size={24} color="#F59E0B" />
                <Text style={styles.ratingTitle}>Enjoying WithU?</Text>
              </View>
              <Text style={styles.ratingText}>
                Your feedback helps us improve and reach more people who need emergency sound detection.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ❤️ for the deaf and hard-of-hearing community
            </Text>
            <Text style={styles.copyright}>
              © 2024 WithU. All rights reserved.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    letterSpacing: 1,
  },
  version: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  missionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#15803D',
    lineHeight: 20,
  },
  technologyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  supportCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 6,
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B91C1C',
    lineHeight: 20,
    marginBottom: 8,
  },
  supportEmail: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  acknowledgmentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  ratingSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});