/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─────────────────────────────────────────────────────────────
// Crude Oil Intelligence Terminal Types
// ─────────────────────────────────────────────────────────────

export type TierType = "Geopolitical" | "Supply/Demand" | "Technical" | "Macro";
export type SentimentType = "BULLISH" | "BEARISH" | "NEUTRAL";
export type UrgencyType = "BREAKING" | "HIGH" | "MEDIUM" | "WATCH";
export type DirectionType = "BULLISH" | "BEARISH" | "NEUTRAL";
export type StanceType = "LONG" | "SHORT" | "NEUTRAL";
export type ConvictionType = "HIGH" | "MEDIUM" | "LOW";

/**
 * Individual news item in the intelligence report
 */
export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  tier: TierType;
  impactScore: number; // 1-10
  direction: DirectionType;
  urgency: UrgencyType;
  timeAgo: string; // e.g., "30m", "2h", "Yesterday"
}

/**
 * Trade signal recommendation with entry/exit levels
 */
export interface TradeSignal {
  stance: StanceType;
  conviction: ConvictionType;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  target1: number;
  target2: number;
  rrRatio: number; // Risk/Reward ratio
  timeframe: string; // e.g., "4-8 days"
  rationale: string;
  keyRisks: string[];
  contract: string; // e.g., "Brent Crude Front Month (LCOc1)"
}

/**
 * Complete intelligence report returned from the server
 */
export interface IntelligenceReport {
  fetchedAt: string; // ISO 8601 timestamp
  brentPrice: number;
  brentChange: number; // 24h USD change
  brentChangePct: number; // 24h % change
  wtiPrice: number;
  spread: number; // Brent minus WTI
  marketSentiment: SentimentType;
  sentimentScore: number; // 0-100, 50=neutral, 70+=bullish, 30-=bearish
  analystNote: string;
  news: NewsItem[];
  tradeSignal: TradeSignal;
}

/**
 * API request/response types for tRPC procedures
 */
export interface FetchIntelligenceInput {
  // Can be extended with parameters like date range, specific tickers, etc.
}

export interface FetchIntelligenceOutput {
  success: boolean;
  data?: IntelligenceReport;
  error?: string;
}
