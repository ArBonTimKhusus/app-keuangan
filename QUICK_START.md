# 🚀 Quick Start Guide - Local Testing

Panduan cepat untuk menjalankan ArBonKas di komputer lokal (development).

## Prerequisites

- Node.js v18+ ([Download](https://nodejs.org/))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- Git

## Step 1: Clone Repository

```bash
git clone https://github.com/ArBonTimKhusus/app-keuangan.git
cd app-keuangan
```

## Step 2: Setup Database

**1. Login ke MySQL:**
```bash
mysql -u root -p
```

**2. Buat database dan user:**
```sql
CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'arbonkas_user'@'localhost' IDENTIFIED BY 'arbonkas123';
GRANT ALL PRIVILEGES ON arbonkas_db.* TO 'arbonkas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**3. Import schema & data:**
```bash
mysql -u arbonkas_user -p arbonkas_db < backend/migrations/001_initial_schema.sql
mysql -u arbonkas_user -p arbonkas_db < backend/seeders/001_default_categories.sql
```
Password: `arbonkas123`

## Step 3: Setup Backend

**1. Masuk ke direktori backend:**
```bash
cd backend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Buat file .env:**
```bash
cp .env.example .env
```

**4. Edit .env (opsional - sudah default untuk development):**
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=arbonkas_user
DB_PASSWORD=arbonkas123
DB_NAME=arbonkas_db
JWT_SECRET=development_secret_key_local_testing_only
JWT_EXPIRY=7d
CORS_ORIGIN=*
```

**5. Start backend server:**
```bash
npm run dev
```

✅ **Expected Output:**
```
🔌 Testing database connection...
✓ Database connected successfully

═══════════════════════════════════════════════
  🚀 ArBonKas API Server
═══════════════════════════════════════════════
  ✓ Environment: development
  ✓ Port: 3000
  ✓ URL: http://localhost:3000
  ✓ Health: http://localhost:3000/health
═══════════════════════════════════════════════
```

**6. Test API (terminal baru):**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"success":true,"message":"ArBonKas API is running","timestamp":"...","environment":"development"}
```

## Step 4: Setup Frontend

**1. Buka terminal baru**

**2. Serve frontend dengan http-server:**
```bash
# Install http-server global (sekali saja)
npm install -g http-server

# Dari root direktori app-keuangan
http-server -p 8080
```

**Atau gunakan Python:**
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Atau gunakan Live Server di VS Code:**
- Install extension "Live Server"
- Right-click `index.html` → "Open with Live Server"

## Step 5: Test di Browser

**1. Buka browser:**
```
http://localhost:8080/login.html
```

**2. Register user baru:**
- Klik tab "Daftar"
- Isi: Nama, Email, Password (min 6 karakter)
- Submit

**3. Login:**
- Klik tab "Masuk"
- Isi email & password yang baru dibuat
- Submit

**4. Verify:**
- Harus redirect ke dashboard (`index.html`)
- Harus melihat nama user di kanan atas
- Status "Online" harus muncul

## 🧪 Test API Endpoints

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `token` from response.

### Get Wallets (Need Token)
```bash
curl http://localhost:3000/api/wallets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Categories
```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "category_id": 1,
    "type": "income",
    "amount": 1000000,
    "description": "Gaji Bulanan",
    "date": "2026-02-06"
  }'
```

## 🛑 Stop Servers

**Backend:**
- Press `Ctrl+C` in terminal

**Frontend:**
- Press `Ctrl+C` in terminal (http-server)
- Stop Live Server (VS Code)

## 📁 Struktur Project

```
app-keuangan/
├── backend/              # Backend API (Node.js)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── migrations/
│   ├── seeders/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
├── js/                   # Frontend JavaScript
│   ├── api.js           # ← API client
│   └── app.js           # Main app (needs update)
├── css/                  # Styles
├── index.html           # Main dashboard
├── login.html           # ← Login page
├── DEPLOYMENT_GUIDE.md  # ← VPS deployment
└── TRANSFORMATION_SUMMARY.md
```

## ⚠️ Important Notes

1. **js/app.js masih menggunakan localStorage**
   - Perlu diupdate untuk menggunakan API
   - Login page sudah terintegrasi dengan API
   - Dashboard masih baca dari localStorage

2. **Development only**
   - Jangan gunakan config ini untuk production
   - Generate JWT_SECRET baru untuk production
   - Ganti database password

3. **CORS = ***
   - Allow all origins untuk development
   - Restrict di production

## 🐛 Troubleshooting

### Backend tidak start
**Problem:** MySQL connection error

**Fix:**
```bash
# Cek MySQL running
systemctl status mysql  # Linux/Mac
# atau
mysql.server status     # Mac dengan Homebrew

# Start MySQL
systemctl start mysql   # Linux
mysql.server start      # Mac
```

### Port sudah digunakan
**Problem:** Port 3000 atau 8080 sudah terpakai

**Fix:**
```bash
# Ganti port di .env (backend)
PORT=3001

# Ganti port http-server (frontend)
http-server -p 8081
```

### Cannot find module
**Problem:** npm install gagal

**Fix:**
```bash
# Hapus node_modules dan reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Read Documentation:**
   - `TRANSFORMATION_SUMMARY.md` - Overview lengkap
   - `DEPLOYMENT_GUIDE.md` - Deploy ke VPS
   - `backend/README.md` - API documentation

2. **Update Frontend:**
   - Modify `js/app.js` untuk menggunakan API
   - Test all features

3. **Production Deployment:**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy ke VPS Hostinger

---

**Happy Coding! 🚀**
