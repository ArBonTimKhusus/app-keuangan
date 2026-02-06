# ArBonKas Backend API

Backend API untuk aplikasi ArBonKas - Aplikasi Laporan Keuangan.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database dan JWT secret Anda
```

### Database Setup

```bash
# Login ke MySQL
mysql -u root -p

# Jalankan commands berikut di MySQL:
CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'arbonkas_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON arbonkas_db.* TO 'arbonkas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u arbonkas_user -p arbonkas_db < migrations/001_initial_schema.sql

# Import default categories
mysql -u arbonkas_user -p arbonkas_db < seeders/001_default_categories.sql
```

### Running the Server

```bash
# Development mode (dengan nodemon)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js       # MySQL connection pool
│   └── jwt.js            # JWT configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── validator.js      # Input validation
│   ├── errorHandler.js   # Error handling
│   └── rateLimiter.js    # Rate limiting
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── transactions.js   # Transaction routes
│   ├── wallets.js        # Wallet routes
│   ├── categories.js     # Category routes
│   ├── debts.js          # Debt routes
│   └── reports.js        # Report routes
├── controllers/
│   ├── authController.js
│   ├── transactionController.js
│   ├── walletController.js
│   ├── categoryController.js
│   ├── debtController.js
│   └── reportController.js
├── models/
│   ├── User.js
│   ├── Transaction.js
│   ├── Wallet.js
│   ├── Category.js
│   └── Debt.js
├── migrations/
│   └── 001_initial_schema.sql
├── seeders/
│   └── 001_default_categories.sql
├── utils/
│   ├── response.js       # API response helpers
│   └── helpers.js        # Utility functions
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── server.js             # Entry point
└── README.md
```

## 🔐 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=arbonkas_user
DB_PASSWORD=your_secure_password
DB_NAME=arbonkas_db

# JWT
JWT_SECRET=your_very_long_random_secret_key
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Session
SESSION_CLEANUP_INTERVAL=3600000
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Transactions

- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary

### Wallets

- `GET /api/wallets` - Get all wallets
- `GET /api/wallets/:id` - Get single wallet
- `POST /api/wallets` - Create wallet
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet
- `PATCH /api/wallets/:id/balance` - Update wallet balance

### Categories

- `GET /api/categories` - Get all categories (defaults + custom)
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Debts

- `GET /api/debts` - Get all debts
- `GET /api/debts/:id` - Get single debt
- `POST /api/debts` - Create debt
- `PUT /api/debts/:id` - Update debt
- `DELETE /api/debts/:id` - Delete debt
- `PATCH /api/debts/:id/pay` - Mark debt as paid
- `GET /api/debts/summary` - Get debt summary
- `GET /api/debts/overdue` - Get overdue debts

### Reports

- `GET /api/reports/summary` - Financial summary
- `GET /api/reports/by-category` - Breakdown by category
- `GET /api/reports/by-wallet` - Breakdown by wallet
- `GET /api/reports/monthly` - Monthly trend
- `GET /api/reports/expense-chart` - Expense chart data
- `GET /api/reports/income-chart` - Income chart data

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 rounds
- **JWT Authentication**: Token-based authentication with 7-day expiry
- **Session Management**: Database-backed session tracking
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Express-validator for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **Security Headers**: Helmet.js
- **CORS**: Configurable cross-origin resource sharing

## 📊 Database Schema

### Tables

- **users**: User accounts and authentication
- **wallets**: User wallets/accounts
- **categories**: Transaction categories (default + custom)
- **transactions**: Income and expense records
- **debts**: Debt tracking (hutang & piutang)
- **sessions**: Active user sessions

### Triggers

- **after_transaction_insert**: Auto-update wallet balance on new transaction
- **after_transaction_update**: Auto-update wallet balance on transaction edit
- **after_transaction_delete**: Auto-update wallet balance on transaction deletion

## 🧪 Testing API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🚀 Production Deployment

Lihat [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) untuk panduan lengkap deployment ke VPS.

### Using PM2

```bash
# Start
pm2 start server.js --name arbonkas-api

# Monitor
pm2 monit

# Logs
pm2 logs arbonkas-api

# Restart
pm2 restart arbonkas-api

# Stop
pm2 stop arbonkas-api
```

## 📝 API Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Optional error details
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [
    // Array of items
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🛠️ Development

### Run with auto-reload

```bash
npm run dev
```

### Code Structure

- Controllers handle request/response logic
- Models handle database operations
- Middleware handles authentication, validation, and error handling
- Utils provide helper functions

## 📞 Support

- GitHub: [ArBonTimKhusus/app-keuangan](https://github.com/ArBonTimKhusus/app-keuangan)
- Issues: [GitHub Issues](https://github.com/ArBonTimKhusus/app-keuangan/issues)

## 📄 License

MIT

## 👥 Author

ArBon Tim Khusus
