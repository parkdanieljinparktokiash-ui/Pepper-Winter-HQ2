# Hyprlynk Trade Portal - Requirements Document

## Project Overview
A comprehensive trading journal and analytics platform that connects to brokerage APIs for automatic trade import, performance tracking, rule management, and advanced analytics.

## Core Features (from TradeZella analysis)

### 1. Dashboard
- Net P&L with sparkline chart
- Trade win % with gauge visualization
- Profit factor metric with circular progress
- Day win % gauge
- Avg win/loss trade comparison bar
- Zella Score (trading performance radar chart):
  - Win %
  - Profit factor
  - Consistency
  - Recovery factor
  - Max drawdown
  - Avg win/loss
- Daily cumulative P&L area chart
- Net daily P&L bar chart (green/red)
- Recent trades table with open positions
- Calendar heatmap showing daily P&L
- Monthly stats sidebar
- Account balance chart (line graph with deposits/withdrawals)
- "Start my day" button

### 2. Day View
- Calendar sidebar with monthly overview
- Daily trade list with:
  - Net P&L per day
  - Number of trades
  - Win rate
  - W/L ratio
- Color-coded days (green profit, red loss)
- Date range filtering

### 3. Trade View
- Trade table with columns:
  - Open date, Symbol, Status (WIN/LOSS/OPEN)
  - Close date, Entry price, Exit price
  - Net P&L, Net ROI
  - Zella Insights, Zella Scale (visual bar)
- Filters dropdown
- Date range selector
- Account selector
- Bulk actions checkbox
- Net cumulative P&L chart
- Profit factor display
- Trade win % gauge
- Avg win/loss trade bar
- Pagination (50 trades per page)

### 4. Notebook
- Folder structure (left sidebar):
  - All notes
  - Trade Notes
  - Daily Journal
  - Sessions Recap
  - My notes
  - Recently deleted
- Calendar list view (middle column):
  - Date-based entries
  - Net P&L per day
  - Select all checkbox
  - "Log day" action button
- Rich text editor (right panel):
  - Title: Date display
  - Net P&L header
  - Created/Last updated timestamps
  - Template suggestions:
    - Daily Game Plan
    - Systematic Trading
  - Add tag button
  - Formatting toolbar (undo/redo, text formatting, links, etc.)
  - Font size selector
  - Note content area with structured fields:
    - ERRORS
    - PAPER TRADE section
    - ticker, time, brick size, dpnl, trades, wins, losses, total pnl, notes (with "ghost prints" tag)
- Search notes functionality
- Share button

### 5. Reports
- Tabs: Performance (NEW), Overview, Reports, Compare, Calendar
- Export PDF button
- Filters dropdown
- Date range selector
- Account selector
- Metrics dropdown selector ("NET P&L")
- Add metric button
- Time series charts:
  - Net P&L cumulative (area chart)
  - Avg daily win/loss (bar chart)
- Summary statistics grid:
  - Net P&L
  - Win %
  - Avg daily win %
  - Profit factor
  - Avg hold time
  - Trade expectancy
  - Avg net trade P&L
  - Avg daily volume
  - Avg planned r:multiple
  - Logged days
  - Avg daily net P&L
  - Max daily net drawdown
  - Avg realized r:multiple
  - Avg daily net drawdown
- Tabs: Summary, Days, Trades

### 6. Strategies
- Empty state with "Create strategy" button
- Tabs: My Strategies (0/3), Shared with me, Templates
- Description: "Build your trading strategy - List your rules, track and optimize your strategy"
- Learn more link

### 7. Progress Tracker
- Current streak counter (with emoji)
- Current period score (gauge 0-100%)
- Today's progress (X/5 rules completed)
- Daily checklist card:
  - Date header
  - Automated rules section
  - List of rules with:
    - Rule name
    - Completion status (None/partial)
    - Time or percentage threshold
  - "View this day" button
- Progress tracker heatmap (GitHub-style):
  - Months across top
  - Days of week down left side
  - Color intensity = activity level
  - Legend (Less → More)
- Current rules table:
  - RULE, CONDITION, RULE STREAK, AVERAGE PERFORMANCE, FOLLOW RATE columns
  - Red/yellow warning icons for rule violations
  - Edit rules button
- Drawer widgets:
  - Drawdown chart (purple line)
  - Trade time performance (scatter plot, red/green dots)
  - Trade duration performance (scatter plot)
  - "Explore" button to expand

### 8. Settings
**USER section:**
- Profile:
  - Avatar upload/removal
  - First name, Last name
  - User name
  - Email
  - Timezone, Location display
  - Save button
- Security
- Subscription

**GENERAL section:**
- Accounts:
  - Table with columns: Account name, Broker, Balance, Profit calculation method, Last update, Next update, Type, Actions
  - Add account button
  - "Learn more" link
  - Auto sync indicator
  - Refresh button
- PT / SL settings
- Commissions & fees
- Trade settings
- Global settings
- Tags management
- Import history
- Log history
- Support access

### 9. Navigation Sidebar
- Logo: TRADEZELLA
- Add Trade button (purple, prominent)
- Menu items:
  - Dashboard
  - Day View
  - Trade View
  - Notebook
  - Reports
  - Strategies
  - Trade Replay (NEW badge)
  - Progress Tracker
  - Resources

## Technical Requirements

### Backend API
- **Framework:** Node.js + Express.js or Python + FastAPI
- **Database:** PostgreSQL (trades, users, rules, notes)
- **Authentication:** JWT tokens, OAuth2 for broker integrations
- **Brokerage Integration:**
  - Alpaca API
  - Interactive Brokers API
  - TD Ameritrade / Schwab API
  - Tradovate API (futures)
  - Generic CSV import
  - Auto-sync capability with configurable intervals
  - FIFO profit calculation
- **Background Jobs:** Bull/BullMQ for trade import tasks

### Frontend
- **Framework:** React + TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts or Chart.js
- **Rich Text Editor:** TipTap or Lexical
- **Date/Time:** date-fns or Day.js
- **State Management:** Zustand or Redux Toolkit
- **Routing:** React Router

### Database Schema (key tables)
```sql
users (id, email, name, timezone, created_at)
accounts (id, user_id, broker, api_credentials_encrypted, balance, sync_enabled, last_sync)
trades (id, account_id, symbol, entry_date, exit_date, entry_price, exit_price, quantity, pnl, roi, status, tags, notes)
daily_summaries (id, user_id, date, net_pnl, num_trades, win_rate, notes)
rules (id, user_id, name, condition_type, condition_value, streak_count, follow_rate)
rule_checks (id, rule_id, date, passed, performance)
notebooks (id, user_id, folder, title, content_json, date, pnl, tags, created_at, updated_at)
strategies (id, user_id, name, description, rules_json, shared)
```

## Enhancements Beyond TradeZella

1. **Real-time Position Monitoring:**
   - Live P&L updates from connected brokers
   - Alert system for profit targets / stop losses

2. **AI Trade Analysis:**
   - Pattern recognition in winning/losing trades
   - Personalized suggestions based on historical performance
   - Automatic trade tagging (momentum, breakout, reversal, etc.)

3. **Hyprlynk Integration:**
   - Quick trade entry via voice/text command
   - Push notifications for rule violations
   - iMessage/Telegram/Slack daily summaries

4. **Advanced Analytics:**
   - MAE/MFE (Maximum Adverse/Favorable Excursion) analysis
   - Time-of-day performance heatmap
   - Symbol-specific win rate tracking
   - R-multiple distribution histogram

5. **Collaborative Features:**
   - Share strategies with other users
   - Community leaderboards (optional, anonymous)
   - Mentor/student relationship support

6. **Mobile Responsive:**
   - Full PWA support
   - Offline trade entry with sync when online

## API Endpoints (Sample)

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/accounts
POST   /api/accounts/:id/sync
GET    /api/trades?date_from=&date_to=&account_id=
POST   /api/trades
PUT    /api/trades/:id
DELETE /api/trades/:id
GET    /api/dashboard/metrics?date_from=&date_to=
GET    /api/daily-summaries?date_from=&date_to=
POST   /api/notebooks
PUT    /api/notebooks/:id
GET    /api/rules
POST   /api/rules
GET    /api/progress-tracker?date=
POST   /api/strategies
GET    /api/reports/performance?metric=net_pnl&period=daily
POST   /api/import/csv
```

## Deployment
- Docker + Docker Compose
- Frontend: Vercel or Netlify
- Backend: Railway or Render
- Database: Supabase or Neon (managed Postgres)
- Redis: Upstash (for job queue)

## Security
- Encrypted broker API credentials (AES-256)
- Rate limiting on all endpoints
- Input validation/sanitization
- HTTPS only
- CORS properly configured
- Environment variables for secrets

---
**Build with:** BLACKBOX Multi-Agent (TypeScript/React + Node.js/Express)
