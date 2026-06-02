import { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart2,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { IntelligenceReport, NewsItem, TradeSignal } from "../../../shared/types";

// Constants
const REFRESH_SECS = 900; // 15 minutes

// Tier configuration
const TIER_CONFIG = {
  "Geopolitical": { color: "#f87171", bg: "rgba(248,113,113,0.09)", label: "GEOPOLITICAL" },
  "Supply/Demand": { color: "#22d3ee", bg: "rgba(34,211,238,0.09)", label: "SUPPLY/DEMAND" },
  "Technical": { color: "#818cf8", bg: "rgba(129,140,248,0.09)", label: "TECHNICAL" },
  "Macro": { color: "#818cf8", bg: "rgba(129,140,248,0.09)", label: "MACRO" },
};

const URGENCY_COLOR = {
  BREAKING: "#ef4444",
  HIGH: "#f59e0b",
  MEDIUM: "#818cf8",
  WATCH: "#334155",
};

// Utility functions
const f2 = (n: number | undefined) => (typeof n === "number" ? n.toFixed(2) : "—");
const f1 = (n: number | undefined) => (typeof n === "number" ? n.toFixed(1) : "—");
const signColor = (n: number | undefined) =>
  n === undefined ? "#94a3b8" : n > 0 ? "#22c55e" : n < 0 ? "#f87171" : "#94a3b8";

function impactBar(score: number) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? "#ef4444" : score >= 6 ? "#f59e0b" : score >= 4 ? "#818cf8" : "#334155";
  return { pct, color };
}

function fmtCountdown(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Loading Screen Component
function LoadingScreen({ phase }: { phase: number }) {
  const steps = [
    { icon: "⚡", label: "Scanning OPEC·EIA·IEA feeds…" },
    { icon: "🌍", label: "Sweeping geopolitical intelligence…" },
    { icon: "📊", label: "Analyzing macro indicators…" },
    { icon: "⚓", label: "Monitoring global tanker flows…" },
    { icon: "🎯", label: "Synthesizing trade signal…" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <style>{`
        @keyframes barrelFloat { 0%,100%{transform:translateY(0) scale(1);opacity:1} 50%{transform:translateY(-8px) scale(1.05);opacity:0.85} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.5} }
      `}</style>

      <div style={{ fontSize: "52px", marginBottom: "28px", animation: "barrelFloat 2s ease-in-out infinite" }}>
        🛢️
      </div>

      <div
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: "9px",
          color: "#d4a843",
          letterSpacing: "4px",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        Crude Intelligence Terminal
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "22px",
          fontWeight: 800,
          color: "#e8edf5",
          marginBottom: "36px",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Running Live Intel Sweep
      </div>

      <div style={{ width: "100%", maxWidth: "300px" }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "11px 0",
              borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              opacity: i <= phase ? 1 : 0.2,
              transition: "opacity 0.5s ease",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                flexShrink: 0,
                background: i < phase ? "#22c55e" : i === phase ? "#d4a843" : "#1a2540",
                animation: i === phase ? "dotPulse 1.2s ease-in-out infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: i < phase ? "#475569" : i === phase ? "#8899b4" : "#2a3a5a",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              {s.icon} {s.label}
            </span>
            {i < phase && (
              <span style={{ marginLeft: "auto", fontSize: "10px", color: "#22c55e" }}>✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tier Badge Component
function TierBadge({ tier }: { tier: string }) {
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.Macro;
  return (
    <span
      style={{
        fontSize: "8.5px",
        fontFamily: "'IBM Plex Mono',monospace",
        fontWeight: 600,
        letterSpacing: "0.8px",
        color: config.color,
        background: config.bg,
        padding: "2px 6px",
        borderRadius: "3px",
        border: `1px solid ${config.color}28`,
      }}
    >
      {config.label}
    </span>
  );
}

// Urgency Badge Component
function UrgencyBadge({ urgency }: { urgency: string }) {
  const color = URGENCY_COLOR[urgency as keyof typeof URGENCY_COLOR] || "#334155";
  const isBreaking = urgency === "BREAKING";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "8.5px",
        fontFamily: "'IBM Plex Mono',monospace",
        fontWeight: 700,
        letterSpacing: "0.8px",
        color,
        background: `${color}14`,
        padding: "2px 6px",
        borderRadius: "3px",
        border: `1px solid ${color}35`,
        animation: isBreaking ? "pulse 1.6s ease-in-out infinite" : "none",
      }}
    >
      {isBreaking && (
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
      )}
      {urgency}
    </span>
  );
}

// News Card Component
function NewsCard({
  item,
  expanded,
  onToggle,
}: {
  item: NewsItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = TIER_CONFIG[item.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.Macro;
  const { pct, color: barColor } = impactBar(item.impactScore);
  const dirColor =
    item.direction === "BULLISH" ? "#22c55e" : item.direction === "BEARISH" ? "#f87171" : "#64748b";

  return (
    <div
      onClick={onToggle}
      style={{
        background: "#0b1120",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.055)",
        borderLeft: `3px solid ${config.color}`,
        marginBottom: "7px",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      <div style={{ padding: "13px 13px 11px" }}>
        {/* Row 1: index + badges + direction arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10px",
              color: "#d4a843",
              fontWeight: 600,
              minWidth: "22px",
            }}
          >
            {String(item.id).padStart(2, "0")}
          </span>
          <TierBadge tier={item.tier} />
          <UrgencyBadge urgency={item.urgency} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}>
            {item.direction === "BULLISH" ? (
              <TrendingUp size={13} color="#22c55e" />
            ) : item.direction === "BEARISH" ? (
              <TrendingDown size={13} color="#f87171" />
            ) : (
              <Minus size={13} color="#64748b" />
            )}
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "9px", color: dirColor, fontWeight: 600 }}>
              {item.direction}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "14.5px",
            fontWeight: 700,
            color: "#e2e8f0",
            lineHeight: 1.32,
            marginBottom: "9px",
          }}
        >
          {item.headline}
        </div>

        {/* Impact bar + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1, height: "2.5px", background: "#1a2540", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "2px" }} />
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "9.5px", color: barColor, fontWeight: 600, minWidth: "28px" }}>
            {item.impactScore}/10
          </span>
          <span style={{ fontSize: "9.5px", color: "#334155" }}>•</span>
          <span style={{ fontSize: "9.5px", color: "#475569", fontFamily: "'IBM Plex Mono',monospace" }}>
            {item.timeAgo}
          </span>
          <span style={{ fontSize: "9.5px", color: "#334155" }}>•</span>
          <span style={{ fontSize: "9.5px", color: "#475569", fontFamily: "'IBM Plex Mono',monospace" }}>
            {item.source}
          </span>
        </div>

        {/* Expanded summary */}
        {expanded && (
          <div style={{ marginTop: "11px", paddingTop: "11px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: "11px", color: "#c9b06e", lineHeight: 1.6 }}>{item.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Trade Signal Component
function TradeSignalPanel({ sig }: { sig: TradeSignal }) {
  const isLong = sig.stance === "LONG";
  const isShort = sig.stance === "SHORT";
  const sc = isLong ? "#22c55e" : isShort ? "#f87171" : "#f59e0b";
  const cc = { HIGH: "#22c55e", MEDIUM: "#f59e0b", LOW: "#f87171" }[sig.conviction] || "#f59e0b";

  const levels = [
    { label: "ENTRY ZONE", value: `$${f2(sig.entryLow)} – $${f2(sig.entryHigh)}`, color: "#d4a843" },
    { label: "STOP LOSS", value: `$${f2(sig.stopLoss)}`, color: "#f87171" },
    { label: "TARGET 1", value: `$${f2(sig.target1)}`, color: "#22c55e" },
    { label: "TARGET 2", value: `$${f2(sig.target2)}`, color: "#22c55e" },
  ];

  return (
    <div
      style={{
        background: "rgba(212,168,67,0.055)",
        border: "1px solid rgba(212,168,67,0.18)",
        borderRadius: "9px",
        padding: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div
            style={{
              fontSize: "8px",
              color: "#d4a843",
              letterSpacing: "2.5px",
              fontFamily: "'IBM Plex Mono',monospace",
              marginBottom: "5px",
            }}
          >
            🎯 TRADE SIGNAL
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              color: sc,
              background: `${sc}14`,
              padding: "4px 9px",
              borderRadius: "5px",
              border: `1px solid ${sc}35`,
              display: "inline-block",
            }}
          >
            {sig.stance}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "8px",
              color: "#334155",
              fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: "1px",
              marginBottom: "4px",
            }}
          >
            CONVICTION
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              color: cc,
              background: `${cc}14`,
              padding: "4px 9px",
              borderRadius: "5px",
              border: `1px solid ${cc}35`,
            }}
          >
            {sig.conviction}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        {levels.map((level, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: "8px",
                color: "#334155",
                fontFamily: "'IBM Plex Mono',monospace",
                letterSpacing: "1.5px",
                marginBottom: "3px",
              }}
            >
              {level.label}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px", fontWeight: 600, color: level.color }}>
              {level.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "11px" }}>
        <div
          style={{
            fontSize: "8px",
            color: "#334155",
            fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: "1.5px",
            marginBottom: "5px",
          }}
        >
          RISK/REWARD · TIMEFRAME
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12px", fontWeight: 600, color: "#8899b4" }}>
              {f1(sig.rrRatio)}:1
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12px", fontWeight: 600, color: "#8899b4" }}>
              {sig.timeframe}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "11px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          style={{
            fontSize: "8px",
            color: "#d4a843",
            letterSpacing: "2.5px",
            fontFamily: "'IBM Plex Mono',monospace",
            marginBottom: "6px",
          }}
        >
          RATIONALE
        </div>
        <p style={{ fontSize: "11px", color: "#c9b06e", lineHeight: 1.6, margin: 0 }}>{sig.rationale}</p>
      </div>

      {sig.keyRisks.length > 0 && (
        <div style={{ marginTop: "11px", paddingTop: "11px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div
            style={{
              fontSize: "8px",
              color: "#f87171",
              letterSpacing: "2.5px",
              fontFamily: "'IBM Plex Mono',monospace",
              marginBottom: "6px",
            }}
          >
            KEY RISKS
          </div>
          <ul style={{ fontSize: "11px", color: "#f87171", lineHeight: 1.6, margin: 0, paddingLeft: "16px" }}>
            {sig.keyRisks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function CrudeIntelTerminal() {
  const [data, setData] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_SECS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(new Set<number>());
  const [scanPhase, setScanPhase] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const intelligenceSweep = trpc.intelligence.sweep.useQuery(undefined, {
    enabled: false,
  });

  const fetchIntel = useCallback(async () => {
    setLoading(true);
    setError(null);
    setScanPhase(0);

    const phaseTimer = setInterval(() => setScanPhase((p) => Math.min(p + 1, 4)), 1600);

    try {
      const result = await intelligenceSweep.refetch();
      if (result.data?.success && result.data.data) {
        setData(result.data.data);
        setLastUpdated(new Date());
        setCountdown(REFRESH_SECS);
      } else {
        setError(result.data?.error || "Failed to fetch intelligence");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      clearInterval(phaseTimer);
      setLoading(false);
    }
  }, [intelligenceSweep]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchIntel();
          return REFRESH_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchIntel]);

  // Initial fetch
  useEffect(() => {
    fetchIntel();
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // Loading state
  if (loading && !data) return <LoadingScreen phase={scanPhase} />;

  const sentimentColor =
    !data || data.sentimentScore >= 65
      ? "#22c55e"
      : data.sentimentScore <= 35
        ? "#f87171"
        : "#f59e0b";

  return (
    <div style={{ background: "#060a14", minHeight: "100vh", color: "#e8edf5" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.055)",
          marginTop: "16px",
          marginBottom: "16px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            background: "rgba(212,168,67,0.04)",
            borderBottom: "1px solid rgba(212,168,67,0.18)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Report header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "8px",
                  color: "#d4a843",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                }}
              >
                🛢 BRENT CRUDE INTELLIGENCE BRIEF
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#e8edf5",
                  lineHeight: 1,
                  letterSpacing: "-0.3px",
                }}
              >
                BRENT MONITOR
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#2a3a5a",
                  fontFamily: "'IBM Plex Mono',monospace",
                  marginTop: "2px",
                }}
              >
                RESTRICTED DISTRIBUTION — SWING DESK
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchIntel}
              disabled={loading}
              style={{
                background: "rgba(212,168,67,0.07)",
                border: "1px solid rgba(212,168,67,0.25)",
                borderRadius: "8px",
                padding: "8px 10px",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#d4a843",
              }}
            >
              <RefreshCw size={11} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "9px",
                  letterSpacing: "0.5px",
                  minWidth: "32px",
                }}
              >
                {loading ? "LIVE" : fmtCountdown(countdown)}
              </span>
            </button>
          </div>

          {/* Price strip */}
          {data && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Brent */}
              <div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    fontFamily: "'IBM Plex Mono',monospace",
                    letterSpacing: "1.5px",
                    marginBottom: "2px",
                  }}
                >
                  BRENT SPOT
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#e8edf5",
                    lineHeight: 1,
                  }}
                >
                  ${f2(data.brentPrice)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "11px",
                      color: signColor(data.brentChange),
                    }}
                  >
                    {data.brentChange >= 0 ? "+" : ""}{f2(data.brentChange)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "11px",
                      color: signColor(data.brentChangePct),
                    }}
                  >
                    ({data.brentChangePct >= 0 ? "+" : ""}{f2(data.brentChangePct)}%)
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.07)" }} />

              {/* WTI + Spread */}
              <div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    fontFamily: "'IBM Plex Mono',monospace",
                    letterSpacing: "1.5px",
                    marginBottom: "2px",
                  }}
                >
                  WTI SPOT
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#8899b4",
                  }}
                >
                  ${f2(data.wtiPrice)}
                </div>
                <div
                  style={{
                    fontSize: "9.5px",
                    color: "#334155",
                    fontFamily: "'IBM Plex Mono',monospace",
                    marginTop: "2px",
                  }}
                >
                  Spread:{" "}
                  <span style={{ color: "#7a8fa8" }}>
                    {data.spread >= 0 ? "+" : ""}{f2(data.spread)}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }} />

              {/* Sentiment pill */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    fontFamily: "'IBM Plex Mono',monospace",
                    letterSpacing: "1px",
                    marginBottom: "4px",
                  }}
                >
                  SENTIMENT
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    color: sentimentColor,
                    background: `${sentimentColor}14`,
                    padding: "4px 9px",
                    borderRadius: "5px",
                    border: `1px solid ${sentimentColor}35`,
                  }}
                >
                  {data.marketSentiment}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#334155",
                    fontFamily: "'IBM Plex Mono',monospace",
                    marginTop: "3px",
                  }}
                >
                  {data.sentimentScore}/100
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "14px 14px 0" }}>
          {/* Analyst Note */}
          {data?.analystNote && (
            <div
              style={{
                background: "rgba(212,168,67,0.055)",
                border: "1px solid rgba(212,168,67,0.18)",
                borderRadius: "9px",
                padding: "11px 13px",
                marginBottom: "14px",
                animation: "fadeSlideIn 0.4s ease",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: "#d4a843",
                  letterSpacing: "2.5px",
                  fontFamily: "'IBM Plex Mono',monospace",
                  marginBottom: "5px",
                }}
              >
                ◆ LEAD ANALYST NOTE
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "#c9b06e",
                  lineHeight: 1.6,
                  margin: 0,
                  fontStyle: "italic",
                  fontFamily: "'Playfair Display',serif",
                }}
              >
                "{data.analystNote}"
              </p>
            </div>
          )}

          {/* Source coverage badges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "16px" }}>
            {Object.entries(TIER_CONFIG).map(([key, config]) => {
              const count = data?.news?.filter((n) => n.tier === key).length || 0;
              return (
                <div
                  key={key}
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.color}22`,
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "8.5px",
                      color: config.color,
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontWeight: 600,
                      letterSpacing: "0.4px",
                      flex: 1,
                    }}
                  >
                    {config.label}
                  </span>
                  {data && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: config.color,
                        fontFamily: "'IBM Plex Mono',monospace",
                        opacity: 0.7,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: "8px",
                padding: "13px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#f87171",
                  fontFamily: "'IBM Plex Mono',monospace",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}
              >
                ⚠ SWEEP FAILED
              </div>
              <div style={{ fontSize: "11px", color: "#f87171", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchIntel}
                style={{
                  background: "rgba(248,113,113,0.15)",
                  border: "1px solid rgba(248,113,113,0.35)",
                  borderRadius: "5px",
                  color: "#f87171",
                  padding: "5px 12px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                RETRY SWEEP
              </button>
            </div>
          )}

          {/* Refreshing banner */}
          {loading && data && (
            <div
              style={{
                background: "rgba(212,168,67,0.07)",
                border: "1px solid rgba(212,168,67,0.18)",
                borderRadius: "6px",
                padding: "7px 12px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "10px",
                color: "#d4a843",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              <RefreshCw size={9} style={{ animation: "spin 1s linear infinite" }} />
              Running live intelligence sweep…
            </div>
          )}

          {/* Intelligence feed */}
          {data && data.news && data.news.length > 0 && (
            <>
              {/* Section label */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px" }}>
                <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.05)" }} />
                <span
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    letterSpacing: "2.5px",
                    fontFamily: "'IBM Plex Mono',monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  TOP 10 INTELLIGENCE ITEMS
                </span>
                <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.05)" }} />
              </div>

              {/* Tap hint */}
              <div
                style={{
                  fontSize: "9.5px",
                  color: "#2a3a5a",
                  fontFamily: "'IBM Plex Mono',monospace",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                TAP CARD TO EXPAND ANALYSIS
              </div>

              {/* News cards */}
              {data.news!.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  expanded={expanded.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                />
              ))}

              {/* Trade Signal */}
              {data && data.tradeSignal && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0 14px" }}>
                    <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.05)" }} />
                    <span
                      style={{
                        fontSize: "8px",
                        color: "#d4a843",
                        letterSpacing: "2.5px",
                        fontFamily: "'IBM Plex Mono',monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🎯 TRADE RECOMMENDATION
                    </span>
                    <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.05)" }} />
                  </div>
                  <TradeSignalPanel sig={data.tradeSignal!} />
                </>
              )}
            </>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "14px",
              marginBottom: "16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              textAlign: "center",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "9px",
              color: "#1e2d45",
              lineHeight: 1.8,
            }}
          >
            {lastUpdated && (
              <div>
                Last sweep: {lastUpdated.toLocaleTimeString()} · Next: {fmtCountdown(countdown)}
              </div>
            )}
            <div>AI-powered intelligence · Verify all data independently</div>
            <div>Not financial advice · For informational purposes only</div>
          </div>
        </div>
      </div>
    </div>
  );
}
