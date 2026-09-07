import React, { useState, useEffect } from "react";
import { 
  Film, 
  Check, 
  Music, 
  Captions, 
  FileCode, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Zap,
  Bot
} from "lucide-react";
import type { TranscriptProject, ProcessingStep } from "../types";

interface ProcessingSequenceViewProps {
  project: TranscriptProject;
  onCancel: () => void;
  onViewResults: () => void;
  onAnalyzeWithGemini: () => void;
}

export const ProcessingSequenceView: React.FC<ProcessingSequenceViewProps> = ({
  project,
  onCancel,
  onViewResults,
  onAnalyzeWithGemini
}) => {
  const [currentProgress, setCurrentProgress] = useState(project.progress || 67);
  const [activeStep, setActiveStep] = useState<ProcessingStep>(project.currentStep || "transcribing");
  const [terminalLogs, setTerminalLogs] = useState<string[]>(
    project.terminalLogs || [
      "> Initiating audio stream analysis...",
      "> Silence detection complete. Found 14 segments.",
      "> Speaker diarization running...",
      "> [Speaker 0] detected at 00:00:12",
      "> Transcribing segment block 0x4A..."
    ]
  );
  const [estTime, setEstTime] = useState("02:14");

  // Dynamic simulation timer if the project is actively processing
  useEffect(() => {
    if (project.status !== "processing") return;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          setActiveStep("completed");
          return 100;
        }
        const next = prev + 1;
        
        if (next === 75) {
          setTerminalLogs((logs) => [
            ...logs,
            "> [Speaker 1] acoustic vector registered at 00:15:30",
            "> Neural token beam search: probability 0.994"
          ]);
          setEstTime("01:28");
        } else if (next === 90) {
          setActiveStep("formatting");
          setTerminalLogs((logs) => [
            ...logs,
            "> Formatting Word (.docx) & PDF (.pdf) documents with diarization...",
            "> Generating executive summary and action items..."
          ]);
          setEstTime("00:25");
        } else if (next >= 100) {
          setActiveStep("completed");
          setTerminalLogs((logs) => [
            ...logs,
            "> Processing complete. Transcript ready for inspection & AI analysis."
          ]);
          setEstTime("00:00");
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [project.status]);

  const sessionId = project.sessionHexId || "0x7F8B9A2";
  const fileName = project.fileName || "interview_raw_footage.mp4";
  const fileSize = project.fileSize || "1.2 GB";
  const duration = project.duration || "45:20";
  const format = project.format || "1080p";
  const modelName = project.model || "Whisper-v3-Turbo / Gemini 3.5";

  return (
    <div 
      id="processing-sequence-container"
      className="max-w-4xl mx-auto mt-4 relative"
    >
      {/* Background Ambient Blurs */}
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-slate-800/40 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Section */}
      <div id="processing-header" className="mb-8 text-center relative z-10">
        <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
          Processing Sequence
        </h2>
        <p className="text-[#38bdf8] font-mono text-xs tracking-wider font-semibold">
          SESSION ID: {sessionId}
        </p>
      </div>

      {/* Console Card */}
      <div 
        id="processing-console-card"
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Video Meta Info */}
        <div 
          id="video-meta-info"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10 pb-5 sm:pb-6 border-b border-[#1e293b] relative z-10"
        >
          <div className="w-20 h-14 sm:w-24 sm:h-16 bg-[#020617] rounded-lg flex items-center justify-center border border-[#1e293b] shadow-inner shrink-0">
            <Film className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight truncate">{fileName}</h3>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-1.5 text-xs text-slate-400 font-mono">
              <span>SIZE: {fileSize}</span>
              <span className="text-slate-700 hidden xs:inline">|</span>
              <span>DUR: {duration}</span>
              <span className="text-slate-700 hidden xs:inline">|</span>
              <span>FMT: {format}</span>
            </div>
          </div>
        </div>

        {/* Stepper Pipeline */}
        <div id="stepper-pipeline" className="grid grid-cols-4 relative mb-8 sm:mb-12 z-10 px-1 sm:px-4">
          {/* Base Inactive Line */}
          <div className="absolute top-5 sm:top-6 left-8 right-8 sm:left-16 sm:right-16 h-0.5 bg-[#1e293b] z-0"></div>
          
          {/* Active Progress Gradient Line */}
          <div 
            className="absolute top-5 sm:top-6 left-8 sm:left-16 h-0.5 bg-gradient-to-r from-sky-500 via-sky-400 to-[#38bdf8] z-0 transition-all duration-700 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
            style={{ 
              width: currentProgress >= 100 
                ? "calc(100% - 64px)" 
                : activeStep === "formatting" 
                ? "calc(75% - 40px)" 
                : "calc(50% - 20px)" 
            }}
          ></div>

          {/* Step 1: Validating (Completed) */}
          <div id="step-validating" className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#020617] border-2 border-[#38bdf8] flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#38bdf8] stroke-[2.5]" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-[#38bdf8] uppercase tracking-wider text-center">
              Validating
            </span>
          </div>

          {/* Step 2: Extracting (Completed) */}
          <div id="step-extracting" className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#020617] border-2 border-[#38bdf8] flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#38bdf8] stroke-[2.5]" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-[#38bdf8] uppercase tracking-wider text-center">
              Extracting
            </span>
          </div>

          {/* Step 3: Transcribing (Active) */}
          <div id="step-transcribing" className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-all ${
              currentProgress >= 90 
                ? "bg-[#020617] border-2 border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.2)]" 
                : "bg-sky-500/15 border-2 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse"
            }`}>
              {currentProgress >= 90 ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#38bdf8] stroke-[2.5]" />
              ) : (
                <Captions className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300 stroke-[2.5]" />
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center ${
              currentProgress >= 90 
                ? "text-[#38bdf8]" 
                : "text-sky-300"
            }`}>
              Transcribing
            </span>
          </div>

          {/* Step 4: Formatting (Pending / Active) */}
          <div 
            id="step-formatting" 
            className={`flex flex-col items-center relative z-10 transition-opacity ${
              activeStep === "formatting" || activeStep === "completed" ? "opacity-100" : "opacity-50"
            }`}
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-all ${
              activeStep === "completed" 
                ? "bg-[#020617] border-2 border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.2)]" 
                : activeStep === "formatting"
                ? "bg-sky-500/15 border-2 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse"
                : "bg-[#020617] border-2 border-slate-700"
            }`}>
              {activeStep === "completed" ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#38bdf8] stroke-[2.5]" />
              ) : (
                <FileCode className={`w-4 h-4 sm:w-5 sm:h-5 ${activeStep === "formatting" ? "text-sky-300" : "text-slate-500"}`} />
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center ${
              activeStep === "completed"
                ? "text-[#38bdf8]"
                : activeStep === "formatting" 
                ? "text-sky-300" 
                : "text-slate-500"
            }`}>
              Formatting
            </span>
          </div>
        </div>

        {/* Main Progress Display */}
        <div 
          id="main-progress-panel"
          className="relative z-10 bg-[#020617] p-6 rounded-xl border border-[#1e293b]"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <h4 className="text-slate-100 font-medium mb-1 flex items-center gap-2">
                <span>Applying Neural Speech Diarization</span>
                <Sparkles className="w-4 h-4 text-[#38bdf8] animate-pulse" />
              </h4>
              <p className="text-xs text-slate-400 font-mono">Model: {modelName}</p>
            </div>
            <div 
              id="progress-percentage-display"
              className="text-3xl font-semibold text-[#38bdf8] font-mono"
            >
              {currentProgress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-2 relative">
            <div 
              id="progress-bar-fill"
              className="h-full bg-gradient-to-r from-sky-600 via-sky-500 to-[#38bdf8] rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            >
              <div className="w-full h-full bg-white/15"></div>
            </div>
          </div>

          <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
            <span>EST. TIME REMAINING: {estTime}</span>
            <span className="text-[#38bdf8] font-medium">
              {currentProgress >= 100 ? "Complete" : "Processing..."}
            </span>
          </div>
        </div>

        {/* Terminal Log */}
        <div 
          id="terminal-log-stream"
          className="mt-6 bg-[#020617] p-4 rounded-xl border border-[#1e293b] font-mono text-[11px] text-slate-400 h-28 overflow-y-auto relative z-10 space-y-1"
        >
          {terminalLogs.map((log, index) => {
            const isLast = index === terminalLogs.length - 1;
            let colorClass = "text-slate-400";
            if (log.includes("Speaker diarization") || log.includes("registered")) {
              colorClass = "text-[#38bdf8]";
            } else if (log.includes("[Speaker 0]") || log.includes("Formatting")) {
              colorClass = "text-sky-300";
            } else if (log.includes("Transcribing") || log.includes("probability")) {
              colorClass = "text-slate-200";
            } else if (log.includes("complete") || log.includes("ready")) {
              colorClass = "text-emerald-400 font-semibold";
            }
            return (
              <p key={index} className={`${colorClass} ${isLast && currentProgress < 100 ? "animate-pulse" : ""}`}>
                {log}
              </p>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div id="processing-action-bar" className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 relative z-10">
        <button 
          id="btn-cancel-operation"
          onClick={onCancel}
          className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#1e293b] bg-[#1e293b]/60 text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all font-medium text-xs sm:text-sm cursor-pointer text-center"
        >
          Cancel Operation
        </button>

        <button 
          id="btn-view-results"
          onClick={onViewResults}
          className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-xs sm:text-sm hover:bg-sky-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/10"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          <span>{currentProgress >= 100 ? "View Complete Transcript" : "Inspect Live Results"}</span>
        </button>

        <button
          id="btn-trigger-gemini-analysis"
          onClick={onAnalyzeWithGemini}
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1e293b] border border-[#38bdf8]/40 text-[#38bdf8] font-semibold text-xs sm:text-sm hover:bg-sky-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemini Pro Analysis</span>
        </button>
      </div>
    </div>
  );
};
