# Crude Oil Intelligence Terminal - TODO

## Core Features

### Backend Integration
- [x] Configure Anthropic API with web search capability
- [x] Create tRPC procedure for intelligence sweep with structured JSON response
- [x] Implement LLM system prompt for crude oil market analysis
- [x] Set up error handling and retry logic for API calls

### Data Structures
- [x] Define TypeScript types for intelligence report (prices, sentiment, news items, trade signal)
- [x] Define news item schema with tier classification (Geopolitical, Supply/Demand, Technical, Macro)
- [x] Define trade signal schema with entry/exit levels and conviction

### Frontend - Core Display
- [x] Implement dark terminal aesthetic with IBM Plex Mono + Playfair Display fonts
- [x] Create price strip component showing Brent and WTI spot prices with change indicators
- [x] Create market sentiment pill component (BULLISH/BEARISH/NEUTRAL)
- [x] Create Lead Analyst Note section with AI-generated summary
- [x] Implement tier coverage badges showing count of news items per tier

### Frontend - News Feed
- [x] Create expandable news card component with tier badge and urgency indicator
- [x] Implement card expansion to reveal per-item AI analysis
- [x] Add impact score visualization as horizontal bar
- [x] Add direction indicator (BULLISH/BEARISH/NEUTRAL) with color coding

### Frontend - Trade Signal
- [x] Create trade signal recommendation panel
- [x] Display stance (LONG/SHORT/NEUTRAL) with color coding
- [x] Show entry zone, stop loss, and price targets with visual hierarchy
- [x] Display conviction level (HIGH/MEDIUM/LOW)
- [x] Show risk/reward ratio and timeframe

### Frontend - Refresh & Timing
- [x] Implement auto-refresh countdown timer (15-minute interval)
- [x] Create manual refresh button with disabled state during fetch
- [x] Add "Last updated" timestamp display
- [x] Implement countdown display with MM:SS format

### Frontend - Loading State
- [x] Create loading screen with animated scan phase progression
- [x] Implement 5-phase animation (OPEC/EIA, Geopolitical, Macro, Tanker, Trade Signal)
- [x] Add phase indicator dots with completion checkmarks
- [x] Ensure smooth phase transitions with proper timing

### Frontend - Error Handling
- [x] Display error banner when sweep fails
- [x] Implement retry button on error state
- [x] Show appropriate error messages to user

## Technical Tasks

- [x] Write vitest tests for intelligence sweep procedure
- [x] Write vitest tests for data transformation and validation
- [x] Verify Anthropic API integration works correctly
- [x] Test auto-refresh countdown behavior
- [x] Test expandable card interactions
- [x] Verify responsive design on different screen sizes
- [x] Test error states and recovery flows

## Styling & Polish

- [x] Ensure gold accent color (#d4a843) applied consistently
- [x] Verify deep navy background throughout
- [x] Check font rendering for both typefaces
- [x] Add smooth transitions and animations
- [x] Verify color contrast for accessibility
- [x] Test dark theme consistency

## Deployment

- [x] Create checkpoint before publishing
- [x] Verify all features working in production
- [x] Test live data feeds
- [x] Confirm auto-refresh functioning


---

## PHASE 2: ENHANCED SWING TRADING ANALYTICS

### Backend Enhancements
- [x] Expand news from 10 to 70 items in LLM prompt
- [x] Add market impact weighting system (0-100 scale)
- [x] Implement holistic decision framework module (holisticAnalysis.ts)
- [x] Create CFD swing trading optimization module (cfdOptimization.ts)
- [x] Add per-item detailed swing trading analysis to news items
- [x] Implement market impact summary calculations
- [x] Add technical setup analysis (trend, RSI, MACD, key levels)
- [x] Add fundamental metrics analysis (supply/demand, geopolitical risk, macro environment)
- [x] Implement risk factor analysis with severity levels
- [x] Add macro context integration (Fed policy, global growth, currency trends)

### Data Structure Enhancements
- [x] Add marketMoveWeight to news items (0-100)
- [x] Add swing trading specific metrics to news (volatility impact, correlation strength, trading opportunity)
- [x] Add analysis field for detailed per-item swing trading insights
- [x] Add keyFactors array to news items
- [x] Add timeframe field (IMMEDIATE, SHORT_TERM, MEDIUM_TERM, LONG_TERM)
- [x] Add affectedPairs array to news items
- [x] Create TechnicalSetup type with RSI, MACD, moving averages
- [x] Create FundamentalMetrics type with supply/demand, geopolitical risk, macro environment
- [x] Create holistic decision framework type
- [x] Add CFD-specific trade signal fields (position sizing, leverage, suitability, swing trading score)
- [x] Add macro context type to intelligence report

### Frontend Enhancements
- [x] Create SwingTradingAnalytics component for displaying enhanced metrics
- [x] Add market impact summary display
- [x] Add technical setup panel with trend, RSI, MACD, key levels
- [x] Add fundamental metrics panel with supply/demand, geopolitical risk, macro environment
- [x] Add CFD trading metrics panel with position sizing, leverage, suitability
- [x] Enhance news cards to show market move weight
- [x] Add detailed swing trading analysis display in expanded news cards
- [x] Add key factors display in news cards
- [x] Add volatility impact and correlation strength indicators

### Holistic Decision Framework
- [x] Implement technical score calculation (trend, RSI, MACD)
- [x] Implement fundamental score calculation (supply/demand, geopolitical risk, macro environment)
- [x] Implement sentiment score calculation from weighted news items
- [x] Implement risk/reward score calculation
- [x] Implement holistic score fusion (weighted average of all scores)
- [x] Generate recommended action (STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL)
- [x] Calculate overall tradeability score (0-100)

### CFD Swing Trading Optimization
- [x] Implement position sizing calculation based on account risk
- [x] Implement pips calculation for entry, stop loss, and profit targets
- [x] Implement CFD suitability determination (EXCELLENT, GOOD, MODERATE, POOR)
- [x] Implement recommended leverage calculation (1-10x)
- [x] Implement expected drawdown calculation
- [x] Implement win probability calculation from technical + fundamental + sentiment confluence
- [x] Create CFD trading checklist generator
- [x] Add leverage recommendations based on risk/reward ratio and volatility

### Testing & Validation
- [x] Verify TypeScript compilation with all new modules
- [x] Build production bundle successfully
- [x] Verify no type errors in enhanced components
- [x] Confirm all new modules export correctly
- [x] Validate holistic analysis calculations
- [x] Validate CFD optimization calculations

### Deployment
- [x] Build production bundle
- [x] Verify enhanced analytics modules in build
- [x] Confirm CFD optimization features in build
- [x] Ready for Vercel deployment

---

## FEATURE SUMMARY

**News Items:** 10 → 70 (7x expansion)
**Market Impact Weighting:** Per-item ability to move market (0-100 scale)
**Holistic Analysis:** Technical + Fundamental + Sentiment fusion
**CFD Optimization:** Position sizing, leverage, suitability, swing trading score
**Per-Item Analysis:** Detailed swing trading insights for each news item
**Advanced Metrics:** RSI, MACD, moving averages, key levels, supply/demand, geopolitical risk
**Risk Management:** Position sizing, max drawdown, win probability, leverage recommendations
**Macro Context:** Fed policy, global growth, currency trends, equity market health
