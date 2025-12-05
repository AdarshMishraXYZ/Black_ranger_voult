import express from 'express';
import { getLogs, exportLogsCSV } from '../controllers/logsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/logs
 * Get verification logs with filters (admin only)
 */
router.get('/', authenticateAdmin, async (req, res) => {
  await getLogs(req, res);
});

/**
 * GET /api/logs/export
 * Export logs as CSV (admin only)
 */
router.get('/export', authenticateAdmin, async (req, res) => {
  await exportLogsCSV(req, res);
});

export default router;

