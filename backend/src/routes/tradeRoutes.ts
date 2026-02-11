import express from 'express';
import { 
  getTrades, 
  getTrade, 
  createTrade, 
  updateTrade, 
  deleteTrade,
  bulkDeleteTrades 
} from '../controllers/tradeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTrades);
router.get('/:id', getTrade);
router.post('/', createTrade);
router.put('/:id', updateTrade);
router.delete('/:id', deleteTrade);
router.post('/bulk-delete', bulkDeleteTrades);

export default router;
