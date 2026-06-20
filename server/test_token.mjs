import jwt from 'jsonwebtoken';
import fs from 'fs';

const privateKey = fs.readFileSync('./keys/private_key.pem', 'utf8');
const payload = {
  identity_id: 'b3452f27-a5f3-4be3-93b6-4a720cae69d9',
  ranger_id: 'BR-001',
  name: 'Test',
  rank: 'Elite',
  division: 'Alpha',
  issued_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 365*24*60*60*1000).toISOString()
};
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
fs.writeFileSync('token.txt', token);
console.log('Token saved to token.txt');
