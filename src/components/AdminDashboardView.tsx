import React, { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Search, 
  Gift, 
  Sparkles,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Building,
  Calendar
} from "lucide-react";
import type { AdminStats } from "../types";

interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  status: "active" | "disabled" | "pending_verification";
  organization?: string;
  country?: string;
  emailVerified: boolean;
  createdAt: number;
  lastLoginAt?: number;
  subscription: {
    planName: string;
    status: string;
    billingCycle: string;
    minutesUsed: number;
    minutesLimit: number;
    currentPeriodEnd?: number;
  } | null;
}

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForBonus, setSelectedUserForBonus] = useState<AdminUserItem | null>(null);
  const [bonusMinutes, setBonusMinutes] = useState(100);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (user: AdminUserItem) => {
    const newStatus = user.status === "active" ? "disabled" : "active";
    try {
      const res = await fetch(`/api/admin/user/${user.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
        setActionSuccessMessage(`User ${user.email} marked as ${newStatus}.`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update user status:", err);
    }
  };

  const handleGrantMinutes = async () => {
    if (!selectedUserForBonus) return;
    try {
      const res = await fetch(`/api/admin/user/${selectedUserForBonus.id}/grant-minutes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: bonusMinutes })
      });
      if (res.ok) {
        setActionSuccessMessage(`Granted ${bonusMinutes} bonus minutes to ${selectedUserForBonus.email}.`);
        setSelectedUserForBonus(null);
        fetchAdminData();
        setTimeout(() => setActionSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to grant bonus minutes:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="admin-dashboard-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-xs font-mono font-semibold text-[#38bdf8] uppercase tracking-wider">
              ADMINISTRATIVE COMMAND CONSOLE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            SaaS Management & Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time subscriber analytics, trial conversion telemetry, and user access controls.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 border border-[#1e293b] text-slate-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {stats?.totalUsers ?? users.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            &bull; {stats?.trialUsers ?? 0} Trialing / {stats?.paidUsers ?? 0} Paid
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${stats?.monthlyRevenue ?? 0} <span className="text-xs text-slate-400">/mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            &bull; ARR: ${(stats?.annualRevenue ?? 0) + (stats?.monthlyRevenue ?? 0) * 12}
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Minutes</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {(stats?.totalTranscribedMinutes ?? 0).toLocaleString()} mins
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">&bull; Consumed across all accounts</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trial Status</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {stats?.trialUsers ?? 0} Active
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            &bull; {stats?.expiredTrials ?? 0} Expired Trials
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e293b]">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#38bdf8]" />
              <span>User Accounts & Subscription Entitlements</span>
            </h2>
            <p className="text-xs text-slate-400">Search registered users, audit usage quotas, and manage status.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or email..."
              className="w-full bg-[#020617] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 font-semibold">
                <th className="pb-3 pl-2">User / Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Quota (Used / Total)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredUsers.map((user) => {
                const sub = user.subscription;
                const isUserAdmin = user.role === "admin";
                const isUserActive = user.status === "active";

                return (
                  <tr key={user.id} className="hover:bg-[#020617]/50 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="font-semibold text-slate-100">{user.fullName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{user.email}</div>
                    </td>

                    <td className="py-3.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isUserAdmin ? "bg-sky-500/15 text-sky-400 border border-sky-500/30" : "bg-slate-800 text-slate-300"
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-300">
                      <span className="font-semibold text-slate-100">{sub?.planName || "Trial"}</span>
                      {sub?.billingCycle && (
                        <span className="block text-[10px] text-slate-400 capitalize">{sub.billingCycle}</span>
                      )}
                    </td>

                    <td className="py-3.5 font-mono">
                      <span className="text-slate-200 font-bold">{sub?.minutesUsed || 0}</span>
                      <span className="text-slate-400"> / {sub?.minutesLimit || 120} mins</span>
                    </td>

                    <td className="py-3.5">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        isUserActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForBonus(user)}
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-[#38bdf8] transition-colors cursor-pointer"
                          title="Grant Bonus Minutes"
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isUserActive
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          }`}
                          title={isUserActive ? "Disable User" : "Enable User"}
                        >
                          {isUserActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Bonus Minutes Dialog */}
      {selectedUserForBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-sky-500/15 border border-sky-500/30 mx-auto flex items-center justify-center text-[#38bdf8]">
              <Gift className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-100">Grant Bonus Minutes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Allocate extra transcription minutes to <strong className="text-white">{selectedUserForBonus.email}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minutes to Add:</label>
              <input
                type="number"
                min="10"
                step="10"
                value={bonusMinutes}
                onChange={(e) => setBonusMinutes(Number(e.target.value))}
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForBonus(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1e293b] text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantMinutes}
                className="flex-1 py-2.5 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-xs hover:bg-sky-300 transition-all cursor-pointer shadow-md shadow-sky-500/10"
              >
                Grant Minutes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
