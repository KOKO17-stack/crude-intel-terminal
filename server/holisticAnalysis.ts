/**
 * Holistic Decision Framework for Swing Trading Oil CFDs
 * Fuses technical + fundamental + sentiment into unified trading signals
 */

import type { IntelligenceReport, NewsItem, TechnicalSetup, FundamentalMetrics } from "../shared/types";

/**
 * Calculate technical score based on trend, momentum, and key levels
 */
export function calculateTechnicalScore(technical: TechnicalSetup): number {
  let score = 50; // Start at neutral

  // Trend strength contribution (max +/- 25 points)
  if (technical.trend === "UPTREND") {
    score += (technical.trendStrength / 100) * 25;
  } else if (technical.trend === "DOWNTREND") {
    score -= (technical.trendStrength / 100) * 25;
  }

  // RSI contribution (max +/- 15 points)
  if (technical.rsi > 70) {
    score -= 5; // Overbought
  } else if (technical.rsi < 30) {
    score += 5; // Oversold
  } else if (technical.rsi > 60) {
    score += 8; // Strong momentum
  } else if (technical.rsi < 40) {
    score -= 8; // Weak momentum
  }

  // MACD contribution (max +/- 10 points)
  if (technical.macd === "BULLISH") {
    score += 10;
  } else if (technical.macd === "BEARISH") {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate fundamental score based on supply/demand, geopolitical risk, macro environment
 */
export function calculateFundamentalScore(fundamental: FundamentalMetrics): number {
  let score = 50; // Start at neutral

  // Supply/demand balance (max +/- 30 points)
  // Positive = oversupply (bearish), Negative = undersupply (bullish)
  const supplyDemandContribution = (-fundamental.supplyDemandBalance / 100) * 30;
  score += supplyDemandContribution;

  // Geopolitical risk (max +/- 20 points)
  // Higher risk = potential supply disruption = bullish
  const geoRiskContribution = ((fundamental.geopoliticalRisk - 50) / 50) * 20;
  score += geoRiskContribution;

  // Macro environment (max +/- 20 points)
  const macroContribution = ((fundamental.macroEnvironment - 50) / 50) * 20;
  score += macroContribution;

  // Inventory trend (max +/- 15 points)
  if (fundamental.inventoryTrend === "RISING") {
    score -= 15; // Bearish
  } else if (fundamental.inventoryTrend === "FALLING") {
    score += 15; // Bullish
  }

  // USD strength (inverse correlation) (max +/- 15 points)
  // Higher USD = lower oil prices = bearish
  const usdContribution = ((50 - fundamental.usdStrength) / 50) * 15;
  score += usdContribution;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate sentiment score from news items and market impact weighting
 */
export function calculateSentimentScore(news: NewsItem[]): number {
  if (news.length === 0) return 50;

  let totalBullishWeight = 0;
  let totalBearishWeight = 0;

  for (const item of news) {
    const weight = item.marketMoveWeight || item.impactScore * 10;

    if (item.direction === "BULLISH") {
      totalBullishWeight += weight;
    } else if (item.direction === "BEARISH") {
      totalBearishWeight += weight;
    }
  }

  const totalWeight = totalBullishWeight + totalBearishWeight;
  if (totalWeight === 0) return 50;

  // Convert to 0-100 scale (50 = neutral)
  const sentiment = 50 + ((totalBullishWeight - totalBearishWeight) / totalWeight) * 50;
  return Math.max(0, Math.min(100, sentiment));
}

/**
 * Calculate risk/reward score based on entry, stops, and targets
 */
export function calculateRiskRewardScore(
  entryLow: number,
  entryHigh: number,
  stopLoss: number,
  target1: number,
  target2: number,
  target3: number
): number {
  const entryMid = (entryLow + entryHigh) / 2;
  const risk = Math.abs(entryMid - stopLoss);
  const reward = Math.abs(target3 - entryMid);

  if (risk === 0) return 50;

  const rrRatio = reward / risk;

  // Score based on R:R ratio
  // 1:1 = 50, 2:1 = 75, 3:1 = 90, 0.5:1 = 25, etc.
  let score = 50 + (rrRatio - 1) * 25;

  return Math.max(0, Math.min(100, score));
}

/**
 * Fuse all scores into holistic trading decision
 */
export function calculateHolisticScore(
  technicalScore: number,
  fundamentalScore: number,
  sentimentScore: number,
  riskRewardScore: number
): {
  overallTradeability: number;
  recommendedAction: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
} {
  // Weighted average (can adjust weights based on preference)
  const weights = {
    technical: 0.35,
    fundamental: 0.35,
    sentiment: 0.20,
    riskReward: 0.10,
  };

  const overallTradeability =
    technicalScore * weights.technical +
    fundamentalScore * weights.fundamental +
    sentimentScore * weights.sentiment +
    riskRewardScore * weights.riskReward;

  let recommendedAction: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";

  if (overallTradeability >= 75) {
    recommendedAction = "STRONG_BUY";
  } else if (overallTradeability >= 60) {
    recommendedAction = "BUY";
  } else if (overallTradeability >= 40) {
    recommendedAction = "HOLD";
  } else if (overallTradeability >= 25) {
    recommendedAction = "SELL";
  } else {
    recommendedAction = "STRONG_SELL";
  }

  return {
    overallTradeability: Math.round(overallTradeability),
    recommendedAction,
  };
}

/**
 * Calculate position sizing based on account risk and volatility
 */
export function calculatePositionSizing(
  accountRiskPercent: number = 2, // Risk 2% of account per trade
  volatility: number,
  leverage: number = 1
): number {
  // Adjust position size based on volatility
  // Higher volatility = smaller position
  const volatilityAdjustment = Math.max(0.5, 2 - volatility / 50);

  return (accountRiskPercent * volatilityAdjustment) / leverage;
}

/**
 * Calculate optimal leverage for CFD trading
 */
export function calculateOptimalLeverage(
  riskRewardRatio: number,
  volatility: number,
  conviction: "HIGH" | "MEDIUM" | "LOW"
): number {
  let baseLeverage = 1;

  // Higher R:R allows more leverage
  if (riskRewardRatio >= 3) {
    baseLeverage = 5;
  } else if (riskRewardRatio >= 2) {
    baseLeverage = 3;
  } else if (riskRewardRatio >= 1.5) {
    baseLeverage = 2;
  }

  // Reduce leverage for high volatility
  if (volatility > 75) {
    baseLeverage = Math.max(1, baseLeverage - 2);
  } else if (volatility > 50) {
    baseLeverage = Math.max(1, baseLeverage - 1);
  }

  // Reduce leverage for low conviction
  if (conviction === "LOW") {
    baseLeverage = Math.max(1, baseLeverage - 1);
  }

  return Math.min(10, baseLeverage); // Cap at 10x
}

/**
 * Calculate expected drawdown based on volatility and position size
 */
export function calculateMaxDrawdown(volatility: number, leverage: number): number {
  // ATR-like volatility to drawdown conversion
  // Higher volatility and leverage = higher expected drawdown
  const baseDrawdown = (volatility / 100) * 5; // 0-5% base
  return Math.min(20, baseDrawdown * leverage);
}

/**
 * Calculate win probability based on technical + fundamental confluence
 */
export function calculateWinProbability(
  technicalScore: number,
  fundamentalScore: number,
  sentimentScore: number
): number {
  // Confluence = when all three align
  const avgScore = (technicalScore + fundamentalScore + sentimentScore) / 3;

  // Base win probability
  let winProb = 45; // Baseline

  // Add points for confluence
  if (technicalScore > 60 && fundamentalScore > 60 && sentimentScore > 60) {
    winProb = 65; // Strong confluence
  } else if (technicalScore > 55 && fundamentalScore > 55) {
    winProb = 58; // Good confluence
  } else if (avgScore > 60) {
    winProb = 52; // Moderate confluence
  }

  return Math.min(75, winProb); // Cap at 75%
}

/**
 * Generate holistic decision framework
 */
export function generateHolisticFramework(report: IntelligenceReport) {
  const technicalScore = calculateTechnicalScore(report.technicalSetup);
  const fundamentalScore = calculateFundamentalScore(report.fundamentalMetrics);
  const sentimentScore = calculateSentimentScore(report.news);
  const riskRewardScore = calculateRiskRewardScore(
    report.tradeSignal.entryLow,
    report.tradeSignal.entryHigh,
    report.tradeSignal.stopLoss,
    report.tradeSignal.target1,
    report.tradeSignal.target2,
    report.tradeSignal.target3
  );

  const { overallTradeability, recommendedAction } = calculateHolisticScore(
    technicalScore,
    fundamentalScore,
    sentimentScore,
    riskRewardScore
  );

  return {
    technicalScore,
    fundamentalScore,
    sentimentScore,
    riskRewardScore,
    overallTradeability,
    recommendedAction,
  };
}
