import React, { useState } from "react";
import { 
  Film, 
  FileText, 
  Trash2, 
  Download, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Check, 
  Play 
} from "lucide-react";
import type { TranscriptProject } from "../types";
import { exportToDocx, exportToPdf } from "../lib/exportUtils";

interface LibraryViewProps {
  projects: TranscriptProject[];
  onSelectProject: (p: TranscriptProject) => void;
  onDeleteProject: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onNavigateTab
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDocx = async (e: React.MouseEvent, proj: TranscriptProject) => {
    e.stopPropagation();
    setDownloadingId(`${proj.id}-docx`);
    try {
      await exportToDocx(proj);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePdf = (e: React.MouseEvent, proj: TranscriptProject) => {
    e.stopPropagation();
    setDownloadingId(`${proj.id}-pdf`);
    try {
      exportToPdf(proj);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div id="library-container" className="max-w-6xl mx-auto space-y-6">
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-[#38bdf8]" />
            <span>Workspace Media & Transcripts Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your synchronized sessions, extracted transcripts (.docx & .pdf), and AI-generated assets
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-[#38bdf8] px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
          {projects.length} Saved Records
        </span>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => {
          const isCompleted = proj.status === "completed";
          return (
            <div
              key={proj.id}
              className="bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 p-4 rounded-xl flex items-center justify-between gap-4 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#020617] border border-[#1e293b] flex items-center justify-center text-slate-400 shrink-0">
                  <Film className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-100 truncate hover:text-[#38bdf8] cursor-pointer" onClick={() => { onSelectProject(proj); onNavigateTab(isCompleted ? "transcripts" : "processing"); }}>
                    {proj.fileName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                    <span>{proj.duration}</span>
                    <span>&bull;</span>
                    <span>{proj.fileSize}</span>
                    <span>&bull;</span>
                    <span className="text-[#38bdf8]">{proj.model}</span>
                    <span>&bull;</span>
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Direct .docx Download */}
                <button
                  title="Download .docx (Word)"
                  onClick={(e) => handleDocx(e, proj)}
                  disabled={downloadingId === `${proj.id}-docx`}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <div className="w-3.5 h-3.5 rounded bg-sky-500/20 flex items-center justify-center font-bold text-[9px]">W</div>
                  <span>.docx</span>
                </button>

                {/* Direct .pdf Download */}
                <button
                  title="Download .pdf (PDF)"
                  onClick={(e) => handlePdf(e, proj)}
                  disabled={downloadingId === `${proj.id}-pdf`}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <div className="w-3.5 h-3.5 rounded bg-red-500/20 flex items-center justify-center font-bold text-[9px]">P</div>
                  <span>.pdf</span>
                </button>

                <button
                  onClick={() => {
                    onSelectProject(proj);
                    onNavigateTab(isCompleted ? "transcripts" : "processing");
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 text-[#38bdf8] border border-sky-500/30 hover:bg-[#38bdf8] hover:text-[#020617] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{isCompleted ? "Inspect" : "Processing"}</span>
                </button>

                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
