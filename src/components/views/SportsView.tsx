import React, { useState, useEffect } from 'react';
import { PlayerBox, TacticalAnalysis } from '../../types/tv';
import { audioFeedback } from '../../utils/audioFeedback';
import { TVLogger } from '../../utils/offlineStorage';
import {
  Eye,
  Camera,
  Activity,
  Flame,
  Gauge,
  Sparkles,
  Volume2,
  RefreshCw,
  Globe,
  Sliders,
  Maximize2,
  Check,
} from 'lucide-react';

interface SportsViewProps {
  focusedElementId?: string;
  onSetFocus?: (id: string) => void;
  highContrast?: boolean;
}

const INITIAL_PLAYERS: PlayerBox[] = [
  // Man City (Blue)
  { id: 'mc-9', name: 'Haaland', number: 9, team: 'blue', x: 68, y: 48, speedKmH: 28.4, stamina: 82, highlighted: true },
  { id: 'mc-17', name: 'De Bruyne', number: 17, team: 'blue', x: 55, y: 35, speedKmH: 21.2, stamina: 78, highlighted: true },
  { id: 'mc-47', name: 'Foden', number: 47, team: 'blue', x: 62, y: 22, speedKmH: 26.8, stamina: 85 },
  { id: 'mc-20', name: 'B. Silva', number: 20, team: 'blue', x: 58, y: 72, speedKmH: 24.1, stamina: 80 },
  { id: 'mc-16', name: 'Rodri', number: 16, team: 'blue', x: 42, y: 50, speedKmH: 18.5, stamina: 88 },
  { id: 'mc-3', name: 'Dias', number: 3, team: 'blue', x: 26, y: 42, speedKmH: 19.8, stamina: 90 },

  // Real Madrid (White/Gold)
  { id: 'rm-7', name: 'Vinicius Jr', number: 7, team: 'white', x: 46, y: 76, speedKmH: 31.7, stamina: 84, highlighted: true },
  { id: 'rm-5', name: 'Bellingham', number: 5, team: 'white', x: 50, y: 52, speedKmH: 23.4, stamina: 81 },
  { id: 'rm-11', name: 'Rodrygo', number: 11, team: 'white', x: 49, y: 28, speedKmH: 27.2, stamina: 86 },
  { id: 'rm-15', name: 'Valverde', number: 15, team: 'white', x: 38, y: 64, speedKmH: 29.1, stamina: 91 },
  { id: 'rm-22', name: 'Rüdiger', number: 22, team: 'white', x: 74, y: 46, speedKmH: 22.8, stamina: 87, highlighted: true },
];

export const SportsView: React.FC<SportsViewProps> = ({ focusedElementId, highContrast }) => {
  const [tacticalHud, setTacticalHud] = useState(true);
  const [activeCam, setActiveCam] = useState<'tactical' | 'wire' | 'goalmouth' | 'player_iso'>('tactical');
  const [players, setPlayers] = useState<PlayerBox[]>(INITIAL_PLAYERS);
  const [ballPosition, setBallPosition] = useState({ x: 58, y: 44, speed: 84 });
  const [activeCommentaryLang, setActiveCommentaryLang] = useState<'EN' | 'ES' | 'JA'>('EN');
  const [aiAnalysis, setAiAnalysis] = useState<TacticalAnalysis>({
    headline: 'High Press Overload in Left Half-Space',
    possessionDominance: '62% - 38%',
    xgTrend: '+0.44 xG in last 10m',
    tacticalShift: 'Attacking wingers are pinning the full-backs deep, creating wide pocket transitions for late midfield runners.',
    keyPlayerFocus: 'K. De Bruyne & V. Junior',
    predictedPattern: 'Rapid diagonal switch to isolated right winger',
    passAccuracyZone: '88% accuracy in final third',
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerBox | null>(INITIAL_PLAYERS[0]);

  // Simulate real-time player tracking coordinate updates (Computer Vision feed simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) => {
          const deltaX = (Math.random() - 0.48) * 2.2;
          const deltaY = (Math.random() - 0.5) * 1.8;
          const newX = Math.max(15, Math.min(85, p.x + deltaX));
          const newY = Math.max(12, Math.min(88, p.y + deltaY));
          const speedKmH = Math.round((p.speedKmH + (Math.random() - 0.5) * 3) * 10) / 10;
          return {
            ...p,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
            speedKmH: Math.max(12, Math.min(34, speedKmH)),
          };
        })
      );

      // Ball subtle motion
      setBallPosition((b) => ({
        x: Math.max(20, Math.min(80, b.x + (Math.random() - 0.48) * 3)),
        y: Math.max(20, Math.min(80, b.y + (Math.random() - 0.5) * 2.5)),
        speed: Math.round(75 + Math.random() * 35),
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const fetchLiveAiBreakdown = async () => {
    setLoadingAi(true);
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS('Generating tactical AI match analysis');
    TVLogger.log('INFO', 'CV_ENGINE', 'Requested live Gemini sports breakdown');

    try {
      const res = await fetch('/api/ai/sports-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchTitle: 'UEFA Champions League Final - Manchester City vs Real Madrid',
          currentMinute: '72:18',
          activeTeam: 'Manchester City',
          context: 'Heavy possession rotation around Real Madrid penalty box. De Bruyne probing right half-space.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        TVLogger.log('INFO', 'CV_ENGINE', 'Tactical AI breakdown updated successfully');
      }
    } catch (err: any) {
      TVLogger.log('WARN', 'CV_ENGINE', `AI breakdown using local neural cache: ${err?.message}`);
    } finally {
      setLoadingAi(false);
    }
  };

  const commentaryLines: Record<string, string[]> = {
    EN: [
      '72:18 — De Bruyne threads a laser pass into the pocket for Haaland.',
      '71:55 — Real Madrid regrouping into a compact 4-4-2 mid block.',
      '71:02 — Rudiger makes a critical sliding interception at the edge of the box.',
    ],
    ES: [
      '72:18 — De Bruyne filtra un pase milimétrico entre líneas buscando a Haaland.',
      '71:55 — El Real Madrid se repliega ordenadamente en un bloque medio 4-4-2.',
      '71:02 — Rüdiger aparece con una barrida providencial cortando el peligro.',
    ],
    JA: [
      '72:18 — デ・ブライネが相手ディフェンスの隙間を突く鋭いスルーパスを供給。',
      '71:55 — レアル・マドリードは統制のとれた4-4-2ミドルブロックで守備を構築。',
      '71:02 — リュディガーがペナルティエリア手前で決定的なスライディング阻止。',
    ],
  };

  return (
    <div className="w-full flex flex-col gap-6 p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner: Match Header & Live Broadcast Details */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider">UEFA Champions League Final</span>
            <span aria-hidden="true">·</span>
            <span>Wembley Stadium · 88,000 Attendance</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">4K 60FPS HDR</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-4">
            <span>Manchester City</span>
            <span className="text-amber-400 font-mono text-3xl font-black bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700">
              2 - 1
            </span>
            <span>Real Madrid</span>
          </h1>
        </div>

        {/* Tactical HUD & Multi-Cam Controls */}
        <div className="flex items-center gap-3">
          <button
            id="sports-hud-toggle"
            onClick={() => {
              setTacticalHud(!tacticalHud);
              audioFeedback.playSelectChime();
              audioFeedback.announceTTS(`Tactical computer vision ${!tacticalHud ? 'enabled' : 'disabled'}`);
            }}
            className={`tv-focusable flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              tacticalHud
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            } ${focusedElementId === 'sports-hud-toggle' ? 'is-focused' : ''}`}
          >
            <Eye className="w-4 h-4" />
            <span>CV Tactical HUD: {tacticalHud ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="sports-ai-refresh"
            onClick={fetchLiveAiBreakdown}
            disabled={loadingAi}
            className={`tv-focusable flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-amber-400 hover:text-white transition-all ${
              focusedElementId === 'sports-ai-refresh' ? 'is-focused' : ''
            }`}
          >
            <Sparkles className={`w-4 h-4 text-amber-400 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? 'Analyzing...' : 'AI Tactical Breakdown'}</span>
          </button>
        </div>
      </div>

      {/* Main Pitch & Broadcast Monitor Viewport */}
      <div className="relative w-full aspect-video md:aspect-[21/9] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
        {/* Synthetic Football Pitch Surface with Photorealistic Lines */}
        <div className="absolute inset-0 bg-[#0d2818] opacity-90">
          {/* Pitch grass pattern stripes */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_60px,rgba(0,0,0,0.15)_60px,rgba(0,0,0,0.15)_120px)]" />

          {/* Touchlines and Markings */}
          <div className="absolute inset-4 border-2 border-white/40 rounded-sm pointer-events-none">
            {/* Halfway Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-2 border-white/40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/50 -translate-x-1/2 -translate-y-1/2" />

            {/* Left Penalty Area */}
            <div className="absolute top-1/4 bottom-1/4 left-0 w-28 border-r-2 border-y-2 border-white/40" />
            <div className="absolute top-[35%] bottom-[35%] left-0 w-12 border-r-2 border-y-2 border-white/40" />

            {/* Right Penalty Area */}
            <div className="absolute top-1/4 bottom-1/4 right-0 w-28 border-l-2 border-y-2 border-white/40" />
            <div className="absolute top-[35%] bottom-[35%] right-0 w-12 border-l-2 border-y-2 border-white/40" />
          </div>
        </div>

        {/* Real-time Tactical Heatmap & Pass Vectors Overlay */}
        {tacticalHud && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Attacking Third Heatmap Glow */}
            <div className="absolute top-1/4 right-1/4 w-72 h-48 bg-amber-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-1/3 left-1/3 w-60 h-40 bg-blue-500/15 blur-3xl rounded-full" />

            {/* Ball Trajectory Vector Line */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="ballTrail" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <line
                x1="45%"
                y1="38%"
                x2={`${ballPosition.x}%`}
                y2={`${ballPosition.y}%`}
                stroke="url(#ballTrail)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            </svg>
          </div>
        )}

        {/* Live Soccer Ball with Kinetic Motion */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#ffffff] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20 flex items-center justify-center pointer-events-none"
          style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
          {tacticalHud && (
            <div className="absolute -top-6 whitespace-nowrap bg-black/85 text-[10px] font-mono px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/40">
              {ballPosition.speed} km/h
            </div>
          )}
        </div>

        {/* Computer Vision Detected Players with Dynamic HUD Bounding Boxes */}
        {players.map((p) => {
          const isSelected = selectedPlayer?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPlayer(p);
                audioFeedback.playNavClick();
                audioFeedback.announceTTS(`Player ${p.name}, speed ${p.speedKmH} km/h`);
              }}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-700 ease-out z-20 group`}
            >
              {/* Player Avatar Dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg border-2 transition-transform duration-200 group-hover:scale-125 ${
                  p.team === 'blue'
                    ? 'bg-sky-500 text-zinc-950 border-sky-200'
                    : 'bg-zinc-100 text-zinc-900 border-amber-400'
                } ${isSelected ? 'scale-125 ring-4 ring-amber-400' : ''}`}
              >
                {p.number}
              </div>

              {/* Tactical Computer Vision Bounding Box & HUD Label */}
              {tacticalHud && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none whitespace-nowrap">
                  <div className="bg-black/85 backdrop-blur-sm border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 shadow-md">
                    <span className="font-semibold text-zinc-100">{p.name}</span>
                    <span className="text-amber-400">{p.speedKmH}k</span>
                  </div>
                  {/* CV Target Reticle indicator */}
                  <div className="w-10 h-10 border border-dashed border-amber-400/40 rounded -mt-9 pointer-events-none" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Broadcast HUD Stats Card (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-30 bg-zinc-950/90 backdrop-blur-md border border-zinc-700 p-3 rounded-xl max-w-xs shadow-2xl">
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-zinc-300 pb-2 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE 72:18
            </span>
            <span className="text-zinc-400">Possession: 62% - 38%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
            <div>
              <span className="text-zinc-500 block text-[9px]">EXPECTED GOALS (xG)</span>
              <span className="text-amber-400 font-bold">MCI 1.84 - 1.12 RMA</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px]">PASS ACCURACY</span>
              <span className="text-emerald-400 font-bold">89% Final Third</span>
            </div>
          </div>
        </div>

        {/* Camera Angle Switcher (Top-Right) */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md p-1 rounded-lg border border-zinc-700">
          {(['tactical', 'wire', 'goalmouth', 'player_iso'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => {
                setActiveCam(cam);
                audioFeedback.playSelectChime();
                audioFeedback.announceTTS(`Camera changed to ${cam}`);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCam === cam
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {cam === 'tactical' && 'Tactical 50m'}
              {cam === 'wire' && 'WireCam 3D'}
              {cam === 'goalmouth' && 'Goalmouth CV'}
              {cam === 'player_iso' && 'Player ISO'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: AI Tactical Analysis + Selected Player Telemetry + Live Audio Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Gemini AI Tactical Intelligence */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">AI Match Insight</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Gemini 3.8</span>
            </div>
            <h4 className="text-base font-bold text-amber-400 mb-2">{aiAnalysis.headline}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{aiAnalysis.tacticalShift}</p>

            <div className="space-y-2 text-xs font-mono text-zinc-300 border-t border-zinc-800/80 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Spatial Impact:</span>
                <span className="font-semibold text-zinc-200">{aiAnalysis.keyPlayerFocus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Predicted Pattern:</span>
                <span className="font-semibold text-emerald-400">{aiAnalysis.predictedPattern}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">xG Velocity:</span>
                <span className="font-semibold text-amber-400">{aiAnalysis.xgTrend}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Living Room Tactical HUD</span>
            <span className="text-amber-400 font-bold">10-Foot Optimized</span>
          </div>
        </div>

        {/* Panel 2: Selected Player Tracking Telemetry */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Player Tracking CV</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">60 FPS Bounding</span>
            </div>

            {selectedPlayer ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                      selectedPlayer.team === 'blue'
                        ? 'bg-sky-500 text-zinc-950'
                        : 'bg-zinc-100 text-zinc-950'
                    }`}
                  >
                    {selectedPlayer.number}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedPlayer.name}</h4>
                    <p className="text-xs text-zinc-400">
                      {selectedPlayer.team === 'blue' ? 'Manchester City' : 'Real Madrid'} · Attacking Line
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-3">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px]">PEAK SPRINT SPEED</span>
                    <span className="text-amber-400 font-bold text-sm">{selectedPlayer.speedKmH} km/h</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px]">STAMINA RESERVE</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedPlayer.stamina}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400">
                  <span>Pitch Position: </span>
                  <span className="font-mono text-zinc-200">X: {selectedPlayer.x}%, Y: {selectedPlayer.y}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Select any player on the pitch with remote D-pad to view real-time telemetry.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
            <span>Multi-modal Computer Vision</span>
            <span className="text-emerald-400 font-semibold">Active Tracker</span>
          </div>
        </div>

        {/* Panel 3: Live Multilingual Commentary & Translation */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Live Commentary</h3>
              </div>
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-800">
                {(['EN', 'ES', 'JA'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setActiveCommentaryLang(lang);
                      audioFeedback.playNavClick();
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      activeCommentaryLang === lang
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {commentaryLines[activeCommentaryLang].map((line, idx) => (
                <div key={idx} className="text-xs text-zinc-300 border-l-2 border-amber-500/70 pl-2.5 py-0.5">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Real-time Speech Dubbing</span>
            <span className="text-zinc-300 font-mono">Dolby Atmos 5.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
