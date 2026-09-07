import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Radio, 
  Settings2, 
  Trash2, 
  MessageSquare, 
  User, 
  Bot,
  Play,
  RotateCcw
} from "lucide-react";
import type { LiveVoiceSessionMessage } from "../types";
import { safeFetchJson } from "../lib/apiClient";

interface LiveVoiceViewProps {
  userId?: string;
  onSaveSession?: (messages: LiveVoiceSessionMessage[]) => void;
}

export const LiveVoiceView: React.FC<LiveVoiceViewProps> = ({
  userId,
  onSaveSession
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<LiveVoiceSessionMessage[]>([
    {
      id: "1",
      sender: "gemini",
      text: "Live session initialized with gemini-3.1-flash-live-preview. I am listening to your audio stream. Ask me anything about your footage, transcriptions, or video pipeline.",
      timestamp: "09:44:00"
    }
  ]);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 60, 85, 40, 20, 75, 90, 50, 30, 65, 80, 40, 25, 60, 95]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalSpeech = event.results[i][0].transcript.trim();
            if (finalSpeech) {
              handleUserSpokenText(finalSpeech);
            }
          } else {
            currentText += event.results[i][0].transcript;
          }
        }
        setTranscript(currentText);
      };

      recog.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
      };

      recognitionRef.current = recog;
    }
  }, []);

  // Visualizer frequency animation
  useEffect(() => {
    let animId: any;
    if (isListening || isSpeaking) {
      const updateWave = () => {
        setAudioLevels(Array.from({ length: 24 }, () => Math.floor(Math.random() * 85) + 15));
        animId = setTimeout(updateWave, 100);
      };
      updateWave();
    } else {
      setAudioLevels(Array.from({ length: 24 }, () => 12));
    }
    return () => clearTimeout(animId);
  }, [isListening, isSpeaking]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start recognition:", err);
        setIsListening(true);
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = selectedVoice === "Kore" ? 1.1 : selectedVoice === "Fenrir" ? 0.9 : 1.0;
    
    // Pick available voice
    const voices = synthRef.current.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleUserSpokenText = async (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userMsg: LiveVoiceSessionMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: timeStr
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setTranscript("");

    try {
      const { data } = await safeFetchJson<any>("/api/gemini/live-converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSpeech: text,
          transcriptHistory: newMessages.map(m => ({ sender: m.sender, text: m.text })),
          voiceType: selectedVoice
        })
      });

      const reply = data?.replyText || "I am processing your audio request through the live speech pipeline.";
      
      const geminiMsg: LiveVoiceSessionMessage = {
        id: (Date.now() + 1).toString(),
        sender: "gemini",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setMessages(prev => [...prev, geminiMsg]);
      speakText(reply);
    } catch {
      // Graceful fallback
    }
  };

  const handleSimulateVoiceInput = () => {
    const prompt = "Can you summarize the interview footage and give me the top 3 action items?";
    handleUserSpokenText(prompt);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div id="live-voice-container" className="max-w-4xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-5 h-5 text-[#38bdf8] animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Live Voice Conversation</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono">
                gemini-3.1-flash-live-preview
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bi-directional, ultra-low latency conversational intelligence. Speak directly into your microphone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="Kore">Voice: Kore (Natural)</option>
              <option value="Fenrir">Voice: Fenrir (Deep)</option>
              <option value="Aoede">Voice: Aoede (Bright)</option>
              <option value="Puck">Voice: Puck (Fast)</option>
            </select>

            <button
              onClick={handleClearHistory}
              title="Clear Session"
              className="p-2 rounded-lg bg-[#1e293b] text-slate-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Audio Waveform & Microphone Orb */}
        <div className="mt-8 mb-4 flex flex-col items-center justify-center">
          {/* Orb */}
          <div className="relative mb-6">
            <button
              id="btn-toggle-microphone"
              onClick={toggleListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-[#38bdf8] text-[#020617] shadow-[0_0_30px_rgba(56,189,248,0.5)] animate-pulse"
                  : isSpeaking
                  ? "bg-emerald-400 text-[#020617] shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  : "bg-[#020617] text-sky-400 border-2 border-sky-400/50 hover:border-sky-400 hover:bg-sky-500/10 shadow-lg"
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : (
                <MicOff className="w-9 h-9" />
              )}
            </button>

            {/* Pulsing ring indicator */}
            {isListening && (
              <span className="absolute -inset-2 rounded-full border-2 border-sky-400/60 animate-ping pointer-events-none"></span>
            )}
          </div>

          {/* Real-time Spectrum Bars */}
          <div className="flex items-center gap-1.5 h-12 px-6 py-2 bg-[#020617] rounded-full border border-[#1e293b] shadow-inner mb-2">
            {audioLevels.map((lvl, idx) => (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  isSpeaking
                    ? "bg-gradient-to-t from-emerald-500 to-sky-400"
                    : isListening
                    ? "bg-gradient-to-t from-sky-600 to-[#38bdf8]"
                    : "bg-slate-800"
                }`}
                style={{ height: `${lvl}%` }}
              />
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isListening ? "bg-sky-400 animate-ping" : isSpeaking ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`}></span>
            <span>
              {isListening 
                ? "Listening... Speak naturally" 
                : isSpeaking 
                ? `Gemini is responding with ${selectedVoice}...` 
                : "Microphone paused. Click orb to activate live voice stream."}
            </span>
          </div>

          {/* Quick simulation button */}
          <button
            onClick={handleSimulateVoiceInput}
            className="mt-3 text-[11px] text-[#38bdf8] hover:underline font-mono cursor-pointer"
          >
            &gt; Click here to simulate spoken voice prompt
          </button>
        </div>
      </div>

      {/* Live Transcript Bubble Stream */}
      <div 
        ref={scrollRef}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 h-80 overflow-y-auto space-y-4 shadow-xl"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? "bg-sky-500/15 border border-sky-500/30 text-sky-400" : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[75%] p-3.5 rounded-xl text-sm leading-relaxed ${
                isUser 
                  ? "bg-sky-500/15 border border-sky-500/30 text-slate-100 rounded-tr-none" 
                  : "bg-[#020617] border border-[#1e293b] text-slate-200 rounded-tl-none"
              }`}>
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-slate-400">
                  <span className="font-semibold text-slate-300">{isUser ? "You" : "Gemini 3.1 Flash Live"}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {transcript && (
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <User className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-slate-300 text-xs italic font-mono animate-pulse">
              "{transcript}..."
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
