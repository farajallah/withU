import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface EmergencyAlertConfig {
  vibrationEnabled: boolean;
  flashEnabled: boolean;
  soundEnabled: boolean;
  assistanceMessage: string;
}

interface SoundEvent {
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  confidence: number;
  timestamp: Date;
}

export function useEmergencyAlert(config: EmergencyAlertConfig) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SoundEvent | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const vibrationInterval = useRef<NodeJS.Timeout | null>(null);
  const flashInterval = useRef<NodeJS.Timeout | null>(null);

  const triggerEmergencyAlert = async (event: SoundEvent) => {
    setCurrentAlert(event);
    setIsAlertActive(true);

    // Start vibration
    if (config.vibrationEnabled) {
      startVibrationPattern();
    }

    // Start flash
    if (config.flashEnabled) {
      startFlashPattern();
    }

    // Play assistance message
    if (config.soundEnabled) {
      await playAssistanceMessage();
    }
  };

  const dismissAlert = () => {
    setIsAlertActive(false);
    setCurrentAlert(null);
    stopAllAlerts();
  };

  const startVibrationPattern = () => {
    if (Platform.OS === 'web') return;

    const vibrate = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    // Immediate vibration
    vibrate();

    // Continue vibrating every 500ms
    vibrationInterval.current = setInterval(vibrate, 500);

    // Stop after 30 seconds
    setTimeout(() => {
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
        vibrationInterval.current = null;
      }
    }, 30000);
  };

  const startFlashPattern = () => {
    if (Platform.OS === 'web') {
      // Web implementation using screen flash
      const flashScreen = () => {
        document.body.style.backgroundColor = '#FFFFFF';
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 100);
      };

      flashScreen();
      flashInterval.current = setInterval(flashScreen, 500);

      // Stop after 30 seconds
      setTimeout(() => {
        if (flashInterval.current) {
          clearInterval(flashInterval.current);
          flashInterval.current = null;
        }
      }, 30000);
    } else {
      // Mobile implementation would use camera flash
      // This would require expo-camera's torch functionality
      console.log('Flash pattern would be implemented with camera torch on mobile');
    }
  };

  const playAssistanceMessage = async () => {
    try {
      // In a real implementation, this would play a pre-recorded message
      // For now, we'll use text-to-speech or a placeholder
      
      if (Platform.OS === 'web') {
        // Web Speech API
        const utterance = new SpeechSynthesisUtterance(config.assistanceMessage);
        utterance.volume = 1.0;
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      } else {
        // Mobile implementation with expo-av
        const { sound } = await Audio.Sound.createAsync(
          // This would be a pre-recorded audio file
          { uri: 'path/to/assistance/message.mp3' },
          { shouldPlay: true, volume: 1.0 }
        );
        soundRef.current = sound;
      }
    } catch (error) {
      console.error('Failed to play assistance message:', error);
    }
  };

  const stopAllAlerts = () => {
    // Stop vibration
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      vibrationInterval.current = null;
    }

    // Stop flash
    if (flashInterval.current) {
      clearInterval(flashInterval.current);
      flashInterval.current = null;
      if (Platform.OS === 'web') {
        document.body.style.backgroundColor = '';
      }
    }

    // Stop sound
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (Platform.OS === 'web') {
      speechSynthesis.cancel();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAlerts();
    };
  }, []);

  return {
    isAlertActive,
    currentAlert,
    triggerEmergencyAlert,
    dismissAlert,
    stopAllAlerts,
  };
}