import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

export const getTrades = async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo, accountId, status, symbol, page = 1, limit = 50 } = req.query;
    
    let query = `
      SELECT t.*, a.account_name, a.broker
      FROM trades t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = $1
    `;
    const params: any[] = [req.userId];
    let paramCount = 1;

    if (dateFrom) {
      paramCount++;
      query += ` AND t.entry_date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND t.entry_date <= $${paramCount}`;
      params.push(dateTo);
    }

    if (accountId) {
      paramCount++;
      query += ` AND t.account_id = $${paramCount}`;
      params.push(accountId);
    }

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (symbol) {
      paramCount++;
      query += ` AND t.symbol ILIKE $${paramCount}`;
      params.push(`%${symbol}%`);
    }

    query += ` ORDER BY t.entry_date DESC`;

    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM trades WHERE user_id = $1`;
    const countParams: any[] = [req.userId];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      trades: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTrade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, a.account_name, a.broker
       FROM trades t
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTrade = async (req: AuthRequest, res: Response) => {
  try {
    const {
      accountId,
      symbol,
      entryDate,
      exitDate,
      entryPrice,
      exitPrice,
      quantity,
      side,
      status,
      commission,
      fees,
      tags,
      notes,
      strategyId,
    } = req.body;

    // Calculate P&L if trade is closed
    let netPnl = null;
    let netRoi = null;
    let finalStatus = status || 'open';

    if (exitPrice && exitDate) {
      const priceDiff = side === 'long' 
        ? (exitPrice - entryPrice) 
        : (entryPrice - exitPrice);
      netPnl = (priceDiff * quantity) - (commission || 0) - (fees || 0);
      netRoi = (priceDiff / entryPrice) * 100;
      
      if (!status) {
        finalStatus = netPnl >= 0 ? 'win' : 'loss';
      }
    }

    const result = await pool.query(
      `INSERT INTO trades (
        user_id, account_id, symbol, entry_date, exit_date,
        entry_price, exit_price, quantity, side, status,
        net_pnl, net_roi, commission, fees, tags, notes, strategy_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.userId, accountId, symbol, entryDate, exitDate,
        entryPrice, exitPrice, quantity, side, finalStatus,
        netPnl, netRoi, commission, fees, tags, notes, strategyId
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTrade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      symbol,
      entryDate,
      exitDate,
      entryPrice,
      exitPrice,
      quantity,
      side,
      status,
      commission,
      fees,
      tags,
      notes,
    } = req.body;

    // Recalculate P&L if prices changed
    let netPnl = null;
    let netRoi = null;
    let finalStatus = status;

    if (exitPrice && entryPrice && quantity) {
      const priceDiff = side === 'long' 
        ? (exitPrice - entryPrice) 
        : (entryPrice - exitPrice);
      netPnl = (priceDiff * quantity) - (commission || 0) - (fees || 0);
      netRoi = (priceDiff / entryPrice) * 100;
      
      if (!status && exitDate) {
        finalStatus = netPnl >= 0 ? 'win' : 'loss';
      }
    }

    const result = await pool.query(
      `UPDATE trades SET
        symbol = COALESCE($1, symbol),
        entry_date = COALESCE($2, entry_date),
        exit_date = COALESCE($3, exit_date),
        entry_price = COALESCE($4, entry_price),
        exit_price = COALESCE($5, exit_price),
        quantity = COALESCE($6, quantity),
        side = COALESCE($7, side),
        status = COALESCE($8, status),
        net_pnl = COALESCE($9, net_pnl),
        net_roi = COALESCE($10, net_roi),
        commission = COALESCE($11, commission),
        fees = COALESCE($12, fees),
        tags = COALESCE($13, tags),
        notes = COALESCE($14, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 AND user_id = $16
      RETURNING *`,
      [
        symbol, entryDate, exitDate, entryPrice, exitPrice,
        quantity, side, finalStatus, netPnl, netRoi,
        commission, fees, tags, notes, id, req.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTrade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const bulkDeleteTrades = async (req: AuthRequest, res: Response) => {
  try {
    const { tradeIds } = req.body;

    if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
      return res.status(400).json({ error: 'Invalid trade IDs' });
    }

    const result = await pool.query(
      'DELETE FROM trades WHERE id = ANY($1) AND user_id = $2 RETURNING id',
      [tradeIds, req.userId]
    );

    res.json({ 
      message: `${result.rows.length} trades deleted successfully`,
      deletedCount: result.rows.length 
    });
  } catch (error) {
    console.error('Bulk delete trades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
