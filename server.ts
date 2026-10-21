import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)),
  ]);
}

// In-memory cloud sync store for living-room profiles and watchlists
const cloudSyncStore: Record<string, any> = {
  default_profile: {
    lastSynced: new Date().toISOString(),
    watchlist: ['sports-1', 'movie-1'],
    preferences: {
      highContrast: false,
      fontScale: 'normal',
      audioFeedback: true,
      tacticalHud: true,
      colorBlindMode: 'none',
      resolutionMode: '4k',
    },
    fitnessHistory: [
      { date: '2026-10-19', exercise: 'Living Room HIIT', reps: 42, score: 98, durationMin: 15 },
    ],
  },
};

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'Vega OS / Fire OS Living Room Hub',
    geminiEnabled: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// AI Tactical Sports Analysis Endpoint
app.post('/api/ai/sports-analysis', async (req, res) => {
  const { matchTitle, currentMinute, activeTeam, context } = req.body;

  if (ai) {
    try {
      const prompt = `You are an elite sports computer vision & tactical AI analyzer for a 10-foot Fire TV screen.
Match: ${matchTitle || 'Manchester City vs Real Madrid'}
Current Match Time: ${currentMinute || '68:12'}
Team with possession: ${activeTeam || 'Manchester City'}
Recent Context: ${context || 'High press in final third, 14 passes strung together, shot on target blocked.'}

Provide a concise, ultra-sharp tactical breakdown for television display. Format your response strictly as valid JSON with the following keys:
- "headline": Short 5-8 word punchy tactical title (e.g. "Inverted Wingers Overloading Half-Spaces")
- "possessionDominance": string (e.g. "64% - 36%")
- "xgTrend": string (e.g. "+0.38 xG in last 10m")
- "tacticalShift": 1-2 sentence tactical insight
- "keyPlayerFocus": name of player making greatest spatial impact
- "predictedPattern": next likely attacking movement (e.g. "Low cutback to trailing midfielder")
- "passAccuracyZone": string (e.g. "89% in attacking third")`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        3500
      );

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini sports analysis fallback triggered:', err?.message || err);
    }
  }

  // High-fidelity fallback if offline or no API key
  return res.json({
    headline: 'High Press Overload in Left Half-Space',
    possessionDominance: '62% - 38%',
    xgTrend: '+0.44 xG over last 12 minutes',
    tacticalShift: 'Attacking wingers are pinning the full-backs deep, creating wide pocket transitions for late midfield runners.',
    keyPlayerFocus: 'K. De Bruyne / V. Junior',
    predictedPattern: 'Rapid switch of play to isolated right wing runner',
    passAccuracyZone: '88% accuracy inside final third',
  });
});

// AI Smart X-Ray Endpoint
app.post('/api/ai/xray', async (req, res) => {
  const { title, sceneTimestamp, charactersInScene, selectedActor } = req.body;

  if (ai) {
    try {
      const prompt = `You are Amazon Fire TV Smart X-Ray, an AI living room assistant providing real-time actor information and scene context.
Title: ${title || 'Cosmic Horizon: Odyssey'}
Timestamp: ${sceneTimestamp || '01:04:15'}
Active Selected Actor: ${selectedActor || 'Marcus Sterling'}
Cast in Scene: ${JSON.stringify(charactersInScene || ['Marcus Sterling', 'Dr. Elena Rostova', 'Kaelen Vance'])}

Provide detailed actor information and cinematic scene context. Return valid JSON with keys:
- "selectedActorInfo": object with:
  - "name": string
  - "character": string
  - "bio": 2-sentence actor career background
  - "knownFor": array of 3 movie/series titles
  - "characterMotivation": current psychological/emotional drive in this exact scene
  - "funFact": 1 surprising acting or behind-the-scenes fact about this actor
- "sceneContext": object with:
  - "sceneTitle": short punchy scene title
  - "narrativeSummary": 2-sentence explanation of what is taking place in this exact scene
  - "directorNote": camera or lighting technique used by director
  - "musicPlaying": title and artist of the ambient score or soundtrack
  - "productionTrivia": technical or filming trivia
  - "easterEgg": hidden detail in frame`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        3500
      );

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini X-Ray fallback triggered:', err?.message || err);
    }
  }

  // High-fidelity fallback if offline or timeout
  const actor = selectedActor || 'Marcus Sterling';
  const isElena = actor.toLowerCase().includes('elena') || actor.toLowerCase().includes('rostova');
  const isKaelen = actor.toLowerCase().includes('kaelen');

  return res.json({
    selectedActorInfo: {
      name: isElena ? 'Dr. Elena Rostova (played by Ananya Mercer)' : isKaelen ? 'Kaelen Vance (played by Lucas Haze)' : 'Marcus Sterling (played by Christian Vance)',
      character: isElena ? 'Chief Astrophysicist Dr. Elena Rostova' : isKaelen ? 'Robotic Specialist Kaelen Vance' : 'Commander Marcus Vance',
      bio: isElena
        ? 'Royal Academy of Dramatic Art alumna and BAFTA nominee celebrated for grounded performances in cerebral science-fiction.'
        : isKaelen
        ? 'Rising stage and screen actor renowned for intensely physical kinetic roles in award-winning independent films.'
        : 'Two-time Academy Award nominee celebrated for commanding screen presence in epic cinematic dramas and space adventures.',
      knownFor: isElena
        ? ['The Quantum Labyrinth', 'Chronos Protocol', 'Solaris Rebirth']
        : isKaelen
        ? ['Sub-Zero Frontier', 'Cyberline: Tokyo', 'The Last Satellite']
        : ['Interstellar Vanguard', 'The Martian Horizon', 'Deep Orbit Zero'],
      characterMotivation: isElena
        ? 'Desperately verifying gravimetric sensor calibration to prevent the starship from being torn apart by tidal gravity shear.'
        : isKaelen
        ? 'Manual override of the secondary reaction thrusters after the primary AI bus encountered radiation corruption.'
        : 'Grappling with the moral weight of leaving Earth behind while steering his crew through the irreversible point of no return.',
      funFact: isElena
        ? 'Consulted with real CERN astrophysicists for 4 months to master genuine mathematical vernacular during filming.'
        : isKaelen
        ? 'Spent 3 weeks in zero-g water simulation tanks to develop natural weightless body movement.'
        : 'Performed 90% of practical wire-rig zero-gravity stunts personally after 6 months of parabolic flight training.',
    },
    sceneContext: {
      sceneTitle: 'The Gravimetric Boundary Event Horizon',
      narrativeSummary: 'The crew of Odyssey initiates their critical deceleration burn across the Perseus nebula boundary, facing extreme time dilation.',
      directorNote: 'Single continuous 3-minute Steadicam shot tracking the actors through the zero-gravity airlock sequence with natural anamorphic lens flares.',
      musicPlaying: 'Sub-Orbital Drift by Ludwig Göransson · 96kHz 24-bit Lossless',
      productionTrivia: 'Filmed on location with zero green-screen using 360-degree LED soundstages running Unreal Engine 5.4 in real-time.',
      easterEgg: 'The telemetry monitor behind Commander Vance displays actual orbital trajectory data from the Artemis II flight path.',
    },
    sceneTrivia: 'Filmed on location with zero green-screen using 360-degree LED soundstages running Unreal Engine 5.4 in real-time.',
    musicPlaying: 'Sub-Orbital Drift by Ludwig Göransson',
    directorNote: 'Single continuous 3-minute Steadicam shot tracking the astronaut through the zero-gravity airlock sequence.',
    characterMotivations: 'Grappling with the moral weight of leaving Earth behind while holding vital navigation coordinates.',
    easterEgg: 'The telemetry monitor behind the pilot displays actual orbital telemetry from the 2024 Artemis II flight path.',
  });
});

// Fallback fitness tips dictionary
const fallbackDailyMotivationTips = [
  {
    title: 'The 60-Second Thoracic Spine Unlock',
    tip: 'Extended couch sitting compresses the ribcage and reduces oxygen intake. Opening your upper thoracic spine immediately elevates alertness, improves lung capacity, and relieves neck strain.',
    category: 'Quick Mobility',
    actionableStep: 'Interlace hands behind your head, inhale deeply, and gently arch backward over your sofa or chair backrest 5 times with slow, rhythmic exhalations.',
    estimatedTime: '2 min',
    intensityLevel: 'Low',
    aiQuote: 'Motion is lotion for the joints; tiny daily movements yield profound physical longevity.',
  },
  {
    title: 'Living Room Air-Squat Metabolic Surge',
    tip: 'Activating the body’s largest muscle groups—the quadriceps and gluteals—stimulates glucose uptake and clears sluggish afternoon fatigue in under 90 seconds.',
    category: 'Metabolic Spark',
    actionableStep: 'Stand up right now and perform 15 slow, controlled air squats with a 2-second hold at the bottom before returning to the screen.',
    estimatedTime: '3 min',
    intensityLevel: 'Medium',
    aiQuote: 'Energy flows where attention goes—ignite your metabolic engine with every conscious stand.',
  },
  {
    title: 'Diaphragmatic Parasympathetic Reset',
    tip: 'Intense training sessions and fast-paced cinematic media elevate cortisol. Controlled box breathing switches your autonomic nervous system into optimal cellular recovery mode.',
    category: 'Active Recovery',
    actionableStep: 'Sit upright, breathe in through your nose for 4 seconds, hold for 4 seconds, exhale smoothly for 4 seconds, and pause empty for 4 seconds. Repeat 4 cycles.',
    estimatedTime: '3 min',
    intensityLevel: 'Low',
    aiQuote: 'Rest is not the absence of progress; it is the foundation upon which endurance is forged.',
  },
  {
    title: 'Commercial Break Isometric Plank Challenge',
    tip: 'Isometric core stability protects your lumbar spine and enhances balance during both high-energy HIIT workouts and everyday movements.',
    category: 'Core & Spine',
    actionableStep: 'Drop to the rug for a steady 45-second forearm plank. Focus on bracing your abs and keeping your pelvis neutral.',
    estimatedTime: '2 min',
    intensityLevel: 'High',
    aiQuote: 'A resilient core anchors every athletic endeavor and daily movement.',
  },
  {
    title: 'Soleus Muscle Pump for Desk & Couch Time',
    tip: 'The soleus muscle in the calf has a unique metabolic oxidative capacity. Activating it while seated helps clear blood sugar and prevents venous pooling.',
    category: 'Vascular Health',
    actionableStep: 'While seated, keep toes on the ground and raise your heels as high as possible, then drop. Repeat for 30 rhythmic calf raises.',
    estimatedTime: '2 min',
    intensityLevel: 'Low',
    aiQuote: 'Even seated stillness can be transformed into a catalyst for vital blood flow.',
  },
];

async function generateDailyMotivation(reqBody: any) {
  const { date, userRole, recentWorkoutIntensity, forceRefresh } = reqBody || {};
  const todayStr = date || new Date().toISOString().slice(0, 10);

  if (ai) {
    try {
      const prompt = `You are the AI Fitness & Wellness Coach on Vega OS / Amazon Fire TV Living Room Hub.
Generate an inspiring, short, actionable daily fitness tip for a living room TV user.
Context:
- Today's Date: ${todayStr}
- User Profile: ${userRole || 'Active Living Room Member'}
- Recent 7-Day Workout Intensity: ${recentWorkoutIntensity || '76% (Aerobic & Threshold)'}
${forceRefresh ? '- Note: User explicitly requested a fresh, distinct motivation tip. Provide a different dynamic variation.' : ''}

Requirements:
- Short, punchy, actionable advice tailored for living room activity, posture, movement snacks, hydration, or recovery.
- Must be realistic to do at home (e.g. bodyweight movements, mobility drills, breathing, hydration).
- Format strictly as valid JSON with the following keys:
  - "title": string (3-6 words, catchy and inspiring, e.g. "The 60-Second Posture Reset")
  - "tip": string (2-3 concise, impactful sentences explaining why this matters today)
  - "category": string (e.g. "Quick Mobility", "Metabolic Spark", "Core & Spine", "Active Recovery", "Micro-Workouts")
  - "actionableStep": string (1-2 sentences with a clear, immediate action the user can do right now before streaming or during their break)
  - "estimatedTime": string (e.g. "2 min", "3 min", "5 min")
  - "intensityLevel": string ("Low" | "Medium" | "High")
  - "aiQuote": string (one short motivational quote or mantra)`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        3500
      );

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          date: todayStr,
          isAiGenerated: true,
        };
      }
    } catch (err: any) {
      console.warn('Gemini daily motivation fallback triggered:', err?.message || err);
    }
  }

  // Curated deterministic fallback based on day of year/date hash
  const dayNum = new Date(todayStr).getDate() || 1;
  const index = (dayNum + (forceRefresh ? Math.floor(Math.random() * 3) + 1 : 0)) % fallbackDailyMotivationTips.length;
  const selectedFallback = fallbackDailyMotivationTips[index];

  return {
    ...selectedFallback,
    date: todayStr,
    isAiGenerated: false,
  };
}

// AI Daily Motivation Fitness Tip Endpoints
app.get('/api/ai/daily-motivation', async (req, res) => {
  const result = await generateDailyMotivation(req.query);
  res.json(result);
});

app.post('/api/ai/daily-motivation', async (req, res) => {
  const result = await generateDailyMotivation(req.body);
  res.json(result);
});

// Alexa-style Voice Command Intent Parser
app.post('/api/ai/voice-intent', async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const cleanCmd = String(command).toLowerCase();

  // Fast-path client rule matching for instant zero-latency feedback
  let action = 'unknown';
  let target = '';
  let speechResponse = `Executing command: ${command}`;

  if (cleanCmd.includes('sport') || cleanCmd.includes('football') || cleanCmd.includes('match') || cleanCmd.includes('game') || cleanCmd.includes('champions')) {
    action = 'navigate_tab';
    target = 'sports';
    speechResponse = 'Switching to Live Sports with tactical computer vision.';
  } else if (cleanCmd.includes('movie') || cleanCmd.includes('film') || cleanCmd.includes('cinema') || cleanCmd.includes('watch')) {
    action = 'navigate_tab';
    target = 'movies';
    speechResponse = 'Opening 4K Cinema Hub with Smart X-Ray.';
  } else if (cleanCmd.includes('fit') || cleanCmd.includes('workout') || cleanCmd.includes('exercise') || cleanCmd.includes('gym')) {
    action = 'navigate_tab';
    target = 'fitness';
    speechResponse = 'Starting AI Fitness Coach with real-time pose tracking.';
  } else if (cleanCmd.includes('contrast') || cleanCmd.includes('high contrast') || cleanCmd.includes('accessibility')) {
    action = 'toggle_high_contrast';
    speechResponse = 'High contrast accessibility mode toggled.';
  } else if (cleanCmd.includes('heatmap') || cleanCmd.includes('tactical') || cleanCmd.includes('overlay') || cleanCmd.includes('stats')) {
    action = 'toggle_tactical_hud';
    speechResponse = 'Tactical computer vision HUD toggled.';
  } else if (cleanCmd.includes('x-ray') || cleanCmd.includes('xray') || cleanCmd.includes('who is') || cleanCmd.includes('trivia') || cleanCmd.includes('cast')) {
    action = 'toggle_xray';
    speechResponse = 'Opening Smart X-Ray scene breakdown.';
  } else if (cleanCmd.includes('play') || cleanCmd.includes('pause') || cleanCmd.includes('resume')) {
    action = 'toggle_playback';
    speechResponse = 'Playback toggled.';
  } else if (cleanCmd.includes('home')) {
    action = 'navigate_tab';
    target = 'home';
    speechResponse = 'Navigating to Home.';
  } else if (cleanCmd.includes('setting') || cleanCmd.includes('remote') || cleanCmd.includes('accessibility settings')) {
    action = 'navigate_tab';
    target = 'settings';
    speechResponse = 'Opening Vega Settings and Accessibility Controls.';
  } else if (ai) {
    // Advanced parsing with Gemini if ambiguous
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Alexa voice command engine on Fire TV / Vega OS.
User spoken command: "${command}"
Map this to one of:
- action: "navigate_tab" (target: "home" | "sports" | "movies" | "fitness" | "settings")
- action: "toggle_playback"
- action: "toggle_tactical_hud"
- action: "toggle_xray"
- action: "toggle_high_contrast"
- action: "search" (target: search query)
- action: "speak_info"
Return strict JSON: { "action": string, "target": string, "speechResponse": string }`,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.action) {
        return res.json(parsed);
      }
    } catch {
      // Fallback
    }
  }

  return res.json({ action, target, speechResponse });
});

// Cloud Sync Store Endpoints
app.post('/api/sync', (req, res) => {
  const { profileId = 'default_profile', data } = req.body;
  if (!cloudSyncStore[profileId]) {
    cloudSyncStore[profileId] = {};
  }
  cloudSyncStore[profileId] = {
    ...cloudSyncStore[profileId],
    ...data,
    lastSynced: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: 'Profile synchronized with Vega Cloud Storage',
    lastSynced: cloudSyncStore[profileId].lastSynced,
  });
});

app.get('/api/sync/:profileId', (req, res) => {
  const profile = cloudSyncStore[req.params.profileId] || cloudSyncStore['default_profile'];
  res.json(profile);
});

// Mount Vite middleware for dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vega OS / Fire TV Living Room Server running at http://localhost:${PORT}`);
  });
}

startServer();
