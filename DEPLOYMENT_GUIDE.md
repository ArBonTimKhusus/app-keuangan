# 📘 Panduan Deployment ArBonKas ke VPS Hostinger

Panduan lengkap untuk men-deploy aplikasi ArBonKas (frontend + backend + database) ke VPS Hostinger. Dokumen ini ditujukan untuk pengguna dengan pengetahuan dasar terminal Linux.

---

## 📋 Daftar Isi

1. [Persiapan VPS Hostinger](#1-persiapan-vps-hostinger)
2. [Setup Database MySQL](#2-setup-database-mysql)
3. [Deploy Backend API](#3-deploy-backend-api)
4. [Deploy Frontend](#4-deploy-frontend)
5. [Setup SSL (HTTPS)](#5-setup-ssl-https)
6. [Konfigurasi Nginx](#6-konfigurasi-nginx)
7. [Maintenance & Monitoring](#7-maintenance--monitoring)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Persiapan VPS Hostinger

### 1.1 Login ke VPS via SSH

**Langkah 1:** Buka terminal (atau PuTTY di Windows)

**Langkah 2:** Login ke VPS menggunakan SSH
```bash
ssh root@IP_VPS_ANDA
```
Ganti `IP_VPS_ANDA` dengan IP VPS Hostinger Anda (contoh: `123.456.789.10`)

**Langkah 3:** Masukkan password root yang Anda terima dari Hostinger

**Hasil yang diharapkan:**
```
Welcome to Ubuntu 22.04 LTS (GNU/Linux ...)
root@hostname:~#
```

### 1.2 Update Sistem

**Langkah 1:** Update repository
```bash
apt update
```

**Langkah 2:** Upgrade semua package
```bash
apt upgrade -y
```

**Langkah 3:** Install tools dasar
```bash
apt install -y curl wget git build-essential
```

**Hasil yang diharapkan:**
```
Reading package lists... Done
Building dependency tree... Done
... (instalasi berjalan)
Done.
```

### 1.3 Install Node.js (v18 LTS)

**Langkah 1:** Install NVM (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Langkah 2:** Load NVM
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

**Langkah 3:** Install Node.js v18
```bash
nvm install 18
nvm use 18
nvm alias default 18
```

**Langkah 4:** Verifikasi instalasi
```bash
node --version
npm --version
```

**Hasil yang diharapkan:**
```
v18.x.x
9.x.x
```

### 1.4 Install MySQL 8.0

**Langkah 1:** Install MySQL Server
```bash
apt install -y mysql-server
```

**Langkah 2:** Jalankan secure installation
```bash
mysql_secure_installation
```

**Ikuti prompt:**
- Set root password: **YES** → masukkan password yang kuat (contoh: `ArBonKas2026!`)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

**Langkah 3:** Verifikasi MySQL berjalan
```bash
systemctl status mysql
```

**Hasil yang diharapkan:**
```
● mysql.service - MySQL Community Server
     Loaded: loaded ...
     Active: active (running) since ...
```

### 1.5 Install Nginx

**Langkah 1:** Install Nginx
```bash
apt install -y nginx
```

**Langkah 2:** Start Nginx
```bash
systemctl start nginx
systemctl enable nginx
```

**Langkah 3:** Cek status Nginx
```bash
systemctl status nginx
```

**Hasil yang diharapkan:**
```
● nginx.service - A high performance web server
     Active: active (running)
```

**Langkah 4:** Tes di browser → buka `http://IP_VPS_ANDA` → harus muncul halaman "Welcome to nginx!"

### 1.6 Install PM2 (Process Manager)

**Langkah 1:** Install PM2 global
```bash
npm install -g pm2
```

**Langkah 2:** Verifikasi instalasi
```bash
pm2 --version
```

**Hasil yang diharapkan:**
```
5.x.x
```

### 1.7 Konfigurasi Firewall

**Langkah 1:** Install UFW (jika belum ada)
```bash
apt install -y ufw
```

**Langkah 2:** Izinkan SSH, HTTP, dan HTTPS
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
```

**Langkah 3:** Aktifkan firewall
```bash
ufw enable
```

**Langkah 4:** Cek status firewall
```bash
ufw status
```

**Hasil yang diharapkan:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 2. Setup Database MySQL

### 2.1 Login ke MySQL

**Langkah 1:** Login sebagai root
```bash
mysql -u root -p
```
Masukkan password root MySQL yang Anda buat di langkah 1.4

**Hasil yang diharapkan:**
```
Welcome to the MySQL monitor.
mysql>
```

### 2.2 Buat Database dan User

**Langkah 1:** Buat database
```sql
CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Langkah 2:** Buat user MySQL
```sql
CREATE USER 'arbonkas_user'@'localhost' IDENTIFIED BY 'Password_Kuat_Anda_123!';
```
⚠️ **PENTING:** Ganti `Password_Kuat_Anda_123!` dengan password yang kuat dan unik!

**Langkah 3:** Berikan hak akses
```sql
GRANT ALL PRIVILEGES ON arbonkas_db.* TO 'arbonkas_user'@'localhost';
FLUSH PRIVILEGES;
```

**Langkah 4:** Verifikasi
```sql
SHOW DATABASES;
```

**Hasil yang diharapkan:**
```
+--------------------+
| Database           |
+--------------------+
| arbonkas_db        |
| information_schema |
| mysql              |
| ...                |
+--------------------+
```

**Langkah 5:** Keluar dari MySQL
```sql
EXIT;
```

### 2.3 Import Database Schema

**Langkah 1:** Clone repository (jika belum)
```bash
cd /var/www
git clone https://github.com/ArBonTimKhusus/app-keuangan.git
cd app-keuangan
```

**Langkah 2:** Import migration SQL
```bash
mysql -u arbonkas_user -p arbonkas_db < backend/migrations/001_initial_schema.sql
```
Masukkan password `arbonkas_user`

**Langkah 3:** Import seeder (kategori default)
```bash
mysql -u arbonkas_user -p arbonkas_db < backend/seeders/001_default_categories.sql
```

**Langkah 4:** Verifikasi tabel sudah dibuat
```bash
mysql -u arbonkas_user -p arbonkas_db -e "SHOW TABLES;"
```

**Hasil yang diharapkan:**
```
+------------------------+
| Tables_in_arbonkas_db  |
+------------------------+
| categories             |
| debts                  |
| sessions               |
| transactions           |
| users                  |
| wallets                |
+------------------------+
```

### 2.4 Setup Backup Otomatis Database

**Langkah 1:** Buat direktori backup
```bash
mkdir -p /var/backups/arbonkas
```

**Langkah 2:** Buat script backup
```bash
nano /usr/local/bin/backup-arbonkas-db.sh
```

**Isi script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/arbonkas"
DB_NAME="arbonkas_db"
DB_USER="arbonkas_user"

# Read password from .env file (more secure)
DB_PASS=$(grep DB_PASSWORD /var/www/app-keuangan/backend/.env | cut -d '=' -f2)

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/arbonkas_db_$DATE.sql.gz

# Hapus backup lebih dari 7 hari
find $BACKUP_DIR -name "arbonkas_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: arbonkas_db_$DATE.sql.gz"
```

**Langkah 3:** Berikan permission execute
```bash
chmod +x /usr/local/bin/backup-arbonkas-db.sh
```

**Langkah 4:** Tes backup manual
```bash
/usr/local/bin/backup-arbonkas-db.sh
```

**Langkah 5:** Setup cron untuk backup otomatis (setiap hari jam 2 pagi)
```bash
crontab -e
```

**Tambahkan baris ini:**
```
0 2 * * * /usr/local/bin/backup-arbonkas-db.sh
```

---

## 3. Deploy Backend API

### 3.1 Persiapan Backend

**Langkah 1:** Masuk ke direktori backend
```bash
cd /var/www/app-keuangan/backend
```

**Langkah 2:** Install dependencies
```bash
npm install
```

**Hasil yang diharapkan:**
```
added XXX packages in XXs
```

### 3.2 Konfigurasi Environment

**Langkah 1:** Copy file .env.example
```bash
cp .env.example .env
```

**Langkah 2:** Edit file .env
```bash
nano .env
```

**Isi konfigurasi:**
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=arbonkas_user
DB_PASSWORD=Password_Kuat_Anda_123!
DB_NAME=arbonkas_db

# JWT - GENERATE SECRET BARU!
JWT_SECRET=ArBonKas2026_Secret_Key_Yang_Sangat_Panjang_Dan_Aman_Min_32_Karakter
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS - ganti dengan domain Anda
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Security
BCRYPT_SALT_ROUNDS=12

# Session
SESSION_EXPIRY_DAYS=7
```

⚠️ **PENTING:**
- Ganti `DB_PASSWORD` dengan password MySQL yang Anda buat
- Generate `JWT_SECRET` baru yang panjang dan acak
- Ganti `CORS_ORIGIN` dengan domain Anda (atau gunakan `*` untuk development)

**Langkah 3:** Simpan file (Ctrl+O, Enter, Ctrl+X)

### 3.3 Test Backend Secara Manual

**Langkah 1:** Jalankan server untuk test
```bash
node server.js
```

**Hasil yang diharapkan:**
```
🔌 Testing database connection...
✓ Database connected successfully

═══════════════════════════════════════════════
  🚀 ArBonKas API Server
═══════════════════════════════════════════════
  ✓ Environment: production
  ✓ Port: 3000
  ✓ URL: http://localhost:3000
  ✓ Health: http://localhost:3000/health
═══════════════════════════════════════════════
```

**Langkah 2:** Tes endpoint health (di terminal baru)
```bash
curl http://localhost:3000/health
```

**Hasil yang diharapkan:**
```json
{"success":true,"message":"ArBonKas API is running","timestamp":"...","environment":"production"}
```

**Langkah 3:** Stop server (Ctrl+C)

### 3.4 Deploy dengan PM2

**Langkah 1:** Start backend dengan PM2
```bash
pm2 start server.js --name arbonkas-api
```

**Langkah 2:** Setup auto-start saat server reboot
```bash
pm2 startup
```
Jalankan command yang muncul (copy-paste)

**Langkah 3:** Save konfigurasi PM2
```bash
pm2 save
```

**Langkah 4:** Cek status
```bash
pm2 status
```

**Hasil yang diharapkan:**
```
┌────┬────────────────┬─────────────┬──────┬───────┬────────┐
│ id │ name           │ mode        │ ↺    │ status│ cpu    │
├────┼────────────────┼─────────────┼──────┼───────┼────────┤
│ 0  │ arbonkas-api   │ fork        │ 0    │ online│ 0%     │
└────┴────────────────┴─────────────┴──────┴───────┴────────┘
```

**Langkah 5:** Lihat logs
```bash
pm2 logs arbonkas-api
```

**Langkah 6:** Monitor real-time
```bash
pm2 monit
```
(Tekan Ctrl+C untuk keluar)

---

## 4. Deploy Frontend

### 4.1 Persiapan Frontend Files

**Langkah 1:** Buat direktori web root
```bash
mkdir -p /var/www/arbonkas-web
```

**Langkah 2:** Copy frontend files
```bash
cd /var/www/app-keuangan
cp -r index.html login.html css js ArBonKas_logo_compressed_2MB.png /var/www/arbonkas-web/
```

**Langkah 3:** Set permission
```bash
chown -R www-data:www-data /var/www/arbonkas-web
chmod -R 755 /var/www/arbonkas-web
```

### 4.2 Konfigurasi API Base URL

**Langkah 1:** Edit file API.js untuk production
```bash
nano /var/www/arbonkas-web/js/api.js
```

**Langkah 2:** Cari baris `baseURL` (sekitar baris 11-13) dan pastikan konfigurasi seperti ini:
```javascript
baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.hostname}/api`,
```

**Konfigurasi ini akan otomatis:**
- Development (localhost): `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

**Langkah 3:** Simpan file (Ctrl+O, Enter, Ctrl+X)

---

## 5. Setup SSL (HTTPS)

### 5.1 Install Certbot

**Langkah 1:** Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 5.2 Generate SSL Certificate

⚠️ **PERHATIAN:** Pastikan domain Anda sudah mengarah ke IP VPS sebelum langkah ini!

**Langkah 1:** Generate certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Ganti `yourdomain.com` dengan domain Anda yang sebenarnya

**Langkah 2:** Ikuti prompt:
- Email: Masukkan email Anda
- Agree to ToS: **Y**
- Share email with EFF: **N** (optional)
- Redirect HTTP to HTTPS: **2** (pilih redirect)

**Hasil yang diharapkan:**
```
Congratulations! You have successfully enabled HTTPS on https://yourdomain.com
```

### 5.3 Setup Auto-Renewal

**Langkah 1:** Test renewal
```bash
certbot renew --dry-run
```

**Hasil yang diharapkan:**
```
Congratulations, all simulated renewals succeeded
```

Certbot sudah otomatis setup cron untuk renewal. Tidak perlu konfigurasi tambahan.

---

## 6. Konfigurasi Nginx

### 6.1 Buat Konfigurasi Server Block

**Langkah 1:** Buat file konfigurasi
```bash
nano /etc/nginx/sites-available/arbonkas
```

**Langkah 2:** Isi konfigurasi lengkap:
```nginx
# ArBonKas - Nginx Configuration
# Frontend + Backend Reverse Proxy + SSL

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root Directory (Frontend)
    root /var/www/arbonkas-web;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript application/json;

    # Frontend - Serve static files
    location / {
        try_files $uri $uri/ =404;
    }

    # API - Reverse Proxy to Backend (Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (jika dibutuhkan nanti)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check Endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
        access_log off;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/arbonkas_access.log;
    error_log /var/log/nginx/arbonkas_error.log;
}
```

⚠️ **PENTING:** Ganti semua `yourdomain.com` dengan domain Anda yang sebenarnya!

**Langkah 3:** Simpan file (Ctrl+O, Enter, Ctrl+X)

### 6.2 Aktivasi Konfigurasi

**Langkah 1:** Buat symbolic link
```bash
ln -s /etc/nginx/sites-available/arbonkas /etc/nginx/sites-enabled/
```

**Langkah 2:** Hapus default config (opsional)
```bash
rm /etc/nginx/sites-enabled/default
```

**Langkah 3:** Test konfigurasi Nginx
```bash
nginx -t
```

**Hasil yang diharapkan:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Langkah 4:** Reload Nginx
```bash
systemctl reload nginx
```

**Langkah 5:** Restart Nginx
```bash
systemctl restart nginx
```

**Langkah 6:** Cek status
```bash
systemctl status nginx
```

### 6.3 Verifikasi Deployment

**Langkah 1:** Buka browser → `https://yourdomain.com`

**Yang harus terlihat:**
- ✅ Login page ArBonKas muncul
- ✅ SSL/HTTPS aktif (gembok hijau di browser)
- ✅ Logo ArBonKas tampil

**Langkah 2:** Test API endpoint
```bash
curl https://yourdomain.com/api/health
```

**Hasil yang diharapkan:**
```json
{"success":true,"message":"ArBonKas API is running",...}
```

**Langkah 3:** Test registrasi user baru di browser
- Klik tab "Daftar"
- Isi form dengan data test
- Submit → harus berhasil dan bisa login

---

## 7. Maintenance & Monitoring

### 7.1 Cara Update Code

**Skenario:** Ada update code dari GitHub yang perlu di-deploy

**Langkah 1:** Masuk ke direktori repository
```bash
cd /var/www/app-keuangan
```

**Langkah 2:** Pull update terbaru
```bash
git pull origin main
```

**Langkah 3:** Update backend (jika ada perubahan)
```bash
cd backend
npm install  # install dependencies baru (jika ada)
pm2 restart arbonkas-api
```

**Langkah 4:** Update frontend (jika ada perubahan)
```bash
cd /var/www/app-keuangan
cp -r index.html login.html css js /var/www/arbonkas-web/
```

**Langkah 5:** Verifikasi
```bash
pm2 logs arbonkas-api --lines 50
```

### 7.2 Cara Restart Services

**Restart Backend API:**
```bash
pm2 restart arbonkas-api
```

**Restart Nginx:**
```bash
systemctl restart nginx
```

**Restart MySQL:**
```bash
systemctl restart mysql
```

**Restart All:**
```bash
pm2 restart all
systemctl restart nginx
systemctl restart mysql
```

### 7.3 Cara Melihat Logs

**Backend logs (PM2):**
```bash
pm2 logs arbonkas-api          # Real-time logs
pm2 logs arbonkas-api --lines 100  # Last 100 lines
pm2 logs arbonkas-api --err    # Error logs only
```

**Nginx access logs:**
```bash
tail -f /var/log/nginx/arbonkas_access.log
```

**Nginx error logs:**
```bash
tail -f /var/log/nginx/arbonkas_error.log
```

**MySQL logs:**
```bash
tail -f /var/log/mysql/error.log
```

### 7.4 Monitoring Resource

**Cek penggunaan CPU & Memory:**
```bash
top
```
(Tekan 'q' untuk keluar)

**Cek disk usage:**
```bash
df -h
```

**Cek memory:**
```bash
free -h
```

**PM2 Monitoring:**
```bash
pm2 monit
```

**Install htop (monitoring yang lebih baik):**
```bash
apt install -y htop
htop
```

### 7.5 Database Backup & Restore

**Manual Backup:**
```bash
/usr/local/bin/backup-arbonkas-db.sh
```

**Restore dari Backup:**
```bash
# Cari file backup
ls -lh /var/backups/arbonkas/

# Restore (ganti FILENAME dengan nama file backup)
gunzip < /var/backups/arbonkas/arbonkas_db_FILENAME.sql.gz | mysql -u arbonkas_user -p arbonkas_db
```

**Download backup ke komputer lokal:**
```bash
# Di komputer lokal (bukan VPS)
scp root@IP_VPS:/var/backups/arbonkas/arbonkas_db_FILENAME.sql.gz ~/Downloads/
```

---

## 8. Troubleshooting

### 8.1 Backend API Tidak Jalan

**Problem:** PM2 status error atau offline

**Solusi:**

**Langkah 1:** Cek logs
```bash
pm2 logs arbonkas-api --lines 50
```

**Langkah 2:** Cek apakah port 3000 sudah digunakan
```bash
lsof -i :3000
```

**Langkah 3:** Restart API
```bash
pm2 restart arbonkas-api
```

**Langkah 4:** Jika masih error, stop dan start ulang
```bash
pm2 delete arbonkas-api
cd /var/www/app-keuangan/backend
pm2 start server.js --name arbonkas-api
pm2 save
```

### 8.2 Database Connection Error

**Problem:** Error "Database connection failed"

**Solusi:**

**Langkah 1:** Cek MySQL berjalan
```bash
systemctl status mysql
```

**Langkah 2:** Jika inactive, start MySQL
```bash
systemctl start mysql
```

**Langkah 3:** Test koneksi manual
```bash
mysql -u arbonkas_user -p arbonkas_db
```

**Langkah 4:** Cek file .env
```bash
nano /var/www/app-keuangan/backend/.env
```
Pastikan DB_USER, DB_PASSWORD, DB_NAME benar

### 8.3 Frontend Tidak Muncul

**Problem:** 404 Not Found atau blank page

**Solusi:**

**Langkah 1:** Cek file ada di directory
```bash
ls -la /var/www/arbonkas-web/
```

**Langkah 2:** Cek permission
```bash
chown -R www-data:www-data /var/www/arbonkas-web
chmod -R 755 /var/www/arbonkas-web
```

**Langkah 3:** Cek Nginx config
```bash
nginx -t
```

**Langkah 4:** Restart Nginx
```bash
systemctl restart nginx
```

### 8.4 SSL/HTTPS Bermasalah

**Problem:** Certificate expired atau tidak trusted

**Solusi:**

**Langkah 1:** Renew certificate
```bash
certbot renew
```

**Langkah 2:** Reload Nginx
```bash
systemctl reload nginx
```

### 8.5 API Endpoint 502 Bad Gateway

**Problem:** `/api/*` return 502 error

**Solusi:**

**Langkah 1:** Pastikan backend API running
```bash
pm2 status
```

**Langkah 2:** Test backend langsung
```bash
curl http://localhost:3000/health
```

**Langkah 3:** Cek Nginx error log
```bash
tail -50 /var/log/nginx/arbonkas_error.log
```

**Langkah 4:** Restart backend & Nginx
```bash
pm2 restart arbonkas-api
systemctl restart nginx
```

### 8.6 Reset User Password

**Problem:** Lupa password user

**Solusi:**

**Langkah 1:** Login ke MySQL
```bash
mysql -u arbonkas_user -p arbonkas_db
```

**Langkah 2:** Generate password hash baru

Buat script Node.js kecil untuk generate hash:
```bash
cd /tmp
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password_baru', 12));"
```

**Langkah 3:** Update password di database
```sql
UPDATE users SET password = 'HASH_DARI_STEP_2' WHERE email = 'user@example.com';
EXIT;
```

### 8.7 Cek Apakah Services Running

**All-in-one check:**
```bash
echo "=== MySQL ===" && systemctl is-active mysql && \
echo "=== Nginx ===" && systemctl is-active nginx && \
echo "=== Backend API ===" && pm2 status | grep arbonkas-api
```

**Hasil yang diharapkan:**
```
=== MySQL ===
active
=== Nginx ===
active
=== Backend API ===
│ 0  │ arbonkas-api   │ fork  │ 0    │ online │ 0%  │
```

### 8.8 Reset Database (HATI-HATI!)

⚠️ **PERINGATAN:** Ini akan menghapus SEMUA data!

**Langkah 1:** Backup dulu!
```bash
/usr/local/bin/backup-arbonkas-db.sh
```

**Langkah 2:** Drop dan recreate database
```bash
mysql -u arbonkas_user -p -e "DROP DATABASE arbonkas_db; CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Langkah 3:** Import schema ulang
```bash
cd /var/www/app-keuangan
mysql -u arbonkas_user -p arbonkas_db < backend/migrations/001_initial_schema.sql
mysql -u arbonkas_user -p arbonkas_db < backend/seeders/001_default_categories.sql
```

**Langkah 4:** Restart API
```bash
pm2 restart arbonkas-api
```

---

## 📞 Dukungan

Jika mengalami masalah:

1. **Cek logs** terlebih dahulu (section 7.3)
2. **Coba troubleshooting** di section 8
3. **Restart services** (section 7.2)
4. Jika masih bermasalah, hubungi developer

---

## ✅ Checklist Post-Deployment

Setelah deployment selesai, pastikan:

- [ ] Website bisa diakses via HTTPS
- [ ] Login page muncul dengan benar
- [ ] Bisa registrasi user baru
- [ ] Bisa login dan masuk ke dashboard
- [ ] SSL certificate aktif (gembok hijau)
- [ ] Backend API responding (test `/api/health`)
- [ ] PM2 auto-start sudah aktif
- [ ] Database backup cron job berjalan
- [ ] Firewall aktif dan configured
- [ ] Ganti semua password default
- [ ] Simpan semua password di tempat aman
- [ ] Test dari berbagai device/browser

---

**🎉 Selamat! ArBonKas sudah berhasil di-deploy ke VPS Hostinger!**

Dokumentasi ini dibuat oleh **ArBon Tim Khusus** - 2026
