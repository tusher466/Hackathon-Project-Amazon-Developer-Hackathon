import React, { useState } from 'react';
import { LeaderboardUser } from '../../types/tv';
import { audioFeedback } from '../../utils/audioFeedback';
import { TVLogger } from '../../utils/offlineStorage';
import {
  Trophy,
  Award,
  Medal,
  Flame,
  Calendar,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Globe,
  Users,
  Volume2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

interface GlobalFitnessLeaderboardProps {
  userCurrentScore?: number;
  highContrast?: boolean;
}

const DEFAULT_GLOBAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user-kai',
    name: 'Kai Takahashi',
    location: 'Tokyo, Japan',
    consistencyScore: 99.4,
    activeDays: 7,
    weeklyMinutes: 245,
    weeklyCalories: 1890,
    streakDays: 48,
    avatarColor: '#10b981',
    badge: 'Iron Streak',
  },
  {
    rank: 2,
    id: 'user-elena',
    name: 'Elena Lindqvist',
    location: 'Stockholm, Sweden',
    consistencyScore: 98.1,
    activeDays: 7,
    weeklyMinutes: 220,
    weeklyCalories: 1720,
    streakDays: 35,
    avatarColor: '#06b6d4',
    badge: 'Master Pacer',
  },
  {
    rank: 3,
    id: 'user-marcus',
    name: 'Marcus Vance',
    location: 'London, UK',
    consistencyScore: 96.5,
    activeDays: 7,
    weeklyMinutes: 205,
    weeklyCalories: 1610,
    streakDays: 24,
    avatarColor: '#8b5cf6',
    badge: 'HIIT Specialist',
  },
  {
    rank: 4,
    id: 'user-you',
    name: 'You (Living Room Master)',
    location: 'Seattle, USA',
    consistencyScore: 94.2,
    activeDays: 7,
    weeklyMinutes: 195,
    weeklyCalories: 1540,
    streakDays: 19,
    isCurrentUser: true,
    avatarColor: '#f59e0b',
    badge: 'Living Room Star',
  },
  {
    rank: 5,
    id: 'user-carlos',
    name: 'Carlos Mendez',
    location: 'Madrid, Spain',
    consistencyScore: 92.8,
    activeDays: 6,
    weeklyMinutes: 180,
    weeklyCalories: 1430,
    streakDays: 14,
    avatarColor: '#3b82f6',
    badge: 'Cardio Elite',
  },
  {
    rank: 6,
    id: 'user-amara',
    name: 'Amara Okafor',
    location: 'Lagos, Nigeria',
    consistencyScore: 90.5,
    activeDays: 6,
    weeklyMinutes: 165,
    weeklyCalories: 1320,
    streakDays: 11,
    avatarColor: '#ec4899',
    badge: 'Power Mover',
  },
  {
    rank: 7,
    id: 'user-sarah',
    name: 'Sarah Jenkins',
    location: 'Austin, USA',
    consistencyScore: 88.2,
    activeDays: 6,
    weeklyMinutes: 150,
    weeklyCalories: 1210,
    streakDays: 9,
    avatarColor: '#14b8a6',
    badge: 'Core Specialist',
  },
  {
    rank: 8,
    id: 'user-liam',
    name: 'Liam O\'Connor',
    location: 'Dublin, Ireland',
    consistencyScore: 85.7,
    activeDays: 5,
    weeklyMinutes: 140,
    weeklyCalories: 1100,
    streakDays: 8,
    avatarColor: '#6366f1',
    badge: 'Rising Challenger',
  },
];

export const GlobalFitnessLeaderboard: React.FC<GlobalFitnessLeaderboardProps> = ({
  userCurrentScore = 94.2,
  highContrast,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(DEFAULT_GLOBAL_LEADERBOARD);
  const [filterDivision, setFilterDivision] = useState<'all' | 'hiit' | 'local'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [announcedMsg, setAnnouncedMsg] = useState<string | null>(null);

  // Custom division datasets
  const getFilteredData = () => {
    if (filterDivision === 'hiit') {
      return leaderboardData.slice(0, 5);
    }
    if (filterDivision === 'local') {
      return leaderboardData.filter((u) => u.location.includes('USA') || u.isCurrentUser);
    }
    return leaderboardData;
  };

  const filteredUsers = getFilteredData();

  // Chart data formatted for Recharts
  const chartData = filteredUsers.map((u) => ({
    name: u.isCurrentUser ? '★ You' : u.name.split(' ')[0],
    fullName: u.name,
    consistency: u.consistencyScore,
    location: u.location,
    activeDays: u.activeDays,
    streak: u.streakDays,
    calories: u.weeklyCalories,
    isCurrentUser: u.isCurrentUser,
  }));

  const handleRefreshRankings = () => {
    setIsRefreshing(true);
    audioFeedback.playSelectChime();
    audioFeedback.triggerHaptic(40);
    TVLogger.log('INFO', 'CV_ENGINE', 'Refreshed 7-day global fitness leaderboard');

    setTimeout(() => {
      // Dynamic subtle variation simulation
      setLeaderboardData((prev) =>
        prev.map((user) => {
          if (user.isCurrentUser) {
            const adjusted = Math.min(99.0, Math.max(90.0, Math.round((user.consistencyScore + (Math.random() - 0.4) * 0.8) * 10) / 10));
            return { ...user, consistencyScore: adjusted };
          }
          const delta = (Math.random() - 0.5) * 0.4;
          return {
            ...user,
            consistencyScore: Math.round((user.consistencyScore + delta) * 10) / 10,
          };
        }).sort((a, b) => b.consistencyScore - a.consistencyScore)
          .map((u, index) => ({ ...u, rank: index + 1 }))
      );
      setIsRefreshing(false);
      audioFeedback.playSelectChime();
    }, 700);
  };

  const announceLeaderboardTTS = () => {
    const currentUser = leaderboardData.find((u) => u.isCurrentUser);
    const speech = `Global Fitness Consistency Leaderboard: Number 1 is ${leaderboardData[0].name} with ${leaderboardData[0].consistencyScore} percent consistency. You are ranked number ${currentUser?.rank || 4} with ${currentUser?.consistencyScore || 94.2} percent 7-day consistency across all 7 days active.`;
    setAnnouncedMsg(speech);
    audioFeedback.announceTTS(speech);
    setTimeout(() => setAnnouncedMsg(null), 4000);
  };

  // Custom Tooltip for Recharts Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans min-w-[210px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              {data.isCurrentUser && <span className="text-amber-400">★</span>}
              {data.fullName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{data.location}</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">7-Day Consistency:</span>
              <span className={`font-bold ${data.isCurrentUser ? 'text-amber-400 text-sm' : 'text-emerald-400'}`}>
                {data.consistency}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Active Days:</span>
              <span className="text-zinc-200">{data.activeDays} of 7 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Daily Streak:</span>
              <span className="text-cyan-400 font-semibold">{data.streak} days</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-zinc-800 text-[10px]">
              <span className="text-zinc-500">Weekly Energy:</span>
              <span className="text-amber-300">{data.calories} kcal</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-8">
      {/* Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              Vega OS Global Network
            </span>
            <span aria-hidden="true">·</span>
            <span>7-Day Activity Consistency</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Global Fitness Leaderboard</span>
            <span className="text-xs bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono px-2 py-0.5 rounded">
              WORLD DIVISION
            </span>
          </h2>
        </div>

        {/* Division Filter Tabs & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => {
                setFilterDivision('all');
                audioFeedback.playNavClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterDivision === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Global Top 8
            </button>

            <button
              onClick={() => {
                setFilterDivision('hiit');
                audioFeedback.playNavClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterDivision === 'hiit'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              HIIT Division
            </button>

            <button
              onClick={() => {
                setFilterDivision('local');
                audioFeedback.playNavClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterDivision === 'local'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Regional
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefreshRankings}
            disabled={isRefreshing}
            title="Refresh real-time global rankings"
            className="tv-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Ranks'}</span>
          </button>

          {/* Screen Reader Voice Announcement */}
          <button
            onClick={announceLeaderboardTTS}
            title="Listen to leaderboard audio summary"
            className="tv-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Read Summary</span>
          </button>
        </div>
      </div>

      {announcedMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2 animate-in fade-in">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{announcedMsg}</span>
        </div>
      )}

      {/* RECHARTS BAR CHART VISUALIZATION */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>7-Day Consistency Ranking Distribution (%)</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Calculated from daily movement regularity, workout duration completion, and CV pose precision.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">Global Athletes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-bold">★ Your Rank (#4)</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Viewport */}
        <div className="w-full h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                tick={{ fill: '#d4d4d8', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                interval={0}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                domain={[70, 100]}
                unit="%"
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="consistency" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrentUser ? '#f59e0b' : index === 0 ? '#10b981' : index === 1 ? '#06b6d4' : '#64748b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED LEADERBOARD CARDS & YOUR STANDING STRIP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 pb-1">
          <span className="uppercase tracking-wider">Ranked Athletes &amp; Consistency Metric</span>
          <span className="font-mono">7-Day Verification Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUsers.map((user) => {
            const isTop3 = user.rank <= 3;
            const medalColor =
              user.rank === 1
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/40'
                : user.rank === 2
                ? 'text-slate-200 bg-slate-200/10 border-slate-300/40'
                : user.rank === 3
                ? 'text-amber-600 bg-amber-600/10 border-amber-600/40'
                : 'text-zinc-400 bg-zinc-900 border-zinc-800';

            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  user.isCurrentUser
                    ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Left: Rank & User Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border font-mono shrink-0 ${medalColor}`}
                  >
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <h4 className="text-sm font-bold text-white truncate">
                        {user.name}
                      </h4>
                      {user.isCurrentUser && (
                        <span className="text-[10px] font-bold bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 truncate">
                      <span>{user.location}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-500 font-mono">{user.activeDays}/7 Active Days</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score & Streak Stats */}
                <div className="text-right shrink-0 font-mono">
                  <div
                    className={`text-lg font-black ${
                      user.isCurrentUser ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {user.consistencyScore}%
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{user.streakDays}d Streak</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Action Strip */}
      <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-white font-semibold block">
              Automated 7-Day Consistency Computation
            </span>
            <span className="text-zinc-400 text-[11px]">
              Every session tracked by the living room camera updates your standing across all Vega OS households.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-zinc-400">Current Standing:</span>
          <span className="bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-400/30">
            Top 5% Globally
          </span>
        </div>
      </div>
    </section>
  );
};
