/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─────────────────────────────────────────────────────────────
// Crude Oil Intelligence Terminal Types - Enhanced for Swing Trading
// ─────────────────────────────────────────────────────────────

export type TierType = "Geopolitical" | "Supply/Demand" | "Technical" | "Macro";
export type SentimentType = "BULLISH" | "BEARISH" | "NEUTRAL";
export type UrgencyType = "BREAKING" | "HIGH" | "MEDIUM" | "WATCH";
export type DirectionType = "BULLISH" | "BEARISH" | "NEUTRAL";
export type StanceType = "LONG" | "SHORT" | "NEUTRAL";
export type ConvictionType = "HIGH" | "MEDIUM" | "LOW";
export type VolatilityType = "EXTREME" | "HIGH" | "MEDIUM" | "LOW";
export type TrendType = "UPTREND" | "DOWNTREND" | "RANGING";
export type CFDSuitabilityType = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

/**
 * Individual news item with comprehensive market impact analysis
 */
export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  tier: TierType;
  impactScore: number; // 1-10, immediate price impact potential
  marketMoveWeight: number; // 0-100, ability to move market significantly
  direction: DirectionType;
  urgency: UrgencyType;
  timeAgo: string; // e.g., "30m", "2h", "Yesterday"
  
  // Enhanced swing trading metrics
  analysis: string; // Detailed per-item analysis
  keyFactors: string[]; // Specific drivers and catalysts
  timeframe: "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
  affectedPairs: string[]; // e.g., ["WTI", "Brent", "USD", "Equities"]
  volatilityImpact: VolatilityType;
  correlationStrength: number; // 0-100, how strongly correlated to price
  historicalPrecedent?: string; // Similar past events and outcomes
  tradingOpportunity: "HIGH" | "MEDIUM" | "LOW"; // Swing trading specific
}

/**
 * Technical setup analysis
 */
export interface TechnicalSetup {
  trend: TrendType;
  trendStrength: number; // 0-100
  currentPrice: number;
  resistance: number[];
  support: number[];
  volatility: number; // ATR-like metric
  rsi: number; // 0-100
  macd: "BULLISH" | "BEARISH" | "NEUTRAL";
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  keyLevels: {
    strongResistance: number;
    strongSupport: number;
  };
}

/**
 * Fundamental metrics for holistic analysis
 */
export interface FundamentalMetrics {
  supplyDemandBalance: number; // -100 to +100 (negative = oversupply)
  geopoliticalRisk: number; // 0-100
  macroEnvironment: number; // 0-100 (bullish indicator)
  inventoryTrend: "RISING" | "FALLING" | "STABLE";
  sprInventory: number; // Strategic Petroleum Reserve level
  opecProduction: number; // OPEC production level
  refiningMargins: number; // Crack spread
  usdStrength: number; // 0-100 (inverse correlation with oil)
  equitiesCorrelation: number; // -100 to +100
}

/**
 * Risk factors and considerations
 */
export interface RiskFactor {
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  impact: string; // How it affects the trade
}

/**
 * Market impact summary for holistic view
 */
export interface MarketImpactSummary {
  totalBullishWeight: number; // Sum of all bullish news weights
  totalBearishWeight: number; // Sum of all bearish news weights
  netSentiment: number; // -100 to +100
  dominantFactors: string[]; // Top 3-5 market drivers
  consensusStrength: number; // 0-100, how aligned signals are
}

/**
 * Trade signal recommendation optimized for swing trading CFDs
 */
export interface TradeSignal {
  stance: StanceType;
  conviction: ConvictionType;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  rrRatio: number; // Risk/Reward ratio
  timeframe: string; // e.g., "4-8 days"
  rationale: string;
  keyRisks: string[];
  contract: string; // e.g., "Brent Crude Front Month (LCOc1)"
  
  // Enhanced swing trading metrics
  positionSizePercent: number; // % of account to risk (e.g., 2-5%)
  maxDrawdown: number; // Expected max drawdown %
  winProbability: number; // 0-100, historical win rate
  technicalConfirmation: string; // Key technical levels supporting trade
  fundamentalScore: number; // 0-100, weighted fundamental strength
  sentimentScore: number; // 0-100, market sentiment alignment
  volatilityAdjustment: number; // Multiplier for volatility (0.5-2.0)
  cfdsuitability: CFDSuitabilityType; // CFD-specific suitability
  recommendedLeverage: number; // 1-10x for Exness, IC Markets, etc
  breakEvenPips: number; // Pips to breakeven
  profitTarget1Pips: number;
  profitTarget2Pips: number;
  profitTarget3Pips: number;
  swingTradingScore: number; // 0-100, overall swing trading viability
}

/**
 * Complete intelligence report returned from the server
 * Enhanced for holistic swing trading decision making
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
  news: NewsItem[]; // Now 70 items instead of 10
  tradeSignal: TradeSignal;
  
  // Enhanced holistic metrics
  technicalSetup: TechnicalSetup;
  fundamentalMetrics: FundamentalMetrics;
  riskFactors: RiskFactor[];
  marketImpactSummary: MarketImpactSummary;
  
  // Swing trading specific
  holisticDecisionFramework: {
    technicalScore: number; // 0-100
    fundamentalScore: number; // 0-100
    sentimentScore: number; // 0-100
    riskRewardScore: number; // 0-100
    overallTradeability: number; // 0-100
    recommendedAction: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  };
  
  // Macro context
  macroContext: {
    federalReservePolicy: string;
    globalGrowthOutlook: string;
    currencyTrends: string;
    equityMarketHealth: string;
  };
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
