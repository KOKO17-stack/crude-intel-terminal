/**
 * Swing Trading Analytics Display Component
 * Shows enhanced metrics for CFD trading
 */

import type { NewsItem, TradeSignal, TechnicalSetup, FundamentalMetrics } from "../../../shared/types";

interface SwingTradingAnalyticsProps {
  news: NewsItem[];
  technicalSetup?: TechnicalSetup;
  fundamentalMetrics?: FundamentalMetrics;
  tradeSignal?: TradeSignal;
}

export function SwingTradingAnalytics({
  news,
  technicalSetup,
  fundamentalMetrics,
  tradeSignal,
}: SwingTradingAnalyticsProps) {
  // Calculate market impact summary
  const bullishWeight = news
    .filter((n) => n.direction === "BULLISH")
    .reduce((sum, n) => sum + (n.marketMoveWeight || n.impactScore * 10), 0);

  const bearishWeight = news
    .filter((n) => n.direction === "BEARISH")
    .reduce((sum, n) => sum + (n.marketMoveWeight || n.impactScore * 10), 0);

  const netSentiment = bullishWeight - bearishWeight;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Market Impact Summary */}
      <div
        style={{
          background: "rgba(212,168,67,0.08)",
          border: "1px solid rgba(212,168,67,0.15)",
          borderRadius: "8px",
          padding: "12px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#d4a843",
            fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: "2px",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          📊 Market Impact Summary
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "10px" }}>
          <div>
            <span style={{ color: "#94a3b8" }}>Bullish Weight:</span>
            <span style={{ color: "#22c55e", fontWeight: 600, marginLeft: "6px" }}>{bullishWeight.toFixed(0)}</span>
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>Bearish Weight:</span>
            <span style={{ color: "#f87171", fontWeight: 600, marginLeft: "6px" }}>{bearishWeight.toFixed(0)}</span>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#94a3b8" }}>Net Sentiment:</span>
            <span
              style={{
                color: netSentiment > 0 ? "#22c55e" : netSentiment < 0 ? "#f87171" : "#f59e0b",
                fontWeight: 600,
                marginLeft: "6px",
              }}
            >
              {netSentiment > 0 ? "+" : ""}{netSentiment.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Setup */}
      {technicalSetup && (
        <div
          style={{
            background: "rgba(129,140,248,0.08)",
            border: "1px solid rgba(129,140,248,0.15)",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#818cf8",
              fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: "2px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            📈 Technical Setup
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "10px" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Trend:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>{technicalSetup.trend}</span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Strength:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {technicalSetup.trendStrength}%
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>RSI:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {technicalSetup.rsi.toFixed(0)}
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>MACD:</span>
              <span
                style={{
                  color:
                    technicalSetup.macd === "BULLISH"
                      ? "#22c55e"
                      : technicalSetup.macd === "BEARISH"
                        ? "#f87171"
                        : "#f59e0b",
                  fontWeight: 600,
                  marginLeft: "6px",
                }}
              >
                {technicalSetup.macd}
              </span>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#94a3b8" }}>Key Levels:</span>
              <div style={{ marginLeft: "12px", marginTop: "4px", fontSize: "9px", color: "#cbd5e1" }}>
                <div>R: ${technicalSetup.keyLevels.strongResistance.toFixed(2)}</div>
                <div>S: ${technicalSetup.keyLevels.strongSupport.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fundamental Metrics */}
      {fundamentalMetrics && (
        <div
          style={{
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.15)",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#22d3ee",
              fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: "2px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            🌍 Fundamental Metrics
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "10px" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Supply/Demand:</span>
              <span
                style={{
                  color: fundamentalMetrics.supplyDemandBalance > 0 ? "#f87171" : "#22c55e",
                  fontWeight: 600,
                  marginLeft: "6px",
                }}
              >
                {fundamentalMetrics.supplyDemandBalance > 0 ? "+" : ""}{fundamentalMetrics.supplyDemandBalance}
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Geo Risk:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {fundamentalMetrics.geopoliticalRisk}/100
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Macro Env:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {fundamentalMetrics.macroEnvironment}/100
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Inventory:</span>
              <span
                style={{
                  color:
                    fundamentalMetrics.inventoryTrend === "RISING"
                      ? "#f87171"
                      : fundamentalMetrics.inventoryTrend === "FALLING"
                        ? "#22c55e"
                        : "#f59e0b",
                  fontWeight: 600,
                  marginLeft: "6px",
                }}
              >
                {fundamentalMetrics.inventoryTrend}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CFD Trading Metrics */}
      {tradeSignal && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.15)",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#f87171",
              fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: "2px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            ⚙️ CFD Trading Metrics
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "10px" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Position Size:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {tradeSignal.positionSizePercent?.toFixed(1) || "—"}%
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Max Drawdown:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {tradeSignal.maxDrawdown?.toFixed(1) || "—"}%
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Win Prob:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {tradeSignal.winProbability?.toFixed(0) || "—"}%
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Leverage:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {tradeSignal.recommendedLeverage || "—"}x
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>CFD Suitability:</span>
              <span
                style={{
                  color:
                    tradeSignal.cfdsuitability === "EXCELLENT"
                      ? "#22c55e"
                      : tradeSignal.cfdsuitability === "GOOD"
                        ? "#22d3ee"
                        : tradeSignal.cfdsuitability === "MODERATE"
                          ? "#f59e0b"
                          : "#f87171",
                  fontWeight: 600,
                  marginLeft: "6px",
                }}
              >
                {tradeSignal.cfdsuitability || "—"}
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Swing Score:</span>
              <span style={{ color: "#cbd5e1", fontWeight: 600, marginLeft: "6px" }}>
                {tradeSignal.swingTradingScore?.toFixed(0) || "—"}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
