/**
 * ArBonKas Backend Server
 * Main entry point for the Express API server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const walletRoutes = require('./routes/wallets');
const categoryRoutes = require('./routes/categories');
const debtRoutes = require('./routes/debts');
const reportRoutes = require('./routes/reports');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logging

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ArBonKas API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/reports', reportRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ArBonKas API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Test database connection
        await testConnection();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════');
            console.log('🚀 ArBonKas Backend Server Started');
            console.log('═══════════════════════════════════════');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
            console.log('═══════════════════════════════════════');
        });
        
        // Cleanup expired sessions periodically (every hour)
        const sessionCleanupInterval = process.env.SESSION_CLEANUP_INTERVAL || 3600000; // 1 hour
        setInterval(async () => {
            try {
                const { pool } = require('./config/database');
                await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
                console.log('🧹 Expired sessions cleaned up');
            } catch (error) {
                console.error('Error cleaning up sessions:', error);
            }
        }, sessionCleanupInterval);
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    const { closePool } = require('./config/database');
    await closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    const { closePool } = require('./config/database');
    await closePool();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
