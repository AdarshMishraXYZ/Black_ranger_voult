import express from 'express';
import { body, validationResult } from 'express-validator';
import { generateQR } from '../controllers/qrController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/generate-qr
 * Generate signed QR code for an identity
 */
router.post('/',
  authenticateAdmin,
  [
    body('identity_id').isUUID().withMessage('Valid identity ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await generateQR(req, res);
  }
);

export default router;

