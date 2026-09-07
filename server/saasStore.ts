import crypto from "crypto";

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  passwordSalt: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: number;
  resetToken?: string;
  resetTokenExpiry?: number;
  role: "user" | "admin" | "superadmin";
  status: "active" | "disabled" | "pending_verification";
  organization?: string;
  country?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired" | "payment_failed";
export type BillingCycle = "monthly" | "annual";

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: number;
  trialStartDate?: number;
  trialEndDate?: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: number | null;
  paymentProvider: "stripe" | "razorpay" | "simulated";
  externalSubscriptionId?: string;
  minutesLimit: number;
  minutesUsed: number;
  createdAt: number;
  updatedAt: number;
}

export interface UsageRecord {
  id: string;
  userId: string;
  transcriptId: string;
  fileName: string;
  minutesDeducted: number;
  timestamp: number;
}

export interface BillingInvoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "failed";
  planName: string;
  billingCycle: BillingCycle;
  date: number;
}

export interface SubscriptionPlan {
  id: string;
  name: "starter" | "professional" | "business";
  displayName: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyMinutes: number;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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

// Helper: Secure password hashing
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, "sha512").toString("hex");
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return computedHash === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// In-Memory Data Store (Persisted across sessions with initial seeds)
const users = new Map<string, UserRecord>();
const subscriptions = new Map<string, UserSubscriptionRecord>();
const usages = new Map<string, UsageRecord[]>();
const invoices = new Map<string, BillingInvoice[]>();
const processedWebhookEvents = new Set<string>();
const sessions = new Map<string, string>(); // token -> userId

// Seed initial administrator (Nelson1abc2@gmail.com)
const adminId = "user-admin-nelson";
const { hash: adminHash, salt: adminSalt } = hashPassword("LexiAdmin2026!");
const now = Date.now();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

users.set(adminId, {
  id: adminId,
  email: "Nelson1abc2@gmail.com",
  fullName: "Nelson Operator",
  passwordHash: adminHash,
  passwordSalt: adminSalt,
  emailVerified: true,
  role: "admin",
  status: "active",
  organization: "Lexi Enterprise Systems",
  country: "United States",
  createdAt: now - 30 * 24 * 60 * 60 * 1000,
  updatedAt: now,
  lastLoginAt: now
});

subscriptions.set(adminId, {
  id: "sub-admin-pro",
  userId: adminId,
  planId: "plan-professional",
  planName: "Professional",
  status: "active",
  billingCycle: "monthly",
  startDate: now - 30 * 24 * 60 * 60 * 1000,
  currentPeriodStart: now - 5 * 24 * 60 * 60 * 1000,
  currentPeriodEnd: now + 25 * 24 * 60 * 60 * 1000,
  cancelAtPeriodEnd: false,
  paymentProvider: "stripe",
  externalSubscriptionId: "sub_live_948294829",
  minutesLimit: 1000,
  minutesUsed: 145,
  createdAt: now - 30 * 24 * 60 * 60 * 1000,
  updatedAt: now
});

invoices.set(adminId, [
  {
    id: "inv-1001",
    userId: adminId,
    invoiceNumber: "INV-2026-0801",
    amount: 10,
    currency: "USD",
    status: "paid",
    planName: "Professional",
    billingCycle: "monthly",
    date: now - 5 * 24 * 60 * 60 * 1000
  }
]);

// Seed standard trial user for demonstration
const demoTrialId = "user-trial-demo";
const { hash: demoHash, salt: demoSalt } = hashPassword("DemoPass123!");
users.set(demoTrialId, {
  id: demoTrialId,
  email: "sarah.creator@example.com",
  fullName: "Sarah Creator",
  passwordHash: demoHash,
  passwordSalt: demoSalt,
  emailVerified: true,
  role: "user",
  status: "active",
  organization: "Creator Media Studio",
  country: "Canada",
  createdAt: now - 2 * 24 * 60 * 60 * 1000,
  updatedAt: now,
  lastLoginAt: now - 1 * 24 * 60 * 60 * 1000
});

subscriptions.set(demoTrialId, {
  id: "sub-trial-demo",
  userId: demoTrialId,
  planId: "plan-starter",
  planName: "7-Day Free Trial",
  status: "trialing",
  billingCycle: "monthly",
  startDate: now - 2 * 24 * 60 * 60 * 1000,
  trialStartDate: now - 2 * 24 * 60 * 60 * 1000,
  trialEndDate: now + 5 * 24 * 60 * 60 * 1000,
  currentPeriodStart: now - 2 * 24 * 60 * 60 * 1000,
  currentPeriodEnd: now + 5 * 24 * 60 * 60 * 1000,
  cancelAtPeriodEnd: false,
  paymentProvider: "simulated",
  minutesLimit: 120,
  minutesUsed: 42,
  createdAt: now - 2 * 24 * 60 * 60 * 1000,
  updatedAt: now
});

// User Store Operations
export const saasStore = {
  // Users
  getUserById(id: string): UserRecord | undefined {
    return users.get(id);
  },

  getUserByEmail(email: string): UserRecord | undefined {
    const cleanEmail = email.toLowerCase().trim();
    for (const user of users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return user;
      }
    }
    return undefined;
  },

  createUser(userData: {
    email: string;
    fullName: string;
    password: string;
    organization?: string;
    country?: string;
    role?: "user" | "admin";
  }): { user: UserRecord; subscription: UserSubscriptionRecord; verificationToken: string } {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { hash, salt } = hashPassword(userData.password);
    const verificationToken = generateToken();
    const currentTime = Date.now();

    // Determine admin status
    const isAdmin = userData.email.toLowerCase() === "nelson1abc2@gmail.com" || userData.role === "admin";

    const user: UserRecord = {
      id,
      email: userData.email.toLowerCase().trim(),
      fullName: userData.fullName.trim(),
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: currentTime + 24 * 60 * 60 * 1000, // 24 hours
      role: isAdmin ? "admin" : "user",
      status: "active",
      organization: userData.organization || "",
      country: userData.country || "United States",
      createdAt: currentTime,
      updatedAt: currentTime,
      lastLoginAt: currentTime
    };

    users.set(id, user);

    // Create 7-Day Free Trial Subscription with 120 minutes allowance
    const trialSub: UserSubscriptionRecord = {
      id: `sub-trial-${Date.now()}`,
      userId: id,
      planId: "trial",
      planName: "7-Day Free Trial",
      status: "trialing",
      billingCycle: "monthly",
      startDate: currentTime,
      trialStartDate: currentTime,
      trialEndDate: currentTime + SEVEN_DAYS_MS,
      currentPeriodStart: currentTime,
      currentPeriodEnd: currentTime + SEVEN_DAYS_MS,
      cancelAtPeriodEnd: false,
      paymentProvider: "simulated",
      minutesLimit: 120, // 120 trial minutes
      minutesUsed: 0,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    subscriptions.set(id, trialSub);
    return { user, subscription: trialSub, verificationToken };
  },

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const user = users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: Date.now() };
    users.set(id, updated);
    return updated;
  },

  getAllUsers(): UserRecord[] {
    return Array.from(users.values());
  },

  // Sessions
  createSession(userId: string): string {
    const token = generateToken();
    sessions.set(token, userId);
    return token;
  },

  getUserIdBySession(token: string): string | undefined {
    return sessions.get(token);
  },

  destroySession(token: string): void {
    sessions.delete(token);
  },

  // Subscriptions
  getSubscription(userId: string): UserSubscriptionRecord | undefined {
    let sub = subscriptions.get(userId);
    if (!sub) return undefined;

    // Check if trial has expired
    const currentTime = Date.now();
    if (sub.status === "trialing" && sub.trialEndDate && currentTime > sub.trialEndDate) {
      sub.status = "expired";
      sub.updatedAt = currentTime;
      subscriptions.set(userId, sub);
    }
    return sub;
  },

  upgradeSubscription(
    userId: string,
    planName: "starter" | "professional" | "business",
    billingCycle: BillingCycle,
    paymentProvider: "stripe" | "razorpay" | "simulated" = "stripe"
  ): { subscription: UserSubscriptionRecord; invoice: BillingInvoice } {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.name === planName) || SUBSCRIPTION_PLANS[1];
    const currentTime = Date.now();
    const periodDuration = billingCycle === "annual" ? 365 * 24 * 60 * 60 * 1000 : THIRTY_DAYS_MS;
    const amount = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

    const existing = subscriptions.get(userId);
    const updatedSub: UserSubscriptionRecord = {
      id: existing?.id || `sub-${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.displayName,
      status: "active",
      billingCycle,
      startDate: existing?.startDate || currentTime,
      currentPeriodStart: currentTime,
      currentPeriodEnd: currentTime + periodDuration,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      paymentProvider,
      externalSubscriptionId: `sub_ext_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      minutesLimit: plan.monthlyMinutes,
      minutesUsed: 0, // Fresh period allocation
      createdAt: existing?.createdAt || currentTime,
      updatedAt: currentTime
    };

    subscriptions.set(userId, updatedSub);

    // Create Invoice
    const invoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      userId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount,
      currency: "USD",
      status: "paid",
      planName: plan.displayName,
      billingCycle,
      date: currentTime
    };

    const userInvoices = invoices.get(userId) || [];
    userInvoices.unshift(invoice);
    invoices.set(userId, userInvoices);

    return { subscription: updatedSub, invoice };
  },

  cancelSubscription(userId: string): UserSubscriptionRecord | undefined {
    const sub = subscriptions.get(userId);
    if (!sub) return undefined;
    sub.cancelAtPeriodEnd = true;
    sub.cancelledAt = Date.now();
    sub.updatedAt = Date.now();
    subscriptions.set(userId, sub);
    return sub;
  },

  reactivateSubscription(userId: string): UserSubscriptionRecord | undefined {
    const sub = subscriptions.get(userId);
    if (!sub) return undefined;
    sub.cancelAtPeriodEnd = false;
    sub.cancelledAt = null;
    sub.updatedAt = Date.now();
    subscriptions.set(userId, sub);
    return sub;
  },

  // Usage & Entitlement Check
  checkEntitlement(userId: string, requestedMinutes: number = 1): {
    allowed: boolean;
    reason?: string;
    remainingMinutes: number;
    minutesLimit: number;
    minutesUsed: number;
    daysRemaining?: number;
    status: SubscriptionStatus;
    planName: string;
  } {
    const sub = this.getSubscription(userId);
    if (!sub) {
      return {
        allowed: false,
        reason: "No active account or subscription found. Please sign up or log in.",
        remainingMinutes: 0,
        minutesLimit: 0,
        minutesUsed: 0,
        status: "expired",
        planName: "None"
      };
    }

    const currentTime = Date.now();
    const remaining = Math.max(0, sub.minutesLimit - sub.minutesUsed);

    // Check trial expiration
    if (sub.status === "trialing") {
      if (sub.trialEndDate && currentTime > sub.trialEndDate) {
        sub.status = "expired";
        return {
          allowed: false,
          reason: "Your 7-day free trial has ended. Choose a plan to continue transcribing.",
          remainingMinutes: remaining,
          minutesLimit: sub.minutesLimit,
          minutesUsed: sub.minutesUsed,
          daysRemaining: 0,
          status: "expired",
          planName: sub.planName
        };
      }

      const daysRemaining = Math.max(0, Math.ceil((sub.trialEndDate! - currentTime) / (24 * 60 * 60 * 1000)));

      if (remaining < requestedMinutes) {
        return {
          allowed: false,
          reason: `You have ${remaining} transcription minutes remaining in your trial, but this audio is ${requestedMinutes} minutes long. Upgrade to a paid plan to continue.`,
          remainingMinutes: remaining,
          minutesLimit: sub.minutesLimit,
          minutesUsed: sub.minutesUsed,
          daysRemaining,
          status: sub.status,
          planName: sub.planName
        };
      }

      return {
        allowed: true,
        remainingMinutes: remaining,
        minutesLimit: sub.minutesLimit,
        minutesUsed: sub.minutesUsed,
        daysRemaining,
        status: sub.status,
        planName: sub.planName
      };
    }

    // Check paid subscription active status
    if (sub.status !== "active") {
      return {
        allowed: false,
        reason: "Your subscription is not active. Please update your payment method or select a plan.",
        remainingMinutes: remaining,
        minutesLimit: sub.minutesLimit,
        minutesUsed: sub.minutesUsed,
        status: sub.status,
        planName: sub.planName
      };
    }

    if (remaining < requestedMinutes) {
      return {
        allowed: false,
        reason: `You have ${remaining} minutes remaining on your ${sub.planName} plan, but this file requires ${requestedMinutes} minutes. Upgrade your plan for more minutes.`,
        remainingMinutes: remaining,
        minutesLimit: sub.minutesLimit,
        minutesUsed: sub.minutesUsed,
        status: sub.status,
        planName: sub.planName
      };
    }

    return {
      allowed: true,
      remainingMinutes: remaining,
      minutesLimit: sub.minutesLimit,
      minutesUsed: sub.minutesUsed,
      status: sub.status,
      planName: sub.planName
    };
  },

  deductMinutes(userId: string, minutes: number, transcriptId: string, fileName: string): UsageRecord | null {
    const sub = subscriptions.get(userId);
    if (!sub) return null;

    const roundedMins = Math.max(1, Math.round(minutes));
    sub.minutesUsed += roundedMins;
    sub.updatedAt = Date.now();
    subscriptions.set(userId, sub);

    const record: UsageRecord = {
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      transcriptId,
      fileName,
      minutesDeducted: roundedMins,
      timestamp: Date.now()
    };

    const userUsages = usages.get(userId) || [];
    userUsages.unshift(record);
    usages.set(userId, userUsages);

    return record;
  },

  getUserUsageHistory(userId: string): UsageRecord[] {
    return usages.get(userId) || [];
  },

  getUserInvoices(userId: string): BillingInvoice[] {
    return invoices.get(userId) || [];
  },

  // Webhooks
  processWebhookEvent(eventId: string, eventType: string, payload: any): { success: boolean; message: string } {
    if (processedWebhookEvents.has(eventId)) {
      return { success: true, message: "Event already processed (idempotent)" };
    }

    processedWebhookEvents.add(eventId);

    const userId = payload.userId || payload.customer_id;
    if (!userId) {
      return { success: false, message: "Missing userId in webhook payload" };
    }

    switch (eventType) {
      case "payment_succeeded":
      case "subscription_created":
        if (payload.planName) {
          this.upgradeSubscription(userId, payload.planName, payload.billingCycle || "monthly", "stripe");
        }
        break;

      case "subscription_cancelled":
        this.cancelSubscription(userId);
        break;

      case "payment_failed":
        const sub = subscriptions.get(userId);
        if (sub) {
          sub.status = "payment_failed";
          subscriptions.set(userId, sub);
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return { success: true, message: `Successfully handled ${eventType}` };
  },

  // Admin stats
  getAdminStats(): {
    totalUsers: number;
    activeUsers: number;
    trialUsers: number;
    paidUsers: number;
    expiredTrials: number;
    monthlyRevenue: number;
    annualRevenue: number;
    totalTranscribedMinutes: number;
  } {
    const allUsers = Array.from(users.values());
    const allSubs = Array.from(subscriptions.values());
    let monthlyRevenue = 0;
    let annualRevenue = 0;
    let totalTranscribedMinutes = 0;

    let activeUsers = 0;
    let trialUsers = 0;
    let paidUsers = 0;
    let expiredTrials = 0;

    for (const sub of allSubs) {
      totalTranscribedMinutes += sub.minutesUsed;
      if (sub.status === "trialing") {
        trialUsers++;
        activeUsers++;
      } else if (sub.status === "active") {
        paidUsers++;
        activeUsers++;
        if (sub.billingCycle === "annual") {
          const plan = SUBSCRIPTION_PLANS.find((p) => p.displayName === sub.planName);
          annualRevenue += plan ? plan.annualPrice : 100;
        } else {
          const plan = SUBSCRIPTION_PLANS.find((p) => p.displayName === sub.planName);
          monthlyRevenue += plan ? plan.monthlyPrice : 10;
        }
      } else if (sub.status === "expired") {
        expiredTrials++;
      }
    }

    return {
      totalUsers: allUsers.length,
      activeUsers,
      trialUsers,
      paidUsers,
      expiredTrials,
      monthlyRevenue,
      annualRevenue,
      totalTranscribedMinutes
    };
  }
};
