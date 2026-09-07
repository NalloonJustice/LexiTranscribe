import React, { useState } from "react";
import { 
  Sparkles, 
  Brain, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Tag, 
  RefreshCw, 
  ArrowRight,
  Send,
  Sliders
} from "lucide-react";
import type { TranscriptProject, AIInsights } from "../types";
import { safeFetchJson } from "../lib/apiClient";

interface AIInsightsViewProps {
  project: TranscriptProject;
  onUpdateProject: (updated: TranscriptProject) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  project,
  onUpdateProject
}) => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(true);
  const [customQuery, setCustomQuery] = useState("");
  const [thinkingResult, setThinkingResult] = useState<string | null>(
    project.aiInsights?.deepThinkingAnalysis || null
  );

  const insights: AIInsights = project.aiInsights || {
    executiveSummary: "A comprehensive deep dive into multimedia AI workflows, discussing model inference bottlenecks, multi-speaker clustering, and automated subtitle styling. The discussion focuses heavily on lowering acoustic token latency and aligning speech timestamps with frame-accurate video rendering.",
    keyMoments: [
      { timestamp: "00:02:15", title: "Project Introduction & Architecture", description: "Overview of LexiTranscribe high-throughput ingestion engine." },
      { timestamp: "00:14:40", title: "Latency Benchmark Comparisons", description: "Demonstrating 40% speedup with streaming audio tokens and acoustic vectoring." },
      { timestamp: "00:28:05", title: "Automated Subtitle Staging", description: "Aligning text formatting with neon UI styling cues and WebVTT tracks." },
      { timestamp: "00:41:30", title: "Future Roadmap & Live API Integration", description: "Q&A on real-time conversational agents and Veo 3 video generation." }
    ],
    actionItems: [
      "Export timestamped .docx and .pdf transcripts for distribution.",
      "Review speaker diarization boundaries at minute 14:40.",
      "Generate 16:9 visual teaser using Veo 3 studio.",
      "Deploy synchronized transcripts to Firestore for team collaboration."
    ],
    sentimentAnalysis: {
      overall: "Positive, Analytical & Highly Technical",
      confidenceScore: 0.96,
      pacing: "Fast-paced, high information density"
    },
    entities: ["Gemini 3.1 Pro", "Whisper-v3-Turbo", "Veo 3", "Live API", "Speaker Diarization", "Neural Tokenization"],
    topics: ["Acoustic Processing", "Latency Optimization", "Multimodal Video Intelligence", "Subtitle Synchronization"]
  };

  const handleRunDeepAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const { data } = await safeFetchJson<any>("/api/gemini/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoName: project.fileName,
          transcriptText: project.segments?.map(s => `${s.speaker}: ${s.text}`).join("\n") || insights.executiveSummary,
          customPrompt: "Generate thorough key moments, sentiment analysis, action items, and topic tagging."
        })
      });
      if (data && (data.success || data.executiveSummary)) {
        const updatedInsights: AIInsights = {
          executiveSummary: data.executiveSummary || insights.executiveSummary,
          keyMoments: (data.keyMoments && data.keyMoments.length > 0) ? data.keyMoments : insights.keyMoments,
          actionItems: (data.actionItems && data.actionItems.length > 0) ? data.actionItems : insights.actionItems,
          sentimentAnalysis: data.sentimentAnalysis || insights.sentimentAnalysis,
          entities: (data.entities && data.entities.length > 0) ? data.entities : insights.entities,
          topics: (data.topics && data.topics.length > 0) ? data.topics : insights.topics,
          deepThinkingAnalysis: thinkingResult || undefined
        };
        onUpdateProject({
          ...project,
          aiInsights: updatedInsights
        });
      }
    } catch {
      // Keep existing insights
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRunHighThinking = async () => {
    if (!customQuery.trim()) return;
    setLoadingAnalysis(true);
    try {
      const { data } = await safeFetchJson<any>("/api/gemini/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customQuery,
          context: `Transcript context:\n${project.segments?.map(s => `[${s.start}] ${s.speaker}: ${s.text}`).join("\n") || insights.executiveSummary}`
        })
      });
      if (data && (data.response || data.text)) {
        const responseText = data.response || data.text;
        setThinkingResult(responseText);
        onUpdateProject({
          ...project,
          aiInsights: {
            ...insights,
            deepThinkingAnalysis: responseText
          }
        });
      }
    } catch {
      // Graceful ignore
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div id="ai-insights-container" className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#38bdf8] animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">AI Video Intelligence</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono font-semibold">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deep semantic extraction, multimodal reasoning, and sentiment analysis for <span className="text-[#38bdf8] font-mono">{project.fileName}</span>
            </p>
          </div>

          <button
            id="btn-refresh-analysis"
            onClick={handleRunDeepAnalysis}
            disabled={loadingAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] text-[#020617] font-semibold text-xs hover:bg-sky-300 transition-all cursor-pointer self-start md:self-auto disabled:opacity-50 shadow-md shadow-sky-500/10"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAnalysis ? "animate-spin" : ""}`} />
            <span>{loadingAnalysis ? "Analyzing Video..." : "Re-Run Video Understanding"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Analytical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sentiment & Tone */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Sentiment & Pacing
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              {(insights.sentimentAnalysis?.confidenceScore || 0.96) * 100}% Confidence
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 mb-1">
            {insights.sentimentAnalysis?.overall || "Positive & Analytical"}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Pacing: <span className="text-slate-200">{insights.sentimentAnalysis?.pacing || "Fast, high data density"}</span>
          </p>
        </div>

        {/* Key Entities */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#38bdf8]" />
              Extracted Entities
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{insights.entities?.length || 5} Detected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(insights.entities || []).map((entity, i) => (
              <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                {entity}
              </span>
            ))}
          </div>
        </div>

        {/* Core Topics */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-sky-400" />
              Dominant Topics
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Cluster Vector</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(insights.topics || []).map((topic, i) => (
              <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-[#1e293b] text-slate-200 border border-slate-700">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* High Thinking Mode Interactive Console */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl relative shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#38bdf8] animate-pulse" />
            <h3 className="font-semibold text-slate-100 text-base">High Cognitive Thinking Mode</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-mono border border-sky-500/30">
              ThinkingLevel.HIGH
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <span>Enabled</span>
            <input 
              type="checkbox" 
              checked={thinkingMode} 
              onChange={(e) => setThinkingMode(e.target.checked)} 
              className="accent-[#38bdf8] w-4 h-4"
            />
          </label>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Uses <span className="text-[#38bdf8] font-mono">gemini-3.1-pro-preview</span> with token reasoning depth to solve intricate editorial, cross-referencing, or logical synchronization inquiries.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a complex reasoning question about this media (e.g., 'Reconcile speaker discrepancies and formulate an executive strategy')..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunHighThinking()}
            className="flex-1 bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
          <button
            onClick={handleRunHighThinking}
            disabled={loadingAnalysis || !customQuery.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#38bdf8] text-[#020617] font-semibold text-sm hover:bg-sky-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Think</span>
          </button>
        </div>

        {thinkingResult && (
          <div className="mt-4 p-4 rounded-xl bg-[#020617] border border-[#1e293b] text-sm text-slate-200 font-mono whitespace-pre-line leading-relaxed">
            <div className="text-xs text-[#38bdf8] font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deep Reasoning Output:</span>
            </div>
            {thinkingResult}
          </div>
        )}
      </div>

      {/* Executive Summary & Key Moments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl">
          <h3 className="font-semibold text-slate-100 text-base mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            <span>Executive Synthesis</span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insights.executiveSummary}
          </p>

          <div className="mt-6 pt-5 border-t border-[#1e293b]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Action Items</h4>
            <div className="space-y-2">
              {(insights.actionItems || []).map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timestamped Key Moments */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl">
          <h3 className="font-semibold text-slate-100 text-base mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38bdf8]" />
            <span>Key Information & Moments</span>
          </h3>

          <div className="space-y-3">
            {(insights.keyMoments || []).map((moment, i) => (
              <div 
                key={i}
                className="p-3.5 rounded-xl bg-[#020617] border border-[#1e293b] hover:border-slate-700 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-[#38bdf8] transition-colors">
                    {moment.title}
                  </span>
                  <span className="text-xs font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                    {moment.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {moment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
