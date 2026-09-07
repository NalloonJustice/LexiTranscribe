import React, { useState } from "react";
import { 
  Settings, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Check, 
  Sparkles,
  Server
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [geminiModel, setGeminiModel] = useState("gemini-3.1-pro-preview");
  const [transcribeModel, setTranscribeModel] = useState("gemini-3.5-transcribe");
  const [liveVoiceModel, setLiveVoiceModel] = useState("gemini-3.1-flash-live-preview");
  const [veoModel, setVeoModel] = useState("veo-3.1-fast-generate-preview");
  const [diarizationSensitivity, setDiarizationSensitivity] = useState(85);
  const [highThinkingDefault, setHighThinkingDefault] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id="settings-container" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Workspace Settings & Model Engines</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default intelligence endpoints, diarization thresholds, and Firebase sync
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#020617] font-semibold text-xs hover:bg-sky-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/10"
        >
          {saved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Sparkles className="w-4 h-4" />}
          <span>{saved ? "Saved!" : "Save Settings"}</span>
        </button>
      </div>

      {/* Model Engine Assignment */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#38bdf8]" />
          <span>Active Gemini Neural Configurations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#020617] p-4 rounded-xl border border-[#1e293b]">
            <label className="block text-slate-400 font-medium mb-1">Video Intelligence & Complex Logic</label>
            <div className="font-mono text-[#38bdf8] font-bold">gemini-3.1-pro-preview</div>
            <span className="text-[10px] text-slate-500">Supports ThinkingLevel.HIGH for deep decomposition</span>
          </div>

          <div className="bg-[#020617] p-4 rounded-xl border border-[#1e293b]">
            <label className="block text-slate-400 font-medium mb-1">Audio Transcription</label>
            <div className="font-mono text-emerald-400 font-bold">gemini-3.5-transcribe</div>
            <span className="text-[10px] text-slate-500">Acoustic frame alignment & speaker identification</span>
          </div>

          <div className="bg-[#020617] p-4 rounded-xl border border-[#1e293b]">
            <label className="block text-slate-400 font-medium mb-1">Live Voice Conversation</label>
            <div className="font-mono text-[#38bdf8] font-bold">gemini-3.1-flash-live-preview</div>
            <span className="text-[10px] text-slate-500">Real-time bi-directional live audio stream</span>
          </div>

          <div className="bg-[#020617] p-4 rounded-xl border border-[#1e293b]">
            <label className="block text-slate-400 font-medium mb-1">Video Generation from Text</label>
            <div className="font-mono text-sky-400 font-bold">veo-3.1-fast-generate-preview</div>
            <span className="text-[10px] text-slate-500">Supports 16:9 widescreen and 9:16 portrait</span>
          </div>
        </div>
      </div>

      {/* Acoustic & Diarization Preferences */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#38bdf8]" />
          <span>Acoustic Diarization Sensitivity</span>
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>Clustering Confidence Threshold</span>
            <span className="text-[#38bdf8] font-bold">{diarizationSensitivity}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={99}
            value={diarizationSensitivity}
            onChange={(e) => setDiarizationSensitivity(Number(e.target.value))}
            className="w-full accent-[#38bdf8] cursor-pointer"
          />
        </div>
      </div>

      {/* Cloud Persistence Status */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Firebase Firestore & Auth Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block mb-1">Status</span>
            <span className="text-emerald-400 font-bold font-mono">ONLINE & PERSISTENT</span>
          </div>
          <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block mb-1">Database ID</span>
            <span className="text-slate-200 font-mono text-[10px] truncate block">ai-studio-lexitranscribe</span>
          </div>
          <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block mb-1">Security</span>
            <span className="text-[#38bdf8] font-mono text-[10px]">Per-User RBAC Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
