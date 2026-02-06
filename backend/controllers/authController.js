/**
 * Authentication Controller
 * Handles user registration, login, logout, and profile management
 */

const User = require('../models/User');
const { pool } = require('../config/database');
const { generateAccessToken } = require('../config/jwt');
const { comparePassword, sanitizeUser, formatDateTimeForDB } = require('../utils/helpers');
const response = require('../utils/response');

const authController = {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            
            // Check if email already exists
            const emailExists = await User.emailExists(email);
            if (emailExists) {
                return response.error(res, 'Email sudah terdaftar', 409);
            }
            
            // Create user
            const userId = await User.create({ name, email, password, role: 'user' });
            
            // Get created user
            const user = await User.findById(userId);
            
            // Create default wallet for new user
            await pool.query(
                'INSERT INTO wallets (user_id, name, icon, color, balance, is_default) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, 'Dompet Utama', 'wallet', '#4CAF50', 0, true]
            );
            
            // Generate token
            const token = generateAccessToken({ userId: user.id, email: user.email });
            
            // Save session
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
            
            await pool.query(
                'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
                [user.id, token, req.ip, req.get('user-agent'), formatDateTimeForDB(expiresAt)]
            );
            
            // Update last login
            await User.updateLastLogin(user.id);
            
            return response.created(res, {
                user: sanitizeUser(user),
                token
            }, 'Registrasi berhasil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            // Find user by email
            const user = await User.findByEmail(email);
            
            if (!user) {
                return response.unauthorized(res, 'Email atau password salah');
            }
            
            // Check if user is active
            if (!user.is_active) {
                return response.forbidden(res, 'Akun Anda telah dinonaktifkan');
            }
            
            // Verify password
            const isPasswordValid = await comparePassword(password, user.password);
            
            if (!isPasswordValid) {
                return response.unauthorized(res, 'Email atau password salah');
            }
            
            // Generate token
            const token = generateAccessToken({ userId: user.id, email: user.email });
            
            // Save session
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            
            await pool.query(
                'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
                [user.id, token, req.ip, req.get('user-agent'), formatDateTimeForDB(expiresAt)]
            );
            
            // Update last login
            await User.updateLastLogin(user.id);
            
            return response.success(res, {
                user: sanitizeUser(user),
                token
            }, 'Login berhasil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Logout user
     * POST /api/auth/logout
     */
    async logout(req, res, next) {
        try {
            const token = req.token;
            
            // Delete session
            await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
            
            return response.success(res, null, 'Logout berhasil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get current user profile
     * GET /api/auth/me
     */
    async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return response.notFound(res, 'User tidak ditemukan');
            }
            
            // Get user statistics
            const stats = await User.getStats(user.id);
            
            return response.success(res, {
                user: sanitizeUser(user),
                stats
            }, 'Profil berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    async updateProfile(req, res, next) {
        try {
            const { name, email, password, avatar_url } = req.body;
            const userId = req.user.id;
            
            // Check if email is being changed and if it's already taken
            if (email && email !== req.user.email) {
                const emailExists = await User.emailExists(email, userId);
                if (emailExists) {
                    return response.error(res, 'Email sudah digunakan', 409);
                }
            }
            
            // Prepare update data
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) updateData.password = password;
            if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
            
            // Update user
            const updated = await User.update(userId, updateData);
            
            if (!updated) {
                return response.error(res, 'Tidak ada perubahan yang dilakukan');
            }
            
            // Get updated user
            const user = await User.findById(userId);
            
            return response.success(res, {
                user: sanitizeUser(user)
            }, 'Profil berhasil diperbarui');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Clean up expired sessions (should be called periodically)
     */
    async cleanupSessions(req, res, next) {
        try {
            await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
            return response.success(res, null, 'Expired sessions cleaned up');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
