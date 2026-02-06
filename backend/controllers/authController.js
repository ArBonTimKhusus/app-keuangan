/**
 * Authentication Controller
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { query } = require('../config/database');
const jwtConfig = require('../config/jwt');
const { success, created, unauthorized, error } = require('../utils/response');

const AuthController = {
  /**
   * Register a new user
   */
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, 'Email sudah terdaftar', 409);
      }
      
      // Create user
      const user = await User.create({ name, email, password });
      
      // Create default wallet for new user
      await query(
        'INSERT INTO wallets (user_id, name, icon, balance, color, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, 'Dompet Utama', 'wallet', 0, '#4CAF50', true]
      );
      
      return created(res, user, 'Registrasi berhasil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login user
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return unauthorized(res, 'Email atau password salah');
      }
      
      // Check if user is active
      if (!user.is_active) {
        return unauthorized(res, 'Akun Anda telah dinonaktifkan');
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return unauthorized(res, 'Email atau password salah');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        jwtConfig.secret,
        {
          expiresIn: jwtConfig.expiresIn,
          algorithm: jwtConfig.algorithm,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );
      
      // Calculate expiry date
      const expiryDays = parseInt(process.env.SESSION_EXPIRY_DAYS) || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
      
      // Store session
      await query(
        'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
        [user.id, token, req.ip, req.get('user-agent'), expiresAt]
      );
      
      // Update last login
      await User.updateLastLogin(user.id);
      
      // Return user data and token
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role
      };
      
      return success(res, { user: userData, token }, 'Login berhasil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout user
   */
  logout: async (req, res, next) => {
    try {
      // Delete session
      await query(
        'DELETE FROM sessions WHERE token = ?',
        [req.token]
      );
      
      return success(res, null, 'Logout berhasil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current user profile
   */
  me: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return unauthorized(res, 'User tidak ditemukan');
      }
      
      return success(res, user, 'Data user berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res, next) => {
    try {
      const { name, email, password, avatar_url } = req.body;
      const updateData = {};
      
      if (name) updateData.name = name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      
      // Check if email is being changed and if it's already in use
      if (email && email !== req.user.email) {
        const emailExists = await User.emailExists(email, req.user.id);
        if (emailExists) {
          return error(res, 'Email sudah digunakan', 409);
        }
        updateData.email = email;
      }
      
      // Add password if provided
      if (password) {
        updateData.password = password;
      }
      
      // Update user
      const updatedUser = await User.update(req.user.id, updateData);
      
      return success(res, updatedUser, 'Profile berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
