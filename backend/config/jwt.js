require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRY || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  algorithm: 'HS256',
  issuer: 'arbonkas-api',
  audience: 'arbonkas-client'
};

// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' || !jwtConfig.secret) {
  if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be set and at least 32 characters long!');
    console.error('Set JWT_SECRET in your .env file before starting the application.');
    process.exit(1);
  }
}

// Provide default for development only
if (!jwtConfig.secret && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  WARNING: Using default JWT secret for DEVELOPMENT only!');
  jwtConfig.secret = 'arbonkas-development-secret-key-change-in-production';
}

module.exports = jwtConfig;
