import { pool } from '../config/database.js';

/**
 * Get summary statistics
 */
export const getStats = async (req, res) => {
  try {
    // Total verifications
    const totalVerifications = await pool.query(
      'SELECT COUNT(*) as count FROM verification_logs'
    );

    // Valid verifications
    const validCount = await pool.query(
      'SELECT COUNT(*) as count FROM verification_logs WHERE result = $1',
      ['valid']
    );

    // Invalid verifications
    const invalidCount = await pool.query(
      'SELECT COUNT(*) as count FROM verification_logs WHERE result = $1',
      ['invalid']
    );

    // Active identities (not expired)
    const activeIdentities = await pool.query(
      'SELECT COUNT(*) as count FROM identities WHERE expiry_date > NOW()'
    );

    // Total identities
    const totalIdentities = await pool.query(
      'SELECT COUNT(*) as count FROM identities'
    );

    // Active rangers (for hero stat)
    const activeRangers = await pool.query(
      'SELECT COUNT(*) as count FROM identities WHERE expiry_date > NOW()'
    );

    res.json({
      total_verifications: parseInt(totalVerifications.rows[0].count),
      valid_count: parseInt(validCount.rows[0].count),
      invalid_count: parseInt(invalidCount.rows[0].count),
      active_identities: parseInt(activeIdentities.rows[0].count),
      total_identities: parseInt(totalIdentities.rows[0].count),
      active_rangers: parseInt(activeRangers.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

