import express from 'express';
import { getDashboardMetrics, getCalendarHeatmap } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/metrics', getDashboardMetrics);
router.get('/calendar-heatmap', getCalendarHeatmap);

export default router;
