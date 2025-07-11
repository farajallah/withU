import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Shield, TriangleAlert as AlertTriangle, Heart, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [isProtected, setIsProtected] = useState(true);
  const [lastAlert, setLastAlert] = useState<Date | null>(null);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleEmergencyTest = () => {
    triggerHapticFeedback();
    setLastAlert(new Date());
    // This would trigger the emergency alert system
  };

  const handleToggleProtection = () => {
    triggerHapticFeedback();
    setIsProtected(!isProtected);
  };

  const handleBoltBadgePress = async () => {
    try {
      await Linking.openURL('https://bolt.new/');
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isProtected ? ['#DC2626', '#B91C1C'] : ['#6B7280', '#4B5563']}
        style={styles.background}
      >
        <View style={styles.headerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>WithU</Text>
          <Text style={styles.subtitle}>Emergency Protection Active</Text>
        </View>

          {/* Bolt.new Badge */}
        <TouchableOpacity 
          style={styles.boltBadge}
          onPress={handleBoltBadgePress}
          accessibilityLabel="Built with Bolt.new - Open Bolt.new website"
        >
          <Image
            source={require('../../assets/images/bolt.new-badge.png')}
            style={styles.boltBadgeImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

</View>
        
        {/* Main Status Card */}
        <BlurView intensity={20} style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.statusIcon}>
              {isProtected ? (
                <Shield size={80} color="#16A34A" strokeWidth={2} />
              ) : (
                <AlertTriangle size={80} color="#D97706" strokeWidth={2} />
              )}
            </View>
            
            <Text style={styles.statusTitle}>
              {isProtected ? 'PROTECTED' : 'PROTECTION OFF'}
            </Text>
            
            <Text style={styles.statusDescription}>
              {isProtected
                ? 'Monitoring for emergency sounds'
                : 'Touch to activate protection'}
            </Text>

            {lastAlert && (
              <View style={styles.lastAlertContainer}>
                <Text style={styles.lastAlertText}>
                  Last Alert: {lastAlert.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
        </BlurView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isProtected && styles.primaryButtonInactive,
            ]}
            onPress={handleToggleProtection}
            accessibilityLabel={isProtected ? 'Disable protection' : 'Enable protection'}
          >
            <Zap size={24} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>
              {isProtected ? 'DISABLE PROTECTION' : 'ENABLE PROTECTION'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleEmergencyTest}
            accessibilityLabel="Test emergency alert"
          >
            <AlertTriangle size={20} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.testButtonText}>TEST EMERGENCY ALERT</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart size={16} color="#FFFFFF" />
            <Text style={styles.statText}>24/7 Active</Text>
          </View>
          <View style={styles.statItem}>
            <Shield size={16} color="#FFFFFF" />
            <Text style={styles.statText}>Privacy First</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
headerContainer: {
flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: Platform.OS === 'web' ? 60 : 80, // move top padding here
  paddingBottom: 20,
},
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  boltBadge: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
  padding: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
  elevation: 8,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  boltBadgeImage: {
    // width: width > 768 ? 160 : width > 480 ? 140 : 120,
    // height: width > 768 ? 53 : width > 480 ? 47 : 40,
    width:60,
    height:60,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 30,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  statusDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  lastAlertContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
  },
  lastAlertText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  actionContainer: {
    marginTop: 20,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 30,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});