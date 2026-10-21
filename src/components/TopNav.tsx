import React from 'react';
import { NavTab, UserProfile } from '../types/tv';
import { audioFeedback } from '../utils/audioFeedback';
import { Wifi, WifiOff, Lock, Unlock, Mic } from 'lucide-react';

interface TopNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeProfile: UserProfile;
  isOnline: boolean;
  onOpenVoice: () => void;
  onToggleProfileLock: () => void;
  focusedElementId?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  activeProfile,
  isOnline,
  onOpenVoice,
  onToggleProfileLock,
  focusedElementId,
}) => {
  const handleNavClick = (tab: NavTab) => {
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS(`Navigated to ${tab}`);
    onTabChange(tab);
  };

  return (
    <header className="w-full flex items-center justify-between gap-8 px-8 py-5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => handleNavClick('home')}
          className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 text-left focus:outline-none"
        >
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            VEGA TV
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
            Fire OS
          </span>
        </button>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium" aria-label="Main Navigation">
        <button
          id="nav-home"
          onClick={() => handleNavClick('home')}
          className={`tv-focusable whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'home'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-100'
          } ${focusedElementId === 'nav-home' ? 'is-focused text-amber-400' : ''}`}
        >
          Home
        </button>

        <button
          id="nav-sports"
          onClick={() => handleNavClick('sports')}
          className={`tv-focusable whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'sports'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-100'
          } ${focusedElementId === 'nav-sports' ? 'is-focused text-amber-400' : ''}`}
        >
          Live Sports AI
        </button>

        <button
          id="nav-movies"
          onClick={() => handleNavClick('movies')}
          className={`tv-focusable whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'movies'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-100'
          } ${focusedElementId === 'nav-movies' ? 'is-focused text-amber-400' : ''}`}
        >
          4K Cinema Hub
        </button>

        <button
          id="nav-fitness"
          onClick={() => handleNavClick('fitness')}
          className={`tv-focusable whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'fitness'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-100'
          } ${focusedElementId === 'nav-fitness' ? 'is-focused text-amber-400' : ''}`}
        >
          AI Fitness Coach
        </button>

        <button
          id="nav-settings"
          onClick={() => handleNavClick('settings')}
          className={`tv-focusable whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'settings'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-100'
          } ${focusedElementId === 'nav-settings' ? 'is-focused text-amber-400' : ''}`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 primary action with accessibility & profile status */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Offline / Online Network Indicator */}
        <div
          title={isOnline ? 'Online · Vega Cloud Synced' : 'Offline Mode Active'}
          className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800"
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Profile Lock Toggle */}
        <button
          onClick={onToggleProfileLock}
          title={activeProfile.isBiometricLocked ? 'Profile Protected' : 'Profile Unlocked'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeProfile.avatarColor }}
          />
          <span className="hidden sm:inline text-[12px] font-medium">{activeProfile.name}</span>
          {activeProfile.isBiometricLocked ? (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>

        {/* Voice Search Button (Alexa push) */}
        <button
          onClick={onOpenVoice}
          id="nav-voice-btn"
          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20 whitespace-nowrap shrink-0"
        >
          <Mic className="w-3.5 h-3.5 text-current" />
          <span>Alexa Voice</span>
        </button>
      </div>
    </header>
  );
};
