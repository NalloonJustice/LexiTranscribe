import React, { useState, useRef, useEffect } from "react";
import { 
  History, 
  Bell, 
  Share2, 
  Download, 
  Check, 
  Sparkles, 
  Menu,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import type { TranscriptProject } from "../types";
import type { DeviceInfo } from "../hooks/useDevice";

interface TopHeaderProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  activeProject?: TranscriptProject | null;
  onExport: () => void;
  userPhoto?: string | null;
  onOpenAccount: () => void;
  onOpenMobileDrawer?: () => void;
  isSmallScreen?: boolean;
  isSidebarCollapsed?: boolean;
  deviceInfo?: DeviceInfo;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  activeProject,
  onExport,
  userPhoto,
  onOpenAccount,
  onOpenMobileDrawer,
  isSmallScreen = false,
  isSidebarCollapsed = false,
  deviceInfo
}) => {
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFeedCollapsed, setIsFeedCollapsed] = useState(false);
  const [showDeviceTooltip, setShowDeviceTooltip] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeviceIcon = () => {
    if (!deviceInfo) return <Monitor className="w-3.5 h-3.5" />;
    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5 text-sky-400" />;
      case "laptop":
        return <Laptop className="w-3.5 h-3.5 text-cyan-400" />;
      case "desktop":
        return <Monitor className="w-3.5 h-3.5 text-indigo-400" />;
      case "ultrawide":
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <header 
      id="top-navigation-header"
      className={`fixed top-0 right-0 h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-[#1e293b] flex justify-between items-center px-3 sm:px-6 z-30 transition-all duration-300 ${
        isSmallScreen
          ? "w-full left-0"
          : isSidebarCollapsed
          ? "w-[calc(100%-76px)]"
          : "w-[calc(100%-280px)]"
      }`}
    >
      {/* Left side: Hamburger on mobile + Navigation Links on desktop */}
      <div className="flex items-center gap-3">
        {isSmallScreen && (
          <button
            id="btn-mobile-menu-toggle"
            onClick={onOpenMobileDrawer}
            className="p-2 rounded-xl bg-[#1e293b]/80 border border-[#334155] text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand title on small screens */}
        {isSmallScreen && (
          <div 
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-2 cursor-pointer mr-1"
          >
            <span className="font-bold text-slate-100 text-sm tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
              LexiTranscribe
            </span>
          </div>
        )}

        {/* Navigation Links on Tablet/Desktop */}
        <nav id="top-nav-links" className="hidden sm:flex gap-5 h-full items-center">
          <button 
            id="nav-link-recent"
            onClick={() => onSelectTab("dashboard")}
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-[#38bdf8] transition-colors h-full flex items-center border-b-2 border-transparent hover:border-[#38bdf8] cursor-pointer"
          >
            Recent
          </button>
          <button 
            id="nav-link-shared"
            onClick={() => onSelectTab("library")}
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-[#38bdf8] transition-colors h-full flex items-center border-b-2 border-transparent hover:border-[#38bdf8] cursor-pointer"
          >
            Shared
          </button>
          <button 
            id="nav-link-favorites"
            onClick={() => onSelectTab("library")}
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-[#38bdf8] transition-colors h-full flex items-center border-b-2 border-transparent hover:border-[#38bdf8] cursor-pointer"
          >
            Favorites
          </button>
        </nav>
      </div>

      {/* Trailing Actions & Auto-detected Device Indicator */}
      <div id="top-actions" className="flex items-center gap-2 sm:gap-3">
        {/* Device Detection Badge */}
        {deviceInfo && (
          <div className="relative">
            <button
              onClick={() => setShowDeviceTooltip(!showDeviceTooltip)}
              onMouseEnter={() => setShowDeviceTooltip(true)}
              onMouseLeave={() => setShowDeviceTooltip(false)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#020617] border border-[#1e293b] text-[11px] font-mono text-slate-300 hover:border-[#38bdf8]/50 transition-colors cursor-pointer"
              title="Device Auto-Detection & Adaptive Scaling"
            >
              {getDeviceIcon()}
              <span className="capitalize font-semibold">{deviceInfo.deviceType}</span>
              <span className="text-slate-500 font-normal">({deviceInfo.width}×{deviceInfo.height})</span>
            </button>

            {showDeviceTooltip && (
              <div className="absolute top-9 left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl p-3 z-50 text-[11px] font-mono text-slate-300 pointer-events-none">
                <div className="text-[#38bdf8] font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Adaptive Device Engine</span>
                </div>
                <div className="space-y-0.5 text-slate-400">
                  <div>Type: <span className="text-slate-200 capitalize">{deviceInfo.deviceType}</span></div>
                  <div>Resolution: <span className="text-slate-200">{deviceInfo.width}px × {deviceInfo.height}px</span></div>
                  <div>Touch Input: <span className="text-slate-200">{deviceInfo.isTouch ? "Enabled" : "Desktop Mouse"}</span></div>
                  <div>Orientation: <span className="text-slate-200 capitalize">{deviceInfo.orientation}</span></div>
                  <div>Layout Mode: <span className="text-emerald-400 font-bold">{isSmallScreen ? "Drawer / Mobile View" : "Full Desktop Studio"}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History button */}
        <button 
          id="btn-history"
          title="Project Activity History"
          onClick={() => onSelectTab("library")}
          className="text-slate-400 hover:text-[#38bdf8] transition-colors p-2 rounded-xl hover:bg-[#1e293b] cursor-pointer"
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            id="btn-notifications"
            title="System Alerts & Processing Updates"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-[#38bdf8] transition-colors p-2 rounded-xl hover:bg-[#1e293b] relative cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_6px_#10b981]"></span>
          </button>

          {showNotifications && (
            <div 
              id="notifications-popup"
              className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl p-3 sm:p-4 z-50 text-xs transition-all animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header with collapse/expand and close controls */}
              <div 
                className="flex justify-between items-center pb-2.5 border-b border-[#1e293b] cursor-pointer select-none group"
                onClick={() => setIsFeedCollapsed(!isFeedCollapsed)}
                title={isFeedCollapsed ? "Click to expand activity feed" : "Click to collapse activity feed"}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] group-hover:text-sky-300 transition-colors">
                    System Activity
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#38bdf8] font-mono font-medium bg-[#38bdf8]/10 px-1.5 py-0.5 rounded border border-[#38bdf8]/20">
                    LIVE FEED
                  </span>
                  
                  {/* Collapse / Expand Toggle Button */}
                  <button
                    id="btn-toggle-activity-collapse"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFeedCollapsed(!isFeedCollapsed);
                    }}
                    className="text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] p-1 rounded transition-colors cursor-pointer"
                    title={isFeedCollapsed ? "Expand Activity Feed" : "Collapse Activity Feed"}
                  >
                    {isFeedCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Close Popup Button */}
                  <button
                    id="btn-close-activity-popup"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(false);
                    }}
                    className="text-slate-400 hover:text-rose-400 hover:bg-[#1e293b] p-1 rounded transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsed Summary View */}
              {isFeedCollapsed ? (
                <div 
                  onClick={() => setIsFeedCollapsed(false)}
                  className="mt-2.5 py-2 px-3 rounded-lg bg-[#020617] border border-[#1e293b] hover:border-sky-500/40 text-slate-400 flex items-center justify-between cursor-pointer transition-all hover:text-slate-200"
                >
                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    2 active updates (auto-scaled)
                  </span>
                  <span className="text-[10px] text-[#38bdf8] hover:underline font-mono">Expand &darr;</span>
                </div>
              ) : (
                /* Expanded Content Feed */
                <div className="space-y-2.5 mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2.5 rounded-lg bg-[#020617] border border-[#1e293b] hover:border-sky-500/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-[#38bdf8] font-semibold mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Gemini 3.5 Transcribe</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Neural acoustic diarization initialized for {activeProject?.fileName || "active media"}.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#020617] border border-[#1e293b] hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                      <span>Device Auto-Scaled</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Optimized UI layout for {deviceInfo?.deviceType || "current"} viewport.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#1e293b] mx-0.5 sm:mx-1 hidden xs:block"></div>

        {/* Share Button */}
        <button 
          id="btn-share"
          onClick={handleShare}
          className="text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#1e293b] cursor-pointer"
          title="Share Project URL"
        >
          {copied ? <Check className="w-4 h-4 text-[#38bdf8]" /> : <Share2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
        </button>

        {/* Export Button */}
        <button 
          id="btn-export"
          onClick={onExport}
          className="text-xs sm:text-sm font-semibold text-[#38bdf8] border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-2.5 sm:px-3.5 py-1.5 rounded-xl hover:bg-[#38bdf8] hover:text-[#020617] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          title="Export Transcripts"
        >
          <Download className="w-4 h-4" />
          <span className="hidden xs:inline">Export</span>
        </button>

        {/* User Profile Avatar */}
        <button
          id="btn-profile-avatar"
          onClick={onOpenAccount}
          className="w-8 h-8 rounded-full ml-1 border border-slate-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shrink-0"
          title="Profile & Settings"
        >
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src={userPhoto || "https://lh3.googleusercontent.com/aida-public/AB6AXuD9N5PN7VoClCgeeliovtqnf50uZGlRhv7xTpnTwxd_G75pZwF_O6Q66GFZnx1xLQJ-8ixXjPcGvETjX5gf1Tb9N-oUJ0BHJ2RofpEaAUReGl3I9dnkhxmNsKyv3_k7-Q_PsSG5-gTbLXBbOmDBpdht-A1zcQe_UqE_IDfWd1_1_mMB1px-xaeV-H2nKKFkMoWb4SyFT9a52thxqlYJeAQqvM4mK8SWpQz4JW5DgiqtVZUSNT3SXyy_Tw"} 
          />
        </button>
      </div>
    </header>
  );
};

