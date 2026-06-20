import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate signed QR code for an identity
 */
export const generateQR = async (req, res) => {
  try {
    const { identity_id } = req.body;
    const expiresIn = req.body.expires_in || '365d'; // Default 1 year

    // Fetch identity
    const identityResult = await pool.query(
      'SELECT * FROM identities WHERE id = $1',
      [identity_id]
    );

    if (identityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Identity not found' });
    }

    const identity = identityResult.rows[0];

    // Check if identity is expired
    const expiryDate = new Date(identity.expiry_date);
    if (expiryDate < new Date()) {
      return res.status(400).json({ error: 'Identity has expired' });
    }

    // Build payload
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Default 1 year from now

    const payload = {
      identity_id: identity.id,
      ranger_id: identity.ranger_id,
      name: identity.name,
      rank: identity.rank,
      division: identity.division,
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    // Sign payload with RSA private key
    let privateKey;
    try {
      const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private_key.pem';
      privateKey = await fs.readFile(path.resolve(__dirname, privateKeyPath), 'utf8');
    } catch (error) {
      console.error('Error reading private key:', error);
      return res.status(500).json({ error: 'Signing key not available' });
    }

    // Generate signed token
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // Save QR issuance record
    const issuanceId = uuidv4();
    await pool.query(
      `INSERT INTO qr_issuances (id, identity_id, signature, token, issued_at, expires_at, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [issuanceId, identity_id, token, token, issuedAt, expiresAt, req.user.email || 'system']
    );

    // Generate QR code image
    const qrDataURL = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Return QR code and token
    res.json({
      qr_code: qrDataURL,
      token: token,
      payload: payload,
      issuance_id: issuanceId,
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

