-- ArBonKas Database Schema
-- MySQL 8.0+
-- Character Set: utf8mb4

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arbonkas_db;

-- ============================================================
-- Table: users
-- Description: User accounts and authentication
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
  avatar_url VARCHAR(500) NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: wallets
-- Description: User wallets/accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL DEFAULT 'wallet',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  color VARCHAR(7) NOT NULL DEFAULT '#4CAF50' COMMENT 'Hex color code',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: categories
-- Description: Transaction categories (default and custom)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'NULL for default categories',
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense', 'both') NOT NULL DEFAULT 'expense',
  icon VARCHAR(50) NOT NULL DEFAULT 'tag',
  color VARCHAR(7) NOT NULL DEFAULT '#2196F3' COMMENT 'Hex color code',
  is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE for system default categories',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: transactions
-- Description: Income and expense transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  wallet_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_wallet_id (wallet_id),
  INDEX idx_category_id (category_id),
  INDEX idx_type (type),
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: debts
-- Description: Hutang (debt owed) and Piutang (receivables)
-- ============================================================
CREATE TABLE IF NOT EXISTS debts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('hutang', 'piutang') NOT NULL COMMENT 'hutang=debt owed, piutang=receivable',
  person_name VARCHAR(100) NOT NULL COMMENT 'Name of creditor or debtor',
  amount DECIMAL(15, 2) NOT NULL COMMENT 'Total amount',
  remaining_amount DECIMAL(15, 2) NOT NULL COMMENT 'Remaining unpaid amount',
  description VARCHAR(255) NOT NULL,
  date DATE NOT NULL COMMENT 'Transaction date',
  due_date DATE NULL COMMENT 'Payment due date',
  status ENUM('active', 'paid', 'overdue') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: sessions
-- Description: Active user sessions for token management
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL COMMENT 'JWT token',
  ip_address VARCHAR(45) NULL COMMENT 'IPv4 or IPv6',
  user_agent VARCHAR(500) NULL COMMENT 'Browser/device info',
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255)),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Triggers: Auto-update wallet balance
-- ============================================================

DELIMITER $$

-- Trigger: After INSERT transaction
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
  IF NEW.type = 'income' THEN
    UPDATE wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
  END IF;
END$$

-- Trigger: After UPDATE transaction
CREATE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
  -- Revert old transaction
  IF OLD.type = 'income' THEN
    UPDATE wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
  END IF;
  
  -- Apply new transaction
  IF NEW.type = 'income' THEN
    UPDATE wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
  END IF;
END$$

-- Trigger: After DELETE transaction
CREATE TRIGGER after_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
  IF OLD.type = 'income' THEN
    UPDATE wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- Initial Data Check
-- ============================================================
SELECT 'Database schema created successfully!' AS status;
