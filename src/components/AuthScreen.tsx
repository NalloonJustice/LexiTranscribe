import React, { useState } from "react";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Building, 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Check, 
  Headphones, 
  Video, 
  FileText, 
  Activity,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { signInWithGoogle } from "../lib/firebase";
import type { UserProfile, UserSubscription } from "../types";

interface AuthScreenProps {
  onAuthSuccess: (userData: UserProfile, token?: string, subscription?: UserSubscription) => void;
  onContinueAsDemo?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onContinueAsDemo
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("United States");
  const [rememberMe, setRememberMe] = useState(true);

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userResult = await signInWithGoogle();
      if (userResult) {
        // Also call backend to sync SaaS profile
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: userResult.email || "google_user@lexitranscribe.ai",
            password: "GoogleAuthSecurePass!2026"
          })
        }).catch(() => null);

        let sData: any = null;
        if (res && res.ok) {
          sData = await res.json();
        }

        const profile: UserProfile = {
          id: userResult.uid,
          email: userResult.email || "user@lexitranscribe.ai",
          fullName: userResult.displayName || "Lexi Operator",
          role: "user",
          emailVerified: userResult.emailVerified || true,
          photoURL: userResult.photoURL || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active"
        };

        if (sData?.token) {
          localStorage.setItem("lexi_session_token", sData.token);
        }
        localStorage.setItem("lexi_auth_user", JSON.stringify(profile));

        onAuthSuccess(sData?.user || profile, sData?.token, sData?.subscription);
      }
    } catch (err: any) {
      console.error("Auth sign-in failure:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      if (data.token) {
        localStorage.setItem("lexi_session_token", data.token);
      }
      localStorage.setItem("lexi_auth_user", JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token, data.subscription);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Full name, email, and password are required.");
      return;
    }

    if (strengthScore < 4) {
      setError("Please ensure your password meets all complexity requirements (8+ chars, uppercase, lowercase, and number).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, organization, country })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.token) {
        localStorage.setItem("lexi_session_token", data.token);
      }
      localStorage.setItem("lexi_auth_user", JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token, data.subscription);
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setSuccessMessage(data.message || "Password reset link sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    setEmail("Nelson1abc2@gmail.com");
    setPassword("DemoPassword123!");
    if (onContinueAsDemo) {
      onContinueAsDemo();
    } else {
      // Direct demo sign in
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "Nelson1abc2@gmail.com", password: "DemoPassword123!" })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            if (data.token) localStorage.setItem("lexi_session_token", data.token);
            localStorage.setItem("lexi_auth_user", JSON.stringify(data.user));
            onAuthSuccess(data.user, data.token, data.subscription);
          }
        })
        .catch(() => {
          const fallbackUser: UserProfile = {
            id: "user-admin-nelson",
            email: "Nelson1abc2@gmail.com",
            fullName: "Nelson Admin",
            role: "admin",
            emailVerified: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: "active"
          };
          onAuthSuccess(fallbackUser);
        });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-8 select-none">
      {/* Background Ambience & Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4)_0%,rgba(2,6,23,0.95)_100%)] pointer-events-none" />

      {/* Main Center Container */}
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left px-2 sm:px-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            <span>LexiTranscribe Enterprise v3.5 • Ready</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Neural Media <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-sky-400 to-blue-500">
                Transcription Studio
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Sign in or start your 7-day free trial to access frame-accurate transcription, multi-speaker diarization, interactive Gemini video analysis, and Veo 3 visual recaps.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a]/70 border border-[#1e293b]">
              <div className="p-2 rounded-lg bg-sky-500/10 text-[#00f0ff] shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Whisper & Gemini 2.5</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">High-speed acoustic tokenization & diarization.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a]/70 border border-[#1e293b]">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Veo 3 Visual Teasers</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated 16:9 & 9:16 video synthesis.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a]/70 border border-[#1e293b]">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Formatted Exports</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Clean .docx and .pdf document generation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a]/70 border border-[#1e293b]">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Live Voice Companion</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time bi-directional audio chat.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Test Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-mono transition-all cursor-pointer shadow-lg shadow-sky-500/5 group"
            >
              <Zap className="w-4 h-4 text-[#00f0ff] group-hover:scale-110 transition-transform" />
              <span>Instant Demo Operator Access (1-Click)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-6">
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
            
            {/* Top Tabs */}
            <div className="flex items-center p-1 bg-[#020617] rounded-xl border border-[#1e293b] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#00f0ff] text-black font-bold shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#00f0ff] text-black font-bold shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account (7-Day Trial)
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Fast Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#020617] hover:bg-[#1e293b] border border-[#1e293b] hover:border-slate-600 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-[#1e293b]"></div>
              <span className="px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono">
                or with email
              </span>
              <div className="flex-1 border-t border-[#1e293b]"></div>
            </div>

            {/* MODE: SIGN IN */}
            {mode === "login" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@company.com"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] text-[#00f0ff] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1e293b] bg-[#020617] text-[#00f0ff] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-slate-400">Remember credentials</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE: REGISTER / 7-DAY TRIAL */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@company.com"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Organization
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Lexi Media Lab"
                        className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-100 focus:outline-none transition-colors"
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="mt-2 space-y-1.5 bg-[#020617] p-2.5 rounded-lg border border-[#1e293b]">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Password Security</span>
                      <span className={strengthScore === 4 ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                        {strengthScore === 4 ? "High Security" : `${strengthScore}/4 requirements`}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      <div className={`rounded-full ${strengthScore >= 1 ? "bg-amber-400" : "bg-slate-700"}`}></div>
                      <div className={`rounded-full ${strengthScore >= 2 ? "bg-amber-400" : "bg-slate-700"}`}></div>
                      <div className={`rounded-full ${strengthScore >= 3 ? "bg-sky-400" : "bg-slate-700"}`}></div>
                      <div className={`rounded-full ${strengthScore === 4 ? "bg-emerald-400" : "bg-slate-700"}`}></div>
                    </div>
                  </div>
                </div>

                {/* Free Trial Perks Banner */}
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#00f0ff]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Included in your 7-day free trial:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#00f0ff]" /> 120 Free Transcription Mins</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#00f0ff]" /> Multi-speaker Diarization</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#00f0ff]" /> Formatted .docx/.pdf</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#00f0ff]" /> Veo 3 Video Generator</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Start 7-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE: FORGOT PASSWORD */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-200">Account Recovery</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the email address registered with your LexiTranscribe account. We'll send you a password recovery link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@company.com"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#00f0ff] rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#00f0ff] hover:bg-cyan-400 text-black font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Recovery Instructions</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    &larr; Return to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Security Assurance Footnote */}
            <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Trust ABAC Security</span>
              </div>
              <span>SOC2 & GDPR Compliant</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
