import React, { useState } from "react";
import { 
  X, 
  User, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Check, 
  Cloud,
  Mail,
  Lock,
  Building,
  Globe,
  ArrowRight,
  CreditCard
} from "lucide-react";
import { signInWithGoogle, signOutUser } from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLoginSuccess?: (userData: any) => void;
  onNavigateTab?: (tab: any) => void;
  onSignOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onNavigateTab,
  onSignOut
}) => {
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("United States");

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userResult = await signInWithGoogle();
      if (onLoginSuccess && userResult) {
        onLoginSuccess(userResult);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth sign-in failure:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      localStorage.removeItem("lexi_session_token");
      localStorage.removeItem("lexi_auth_user");
      if (onSignOut) onSignOut();
      onClose();
    } catch (err: any) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If user is already logged in */}
        {user ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 p-[2px] mx-auto mb-3 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center text-[#38bdf8]">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                {user.displayName || user.fullName || user.email}
              </h2>
              <p className="text-xs text-[#38bdf8] font-mono mt-0.5">
                {user.email || "Nelson1abc2@gmail.com"}
              </p>
            </div>

            <div className="space-y-2.5 bg-[#020617] p-4 rounded-xl border border-[#1e293b] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Firestore Sync
                </span>
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Security Standard
                </span>
                <span className="text-slate-200 font-mono text-[11px]">Hardened Rules v2</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab("billing");
                }}
                className="w-full py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#38bdf8]" />
                <span>Manage Subscription & Quotas</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab("profile");
                }}
                className="w-full py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>Account Profile & Security</span>
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not logged in: Tabbed Sign In / Register */
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38bdf8] mx-auto mb-2.5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                {tab === "register" ? "Start 7-Day Free Trial" : tab === "forgot" ? "Reset Password" : "Sign In to LexiTranscribe"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {tab === "register"
                  ? "Get 120 free transcription minutes. No credit card required."
                  : tab === "forgot"
                  ? "Enter your email to receive a password reset link."
                  : "Access your cloud transcripts, neural models, and subscription."}
              </p>
            </div>

            {/* Sub-tabs */}
            {tab !== "forgot" && (
              <div className="flex bg-[#020617] p-1 rounded-xl border border-[#1e293b]">
                <button
                  onClick={() => { setTab("login"); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tab === "login" ? "bg-[#38bdf8] text-[#020617]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setTab("register"); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tab === "register" ? "bg-[#38bdf8] text-[#020617]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register (7-Day Trial)
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                {successMessage}
              </div>
            )}

            {/* Login Form */}
            {tab === "login" && (
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setTab("forgot")}
                      className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-bold text-xs hover:bg-sky-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/10"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{loading ? "Signing in..." : "Sign In with Email"}</span>
                </button>
              </form>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Alex Morgan"
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@company.com"
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-bold text-xs hover:bg-sky-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? "Creating Account..." : "Start 7-Day Free Trial (120 Mins)"}</span>
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {tab === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-bold text-xs hover:bg-sky-300 transition-all cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Google Divider */}
            {tab !== "forgot" && (
              <div className="space-y-3 pt-2 border-t border-[#1e293b]">
                <div className="relative flex justify-center text-[10px] uppercase text-slate-400">
                  <span className="bg-[#0f172a] px-2 font-mono">Or continue with</span>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google Account</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
