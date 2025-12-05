import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed database with initial data
 */
async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Read and execute migration first
    const migrationPath = path.join(__dirname, '../migrations/001_init.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Migration executed');

    // Create default admin
    const adminEmail = 'admin@blackranger.com';
    const adminPassword = 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin exists
    const existingAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      await pool.query(
        'INSERT INTO admins (email, password_hash, role) VALUES ($1, $2, $3)',
        [adminEmail, passwordHash, 'admin']
      );
      console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create sample identity
    const sampleIdentity = {
      name: 'John Black Ranger',
      ranger_id: 'BR-001',
      rank: 'Elite Ranger',
      division: 'Alpha Division',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      metadata: {
        clearance_level: 'Top Secret',
        specializations: ['Combat', 'Reconnaissance']
      }
    };

    // Check if sample identity exists
    const existingIdentity = await pool.query(
      'SELECT id FROM identities WHERE ranger_id = $1',
      [sampleIdentity.ranger_id]
    );

    if (existingIdentity.rows.length === 0) {
      await pool.query(
        `INSERT INTO identities (name, ranger_id, rank, division, issue_date, expiry_date, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sampleIdentity.name,
          sampleIdentity.ranger_id,
          sampleIdentity.rank,
          sampleIdentity.division,
          sampleIdentity.issue_date,
          sampleIdentity.expiry_date,
          JSON.stringify(sampleIdentity.metadata)
        ]
      );
      console.log(`✅ Sample identity created: ${sampleIdentity.ranger_id}`);
    } else {
      console.log('ℹ️  Sample identity already exists');
    }

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();

