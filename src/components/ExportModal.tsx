import React, { useState } from "react";
import { 
  X, 
  FileText, 
  Download, 
  Sparkles, 
  Check, 
  Sliders, 
  Layers, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import type { TranscriptProject } from "../types";
import { exportToDocx, exportToPdf, ExportOptions } from "../lib/exportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TranscriptProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"docx" | "pdf">("docx");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [options, setOptions] = useState<ExportOptions>({
    includeSummary: true,
    includeTimestamps: true,
    includeKeyMoments: true,
    includeActionItems: true
  });

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === "docx") {
        await exportToDocx(project, options);
      } else {
        exportToPdf(project, options);
      }
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        id="export-transcript-modal"
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#38bdf8]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Export Transcript</h2>
            <p className="text-xs text-slate-400">Generate formatted .docx or .pdf documents</p>
          </div>
        </div>

        {/* Project Target */}
        <div className="bg-[#020617] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between text-xs">
          <div className="min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Source File</span>
            <span className="text-slate-200 font-semibold truncate block">{project.fileName || "transcript"}</span>
          </div>
          <span className="text-[#38bdf8] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
            {project.duration || "45:20"}
          </span>
        </div>

        {/* Format Selector: .docx and .pdf ONLY */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Select Output Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Word .DOCX */}
            <button
              type="button"
              onClick={() => setSelectedFormat("docx")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedFormat === "docx"
                  ? "bg-sky-500/15 border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)] text-white"
                  : "bg-[#020617] border-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs">
                    W
                  </div>
                  <span className="font-bold text-sm text-slate-100">.docx</span>
                </div>
                {selectedFormat === "docx" && <Check className="w-4 h-4 text-[#38bdf8]" />}
              </div>
              <p className="text-[11px] text-slate-400">Microsoft Word document with styled tables & speaker diarization</p>
            </button>

            {/* PDF .PDF */}
            <button
              type="button"
              onClick={() => setSelectedFormat("pdf")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedFormat === "pdf"
                  ? "bg-sky-500/15 border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)] text-white"
                  : "bg-[#020617] border-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold font-mono text-xs">
                    P
                  </div>
                  <span className="font-bold text-sm text-slate-100">.pdf</span>
                </div>
                {selectedFormat === "pdf" && <Check className="w-4 h-4 text-[#38bdf8]" />}
              </div>
              <p className="text-[11px] text-slate-400">Portable Document Format ready for printing and distribution</p>
            </button>
          </div>
        </div>

        {/* Content Customization Options */}
        <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-xl space-y-2.5">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Included Document Elements
          </span>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-1">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              Speaker Timestamps & Diarization
            </span>
            <input
              type="checkbox"
              checked={options.includeTimestamps}
              onChange={(e) => setOptions({ ...options, includeTimestamps: e.target.checked })}
              className="accent-[#38bdf8] w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-1">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Gemini AI Executive Summary
            </span>
            <input
              type="checkbox"
              checked={options.includeSummary}
              onChange={(e) => setOptions({ ...options, includeSummary: e.target.checked })}
              className="accent-[#38bdf8] w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-1">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Action Items & Next Steps
            </span>
            <input
              type="checkbox"
              checked={options.includeActionItems}
              onChange={(e) => setOptions({ ...options, includeActionItems: e.target.checked })}
              className="accent-[#38bdf8] w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-1">
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Key Moments Timeline
            </span>
            <input
              type="checkbox"
              checked={options.includeKeyMoments}
              onChange={(e) => setOptions({ ...options, includeKeyMoments: e.target.checked })}
              className="accent-[#38bdf8] w-4 h-4"
            />
          </label>
        </div>

        {/* Export Trigger */}
        <div className="pt-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-sm hover:bg-sky-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/10 disabled:opacity-50"
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Downloaded Successfully!</span>
              </>
            ) : isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#020617] border-t-transparent rounded-full animate-spin"></div>
                <span>Generating {selectedFormat.toUpperCase()} Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download as .{selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
