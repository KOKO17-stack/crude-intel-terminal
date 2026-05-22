import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Intelligence Sweep", () => {
  it(
    "should fetch crude oil intelligence with valid structure",
    async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.intelligence.sweep();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      if (result.success && result.data) {
        const data = result.data;

        // Validate top-level fields
        expect(data.fetchedAt).toBeDefined();
        expect(typeof data.brentPrice).toBe("number");
        expect(typeof data.brentChange).toBe("number");
        expect(typeof data.brentChangePct).toBe("number");
        expect(typeof data.wtiPrice).toBe("number");
        expect(typeof data.spread).toBe("number");

        // Validate sentiment
        expect(["BULLISH", "BEARISH", "NEUTRAL"]).toContain(data.marketSentiment);
        expect(data.sentimentScore).toBeGreaterThanOrEqual(0);
        expect(data.sentimentScore).toBeLessThanOrEqual(100);

        // Validate analyst note
        expect(typeof data.analystNote).toBe("string");
        expect(data.analystNote.length).toBeGreaterThan(0);

        // Validate news array
        expect(Array.isArray(data.news)).toBe(true);
        expect(data.news.length).toBeGreaterThan(0);
        expect(data.news.length).toBeLessThanOrEqual(10);

        // Validate first news item structure
        const newsItem = data.news[0];
        expect(newsItem).toBeDefined();
        expect(typeof newsItem.id).toBe("number");
        expect(typeof newsItem.headline).toBe("string");
        expect(typeof newsItem.summary).toBe("string");
        expect(typeof newsItem.source).toBe("string");
        expect(["Geopolitical", "Supply/Demand", "Technical", "Macro"]).toContain(
          newsItem.tier
        );
        expect(newsItem.impactScore).toBeGreaterThanOrEqual(1);
        expect(newsItem.impactScore).toBeLessThanOrEqual(10);
        expect(["BULLISH", "BEARISH", "NEUTRAL"]).toContain(newsItem.direction);
        expect(["BREAKING", "HIGH", "MEDIUM", "WATCH"]).toContain(newsItem.urgency);

        // Validate trade signal
        expect(data.tradeSignal).toBeDefined();
        expect(["LONG", "SHORT", "NEUTRAL"]).toContain(data.tradeSignal.stance);
        expect(["HIGH", "MEDIUM", "LOW"]).toContain(data.tradeSignal.conviction);
        expect(typeof data.tradeSignal.entryLow).toBe("number");
        expect(typeof data.tradeSignal.entryHigh).toBe("number");
        expect(typeof data.tradeSignal.stopLoss).toBe("number");
        expect(typeof data.tradeSignal.target1).toBe("number");
        expect(typeof data.tradeSignal.target2).toBe("number");
        expect(typeof data.tradeSignal.rrRatio).toBe("number");
        expect(typeof data.tradeSignal.timeframe).toBe("string");
        expect(typeof data.tradeSignal.rationale).toBe("string");
        expect(Array.isArray(data.tradeSignal.keyRisks)).toBe(true);
        expect(typeof data.tradeSignal.contract).toBe("string");
      }
    },
    60000
  );

  it(
    "should handle errors gracefully",
    async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // This test will pass if the sweep returns either success or error
      // The important thing is that it doesn't throw
      const result = await caller.intelligence.sweep();
      expect(result).toBeDefined();
      expect(result).toHaveProperty("success");
    },
    60000
  );
});
