import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '@/utils/i18n';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onLanguageChange?: (languageCode: string) => void;
}

export default function LanguageSelector({
  isVisible,
  onClose,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());
  const availableLanguages = getAvailableLanguages();

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    triggerHapticFeedback();
    setSelectedLanguage(languageCode);
    
    try {
      await changeLanguage(languageCode);
      onLanguageChange?.(languageCode);
      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleClose = () => {
    triggerHapticFeedback();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Globe size={24} color="#DC2626" />
            </View>
            <Text style={styles.title}>{t('languages.selectLanguage')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close language selector"
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Language Options */}
          <View style={styles.languageList}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguageOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                accessibilityLabel={`Select ${language.name}`}
              >
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.selectedLanguageName,
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.languageSubtitle,
                    selectedLanguage === language.code && styles.selectedLanguageSubtitle,
                  ]}>
                    {language.name}
                  </Text>
                </View>
                
                {selectedLanguage === language.code && (
                  <View style={styles.checkIcon}>
                    <Check size={20} color="#DC2626" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('settings.subtitle')}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  selectedLanguageOption: {
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#FECACA',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#DC2626',
  },
  languageSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  selectedLanguageSubtitle: {
    color: '#B91C1C',
  },
  checkIcon: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});