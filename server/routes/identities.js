import express from 'express';
import { body, validationResult } from 'express-validator';
import { createIdentity, getIdentity } from '../controllers/identityController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/identities
 * Create a new identity (admin only)
 */
router.post('/',
  authenticateAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('ranger_id').notEmpty().withMessage('Ranger ID is required'),
    body('rank').notEmpty().withMessage('Rank is required'),
    body('division').notEmpty().withMessage('Division is required'),
    body('issue_date').isISO8601().withMessage('Valid issue date is required'),
    body('expiry_date').isISO8601().withMessage('Valid expiry date is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await createIdentity(req, res);
  }
);

/**
 * GET /api/identities/:id
 * Get identity by ID
 */
router.get('/:id', async (req, res) => {
  await getIdentity(req, res);
});

export default router;

