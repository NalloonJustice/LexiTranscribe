export interface TranscriptSegment {
  id?: string;
  speaker: string;
  start: string; // e.g. "00:00:12"
  end: string;   // e.g. "00:00:18"
  text: string;
  confidence?: number;
}

export interface AIInsights {
  executiveSummary?: string;
  keyMoments?: Array<{ timestamp: string; title: string; description: string }>;
  actionItems?: string[];
  sentimentAnalysis?: {
    overall: string;
    confidenceScore: number;
    pacing?: string;
  };
  entities?: string[];
  topics?: string[];
  deepThinkingAnalysis?: string;
}

export type ProcessingStep = "validating" | "extracting" | "transcribing" | "formatting" | "completed";

export interface TranscriptProject {
  id: string;
  userId: string;
  fileName: string;
  fileSize: string;
  duration: string;
  durationMinutes?: number;
  format: string;
  status: "processing" | "completed" | "error" | "cancelled";
  progress: number;
  currentStep: ProcessingStep;
  model: string;
  fullText?: string;
  segments?: TranscriptSegment[];
  aiInsights?: AIInsights;
  videoUrl?: string;
  audioUrl?: string;
  sourceType?: "file" | "youtube" | "vimeo" | "loom" | "tiktok" | "url" | "podcast";
  sourceUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  createdAt: number;
  updatedAt: number;
  terminalLogs?: string[];
  sessionHexId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: "gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite";
  systemRole?: string;
  timestamp: number;
}

export interface VeoVideoProject {
  id: string;
  prompt: string;
  aspectRatio: "16:9" | "9:16";
  status: "GENERATING" | "COMPLETED" | "FAILED";
  videoUrl?: string;
  createdAt: number;
}

export interface LiveVoiceSessionMessage {
  id: string;
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
}

// User & Authentication Models
export type UserRole = "user" | "admin" | "superadmin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  organization?: string;
  country?: string;
  role: UserRole;
  emailVerified: boolean;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  status: "active" | "disabled" | "pending_verification";
}

// Subscription & Billing Models
export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired" | "payment_failed";

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

export interface UserSubscription {
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
  pdfUrl?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  paidUsers: number;
  expiredTrials: number;
  monthlyRevenue: number;
  annualRevenue: number;
  totalTranscribedMinutes: number;
}

