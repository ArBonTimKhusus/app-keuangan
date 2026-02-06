require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'arbonkas-default-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRY || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  algorithm: 'HS256',
  issuer: 'arbonkas-api',
  audience: 'arbonkas-client'
};

// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' && jwtConfig.secret.length < 32) {
  console.error('⚠️  WARNING: JWT_SECRET should be at least 32 characters in production!');
}

module.exports = jwtConfig;
