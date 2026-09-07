import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Film, 
  Settings, 
  HelpCircle, 
  User, 
  Upload, 
  Mic, 
  Bot, 
  Video,
  CreditCard,
  Crown,
  ShieldAlert,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";

export type NavTab = 
  | "processing" 
  | "transcripts" 
  | "dashboard" 
  | "insights" 
  | "library" 
  | "chat" 
  | "live-voice" 
  | "veo" 
  | "pricing"
  | "billing"
  | "profile"
  | "admin"
  | "settings" 
  | "account";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  userEmail?: string | null;
  userPhoto?: string | null;
  userRole?: string | null;
  onOpenAccount: () => void;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  isSmallScreen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  userEmail,
  userPhoto,
  userRole,
  onOpenAccount,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  isCollapsed = false,
  onToggleCollapsed,
  isSmallScreen = false
}) => {
  const isAdmin = userRole === "admin" || userEmail?.includes("nelson") || userEmail?.includes("admin");

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (isSmallScreen && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleUploadClick = () => {
    onOpenUpload();
    if (isSmallScreen && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSmallScreen && isMobileDrawerOpen && (
        <div 
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobileDrawer}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside 
        id="sidebar-navigation"
        className={`fixed left-0 top-0 h-screen bg-[#0f172a] border-r border-[#1e293b] flex flex-col p-4 z-50 select-none shadow-2xl transition-all duration-300 ease-in-out ${
          isSmallScreen
            ? `${isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"} w-[280px] sm:w-[300px]`
            : `${isCollapsed ? "w-[76px]" : "w-[280px]"} translate-x-0`
        }`}
      >
        {/* Header / Brand */}
        <div 
          id="brand-header"
          className="flex items-center justify-between mb-5 px-1 mt-1 cursor-pointer group"
        >
          <div 
            onClick={() => handleTabClick("dashboard")}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 shrink-0 rounded-lg bg-[#1e293b] border border-[#38bdf8]/40 p-[1.5px] shadow-[0_0_12px_rgba(56,189,248,0.2)] flex items-center justify-center">
              <img 
                id="brand-avatar"
                alt="User Workspace Avatar" 
                className="w-full h-full rounded-md object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI-9drTfUuEH50XD1fVISzzMXPNwxN1sKzIGPtYimJYu-EtcMuzp2ABrF-bUfDxVcq9R5-ceXWwxCuVtSLjbf1-vGhYWi8vSpo_8eEksSd3Kt3zlSZueiGrYi7Wgqi_RrMySFBCXXVwFXYodV96iG42Bd2yk-FsgbqVWAEn-3KooC0wMOEiTfu4y0uQ6o8aj-wTUsjpCDT1D8DOJxGNW3JiaM-qpNoChEf1aoslEJ4SmAEfkdK0LFrXA" 
              />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-semibold text-slate-100 text-lg tracking-tight group-hover:text-[#38bdf8] transition-colors truncate">
                  LexiTranscribe
                </h1>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
                  <span>Pro Workspace</span>
                </p>
              </div>
            )}
          </div>

          {/* Close button on Mobile Drawer */}
          {isSmallScreen ? (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            onToggleCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:flex items-center justify-center"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )
          )}
        </div>

        {/* CTA Upload Button */}
        <button 
          id="btn-upload-video"
          onClick={handleUploadClick}
          className={`w-full mb-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#38bdf8] hover:from-cyan-400 hover:to-sky-400 text-[#020617] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/15 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
          title="Upload Video or Audio"
        >
          <Upload className="w-4 h-4 stroke-[2.5] shrink-0" />
          {!isCollapsed && <span className="text-xs">Upload Media</span>}
        </button>

        {/* Navigation Tabs */}
        <nav id="nav-tabs-container" className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1">
          {/* Section: Core */}
          {!isCollapsed && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Core Studio
            </div>
          )}

          {/* Dashboard */}
          <button
            id="tab-dashboard"
            onClick={() => handleTabClick("dashboard")}
            title="Dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "dashboard"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentTab === "dashboard" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>Dashboard</span>}
          </button>

          {/* Transcripts */}
          <button
            id="tab-transcripts"
            onClick={() => handleTabClick("transcripts")}
            title="Transcripts"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "transcripts" || currentTab === "processing"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-4 h-4 shrink-0 ${currentTab === "transcripts" || currentTab === "processing" ? "text-[#38bdf8]" : "text-slate-400"}`} />
              {!isCollapsed && <span>Transcripts</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                Live
              </span>
            )}
          </button>

          {/* AI Insights */}
          <button
            id="tab-insights"
            onClick={() => handleTabClick("insights")}
            title="AI Insights"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "insights"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${currentTab === "insights" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>AI Insights</span>}
          </button>

          {/* Live Voice */}
          <button
            id="tab-live-voice"
            onClick={() => handleTabClick("live-voice")}
            title="Live Voice Companion"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "live-voice"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Mic className={`w-4 h-4 shrink-0 ${currentTab === "live-voice" ? "text-[#38bdf8]" : "text-slate-400"}`} />
              {!isCollapsed && <span>Live Voice</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Live API
              </span>
            )}
          </button>

          {/* Gemini Chat */}
          <button
            id="tab-chat"
            onClick={() => handleTabClick("chat")}
            title="Gemini Chatbot"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "chat"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <Bot className={`w-4 h-4 shrink-0 ${currentTab === "chat" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>Gemini Chat</span>}
          </button>

          {/* Veo 3 Video Studio */}
          <button
            id="tab-veo"
            onClick={() => handleTabClick("veo")}
            title="Veo 3 Studio"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "veo"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Video className={`w-4 h-4 shrink-0 ${currentTab === "veo" ? "text-[#38bdf8]" : "text-slate-400"}`} />
              {!isCollapsed && <span>Veo 3 Studio</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                Veo
              </span>
            )}
          </button>

          {/* Library */}
          <button
            id="tab-library"
            onClick={() => handleTabClick("library")}
            title="Media Library"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "library"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <Film className={`w-4 h-4 shrink-0 ${currentTab === "library" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>Library</span>}
          </button>

          {/* Section: Subscription & Account */}
          {!isCollapsed && (
            <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Plans & Billing
            </div>
          )}

          {/* Pricing / Upgrade */}
          <button
            id="tab-pricing"
            onClick={() => handleTabClick("pricing")}
            title="Pricing Plans"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "pricing"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Crown className={`w-4 h-4 shrink-0 ${currentTab === "pricing" ? "text-[#38bdf8]" : "text-slate-400"}`} />
              {!isCollapsed && <span>Pricing Plans</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                7-Day Free
              </span>
            )}
          </button>

          {/* Billing & Usage */}
          <button
            id="tab-billing"
            onClick={() => handleTabClick("billing")}
            title="Usage & Billing"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "billing"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <CreditCard className={`w-4 h-4 shrink-0 ${currentTab === "billing" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>Usage & Billing</span>}
          </button>

          {/* Profile */}
          <button
            id="tab-profile"
            onClick={() => handleTabClick("profile")}
            title="My Profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "profile"
                ? "bg-[#1e293b] text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <User className={`w-4 h-4 shrink-0 ${currentTab === "profile" ? "text-[#38bdf8]" : "text-slate-400"}`} />
            {!isCollapsed && <span>My Profile</span>}
          </button>

          {/* Admin Dashboard if Admin */}
          {isAdmin && (
            <button
              id="tab-admin"
              onClick={() => handleTabClick("admin")}
              title="Admin Console"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                currentTab === "admin"
                  ? "bg-sky-950/60 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8] shadow-sm"
                  : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
              } ${isCollapsed ? "justify-center px-2" : ""}`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-4 h-4 shrink-0 ${currentTab === "admin" ? "text-[#38bdf8]" : "text-slate-400"}`} />
                {!isCollapsed && <span>Admin Console</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                  MRR
                </span>
              )}
            </button>
          )}

          {/* Settings */}
          <button
            id="tab-settings"
            onClick={() => handleTabClick("settings")}
            title="Settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              currentTab === "settings"
                ? "bg-[#1e293b] text-slate-100 font-semibold border-l-2 border-slate-400 shadow-sm"
                : "text-slate-400 hover:bg-[#1e293b]/70 hover:text-slate-100"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </nav>

        {/* Footer Nav */}
        <div id="sidebar-footer" className="flex flex-col gap-1.5 mt-auto pt-3 border-t border-[#1e293b]">
          <button
            id="btn-help-center"
            onClick={() => alert("LexiTranscribe Responsive Engine: Automatic device detection, dynamic resolution scaling, and touch-adaptive controls active.")}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-[#1e293b] hover:text-slate-200 transition-colors text-left cursor-pointer ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title="Help Center"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Help & Docs</span>}
          </button>

          <button
            id="btn-account-profile"
            onClick={() => {
              onOpenAccount();
              if (isSmallScreen && onCloseMobileDrawer) onCloseMobileDrawer();
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-[#1e293b] hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title="Account Profile"
          >
            <div className="flex items-center gap-2.5 truncate">
              {userPhoto ? (
                <img src={userPhoto} alt="User Profile" className="w-5 h-5 rounded-full border border-sky-400 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              {!isCollapsed && <span className="truncate">{userEmail ? userEmail.split("@")[0] : "Sign In / Trial"}</span>}
            </div>
            {!isCollapsed && <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0"></span>}
          </button>
        </div>
      </aside>
    </>
  );
};

