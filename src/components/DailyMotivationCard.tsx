import React, { useState, useEffect } from 'react';
import { DailyMotivationTip, NavTab, UserProfile } from '../types/tv';
import { audioFeedback } from '../utils/audioFeedback';
import { TVLogger } from '../utils/offlineStorage';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Dumbbell,
  Clock,
  Zap,
  Target,
  Quote,
  Activity,
  Layers,
} from 'lucide-react';

interface DailyMotivationCardProps {
  onNavigateTab: (tab: NavTab) => void;
  focusedElementId?: string;
  activeProfile?: UserProfile;
  highContrast?: boolean;
}

export const DailyMotivationCard: React.FC<DailyMotivationCardProps> = ({
  onNavigateTab,
  focusedElementId,
  activeProfile,
  highContrast,
}) => {
  const [tip, setTip] = useState<DailyMotivationTip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(4);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const cacheKey = `vega_tv_daily_motivation_${todayStr}`;
  const completedKey = `vega_tv_daily_motivation_done_${todayStr}`;
  const streakKey = 'vega_tv_daily_motivation_streak';

  // Load initial tip from cache or API
  useEffect(() => {
    // Check completion status
    const completedVal = localStorage.getItem(completedKey);
    if (completedVal === 'true') {
      setIsCompleted(true);
    }

    // Check streak
    const savedStreak = localStorage.getItem(streakKey);
    if (savedStreak) {
      setStreakCount(parseInt(savedStreak, 10) || 4);
    }

    // Check cached tip for today
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTip(parsed);
        setLoading(false);
        return;
      } catch (e) {
        // Continue to fetch
      }
    }

    fetchDailyTip();
  }, [todayStr]);

  const fetchDailyTip = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/ai/daily-motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          userRole: activeProfile?.role || 'Adult',
          recentWorkoutIntensity: '76% (Aerobic & Threshold)',
          forceRefresh,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: DailyMotivationTip = await response.json();
      setTip(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      TVLogger.log(
        'INFO',
        'REMOTE',
        `Daily Motivation Tip loaded: "${data.title}" (AI: ${data.isAiGenerated})`
      );
    } catch (err: any) {
      console.warn('Daily motivation fetch error, using fallback:', err);
      // Hardcoded high-fidelity fallback if backend unreachable
      const fallback: DailyMotivationTip = {
        title: 'The 60-Second Thoracic Spine Unlock',
        tip: 'Extended couch sitting compresses the ribcage and reduces oxygen intake. Opening your upper thoracic spine immediately elevates alertness, improves lung capacity, and relieves neck strain.',
        category: 'Quick Mobility',
        actionableStep: 'Interlace hands behind your head, inhale deeply, and gently arch backward over your sofa or chair backrest 5 times with slow exhalations.',
        estimatedTime: '2 min',
        intensityLevel: 'Low',
        aiQuote: 'Motion is lotion for the joints; tiny daily movements yield profound physical longevity.',
        date: todayStr,
        isAiGenerated: false,
      };
      setTip(fallback);
      setFetchError('Offline mode active - serving local wellness insight');
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!tip) return;

    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      audioFeedback.playNavClick();
      return;
    }

    audioFeedback.playSelectChime();
    setIsSpeaking(true);

    const speechText = `Today's Daily Motivation: ${tip.title}. Focus: ${tip.category}. ${tip.tip}. Today's action step: ${tip.actionableStep}. Daily Mantra: ${tip.aiQuote}`;

    audioFeedback.announceTTS(speechText);

    // Estimate speech duration to reset indicator
    const wordCount = speechText.split(' ').length;
    const durationMs = Math.max(3000, (wordCount / 2.5) * 1000);
    setTimeout(() => {
      setIsSpeaking(false);
    }, durationMs);
  };

  const handleCompleteHabit = () => {
    audioFeedback.playSelectChime();
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    localStorage.setItem(completedKey, String(nextCompleted));

    if (nextCompleted) {
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      localStorage.setItem(streakKey, String(nextStreak));
      audioFeedback.announceTTS('Action completed! Daily fitness streak updated.');
      TVLogger.log('INFO', 'REMOTE', `User completed daily motivation action: "${tip?.title}"`);
    } else {
      audioFeedback.announceTTS('Daily action reset.');
    }
  };

  const handleRefreshTip = () => {
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS('Consulting Gemini AI for a fresh fitness motivation tip...');
    fetchDailyTip(true);
  };

  const handleLaunchWorkout = () => {
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS('Launching AI Fitness Coach from daily tip');
    onNavigateTab('fitness');
  };

  // Category visual accent
  const getCategoryTheme = (cat: string = '') => {
    const c = cat.toLowerCase();
    if (c.includes('metabolic') || c.includes('cardio') || c.includes('spark')) {
      return {
        badgeBg: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
        glow: 'from-amber-500/10 to-orange-500/5',
        iconColor: 'text-amber-400',
      };
    }
    if (c.includes('recovery') || c.includes('breath') || c.includes('relax')) {
      return {
        badgeBg: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
        glow: 'from-emerald-500/10 to-teal-500/5',
        iconColor: 'text-emerald-400',
      };
    }
    if (c.includes('core') || c.includes('spine') || c.includes('posture')) {
      return {
        badgeBg: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400',
        glow: 'from-cyan-500/10 to-blue-500/5',
        iconColor: 'text-cyan-400',
      };
    }
    return {
      badgeBg: 'bg-purple-400/10 border-purple-400/30 text-purple-400',
      glow: 'from-purple-500/10 to-indigo-500/5',
      iconColor: 'text-purple-400',
    };
  };

  const theme = getCategoryTheme(tip?.category);

  return (
    <section className="px-8 md:px-12">
      <div
        className={`relative overflow-hidden rounded-3xl border ${
          highContrast
            ? 'bg-black border-amber-400'
            : 'bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border-zinc-800/90'
        } p-6 md:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300`}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br ${theme.glow} rounded-full blur-3xl pointer-events-none opacity-60`}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: AI Metadata & Main Tip */}
          <div className="flex-1 space-y-4">
            {/* Top Bar: Badges & AI Status */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>Daily Motivation</span>
              </div>

              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini AI Engine</span>
              </span>

              {tip?.category && (
                <span className={`px-2.5 py-1 rounded-full border font-semibold ${theme.badgeBg}`}>
                  {tip.category}
                </span>
              )}

              {tip?.estimatedTime && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{tip.estimatedTime} Drill</span>
                </span>
              )}

              <span className="ml-auto text-[11px] text-zinc-400 font-mono hidden sm:inline-block">
                {todayStr}
              </span>
            </div>

            {/* Title & Content */}
            {loading ? (
              <div className="py-6 space-y-3 animate-pulse">
                <div className="h-7 w-2/3 bg-zinc-800 rounded-lg" />
                <div className="h-4 w-full bg-zinc-800/60 rounded" />
                <div className="h-4 w-4/5 bg-zinc-800/40 rounded" />
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug flex items-center gap-3">
                    {tip?.title || 'Daily Fitness Inspiration'}
                    {isSpeaking && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" />
                        Speaking
                      </span>
                    )}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-300 mt-2 leading-relaxed max-w-3xl">
                    {tip?.tip}
                  </p>
                </div>

                {/* Immediate Action Step Box */}
                {tip?.actionableStep && (
                  <div
                    className={`mt-4 p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Target className="w-5 h-5 text-amber-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            {isCompleted ? 'Today’s Action Complete' : 'Today’s Actionable Drill'}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            Intensity: {tip.intensityLevel || 'Medium'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-zinc-200 mt-1 leading-normal">
                          {tip.actionableStep}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Quote / Mantra */}
                {tip?.aiQuote && (
                  <div className="flex items-center gap-2 text-xs italic text-zinc-400 pt-1">
                    <Quote className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                    <span>&ldquo;{tip.aiQuote}&rdquo;</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Living Room Action Controls & Streak */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch justify-center gap-3 lg:w-72 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-800/80 lg:pl-6">
            {/* Daily Streak Indicator */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-400/40" />
                </div>
                <div>
                  <span className="font-bold text-white block">Consistency Streak</span>
                  <span className="text-[10px] text-zinc-400">Daily habit tracking</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-amber-400">{streakCount}</span>
                <span className="text-[10px] text-zinc-500 ml-1">Days</span>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button
              id="daily-motivation-listen-btn"
              onClick={handleReadAloud}
              className={`tv-focusable flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                isSpeaking
                  ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/25 ring-2 ring-amber-300'
                  : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white border border-zinc-700'
              } ${focusedElementId === 'daily-motivation-listen-btn' ? 'is-focused ring-4 ring-amber-400' : ''}`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-950" />
                  <span>Stop Voice Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Listen to Daily Tip (TTS)</span>
                </>
              )}
            </button>

            {/* Mark as Done Button */}
            <button
              id="daily-motivation-complete-btn"
              onClick={handleCompleteHabit}
              className={`tv-focusable flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white'
              } ${focusedElementId === 'daily-motivation-complete-btn' ? 'is-focused ring-4 ring-emerald-400' : ''}`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-zinc-500'}`} />
              <span>{isCompleted ? 'Completed Today (+1 Streak)' : 'Mark Drill Complete'}</span>
            </button>

            {/* Launch Workout in Fitness Tab */}
            <button
              id="daily-motivation-start-btn"
              onClick={handleLaunchWorkout}
              className={`tv-focusable flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all ${
                focusedElementId === 'daily-motivation-start-btn' ? 'is-focused ring-4 ring-amber-300' : ''
              }`}
            >
              <Dumbbell className="w-4 h-4 fill-zinc-950" />
              <span>Open Fitness Coach</span>
            </button>

            {/* Refresh Tip via Gemini Button */}
            <button
              id="daily-motivation-refresh-btn"
              onClick={handleRefreshTip}
              disabled={loading}
              className={`tv-focusable flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-all ${
                focusedElementId === 'daily-motivation-refresh-btn' ? 'is-focused ring-2 ring-zinc-400' : ''
              }`}
              title="Request a fresh motivation tip from Gemini AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{loading ? 'Consulting Gemini...' : 'New Tip from AI'}</span>
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{fetchError}</span>
            <span className="text-zinc-600">Local fallback active</span>
          </div>
        )}
      </div>
    </section>
  );
};
