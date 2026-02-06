# ArBonKas Backend API

Backend API untuk aplikasi ArBonKas - sistem manajemen keuangan berbasis Node.js, Express, dan MySQL.

## 🚀 Quick Start

### Prerequisites

- Node.js v18 atau lebih baru
- MySQL 8.0 atau lebih baru
- npm atau yarn

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/ArBonTimKhusus/app-keuangan.git
cd app-keuangan/backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup database:**
```bash
# Login ke MySQL
mysql -u root -p

# Buat database dan user
CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'arbonkas_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON arbonkas_db.* TO 'arbonkas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u arbonkas_user -p arbonkas_db < migrations/001_initial_schema.sql

# Import default data
mysql -u arbonkas_user -p arbonkas_db < seeders/001_default_categories.sql
```

4. **Setup environment:**
```bash
cp .env.example .env
nano .env  # Edit konfigurasi
```

5. **Start server:**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Struktur Direktori

```
backend/
├── config/               # Konfigurasi database & JWT
├── middleware/           # Express middleware
├── routes/               # API routes
├── controllers/          # Business logic
├── models/               # Data models
├── migrations/           # Database migrations
├── seeders/             # Database seeders
├── utils/               # Helper functions
├── .env.example         # Template environment variables
├── server.js            # Entry point
└── package.json         # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Wallets
- `GET /api/wallets` - List wallets
- `GET /api/wallets/:id` - Get wallet detail
- `POST /api/wallets` - Create wallet
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet

### Categories
- `GET /api/categories` - List categories (defaults + custom)
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete custom category

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/:id` - Get transaction detail
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Debts
- `GET /api/debts` - List debts
- `GET /api/debts/summary` - Get debt summary
- `GET /api/debts/:id` - Get debt detail
- `POST /api/debts` - Create debt
- `PUT /api/debts/:id` - Update debt
- `PATCH /api/debts/:id/pay` - Mark as paid
- `DELETE /api/debts/:id` - Delete debt

### Reports
- `GET /api/reports/summary` - Financial summary
- `GET /api/reports/by-category` - Category breakdown
- `GET /api/reports/by-wallet` - Wallet breakdown
- `GET /api/reports/monthly` - Monthly trend

## 🔒 Security Features

- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Helmet.js security headers

## 🧪 Testing

```bash
# Test API dengan curl
curl http://localhost:3000/health

# Registrasi user baru
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 Database Schema

- **users** - User accounts
- **wallets** - User wallets
- **categories** - Transaction categories
- **transactions** - Income/expense transactions
- **debts** - Hutang & piutang
- **sessions** - Active sessions

## 🛠️ Development

```bash
# Install nodemon untuk auto-reload
npm install -g nodemon

# Run development server
npm run dev
```

## 📝 Environment Variables

```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=arbonkas_user
DB_PASSWORD=your_password
DB_NAME=arbonkas_db
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRY=7d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
BCRYPT_SALT_ROUNDS=12
```

## 🚀 Deployment

Lihat [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) untuk panduan lengkap deployment ke VPS Hostinger.

## 📄 License

MIT License - ArBon Tim Khusus 2026
