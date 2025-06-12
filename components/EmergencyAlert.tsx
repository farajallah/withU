import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Volume2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface EmergencyAlertProps {
  isVisible: boolean;
  alertType: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  onDismiss?: () => void;
}

export default function EmergencyAlert({ 
  isVisible, 
  alertType, 
  onDismiss 
}: EmergencyAlertProps) {
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const flashAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      startEmergencyAnimations();
      triggerEmergencyFeedback();
    } else {
      stopAnimations();
    }
  }, [isVisible]);

  const startEmergencyAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flash animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopAnimations = () => {
    pulseAnimation.stopAnimation();
    flashAnimation.stopAnimation();
    shakeAnimation.stopAnimation();
  };

  const triggerEmergencyFeedback = () => {
    if (Platform.OS !== 'web') {
      // Trigger strong haptic feedback repeatedly
      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 500);

      // Stop after 10 seconds
      setTimeout(() => {
        clearInterval(hapticInterval);
      }, 10000);
    }
  };

  const getAlertConfig = () => {
    switch (alertType) {
      case 'fire_alarm':
        return {
          title: 'FIRE ALARM DETECTED',
          subtitle: 'Evacuate immediately',
          colors: ['#DC2626', '#B91C1C', '#991B1B'],
        };
      case 'smoke_detector':
        return {
          title: 'SMOKE DETECTOR',
          subtitle: 'Fire hazard detected',
          colors: ['#D97706', '#B45309', '#92400E'],
        };
      case 'siren':
        return {
          title: 'EMERGENCY SIREN',
          subtitle: 'Emergency vehicle nearby',
          colors: ['#7C3AED', '#6D28D9', '#5B21B6'],
        };
      default:
        return {
          title: 'EMERGENCY ALERT',
          subtitle: 'Immediate attention required',
          colors: ['#DC2626', '#B91C1C', '#991B1B'],
        };
    }
  };

  const alertConfig = getAlertConfig();

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.alertContainer,
          {
            transform: [
              { scale: pulseAnimation },
              { translateX: shakeAnimation }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={alertConfig.colors}
          style={styles.alertBackground}
        >
          <BlurView intensity={20} style={styles.alertContent}>
            {/* Flash overlay */}
            <Animated.View
              style={[
                styles.flashOverlay,
                {
                  opacity: flashAnimation,
                }
              ]}
            />

            {/* Alert Icon */}
            <View style={styles.alertIcon}>
              <AlertTriangle size={80} color="#FFFFFF" strokeWidth={3} />
            </View>

            {/* Alert Text */}
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertSubtitle}>{alertConfig.subtitle}</Text>

            {/* Emergency Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <Volume2 size={20} color="#FFFFFF" />
                <Text style={styles.instructionText}>
                  Playing assistance message
                </Text>
              </View>
              <Text style={styles.assistanceMessage}>
                "Take me with you, don't leave me behind."
              </Text>
            </View>

            {/* Dismiss Button */}
            <View style={styles.dismissContainer}>
              <Text style={styles.dismissText}>
                Tap anywhere to acknowledge
              </Text>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  alertBackground: {
    padding: 2,
    borderRadius: 24,
  },
  alertContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    padding: 40,
    alignItems: 'center',
    position: 'relative',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
  },
  alertIcon: {
    marginBottom: 20,
    zIndex: 1,
  },
  alertTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    zIndex: 1,
  },
  alertSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
    zIndex: 1,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    zIndex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  assistanceMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  dismissContainer: {
    zIndex: 1,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});