import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public_key.pem';
const resolvedPath = path.resolve(__dirname, '..', publicKeyPath);

console.log('Loading key from:', resolvedPath);
console.log('File exists:', fs.existsSync(resolvedPath));

const publicKey = fs.readFileSync(resolvedPath, 'utf8');
console.log('Key starts with:', publicKey.substring(0, 50));

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eV9pZCI6ImIzNDUyZjI3LWE1ZjMtNGJlMy05M2I2LTRhNzIwY2FlNjlkOSIsInJhbmdlcl9pZCI6IkJSLTAwMSIsIm5hbWUiOiJUZXN0IiwicmFuayI6IkVsaXRlIiwiZGl2aXNpb24iOiJBbHBoYSIsImlzc3VlZF9hdCI6IjIwMjYtMDYtMjBUMTI6MDE6MDAuMDc2WiIsImV4cGlyZXNfYXQiOiIyMDI3LTA2LTIwVDEyOjAxOjAwLjA3NloiLCJpYXQiOjE3ODE5NTY4NjB9.jMOkEjeo6vsV0sSRWJRxSZXX5NM64PX9etYgwpSBiSII0zfjNX7nF9S0tqjD8qs9_KEnQ23TKjqN0evBBj1qGg7HHftJTCGS3ZTv7Ypkb9mH5bi0ybrvUo9MD0I9eutCdVgwI4osdJ-FVR2bHNRAF0kuF8oeuzQ6XHbDLhfRYgcKNXaoJTLAY-wHbWimt0WEQ9BQA0e6gLHqrqP_3U-f0SjFoQtWgibNXs7CuuUw0qtzqk7aSKoejykMsWinEMbgV7KUKWdL_6sfI_RV01Ofogp_DDYOMakH3Ksglj8VebzlSqkrh1XeOUKApDyBL4G5y-JNEw0XLq1iajS2ng9QYQ';

try {
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  console.log('✅ Server would say: VALID');
} catch(e) {
  console.log('❌ Server would say: INVALID -', e.message);
}
