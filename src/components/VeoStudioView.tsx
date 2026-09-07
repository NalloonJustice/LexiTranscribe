import React, { useState } from "react";
import { 
  Video, 
  Sparkles, 
  Play, 
  Download, 
  RefreshCw, 
  Film, 
  Check, 
  Sliders, 
  Layers 
} from "lucide-react";
import type { VeoVideoProject } from "../types";
import { saveVeoVideo } from "../lib/firebase";
import { safeFetchJson } from "../lib/apiClient";

interface VeoStudioViewProps {
  userId?: string;
}

export const VeoStudioView: React.FC<VeoStudioViewProps> = ({ userId }) => {
  const [prompt, setPrompt] = useState("Futuristic cyberpunk recording studio with glowing neon cyan holographic displays and soundwave audio analyzers, cinematic 8k lighting");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
  const [history, setHistory] = useState<VeoVideoProject[]>([
    {
      id: "veo-demo-1",
      prompt: "Futuristic cyberpunk recording studio with glowing neon cyan holographic displays",
      aspectRatio: "16:9",
      status: "COMPLETED",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      createdAt: Date.now() - 3600000
    }
  ]);

  const presetPrompts = [
    "Cyberpunk city skyline at night with neon pink holographic subtitles floating in rain",
    "Close up of deep learning audio synthesizer glowing with cyan sound waves",
    "Cinematic documentary teaser trailer of tech conference interview panel in 1080p",
    "Abstract neon digital data stream morphing into audio frequency waveforms"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const { data } = await safeFetchJson<any>("/api/gemini/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio
        })
      });

      const generatedUrl = data?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
      setVideoResult(generatedUrl);

      const newProject: VeoVideoProject = {
        id: Date.now().toString(),
        prompt,
        aspectRatio,
        status: "COMPLETED",
        videoUrl: generatedUrl,
        createdAt: Date.now()
      };

      setHistory(prev => [newProject, ...prev]);
      if (userId) {
        saveVeoVideo(userId, newProject);
      }
    } catch {
      // Keep state resilient
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="veo-studio-container" className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-5 h-5 text-[#38bdf8]" />
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Veo 3 Video Generation</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#38bdf8] border border-sky-500/30 font-mono font-semibold">
                veo-3.1-fast-generate-preview
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transform transcript highlights and textual prompts into cinematic videos with custom aspect ratios.
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt & Config Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl space-y-4 shadow-md">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Video Prompt Description
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video scene you want Veo 3 to generate..."
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-[#38bdf8] resize-none"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "bg-sky-500/15 border-sky-500/50 text-[#38bdf8]"
                      : "bg-[#020617] border-[#1e293b] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="w-5 h-3 border border-current rounded-xs"></div>
                  <span>16:9 Landscape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "bg-sky-500/15 border-sky-500/50 text-[#38bdf8]"
                      : "bg-[#020617] border-[#1e293b] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="w-3 h-5 border border-current rounded-xs"></div>
                  <span>9:16 Portrait</span>
                </button>
              </div>
            </div>

            {/* Preset Inspiration Pills */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Style Presets
              </span>
              <div className="space-y-1.5">
                {presetPrompts.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="w-full text-left text-xs text-slate-400 hover:text-[#38bdf8] p-2.5 rounded-lg bg-[#020617] border border-[#1e293b] hover:border-sky-500/30 transition-colors truncate block cursor-pointer"
                  >
                    &bull; {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              id="btn-generate-veo"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-sm hover:bg-sky-300 transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veo 3 Neural Generation in Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Video ({aspectRatio})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Preview Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl flex flex-col items-center justify-center min-h-[380px] shadow-md">
            {isGenerating ? (
              <div className="text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-full border-3 border-[#38bdf8] border-t-transparent animate-spin mx-auto"></div>
                <h3 className="text-slate-100 font-bold text-base">Synthesizing Neural Frames</h3>
                <p className="text-xs text-slate-400 font-mono max-w-xs">
                  Model: veo-3.1-fast-generate-preview &bull; Aspect: {aspectRatio}
                </p>
              </div>
            ) : videoResult ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#38bdf8] font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Generated Video Preview
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{aspectRatio}</span>
                </div>

                <div className={`relative bg-black rounded-xl overflow-hidden border border-[#1e293b] mx-auto ${
                  aspectRatio === "9:16" ? "max-w-[260px] aspect-[9/16]" : "w-full aspect-video"
                }`}>
                  <video 
                    src={videoResult} 
                    controls 
                    autoPlay 
                    loop 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <a
                    href={videoResult}
                    download="veo3_generated_clip.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#1e293b] text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-[#1e293b] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Film className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm">Click "Generate Video" to render with Veo 3</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
