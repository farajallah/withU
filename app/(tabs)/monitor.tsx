import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Volume2, VolumeX, TriangleAlert as AlertTriangle, Flame, Siren, Activity, Play, Square, Mic, MicOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SoundAlert {
  id: string;
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  timestamp: Date;
  confidence: number;
  duration: number;
}

interface AudioAnalysisResult {
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency' | null;
  confidence: number;
  soundLevel: number;
}

export default function MonitorScreen() {
  const { t } = useTranslation();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<SoundAlert[]>([]);
  const [isPlayingAssistMessage, setIsPlayingAssistMessage] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frequencyDataRef = useRef<Uint8Array | null>(null);

  // Sound detection parameters
  const detectionThresholdRef = useRef(0.7); // Confidence threshold for alerts
  const lastDetectionRef = useRef<number>(0); // Prevent spam alerts

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Request microphone permission and start audio context
  const requestAudioPermission = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          } 
        });
        
        // Stop the stream immediately, we just needed permission
        stream.getTracks().forEach(track => track.stop());
        setHasAudioPermission(true);
        return true;
      } catch (error) {
        console.error('Microphone permission denied:', error);
        Alert.alert(
          'Microphone Permission Required',
          'This app needs microphone access to detect emergency sounds. Please allow microphone access and try again.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      // For mobile platforms, you would implement native audio permission
      setHasAudioPermission(true);
      return true;
    }
  };

  // Initialize audio analysis
  const startAudioAnalysis = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Supported', 'Real-time audio analysis is currently only supported on web platforms.');
      return false;
    }

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      mediaStreamRef.current = stream;

      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096; // Higher resolution for better frequency analysis
      analyserRef.current.smoothingTimeConstant = 0.3;

      // Connect microphone to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Initialize frequency data array
      frequencyDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      setIsListening(true);
      startAnalysisLoop();
      return true;
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
      Alert.alert('Audio Error', 'Failed to access microphone. Please check permissions and try again.');
      return false;
    }
  };

  // Stop audio analysis
  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    frequencyDataRef.current = null;
    setIsListening(false);
    setSoundLevel(0);
  };

  // Main analysis loop
  const startAnalysisLoop = () => {
    const analyze = () => {
      if (!analyserRef.current || !frequencyDataRef.current || !isMonitoring) {
        return;
      }

      // Get frequency data
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);

      // Analyze the audio data
      const result = analyzeAudioForSirens(frequencyDataRef.current);
      
      // Update sound level
      setSoundLevel(result.soundLevel);

      // Check for siren detection
      if (result.type && result.confidence > detectionThresholdRef.current) {
        const now = Date.now();
        // Prevent spam alerts (minimum 5 seconds between alerts)
        if (now - lastDetectionRef.current > 5000) {
          handleSoundDetection(result.type, result.confidence);
          lastDetectionRef.current = now;
        }
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  // Advanced audio analysis for siren detection
  const analyzeAudioForSirens = (frequencyData: Uint8Array): AudioAnalysisResult => {
    const sampleRate = 44100;
    const fftSize = 4096;
    const frequencyResolution = sampleRate / fftSize;

    // Calculate total sound level
    const totalEnergy = frequencyData.reduce((sum, value) => sum + value, 0);
    const soundLevel = Math.min(100, (totalEnergy / frequencyData.length) * 0.8);

    // Define frequency ranges for different emergency sounds
    const ranges = {
      lowFreq: getFrequencyRange(frequencyData, 200, 800, frequencyResolution), // 200-800 Hz
      midFreq: getFrequencyRange(frequencyData, 800, 2000, frequencyResolution), // 800-2000 Hz
      highFreq: getFrequencyRange(frequencyData, 2000, 4000, frequencyResolution), // 2-4 kHz
      veryHighFreq: getFrequencyRange(frequencyData, 4000, 8000, frequencyResolution), // 4-8 kHz
    };

    // Siren detection algorithm
    const sirenConfidence = detectSiren(ranges, frequencyData, frequencyResolution);
    const fireAlarmConfidence = detectFireAlarm(ranges);
    const smokeDetectorConfidence = detectSmokeDetector(ranges);

    // Determine the most likely sound type
    let detectedType: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency' | null = null;
    let maxConfidence = 0;

    if (sirenConfidence > maxConfidence) {
      detectedType = 'siren';
      maxConfidence = sirenConfidence;
    }
    if (fireAlarmConfidence > maxConfidence) {
      detectedType = 'fire_alarm';
      maxConfidence = fireAlarmConfidence;
    }
    if (smokeDetectorConfidence > maxConfidence) {
      detectedType = 'smoke_detector';
      maxConfidence = smokeDetectorConfidence;
    }

    return {
      type: maxConfidence > 0.6 ? detectedType : null,
      confidence: maxConfidence,
      soundLevel: soundLevel,
    };
  };

  // Get average amplitude in a frequency range
  const getFrequencyRange = (data: Uint8Array, minFreq: number, maxFreq: number, resolution: number) => {
    const startIndex = Math.floor(minFreq / resolution);
    const endIndex = Math.floor(maxFreq / resolution);
    
    let sum = 0;
    let count = 0;
    
    for (let i = startIndex; i < endIndex && i < data.length; i++) {
      sum += data[i];
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  };

  // Siren detection using frequency sweeping patterns
  const detectSiren = (ranges: any, frequencyData: Uint8Array, resolution: number): number => {
    const { lowFreq, midFreq, highFreq } = ranges;
    
    // Sirens typically have strong low to mid frequency content
    const sirenPattern = (lowFreq * 0.4) + (midFreq * 0.6);
    
    // Look for frequency sweeping (characteristic of sirens)
    const sweepingScore = detectFrequencySweeping(frequencyData, resolution);
    
    // Combine pattern matching with sweeping detection
    const confidence = Math.min(1.0, (sirenPattern / 150) * 0.7 + sweepingScore * 0.3);
    
    return confidence;
  };

  // Detect frequency sweeping patterns characteristic of sirens
  const detectFrequencySweeping = (frequencyData: Uint8Array, resolution: number): number => {
    // This is a simplified implementation
    // In a real-world scenario, you'd track frequency changes over time
    
    let peakCount = 0;
    let lastPeak = 0;
    const threshold = 80; // Minimum amplitude to consider a peak
    
    for (let i = 1; i < frequencyData.length - 1; i++) {
      if (frequencyData[i] > threshold && 
          frequencyData[i] > frequencyData[i-1] && 
          frequencyData[i] > frequencyData[i+1]) {
        if (lastPeak > 0 && Math.abs(i - lastPeak) > 10) {
          peakCount++;
        }
        lastPeak = i;
      }
    }
    
    // Multiple peaks across frequency spectrum suggest sweeping
    return Math.min(1.0, peakCount / 10);
  };

  // Fire alarm detection (typically 3-4 kHz beeping)
  const detectFireAlarm = (ranges: any): number => {
    const { midFreq, highFreq } = ranges;
    
    // Fire alarms typically have strong 3-4 kHz content
    if (highFreq > 100 && midFreq > 60) {
      return Math.min(1.0, (highFreq + midFreq) / 200);
    }
    
    return 0;
  };

  // Smoke detector detection (high-pitched beep)
  const detectSmokeDetector = (ranges: any): number => {
    const { veryHighFreq, highFreq } = ranges;
    
    // Smoke detectors typically have very high frequency beeps
    if (veryHighFreq > 120) {
      return Math.min(1.0, veryHighFreq / 150);
    }
    
    return 0;
  };

  // Handle sound detection
  const handleSoundDetection = (type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency', confidence: number) => {
    const newAlert: SoundAlert = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      confidence,
      duration: 0,
    };

    setRecentAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    
    // Trigger haptic feedback
    triggerHapticFeedback();
    
    // Auto-play assistance message for high-confidence detections
    if (confidence > 0.8) {
      playAssistanceMessage();
    }
  };

  const toggleMonitoring = async () => {
    if (!isMonitoring) {
      // Starting monitoring
      if (!hasAudioPermission) {
        const granted = await requestAudioPermission();
        if (!granted) return;
      }
      
      const started = await startAudioAnalysis();
      if (started) {
        setIsMonitoring(true);
        triggerHapticFeedback();
      }
    } else {
      // Stopping monitoring
      stopAudioAnalysis();
      setIsMonitoring(false);
      triggerHapticFeedback();
    }
  };

  const playAssistanceMessage = async () => {
    if (isPlayingAssistMessage) return;
    
    triggerHapticFeedback();
    setIsPlayingAssistMessage(true);
    
    const assistanceText = t('settings.assistanceText');
    
    try {
      if (Platform.OS === 'web') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(assistanceText);
          utterance.volume = 1.0;
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          
          const currentLang = t('common.home');
          if (currentLang.includes('Ana') || currentLang.includes('Sayfa')) {
            utterance.lang = 'tr-TR';
          } else if (currentLang.includes('الرئيسية')) {
            utterance.lang = 'ar-SA';
          } else {
            utterance.lang = 'en-US';
          }
          
          utterance.onend = () => setIsPlayingAssistMessage(false);
          utterance.onerror = () => setIsPlayingAssistMessage(false);
          
          window.speechSynthesis.speak(utterance);
          
          setTimeout(() => setIsPlayingAssistMessage(false), 10000);
        }
      } else {
        const speechOptions: Speech.SpeechOptions = {
          language: getCurrentSpeechLanguage(),
          pitch: 1.0,
          rate: 0.8,
          volume: 1.0,
        };
        
        await Speech.speak(assistanceText, {
          ...speechOptions,
          onDone: () => setIsPlayingAssistMessage(false),
          onStopped: () => setIsPlayingAssistMessage(false),
          onError: () => setIsPlayingAssistMessage(false),
        });
      }
    } catch (error) {
      console.error('Failed to play assistance message:', error);
      setIsPlayingAssistMessage(false);
    }
  };

  const getCurrentSpeechLanguage = (): string => {
    const currentLang = t('common.home');
    if (currentLang.includes('Ana') || currentLang.includes('Sayfa')) {
      return 'tr';
    } else if (currentLang.includes('الرئيسية')) {
      return 'ar';
    } else {
      return 'en';
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalysis();
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
            {isListening ? (
              <Mic size={32} color="#16A34A" strokeWidth={2} />
            ) : isMonitoring ? (
              <Volume2 size={32} color="#D97706" strokeWidth={2} />
            ) : (
              <MicOff size={32} color="#6B7280" strokeWidth={2} />
            )}
            <Text style={[
              styles.statusText,
              { color: isListening ? '#16A34A' : isMonitoring ? '#D97706' : '#6B7280' }
            ]}>
              {isListening ? 'LISTENING FOR SOUNDS' : isMonitoring ? t('monitor.monitoringActive') : t('monitor.monitoringPaused')}
            </Text>
          </View>
          
          {isMonitoring && (
            <View style={styles.soundLevelContainer}>
              <Text style={styles.soundLevelText}>{t('monitor.soundLevel')}</Text>
              <View style={styles.soundLevelBar}>
                <View
                  style={[
                    styles.soundLevelFill,
                    { 
                      width: `${soundLevel}%`,
                      backgroundColor: soundLevel > 70 ? '#DC2626' : soundLevel > 40 ? '#D97706' : '#16A34A'
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.soundLevelValue,
                { color: soundLevel > 70 ? '#DC2626' : soundLevel > 40 ? '#D97706' : '#16A34A' }
              ]}>
                {Math.round(soundLevel)}%
              </Text>
            </View>
          )}

          {!hasAudioPermission && (
            <View style={styles.permissionNotice}>
              <AlertTriangle size={20} color="#D97706" />
              <Text style={styles.permissionText}>
                Microphone permission required for sound detection
              </Text>
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
          
          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                🎤 Real-time audio analysis active. Make sure to allow microphone access for accurate detection.
              </Text>
            </View>
          )}
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
    borderRadius: 4,
    transition: 'width 0.1s ease-out',
  },
  soundLevelValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  permissionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    flex: 1,
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
  webNotice: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  webNoticeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0369A1',
    textAlign: 'center',
  },
});