import React, { useState } from 'react';
import { MediaItem, NavTab } from '../../types/tv';
import { audioFeedback } from '../../utils/audioFeedback';
import { sampleMediaCatalog } from '../../utils/offlineStorage';
import {
  Play,
  Eye,
  Plus,
  Check,
  Sparkles,
  Tv,
  Activity,
  Flame,
  ArrowRight,
  Download,
} from 'lucide-react';

interface HomeViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectMedia: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  focusedElementId?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onSelectMedia,
  watchlist,
  onToggleWatchlist,
  focusedElementId,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);

  const featured = sampleMediaCatalog[heroIndex];

  const sportsItems = sampleMediaCatalog.filter((m) => m.category === 'sports');
  const movieItems = sampleMediaCatalog.filter((m) => m.category === 'movie' || m.category === 'documentary');
  const fitnessItems = sampleMediaCatalog.filter((m) => m.category === 'fitness');

  const handleHeroAction = (action: 'play' | 'hud') => {
    audioFeedback.playSelectChime();
    if (featured.category === 'sports') {
      onNavigateTab('sports');
    } else if (featured.category === 'fitness') {
      onNavigateTab('fitness');
    } else {
      onNavigateTab('movies');
    }
  };

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

      {/* Horizontal TV Rails (Vega OS Standard Layout) */}
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
    </div>
  );
};
