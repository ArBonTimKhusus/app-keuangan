/**
 * Database Configuration and Connection Pool
 * MySQL connection management with migration support
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4'
});

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Run database migrations
 */
async function runMigrations() {
    try {
        const migrationsPath = path.join(__dirname, '../migrations');
        const files = await fs.readdir(migrationsPath);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        console.log('🔄 Running migrations...');
        
        for (const file of sqlFiles) {
            console.log(`  - Executing ${file}...`);
            const sql = await fs.readFile(path.join(migrationsPath, file), 'utf8');
            
            // Split by semicolons and execute each statement
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            for (const statement of statements) {
                await pool.query(statement);
            }
            
            console.log(`  ✅ ${file} completed`);
        }
        
        console.log('✅ All migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

/**
 * Run database seeders
 */
async function runSeeders() {
    try {
        const seedersPath = path.join(__dirname, '../seeders');
        const files = await fs.readdir(seedersPath);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        console.log('🌱 Running seeders...');
        
        for (const file of sqlFiles) {
            console.log(`  - Executing ${file}...`);
            const sql = await fs.readFile(path.join(seedersPath, file), 'utf8');
            
            // Split by semicolons and execute each statement
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            for (const statement of statements) {
                await pool.query(statement);
            }
            
            console.log(`  ✅ ${file} completed`);
        }
        
        console.log('✅ All seeders completed successfully');
    } catch (error) {
        console.error('❌ Seeder failed:', error.message);
        throw error;
    }
}

/**
 * Close database connection pool
 */
async function closePool() {
    try {
        await pool.end();
        console.log('Database pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error);
    }
}

module.exports = {
    pool,
    testConnection,
    runMigrations,
    runSeeders,
    closePool
};
