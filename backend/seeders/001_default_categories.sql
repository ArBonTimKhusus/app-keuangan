-- Default Categories Seeder
-- Pre-populated categories for all users

USE arbonkas_db;

-- Default Income Categories
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Gaji', 'income', 'briefcase', '#4CAF50', TRUE),
(NULL, 'Bonus', 'income', 'gift', '#8BC34A', TRUE),
(NULL, 'Investasi', 'income', 'chart-line', '#009688', TRUE),
(NULL, 'Hadiah', 'income', 'gift', '#00BCD4', TRUE),
(NULL, 'Penjualan', 'income', 'shopping-cart', '#03A9F4', TRUE),
(NULL, 'Freelance', 'income', 'laptop-code', '#2196F3', TRUE),
(NULL, 'Lainnya', 'income', 'ellipsis-h', '#607D8B', TRUE);

-- Default Expense Categories
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Makanan & Minuman', 'expense', 'utensils', '#FF5722', TRUE),
(NULL, 'Transportasi', 'expense', 'car', '#FF9800', TRUE),
(NULL, 'Belanja', 'expense', 'shopping-bag', '#FFC107', TRUE),
(NULL, 'Hiburan', 'expense', 'film', '#FFEB3B', TRUE),
(NULL, 'Kesehatan', 'expense', 'heartbeat', '#F44336', TRUE),
(NULL, 'Pendidikan', 'expense', 'graduation-cap', '#9C27B0', TRUE),
(NULL, 'Tagihan & Utilitas', 'expense', 'file-invoice-dollar', '#673AB7', TRUE),
(NULL, 'Asuransi', 'expense', 'shield-alt', '#3F51B5', TRUE),
(NULL, 'Komunikasi', 'expense', 'mobile-alt', '#2196F3', TRUE),
(NULL, 'Pakaian', 'expense', 'tshirt', '#00BCD4', TRUE),
(NULL, 'Rumah Tangga', 'expense', 'home', '#009688', TRUE),
(NULL, 'Olahraga', 'expense', 'running', '#4CAF50', TRUE),
(NULL, 'Hadiah & Donasi', 'expense', 'hand-holding-heart', '#8BC34A', TRUE),
(NULL, 'Perawatan', 'expense', 'spa', '#CDDC39', TRUE),
(NULL, 'Elektronik', 'expense', 'laptop', '#795548', TRUE),
(NULL, 'Lainnya', 'expense', 'ellipsis-h', '#9E9E9E', TRUE);

-- Note: Default categories have user_id = NULL and is_default = TRUE
-- They will be available to all users
-- Users can still create their own custom categories
