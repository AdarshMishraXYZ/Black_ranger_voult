import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify a scanned QR code
 */
export const verifyQR = async (req, res) => {
  try {
    const { token, device_info, geo } = req.body;

    // Get client IP
    const ip_address = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    let decoded;
    let result = 'invalid';
    let reason = '';
    let identity = null;

    try {
      // Verify signature with public key
      let publicKey;
      try {
        const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public_key.pem';
        publicKey = await fs.readFile(path.resolve(__dirname, "..", publicKeyPath), 'utf8');
      } catch (error) {
        console.error('Error reading public key:', error);
        return res.status(500).json({ error: 'Verification key not available' });
      }

      // Verify token
      decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

      // Check expiry
      const expiresAt = new Date(decoded.expires_at);
      if (expiresAt < new Date()) {
        result = 'expired';
        reason = 'QR code has expired';
      } else {
        // Check if QR issuance exists and is valid
        const issuanceResult = await pool.query(
          'SELECT * FROM qr_issuances WHERE token = $1 ORDER BY created_at DESC LIMIT 1',
          [token]
        );

        if (issuanceResult.rows.length === 0) {
          result = 'invalid';
          reason = 'QR code not found in system';
        } else {
          const issuance = issuanceResult.rows[0];
          
          // Check if issuance is expired
          if (new Date(issuance.expires_at) < new Date()) {
            result = 'expired';
            reason = 'QR code issuance has expired';
          } else {
            // Fetch identity
            const identityResult = await pool.query(
              'SELECT * FROM identities WHERE id = $1',
              [decoded.identity_id]
            );

            if (identityResult.rows.length === 0) {
              result = 'invalid';
              reason = 'Identity not found';
            } else {
              identity = identityResult.rows[0];
              
              // Check if identity itself is expired
              if (new Date(identity.expiry_date) < new Date()) {
                result = 'expired';
                reason = 'Identity has expired';
              } else {
                result = 'valid';
                reason = 'QR code is valid';
              }
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        result = 'expired';
        reason = 'Token has expired';
      } else if (error.name === 'JsonWebTokenError') {
        result = 'invalid';
        reason = 'Invalid token signature';
      } else {
        console.error('Verification error:', error);
        result = 'invalid';
        reason = 'Verification failed';
      }
    }

    // Save verification log
    const logId = uuidv4();
    await pool.query(
      `INSERT INTO verification_logs (id, identity_id, scanned_payload, signature_valid, result, device_info, ip_address, geo, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        logId,
        decoded?.identity_id || null,
        { token: token.substring(0, 50) + '...' }, // Store truncated token
        result === 'valid',
        result,
        device_info || {},
        ip_address,
        geo || null
      ]
    );

    // Return verification result
    res.json({
      valid: result === 'valid',
      result: result,
      reason: reason,
      identity: identity ? {
        id: identity.id,
        name: identity.name,
        ranger_id: identity.ranger_id,
        rank: identity.rank,
        division: identity.division
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

