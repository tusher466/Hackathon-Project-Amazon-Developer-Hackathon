import React, { useState } from 'react';
import {
  Mic,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Undo2,
  Home,
  Menu,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Power,
  Tv,
  ChevronDown as CollapseIcon,
  ChevronUp as ExpandIcon,
  Keyboard,
} from 'lucide-react';
import { audioFeedback } from '../utils/audioFeedback';

interface VirtualRemoteProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onMenu: () => void;
  onVoice: () => void;
  onPlayPause: () => void;
  onVolumeChange: (delta: number) => void;
  isPlaying?: boolean;
}

export const VirtualRemote: React.FC<VirtualRemoteProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onSelect,
  onBack,
  onHome,
  onMenu,
  onVoice,
  onPlayPause,
  onVolumeChange,
  isPlaying = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const trigger = (btnKey: string, action: () => void, sound: 'nav' | 'select' | 'back' | 'alexa' = 'nav') => {
    setActiveBtn(btnKey);
    setTimeout(() => setActiveBtn(null), 160);
    audioFeedback.triggerHaptic(25);

    if (sound === 'nav') audioFeedback.playNavClick();
    else if (sound === 'select') audioFeedback.playSelectChime();
    else if (sound === 'back') audioFeedback.playBackTone();
    else if (sound === 'alexa') audioFeedback.playAlexaEarcon();

    action();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Keyboard Shortcut Helper Flyout */}
      {showKeyGuide && (
        <div className="mb-3 bg-zinc-900/95 border border-zinc-700 p-4 rounded-xl shadow-2xl text-xs text-zinc-300 w-64 backdrop-blur-md">
          <div className="font-semibold text-white mb-2 flex items-center justify-between">
            <span>D-Pad Remote Shortcuts</span>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="text-zinc-500 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between"><span>Navigate</span><span className="text-amber-400 font-bold">Arrow Keys</span></div>
            <div className="flex justify-between"><span>Select / OK</span><span className="text-amber-400 font-bold">Enter / Space</span></div>
            <div className="flex justify-between"><span>Back</span><span className="text-amber-400 font-bold">Escape / Backspace</span></div>
            <div className="flex justify-between"><span>Home</span><span className="text-amber-400 font-bold">Key H</span></div>
            <div className="flex justify-between"><span>Menu</span><span className="text-amber-400 font-bold">Key M</span></div>
            <div className="flex justify-between"><span>Alexa Voice</span><span className="text-cyan-400 font-bold">Key V</span></div>
            <div className="flex justify-between"><span>Play/Pause</span><span className="text-amber-400 font-bold">Key P</span></div>
            <div className="flex justify-between"><span>Tactical HUD</span><span className="text-amber-400 font-bold">Key T</span></div>
            <div className="flex justify-between"><span>Fitness 30m Alert</span><span className="text-amber-400 font-bold">Key A</span></div>
          </div>
        </div>
      )}

      {/* Floating Toggle Bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setShowKeyGuide(!showKeyGuide)}
          title="Keyboard shortcuts"
          className="bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur shadow-lg transition-all"
        >
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span>Remote Keys</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border transition-all ${
            isOpen
              ? 'bg-amber-500 text-zinc-950 border-amber-400'
              : 'bg-zinc-900/95 text-zinc-200 border-zinc-700 hover:border-amber-500/50 hover:text-white'
          } backdrop-blur`}
        >
          <Tv className="w-4 h-4 text-current" />
          <span>Fire TV Remote</span>
          {isOpen ? <CollapseIcon className="w-3.5 h-3.5" /> : <ExpandIcon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Virtual Remote Control Body */}
      {isOpen && (
        <div className="w-60 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-zinc-700/80 rounded-[36px] p-5 shadow-2xl shadow-black/80 flex flex-col items-center select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Bar: Power + Status LED */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#38bdf8]" />
              <span className="text-[10px] font-bold tracking-wider text-zinc-400">VEGA OS</span>
            </div>
            <button
              onClick={() => trigger('power', onHome, 'select')}
              aria-label="Power Button"
              className={`p-1.5 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all ${
                activeBtn === 'power' ? 'scale-90 text-red-500' : ''
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
          </div>

          {/* Alexa Voice Microphone Button */}
          <div className="mb-4">
            <button
              onClick={() => trigger('alexa', onVoice, 'alexa')}
              aria-label="Alexa Voice Button"
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 hover:brightness-110 active:scale-95 transition-all ${
                activeBtn === 'alexa' ? 'scale-90 ring-4 ring-cyan-300' : ''
              }`}
            >
              <Mic className="w-6 h-6 animate-pulse" />
            </button>
            <p className="text-[9px] text-center text-cyan-400 mt-1 font-medium">Alexa Voice</p>
          </div>

          {/* Circular D-Pad Controller */}
          <div className="relative w-44 h-44 rounded-full bg-zinc-900 border-2 border-zinc-700/70 p-1 shadow-inner flex items-center justify-center mb-4">
            {/* Up */}
            <button
              onClick={() => trigger('up', onUp, 'nav')}
              aria-label="D-Pad Up"
              className={`absolute top-2 w-12 h-10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-t-full transition-all ${
                activeBtn === 'up' ? 'scale-90 text-amber-400 bg-zinc-800' : ''
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Down */}
            <button
              onClick={() => trigger('down', onDown, 'nav')}
              aria-label="D-Pad Down"
              className={`absolute bottom-2 w-12 h-10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-b-full transition-all ${
                activeBtn === 'down' ? 'scale-90 text-amber-400 bg-zinc-800' : ''
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            {/* Left */}
            <button
              onClick={() => trigger('left', onLeft, 'nav')}
              aria-label="D-Pad Left"
              className={`absolute left-2 w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-l-full transition-all ${
                activeBtn === 'left' ? 'scale-90 text-amber-400 bg-zinc-800' : ''
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right */}
            <button
              onClick={() => trigger('right', onRight, 'nav')}
              aria-label="D-Pad Right"
              className={`absolute right-2 w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-r-full transition-all ${
                activeBtn === 'right' ? 'scale-90 text-amber-400 bg-zinc-800' : ''
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Center Select Button */}
            <button
              onClick={() => trigger('select', onSelect, 'select')}
              aria-label="D-Pad Select"
              className={`w-18 h-18 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center text-amber-400 hover:bg-zinc-700 active:scale-90 shadow-md transition-all ${
                activeBtn === 'select' ? 'scale-90 bg-amber-500 text-zinc-950 ring-2 ring-amber-300' : ''
              }`}
            >
              <span className="text-xs font-extrabold tracking-wider">OK</span>
            </button>
          </div>

          {/* Navigation Triad: Back, Home, Menu */}
          <div className="w-full grid grid-cols-3 gap-2 mb-3 px-2">
            <button
              onClick={() => trigger('back', onBack, 'back')}
              aria-label="Back"
              className={`flex flex-col items-center justify-center py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all ${
                activeBtn === 'back' ? 'scale-90 bg-zinc-700' : ''
              }`}
            >
              <Undo2 className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Back</span>
            </button>

            <button
              onClick={() => trigger('home', onHome, 'select')}
              aria-label="Home"
              className={`flex flex-col items-center justify-center py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all ${
                activeBtn === 'home' ? 'scale-90 bg-amber-500 text-zinc-950' : ''
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Home</span>
            </button>

            <button
              onClick={() => trigger('menu', onMenu, 'select')}
              aria-label="Menu"
              className={`flex flex-col items-center justify-center py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all ${
                activeBtn === 'menu' ? 'scale-90 bg-zinc-700' : ''
              }`}
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Menu</span>
            </button>
          </div>

          {/* Playback Controls: Rewind, Play/Pause, Fast Forward */}
          <div className="w-full grid grid-cols-3 gap-2 mb-3 px-2">
            <button
              onClick={() => trigger('rewind', () => audioFeedback.playNavClick(), 'nav')}
              aria-label="Rewind"
              className="flex items-center justify-center py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => trigger('playpause', onPlayPause, 'select')}
              aria-label="Play or Pause"
              className={`flex items-center justify-center py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400 hover:bg-zinc-700 transition-all ${
                activeBtn === 'playpause' ? 'scale-90 bg-amber-500 text-black' : ''
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => trigger('ff', () => audioFeedback.playNavClick(), 'nav')}
              aria-label="Fast Forward"
              className="flex items-center justify-center py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Strip */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <button
              onClick={() => trigger('voldown', () => onVolumeChange(-0.1), 'nav')}
              aria-label="Volume Down"
              className="p-1 text-zinc-400 hover:text-white"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-400 font-mono">VOL</span>
            <button
              onClick={() => trigger('volup', () => onVolumeChange(0.1), 'nav')}
              aria-label="Volume Up"
              className="p-1 text-zinc-400 hover:text-white"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
