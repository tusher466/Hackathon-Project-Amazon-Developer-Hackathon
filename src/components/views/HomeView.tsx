import React, { useState, useMemo, useRef } from 'react';
import { MediaItem, NavTab, UserProfile, WorkoutIntensityDay, AlgorithmPreset } from '../../types/tv';
import { audioFeedback } from '../../utils/audioFeedback';
import { sampleMediaCatalog, tvStorage, TVLogger } from '../../utils/offlineStorage';
import {
  Play,
  Eye,
  Plus,
  Check,
  Sparkles,
  Activity,
  Flame,
  ArrowRight,
  TrendingUp,
  Sliders,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  Film,
} from 'lucide-react';
import { DailyMotivationCard } from '../DailyMotivationCard';

interface HomeViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectMedia: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  focusedElementId?: string;
  activeProfile?: UserProfile;
  highContrast?: boolean;
}

export function calculateRecommendations(
  catalog: MediaItem[],
  watchedIds: string[],
  watchlistIds: string[],
  fitnessHistory: WorkoutIntensityDay[],
  profileRole: string,
  preset: AlgorithmPreset
): MediaItem[] {
  // 1. Determine weights based on preset
  let wWatch = 0.45;
  let wFit = 0.35;
  let wProf = 0.20;

  if (preset === 'fitness_synergy') {
    wWatch = 0.25;
    wFit = 0.60;
    wProf = 0.15;
  } else if (preset === 'watch_history') {
    wWatch = 0.65;
    wFit = 0.20;
    wProf = 0.15;
  }

  // 2. Extract fitness metrics
  const totalDays = fitnessHistory.length || 7;
  const avgIntensity = Math.round(
    fitnessHistory.reduce((acc, d) => acc + d.avgIntensity, 0) / totalDays
  );
  const latestDay = fitnessHistory[fitnessHistory.length - 1] || {
    avgIntensity: 76,
    peakIntensity: 90,
    zone: 'Threshold' as const,
    calories: 165,
  };
  const highIntensityDays = fitnessHistory.filter((d) => d.avgIntensity >= 70).length;

  // 3. Extract watch history metrics
  const watchedItems = catalog.filter((m) => watchedIds.includes(m.id));
  const watchlistItems = catalog.filter((m) => watchlistIds.includes(m.id));
  const combinedHistory = [...watchedItems, ...watchlistItems];

  const watchedCategories = new Set(combinedHistory.map((m) => m.category));
  const watchedTags = new Set(combinedHistory.flatMap((m) => m.tags));

  // 4. Score each item
  const scoredItems = catalog.map((item) => {
    // Fitness Score (0-100)
    let sFit = 60;
    let fitReason = '';

    if (item.category === 'fitness') {
      if (item.tags.some((t) => ['HIIT', 'Anaerobic', 'Athletic'].includes(t))) {
        sFit = Math.min(100, Math.round(68 + avgIntensity * 0.33));
        fitReason = `High cardio match: Aligns with your 7-day ${avgIntensity}% workout intensity & ${latestDay.zone} session`;
      } else {
        // Mobility / Recovery
        if (highIntensityDays >= 3) {
          sFit = 96;
          fitReason = `Active recovery: Recommended to relieve muscle strain after ${highIntensityDays} intense training days`;
        } else {
          sFit = 82;
          fitReason = `Mobility & flexibility focus aligned with your weekly movement routine`;
        }
      }
    } else if (item.category === 'sports') {
      sFit = Math.min(100, Math.round(62 + avgIntensity * 0.35));
      fitReason = `Athletic tempo match: Tuned to your ${avgIntensity}% training intensity & high endurance pace`;
    } else {
      // Movies / Documentaries
      if (latestDay.peakIntensity >= 80) {
        sFit = Math.min(100, Math.round(74 + (latestDay.peakIntensity - 80) * 1.5));
        fitReason = `Post-workout relaxation: Restorative viewing after today's ${latestDay.peakIntensity}% peak`;
      } else {
        sFit = 72;
        fitReason = `Evening downtime leisure matching your rest schedule`;
      }
    }

    // Watch History Score (0-100)
    let sWatch = 50;
    let watchReason = '';
    const isCategoryWatched = watchedCategories.has(item.category);
    const matchingTagsCount = item.tags.filter((t) => watchedTags.has(t)).length;
    const isWatchlisted = watchlistIds.includes(item.id);
    const isWatched = watchedIds.includes(item.id);

    if (isCategoryWatched) sWatch += 25;
    sWatch += Math.min(25, matchingTagsCount * 8);
    if (isWatchlisted) sWatch += 12;
    if (isWatched) sWatch += 8;
    sWatch = Math.min(100, sWatch);

    if (item.category === 'sports' && watchedCategories.has('sports')) {
      watchReason = `Based on your interest in UCL Final & live sports tracking`;
    } else if (item.category === 'fitness' && watchedCategories.has('fitness')) {
      watchReason = `Matches your routine with Living Room HIIT & Pose Tracking`;
    } else if (item.tags.some((t) => watchedTags.has(t))) {
      const matchTag = item.tags.find((t) => watchedTags.has(t)) || '4K';
      watchReason = `Aligned with your preferred "${matchTag}" catalog tags`;
    } else {
      watchReason = `Curated selection in living room catalog`;
    }

    // Profile Score (0-100)
    let sProf = 70;
    if (profileRole === 'Sports Enthusiast') {
      if (item.category === 'sports') sProf = 98;
      else if (item.category === 'fitness') sProf = 88;
      else sProf = 75;
    } else if (profileRole === 'Family/Kids') {
      if (item.category === 'documentary') sProf = 96;
      else if (item.rating.includes('G') || item.rating.includes('PG')) sProf = 90;
      else sProf = 65;
    } else {
      // Adult / Default
      if (item.resolution.includes('4K')) sProf += 15;
      sProf = Math.min(100, sProf);
    }

    // Composite Weighted Score
    const composite = Math.round(wWatch * sWatch + wFit * sFit + wProf * sProf);
    // Normalize to premium living room match range: 85% - 99%
    const normalizedMatch = Math.min(99, Math.max(85, Math.round(composite * 0.95 + 4)));

    // Combined Personalized Reason
    let combinedReason = '';
    if (preset === 'fitness_synergy') {
      combinedReason = fitReason;
    } else if (preset === 'watch_history') {
      combinedReason = `${watchReason} · ${fitReason.split(':')[0]}`;
    } else {
      combinedReason = `${fitReason} · ${watchReason}`;
    }

    return {
      ...item,
      affinityScore: normalizedMatch,
      recommendationReason: combinedReason,
      algorithmFactors: {
        watchHistoryWeight: sWatch,
        fitnessWeight: sFit,
        profileWeight: sProf,
        totalScore: normalizedMatch,
      },
    };
  });

  // Sort by affinityScore descending
  return scoredItems.sort((a, b) => (b.affinityScore || 0) - (a.affinityScore || 0));
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onSelectMedia,
  watchlist,
  onToggleWatchlist,
  focusedElementId,
  activeProfile,
  highContrast = false,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [algorithmPreset, setAlgorithmPreset] = useState<AlgorithmPreset>('balanced');
  const [inspectingItem, setInspectingItem] = useState<MediaItem | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Load user data
  const watchedHistory = useMemo(() => tvStorage.getWatchedHistory(), []);
  const fitnessHistory = useMemo(() => tvStorage.getIntensityHistory(), []);
  const profileRole = activeProfile?.role || 'Adult';

  // Compute recommendations dynamically
  const recommendations = useMemo(() => {
    return calculateRecommendations(
      sampleMediaCatalog,
      watchedHistory,
      watchlist,
      fitnessHistory,
      profileRole,
      algorithmPreset
    );
  }, [watchedHistory, watchlist, fitnessHistory, profileRole, algorithmPreset]);

  const featured = sampleMediaCatalog[heroIndex];

  const sportsItems = sampleMediaCatalog.filter((m) => m.category === 'sports');
  const movieItems = sampleMediaCatalog.filter((m) => m.category === 'movie' || m.category === 'documentary');
  const fitnessItems = sampleMediaCatalog.filter((m) => m.category === 'fitness');

  const handleHeroAction = (action: 'play' | 'hud') => {
    audioFeedback.playSelectChime();
    tvStorage.recordWatched(featured.id);
    if (featured.category === 'sports') {
      onNavigateTab('sports');
    } else if (featured.category === 'fitness') {
      onNavigateTab('fitness');
    } else {
      onNavigateTab('movies');
    }
  };

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      audioFeedback.playNavClick();
    }
  };

  const handleSelectRecommendedItem = (item: MediaItem) => {
    tvStorage.recordWatched(item.id);
    onSelectMedia(item);
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS(
      `Selected ${item.title}, ${item.affinityScore}% Match. ${item.recommendationReason}`
    );
    TVLogger.log(
      'INFO',
      'REMOTE',
      `Launched recommended media: ${item.title} (${item.affinityScore}% affinity, preset: ${algorithmPreset})`
    );

    if (item.category === 'sports') {
      onNavigateTab('sports');
    } else if (item.category === 'fitness') {
      onNavigateTab('fitness');
    } else {
      onNavigateTab('movies');
    }
  };

  // Average weekly intensity for the subtitle display
  const avgWeeklyIntensity = useMemo(() => {
    if (!fitnessHistory.length) return 76;
    return Math.round(
      fitnessHistory.reduce((acc, d) => acc + d.avgIntensity, 0) / fitnessHistory.length
    );
  }, [fitnessHistory]);

  return (
    <div className="w-full flex flex-col gap-10 pb-16">
      {/* Cinematic Hero Spotlight (10-Foot Living Room Anchor) */}
      <section className="relative w-full min-h-[440px] md:min-h-[500px] flex items-end px-8 md:px-12 py-10 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent overflow-hidden">
        {/* Dynamic Atmospheric Backdrop Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${featured.backdropTheme} opacity-80 transition-all duration-700`}
        />

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-zinc-950/60 to-zinc-950" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-3xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
              FEATURED EVENT
            </span>
            <span className="text-zinc-300 font-mono">{featured.resolution}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-300">{featured.rating}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-300">{featured.duration}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {featured.title}
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl">
            {featured.synopsis}
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              id="hero-play-btn"
              onClick={() => handleHeroAction('play')}
              className={`tv-focusable flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all ${
                focusedElementId === 'hero-play-btn' ? 'is-focused ring-4 ring-amber-300' : ''
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{featured.category === 'sports' ? 'Watch Match Live' : 'Start Playback'}</span>
            </button>

            {featured.category === 'sports' && (
              <button
                id="hero-hud-btn"
                onClick={() => {
                  audioFeedback.playSelectChime();
                  tvStorage.recordWatched(featured.id);
                  onNavigateTab('sports');
                }}
                className={`tv-focusable flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-zinc-900/90 text-white border border-zinc-700 hover:border-amber-400 transition-all ${
                  focusedElementId === 'hero-hud-btn' ? 'is-focused' : ''
                }`}
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Tactical CV HUD</span>
              </button>
            )}

            <button
              id="hero-watchlist-btn"
              onClick={() => {
                onToggleWatchlist(featured.id);
                audioFeedback.playSelectChime();
              }}
              className={`tv-focusable flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:text-white transition-all ${
                focusedElementId === 'hero-watchlist-btn' ? 'is-focused' : ''
              }`}
            >
              {watchlist.includes(featured.id) ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Spotlight Switcher Indicators */}
        <div className="absolute bottom-6 right-8 z-10 flex items-center gap-2">
          {sampleMediaCatalog.slice(0, 4).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHeroIndex(idx);
                audioFeedback.playNavClick();
              }}
              aria-label={`Show slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                heroIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* NEW: Gemini AI Daily Motivation Card */}
      <DailyMotivationCard
        onNavigateTab={onNavigateTab}
        focusedElementId={focusedElementId}
        activeProfile={activeProfile}
        highContrast={highContrast}
      />

      {/* NEW: Personalized "Recommended for You" Horizontal Carousel */}
      <section className="px-8 md:px-12 space-y-4">
        {/* Carousel Header with Algorithm Tuning Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <Sparkles className="w-5 h-5 fill-amber-400/20" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                Recommended for You
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Affinity Engine
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Personalized living room feed weighted by your past watched media &amp; 7-day fitness intensity (avg {avgWeeklyIntensity}%).
            </p>
          </div>

          {/* Algorithm Tuning Presets & Scroll Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 text-xs">
              <button
                id="rec-preset-balanced"
                onClick={() => {
                  setAlgorithmPreset('balanced');
                  audioFeedback.playNavClick();
                  audioFeedback.announceTTS('Switched to Balanced recommendation weighting');
                }}
                className={`tv-focusable px-3 py-1.5 rounded-lg font-medium transition-all ${
                  algorithmPreset === 'balanced'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-zinc-400 hover:text-white'
                } ${focusedElementId === 'rec-preset-balanced' ? 'ring-2 ring-amber-300' : ''}`}
                title="45% Watch History + 35% 7-Day Fitness + 20% Profile"
              >
                Balanced (45/35/20)
              </button>

              <button
                id="rec-preset-fitness"
                onClick={() => {
                  setAlgorithmPreset('fitness_synergy');
                  audioFeedback.playNavClick();
                  audioFeedback.announceTTS('Switched to Fitness Synergy priority weighting');
                }}
                className={`tv-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  algorithmPreset === 'fitness_synergy'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                } ${focusedElementId === 'rec-preset-fitness' ? 'ring-2 ring-emerald-300' : ''}`}
                title="60% Workout Intensity & Recovery Needs"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Fitness Synergy (60%)</span>
              </button>

              <button
                id="rec-preset-watch"
                onClick={() => {
                  setAlgorithmPreset('watch_history');
                  audioFeedback.playNavClick();
                  audioFeedback.announceTTS('Switched to Watch History priority weighting');
                }}
                className={`tv-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  algorithmPreset === 'watch_history'
                    ? 'bg-purple-500 text-zinc-950 font-bold shadow-md shadow-purple-500/20'
                    : 'text-zinc-400 hover:text-white'
                } ${focusedElementId === 'rec-preset-watch' ? 'ring-2 ring-purple-300' : ''}`}
                title="65% Past Viewing & Watchlist Alignment"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Watch History (65%)</span>
              </button>
            </div>

            {/* Carousel D-Pad/Click Scroll Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleScrollCarousel('left')}
                aria-label="Scroll recommendations left"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                aria-label="Scroll recommendations right"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Algorithm Weights Formula Legend */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-zinc-300 font-semibold uppercase tracking-wider">
              Active Weighting:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Watch History: {algorithmPreset === 'watch_history' ? '65%' : algorithmPreset === 'fitness_synergy' ? '25%' : '45%'}</span>
            </span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>7-Day Fitness: {algorithmPreset === 'fitness_synergy' ? '60%' : algorithmPreset === 'watch_history' ? '20%' : '35%'}</span>
            </span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Profile ({profileRole}): {algorithmPreset === 'balanced' ? '20%' : '15%'}</span>
            </span>
          </div>

          <div className="text-zinc-500 font-mono hidden md:block">
            Calculated over {watchedHistory.length} watched titles &amp; 7 workout sessions
          </div>
        </div>

        {/* Horizontal TV Carousel Cards */}
        <div
          ref={carouselRef}
          tabIndex={0}
          role="region"
          aria-label="Recommended Media Carousel"
          className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x focus:outline-none focus:ring-1 focus:ring-amber-400/30 rounded-2xl"
        >
          {recommendations.map((item) => {
            const isItemFocused = focusedElementId === `rec-card-${item.id}`;
            const isMatchHigh = (item.affinityScore || 0) >= 95;

            return (
              <div
                key={item.id}
                id={`rec-card-${item.id}`}
                onClick={() => handleSelectRecommendedItem(item)}
                className={`tv-focusable snap-start shrink-0 w-[300px] sm:w-[340px] md:w-[370px] bg-zinc-900 border rounded-2xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300 group flex flex-col justify-between ${
                  isItemFocused
                    ? 'is-focused ring-4 ring-amber-400 border-amber-400 scale-[1.02]'
                    : 'border-zinc-800 hover:border-amber-400/80 hover:shadow-2xl hover:shadow-amber-500/10'
                }`}
              >
                {/* Backdrop Visual Container */}
                <div className={`h-44 bg-gradient-to-tr ${item.backdropTheme} p-4 flex flex-col justify-between relative overflow-hidden`}>
                  {/* Subtle Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-950" />

                  {/* Top Badges Row */}
                  <div className="relative z-10 flex items-center justify-between">
                    {/* Glowing Affinity Match Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono shadow-lg backdrop-blur-md border ${
                        isMatchHigh
                          ? 'bg-emerald-500/90 text-zinc-950 border-emerald-300'
                          : 'bg-amber-400/90 text-zinc-950 border-amber-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{item.affinityScore}% MATCH</span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-zinc-200 bg-black/70 px-2.5 py-1 rounded border border-zinc-700/80 backdrop-blur-sm">
                      {item.resolution}
                    </span>
                  </div>

                  {/* Category Pill and Duration */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-700/60">
                      {item.category === 'sports'
                        ? 'Live Sports'
                        : item.category === 'fitness'
                        ? 'CV Fitness'
                        : item.category === 'documentary'
                        ? 'Nature Doc'
                        : 'Cinema'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>
                </div>

                {/* Card Content & Rationale */}
                <div className="p-4 bg-zinc-950 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{item.subtitle}</p>

                    {/* Recommendation Reason Callout */}
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-zinc-300 leading-tight line-clamp-2">
                        {item.recommendationReason}
                      </p>
                    </div>

                    {/* Weighted Factor Meters */}
                    {item.algorithmFactors && (
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                        <div className="bg-zinc-900/80 rounded-lg p-1.5 border border-zinc-800 text-center">
                          <span className="text-zinc-500 block text-[9px] uppercase">Watch</span>
                          <span className="font-bold text-purple-400">{item.algorithmFactors.watchHistoryWeight}%</span>
                        </div>
                        <div className="bg-zinc-900/80 rounded-lg p-1.5 border border-zinc-800 text-center">
                          <span className="text-zinc-500 block text-[9px] uppercase">Fitness</span>
                          <span className="font-bold text-emerald-400">{item.algorithmFactors.fitnessWeight}%</span>
                        </div>
                        <div className="bg-zinc-900/80 rounded-lg p-1.5 border border-zinc-800 text-center">
                          <span className="text-zinc-500 block text-[9px] uppercase">Profile</span>
                          <span className="font-bold text-amber-400">{item.algorithmFactors.profileWeight}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRecommendedItem(item);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.category === 'sports' ? 'Watch Match' : item.category === 'fitness' ? 'Start Workout' : 'Play Now'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item.id);
                        audioFeedback.playSelectChime();
                      }}
                      aria-label="Toggle watchlist"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all"
                      title={watchlist.includes(item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {watchlist.includes(item.id) ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingItem(item);
                        audioFeedback.playSelectChime();
                        audioFeedback.announceTTS(`Viewing recommendation factor analysis for ${item.title}`);
                      }}
                      aria-label="Inspect recommendation factors"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-all"
                      title="Why was this recommended?"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Existing Standard TV Rails (Vega OS Standard Layout) */}
      <div className="space-y-10 px-8 md:px-12">
        {/* Rail 1: Live Sports & Tactical Computer Vision */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                Live Sports &amp; Tactical CV
              </h2>
            </div>
            <button
              onClick={() => {
                onNavigateTab('sports');
                audioFeedback.playNavClick();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View Match Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sportsItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  tvStorage.recordWatched(item.id);
                  onSelectMedia(item);
                  onNavigateTab('sports');
                  audioFeedback.playSelectChime();
                  audioFeedback.announceTTS(`Selected ${item.title}`);
                }}
                className="tv-focusable group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:border-amber-400/80 transition-all"
              >
                <div className={`h-40 bg-gradient-to-tr ${item.backdropTheme} p-4 flex flex-col justify-between relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-black/60 px-2 py-0.5 rounded border border-red-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded">
                      {item.resolution}
                    </span>
                  </div>

                  {item.matchScore && (
                    <div className="text-xl font-black font-mono text-white bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm self-start border border-zinc-700">
                      {item.matchScore}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-zinc-950">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{item.subtitle}</p>

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-500">
                    <span>AI Player Bounding</span>
                    <span aria-hidden="true">·</span>
                    <span>Heatmaps</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rail 2: 4K Cinema Hub & Originals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                4K Cinema Hub &amp; Originals
              </h2>
            </div>
            <button
              onClick={() => {
                onNavigateTab('movies');
                audioFeedback.playNavClick();
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Explore Cinema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {movieItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  tvStorage.recordWatched(item.id);
                  onSelectMedia(item);
                  onNavigateTab('movies');
                  audioFeedback.playSelectChime();
                  audioFeedback.announceTTS(`Selected ${item.title}`);
                }}
                className="tv-focusable group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:border-purple-400/80 transition-all"
              >
                <div className={`h-40 bg-gradient-to-tr ${item.backdropTheme} p-4 flex flex-col justify-between relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/40">
                      4K ULTRA HD
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950">
                  <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.synopsis}</p>

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-500">
                    <span>IMAX Enhanced</span>
                    <span aria-hidden="true">·</span>
                    <span>Dolby Atmos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rail 3: Living Room AI Fitness */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                Interactive Living Room Fitness
              </h2>
            </div>
            <button
              onClick={() => {
                onNavigateTab('fitness');
                audioFeedback.playNavClick();
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Start Workout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fitnessItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  tvStorage.recordWatched(item.id);
                  onSelectMedia(item);
                  onNavigateTab('fitness');
                  audioFeedback.playSelectChime();
                  audioFeedback.announceTTS(`Selected ${item.title}`);
                }}
                className="tv-focusable group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:border-emerald-400/80 transition-all p-5 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Computer Vision Pose Tracker
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{item.subtitle}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* "Why was this recommended?" Modal Inspector */}
      {inspectingItem && inspectingItem.algorithmFactors && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  Recommendation Factor Breakdown
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                aria-label="Close factor details"
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Affinity Score */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Calculated Match Affinity</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {inspectingItem.affinityScore}% Match
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Active Preset</span>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {algorithmPreset}
                </span>
              </div>
            </div>

            {/* Pillar Breakdown */}
            <div className="space-y-4">
              {/* Factor 1: Watch History */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>Watch History &amp; Watchlist Affinity</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {inspectingItem.algorithmFactors.watchHistoryWeight}%
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${inspectingItem.algorithmFactors.watchHistoryWeight}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Weighted by past viewing of Champions League Final, Cosmic Horizon, and saved genres.
                </p>
              </div>

              {/* Factor 2: Fitness History */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>7-Day Fitness Intensity Trend</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {inspectingItem.algorithmFactors.fitnessWeight}%
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${inspectingItem.algorithmFactors.fitnessWeight}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Calibrated to your {avgWeeklyIntensity}% weekly average workout intensity and today&apos;s Threshold session.
                </p>
              </div>

              {/* Factor 3: Profile Fit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Profile Alignment ({profileRole})</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {inspectingItem.algorithmFactors.profileWeight}%
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${inspectingItem.algorithmFactors.profileWeight}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Accounts for {profileRole} profile privileges and 4K HDR display hardware capability.
                </p>
              </div>
            </div>

            {/* Rationale Quote */}
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200">
              <span className="font-bold block mb-0.5">Algorithm Synthesis:</span>
              &ldquo;{inspectingItem.recommendationReason}&rdquo;
            </div>

            <button
              onClick={() => {
                setInspectingItem(null);
                handleSelectRecommendedItem(inspectingItem);
              }}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm transition-all"
            >
              Start Watching Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
