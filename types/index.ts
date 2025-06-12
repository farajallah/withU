export interface SoundEvent {
  id: string;
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  timestamp: Date;
  confidence: number;
  duration: number;
}

export interface UserStatus {
  status: 'safe' | 'need_help' | 'emergency';
  message?: string;
  timestamp: Date;
}

export interface EmergencySettings {
  vibrationEnabled: boolean;
  flashEnabled: boolean;
  soundEnabled: boolean;
  backgroundMonitoring: boolean;
  autoAlert: boolean;
  language: 'en' | 'tr' | 'ar';
}

export interface EmergencyAlert {
  id: string;
  type: 'fire_alarm' | 'smoke_detector' | 'siren' | 'emergency';
  title: string;
  subtitle: string;
  timestamp: Date;
  dismissed: boolean;
}