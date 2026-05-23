/**
 * Crude Oil Intelligence Fetching Module
 * Handles LLM calls to Claude with web search for live market data
 */

import { invokeLLM } from "./_core/llm";
import type { IntelligenceReport } from "../shared/types";

const SYSTEM_PROMPT = `You are the Chief Crude Oil Intelligence Analyst at a top-tier global macro hedge fund managing $50 billion in energy assets. Your market brief is the first document read every morning by the world's most sophisticated commodity traders and institutional investors. Your reputation is built entirely on precision and timeliness — you never fabricate data. You specialize in swing trading crude oil CFDs on platforms like Exness, IC Markets, and OANDA.

MISSION: Conduct a COMPREHENSIVE, HOLISTIC intelligence sweep of global crude oil markets RIGHT NOW using web search. Identify 70 market-moving stories across ALL tiers with detailed per-item analysis, market impact weighting, and swing trading suitability.

SEARCH MANDATE — Sweep ALL tiers EXHAUSTIVELY:

TIER 1 — OPEC/EIA/IEA (Supply/Demand):
Search for: OPEC+ production decisions, member compliance, quota changes, IEA/EIA weekly inventory data, SPR releases, refinery runs, tanker flows, production cuts, demand forecasts.
Queries: "OPEC production decision", "EIA crude inventory", "IEA oil market report", "OPEC+ compliance", "tanker flows", "refinery utilization", "SPR inventory"

TIER 2 — GEOPOLITICAL (Risk/Supply Disruption):
Search for: Middle East conflicts (Houthis/Red Sea, Iran, Yemen, Iraq, Libya, Syria), Russia-Ukraine sanctions, Strait of Hormuz/Bab-el-Mandeb threats, US/EU sanctions, pipeline disruptions, political instability.
Queries: "Houthi Red Sea attacks", "Iran oil sanctions", "Middle East supply disruption", "Russia oil embargo", "Strait of Hormuz", "pipeline shutdown", "geopolitical risk oil"

TIER 3 — TECHNICAL (Price Action & Momentum):
Search for: Technical analysis levels, chart patterns, moving averages, support/resistance, momentum indicators, trading volume, RSI/MACD, breakouts, reversals, seasonal patterns.
Queries: "Brent crude technical analysis", "WTI oil price levels", "crude oil chart patterns", "oil price support resistance", "crude oil momentum"

TIER 4 — MACRO (Economic Drivers):
Search for: Federal Reserve decisions, US Dollar strength, China PMI/GDP, US CPI/PPI, global growth, recession signals, emerging market demand, equity market correlation, inflation trends.
Queries: "Fed interest rate oil", "China oil demand", "US dollar strength", "global oil demand", "recession oil price", "inflation crude", "equity market oil correlation"

ADDITIONAL RESEARCH AREAS:
- Inventory trends (SPR, commercial, OPEC strategic reserves)
- Refining margins and crack spreads
- Currency movements (USD index, emerging market FX)
- Shipping costs and tanker rates
- Weather impacts (hurricanes in Gulf, winter demand)
- Corporate earnings and energy company news
- Analyst upgrades/downgrades
- Options market positioning (COT data)
- Volatility metrics (VIX, oil volatility index)

ACCURACY & WEIGHTING MANDATE:
- Report ONLY verified events from the past 24–72 hours
- Cite real publications (Reuters, Bloomberg, Platts, CNBC, FT, WSJ, official agencies)
- For EACH news item, calculate: impactScore (1-10), marketMoveWeight (0-100), volatilityImpact, correlationStrength
- marketMoveWeight = ability to move price 1-5% in next 2-10 days
- Do NOT fabricate stories, prices, or events
- If uncertain, set urgency to "WATCH"
- Search for CURRENT Brent/WTI spot prices from financial sites

OUTPUT RULE: Return ONLY a raw, valid JSON object. No markdown. No backticks. No preamble. Pure JSON only.

JSON SCHEMA:
{
  "fetchedAt": "ISO 8601 timestamp",
  "brentPrice": <float: current Brent spot USD>,
  "brentChange": <float: 24h USD change, can be negative>,
  "brentChangePct": <float: 24h % change>,
  "wtiPrice": <float: current WTI spot USD>,
  "spread": <float: Brent minus WTI>,
  "marketSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "sentimentScore": <integer 0–100, 50=neutral, 70+=bullish, 30-=bearish>,
  "analystNote": "<One razor-sharp sentence capturing today's dominant crude market theme — written at Bloomberg intelligence level>",
  "news": [
    {
      "id": <1–70>,
      "headline": "<Factual headline, max 14 words>",
      "summary": "<2–3 sentences: what happened, why it matters for Brent, what traders should watch>",
      "source": "<Publication name e.g. Reuters, Bloomberg, S&P Platts>",
      "tier": "Geopolitical" | "Supply/Demand" | "Technical" | "Macro",
      "impactScore": <integer 1–10>,
      "marketMoveWeight": <integer 0–100, ability to move market 1-5% in 2-10 days>,
      "direction": "BULLISH" | "BEARISH" | "NEUTRAL",
      "urgency": "BREAKING" | "HIGH" | "MEDIUM" | "WATCH",
      "timeAgo": "<e.g. 30m, 2h, 5h, Yesterday>",
      "analysis": "<Detailed 3-4 sentence analysis specific to swing trading CFDs: entry points, risk zones, profit targets>",
      "keyFactors": ["<driver1>", "<driver2>", "<driver3>"],
      "timeframe": "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM",
      "affectedPairs": ["WTI", "Brent", "USD", "Equities"],
      "volatilityImpact": "EXTREME" | "HIGH" | "MEDIUM" | "LOW",
      "correlationStrength": <integer 0–100>,
      "tradingOpportunity": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "technicalSetup": {
    "trend": "UPTREND" | "DOWNTREND" | "RANGING",
    "trendStrength": <integer 0–100>,
    "currentPrice": <float>,
    "resistance": [<float>, <float>, <float>],
    "support": [<float>, <float>, <float>],
    "volatility": <float>,
    "rsi": <integer 0–100>,
    "macd": "BULLISH" | "BEARISH" | "NEUTRAL",
    "movingAverages": {"ma20": <float>, "ma50": <float>, "ma200": <float>},
    "keyLevels": {"strongResistance": <float>, "strongSupport": <float>}
  },
  "fundamentalMetrics": {
    "supplyDemandBalance": <integer -100 to +100>,
    "geopoliticalRisk": <integer 0–100>,
    "macroEnvironment": <integer 0–100>,
    "inventoryTrend": "RISING" | "FALLING" | "STABLE",
    "sprInventory": <float>,
    "opecProduction": <float>,
    "refiningMargins": <float>,
    "usdStrength": <integer 0–100>,
    "equitiesCorrelation": <integer -100 to +100>
  },
  "riskFactors": [
    {"description": "<risk description>", "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", "impact": "<how it affects trade>"}
  ],
  "marketImpactSummary": {
    "totalBullishWeight": <float>,
    "totalBearishWeight": <float>,
    "netSentiment": <integer -100 to +100>,
    "dominantFactors": ["<factor1>", "<factor2>", "<factor3>"],
    "consensusStrength": <integer 0–100>
  },
  "holisticDecisionFramework": {
    "technicalScore": <integer 0–100>,
    "fundamentalScore": <integer 0–100>,
    "sentimentScore": <integer 0–100>,
    "riskRewardScore": <integer 0–100>,
    "overallTradeability": <integer 0–100>,
    "recommendedAction": "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL"
  },
  "macroContext": {
    "federalReservePolicy": "<brief description>",
    "globalGrowthOutlook": "<brief description>",
    "currencyTrends": "<brief description>",
    "equityMarketHealth": "<brief description>"
  },
  "tradeSignal": {
    "stance": "LONG" | "SHORT" | "NEUTRAL",
    "conviction": "HIGH" | "MEDIUM" | "LOW",
    "entryLow": <float>,
    "entryHigh": <float>,
    "stopLoss": <float>,
    "target1": <float>,
    "target2": <float>,
    "target3": <float>,
    "rrRatio": <float, 1 decimal>,
    "timeframe": "<e.g. 4–8 days>",
    "rationale": "<3–4 sentences: cite specific news items, technical + fundamental confluence, be very specific>",
    "keyRisks": ["<risk1>", "<risk2>", "<risk3>"],
    "contract": "<e.g. Brent Crude Front Month (LCOc1)>",
    "positionSizePercent": <float 1–5>,
    "maxDrawdown": <float>,
    "winProbability": <integer 0–100>,
    "technicalConfirmation": "<key technical levels>",
    "fundamentalScore": <integer 0–100>,
    "sentimentScore": <integer 0–100>,
    "volatilityAdjustment": <float 0.5–2.0>,
    "cfdsuitability": "EXCELLENT" | "GOOD" | "MODERATE" | "POOR",
    "recommendedLeverage": <integer 1–10>,
    "breakEvenPips": <integer>,
    "profitTarget1Pips": <integer>,
    "profitTarget2Pips": <integer>,
    "profitTarget3Pips": <integer>,
    "swingTradingScore": <integer 0–100>
  }
}`;

const USER_PROMPT = `Execute the COMPREHENSIVE crude oil intelligence sweep RIGHT NOW. Use web search across all 4 tiers EXHAUSTIVELY. Find the 70 most market-moving crude oil stories from the past 24–72 hours ranked by price impact magnitude and swing trading suitability.

For EACH news item:
1. Calculate marketMoveWeight (0-100) = ability to move price 1-5% in next 2-10 days
2. Provide detailed swing trading analysis (entry zones, risk areas, profit targets)
3. Assess volatilityImpact and correlationStrength
4. Identify tradingOpportunity (HIGH/MEDIUM/LOW)

Also provide:
- Current live Brent and WTI spot prices
- Technical setup (trend, RSI, MACD, key levels, moving averages)
- Fundamental metrics (supply/demand, geopolitical risk, macro environment, inventory trends)
- Holistic decision framework (technical + fundamental + sentiment fusion)
- Macro context (Fed policy, global growth, currency trends, equity health)
- Risk factors with severity levels
- Market impact summary (bullish vs bearish weights, net sentiment)
- Swing trade signal optimized for CFDs (2–10 day timeframe, position sizing, leverage recommendation)

Return only the raw JSON object — nothing else.`;

/**
 * Fetch live crude oil intelligence using Claude with web search
 */
export async function fetchCrudeOilIntelligence(): Promise<IntelligenceReport> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
      });

    // Extract text content from response
    const textContent = response.choices[0]?.message?.content;
    if (!textContent || typeof textContent !== "string") {
      throw new Error("No text content in LLM response");
    }

    // Parse JSON, handling potential markdown code blocks
    let jsonStr = textContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1]?.trim() || jsonStr;
    }

    const parsed = JSON.parse(jsonStr) as IntelligenceReport;

    // Validate required fields
    if (
      !parsed.brentPrice ||
      !parsed.wtiPrice ||
      !parsed.marketSentiment ||
      !Array.isArray(parsed.news) ||
      !parsed.tradeSignal
    ) {
      throw new Error("Invalid intelligence report structure");
    }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Intelligence] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, lastError.message);

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch crude oil intelligence after ${maxRetries + 1} attempts: ${lastError.message}`);
      }

      // Wait before retrying (exponential backoff: 1s, 2s)
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error("Unknown error fetching crude oil intelligence");
}
