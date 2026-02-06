-- ArBonKas Default Categories
-- These categories are available to all users

USE arbonkas_db;

-- ============================================================
-- Default Income Categories
-- ============================================================
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Gaji', 'income', 'money-bill-wave', '#4CAF50', TRUE),
(NULL, 'Bonus', 'income', 'gift', '#8BC34A', TRUE),
(NULL, 'Investasi', 'income', 'chart-line', '#009688', TRUE),
(NULL, 'Penjualan', 'income', 'shopping-cart', '#00BCD4', TRUE),
(NULL, 'Hadiah', 'income', 'gift', '#FFC107', TRUE),
(NULL, 'Lain-lain (Pemasukan)', 'income', 'plus-circle', '#607D8B', TRUE);

-- ============================================================
-- Default Expense Categories
-- ============================================================
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Makanan & Minuman', 'expense', 'utensils', '#FF5722', TRUE),
(NULL, 'Transportasi', 'expense', 'car', '#2196F3', TRUE),
(NULL, 'Belanja', 'expense', 'shopping-bag', '#E91E63', TRUE),
(NULL, 'Tagihan', 'expense', 'file-invoice-dollar', '#9C27B0', TRUE),
(NULL, 'Kesehatan', 'expense', 'heartbeat', '#F44336', TRUE),
(NULL, 'Pendidikan', 'expense', 'graduation-cap', '#3F51B5', TRUE),
(NULL, 'Hiburan', 'expense', 'film', '#FF9800', TRUE),
(NULL, 'Olahraga', 'expense', 'running', '#4CAF50', TRUE),
(NULL, 'Komunikasi', 'expense', 'phone', '#00BCD4', TRUE),
(NULL, 'Asuransi', 'expense', 'shield-alt', '#795548', TRUE),
(NULL, 'Perawatan', 'expense', 'spa', '#E91E63', TRUE),
(NULL, 'Lain-lain (Pengeluaran)', 'expense', 'ellipsis-h', '#9E9E9E', TRUE);

-- ============================================================
-- Default Both (Income/Expense) Categories
-- ============================================================
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Transfer', 'both', 'exchange-alt', '#3F51B5', TRUE),
(NULL, 'Investasi', 'both', 'coins', '#FF9800', TRUE);

SELECT 'Default categories seeded successfully!' AS status;
SELECT COUNT(*) AS total_categories FROM categories WHERE is_default = TRUE;
