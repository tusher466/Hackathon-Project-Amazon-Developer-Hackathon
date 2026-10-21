import React, { useState } from 'react';
import { AccessibilitySettings, DiagnosticLog, UserProfile } from '../../types/tv';
import { audioFeedback } from '../../utils/audioFeedback';
import { TVLogger, tvStorage } from '../../utils/offlineStorage';
import {
  Sliders,
  Volume2,
  Eye,
  Type,
  Shield,
  Cloud,
  HardDrive,
  Terminal,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: AccessibilitySettings) => void;
  activeProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  profiles: UserProfile[];
  onSelectProfile: (id: string) => void;
  isOnline: boolean;
  onForceSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedTime: string | null;
  focusedElementId?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  activeProfile,
  onUpdateProfile,
  profiles,
  onSelectProfile,
  isOnline,
  onForceSync,
  isSyncing,
  lastSyncedTime,
  focusedElementId,
}) => {
  const [activeTab, setActiveTab] = useState<'accessibility' | 'display' | 'storage' | 'security' | 'diagnostics'>('accessibility');
  const [diagnosticsList, setDiagnosticsList] = useState<DiagnosticLog[]>(TVLogger.getLogs());
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  const handleToggleHighContrast = () => {
    const next = !settings.highContrast;
    const updated = { ...settings, highContrast: next };
    onUpdateSettings(updated);
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS(`High contrast mode ${next ? 'enabled' : 'disabled'}`);
    TVLogger.log('INFO', 'SYNC', `High contrast toggled to ${next}`);
  };

  const handleFontScaleChange = (scale: 'normal' | 'large' | 'xlarge') => {
    const updated = { ...settings, fontScale: scale };
    onUpdateSettings(updated);
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS(`Font scale set to ${scale}`);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, volume: vol };
    onUpdateSettings(updated);
    audioFeedback.setVolume(vol);
    audioFeedback.playNavClick();
  };

  const handleToggleTTS = () => {
    const next = !settings.screenReaderTTS;
    const updated = { ...settings, screenReaderTTS: next };
    onUpdateSettings(updated);
    audioFeedback.setTTSEnabled(next);
    audioFeedback.playSelectChime();
    if (next) audioFeedback.announceTTS('Screen reader speech voice feedback enabled.');
  };

  const handleToggleHaptic = () => {
    const next = !settings.hapticEnabled;
    const updated = { ...settings, hapticEnabled: next };
    onUpdateSettings(updated);
    audioFeedback.playSelectChime();
    if (next) audioFeedback.triggerHaptic(50);
  };

  const handleToggleProfileLock = () => {
    if (activeProfile.isBiometricLocked) {
      // Unlock with PIN simulation
      setShowPinModal(true);
    } else {
      // Lock
      const updated = { ...activeProfile, isBiometricLocked: true };
      onUpdateProfile(updated);
      audioFeedback.playSelectChime();
      audioFeedback.announceTTS('Profile protected with biometric PIN lock');
    }
  };

  const verifyPin = () => {
    if (pinInput === '1234' || pinInput === activeProfile.pinCode || !activeProfile.pinCode) {
      const updated = { ...activeProfile, isBiometricLocked: false };
      onUpdateProfile(updated);
      setShowPinModal(false);
      setPinInput('');
      setBiometricFeedback('Biometric PIN confirmed. Profile unlocked.');
      audioFeedback.playSelectChime();
      setTimeout(() => setBiometricFeedback(null), 3000);
    } else {
      setBiometricFeedback('Incorrect PIN. Default is 1234');
      audioFeedback.playBackTone();
    }
  };

  const refreshLogs = () => {
    setDiagnosticsList([...TVLogger.getLogs()]);
    audioFeedback.playNavClick();
  };

  return (
    <div className="w-full flex flex-col gap-6 p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Title Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider">Device Settings</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 AAA Compliant</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-zinc-400">Fire TV Build v2.8.4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            System &amp; Accessibility Hub
          </h1>
        </div>

        {/* Force Cloud Sync Button */}
        <button
          onClick={onForceSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-amber-400 hover:text-white transition-all shadow"
        >
          <Cloud className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-bounce' : ''}`} />
          <span>{isSyncing ? 'Syncing with Vega Cloud...' : 'Force Cloud Sync'}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        <button
          onClick={() => {
            setActiveTab('accessibility');
            audioFeedback.playNavClick();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'accessibility' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Accessibility &amp; Voice</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('display');
            audioFeedback.playNavClick();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'display' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>4K Display &amp; Scaling</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            audioFeedback.playNavClick();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Biometrics &amp; Encryption</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('storage');
            audioFeedback.playNavClick();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'storage' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Offline Storage &amp; Sync</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('diagnostics');
            audioFeedback.playNavClick();
            refreshLogs();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'diagnostics' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Device Logs &amp; Debugging</span>
        </button>
      </div>

      {/* Tab 1: Accessibility & Voice */}
      {activeTab === 'accessibility' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* High Contrast Mode */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">High Contrast Theme (WCAG AAA)</h3>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  ACCESSIBILITY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Applies pure pitch-black surfaces with high-visibility amber borders and max-luminance text for users with visual impairments.
              </p>
            </div>
            <button
              id="settings-high-contrast-btn"
              onClick={handleToggleHighContrast}
              className={`tv-focusable w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                settings.highContrast
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{settings.highContrast ? 'HIGH CONTRAST: ACTIVE' : 'ENABLE HIGH CONTRAST'}</span>
            </button>
          </div>

          {/* Font Scaling Options */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Font Size Scaling</h3>
                <Type className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Scales typographic scale across all 10-foot television screens for optimal living-room couch readability.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => handleFontScaleChange(scale)}
                  className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    settings.fontScale === scale
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                  }`}
                >
                  {scale === 'normal' ? 'Standard' : scale === 'large' ? 'Large (112%)' : 'X-Large (125%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Reader Voice (TTS) */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Screen Reader (TTS Announcer)</h3>
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Audibly speaks remote control movements, highlighted elements, and incoming AI tactical updates through television speakers.
              </p>
            </div>
            <button
              onClick={handleToggleTTS}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                settings.screenReaderTTS
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <span>{settings.screenReaderTTS ? 'SCREEN READER: ACTIVE' : 'ENABLE SCREEN READER (TTS)'}</span>
            </button>
          </div>

          {/* Remote Navigation Audio Volume & Haptics */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Audio Chimes &amp; Haptic Cues</h3>
                <span className="font-mono text-xs text-zinc-400">{Math.round(settings.volume * 100)}%</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Adjusts synthesizer volume for D-pad navigation clicks, affirmative select chimes, and tactile haptic vibration pulses.
              </p>
              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 mb-3"
              />
            </div>
            <button
              onClick={handleToggleHaptic}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition-all ${
                settings.hapticEnabled
                  ? 'bg-zinc-800 text-amber-400 border-amber-400/80'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {settings.hapticEnabled ? 'Haptic Feedback: ENABLED' : 'Haptic Feedback: DISABLED'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: 4K Display & Scaling */}
      {activeTab === 'display' && (
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">4K UHD Television Display Calibration</h3>
            <p className="text-xs text-zinc-400">
              Configure safe-area overscan boundaries and 4K display scaling for 55&quot;, 65&quot;, and 85&quot; television panels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">TARGET RESOLUTION</span>
              <span className="text-lg font-bold text-amber-400 font-mono">3840 × 2160 (4K UHD)</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">REFRESH RATE</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">60.00 Hz Native</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">COLOR DEPTH</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">10-bit HDR10+</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">4K UI Zoom Mode (108%)</h4>
              <p className="text-xs text-zinc-400">Expands card layouts for viewing distances exceeding 10 feet.</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
              AUTO-DETECTED
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Biometrics & Encryption */}
      {activeTab === 'security' && (
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Living Room Biometrics &amp; Profile Encryption</h3>
            <p className="text-xs text-zinc-400">
              Multi-user profile protection with simulated biometric passkey and AES-GCM local storage encryption.
            </p>
          </div>

          {biometricFeedback && (
            <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{biometricFeedback}</span>
            </div>
          )}

          {/* Profile Switcher & Lock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const isActive = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProfile(p.id);
                    audioFeedback.playSelectChime();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-zinc-950 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                    {p.isBiometricLocked ? (
                      <Lock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{p.role}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Active Profile Protection</h4>
                <p className="text-xs text-zinc-400">
                  {activeProfile.isBiometricLocked
                    ? 'Currently locked. Kids purchases and adult content require PIN.'
                    : 'Currently unlocked.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleProfileLock}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition-colors"
            >
              {activeProfile.isBiometricLocked ? 'Unlock with PIN' : 'Lock Active Profile'}
            </button>
          </div>

          {/* PIN Input Modal if requested */}
          {showPinModal && (
            <div className="p-4 bg-zinc-950 border border-zinc-700 rounded-xl max-w-sm space-y-3">
              <span className="text-xs text-zinc-300 font-semibold block">Enter 4-Digit Profile PIN (Default: 1234)</span>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="****"
                  className="bg-zinc-900 border border-zinc-700 text-center text-lg tracking-widest text-white px-3 py-1.5 rounded-lg w-28 focus:border-amber-400 outline-none"
                />
                <button
                  onClick={verifyPin}
                  className="px-4 py-1.5 bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg hover:bg-amber-300"
                >
                  Verify
                </button>
                <button
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Storage & Offline Sync */}
      {activeTab === 'storage' && (
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Offline Storage &amp; Automatic Cloud Sync</h3>
            <p className="text-xs text-zinc-400">
              Vega OS caches your critical watchlists, 4K video assets, and workout telemetry offline for travel or connection drops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">CONNECTION STATUS</span>
              <span className={`text-base font-bold font-mono ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOnline ? 'ONLINE (SYNCED)' : 'OFFLINE MODE'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">LOCAL CACHE USAGE</span>
              <span className="text-base font-bold font-mono text-zinc-200">14.8 MB (IndexedDB)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">LAST CLOUD BACKUP</span>
              <span className="text-xs font-bold font-mono text-zinc-400">
                {lastSyncedTime ? new Date(lastSyncedTime).toLocaleTimeString() : 'Active Session'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Device Logs & Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Real-time Issue Tracking &amp; Diagnostics</h3>
              <p className="text-xs text-zinc-400">
                Live telemetry events across Network, Audio Synthesizer, Computer Vision Engine, and Remote Keypresses.
              </p>
            </div>
            <button
              onClick={refreshLogs}
              className="p-2 bg-zinc-800 text-zinc-300 rounded-lg hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Console Log Window */}
          <div className="h-64 bg-black border border-zinc-800 rounded-xl p-4 font-mono text-[11px] overflow-y-auto space-y-1 text-zinc-300">
            {diagnosticsList.length === 0 ? (
              <p className="text-zinc-600">No diagnostic logs recorded yet.</p>
            ) : (
              diagnosticsList.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-zinc-600">{log.timestamp}</span>
                  <span
                    className={`font-bold ${
                      log.level === 'ERROR'
                        ? 'text-red-400'
                        : log.level === 'WARN'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-zinc-500">[{log.category}]</span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
