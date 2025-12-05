import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyQR } from '../controllers/verifyController.js';
import { verifyRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/verify
 * Verify a scanned QR code
 */
router.post('/',
  verifyRateLimiter,
  [
    body('token').notEmpty().withMessage('QR token is required'),
    body('device_info').isObject().withMessage('Device info is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await verifyQR(req, res);
  }
);

export default router;

