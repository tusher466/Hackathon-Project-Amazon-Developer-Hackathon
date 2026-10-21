import { AccessibilitySettings, DiagnosticLog, MediaItem, UserProfile, WorkoutIntensityDay, ScheduledNotification } from '../types/tv';

const STORAGE_KEYS = {
  WATCHLIST: 'vega_tv_watchlist',
  SETTINGS: 'vega_tv_settings',
  PROFILES: 'vega_tv_profiles',
  ACTIVE_PROFILE: 'vega_tv_active_profile',
  FITNESS_HISTORY: 'vega_tv_fitness_history',
  INTENSITY_HISTORY: 'vega_tv_intensity_history',
  WATCHED_HISTORY: 'vega_tv_watched_history',
  NOTIFICATION_SCHEDULE: 'vega_tv_notification_schedule',
  DIAGNOSTICS: 'vega_tv_diagnostics',
  SYNC_QUEUE: 'vega_tv_sync_queue',
};

export const defaultNotificationSchedule: ScheduledNotification = {
  id: 'fitness-trend-reminder',
  title: '7-Day Fitness Trend Analysis',
  message: 'Your 7-day workout intensity analysis is scheduled in 30 minutes! Prepare your living room workout space.',
  scheduledAnalysisTime: '19:30',
  alertLeadMinutes: 30,
  active: true,
  repeatDaily: true,
};

export const defaultIntensityHistory: WorkoutIntensityDay[] = [
  { day: 'Wed', dateStr: 'Oct 15', avgIntensity: 62, peakIntensity: 78, durationMin: 22, calories: 154, zone: 'Aerobic', cameraConfidence: 94 },
  { day: 'Thu', dateStr: 'Oct 16', avgIntensity: 74, peakIntensity: 86, durationMin: 28, calories: 210, zone: 'Threshold', cameraConfidence: 96 },
  { day: 'Fri', dateStr: 'Oct 17', avgIntensity: 48, peakIntensity: 64, durationMin: 18, calories: 110, zone: 'Recovery', cameraConfidence: 92 },
  { day: 'Sat', dateStr: 'Oct 18', avgIntensity: 88, peakIntensity: 96, durationMin: 35, calories: 320, zone: 'Anaerobic', cameraConfidence: 98 },
  { day: 'Sun', dateStr: 'Oct 19', avgIntensity: 70, peakIntensity: 82, durationMin: 25, calories: 185, zone: 'Aerobic', cameraConfidence: 95 },
  { day: 'Mon', dateStr: 'Oct 20', avgIntensity: 82, peakIntensity: 94, durationMin: 30, calories: 260, zone: 'Threshold', cameraConfidence: 97 },
  { day: 'Tue', dateStr: 'Oct 21 (Today)', avgIntensity: 76, peakIntensity: 90, durationMin: 20, calories: 165, zone: 'Threshold', cameraConfidence: 98 },
];

export const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontScale: 'normal',
  audioFeedback: true,
  volume: 0.75,
  screenReaderTTS: false,
  tacticalHud: true,
  hapticEnabled: true,
  colorBlindFilter: 'none',
};

export const defaultProfiles: UserProfile[] = [
  { id: 'profile-main', name: 'Living Room Master', role: 'Adult', avatarColor: '#3b82f6', isBiometricLocked: false },
  { id: 'profile-kids', name: 'Family & Kids', role: 'Family/Kids', avatarColor: '#10b981', isBiometricLocked: true, pinCode: '1234' },
  { id: 'profile-sports', name: 'Matchday Fan', role: 'Sports Enthusiast', avatarColor: '#f59e0b', isBiometricLocked: false },
];

export const sampleMediaCatalog: MediaItem[] = [
  {
    id: 'sports-1',
    title: 'UEFA Champions League Final',
    category: 'sports',
    subtitle: 'Manchester City vs Real Madrid · 2nd Leg',
    duration: 'Live · 72:18',
    rating: 'LIVE 4K',
    resolution: '4K HDR',
    matchScore: '2 - 1',
    synopsis: 'Tactical clash under floodlights. AI computer vision tracking tracks 22 outfield players, real-time ball trajectory, and spatial pitch dominance.',
    backdropTheme: 'from-blue-950 via-slate-900 to-black',
    tags: ['Live Sports', 'Tactical CV', 'Champions League', '4K Ultra'],
    inWatchlist: true,
    downloaded: true,
  },
  {
    id: 'sports-2',
    title: 'Formula 1 Grand Prix: Monaco',
    category: 'sports',
    subtitle: 'Circuit de Monaco · Lap 58/78',
    duration: 'Live · Lap 58',
    rating: 'LIVE 4K',
    resolution: '4K HDR',
    matchScore: 'VER P1 (+1.84s)',
    synopsis: 'Live telemetry stream with simulated tire degradation heatmaps, apex G-force telemetry, and AI radio transcript breakdown.',
    backdropTheme: 'from-red-950 via-zinc-900 to-black',
    tags: ['Motorsport', 'Telemetry', 'Live 4K'],
    inWatchlist: false,
    downloaded: false,
  },
  {
    id: 'movie-1',
    title: 'Cosmic Horizon: Odyssey',
    category: 'movie',
    subtitle: 'Sci-Fi Blockbuster · Directed by Nolan Vance',
    duration: '2h 24m',
    rating: 'PG-13',
    resolution: '4K HDR',
    synopsis: 'Humanity sends its last deep-space reconnaissance crew across the Perseus nebula. Features Smart X-Ray scene insights and IMAX cinematography.',
    backdropTheme: 'from-purple-950 via-zinc-900 to-black',
    tags: ['Sci-Fi', 'Smart X-Ray', 'Dolby Atmos', '4K Master'],
    cast: ['Marcus Sterling', 'Dr. Elena Rostova', 'Kaelen Vance'],
    inWatchlist: true,
    downloaded: true,
  },
  {
    id: 'movie-2',
    title: 'Neon Drift: 2088',
    category: 'movie',
    subtitle: 'Cyberpunk Action · Award Winner',
    duration: '1h 58m',
    rating: 'TV-MA',
    resolution: '4K UHD',
    synopsis: 'A high-stakes kinetic thrill ride through the rain-soaked megacity canyons. Includes AI character motivations and score breakdowns.',
    backdropTheme: 'from-cyan-950 via-slate-900 to-black',
    tags: ['Cyberpunk', 'Action', 'HDR10+'],
    cast: ['Ren Takahashi', 'Sora Vance'],
    inWatchlist: false,
    downloaded: false,
  },
  {
    id: 'fitness-1',
    title: 'Living Room HIIT & Core Burn',
    category: 'fitness',
    subtitle: 'AI Pose & Rep Counter · Coach Maya',
    duration: '20 min',
    rating: 'All Levels',
    resolution: '4K UHD',
    synopsis: 'Interactive computer vision fitness coach. Live joint tracking counts repetitions, checks posture, and calculates real-time calorie burn.',
    backdropTheme: 'from-emerald-950 via-zinc-900 to-black',
    tags: ['AI Fitness', 'Pose Detection', 'HIIT', 'Living Room'],
    inWatchlist: true,
    downloaded: true,
  },
  {
    id: 'fitness-2',
    title: 'Morning Dynamic Mobility & Flow',
    category: 'fitness',
    subtitle: 'Low Impact Movement · Coach Julian',
    duration: '15 min',
    rating: 'Gentle',
    resolution: '1080p',
    synopsis: 'Gentle spine and hip decompression designed specifically for relaxing before or after long days.',
    backdropTheme: 'from-amber-950 via-zinc-900 to-black',
    tags: ['Mobility', 'Recovery', 'Posture'],
    inWatchlist: false,
    downloaded: false,
  },
  {
    id: 'documentary-1',
    title: 'Deep Abyss: The Mariana Trench',
    category: 'documentary',
    subtitle: 'Earth Origins · 4K Wildlife',
    duration: '1h 14m',
    rating: 'TV-G',
    resolution: '4K HDR',
    synopsis: 'Ultra-high-definition capture of bioluminescent siphonophores and abyssal benthic fauna living 11,000 meters down.',
    backdropTheme: 'from-blue-950 via-zinc-950 to-black',
    tags: ['Nature', '4K Wildlife', 'Family', 'Dolby Vision'],
    inWatchlist: false,
    downloaded: true,
  },
  {
    id: 'sports-3',
    title: 'Premier League: Arsenal vs Chelsea',
    category: 'sports',
    subtitle: 'London Derby · Emirates Stadium',
    duration: 'Live · 84:10',
    rating: 'LIVE 4K',
    resolution: '4K HDR',
    matchScore: '3 - 2',
    synopsis: 'High-octane London derby with live pressing intensity heatmaps, sprint speed trackers, and defensive shape analysis powered by CV.',
    backdropTheme: 'from-red-950 via-neutral-900 to-black',
    tags: ['Live Sports', 'Tactical CV', 'Premier League', 'High Tempo'],
    inWatchlist: false,
    downloaded: true,
  },
  {
    id: 'fitness-3',
    title: 'Metabolic Athletic Conditioning',
    category: 'fitness',
    subtitle: 'Speed, Agility & Core · Coach Marcus',
    duration: '25 min',
    rating: 'Advanced',
    resolution: '4K UHD',
    synopsis: 'High-intensity cross-training designed for athletic speed and functional power. Real-time joint velocity and explosive rep counter.',
    backdropTheme: 'from-rose-950 via-zinc-900 to-black',
    tags: ['AI Fitness', 'Athletic', 'HIIT', 'Anaerobic'],
    inWatchlist: false,
    downloaded: false,
  },
  {
    id: 'movie-3',
    title: 'Echoes of the Nebula: Starfall',
    category: 'movie',
    subtitle: 'Deep Space Drama · Dolby Vision',
    duration: '2h 10m',
    rating: 'PG-13',
    resolution: '4K HDR',
    synopsis: 'An interstellar search for lost celestial frequencies. Sweeping orchestral score mixed in spatial Dolby Atmos with 4K color grading.',
    backdropTheme: 'from-indigo-950 via-zinc-900 to-black',
    tags: ['Sci-Fi', 'Space', 'Dolby Atmos', '4K Master'],
    cast: ['Devon Cole', 'Astrid Lind'],
    inWatchlist: false,
    downloaded: true,
  },
];

// Local diagnostic logger
export class TVLogger {
  private static logs: DiagnosticLog[] = [];

  public static log(level: 'INFO' | 'WARN' | 'ERROR', category: DiagnosticLog['category'], message: string) {
    const entry: DiagnosticLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();

    try {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(this.logs));
    } catch {}
  }

  public static getLogs(): DiagnosticLog[] {
    if (this.logs.length === 0) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS);
        if (raw) this.logs = JSON.parse(raw);
      } catch {}
    }
    return this.logs;
  }
}

// Client Storage API
export const tvStorage = {
  getSettings(): AccessibilitySettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {}
    return defaultSettings;
  },

  saveSettings(settings: AccessibilitySettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      TVLogger.log('INFO', 'SYNC', 'Display & accessibility settings cached locally');
    } catch {}
  },

  getWatchlist(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (raw) return JSON.parse(raw);
    } catch {}
    return ['sports-1', 'movie-1', 'fitness-1'];
  },

  toggleWatchlist(id: string): boolean {
    const list = this.getWatchlist();
    const idx = list.indexOf(id);
    let isIn = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(id);
      isIn = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
      TVLogger.log('INFO', 'SYNC', `Watchlist updated: ${id} (${isIn ? 'added' : 'removed'})`);
    } catch {}
    return isIn;
  },

  getProfiles(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultProfiles;
  },

  getActiveProfileId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || 'profile-main';
    } catch {
      return 'profile-main';
    }
  },

  setActiveProfileId(id: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
      TVLogger.log('INFO', 'REMOTE', `Switched active profile to ${id}`);
    } catch {}
  },

  getIntensityHistory(): WorkoutIntensityDay[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTENSITY_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultIntensityHistory;
  },

  saveIntensityHistory(history: WorkoutIntensityDay[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.INTENSITY_HISTORY, JSON.stringify(history));
      TVLogger.log('INFO', 'SYNC', 'Updated 7-day workout intensity history');
    } catch {}
  },

  getWatchedHistory(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WATCHED_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // Sensible defaults representing past viewed content (matches UCL Final, HIIT Session & Sci-Fi)
    return ['sports-1', 'fitness-1', 'movie-1'];
  },

  recordWatched(id: string) {
    try {
      const history = this.getWatchedHistory();
      const updated = [id, ...history.filter((x) => x !== id)].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.WATCHED_HISTORY, JSON.stringify(updated));
      TVLogger.log('INFO', 'SYNC', `Logged viewing interaction for item ${id}`);
    } catch {}
  },

  getNotificationSchedule(): ScheduledNotification {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE);
      if (raw) return { ...defaultNotificationSchedule, ...JSON.parse(raw) };
    } catch {}
    return defaultNotificationSchedule;
  },

  saveNotificationSchedule(notification: ScheduledNotification) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE, JSON.stringify(notification));
      TVLogger.log('INFO', 'SYNC', `Saved notification schedule: 30-min alert at ${notification.scheduledAnalysisTime}`);
    } catch {}
  },

  // Simulated AES-GCM Encrypted Storage using Web Crypto API
  async encryptAndStoreSensitiveData(keyName: string, data: any, passkey: string): Promise<boolean> {
    try {
      if (!window.crypto?.subtle) {
        localStorage.setItem(keyName, JSON.stringify(data));
        return true;
      }
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passkey.padEnd(32, '0')),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        enc.encode(JSON.stringify(data))
      );
      const payload = {
        iv: Array.from(iv),
        cipher: Array.from(new Uint8Array(encrypted)),
      };
      localStorage.setItem(keyName, JSON.stringify(payload));
      TVLogger.log('INFO', 'SYNC', `End-to-End Encrypted data stored for ${keyName}`);
      return true;
    } catch (e: any) {
      TVLogger.log('ERROR', 'SYNC', `Encryption failed: ${e?.message}`);
      return false;
    }
  },

  // Sync with cloud backend
  async syncToCloud(data: Record<string, any>): Promise<{ success: boolean; lastSynced?: string }> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: this.getActiveProfileId(),
          data,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        TVLogger.log('INFO', 'SYNC', 'Successfully backed up profile to Vega Cloud');
        return { success: true, lastSynced: json.lastSynced };
      }
    } catch (err: any) {
      TVLogger.log('WARN', 'NETWORK', `Cloud sync deferred: offline or network timeout`);
    }
    return { success: false };
  },
};
