import { pool } from '../config/database.js';

/**
 * Get verification logs with filters
 */
export const getLogs = async (req, res) => {
  try {
    const {
      valid,
      from,
      to,
      device,
      limit = 100,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM verification_logs WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (valid !== undefined) {
      paramCount++;
      query += ` AND signature_valid = $${paramCount}`;
      params.push(valid === 'true');
    }

    if (from) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(from);
    }

    if (to) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(to);
    }

    if (device) {
      paramCount++;
      query += ` AND device_info::text ILIKE $${paramCount}`;
      params.push(`%${device}%`);
    }

    query += ' ORDER BY created_at DESC';

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*)').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '').replace(/OFFSET.*$/, '');
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      logs: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

/**
 * Export logs as CSV
 */
export const exportLogsCSV = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        vl.id,
        vl.created_at,
        i.name,
        i.ranger_id,
        vl.result,
        vl.signature_valid,
        vl.ip_address,
        vl.device_info,
        vl.geo
       FROM verification_logs vl
       LEFT JOIN identities i ON vl.identity_id = i.id
       ORDER BY vl.created_at DESC
       LIMIT 10000`
    );

    // Convert to CSV
    const headers = ['ID', 'Timestamp', 'Name', 'Ranger ID', 'Result', 'Valid', 'IP Address', 'Device Info', 'Geo'];
    const rows = result.rows.map(row => [
      row.id,
      row.created_at,
      row.name || '',
      row.ranger_id || '',
      row.result,
      row.signature_valid,
      row.ip_address,
      JSON.stringify(row.device_info),
      JSON.stringify(row.geo)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=verification_logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
};

