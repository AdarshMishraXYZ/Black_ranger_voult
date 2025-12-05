import { pool } from '../config/database.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
async function migrate() {
  try {
    console.log('🔄 Running migrations...');

    const migrationPath = path.join(__dirname, '../migrations/001_init.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

