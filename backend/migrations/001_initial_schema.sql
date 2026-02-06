-- ArBonKas Database Schema
-- Complete schema for financial management application

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE arbonkas_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
    avatar_url VARCHAR(500) NULL,
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'wallet' NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    color VARCHAR(7) DEFAULT '#4CAF50' NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL for default categories, user_id for custom categories',
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense', 'both') DEFAULT 'expense' NOT NULL,
    icon VARCHAR(50) DEFAULT 'circle' NOT NULL,
    color VARCHAR(7) DEFAULT '#9E9E9E' NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_category_id (category_id),
    INDEX idx_type (type),
    INDEX idx_date (date),
    INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Debts Table (Hutang & Piutang)
CREATE TABLE IF NOT EXISTS debts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('hutang', 'piutang') NOT NULL COMMENT 'hutang = debt owed, piutang = debt receivable',
    person_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NULL,
    date DATE NOT NULL,
    due_date DATE NULL,
    status ENUM('active', 'paid', 'overdue') DEFAULT 'active' NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_user_type_status (user_id, type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions Table (for token management)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trigger to update wallet balance on transaction insert
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.type = 'income' THEN
        UPDATE wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
    ELSE
        UPDATE wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
    END IF;
END//
DELIMITER ;

-- Create trigger to update wallet balance on transaction update
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_transaction_update
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
END//
DELIMITER ;

-- Create trigger to update wallet balance on transaction delete
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    IF OLD.type = 'income' THEN
        UPDATE wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
    ELSE
        UPDATE wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
    END IF;
END//
DELIMITER ;
