import React, { useState, useEffect } from 'react';
import { Mic, X, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { audioFeedback } from '../utils/audioFeedback';
import { TVLogger } from '../utils/offlineStorage';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (action: string, target?: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [responseSpeech, setResponseSpeech] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      audioFeedback.playAlexaEarcon();
      setTranscript('');
      setResponseSpeech(null);
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
  }, [isOpen]);

  const startSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err: any) {
        setIsListening(false);
      }
    }
  };

  const stopSpeechRecognition = () => {
    setIsListening(false);
  };

  const handleProcessCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    setIsProcessing(true);
    audioFeedback.playNavClick();
    TVLogger.log('INFO', 'AUDIO', `Processing Alexa Voice command: "${cmdText}"`);

    try {
      const res = await fetch('/api/ai/voice-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdText }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponseSpeech(data.speechResponse);
        audioFeedback.announceTTS(data.speechResponse);

        setTimeout(() => {
          onExecuteCommand(data.action, data.target);
          onClose();
        }, 1200);
      }
    } catch {
      onExecuteCommand('unknown');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleCommands = [
    'Switch to Live Sports',
    'Turn on tactical heatmap',
    'Open 4K Cinema Hub',
    'Start AI Fitness workout',
    'Enable high contrast mode',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alexa Cyan Visualizer Ring */}
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-xl shadow-cyan-400/40 flex items-center justify-center">
            <Mic className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Alexa Voice Navigation</h3>
        <p className="text-xs text-cyan-300 font-mono mb-4">
          {isListening ? 'Listening for living room command...' : 'Speak into remote microphone or choose sample below'}
        </p>

        {/* Live Transcript Box */}
        <div className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 mb-4 min-h-[56px] flex items-center justify-center text-sm font-medium text-white">
          {transcript ? (
            <span>&quot;{transcript}&quot;</span>
          ) : (
            <span className="text-zinc-500 text-xs italic">
              Say &quot;Open Sports&quot;, &quot;Toggle High Contrast&quot;, or &quot;Show Tactical HUD&quot;...
            </span>
          )}
        </div>

        {/* Spoken Response Feedback */}
        {responseSpeech && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl text-xs text-cyan-300 mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{responseSpeech}</span>
          </div>
        )}

        {/* Custom Input / Submit */}
        <div className="w-full flex gap-2 mb-6">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleProcessCommand(transcript);
            }}
            placeholder="Type voice query or choose below..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleProcessCommand(transcript)}
            disabled={!transcript || isProcessing}
            className="px-4 py-2 bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl hover:bg-cyan-300 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Thinking...' : 'Execute'}
          </button>
        </div>

        {/* Quick Sample Voice Command Pills */}
        <div className="w-full text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
            Suggested Remote Commands:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(cmd);
                  handleProcessCommand(cmd);
                }}
                className="text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-cyan-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition-all"
              >
                &quot;{cmd}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
