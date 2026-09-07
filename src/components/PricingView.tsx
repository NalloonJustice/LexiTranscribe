import React, { useState } from "react";
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Crown, 
  HelpCircle, 
  ArrowRight,
  CreditCard,
  Building2,
  Users
} from "lucide-react";
import type { BillingCycle, SubscriptionPlan, UserSubscription } from "../types";

interface PricingViewProps {
  currentSubscription?: UserSubscription | null;
  onSelectPlan: (planName: "starter" | "professional" | "business", cycle: BillingCycle) => void;
  onNavigateTab: (tab: any) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  currentSubscription,
  onSelectPlan,
  onNavigateTab
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: "plan-starter",
      name: "starter",
      displayName: "Starter",
      tagline: "For individuals who occasionally need transcription.",
      monthlyPrice: 5,
      annualPrice: 50,
      monthlyMinutes: 300,
      features: [
        "300 transcription minutes / month",
        "Video & Audio transcription",
        "Transcript editor with inline playback",
        "Standard TXT & SRT exports",
        "Standard neural processing speed",
        "Full transcript library history"
      ]
    },
    {
      id: "plan-professional",
      name: "professional",
      displayName: "Professional",
      tagline: "For students, creators, researchers, journalists and professionals who transcribe regularly.",
      monthlyPrice: 10,
      annualPrice: 100,
      monthlyMinutes: 1000,
      isPopular: true,
      badge: "MOST POPULAR",
      features: [
        "1,000 transcription minutes / month",
        "Everything in Starter",
        "DOCX & PDF formatted document exports",
        "SRT & VTT subtitle sync timestamps",
        "Multi-speaker acoustic diarization",
        "Gemini 3.1 Pro deep video intelligence",
        "Faster priority neural processing",
        "Priority customer support"
      ]
    },
    {
      id: "plan-business",
      name: "business",
      displayName: "Business",
      tagline: "For teams and organizations with higher volume transcription workflows.",
      monthlyPrice: 25,
      annualPrice: 250,
      monthlyMinutes: 3000,
      features: [
        "3,000 transcription minutes / month",
        "Everything in Professional",
        "Multi-user workspace access",
        "Advanced usage & quota analytics",
        "Ultra-low latency priority queue",
        "Veo 3 video studio generation",
        "Live API conversational sessions",
        "Dedicated 24/7 account support"
      ]
    }
  ];

  const handleCheckout = (planName: "starter" | "professional" | "business") => {
    setProcessingPlan(planName);
    onSelectPlan(planName, billingCycle);
    setTimeout(() => {
      setProcessingPlan(null);
    }, 1200);
  };

  const isCurrentPlan = (planName: string) => {
    if (!currentSubscription) return false;
    if (currentSubscription.status === "expired") return false;
    return currentSubscription.planName?.toLowerCase().includes(planName.toLowerCase());
  };

  return (
    <div id="pricing-view-container" className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[#38bdf8] text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FLEXIBLE PLANS FOR EVERY WORKFLOW</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Start with a 7-day free trial with 120 minutes allowance. Upgrade anytime for higher minutes, speaker diarization, and formatted document exports.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-[#0f172a] p-1.5 rounded-xl border border-[#1e293b] inline-flex items-center gap-2 shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#38bdf8] text-[#020617] shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-[#38bdf8] text-[#020617] shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                billingCycle === "annual" ? "bg-[#020617] text-sky-400" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}>
                Save ~17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isPopular = plan.isPopular;
          const active = isCurrentPlan(plan.name);
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const periodText = billingCycle === "annual" ? "/ year" : "/ month";
          const monthlyEquivalent = billingCycle === "annual" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl flex flex-col justify-between p-7 relative transition-all duration-200 ${
                isPopular
                  ? "bg-[#0f172a] border-2 border-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.15)] scale-[1.02]"
                  : "bg-[#0f172a] border border-[#1e293b] hover:border-slate-600"
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#38bdf8] text-[#020617] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-500/20">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{plan.badge || "MOST POPULAR"}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-100">{plan.displayName}</h3>
                  {active && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CURRENT PLAN
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px] mb-6">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-[#1e293b]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-100 font-mono">${price}</span>
                    <span className="text-slate-400 text-sm font-medium">{periodText}</span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-xs text-[#38bdf8] mt-1 font-mono">
                      Equivalent to ~${monthlyEquivalent}/mo billed annually
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-[#020617] px-3 py-1.5 rounded-lg border border-[#1e293b] w-fit">
                    <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{plan.monthlyMinutes.toLocaleString()} transcription minutes / month</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  disabled={active || processingPlan === plan.name}
                  onClick={() => handleCheckout(plan.name)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    active
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                      : isPopular
                      ? "bg-[#38bdf8] text-[#020617] hover:bg-sky-300 shadow-sky-500/20 font-bold"
                      : "bg-[#1e293b] text-slate-100 hover:bg-slate-700 border border-[#38bdf8]/30 hover:border-[#38bdf8]"
                  }`}
                >
                  {processingPlan === plan.name ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Checkout...</span>
                    </span>
                  ) : active ? (
                    <span>Active Plan</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Subscribe to {plan.displayName}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise / Team Inquiries Banner */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#38bdf8] text-xs font-mono font-semibold">
            <Building2 className="w-4 h-4" />
            <span>CUSTOM ENTERPRISE VOLUMES</span>
          </div>
          <h3 className="text-xl font-bold text-slate-100">Need more than 3,000 minutes per month?</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Custom enterprise licensing with dedicated API rate limits, SSO/SAML integration, on-premise deployments, and bespoke SLA guarantees.
          </p>
        </div>
        <button
          onClick={() => alert("Enterprise Inquiry: Please contact sales at Nelson1abc2@gmail.com for tailored enterprise SLAs and custom transcription volume quotas.")}
          className="px-6 py-3 rounded-xl bg-[#1e293b] hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Users className="w-4 h-4 text-[#38bdf8]" />
          <span>Contact Enterprise Team</span>
        </button>
      </div>

      {/* Guarantee & FAQ section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-200 text-sm mb-1">No Credit Card Needed for Trial</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get instant access to 120 minutes of transcription during your 7-day free trial.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38bdf8] mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-200 text-sm mb-1">Cancel Anytime</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cancel with one click from your billing dashboard. You keep access to all remaining minutes until the end of your billing cycle.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38bdf8] mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-200 text-sm mb-1">Data Retention Guarantee</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Even if your trial or plan expires, your transcripts remain safely stored and exportable at any time.
          </p>
        </div>
      </div>
    </div>
  );
};
