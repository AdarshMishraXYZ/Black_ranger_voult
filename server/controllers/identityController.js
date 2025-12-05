import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';

/**
 * Create a new identity
 */
export const createIdentity = async (req, res) => {
  try {
    const { name, ranger_id, rank, division, issue_date, expiry_date, metadata } = req.body;

    // Check if ranger_id already exists
    const existing = await pool.query(
      'SELECT id FROM identities WHERE ranger_id = $1',
      [ranger_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ranger ID already exists' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO identities (id, name, ranger_id, rank, division, issue_date, expiry_date, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, name, ranger_id, rank, division, issue_date, expiry_date, metadata || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create identity error:', error);
    res.status(500).json({ error: 'Failed to create identity' });
  }
};

/**
 * Get identity by ID
 */
export const getIdentity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM identities WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Identity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get identity error:', error);
    res.status(500).json({ error: 'Failed to fetch identity' });
  }
};

