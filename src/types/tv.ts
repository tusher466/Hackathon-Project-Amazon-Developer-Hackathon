export type NavTab = 'home' | 'sports' | 'movies' | 'fitness' | 'settings';

export interface MediaItem {
  id: string;
  title: string;
  category: 'sports' | 'movie' | 'fitness' | 'documentary';
  subtitle: string;
  duration: string;
  rating: string;
  resolution: '4K HDR' | '4K UHD' | '1080p';
  matchScore?: string;
  synopsis: string;
  backdropTheme: string;
  tags: string[];
  cast?: string[];
  inWatchlist?: boolean;
  downloaded?: boolean;
  affinityScore?: number;
  recommendationReason?: string;
  algorithmFactors?: {
    watchHistoryWeight: number;
    fitnessWeight: number;
    profileWeight: number;
    totalScore: number;
  };
}

export type AlgorithmPreset = 'balanced' | 'fitness_synergy' | 'watch_history';

export interface PlayerBox {
  id: string;
  name: string;
  number: number;
  team: 'blue' | 'white';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  speedKmH: number;
  stamina: number;
  highlighted?: boolean;
}

export interface TacticalAnalysis {
  headline: string;
  possessionDominance: string;
  xgTrend: string;
  tacticalShift: string;
  keyPlayerFocus: string;
  predictedPattern: string;
  passAccuracyZone: string;
}

export interface ActorXRayInfo {
  name: string;
  character: string;
  bio: string;
  knownFor: string[];
  characterMotivation: string;
  funFact: string;
  avatarInitials: string;
  screenCoordinates: { x: number; y: number }; // Percentage position on screen for facial tracking reticle
}

export interface SceneContextInfo {
  sceneTitle: string;
  narrativeSummary: string;
  directorNote: string;
  musicPlaying: string;
  productionTrivia: string;
  easterEgg: string;
}

export interface XRayData {
  sceneTrivia: string;
  musicPlaying: string;
  directorNote: string;
  characterMotivations: string;
  easterEgg: string;
  selectedActorInfo?: ActorXRayInfo;
  sceneContext?: SceneContextInfo;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontScale: 'normal' | 'large' | 'xlarge';
  audioFeedback: boolean;
  volume: number;
  screenReaderTTS: boolean;
  tacticalHud: boolean;
  hapticEnabled: boolean;
  colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Adult' | 'Family/Kids' | 'Sports Enthusiast';
  avatarColor: string;
  isBiometricLocked: boolean;
  pinCode?: string;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  category: 'NETWORK' | 'CV_ENGINE' | 'AUDIO' | 'REMOTE' | 'SYNC';
  message: string;
}

export interface WorkoutIntensityDay {
  day: string;
  dateStr: string;
  avgIntensity: number; // 0 - 100%
  peakIntensity: number; // 0 - 100%
  durationMin: number;
  calories: number;
  zone: 'Recovery' | 'Aerobic' | 'Threshold' | 'Anaerobic';
  cameraConfidence: number; // %
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledAnalysisTime: string; // e.g. "19:00"
  alertLeadMinutes: number; // 30
  active: boolean;
  repeatDaily: boolean;
  lastAlertFired?: string;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  location: string;
  consistencyScore: number; // e.g. 98.4 (%)
  activeDays: number; // e.g. 7 (out of 7)
  weeklyMinutes: number;
  weeklyCalories: number;
  streakDays: number;
  isCurrentUser?: boolean;
  avatarColor: string;
  badge?: string;
}

export interface DailyMotivationTip {
  title: string;
  tip: string;
  category: string;
  actionableStep: string;
  estimatedTime: string;
  intensityLevel: 'Low' | 'Medium' | 'High';
  aiQuote: string;
  date: string;
  isAiGenerated: boolean;
}



