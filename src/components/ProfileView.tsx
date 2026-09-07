import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Building, 
  Globe, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Save,
  Send,
  Database,
  Cloud,
  LogOut
} from "lucide-react";
import type { UserProfile, UserSubscription } from "../types";

interface ProfileViewProps {
  userProfile?: UserProfile | null;
  subscription?: UserSubscription | null;
  onUpdateProfile: (updates: { fullName?: string; organization?: string; country?: string }) => Promise<void>;
  onChangePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
  onResendVerification: () => Promise<string | undefined>;
  onNavigateTab: (tab: any) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  subscription,
  onUpdateProfile,
  onChangePassword,
  onResendVerification,
  onNavigateTab,
  onSignOut
}) => {
  const [fullName, setFullName] = useState(userProfile?.fullName || "Nelson Operator");
  const [organization, setOrganization] = useState(userProfile?.organization || "Lexi Enterprise Systems");
  const [country, setCountry] = useState(userProfile?.country || "United States");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const emailVerified = userProfile?.emailVerified ?? true;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await onUpdateProfile({ fullName, organization, country });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await onChangePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password. Please verify your current password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResend = async () => {
    setResendingVerification(true);
    setVerificationMessage(null);
    try {
      const msg = await onResendVerification();
      setVerificationMessage(msg || "Verification link generated and dispatched.");
    } catch (err: any) {
      setVerificationMessage(err.message || "Failed to send verification link.");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div id="profile-view-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-xs font-mono font-semibold text-[#38bdf8] uppercase tracking-wider">
              OPERATOR PROFILE & CREDENTIALS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            My Account & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your personal details, workspace preferences, and authentication credentials.
          </p>
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Profile Info Form */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-[#38bdf8]" />
            <span>Profile Details</span>
          </h2>
          <span className="text-xs font-mono text-[#38bdf8] bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            Role: {userProfile?.role?.toUpperCase() || "ADMIN"}
          </span>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={userProfile?.email || "Nelson1abc2@gmail.com"}
                  className="w-full bg-[#020617]/60 border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Organization / Company
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="Acme Media"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Country / Region
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-xs hover:bg-sky-300 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? "Saving Profile..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Email Verification Section */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#38bdf8]" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Email Verification Status</h2>
              <p className="text-xs text-slate-400">Verifying your email ensures secure access and invoice delivery.</p>
            </div>
          </div>

          {emailVerified ? (
            <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>VERIFIED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>UNVERIFIED</span>
            </span>
          )}
        </div>

        {verificationMessage && (
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-xs text-sky-400">
            {verificationMessage}
          </div>
        )}

        {!emailVerified && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">Click below to receive a new verification link in your inbox.</p>
            <button
              onClick={handleResend}
              disabled={resendingVerification}
              className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{resendingVerification ? "Sending Link..." : "Resend Verification Link"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Password Management */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-[#1e293b] pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#38bdf8]" />
            <span>Update Password</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Passwords must contain at least 8 characters, including uppercase, lowercase, and numeric characters.
          </p>
        </div>

        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Your password has been changed successfully!</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Re-type new password"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 border border-[#38bdf8]/30 text-slate-100 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{savingPassword ? "Updating Password..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Info Footer */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-[#38bdf8]" />
          <span>Cloud Database: <strong>Google Cloud Firestore Online</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <Cloud className="w-4 h-4 text-emerald-400" />
          <span>Project: <strong className="font-mono text-slate-300">gen-lang-client-0443938474</strong></span>
        </div>
      </div>
    </div>
  );
};
