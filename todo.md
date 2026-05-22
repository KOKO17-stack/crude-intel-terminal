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

- [ ] Write vitest tests for intelligence sweep procedure
- [ ] Write vitest tests for data transformation and validation
- [ ] Verify Anthropic API integration works correctly
- [ ] Test auto-refresh countdown behavior
- [ ] Test expandable card interactions
- [ ] Verify responsive design on different screen sizes
- [ ] Test error states and recovery flows

## Styling & Polish

- [ ] Ensure gold accent color (#d4a843) applied consistently
- [ ] Verify deep navy background throughout
- [ ] Check font rendering for both typefaces
- [ ] Add smooth transitions and animations
- [ ] Verify color contrast for accessibility
- [ ] Test dark theme consistency

## Deployment

- [ ] Create checkpoint before publishing
- [ ] Verify all features working in production
- [ ] Test live data feeds
- [ ] Confirm auto-refresh functioning
