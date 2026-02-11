import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Get overall metrics
    const metricsQuery = `
      SELECT 
        COUNT(*) as total_trades,
        COUNT(*) FILTER (WHERE status = 'win') as total_wins,
        COUNT(*) FILTER (WHERE status = 'loss') as total_losses,
        COUNT(*) FILTER (WHERE status = 'open') as open_positions,
        COALESCE(SUM(net_pnl), 0) as net_pnl,
        COALESCE(AVG(net_pnl) FILTER (WHERE status = 'win'), 0) as avg_win,
        COALESCE(AVG(net_pnl) FILTER (WHERE status = 'loss'), 0) as avg_loss,
        COALESCE(MAX(net_pnl), 0) as largest_win,
        COALESCE(MIN(net_pnl), 0) as largest_loss
      FROM trades
      WHERE user_id = $1
        ${dateFrom ? 'AND entry_date >= $2' : ''}
        ${dateTo ? `AND entry_date <= $${dateFrom ? '3' : '2'}` : ''}
    `;

    const params: any[] = [req.userId];
    if (dateFrom) params.push(dateFrom);
    if (dateTo) params.push(dateTo);

    const metricsResult = await pool.query(metricsQuery, params);
    const metrics = metricsResult.rows[0];

    // Calculate derived metrics
    const totalTrades = parseInt(metrics.total_trades);
    const totalWins = parseInt(metrics.total_wins);
    const totalLosses = parseInt(metrics.total_losses);
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const dayWinRate = winRate; // Simplified for now
    
    const avgWin = parseFloat(metrics.avg_win);
    const avgLoss = Math.abs(parseFloat(metrics.avg_loss));
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Get daily P&L data
    const dailyPnlQuery = `
      SELECT 
        DATE(entry_date) as date,
        COALESCE(SUM(net_pnl), 0) as daily_pnl,
        COUNT(*) as num_trades
      FROM trades
      WHERE user_id = $1
        AND status IN ('win', 'loss')
        ${dateFrom ? 'AND entry_date >= $2' : ''}
        ${dateTo ? `AND entry_date <= $${dateFrom ? '3' : '2'}` : ''}
      GROUP BY DATE(entry_date)
      ORDER BY date ASC
    `;

    const dailyPnlResult = await pool.query(dailyPnlQuery, params);
    
    // Calculate cumulative P&L
    let cumulativePnl = 0;
    const dailyData = dailyPnlResult.rows.map((row: any) => {
      cumulativePnl += parseFloat(row.daily_pnl);
      return {
        date: row.date,
        dailyPnl: parseFloat(row.daily_pnl),
        cumulativePnl,
        numTrades: parseInt(row.num_trades),
      };
    });

    // Get recent trades
    const recentTradesQuery = `
      SELECT t.*, a.account_name, a.broker
      FROM trades t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = $1
      ORDER BY t.entry_date DESC
      LIMIT 10
    `;
    const recentTradesResult = await pool.query(recentTradesQuery, [req.userId]);

    // Calculate Zella Score components
    const consistency = calculateConsistency(dailyData);
    const recoveryFactor = calculateRecoveryFactor(dailyData);
    const maxDrawdown = calculateMaxDrawdown(dailyData);

    const zellaScore = {
      winRate: winRate,
      profitFactor: Math.min(profitFactor * 20, 100), // Scale to 0-100
      consistency: consistency,
      recoveryFactor: recoveryFactor,
      maxDrawdown: maxDrawdown,
      avgWinLoss: avgLoss > 0 ? (avgWin / avgLoss) * 20 : 0, // Scale to 0-100
    };

    res.json({
      metrics: {
        netPnl: parseFloat(metrics.net_pnl),
        totalTrades,
        totalWins,
        totalLosses,
        openPositions: parseInt(metrics.open_positions),
        winRate,
        dayWinRate,
        profitFactor,
        avgWin,
        avgLoss,
        largestWin: parseFloat(metrics.largest_win),
        largestLoss: parseFloat(metrics.largest_loss),
      },
      zellaScore,
      dailyData,
      recentTrades: recentTradesResult.rows,
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

function calculateConsistency(dailyData: any[]): number {
  if (dailyData.length < 2) return 0;
  
  const pnls = dailyData.map(d => d.dailyPnl);
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const variance = pnls.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pnls.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  const consistency = Math.max(0, 100 - (stdDev / Math.abs(mean)) * 10);
  return Math.min(consistency, 100);
}

function calculateRecoveryFactor(dailyData: any[]): number {
  if (dailyData.length === 0) return 0;
  
  const totalPnl = dailyData[dailyData.length - 1]?.cumulativePnl || 0;
  const maxDD = calculateMaxDrawdownValue(dailyData);
  
  if (maxDD === 0) return 100;
  return Math.min((Math.abs(totalPnl) / Math.abs(maxDD)) * 20, 100);
}

function calculateMaxDrawdown(dailyData: any[]): number {
  const maxDD = calculateMaxDrawdownValue(dailyData);
  // Convert to 0-100 scale (lower drawdown = higher score)
  return Math.max(0, 100 - Math.abs(maxDD) / 100);
}

function calculateMaxDrawdownValue(dailyData: any[]): number {
  if (dailyData.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = dailyData[0].cumulativePnl;
  
  for (const day of dailyData) {
    if (day.cumulativePnl > peak) {
      peak = day.cumulativePnl;
    }
    const drawdown = peak - day.cumulativePnl;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

export const getCalendarHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const query = `
      SELECT 
        DATE(entry_date) as date,
        COALESCE(SUM(net_pnl), 0) as pnl,
        COUNT(*) as num_trades
      FROM trades
      WHERE user_id = $1
        AND EXTRACT(YEAR FROM entry_date) = $2
        AND status IN ('win', 'loss')
      GROUP BY DATE(entry_date)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [req.userId, currentYear]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get calendar heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
