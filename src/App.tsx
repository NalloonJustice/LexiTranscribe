import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, getTranscripts, saveTranscript, deleteTranscript, signOutUser } from "./lib/firebase";
import type { 
  TranscriptProject, 
  UserProfile, 
  UserSubscription, 
  BillingInvoice, 
  BillingCycle 
} from "./types";
import { Sidebar, NavTab } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { TrialBanner } from "./components/TrialBanner";
import { ProcessingSequenceView } from "./components/ProcessingSequenceView";
import { TranscriptViewer } from "./components/TranscriptViewer";
import { AIInsightsView } from "./components/AIInsightsView";
import { LiveVoiceView } from "./components/LiveVoiceView";
import { GeminiChatbot } from "./components/GeminiChatbot";
import { VeoStudioView } from "./components/VeoStudioView";
import { DashboardView } from "./components/DashboardView";
import { LibraryView } from "./components/LibraryView";
import { SettingsView } from "./components/SettingsView";
import { PricingView } from "./components/PricingView";
import { BillingDashboardView } from "./components/BillingDashboardView";
import { ProfileView } from "./components/ProfileView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { UploadModal } from "./components/UploadModal";
import { AuthModal } from "./components/AuthModal";
import { AuthScreen } from "./components/AuthScreen";
import { ExportModal } from "./components/ExportModal";
import { useDevice } from "./hooks/useDevice";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Mic, 
  Upload, 
  Menu as MenuIcon,
  Crown
} from "lucide-react";

// Initial default active project matching the requested screenshot exactly
const defaultProject: TranscriptProject = {
  id: "proj-interview-01",
  userId: "default-user",
  fileName: "interview_raw_footage.mp4",
  fileSize: "1.2 GB",
  duration: "45:20",
  format: "1080p",
  status: "processing",
  progress: 67,
  currentStep: "transcribing",
  model: "Whisper-v3-Turbo",
  sessionHexId: "0x7F8B9A2",
  createdAt: Date.now() - 120000,
  updatedAt: Date.now(),
  terminalLogs: [
    "> Initiating audio stream analysis...",
    "> Silence detection complete. Found 14 segments.",
    "> Speaker diarization running...",
    "> [Speaker 0] detected at 00:00:12",
    "> Transcribing segment block 0x4A..."
  ],
  segments: [
    {
      speaker: "Speaker 1",
      start: "00:00:00",
      end: "00:00:08",
      text: "Welcome back everyone. In today's deep-dive session, we are analyzing the latest neural speech models and real-time multimodality."
    },
    {
      speaker: "Speaker 1",
      start: "00:00:08",
      end: "00:00:15",
      text: "We noticed a 40% decrease in latency when streaming raw audio chunks directly to Gemini 3.5 Transcribe."
    },
    {
      speaker: "Speaker 2",
      start: "00:00:15",
      end: "00:00:23",
      text: "That is remarkable! Can you elaborate on how speaker diarization and timestamp alignment work under the hood?"
    },
    {
      speaker: "Speaker 1",
      start: "00:00:23",
      end: "00:00:35",
      text: "Certainly. With acoustic tokenization, timestamps match frame-accurate phonetic boundaries, allowing instant subtitle generation."
    },
    {
      speaker: "Speaker 2",
      start: "00:00:35",
      end: "00:00:44",
      text: "And for post-processing, we can feed the complete transcript into Gemini 3.1 Pro for video understanding and Veo 3 for visual recap teasers."
    }
  ],
  aiInsights: {
    executiveSummary: "A comprehensive deep dive into multimedia AI workflows, discussing model inference bottlenecks, multi-speaker clustering, and automated subtitle styling. The discussion focuses heavily on lowering acoustic token latency and aligning speech timestamps with frame-accurate video rendering.",
    keyMoments: [
      { timestamp: "00:02:15", title: "Project Introduction & Architecture", description: "Overview of LexiTranscribe high-throughput ingestion engine." },
      { timestamp: "00:14:40", title: "Latency Benchmark Comparisons", description: "Demonstrating 40% speedup with streaming audio tokens." },
      { timestamp: "00:28:05", title: "Automated Subtitle Staging", description: "Aligning text formatting with neon UI styling cues." },
      { timestamp: "00:41:30", title: "Future Roadmap & Live API Integration", description: "Q&A on real-time conversational agents and Veo 3 generation." }
    ],
    actionItems: [
      "Export timestamped SRT/VTT for distribution.",
      "Review speaker diarization boundaries at minute 14:40.",
      "Generate 16:9 visual teaser using Veo 3."
    ],
    sentimentAnalysis: {
      overall: "Positive, Analytical & Highly Technical",
      confidenceScore: 0.96,
      pacing: "Fast-paced, high information density"
    },
    entities: ["Gemini 3.1 Pro", "Whisper-v3-Turbo", "Veo 3", "Live API", "Speaker Diarization"],
    topics: ["Acoustic Processing", "Latency Optimization", "Multimodal Video Intelligence"]
  }
};

const secondaryProject: TranscriptProject = {
  id: "proj-podcast-02",
  userId: "default-user",
  fileName: "podcast_tech_vision_ep42.mp3",
  fileSize: "84.2 MB",
  duration: "32:10",
  format: "Audio Track",
  status: "completed",
  progress: 100,
  currentStep: "completed",
  model: "gemini-3.5-transcribe",
  sessionHexId: "0x3E1C89F",
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 86400000,
  segments: defaultProject.segments,
  aiInsights: defaultProject.aiInsights
};

const tailwindProject: TranscriptProject = {
  id: "proj-tailwind-03",
  userId: "default-user",
  fileName: "5_Tailwind_CSS_Pro_Tips.mp4",
  fileSize: "68.4 MB",
  duration: "18:45",
  format: "1080p",
  status: "completed",
  progress: 100,
  currentStep: "completed",
  model: "Gemini 2.5 Pro Transcribe",
  sessionHexId: "0x9E4F21A",
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  terminalLogs: [
    "> Ingesting video stream: 5_Tailwind_CSS_Pro_Tips.mp4",
    "> Audio track extracted at 48kHz 24-bit stereo.",
    "> Neural acoustic model: gemini-2.5-pro.",
    "> Diarization completed with 2 distinct speakers.",
    "> Continuous verbatim transcription finalized: 10 segments, 0 omissions."
  ],
  segments: [
    {
      speaker: "Speaker 1",
      start: "00:00:00",
      end: "00:01:15",
      text: "Hey everyone, welcome back to the channel! Today we are covering 5 Tailwind CSS pro tips that completely transformed how I write modern UI. Whether you've been using Tailwind for years or just getting started with the latest version, these 5 techniques will save you hours of debugging and dramatically clean up your codebase."
    },
    {
      speaker: "Speaker 1",
      start: "00:01:15",
      end: "00:03:40",
      text: "Tip number one: Arbitrary variants and targeted pseudo-classes. Instead of writing custom CSS rules for child elements, you can use syntax like the descendant variant \"[&_p]:text-slate-400\" for paragraph styling or the pseudo-class \"[&:nth-child(2)]:bg-sky-500\" for targeted list items. This lets you style deeply nested DOM structures or third-party components directly in your JSX without leaving your markup."
    },
    {
      speaker: "Speaker 2",
      start: "00:03:40",
      end: "00:04:30",
      text: "That's huge for headless UI libraries where you don't control the inner tags directly. How does that compare with standard group-hover patterns?"
    },
    {
      speaker: "Speaker 1",
      start: "00:04:30",
      end: "00:07:10",
      text: "Great question! While group-hover targets ancestor state, arbitrary variants target downstream descendants. Moving on to Tip number two: Container Queries using the \"@container\" wrapper and \"@md:\" responsive modifiers. Instead of relying strictly on viewport breakpoints like \"md:\" or \"lg:\", container queries allow a card or widget to adapt its layout based strictly on its parent container width. This makes your UI components 100% modular and reusable anywhere on the page."
    },
    {
      speaker: "Speaker 1",
      start: "00:07:10",
      end: "00:10:05",
      text: "Tip number three is a big one: Avoiding the overuse of @apply in your CSS files. Many developers coming from traditional CSS try to extract every component into @apply classes. But this removes the main benefit of utility-first CSS: rapid composability and dead code elimination. Instead, extract reusable React components or UI primitives, and let Tailwind's JIT engine optimize the build."
    },
    {
      speaker: "Speaker 2",
      start: "00:10:05",
      end: "00:11:20",
      text: "Exactly. Keeping the utility classes inline in your component makes inspecting styles in DevTools completely painless."
    },
    {
      speaker: "Speaker 1",
      start: "00:11:20",
      end: "00:14:15",
      text: "Now for Tip number four: Modern CSS Variables and Design Tokens. Rather than hardcoding static hex values in your config, define semantic CSS custom properties in your root theme like \"--bg-primary\" and \"--accent-glow\". Then reference them in your Tailwind markup using utility classes like \"bg-[var(--bg-primary)]\". This makes creating custom theme switchers, dark mode toggles, and user-customizable accents completely seamless."
    },
    {
      speaker: "Speaker 1",
      start: "00:14:15",
      end: "00:17:10",
      text: "And finally, Tip number five: Bulletproof class merging with tailwind-merge and clsx. When building component libraries, passing custom className props often causes conflicting utilities, like trying to override padding four with padding eight. Standard string concatenation fails because CSS rule order takes precedence. Using a combined class merger with twMerge ensures that overriding classes win reliably every single time."
    },
    {
      speaker: "Speaker 2",
      start: "00:17:10",
      end: "00:18:05",
      text: "That class merging helper pattern is definitely an absolute must-have in every modern React design system."
    },
    {
      speaker: "Speaker 1",
      start: "00:18:05",
      end: "00:18:45",
      text: "Absolutely! To recap: use arbitrary variants, container queries, component extraction over @apply, semantic CSS variables, and tailwind-merge for conflict resolution. If you found this breakdown helpful, be sure to hit like, subscribe, and download the full .docx and .pdf transcripts in the notes below. Catch you in the next one!"
    }
  ],
  aiInsights: {
    executiveSummary: "An in-depth masterclass walkthrough of 5 advanced Tailwind CSS pro techniques for modern web developers, covering arbitrary variants, container queries, CSS variables, utility composition, and bulletproof dynamic class merging.",
    keyMoments: [
      { timestamp: "00:01:15", title: "Tip 1: Arbitrary Variants & Pseudo Selectors", description: "Targeting nested DOM selectors and pseudo-classes directly in Tailwind markup." },
      { timestamp: "00:04:30", title: "Tip 2: Container Queries (@container)", description: "Modular responsive styling powered by parent container dimensions." },
      { timestamp: "00:07:10", title: "Tip 3: Avoid @apply Overuse", description: "Why extracting React components beats @apply for JIT performance." },
      { timestamp: "00:11:20", title: "Tip 4: CSS Variable Design Tokens", description: "Configuring semantic design tokens for instantaneous theme transitions." },
      { timestamp: "00:14:15", title: "Tip 5: Bulletproof Merging with twMerge", description: "Eliminating utility conflicts with tailwind-merge and clsx helper patterns." }
    ],
    actionItems: [
      "Export .docx and .pdf transcripts for architectural reference.",
      "Replace legacy nested CSS rules with arbitrary descendant variants like \"[&_p]\".",
      "Wrap dynamic React component class names with the clsx/twMerge utility to prevent styling conflicts."
    ],
    sentimentAnalysis: {
      overall: "Highly Educational, Practical & Enthusiastic",
      confidenceScore: 0.99,
      pacing: "Rapid, clear, masterclass cadence"
    },
    entities: ["Tailwind CSS", "Container Queries", "Arbitrary Variants", "clsx", "tailwind-merge", "CSS Variables"],
    topics: ["Arbitrary Variants", "Container Queries", "@apply Best Practices", "Theme Tokens", "tailwind-merge & clsx"]
  }
};

export default function App() {
  const device = useDevice();
  const [currentTab, setCurrentTab] = useState<NavTab>("transcripts");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("lexi_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("lexi_session_token") || localStorage.getItem("lexi_auth_user"));
  });

  const [projects, setProjects] = useState<TranscriptProject[]>([tailwindProject, defaultProject, secondaryProject]);
  const [activeProject, setActiveProject] = useState<TranscriptProject>(tailwindProject);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [viewingMode, setViewingMode] = useState<"sequence" | "editor">("sequence");

  // Fetch current user SaaS subscription & profile
  const fetchSaaSData = useCallback(async () => {
    try {
      const [subRes, profRes, invRes] = await Promise.all([
        fetch("/api/subscription/current"),
        fetch("/api/user/profile"),
        fetch("/api/subscription/invoices")
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
      }
      if (profRes.ok) {
        const profData = await profRes.json();
        setUserProfile(profData.user);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData.invoices || []);
      }
    } catch (err) {
      console.warn("Could not fetch SaaS profile/subscription:", err);
    }
  }, []);

  // Listen to Firebase Auth state & SaaS data
  useEffect(() => {
    if (isAuthenticated) {
      fetchSaaSData();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        try {
          const userProjects = await getTranscripts(user.uid);
          if (userProjects && userProjects.length > 0) {
            setProjects(userProjects);
            setActiveProject(userProjects[0]);
          }
        } catch (err) {
          console.warn("Could not load user projects from Firestore:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [fetchSaaSData, isAuthenticated]);

  const handleAuthSuccess = (userData: UserProfile, token?: string, subData?: UserSubscription) => {
    setUserProfile(userData);
    if (subData) {
      setSubscription(subData);
    }
    setIsAuthenticated(true);
    fetchSaaSData();
  };

  const handleContinueAsDemo = () => {
    const demoUser: UserProfile = {
      id: "user-demo-operator",
      email: "nelson@lexitranscribe.ai",
      fullName: "Nelson Operator",
      role: "admin",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "active"
    };
    setUserProfile(demoUser);
    localStorage.setItem("lexi_auth_user", JSON.stringify(demoUser));
    setIsAuthenticated(true);
    fetchSaaSData();
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    localStorage.removeItem("lexi_session_token");
    localStorage.removeItem("lexi_auth_user");
    setCurrentUser(null);
    setUserProfile(null);
    setSubscription(null);
    setIsAuthenticated(false);
  };

  const handleStartIngestion = (newProj: TranscriptProject) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    setActiveProject(newProj);
    setCurrentTab("transcripts");
    setViewingMode("sequence");

    if (currentUser) {
      saveTranscript(currentUser.uid, newProj);
    }

    // Refresh SaaS usage state
    fetchSaaSData();
  };

  const handleUpdateActiveProject = (updated: TranscriptProject) => {
    setActiveProject(updated);
    const updatedList = projects.map(p => p.id === updated.id ? updated : p);
    setProjects(updatedList);
    if (currentUser) {
      saveTranscript(currentUser.uid, updated);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProject.id === id && remaining.length > 0) {
      setActiveProject(remaining[0]);
    }
    if (currentUser) {
      await deleteTranscript(currentUser.uid, id);
    }
  };

  const handleSelectPlan = async (planName: "starter" | "professional" | "business", cycle: BillingCycle) => {
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, billingCycle: cycle })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade subscription");
      }
      setSubscription(data.subscription);
      await fetchSaaSData();
      setCurrentTab("billing");
    } catch (err: any) {
      alert("Upgrade failed: " + err.message);
    }
  };

  const handleCancelSubscription = async () => {
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to cancel subscription");
    setSubscription(data.subscription);
    await fetchSaaSData();
  };

  const handleReactivateSubscription = async () => {
    const res = await fetch("/api/subscription/reactivate", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reactivate subscription");
    setSubscription(data.subscription);
    await fetchSaaSData();
  };

  const handleUpdateProfile = async (updates: { fullName?: string; organization?: string; country?: string }) => {
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update profile");
    setUserProfile(data.user);
  };

  const handleChangePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to change password");
  };

  const handleResendVerification = async () => {
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userProfile?.email || currentUser?.email })
    });
    const data = await res.json();
    return data.message;
  };

  // If user is not authenticated on load, display login/signup screen so they can access the system
  if (!isAuthenticated) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess}
        onContinueAsDemo={handleContinueAsDemo}
      />
    );
  }

  return (
    <div id="lexitranscribe-root" className="font-sans antialiased flex h-screen overflow-hidden grid-bg bg-[#020617] text-[#f8fafc]">
      {/* Sidebar with Drawer & Responsive Collapse Support */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === "transcripts") {
            setViewingMode(activeProject.status === "completed" ? "editor" : "sequence");
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        userEmail={userProfile?.email || currentUser?.email}
        userPhoto={currentUser?.photoURL}
        userRole={userProfile?.role}
        onOpenAccount={() => setIsAuthOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSmallScreen={device.isSmallScreen}
      />

      {/* Top Navigation Bar with Device Indicator & Mobile Drawer Toggle */}
      <TopHeader
        activeTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        activeProject={activeProject}
        onExport={() => setIsExportOpen(true)}
        userPhoto={currentUser?.photoURL}
        onOpenAccount={() => setIsAuthOpen(true)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isSmallScreen={device.isSmallScreen}
        isSidebarCollapsed={isSidebarCollapsed}
        deviceInfo={device}
      />

      {/* Main Content Area - Automatically sized and padded based on detected device */}
      <main 
        id="main-viewport"
        className={`mt-16 h-[calc(100vh-64px)] overflow-y-auto relative flex flex-col transition-all duration-300 ${
          device.isSmallScreen 
            ? "ml-0 w-full pb-24" 
            : isSidebarCollapsed 
            ? "ml-[76px] w-[calc(100%-76px)]" 
            : "ml-[280px] w-[calc(100%-280px)]"
        }`}
      >
        {/* Contextual Trial / Expired Countdown Banner */}
        <TrialBanner
          subscription={subscription}
          onUpgradeClick={() => setCurrentTab("pricing")}
        />

        {/* Inner Responsive Padding Container */}
        <div className="p-3 sm:p-5 md:p-6 lg:p-8 flex-1 relative max-w-7xl w-full mx-auto">
          {/* Background Ambient Depth */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/40 rounded-full blur-[140px] pointer-events-none"></div>

          {/* Tab Switcher Views */}
          {currentTab === "transcripts" || currentTab === "processing" ? (
            viewingMode === "sequence" ? (
              <ProcessingSequenceView
                project={activeProject}
                onCancel={() => {
                  const cancelled = { ...activeProject, status: "cancelled" as const };
                  handleUpdateActiveProject(cancelled);
                  alert("Operation cancelled by operator.");
                }}
                onViewResults={() => {
                  setViewingMode("editor");
                }}
                onAnalyzeWithGemini={() => {
                  setCurrentTab("insights");
                }}
              />
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setViewingMode("sequence")}
                  className="text-xs text-[#00f0ff] hover:underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  &larr; Return to Processing Sequence Console
                </button>
                <TranscriptViewer
                  project={activeProject}
                  onUpdateProject={handleUpdateActiveProject}
                  onGoToInsights={() => setCurrentTab("insights")}
                />
              </div>
            )
          ) : currentTab === "dashboard" ? (
            <DashboardView
              projects={projects}
              onSelectProject={(p) => {
                setActiveProject(p);
                setViewingMode(p.status === "completed" ? "editor" : "sequence");
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onStartIngestion={handleStartIngestion}
            />
          ) : currentTab === "insights" ? (
            <AIInsightsView
              project={activeProject}
              onUpdateProject={handleUpdateActiveProject}
            />
          ) : currentTab === "live-voice" ? (
            <LiveVoiceView
              userId={currentUser?.uid}
            />
          ) : currentTab === "chat" ? (
            <GeminiChatbot
              userId={currentUser?.uid}
              activeProject={activeProject}
            />
          ) : currentTab === "veo" ? (
            <VeoStudioView
              userId={currentUser?.uid}
            />
          ) : currentTab === "library" ? (
            <LibraryView
              projects={projects}
              onSelectProject={(p) => {
                setActiveProject(p);
                setViewingMode(p.status === "completed" ? "editor" : "sequence");
              }}
              onDeleteProject={handleDeleteProject}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          ) : currentTab === "pricing" ? (
            <PricingView
              currentSubscription={subscription}
              onSelectPlan={handleSelectPlan}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          ) : currentTab === "billing" ? (
            <BillingDashboardView
              subscription={subscription}
              invoices={invoices}
              onUpgradeClick={() => setCurrentTab("pricing")}
              onCancelSubscription={handleCancelSubscription}
              onReactivateSubscription={handleReactivateSubscription}
              userEmail={userProfile?.email || currentUser?.email || undefined}
            />
          ) : currentTab === "profile" ? (
            <ProfileView
              userProfile={userProfile}
              subscription={subscription}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
              onResendVerification={handleResendVerification}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSignOut={handleSignOut}
            />
          ) : currentTab === "admin" ? (
            <AdminDashboardView />
          ) : currentTab === "settings" ? (
            <SettingsView />
          ) : null}
        </div>
      </main>

      {/* Mobile & Tablet Quick Bottom Navigation Bar (< 1024px) */}
      {device.isSmallScreen && (
        <nav 
          id="mobile-bottom-navigation"
          className="fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a]/95 backdrop-blur-lg border-t border-[#1e293b] flex items-center justify-around px-2 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
        >
          {/* Dashboard */}
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all cursor-pointer ${
              currentTab === "dashboard" ? "text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Transcripts */}
          <button
            onClick={() => {
              setCurrentTab("transcripts");
              setViewingMode(activeProject.status === "completed" ? "editor" : "sequence");
            }}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all cursor-pointer ${
              currentTab === "transcripts" || currentTab === "processing" ? "text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-medium">Transcripts</span>
          </button>

          {/* Center Elevated Upload Media CTA */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#38bdf8] text-[#020617] shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Upload Media"
            aria-label="Upload Media"
          >
            <Upload className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Live Voice */}
          <button
            onClick={() => setCurrentTab("live-voice")}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all cursor-pointer ${
              currentTab === "live-voice" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-[10px] font-medium">Live Voice</span>
          </button>

          {/* AI Insights */}
          <button
            onClick={() => setCurrentTab("insights")}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all cursor-pointer ${
              currentTab === "insights" ? "text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-medium">Insights</span>
          </button>

          {/* More Menu Drawer Trigger */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="More Options"
          >
            <MenuIcon className="w-4 h-4" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      )}

      {/* Upload Media Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartIngestion={handleStartIngestion}
      />

      {/* Firebase & SaaS Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={currentUser || (userProfile ? { email: userProfile.email, displayName: userProfile.fullName } : null)}
        onLoginSuccess={() => fetchSaaSData()}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onSignOut={handleSignOut}
      />

      {/* Export .docx and .pdf Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={activeProject}
      />
    </div>
  );
}
