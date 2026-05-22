/**
 * Crude Oil Intelligence Fetching Module
 * Handles LLM calls to Claude with web search for live market data
 */

import { invokeLLM } from "./_core/llm";
import type { IntelligenceReport } from "../shared/types";

const SYSTEM_PROMPT = `You are the Chief Crude Oil Intelligence Analyst at a top-tier global macro hedge fund managing $50 billion in energy assets. Your market brief is the first document read every morning by the world's most sophisticated commodity traders and institutional investors. Your reputation is built entirely on precision and timeliness — you never fabricate data.

MISSION: Conduct a live, comprehensive intelligence sweep of global crude oil markets RIGHT NOW using web search.

SEARCH MANDATE — Sweep ALL 4 tiers simultaneously:

TIER 1 — OPEC/EIA/IEA:
Search for: OPEC+ production decisions, member compliance, quota changes, IEA/EIA weekly inventory data, official energy agency statements, upcoming OPEC meeting calendars.
Queries: "OPEC production decision today", "EIA crude inventory report", "IEA oil market report", "OPEC+ compliance 2025"

TIER 2 — GEOPOLITICAL:
Search for: Middle East conflicts affecting oil transit (Houthis/Red Sea, Iran, Yemen, Iraq, Libya), Russia-Ukraine energy sanctions, Strait of Hormuz/Bab-el-Mandeb threats, US/EU sanctions on oil exporters.
Queries: "Houthi Red Sea tanker attack", "Iran oil sanctions latest", "Middle East oil supply disruption", "Russia oil embargo"

TIER 3 — TECHNICAL:
Search for: Technical analysis levels, chart patterns, moving averages, support/resistance, momentum indicators, trading volume trends.
Queries: "Brent crude technical analysis", "WTI oil price technical levels", "crude oil chart patterns"

TIER 4 — MACRO:
Search for: Federal Reserve rate decisions and commentary, US Dollar index movement, China PMI and oil demand data, US CPI/PPI prints, global growth forecasts, recession signals, emerging market demand.
Queries: "Fed interest rate crude oil", "China oil demand 2025", "US dollar oil price", "global oil demand forecast"

ACCURACY MANDATE:
- Report ONLY verified, sourced events from the past 24–72 hours
- Cite real publications (Reuters, Bloomberg, Platts, CNBC, FT, WSJ, official agency websites)
- Do NOT fabricate stories, prices, or events
- If information is uncertain or unverified, set urgency to "WATCH"
- Search for the CURRENT Brent spot price from a financial site

OUTPUT RULE: Return ONLY a raw, valid JSON object. No markdown. No backticks. No preamble. No explanation. Pure JSON only.

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
      "id": <1–10>,
      "headline": "<Factual headline, max 14 words>",
      "summary": "<2–3 sentences: what happened, why it matters for Brent, what traders should watch>",
      "source": "<Publication name e.g. Reuters, Bloomberg, S&P Platts>",
      "tier": "Geopolitical" | "Supply/Demand" | "Technical" | "Macro",
      "impactScore": <integer 1–10>,
      "direction": "BULLISH" | "BEARISH" | "NEUTRAL",
      "urgency": "BREAKING" | "HIGH" | "MEDIUM" | "WATCH",
      "timeAgo": "<e.g. 30m, 2h, 5h, Yesterday>"
    }
  ],
  "tradeSignal": {
    "stance": "LONG" | "SHORT" | "NEUTRAL",
    "conviction": "HIGH" | "MEDIUM" | "LOW",
    "entryLow": <float>,
    "entryHigh": <float>,
    "stopLoss": <float>,
    "target1": <float>,
    "target2": <float>,
    "rrRatio": <float, 1 decimal>,
    "timeframe": "<e.g. 4–8 days>",
    "rationale": "<3–4 sentences: cite specific news items, technical + fundamental confluence, be very specific>",
    "keyRisks": ["<risk1>", "<risk2>", "<risk3>"],
    "contract": "<e.g. Brent Crude Front Month (LCOc1)>"
  }
}`;

const USER_PROMPT = `Execute the complete crude oil intelligence sweep RIGHT NOW. Use web search across all 4 tiers. Find the 10 most market-moving crude oil stories from the past 24–72 hours ranked by price impact magnitude. Look up the current live Brent and WTI spot prices. Generate the swing trade signal (2–10 day timeframe). Return only the raw JSON object — nothing else.`;

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
