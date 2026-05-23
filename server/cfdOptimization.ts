/**
 * CFD Swing Trading Optimization Module
 * Tailored for platforms like Exness, IC Markets, OANDA
 */

import type { TradeSignal, ConvictionType } from "../shared/types";

/**
 * Calculate position size for CFD trading with risk management
 */
export interface PositionSizingParams {
  accountBalance: number; // Account size in USD
  riskPercentage: number; // % of account to risk (typically 1-5%)
  entryPrice: number;
  stopLossPrice: number;
  leverage: number; // 1-10x
}

export function calculateCFDPositionSize(params: PositionSizingParams): {
  contractSize: number;
  riskAmount: number;
  potentialLoss: number;
} {
  const { accountBalance, riskPercentage, entryPrice, stopLossPrice, leverage } = params;

  // Calculate risk amount in USD
  const riskAmount = (accountBalance * riskPercentage) / 100;

  // Calculate pips/points risk
  const pointsRisk = Math.abs(entryPrice - stopLossPrice);

  // Calculate contract size
  // For crude oil: 1 contract = 1000 barrels
  // Pip value depends on contract size and leverage
  const pipValue = 1; // Simplified: $1 per pip per contract
  const contractSize = riskAmount / (pointsRisk * pipValue * leverage);

  return {
    contractSize: Math.round(contractSize * 100) / 100,
    riskAmount,
    potentialLoss: contractSize * pointsRisk * pipValue,
  };
}

/**
 * Calculate break-even and profit target pips
 */
export interface PipsCalculationParams {
  entryPrice: number;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  target3Price: number;
}

export function calculatePips(params: PipsCalculationParams): {
  breakEvenPips: number;
  stopLossPips: number;
  profitTarget1Pips: number;
  profitTarget2Pips: number;
  profitTarget3Pips: number;
} {
  const { entryPrice, stopLossPrice, target1Price, target2Price, target3Price } = params;

  // For crude oil, 1 pip = 0.01
  const pipValue = 0.01;

  return {
    breakEvenPips: Math.round(Math.abs(entryPrice - entryPrice) / pipValue),
    stopLossPips: Math.round(Math.abs(entryPrice - stopLossPrice) / pipValue),
    profitTarget1Pips: Math.round(Math.abs(target1Price - entryPrice) / pipValue),
    profitTarget2Pips: Math.round(Math.abs(target2Price - entryPrice) / pipValue),
    profitTarget3Pips: Math.round(Math.abs(target3Price - entryPrice) / pipValue),
  };
}

/**
 * Determine CFD suitability based on market conditions
 */
export interface CFDSuitabilityParams {
  volatility: number; // 0-100
  liquidity: number; // 0-100
  trendStrength: number; // 0-100
  riskRewardRatio: number;
  conviction: ConvictionType;
}

export function determineCFDSuitability(params: CFDSuitabilityParams): "EXCELLENT" | "GOOD" | "MODERATE" | "POOR" {
  const { volatility, liquidity, trendStrength, riskRewardRatio, conviction } = params;

  let score = 0;

  // Volatility check (moderate volatility is best for swing trading)
  if (volatility >= 30 && volatility <= 70) {
    score += 25;
  } else if (volatility >= 20 && volatility <= 80) {
    score += 15;
  } else if (volatility > 80) {
    score -= 10; // Too volatile
  }

  // Liquidity check (high liquidity is essential for CFDs)
  if (liquidity >= 80) {
    score += 25;
  } else if (liquidity >= 60) {
    score += 15;
  } else {
    score -= 20; // Poor liquidity
  }

  // Trend strength check
  if (trendStrength >= 60) {
    score += 20;
  } else if (trendStrength >= 40) {
    score += 10;
  }

  // Risk/Reward check
  if (riskRewardRatio >= 2) {
    score += 15;
  } else if (riskRewardRatio >= 1.5) {
    score += 10;
  } else if (riskRewardRatio < 1) {
    score -= 15;
  }

  // Conviction check
  if (conviction === "HIGH") {
    score += 15;
  } else if (conviction === "MEDIUM") {
    score += 5;
  }

  if (score >= 90) {
    return "EXCELLENT";
  } else if (score >= 70) {
    return "GOOD";
  } else if (score >= 50) {
    return "MODERATE";
  } else {
    return "POOR";
  }
}

/**
 * Calculate recommended leverage based on multiple factors
 */
export interface LeverageParams {
  riskRewardRatio: number;
  volatility: number;
  conviction: ConvictionType;
  accountExperience: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; // Optional
}

export function calculateRecommendedLeverage(params: LeverageParams): number {
  const { riskRewardRatio, volatility, conviction, accountExperience = "INTERMEDIATE" } = params;

  let leverage = 1;

  // Base leverage on R:R ratio
  if (riskRewardRatio >= 3) {
    leverage = 5;
  } else if (riskRewardRatio >= 2) {
    leverage = 3;
  } else if (riskRewardRatio >= 1.5) {
    leverage = 2;
  }

  // Adjust for volatility (reduce leverage in high volatility)
  if (volatility > 75) {
    leverage = Math.max(1, leverage - 2);
  } else if (volatility > 60) {
    leverage = Math.max(1, leverage - 1);
  }

  // Adjust for conviction
  if (conviction === "LOW") {
    leverage = Math.max(1, leverage - 1);
  }

  // Adjust for experience level
  if (accountExperience === "BEGINNER") {
    leverage = Math.min(2, leverage);
  } else if (accountExperience === "INTERMEDIATE") {
    leverage = Math.min(5, leverage);
  }

  return Math.min(10, leverage); // Cap at 10x (Exness limit)
}

/**
 * Calculate maximum drawdown expectations
 */
export interface DrawdownParams {
  volatility: number;
  leverage: number;
  winProbability: number;
}

export function calculateExpectedDrawdown(params: DrawdownParams): number {
  const { volatility, leverage, winProbability } = params;

  // Base drawdown from volatility
  const volatilityDrawdown = (volatility / 100) * 5; // 0-5%

  // Leverage multiplier
  const leverageMultiplier = Math.log(leverage + 1); // Log scale to avoid extreme values

  // Win probability adjustment (lower win rate = higher expected drawdown)
  const winRateAdjustment = (1 - winProbability / 100) * 2;

  const expectedDrawdown = volatilityDrawdown * leverageMultiplier + winRateAdjustment;

  return Math.min(25, expectedDrawdown); // Cap at 25%
}

/**
 * Optimize trade signal for CFD platforms
 */
export function optimizeForCFD(
  originalSignal: TradeSignal,
  volatility: number,
  leverage: number
): Partial<TradeSignal> {
  const { entryLow, entryHigh, stopLoss, target1, target2, rrRatio, conviction } = originalSignal;

  // Recalculate position size
  const positionSizePercent = Math.max(1, Math.min(5, 2 / leverage)); // Inverse relationship with leverage

  // Calculate pips
  const entryMid = (entryLow + entryHigh) / 2;
  const breakEvenPips = Math.round(Math.abs(entryMid - stopLoss) / 0.01);

  // Determine CFD suitability
  const cfdsuitability = determineCFDSuitability({
    volatility,
    liquidity: 90, // Crude oil is highly liquid
    trendStrength: 70, // Assume moderate trend
    riskRewardRatio: rrRatio,
    conviction,
  });

  // Calculate recommended leverage
  const recommendedLeverage = calculateRecommendedLeverage({
    riskRewardRatio: rrRatio,
    volatility,
    conviction,
    accountExperience: "INTERMEDIATE",
  });

  // Calculate max drawdown
  const maxDrawdown = calculateExpectedDrawdown({
    volatility,
    leverage: recommendedLeverage,
    winProbability: 55, // Default assumption
  });

  return {
    positionSizePercent,
    maxDrawdown,
    cfdsuitability,
    recommendedLeverage,
    breakEvenPips,
  };
}

/**
 * Generate CFD-specific trading checklist
 */
export function generateCFDChecklist(signal: TradeSignal): string[] {
  const checklist: string[] = [];

  // Risk management checks
  checklist.push(`✓ Position size: ${signal.positionSizePercent}% of account`);
  checklist.push(`✓ Stop loss: ${signal.stopLoss} (${signal.keyRisks?.[0] || "risk defined"})`);
  checklist.push(`✓ Risk/Reward: 1:${signal.rrRatio.toFixed(1)}`);

  // Entry checks
  checklist.push(`✓ Entry zone: ${signal.entryLow.toFixed(2)} - ${signal.entryHigh.toFixed(2)}`);
  checklist.push(`✓ Conviction: ${signal.conviction}`);

  // Exit checks
  checklist.push(`✓ TP1: ${signal.target1.toFixed(2)} (${signal.profitTarget1Pips || "TBD"} pips)`);
  checklist.push(`✓ TP2: ${signal.target2.toFixed(2)} (${signal.profitTarget2Pips || "TBD"} pips)`);
  checklist.push(`✓ TP3: ${signal.target3?.toFixed(2) || "N/A"} (${signal.profitTarget3Pips || "TBD"} pips)`);

  // Timeframe
  checklist.push(`✓ Timeframe: ${signal.timeframe}`);

  // Leverage
  checklist.push(`✓ Recommended leverage: ${signal.recommendedLeverage || "1-2"}x`);

  // CFD suitability
  checklist.push(`✓ CFD suitability: ${signal.cfdsuitability || "GOOD"}`);

  return checklist;
}
