import React, { useState, useEffect, useRef } from 'react';
import { audioFeedback } from '../../utils/audioFeedback';
import { TVLogger, tvStorage, defaultIntensityHistory, defaultNotificationSchedule } from '../../utils/offlineStorage';
import { WorkoutIntensityDay, ScheduledNotification } from '../../types/tv';
import {
  Activity,
  Flame,
  Heart,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  BarChart3,
  LineChart,
  Gauge,
  Zap,
  Volume2,
  Layers,
  Save,
  Bell,
  BellRing,
  Clock,
  Calendar,
  Check,
  X,
  VolumeX,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { GlobalFitnessLeaderboard } from './GlobalFitnessLeaderboard';


interface FitnessViewProps {
  focusedElementId?: string;
  onSetFocus?: (id: string) => void;
  highContrast?: boolean;
}

export const FitnessView: React.FC<FitnessViewProps> = ({ focusedElementId, highContrast }) => {
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [exerciseType, setExerciseType] = useState<'squats' | 'jumping_jacks' | 'lunges'>('squats');
  const [repCount, setRepCount] = useState(14);
  const [targetReps, setTargetReps] = useState(20);
  const [currentKneeAngle, setCurrentKneeAngle] = useState(94);
  const [formFeedback, setFormFeedback] = useState('Excellent depth — maintain upright spine');
  const [caloriesBurned, setCaloriesBurned] = useState(128);
  const [heartRate, setHeartRate] = useState(136);
  const [elapsedSec, setElapsedSec] = useState(340);
  const [cameraActive, setCameraActive] = useState(false);

  // Real-time camera intensity tracking state
  const [instantIntensity, setInstantIntensity] = useState(74); // 0 - 100%
  const [motionVelocity, setMotionVelocity] = useState(2.3); // m/s
  const [cameraConfidence, setCameraConfidence] = useState(96); // %
  const [sessionPeakIntensity, setSessionPeakIntensity] = useState(88);

  // 7-day trend chart state & mode
  const [intensityHistory, setIntensityHistory] = useState<WorkoutIntensityDay[]>(() =>
    tvStorage.getIntensityHistory()
  );
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local Notification Scheduling state
  const [notificationSchedule, setNotificationSchedule] = useState<ScheduledNotification>(() =>
    tvStorage.getNotificationSchedule()
  );
  const [activeAlertToast, setActiveAlertToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    minutesBefore: number;
    scheduledTime: string;
  } | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to compute alert time (30 minutes prior to scheduled analysis time)
  const calculateAlertTime = (scheduledTimeStr: string, leadMinutes: number = 30) => {
    const [hours, minutes] = scheduledTimeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '19:00';

    let totalMins = hours * 60 + minutes - leadMinutes;
    if (totalMins < 0) totalMins += 24 * 60;

    const alertH = Math.floor(totalMins / 60);
    const alertM = totalMins % 60;
    return `${alertH.toString().padStart(2, '0')}:${alertM.toString().padStart(2, '0')}`;
  };

  const alertTime = calculateAlertTime(notificationSchedule.scheduledAnalysisTime, notificationSchedule.alertLeadMinutes);

  // Trigger the 30-minute pre-alert with audio feedback, TTS, and haptics
  const triggerThirtyMinAlert = (simulated: boolean = false) => {
    // 1. Play high-fidelity melodic audio chime
    audioFeedback.playNotificationAlert();

    // 2. Trigger tactile haptic pulse
    audioFeedback.triggerHaptic(60);

    // 3. Screen reader speech announcement
    audioFeedback.announceTTS(
      'Upcoming Reminder: Your 7-day fitness trend analysis begins in 30 minutes. Get ready for your living room workout!'
    );

    // 4. Show on-screen TV toast card
    setActiveAlertToast({
      show: true,
      title: '7-Day Fitness Trend Analysis in 30 Min',
      message: `Your scheduled session is set for ${notificationSchedule.scheduledAnalysisTime}. Time to warm up and clear your living-room space!`,
      minutesBefore: 30,
      scheduledTime: notificationSchedule.scheduledAnalysisTime,
    });

    // 5. Native browser notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('Vega TV Fitness Reminder', {
            body: `7-Day Trend Analysis starts in 30 minutes at ${notificationSchedule.scheduledAnalysisTime}.`,
            icon: '/favicon.ico',
          });
        } catch {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    // 6. Log event in diagnostics
    TVLogger.log(
      'INFO',
      'AUDIO',
      `30-minute pre-alert audio chime triggered for 7-day fitness analysis (scheduled: ${notificationSchedule.scheduledAnalysisTime}, alert: ${alertTime}${simulated ? ' - simulated' : ''})`
    );
  };

  // Schedule timer clock checker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeFormatted = `${currentH}:${currentM}`;
      setCurrentTimeStr(timeFormatted);

      // Check if current time matches the 30-min alert time
      if (
        notificationSchedule.active &&
        timeFormatted === alertTime &&
        notificationSchedule.lastAlertFired !== timeFormatted
      ) {
        triggerThirtyMinAlert(false);
        const updated = { ...notificationSchedule, lastAlertFired: timeFormatted };
        setNotificationSchedule(updated);
        tvStorage.saveNotificationSchedule(updated);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [notificationSchedule, alertTime]);

  // Exercise Timer & Repetition Simulator
  useEffect(() => {
    let timer: any = null;
    if (isWorkingOut) {
      timer = setInterval(() => {
        setElapsedSec((s) => s + 1);

        // Periodically cycle joint angle and score
        const angle = Math.round(85 + Math.sin(Date.now() / 600) * 35);
        setCurrentKneeAngle(angle);

        // Compute simulated camera motion velocity & real-time intensity from CV joint tracking
        const computedVelocity = Math.round((1.6 + Math.abs(Math.sin(Date.now() / 500)) * 1.8) * 10) / 10;
        setMotionVelocity(computedVelocity);

        const calculatedIntensity = Math.min(
          100,
          Math.max(25, Math.round(55 + computedVelocity * 12 + (angle < 95 ? 12 : 0)))
        );
        setInstantIntensity(calculatedIntensity);
        setSessionPeakIntensity((prev) => Math.max(prev, calculatedIntensity));

        // Camera joint tracking confidence jitter
        setCameraConfidence(Math.round(94 + Math.random() * 5));

        // Rep detection cycle
        if (angle < 95 && Math.random() > 0.6) {
          setRepCount((r) => {
            const next = r + 1;
            audioFeedback.playSelectChime();
            audioFeedback.announceTTS(`Rep ${next}`);
            audioFeedback.triggerHaptic(40);
            return next;
          });
          setCaloriesBurned((c) => c + 2);
          setHeartRate((h) => Math.min(172, h + (Math.random() > 0.5 ? 1 : 0)));
          setFormFeedback('Good rep! Drive through the heels.');
        } else if (angle > 115) {
          setFormFeedback('Deepen your squat to hit 90° for full activation.');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWorkingOut]);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      audioFeedback.playBackTone();
      TVLogger.log('INFO', 'CV_ENGINE', 'Camera tracking switched to synthetic AI pose engine');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        audioFeedback.playSelectChime();
        TVLogger.log('INFO', 'CV_ENGINE', 'Physical camera initialized for living-room CV tracking');
      } catch (err: any) {
        TVLogger.log('WARN', 'CV_ENGINE', `Physical webcam not available: ${err?.message}`);
        setCameraActive(false);
      }
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine current intensity zone name & color
  const getIntensityZone = (val: number) => {
    if (val >= 85) return { name: 'Peak HIIT', color: '#ef4444', zone: 'Anaerobic' as const };
    if (val >= 70) return { name: 'Cardio Threshold', color: '#f59e0b', zone: 'Threshold' as const };
    if (val >= 50) return { name: 'Aerobic Burn', color: '#10b981', zone: 'Aerobic' as const };
    return { name: 'Active Recovery', color: '#06b6d4', zone: 'Recovery' as const };
  };

  const currentZone = getIntensityZone(instantIntensity);

  // Commit current live camera session data into today's point on the 7-day chart
  const handleLogCurrentSession = () => {
    audioFeedback.playSelectChime();
    audioFeedback.triggerHaptic(50);

    const updated = [...intensityHistory];
    const todayIndex = updated.length - 1;

    if (todayIndex >= 0) {
      const activeDurationMin = Math.max(1, Math.round(elapsedSec / 60));
      const newAvg = Math.round((updated[todayIndex].avgIntensity + instantIntensity) / 2);
      const newPeak = Math.max(updated[todayIndex].peakIntensity, sessionPeakIntensity);

      updated[todayIndex] = {
        ...updated[todayIndex],
        avgIntensity: newAvg,
        peakIntensity: newPeak,
        durationMin: activeDurationMin,
        calories: caloriesBurned,
        zone: getIntensityZone(newAvg).zone,
        cameraConfidence: cameraConfidence,
      };

      setIntensityHistory(updated);
      tvStorage.saveIntensityHistory(updated);
      TVLogger.log('INFO', 'CV_ENGINE', `Synced live camera session: ${newAvg}% intensity, ${caloriesBurned} kcal`);

      setSaveSuccessMsg('Live camera workout synced to 7-day trend!');
      audioFeedback.announceTTS(`Logged workout intensity of ${newAvg} percent to 7-day history.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Screen reader voice announcement of 7-day trend
  const announceWeeklyTrendTTS = () => {
    const avgWeekly = Math.round(
      intensityHistory.reduce((acc, curr) => acc + curr.avgIntensity, 0) / intensityHistory.length
    );
    const peakWeekly = Math.max(...intensityHistory.map((d) => d.peakIntensity));
    const speech = `Your 7-day camera workout intensity averages ${avgWeekly} percent, peaking at ${peakWeekly} percent. Today's current intensity is ${instantIntensity} percent in the ${currentZone.name} zone.`;
    audioFeedback.announceTTS(speech);
  };

  // Update Notification Schedule handlers
  const handleUpdateScheduledTime = (newTime: string) => {
    const updated: ScheduledNotification = {
      ...notificationSchedule,
      scheduledAnalysisTime: newTime,
    };
    setNotificationSchedule(updated);
    tvStorage.saveNotificationSchedule(updated);
    audioFeedback.playSelectChime();
    const newAlert = calculateAlertTime(newTime, notificationSchedule.alertLeadMinutes);
    audioFeedback.announceTTS(`Scheduled fitness analysis set to ${newTime}. 30-minute audio alert will sound at ${newAlert}.`);
  };

  const handleToggleNotificationActive = () => {
    const nextState = !notificationSchedule.active;
    const updated: ScheduledNotification = {
      ...notificationSchedule,
      active: nextState,
    };
    setNotificationSchedule(updated);
    tvStorage.saveNotificationSchedule(updated);
    audioFeedback.playSelectChime();
    audioFeedback.announceTTS(`30-minute pre-alert audio notifications ${nextState ? 'enabled' : 'disabled'}`);
  };

  // Aggregated weekly metrics for summary cards
  const weeklyAvgIntensity = Math.round(
    intensityHistory.reduce((acc, curr) => acc + curr.avgIntensity, 0) / intensityHistory.length
  );
  const weeklyPeakIntensity = Math.max(...intensityHistory.map((d) => d.peakIntensity));
  const weeklyTotalMinutes = intensityHistory.reduce((acc, curr) => acc + curr.durationMin, 0);
  const weeklyTotalCalories = intensityHistory.reduce((acc, curr) => acc + curr.calories, 0);

  // Custom Living Room TV Tooltip for Recharts
  const CustomTVTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: WorkoutIntensityDay = payload[0].payload;
      const zoneInfo = getIntensityZone(data.avgIntensity);
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans min-w-[200px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <span className="font-bold text-white text-sm">{data.dateStr}</span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
              style={{ backgroundColor: `${zoneInfo.color}20`, color: zoneInfo.color }}
            >
              {zoneInfo.name}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Average Intensity:</span>
              <span className="font-bold text-emerald-400">{data.avgIntensity}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Peak Intensity:</span>
              <span className="font-bold text-amber-400">{data.peakIntensity}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Camera Tracked:</span>
              <span className="text-zinc-200">{data.durationMin} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Energy Burned:</span>
              <span className="text-amber-300">{data.calories} kcal</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-zinc-800 text-[10px]">
              <span className="text-zinc-500">CV Confidence:</span>
              <span className="text-cyan-400 font-semibold">{data.cameraConfidence}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-300 relative">
      {/* 30-MINUTE PRE-ALERT LIVING ROOM TV TOAST NOTIFICATION */}
      {activeAlertToast && activeAlertToast.show && (
        <div className="fixed top-20 right-8 z-50 w-96 bg-zinc-950 border-2 border-amber-400 rounded-2xl p-5 shadow-2xl shadow-amber-500/25 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
                <BellRing className="w-4 h-4 animate-bounce text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  30-Min Audio Alert · Fire TV
                </span>
                <h4 className="text-sm font-bold text-white">{activeAlertToast.title}</h4>
              </div>
            </div>
            <button
              onClick={() => setActiveAlertToast(null)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-4">{activeAlertToast.message}</p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveAlertToast(null);
                setIsWorkingOut(true);
                audioFeedback.playSelectChime();
              }}
              className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow"
            >
              Start Workout Now
            </button>
            <button
              onClick={() => {
                setActiveAlertToast(null);
                audioFeedback.playBackTone();
              }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs rounded-xl transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: Coach & Session Details */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">AI Fitness Coach</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Skeletal Pose Computer Vision</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-400">7-Day Intensity Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Living Room HIIT &amp; Core Burn</span>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono">
              LEVEL 2
            </span>
          </h1>
        </div>

        {/* Workout Actions & Camera Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="fitness-cam-btn"
            onClick={toggleCamera}
            className={`tv-focusable flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              cameraActive
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{cameraActive ? 'Webcam CV: ACTIVE' : 'Enable Live Camera'}</span>
          </button>

          <button
            id="fitness-play-btn"
            onClick={() => {
              setIsWorkingOut(!isWorkingOut);
              audioFeedback.playSelectChime();
              audioFeedback.announceTTS(isWorkingOut ? 'Workout paused' : 'Workout started');
            }}
            className={`tv-focusable flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg ${
              isWorkingOut
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {isWorkingOut ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isWorkingOut ? 'PAUSE WORKOUT' : 'START SESSION'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport: Computer Vision Skeleton & Live Intensity HUD */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-zinc-950 via-zinc-900 to-black rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Live User Camera Feed if enabled */}
        {cameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-60"
          />
        )}

        {/* Synthetic AI Gym Background if camera off */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-emerald-950/20 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          </div>
        )}

        {/* Live Camera Intensity Floating HUD (Top-Left of Viewport) */}
        <div className="absolute top-6 left-6 z-20 bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-xl backdrop-blur-md shadow-2xl max-w-xs">
          <div className="flex items-center justify-between gap-3 text-xs font-mono text-zinc-300 pb-2 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>CAMERA INTENSITY</span>
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${currentZone.color}20`, color: currentZone.color }}
            >
              {currentZone.name}
            </span>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-white">{instantIntensity}%</span>
              <span className="text-[11px] text-zinc-400">Peak: {sessionPeakIntensity}%</span>
            </div>

            {/* Dynamic Intensity Gauge Bar */}
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${instantIntensity}%`,
                  backgroundColor: currentZone.color,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
              <span>Velocity: {motionVelocity} m/s</span>
              <span>CV Precision: {cameraConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Live Skeletal Pose Computer Vision Overlay */}
        <div className="relative z-10 w-80 h-96 border border-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
          <svg className="w-full h-full pointer-events-none">
            {/* Head */}
            <circle cx="160" cy="60" r="16" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2.5" />

            {/* Spine */}
            <line x1="160" y1="76" x2="160" y2="180" stroke="#10b981" strokeWidth="3" />

            {/* Shoulders */}
            <line x1="110" y1="100" x2="210" y2="100" stroke="#10b981" strokeWidth="3" />
            <circle cx="110" cy="100" r="6" fill="#34d399" />
            <circle cx="210" cy="100" r="6" fill="#34d399" />

            {/* Arms */}
            <line x1="110" y1="100" x2="90" y2="150" stroke="#10b981" strokeWidth="2.5" />
            <line x1="90" y1="150" x2="80" y2="190" stroke="#10b981" strokeWidth="2.5" />
            <line x1="210" y1="100" x2="230" y2="150" stroke="#10b981" strokeWidth="2.5" />
            <line x1="230" y1="150" x2="240" y2="190" stroke="#10b981" strokeWidth="2.5" />

            {/* Hips & Pelvis */}
            <line x1="125" y1="180" x2="195" y2="180" stroke="#10b981" strokeWidth="3" />
            <circle cx="125" cy="180" r="6" fill="#34d399" />
            <circle cx="195" cy="180" r="6" fill="#34d399" />

            {/* Legs with Dynamic Knee Joint Angle */}
            <line x1="125" y1="180" x2="115" y2="260" stroke="#10b981" strokeWidth="3" />
            <circle cx="115" cy="260" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="115" y1="260" x2="110" y2="330" stroke="#10b981" strokeWidth="3" />
            <circle cx="110" cy="330" r="6" fill="#34d399" />

            <line x1="195" y1="180" x2="205" y2="260" stroke="#10b981" strokeWidth="3" />
            <circle cx="205" cy="260" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="205" y1="260" x2="210" y2="330" stroke="#10b981" strokeWidth="3" />
            <circle cx="210" cy="330" r="6" fill="#34d399" />
          </svg>

          {/* Real-time Knee Angle HUD Pill */}
          <div className="absolute top-64 right-4 bg-zinc-900/90 border border-amber-400 px-2 py-1 rounded text-[11px] font-mono text-amber-300 shadow">
            Knee Angle: {currentKneeAngle}°
          </div>
        </div>

        {/* Live Form Guidance Banner */}
        <div className="absolute top-6 inset-x-8 flex justify-center z-20 pointer-events-none">
          <div className="bg-zinc-950/90 border border-zinc-700 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs md:text-sm font-semibold text-zinc-100">{formFeedback}</span>
          </div>
        </div>

        {/* Bottom Living Room Telemetry Bar */}
        <div className="absolute bottom-6 inset-x-8 z-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>REPETITIONS</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {repCount} <span className="text-xs text-zinc-500 font-normal">/ {targetReps}</span>
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>CALORIES BURNED</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {caloriesBurned} <span className="text-xs text-zinc-500 font-normal">kcal</span>
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>HEART RATE</span>
            </div>
            <div className="text-2xl font-black font-mono text-red-400">
              {heartRate} <span className="text-xs text-zinc-500 font-normal">bpm</span>
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>ELAPSED TIME</span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400">{formatTime(elapsedSec)}</div>
          </div>
        </div>
      </div>

      {/* 7-DAY WORKOUT INTENSITY TREND CHART & LOCAL NOTIFICATION SCHEDULING */}
      <section className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-8">
        {/* Section Header with Controls */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                Computer Vision Telemetry
              </span>
              <span aria-hidden="true">·</span>
              <span>Recharts 7-Day Trend Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              7-Day Workout Intensity Trends
            </h2>
          </div>

          {/* Interactive Chart Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Chart Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  setChartMode('area');
                  audioFeedback.playNavClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartMode === 'area'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Intensity Curve</span>
              </button>

              <button
                onClick={() => {
                  setChartMode('bar');
                  audioFeedback.playNavClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartMode === 'bar'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Peak vs Avg</span>
              </button>
            </div>

            {/* Sync Live Camera Data Action */}
            <button
              onClick={handleLogCurrentSession}
              title="Sync current live camera intensity to today's entry"
              className="tv-focusable flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 transition-all shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Log Camera Session</span>
            </button>

            {/* Screen Reader Voice Announcement */}
            <button
              onClick={announceWeeklyTrendTTS}
              title="Read 7-day trend aloud"
              className="tv-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>

        {/* Save confirmation banner */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs font-medium text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Recharts 7-Day Chart Area */}
        <div className="w-full h-72 md:h-80 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 md:p-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'area' ? (
              <AreaChart data={intensityHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  domain={[30, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTVTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="avgIntensity"
                  name="Avg Intensity (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#intensityGradient)"
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="peakIntensity"
                  name="Peak Intensity (%)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fillOpacity={1}
                  fill="url(#peakGradient)"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={intensityHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTVTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="avgIntensity"
                  name="Avg Intensity (%)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="peakIntensity"
                  name="Peak Intensity (%)"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 7-Day Performance Metric Strip (Tabular Numerals) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              7-DAY AVERAGE INTENSITY
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {weeklyAvgIntensity}%
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Cardio threshold band</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              WEEKLY PEAK INTENSITY
            </span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {weeklyPeakIntensity}%
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Recorded on Saturday</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              CAMERA TRACKED DURATION
            </span>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {weeklyTotalMinutes} <span className="text-xs text-zinc-500 font-normal">mins</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Across 7 sessions</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              TOTAL CALORIES BURNED
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {weeklyTotalCalories} <span className="text-xs text-zinc-500 font-normal">kcal</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Camera verified burn</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl col-span-2 md:col-span-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              CV SKELETAL ACCURACY
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {cameraConfidence}%
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">17 keypoints tracked</span>
          </div>
        </div>

        {/* LOCAL NOTIFICATION SCHEDULING CARD: 30-MINUTES PRE-ALERT WITH AUDIO FEEDBACK */}
        <div className="bg-zinc-950/90 border-2 border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Local Notification Scheduling &amp; Audio Reminder
                  </h3>
                  <span className="text-[10px] font-mono uppercase bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded border border-amber-400/30 font-bold">
                    30-MIN PRE-ALERT
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Plays a 4-tone melodic audio chime &amp; speaks a living-room voice reminder exactly 30 minutes before your scheduled 7-day fitness analysis.
                </p>
              </div>
            </div>

            {/* Toggle Scheduler Active / Paused */}
            <button
              onClick={handleToggleNotificationActive}
              className={`tv-focusable px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                notificationSchedule.active
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              {notificationSchedule.active ? 'REMINDER ACTIVE' : 'REMINDER PAUSED'}
            </button>
          </div>

          {/* Schedule Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Scheduled Time & Lead Info */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  SCHEDULED ANALYSIS TIME
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="time"
                    value={notificationSchedule.scheduledAnalysisTime}
                    onChange={(e) => handleUpdateScheduledTime(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 text-amber-400 font-mono font-bold text-lg px-3 py-1.5 rounded-lg outline-none focus:border-amber-400"
                  />
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Current Clock: <span className="font-mono text-zinc-200">{currentTimeStr}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-emerald-400 font-mono">
                Audio Alert triggers at: <span className="font-bold text-white">{alertTime}</span> (30m prior)
              </div>
            </div>

            {/* Column 2: Quick Schedule Presets */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">
                  QUICK PRESETS (30-MIN LEAD)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateScheduledTime('19:30')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left ${
                      notificationSchedule.scheduledAnalysisTime === '19:30'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    19:30 Evening
                    <span className="block text-[9px] text-zinc-500">Alert at 19:00</span>
                  </button>

                  <button
                    onClick={() => handleUpdateScheduledTime('20:00')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left ${
                      notificationSchedule.scheduledAnalysisTime === '20:00'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    20:00 Night
                    <span className="block text-[9px] text-zinc-500">Alert at 19:30</span>
                  </button>

                  <button
                    onClick={() => handleUpdateScheduledTime('08:30')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left ${
                      notificationSchedule.scheduledAnalysisTime === '08:30'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    08:30 Morning
                    <span className="block text-[9px] text-zinc-500">Alert at 08:00</span>
                  </button>

                  <button
                    onClick={() => {
                      const now = new Date();
                      now.setMinutes(now.getMinutes() + 35);
                      const h = now.getHours().toString().padStart(2, '0');
                      const m = now.getMinutes().toString().padStart(2, '0');
                      handleUpdateScheduledTime(`${h}:${m}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-amber-400 text-left transition-all"
                  >
                    In 35 mins
                    <span className="block text-[9px] text-amber-400 font-bold">Alert in 5m!</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-zinc-500">
                Automatic daily recurrence active
              </div>
            </div>

            {/* Column 3: Live Audio Feedback Test Action */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  AUDIO FEEDBACK &amp; TOAST PREVIEW
                </span>
                <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                  Test the living-room sound chime and television notification banner to ensure volume and accessibility settings are calibrated.
                </p>
              </div>

              <button
                id="test-30min-alert-btn"
                onClick={() => triggerThirtyMinAlert(true)}
                className="tv-focusable w-full py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-zinc-950 hover:bg-amber-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
              >
                <Volume2 className="w-4 h-4 text-zinc-950" />
                <span>Simulate 30-Min Audio Alert</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Fitness Consistency Leaderboard */}
      <GlobalFitnessLeaderboard
        userCurrentScore={94.2}
        highContrast={highContrast}
      />
    </div>
  );
};

