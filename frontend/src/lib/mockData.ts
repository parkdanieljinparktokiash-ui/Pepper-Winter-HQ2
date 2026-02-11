// Mock trading data service
import { format, subDays, addDays, startOfDay, endOfDay } from 'date-fns';

export interface Trade {
  id: string;
  openDate: string;
  symbol: string;
  status: 'WIN' | 'LOSS' | 'OPEN';
  closeDate: string | null;
  entryPrice: number;
  exitPrice: number | null;
  netPnL: number;
  netROI: number;
  zellaInsights: number;
  zellaScale: number;
  quantity: number;
  commissions: number;
}

export interface TradingDay {
  date: string;
  netPnL: number;
  tradesCount: number;
  winRate: number;
  winLossRatio: string;
  trades: Trade[];
}

export interface PerformanceStats {
  netPnL: number;
  winPercentage: number;
  avgDailyWin: number;
  profitFactor: number;
  avgHoldTime: string;
  tradeExpectancy: number;
  loggedDays: number;
  maxDailyDrawdown: number;
  totalTrades: number;
  avgWinTrade: number;
  avgLossTrade: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  balance: number;
  profitCalc: string;
  lastUpdate: string;
  nextUpdate: string;
  type: string;
}

// Generate mock trade data
const generateMockTrade = (id: string, date: Date, isOpen = false): Trade => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'SPY', 'QQQ', 'NVDA', 'META', 'AMZN', 'NFLX'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const entryPrice = Math.random() * 500 + 50;
  const isWin = Math.random() > 0.38; // 62% win rate
  const quantity = Math.floor(Math.random() * 100) + 1;

  let exitPrice: number | null = null;
  let netPnL = 0;
  let status: 'WIN' | 'LOSS' | 'OPEN' = 'OPEN';
  let closeDate: string | null = null;

  if (!isOpen) {
    if (isWin) {
      exitPrice = entryPrice * (1 + Math.random() * 0.15); // Up to 15% gain
      status = 'WIN';
    } else {
      exitPrice = entryPrice * (1 - Math.random() * 0.1); // Up to 10% loss
      status = 'LOSS';
    }
    netPnL = (exitPrice - entryPrice) * quantity;
    closeDate = format(addDays(date, Math.floor(Math.random() * 5)), 'yyyy-MM-dd HH:mm:ss');
  }

  const netROI = exitPrice ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;

  return {
    id,
    openDate: format(date, 'yyyy-MM-dd HH:mm:ss'),
    symbol,
    status,
    closeDate,
    entryPrice: Math.round(entryPrice * 100) / 100,
    exitPrice: exitPrice ? Math.round(exitPrice * 100) / 100 : null,
    netPnL: Math.round(netPnL * 100) / 100,
    netROI: Math.round(netROI * 100) / 100,
    zellaInsights: Math.floor(Math.random() * 10) + 1,
    zellaScale: Math.floor(Math.random() * 100),
    quantity,
    commissions: Math.round(Math.random() * 10 * 100) / 100,
  };
};

// Generate mock data
const generateMockTrades = (): Trade[] => {
  const trades: Trade[] = [];
  const today = new Date();

  // Generate trades for the last 90 days
  for (let i = 0; i < 90; i++) {
    const date = subDays(today, i);
    const tradesPerDay = Math.floor(Math.random() * 5) + 1; // 1-5 trades per day

    for (let j = 0; j < tradesPerDay; j++) {
      const isOpen = i < 5 && Math.random() > 0.7; // Some recent trades are open
      trades.push(generateMockTrade(`${i}-${j}`, date, isOpen));
    }
  }

  return trades;
};

export const mockTrades = generateMockTrades();

// Generate trading days data
export const generateTradingDays = (): TradingDay[] => {
  const days: { [key: string]: Trade[] } = {};

  // Group trades by day
  mockTrades.forEach(trade => {
    const day = trade.openDate.split(' ')[0];
    if (!days[day]) {
      days[day] = [];
    }
    days[day].push(trade);
  });

  return Object.entries(days).map(([date, trades]) => {
    const netPnL = trades.reduce((sum, trade) => sum + trade.netPnL, 0);
    const closedTrades = trades.filter(t => t.status !== 'OPEN');
    const winningTrades = closedTrades.filter(t => t.status === 'WIN');
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const losses = closedTrades.length - winningTrades.length;
    const winLossRatio = losses > 0 ? `${winningTrades.length}:${losses}` : `${winningTrades.length}:0`;

    return {
      date,
      netPnL: Math.round(netPnL * 100) / 100,
      tradesCount: trades.length,
      winRate: Math.round(winRate * 100) / 100,
      winLossRatio,
      trades,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockTradingDays = generateTradingDays();

// Performance statistics
export const mockPerformanceStats: PerformanceStats = {
  netPnL: mockTrades.reduce((sum, trade) => sum + trade.netPnL, 0),
  winPercentage: 62.07,
  avgDailyWin: 245.50,
  profitFactor: 1.64,
  avgHoldTime: '2h 34m',
  tradeExpectancy: 156.25,
  loggedDays: 87,
  maxDailyDrawdown: -892.30,
  totalTrades: mockTrades.length,
  avgWinTrade: 398.75,
  avgLossTrade: -243.12,
  largestWin: 1250.00,
  largestLoss: -567.89,
  consecutiveWins: 8,
  consecutiveLosses: 3,
};

// Mock accounts
export const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Main Trading Account',
    broker: 'Interactive Brokers',
    balance: 125000.00,
    profitCalc: 'FIFO',
    lastUpdate: '2 hours ago',
    nextUpdate: '4 hours',
    type: 'Auto sync',
  },
  {
    id: '2',
    name: 'Day Trading Account',
    broker: 'TD Ameritrade',
    balance: 75000.00,
    profitCalc: 'FIFO',
    lastUpdate: '1 hour ago',
    nextUpdate: '3 hours',
    type: 'Auto sync',
  },
];

// Mock notes data
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  folder: string;
}

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Daily Game Plan - Market Analysis',
    content: 'Today\'s market outlook: SPY showing bullish momentum above 450 resistance...',
    date: '2024-01-15',
    tags: ['market-analysis', 'spy'],
    folder: 'Trade Notes',
  },
  {
    id: '2',
    title: 'TSLA Trade Review',
    content: 'Entry at 245.50, exit at 252.30. Good momentum play but could have held longer...',
    date: '2024-01-14',
    tags: ['tesla', 'review'],
    folder: 'Trade Notes',
  },
  {
    id: '3',
    title: 'Weekly Trading Journal',
    content: 'This week was challenging with mixed signals from the Fed...',
    date: '2024-01-13',
    tags: ['journal', 'weekly'],
    folder: 'Daily Journal',
  },
];

// Mock progress tracking data
export interface ProgressRule {
  id: string;
  name: string;
  condition: string;
  ruleStreak: number;
  avgPerformance: number;
  followRate: number;
  hasViolation: boolean;
}

export const mockProgressRules: ProgressRule[] = [
  {
    id: '1',
    name: 'Risk Management',
    condition: 'Never risk more than 2% per trade',
    ruleStreak: 15,
    avgPerformance: 2.3,
    followRate: 95.2,
    hasViolation: false,
  },
  {
    id: '2',
    name: 'Position Sizing',
    condition: 'Use consistent position sizing',
    ruleStreak: 8,
    avgPerformance: 1.8,
    followRate: 87.5,
    hasViolation: true,
  },
  {
    id: '3',
    name: 'Stop Loss',
    condition: 'Always set stop loss before entry',
    ruleStreak: 22,
    avgPerformance: 3.1,
    followRate: 98.7,
    hasViolation: false,
  },
];