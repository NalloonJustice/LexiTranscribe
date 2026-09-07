import React, { useState } from "react";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  HelpCircle
} from "lucide-react";
import type { UserSubscription, BillingInvoice } from "../types";

interface BillingDashboardViewProps {
  subscription?: UserSubscription | null;
  invoices?: BillingInvoice[];
  onUpgradeClick: () => void;
  onCancelSubscription: () => Promise<void>;
  onReactivateSubscription: () => Promise<void>;
  userEmail?: string;
}

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = ({
  subscription,
  invoices = [],
  onUpgradeClick,
  onCancelSubscription,
  onReactivateSubscription,
  userEmail
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const status = subscription?.status || "trialing";
  const isTrial = status === "trialing";
  const isExpired = status === "expired";
  const isCancelled = subscription?.cancelAtPeriodEnd || status === "cancelled";
  const isActive = status === "active" && !isCancelled;

  const minutesLimit = subscription?.minutesLimit || 120;
  const minutesUsed = subscription?.minutesUsed || 0;
  const minutesRemaining = Math.max(0, minutesLimit - minutesUsed);
  const usagePercentage = Math.min(100, Math.round((minutesUsed / minutesLimit) * 100));

  // Trial calculations
  const now = Date.now();
  const trialEnd = subscription?.trialEndDate || now + 7 * 24 * 60 * 60 * 1000;
  const trialDaysRemaining = isTrial ? Math.max(0, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))) : 0;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancelSubscription();
      setShowCancelModal(false);
    } catch (err) {
      console.error("Cancellation error:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      await onReactivateSubscription();
    } catch (err) {
      console.error("Reactivation error:", err);
    } finally {
      setReactivating(false);
    }
  };

  const handleDownloadInvoice = (inv: BillingInvoice) => {
    setDownloadingInvoiceId(inv.id);
    setTimeout(() => {
      const receiptContent = `===========================================
LEXITRANSCRIBE OFFICIAL RECEIPT / INVOICE
===========================================
Invoice Number: ${inv.invoiceNumber}
Date: ${new Date(inv.date).toLocaleDateString()}
Customer: ${userEmail || "Customer"}
Plan: ${inv.planName} (${inv.billingCycle})
Amount: $${inv.amount.toFixed(2)} ${inv.currency}
Status: ${inv.status.toUpperCase()}
Payment Method: Visa ending in 4242 (Tokenized)
Merchant: LexiTranscribe Enterprise Systems Inc.
===========================================
Thank you for your business!`;

      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber}_Receipt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingInvoiceId(null);
    }, 600);
  };

  return (
    <div id="billing-dashboard-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-xs font-mono font-semibold text-[#38bdf8] uppercase tracking-wider">
              SUBSCRIPTION & USAGE CONTROL
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Usage & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your transcription quota, subscription plan, payment methods, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUpgradeClick}
            className="px-5 py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-sm hover:bg-sky-300 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>Change Plan</span>
          </button>
        </div>
      </div>

      {/* Trial Countdown Warning Banner if Trialing */}
      {isTrial && (
        <div className="bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-500/40 p-6 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  7-DAY FREE TRIAL ACTIVE
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                You have {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"} remaining in your trial
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                You currently have <strong className="text-white font-mono">{minutesRemaining}</strong> out of <strong className="text-white font-mono">{minutesLimit}</strong> free trial minutes available. Upgrade to Professional anytime to unlock unlimited exports, speaker diarization, and 1,000 monthly minutes.
              </p>
            </div>

            <button
              onClick={onUpgradeClick}
              className="px-6 py-3 rounded-xl bg-[#38bdf8] text-[#020617] font-bold text-sm hover:bg-sky-300 transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <span>Upgrade to Professional</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expired Banner */}
      {isExpired && (
        <div className="bg-red-950/40 border border-red-500/40 p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-red-200">Your 7-Day Free Trial Has Ended</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Choose a subscription plan to continue transcribing new audio and video files. All your existing transcripts and exports remain safely preserved in your library.
                </p>
              </div>
            </div>
            <button
              onClick={onUpgradeClick}
              className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all shrink-0 cursor-pointer shadow-lg"
            >
              Select a Plan to Continue
            </button>
          </div>
        </div>
      )}

      {/* Subscription Summary & Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Plan</span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                isTrial
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                  : isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : isCancelled
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}>
                {isTrial ? "Trial" : isCancelled ? "Cancels at End of Period" : status.toUpperCase()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-1">
              {subscription?.planName || "Starter Trial"}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {subscription?.billingCycle === "annual" ? "Annual Billing ($100/yr)" : "Monthly Billing"}
            </p>

            <div className="space-y-2 pt-3 border-t border-[#1e293b] text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Next Billing Date:</span>
                <span className="font-mono text-slate-200">
                  {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Provider:</span>
                <span className="font-mono text-[#38bdf8] capitalize">{subscription?.paymentProvider || "Stripe"}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#1e293b] flex items-center gap-3">
            {isCancelled ? (
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reactivating ? "animate-spin" : ""}`} />
                <span>Reactivate Subscription</span>
              </button>
            ) : !isTrial && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-semibold text-xs transition-all cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Minutes Usage Meter Card */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Minutes Usage</span>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5">
                  {minutesUsed} <span className="text-slate-400 font-normal text-sm">/ {minutesLimit} minutes used</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#38bdf8] font-mono">{minutesRemaining}</span>
                <span className="block text-[11px] text-slate-400">minutes remaining</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-[#020617] rounded-full overflow-hidden p-0.5 border border-[#1e293b] mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 90
                    ? "bg-red-500"
                    : usagePercentage > 70
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-sky-500 to-[#38bdf8]"
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
                <span className="block text-slate-400 text-[11px] mb-0.5">Used</span>
                <span className="font-bold text-slate-200 font-mono">{minutesUsed} mins</span>
              </div>
              <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
                <span className="block text-slate-400 text-[11px] mb-0.5">Allowance</span>
                <span className="font-bold text-[#38bdf8] font-mono">{minutesLimit} mins</span>
              </div>
              <div className="p-3 bg-[#020617] rounded-xl border border-[#1e293b]">
                <span className="block text-slate-400 text-[11px] mb-0.5">Quota Utilization</span>
                <span className="font-bold text-emerald-400 font-mono">{usagePercentage}%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span>Quota automatically renews each billing cycle</span>
            <button
              onClick={onUpgradeClick}
              className="text-[#38bdf8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Need more minutes? Upgrade Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method & Invoices Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Card */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#38bdf8]" />
              <span>Payment Method</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              SECURE
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#020617] border border-[#1e293b] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center font-bold text-[10px] text-sky-400">
                  VISA
                </div>
                <span className="text-xs font-mono text-slate-200">&bull;&bull;&bull;&bull; 4242</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Exp 12/28</span>
            </div>
            <p className="text-[11px] text-slate-400">Tokenized & processed securely via Stripe</p>
          </div>

          <button
            onClick={() => alert("Payment Method Update: Stripe customer portal tokenized update initialized.")}
            className="w-full py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Update Payment Method
          </button>
        </div>

        {/* Invoice History Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#38bdf8]" />
              <span>Billing History & Receipts</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{invoices.length} Invoices</span>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center bg-[#020617] rounded-xl border border-[#1e293b] text-xs text-slate-400">
              No invoices generated yet. Your trial period is free of charge.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1e293b] text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Invoice</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#020617]/50 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-slate-200 font-medium">{inv.invoiceNumber}</td>
                      <td className="py-3.5 text-slate-400">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="py-3.5 text-slate-300">{inv.planName}</td>
                      <td className="py-3.5 font-mono text-slate-200 font-bold">${inv.amount.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => handleDownloadInvoice(inv)}
                          disabled={downloadingInvoiceId === inv.id}
                          className="p-1.5 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-[#38bdf8] transition-colors cursor-pointer"
                          title="Download Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Retention Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-100">Cancel Your Subscription?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You still have <strong className="text-white">{minutesRemaining} minutes</strong> left in your current period. If you cancel, your subscription will not renew, but you will retain full access until {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "the end of your period"}.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400">Reason for cancellation (optional):</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">Select a reason...</option>
                <option value="finished_project">Finished my transcription project</option>
                <option value="too_expensive">Looking for a different price point</option>
                <option value="missing_features">Needed additional export or language features</option>
                <option value="temporary">Temporary pause</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-xs hover:bg-sky-300 transition-all cursor-pointer"
              >
                Keep My Subscription
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold text-xs transition-all cursor-pointer"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
