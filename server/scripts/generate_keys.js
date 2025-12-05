import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate RSA keypair for QR code signing
 */
async function generateKeys() {
  try {
    console.log('🔑 Generating RSA keypair...');

    const keysDir = path.join(__dirname, '../keys');
    
    // Create keys directory if it doesn't exist
    try {
      await fs.mkdir(keysDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate keypair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Write keys to files
    const privateKeyPath = path.join(keysDir, 'private_key.pem');
    const publicKeyPath = path.join(keysDir, 'public_key.pem');

    await fs.writeFile(privateKeyPath, privateKey, 'utf8');
    await fs.writeFile(publicKeyPath, publicKey, 'utf8');

    // Set restrictive permissions on private key (Unix-like systems)
    if (process.platform !== 'win32') {
      await fs.chmod(privateKeyPath, 0o600);
    }

    console.log('✅ Keys generated successfully!');
    console.log(`   Private key: ${privateKeyPath}`);
    console.log(`   Public key: ${publicKeyPath}`);
    console.log('\n⚠️  IMPORTANT: Keep the private key secure and never commit it to version control!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Key generation error:', error);
    process.exit(1);
  }
}

generateKeys();

