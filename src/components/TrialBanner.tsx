import React from "react";
import { Sparkles, AlertCircle, ArrowRight, Zap } from "lucide-react";
import type { UserSubscription } from "../types";

interface TrialBannerProps {
  subscription?: UserSubscription | null;
  onUpgradeClick: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  subscription,
  onUpgradeClick
}) => {
  if (!subscription) return null;

  const status = subscription.status;
  const isTrial = status === "trialing";
  const isExpired = status === "expired";

  if (!isTrial && !isExpired) return null;

  const now = Date.now();
  const trialEnd = subscription.trialEndDate || now + 7 * 24 * 60 * 60 * 1000;
  const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000)));
  const remainingMinutes = Math.max(0, subscription.minutesLimit - subscription.minutesUsed);

  if (isExpired) {
    return (
      <div 
        id="trial-banner-expired"
        className="bg-red-950/80 border-b border-red-500/40 text-xs px-6 py-2.5 flex items-center justify-between z-10 select-none shadow-md"
      >
        <div className="flex items-center gap-2 text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong>Your 7-day free trial has expired.</strong> Upgrade to continue transcribing new media.
          </span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="px-3.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Choose a Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      id="trial-banner-active"
      className="bg-gradient-to-r from-sky-950 via-[#0f172a] to-slate-900 border-b border-sky-500/30 text-xs px-6 py-2 flex items-center justify-between z-10 select-none shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sky-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span className="font-bold">7-Day Free Trial:</span>
          <span>{daysLeft} {daysLeft === 1 ? "day" : "days"} left</span>
        </div>
        <span className="text-slate-500">&bull;</span>
        <div className="flex items-center gap-1 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span><strong>{remainingMinutes}</strong> / {subscription.minutesLimit} trial minutes remaining</span>
        </div>
      </div>

      <button
        onClick={onUpgradeClick}
        className="px-3 py-1 rounded-lg bg-[#38bdf8] text-[#020617] font-bold hover:bg-sky-300 text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
      >
        <Sparkles className="w-3 h-3" />
        <span>Upgrade to Pro</span>
      </button>
    </div>
  );
};
