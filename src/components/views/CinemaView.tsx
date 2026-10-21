import React, { useState } from 'react';
import { audioFeedback } from '../../utils/audioFeedback';
import {
  Film,
  Subtitles,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Maximize2,
  Clock,
  Bookmark,
} from 'lucide-react';

interface CinemaViewProps {
  focusedElementId?: string;
  onSetFocus?: (id: string) => void;
  highContrast?: boolean;
}

export const CinemaView: React.FC<CinemaViewProps> = ({ focusedElementId, highContrast }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioDescription, setAudioDescription] = useState(false);
  const [subtitles, setSubtitles] = useState(true);

  const keyMoments = [
    { title: 'Airlock Depressurization', time: '00:14:20' },
    { title: 'The Saturn Slingshot', time: '00:38:50' },
    { title: 'Gravitational Anomaly Encounter', time: '01:04:15', active: true },
    { title: 'Quantum Singularity Dive', time: '01:45:00' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Title & Playback Mode Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider">Fire TV 4K Cinema Hub</span>
            <span aria-hidden="true">·</span>
            <span>Dolby Vision · Dolby Atmos 7.1.4</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400">IMAX 65mm Master</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Cosmic Horizon: Odyssey</span>
            <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded font-mono">
              PG-13
            </span>
          </h1>
        </div>

        {/* Audio Accessibility Toggles */}
        <div className="flex items-center gap-3">
          <button
            id="cinema-sub-toggle"
            onClick={() => {
              setSubtitles(!subtitles);
              audioFeedback.playSelectChime();
              audioFeedback.announceTTS(`Subtitles ${!subtitles ? 'enabled' : 'disabled'}`);
            }}
            className={`tv-focusable flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              subtitles
                ? 'bg-zinc-800 text-amber-400 border-amber-400/80'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Subtitles className="w-4 h-4" />
            <span>Subtitles: {subtitles ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="cinema-ad-toggle"
            onClick={() => {
              setAudioDescription(!audioDescription);
              audioFeedback.playSelectChime();
              audioFeedback.announceTTS(`Audio description ${!audioDescription ? 'enabled' : 'disabled'}`);
            }}
            className={`tv-focusable flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              audioDescription
                ? 'bg-zinc-800 text-amber-400 border-amber-400/80'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Audio Description: {audioDescription ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main 4K Cinematic Viewport */}
      <div className="relative w-full aspect-video bg-black rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Deep Space Starfield Visual Canvas */}
        <div className="relative flex-1 w-full bg-gradient-to-tr from-black via-zinc-950 to-purple-950 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-80 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[90px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/30 rounded-full animate-ping opacity-20" />
          </div>

          {/* Center Cinema Visual Details */}
          <div className="relative z-10 text-center max-w-lg p-6 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 border-2 border-purple-400/40 flex items-center justify-center mb-3 backdrop-blur shadow-2xl">
              <Film className="w-7 h-7 text-purple-300" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Scene 42: The Event Horizon Perimeter
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dr. Rostova monitors gravimetric telemetry as Commander Vance coordinates the orbital deceleration burn across the Perseus nebula boundary.
            </p>
          </div>

          {/* Closed Captions & Accessibility Subtitles */}
          {subtitles && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-black/85 text-amber-300 font-mono text-sm px-4 py-1.5 rounded-lg border border-zinc-800 text-center shadow-lg pointer-events-none">
              Commander Vance: &quot;Hold steady. We are crossing the gravimetric boundary now.&quot;
            </div>
          )}
        </div>

        {/* Player Transport Bar & Timeline */}
        <div className="w-full bg-gradient-to-t from-black via-black/95 to-transparent p-5 flex flex-col gap-3 z-20 border-t border-zinc-800/60">
          <div className="w-full flex items-center gap-4">
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                audioFeedback.playSelectChime();
              }}
              className="p-2.5 rounded-full bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-all shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <span className="text-xs font-mono text-zinc-300">01:04:15</span>

            {/* Progress Scrubber Bar */}
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-[54%]" />
              <div className="absolute top-0 bottom-0 left-[26%] w-1 bg-cyan-400" title="Saturn Slingshot" />
              <div className="absolute top-0 bottom-0 left-[54%] w-1.5 bg-white ring-2 ring-amber-400" title="Current Scene" />
              <div className="absolute top-0 bottom-0 left-[82%] w-1 bg-cyan-400" title="Quantum Singularity" />
            </div>

            <span className="text-xs font-mono text-zinc-400">02:24:00</span>
          </div>

          {/* Key Scene Bookmarks */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <Bookmark className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[11px] text-zinc-500 font-mono shrink-0">Key Moments:</span>
            {keyMoments.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  audioFeedback.playNavClick();
                  audioFeedback.announceTTS(`Jumped to ${m.title}`);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  m.active
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {m.title} ({m.time})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
