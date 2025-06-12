import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface SoundEvent {
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  confidence: number;
  timestamp: Date;
}

interface SoundClassifierProps {
  isActive: boolean;
  onSoundDetected: (event: SoundEvent) => void;
  onError: (error: string) => void;
}

export default function SoundClassifier({
  isActive,
  onSoundDetected,
  onError,
}: SoundClassifierProps) {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isActive && Platform.OS === 'web') {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [isActive]);

  const startListening = async () => {
    try {
      if (Platform.OS !== 'web') {
        // For mobile platforms, we would use expo-av or react-native-sound
        // This is a placeholder for actual mobile implementation
        onError('Sound recognition requires native implementation on mobile');
        return;
      }

      // Web implementation using Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      mediaStreamRef.current = stream;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 2048;
      setIsListening(true);
      
      // Start analysis loop
      analyzeAudio();
    } catch (error) {
      onError('Failed to access microphone: ' + (error as Error).message);
    }
  };

  const stopListening = () => {
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
    setIsListening(false);
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !isActive) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Simple frequency analysis for emergency sounds
    const result = classifySound(dataArray);
    
    if (result) {
      onSoundDetected(result);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const classifySound = (frequencyData: Uint8Array): SoundEvent | null => {
    // This is a simplified classification algorithm
    // In a real implementation, you would use machine learning models
    
    const sampleRate = 44100;
    const fftSize = 2048;
    const frequencyResolution = sampleRate / fftSize;
    
    // Calculate average amplitude in different frequency ranges
    const lowFreq = getAverageAmplitude(frequencyData, 0, 500, frequencyResolution);
    const midFreq = getAverageAmplitude(frequencyData, 500, 2000, frequencyResolution);
    const highFreq = getAverageAmplitude(frequencyData, 2000, 8000, frequencyResolution);
    
    const totalAmplitude = lowFreq + midFreq + highFreq;
    
    // Threshold for sound detection
    if (totalAmplitude < 50) return null;
    
    // Simple pattern matching (this would be replaced with ML in production)
    let detectedType: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency' = 'emergency';
    let confidence = 0;
    
    // Fire alarm detection (typically 3-4 kHz beeping pattern)
    if (midFreq > 100 && highFreq > 80) {
      detectedType = 'fire_alarm';
      confidence = Math.min(0.9, (midFreq + highFreq) / 200);
    }
    // Smoke detector (typically higher pitched beep)
    else if (highFreq > 120 && midFreq > 60) {
      detectedType = 'smoke_detector';
      confidence = Math.min(0.85, highFreq / 150);
    }
    // Siren detection (sweeping frequency pattern)
    else if (lowFreq > 60 && midFreq > 80) {
      detectedType = 'siren';
      confidence = Math.min(0.8, (lowFreq + midFreq) / 180);
    }
    
    // Only report if confidence is above threshold
    if (confidence > 0.6) {
      return {
        type: detectedType,
        confidence,
        timestamp: new Date(),
      };
    }
    
    return null;
  };

  const getAverageAmplitude = (
    data: Uint8Array, 
    minFreq: number, 
    maxFreq: number, 
    frequencyResolution: number
  ): number => {
    const startIndex = Math.floor(minFreq / frequencyResolution);
    const endIndex = Math.floor(maxFreq / frequencyResolution);
    
    let sum = 0;
    let count = 0;
    
    for (let i = startIndex; i < endIndex && i < data.length; i++) {
      sum += data[i];
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  };

  // This component doesn't render anything visible
  return null;
}