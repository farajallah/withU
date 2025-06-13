import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Volume2, VolumeX, TriangleAlert as AlertTriangle, Flame, Siren, Activity, Play, Square } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SoundAlert {
  id: string;
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  timestamp: Date;
  confidence: number;
  duration: number;
}

export default function MonitorScreen() {
  const { t } = useTranslation();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<SoundAlert[]>([]);
  const [isPlayingAssistMessage, setIsPlayingAssistMessage] = useState(false);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const toggleMonitoring = () => {
    triggerHapticFeedback();
    setIsMonitoring(!isMonitoring);
  };

  const playAssistanceMessage = async () => {
    if (isPlayingAssistMessage) return;
    
    triggerHapticFeedback();
    setIsPlayingAssistMessage(true);
    
    const assistanceText = t('settings.assistanceText');
    
    try {
      if (Platform.OS === 'web') {
        // Web Speech API implementation
        if ('speechSynthesis' in window) {
          // Stop any ongoing speech
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(assistanceText);
          
          // Configure speech settings for emergency situations
          utterance.volume = 1.0; // Maximum volume
          utterance.rate = 0.8; // Slightly slower for clarity
          utterance.pitch = 1.0; // Normal pitch
          
          // Set language based on current app language
          const currentLang = t('common.home'); // This will help determine the language
          if (currentLang.includes('Ana') || currentLang.includes('Sayfa')) {
            utterance.lang = 'tr-TR'; // Turkish
          } else if (currentLang.includes('الرئيسية')) {
            utterance.lang = 'ar-SA'; // Arabic
          } else {
            utterance.lang = 'en-US'; // English (default)
          }
          
          // Handle speech events
          utterance.onstart = () => {
            console.log('Speech started');
          };
          
          utterance.onend = () => {
            setIsPlayingAssistMessage(false);
            console.log('Speech ended');
          };
          
          utterance.onerror = (event) => {
            setIsPlayingAssistMessage(false);
            console.error('Speech error:', event.error);
          };
          
          // Start speaking
          window.speechSynthesis.speak(utterance);
          
          // Fallback timeout in case onend doesn't fire
          setTimeout(() => {
            setIsPlayingAssistMessage(false);
          }, 10000);
        } else {
          console.warn('Speech synthesis not supported');
          setIsPlayingAssistMessage(false);
        }
      } else {
        // Mobile implementation using expo-speech
        const speechOptions: Speech.SpeechOptions = {
          language: getCurrentSpeechLanguage(),
          pitch: 1.0,
          rate: 0.8,
          volume: 1.0,
        };
        
        // Speak the assistance message
        await Speech.speak(assistanceText, {
          ...speechOptions,
          onStart: () => {
            console.log('Speech started');
          },
          onDone: () => {
            setIsPlayingAssistMessage(false);
            console.log('Speech completed');
          },
          onStopped: () => {
            setIsPlayingAssistMessage(false);
            console.log('Speech stopped');
          },
          onError: (error) => {
            setIsPlayingAssistMessage(false);
            console.error('Speech error:', error);
          },
        });
      }
    } catch (error) {
      console.error('Failed to play assistance message:', error);
      setIsPlayingAssistMessage(false);
    }
  };

  const getCurrentSpeechLanguage = (): string => {
    // Determine language based on current translation
    const currentLang = t('common.home');
    if (currentLang.includes('Ana') || currentLang.includes('Sayfa')) {
      return 'tr'; // Turkish
    } else if (currentLang.includes('الرئيسية')) {
      return 'ar'; // Arabic
    } else {
      return 'en'; // English (default)
    }
  };

  const stopAssistanceMessage = () => {
    if (!isPlayingAssistMessage) return;
    
    try {
      if (Platform.OS === 'web') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
      setIsPlayingAssistMessage(false);
    } catch (error) {
      console.error('Failed to stop speech:', error);
      setIsPlayingAssistMessage(false);
    }
  };

  const getSoundTypeIcon = (type: string) => {
    switch (type) {
      case 'fire_alarm':
        return <Flame size={20} color="#DC2626" />;
      case 'smoke_detector':
        return <AlertTriangle size={20} color="#D97706" />;
      case 'siren':
        return <Siren size={20} color="#7C3AED" />;
      default:
        return <Activity size={20} color="#6B7280" />;
    }
  };

  const getSoundTypeName = (type: string) => {
    switch (type) {
      case 'fire_alarm':
        return t('monitor.fireAlarms');
      case 'smoke_detector':
        return t('monitor.smokeDetectors');
      case 'siren':
        return t('monitor.emergencySirens');
      default:
        return 'Emergency Sound';
    }
  };

  // Simulate sound level monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setSoundLevel(Math.random() * 100);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (isPlayingAssistMessage) {
        stopAssistanceMessage();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('monitor.title')}</Text>
          <Text style={styles.subtitle}>
            {t('monitor.subtitle')}
          </Text>
        </View>

        {/* Monitoring Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            {isMonitoring ? (
              <Volume2 size={32} color="#16A34A" strokeWidth={2} />
            ) : (
              <VolumeX size={32} color="#6B7280" strokeWidth={2} />
            )}
            <Text style={[
              styles.statusText,
              { color: isMonitoring ? '#16A34A' : '#6B7280' }
            ]}>
              {isMonitoring ? t('monitor.monitoringActive') : t('monitor.monitoringPaused')}
            </Text>
          </View>
          
          {isMonitoring && (
            <View style={styles.soundLevelContainer}>
              <Text style={styles.soundLevelText}>{t('monitor.soundLevel')}</Text>
              <View style={styles.soundLevelBar}>
                <View
                  style={[
                    styles.soundLevelFill,
                    { width: `${soundLevel}%` }
                  ]}
                />
              </View>
              <Text style={styles.soundLevelValue}>{Math.round(soundLevel)}%</Text>
            </View>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.monitorButton,
              isMonitoring ? styles.monitorButtonActive : styles.monitorButtonInactive
            ]}
            onPress={toggleMonitoring}
            accessibilityLabel={isMonitoring ? 'Stop monitoring' : 'Start monitoring'}
          >
            {isMonitoring ? (
              <Square size={24} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Play size={24} color="#FFFFFF" strokeWidth={2} />
            )}
            <Text style={styles.monitorButtonText}>
              {isMonitoring ? t('monitor.stopMonitoring') : t('monitor.startMonitoring')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.assistButton,
              isPlayingAssistMessage && styles.assistButtonActive
            ]}
            onPress={isPlayingAssistMessage ? stopAssistanceMessage : playAssistanceMessage}
            accessibilityLabel={isPlayingAssistMessage ? 'Stop assistance message' : 'Play assistance message'}
          >
            <Volume2 size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.assistButtonText}>
              {isPlayingAssistMessage ? t('monitor.playingMessage') : t('monitor.playAssistMessage')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>{t('monitor.recentAlerts')}</Text>
          
          {recentAlerts.length === 0 ? (
            <View style={styles.noAlertsContainer}>
              <AlertTriangle size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text style={styles.noAlertsText}>{t('monitor.noRecentAlerts')}</Text>
              <Text style={styles.noAlertsSubtext}>
                {t('monitor.noAlertsDescription')}
              </Text>
            </View>
          ) : (
            <View style={styles.alertsList}>
              {recentAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertIcon}>
                    {getSoundTypeIcon(alert.type)}
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertType}>
                      {getSoundTypeName(alert.type)}
                    </Text>
                    <Text style={styles.alertTime}>
                      {alert.timestamp.toLocaleTimeString()}
                    </Text>
                    <Text style={styles.alertConfidence}>
                      {t('monitor.confidence', { percent: Math.round(alert.confidence * 100) })}
                    </Text>
                  </View>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>NEW</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Emergency Sounds Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{t('monitor.monitoredSounds')}</Text>
          <View style={styles.soundTypesList}>
            <View style={styles.soundTypeItem}>
              <Flame size={16} color="#DC2626" />
              <Text style={styles.soundTypeText}>{t('monitor.fireAlarms')}</Text>
            </View>
            <View style={styles.soundTypeItem}>
              <AlertTriangle size={16} color="#D97706" />
              <Text style={styles.soundTypeText}>{t('monitor.smokeDetectors')}</Text>
            </View>
            <View style={styles.soundTypeItem}>
              <Siren size={16} color="#7C3AED" />
              <Text style={styles.soundTypeText}>{t('monitor.emergencySirens')}</Text>
            </View>
          </View>
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
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  soundLevelContainer: {
    gap: 8,
  },
  soundLevelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  soundLevelBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  soundLevelFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  soundLevelValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
    textAlign: 'right',
  },
  controlsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  monitorButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  monitorButtonActive: {
    backgroundColor: '#DC2626',
  },
  monitorButtonInactive: {
    backgroundColor: '#16A34A',
  },
  monitorButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  assistButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  assistButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  assistButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  alertsContainer: {
    marginBottom: 30,
  },
  alertsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  noAlertsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noAlertsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  noAlertsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  alertConfidence: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  alertBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoContainer: {
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
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  soundTypesList: {
    gap: 12,
  },
  soundTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soundTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});