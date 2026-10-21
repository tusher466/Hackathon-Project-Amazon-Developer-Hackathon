/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, MediaItem, AccessibilitySettings, UserProfile } from './types/tv';
import { audioFeedback } from './utils/audioFeedback';
import { tvStorage, defaultSettings, defaultProfiles, TVLogger } from './utils/offlineStorage';
import { TopNav } from './components/TopNav';
import { VirtualRemote } from './components/VirtualRemote';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { HomeView } from './components/views/HomeView';
import { SportsView } from './components/views/SportsView';
import { CinemaView } from './components/views/CinemaView';
import { FitnessView } from './components/views/FitnessView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<AccessibilitySettings>(() => tvStorage.getSettings());
  const [profiles, setProfiles] = useState<UserProfile[]>(() => tvStorage.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => tvStorage.getActiveProfileId());
  const [watchlist, setWatchlist] = useState<string[]>(() => tvStorage.getWatchlist());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(new Date().toISOString());
  const [focusedElementId, setFocusedElementId] = useState<string>('nav-home');

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Sync settings with audio feedback engine
  useEffect(() => {
    audioFeedback.setVolume(settings.volume);
    audioFeedback.setEnabled(settings.audioFeedback);
    audioFeedback.setTTSEnabled(settings.screenReaderTTS);
  }, [settings]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      audioFeedback.announceTTS('Internet connection restored. Synchronizing data.');
      TVLogger.log('INFO', 'NETWORK', 'Network connection restored. Online.');
      // Auto-sync when network returns
      handleCloudSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      audioFeedback.announceTTS('Operating in offline mode. Local media cache active.');
      TVLogger.log('WARN', 'NETWORK', 'Network disconnected. Operating in offline mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update Settings handler
  const handleUpdateSettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    tvStorage.saveSettings(newSettings);
  };

  // Profile update handler
  const handleUpdateProfile = (newProfile: UserProfile) => {
    const updated = profiles.map((p) => (p.id === newProfile.id ? newProfile : p));
    setProfiles(updated);
    try {
      localStorage.setItem('vega_tv_profiles', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    tvStorage.setActiveProfileId(id);
    audioFeedback.announceTTS(`Switched to profile ${profiles.find((p) => p.id === id)?.name}`);
  };

  // Watchlist toggle handler
  const handleToggleWatchlist = (id: string) => {
    const added = tvStorage.toggleWatchlist(id);
    setWatchlist(tvStorage.getWatchlist());
    audioFeedback.announceTTS(added ? 'Added to living room watchlist' : 'Removed from watchlist');
  };

  // Cloud sync handler
  const handleCloudSync = async () => {
    setIsSyncing(true);
    const res = await tvStorage.syncToCloud({
      settings,
      watchlist,
      activeProfileId,
    });
    setIsSyncing(false);
    if (res.success && res.lastSynced) {
      setLastSyncedTime(res.lastSynced);
      audioFeedback.playSelectChime();
    }
  };

  // Spatial Navigation & Remote Key Event Dispatcher
  const handleRemoteUp = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote D-Pad UP');
    // If on content, move focus to top nav
    if (!focusedElementId.startsWith('nav-')) {
      const targetNav = `nav-${currentTab}`;
      setFocusedElementId(targetNav);
      audioFeedback.announceTTS(`Focused ${currentTab} navigation link`);
    }
  }, [focusedElementId, currentTab]);

  const handleRemoteDown = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote D-Pad DOWN');
    if (focusedElementId.startsWith('nav-')) {
      if (currentTab === 'home') setFocusedElementId('hero-play-btn');
      else if (currentTab === 'sports') setFocusedElementId('sports-hud-toggle');
      else if (currentTab === 'movies') setFocusedElementId('cinema-sub-toggle');
      else if (currentTab === 'fitness') setFocusedElementId('fitness-play-btn');
      else if (currentTab === 'settings') setFocusedElementId('settings-high-contrast-btn');
      audioFeedback.announceTTS('Focused content action');
    }
  }, [focusedElementId, currentTab]);

  const handleRemoteLeft = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote D-Pad LEFT');
    const tabs: NavTab[] = ['home', 'sports', 'movies', 'fitness', 'settings'];
    const idx = tabs.indexOf(currentTab);
    if (idx > 0) {
      const prev = tabs[idx - 1];
      setCurrentTab(prev);
      setFocusedElementId(`nav-${prev}`);
      audioFeedback.announceTTS(`Tab ${prev}`);
    }
  }, [currentTab]);

  const handleRemoteRight = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote D-Pad RIGHT');
    const tabs: NavTab[] = ['home', 'sports', 'movies', 'fitness', 'settings'];
    const idx = tabs.indexOf(currentTab);
    if (idx < tabs.length - 1) {
      const next = tabs[idx + 1];
      setCurrentTab(next);
      setFocusedElementId(`nav-${next}`);
      audioFeedback.announceTTS(`Tab ${next}`);
    }
  }, [currentTab]);

  const handleRemoteSelect = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote SELECT (OK)');
    const el = document.getElementById(focusedElementId);
    if (el) {
      el.click();
    } else {
      audioFeedback.playSelectChime();
    }
  }, [focusedElementId]);

  const handleRemoteBack = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote BACK');
    if (isVoiceOpen) {
      setIsVoiceOpen(false);
      return;
    }
    if (currentTab !== 'home') {
      setCurrentTab('home');
      setFocusedElementId('nav-home');
      audioFeedback.announceTTS('Returned to Home');
    }
  }, [isVoiceOpen, currentTab]);

  const handleRemoteHome = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote HOME');
    setIsVoiceOpen(false);
    setCurrentTab('home');
    setFocusedElementId('nav-home');
    audioFeedback.announceTTS('Navigated to Home');
  }, []);

  const handleRemoteMenu = useCallback(() => {
    TVLogger.log('INFO', 'REMOTE', 'Remote MENU');
    setCurrentTab('settings');
    setFocusedElementId('nav-settings');
    audioFeedback.announceTTS('Opened Settings & Accessibility');
  }, []);

  const handleRemoteVoice = useCallback(() => {
    setIsVoiceOpen(true);
  }, []);

  const handleRemotePlayPause = useCallback(() => {
    setIsPlaying((p) => {
      const next = !p;
      audioFeedback.playSelectChime();
      audioFeedback.announceTTS(next ? 'Resumed playback' : 'Paused playback');
      return next;
    });
  }, []);

  const handleRemoteVolumeChange = useCallback((delta: number) => {
    setSettings((s) => {
      const nextVol = Math.max(0, Math.min(1, Math.round((s.volume + delta) * 100) / 100));
      audioFeedback.setVolume(nextVol);
      audioFeedback.playNavClick();
      return { ...s, volume: nextVol };
    });
  }, []);

  // Global Remote Control Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          audioFeedback.playNavClick();
          handleRemoteUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          audioFeedback.playNavClick();
          handleRemoteDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audioFeedback.playNavClick();
          handleRemoteLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          audioFeedback.playNavClick();
          handleRemoteRight();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          audioFeedback.playSelectChime();
          handleRemoteSelect();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          audioFeedback.playBackTone();
          handleRemoteBack();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          handleRemoteHome();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleRemoteMenu();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          handleRemoteVoice();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handleRemotePlayPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleRemoteUp,
    handleRemoteDown,
    handleRemoteLeft,
    handleRemoteRight,
    handleRemoteSelect,
    handleRemoteBack,
    handleRemoteHome,
    handleRemoteMenu,
    handleRemoteVoice,
    handleRemotePlayPause,
  ]);

  // Voice Assistant command dispatcher
  const handleVoiceCommand = (action: string, target?: string) => {
    TVLogger.log('INFO', 'AUDIO', `Executed Voice Action: ${action} (target: ${target || 'none'})`);

    if (action === 'navigate_tab' && target) {
      if (['home', 'sports', 'movies', 'fitness', 'settings'].includes(target)) {
        setCurrentTab(target as NavTab);
        setFocusedElementId(`nav-${target}`);
      }
    } else if (action === 'toggle_high_contrast') {
      handleUpdateSettings({ ...settings, highContrast: !settings.highContrast });
    } else if (action === 'toggle_playback') {
      setIsPlaying((p) => !p);
    } else if (action === 'toggle_tactical_hud') {
      setCurrentTab('sports');
    } else if (action === 'toggle_xray') {
      setCurrentTab('movies');
    }
  };

  // Font scale class
  const fontScaleClass =
    settings.fontScale === 'large'
      ? 'font-scale-large'
      : settings.fontScale === 'xlarge'
      ? 'font-scale-xlarge'
      : '';

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black ${
        settings.highContrast ? 'high-contrast' : ''
      } ${fontScaleClass}`}
    >
      {/* Invisible Screen Reader Live Announcer for WCAG 2.1 compliance */}
      <div aria-live="polite" aria-atomic="true" className="sr-live-region" id="tv-aria-announcer">
        Current Screen: {currentTab}
      </div>

      {/* Living Room Top Bar */}
      <TopNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setFocusedElementId(`nav-${tab}`);
        }}
        activeProfile={activeProfile}
        isOnline={isOnline}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onToggleProfileLock={() => {
          handleUpdateProfile({
            ...activeProfile,
            isBiometricLocked: !activeProfile.isBiometricLocked,
          });
          audioFeedback.playSelectChime();
        }}
        focusedElementId={focusedElementId}
      />

      {/* Main Screen Viewport Content */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto">
        {currentTab === 'home' && (
          <HomeView
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              setFocusedElementId(`nav-${tab}`);
            }}
            onSelectMedia={(item) => {
              tvStorage.recordWatched(item.id);
              if (item.category === 'sports') setCurrentTab('sports');
              else if (item.category === 'fitness') setCurrentTab('fitness');
              else setCurrentTab('movies');
            }}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            focusedElementId={focusedElementId}
            activeProfile={activeProfile}
            highContrast={settings.highContrast}
          />
        )}

        {currentTab === 'sports' && (
          <SportsView focusedElementId={focusedElementId} highContrast={settings.highContrast} />
        )}

        {currentTab === 'movies' && (
          <CinemaView focusedElementId={focusedElementId} highContrast={settings.highContrast} />
        )}

        {currentTab === 'fitness' && (
          <FitnessView focusedElementId={focusedElementId} highContrast={settings.highContrast} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            isOnline={isOnline}
            onForceSync={handleCloudSync}
            isSyncing={isSyncing}
            lastSyncedTime={lastSyncedTime}
            focusedElementId={focusedElementId}
          />
        )}
      </main>

      {/* Interactive Fire TV / Vega OS Voice Remote Simulation Widget */}
      <VirtualRemote
        onUp={handleRemoteUp}
        onDown={handleRemoteDown}
        onLeft={handleRemoteLeft}
        onRight={handleRemoteRight}
        onSelect={handleRemoteSelect}
        onBack={handleRemoteBack}
        onHome={handleRemoteHome}
        onMenu={handleRemoteMenu}
        onVoice={handleRemoteVoice}
        onPlayPause={handleRemotePlayPause}
        onVolumeChange={handleRemoteVolumeChange}
        isPlaying={isPlaying}
      />

      {/* Alexa Voice Assistant Overlay */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExecuteCommand={handleVoiceCommand}
      />
    </div>
  );
}
