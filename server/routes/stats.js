import express from 'express';
import { getStats } from '../controllers/statsController.js';

const router = express.Router();

/**
 * GET /api/stats/summary
 * Get summary statistics
 */
router.get('/summary', async (req, res) => {
  await getStats(req, res);
});

export default router;

