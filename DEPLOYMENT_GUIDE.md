# 🚀 Panduan Deployment ArBonKas ke VPS Hostinger

Panduan lengkap untuk melakukan deployment aplikasi ArBonKas (backend + frontend) ke VPS Hostinger dengan konfigurasi lengkap Node.js, MySQL, Nginx, SSL, dan PM2.

## 📋 Daftar Isi

1. [Persiapan VPS Hostinger](#1-persiapan-vps-hostinger)
2. [Setup Database MySQL](#2-setup-database-mysql)
3. [Deploy Backend (Node.js API)](#3-deploy-backend-nodejs-api)
4. [Deploy Frontend](#4-deploy-frontend)
5. [Konfigurasi Nginx](#5-konfigurasi-nginx)
6. [Setup SSL (HTTPS)](#6-setup-ssl-https)
7. [Maintenance & Monitoring](#7-maintenance--monitoring)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Persiapan VPS Hostinger

### 1.1 Login ke VPS via SSH

```bash
# Ganti IP_ADDRESS dengan IP VPS Anda
ssh root@IP_ADDRESS
```

Masukkan password root yang Anda terima dari Hostinger.

**Output yang diharapkan:**
```
Welcome to Ubuntu 22.04.x LTS
```

### 1.2 Update Sistem

```bash
apt update && apt upgrade -y
```

**Catatan:** Proses ini membutuhkan waktu 2-5 menit.

### 1.3 Install Node.js menggunakan NVM

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS (v18)
nvm install 18
nvm use 18
nvm alias default 18

# Verifikasi instalasi
node --version
npm --version
```

**Output yang diharapkan:**
```
v18.x.x
9.x.x
```

### 1.4 Install MySQL 8.0

```bash
# Install MySQL Server
apt install mysql-server -y

# Jalankan secure installation
mysql_secure_installation
```

**Jawab pertanyaan berikut:**
- Validate Password Component? → **y**
- Password validation policy? → **1** (MEDIUM)
- Set root password? → **y** (masukkan password yang kuat)
- Remove anonymous users? → **y**
- Disallow root login remotely? → **y**
- Remove test database? → **y**
- Reload privilege tables? → **y**

**Verifikasi MySQL:**
```bash
systemctl status mysql
```

**Output yang diharapkan:**
```
● mysql.service - MySQL Community Server
   Active: active (running)
```

### 1.5 Install Nginx

```bash
# Install Nginx
apt install nginx -y

# Start dan enable Nginx
systemctl start nginx
systemctl enable nginx

# Verifikasi
systemctl status nginx
```

**Output yang diharapkan:**
```
● nginx.service - A high performance web server
   Active: active (running)
```

### 1.6 Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Verifikasi
pm2 --version
```

### 1.7 Konfigurasi Firewall

```bash
# Install ufw (jika belum ada)
apt install ufw -y

# Konfigurasi firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Cek status
ufw status
```

**Output yang diharapkan:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## 2. Setup Database MySQL

### 2.1 Login ke MySQL

```bash
mysql -u root -p
```

Masukkan password root MySQL yang Anda buat sebelumnya.

### 2.2 Buat Database dan User

```sql
-- Buat database
CREATE DATABASE arbonkas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user
CREATE USER 'arbonkas_user'@'localhost' IDENTIFIED BY 'PASSWORD_YANG_KUAT';

-- Berikan hak akses
GRANT ALL PRIVILEGES ON arbonkas_db.* TO 'arbonkas_user'@'localhost';

-- Reload privileges
FLUSH PRIVILEGES;

-- Keluar dari MySQL
EXIT;
```

**Ganti `PASSWORD_YANG_KUAT`** dengan password yang aman (minimal 12 karakter, kombinasi huruf besar, kecil, angka, dan simbol).

**Verifikasi database:**
```bash
mysql -u arbonkas_user -p arbonkas_db
```

Jika berhasil login, database sudah siap!

### 2.3 Import Schema Database

```bash
# Masih di directory root, clone repository
cd /var/www
git clone https://github.com/ArBonTimKhusus/app-keuangan.git
cd app-keuangan

# Import migrations
mysql -u arbonkas_user -p arbonkas_db < backend/migrations/001_initial_schema.sql

# Import seeders (data kategori default)
mysql -u arbonkas_user -p arbonkas_db < backend/seeders/001_default_categories.sql
```

**Verifikasi tabel:**
```bash
mysql -u arbonkas_user -p arbonkas_db -e "SHOW TABLES;"
```

**Output yang diharapkan:**
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

```bash
# Buat directory backup
mkdir -p /var/backups/arbonkas

# Buat script backup
cat > /usr/local/bin/backup-arbonkas.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/arbonkas"
DB_NAME="arbonkas_db"
DB_USER="arbonkas_user"
DB_PASS="PASSWORD_YANG_KUAT"

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/arbonkas_$DATE.sql.gz

# Hapus backup yang lebih dari 7 hari
find $BACKUP_DIR -name "arbonkas_*.sql.gz" -mtime +7 -delete
EOF

# Ganti PASSWORD_YANG_KUAT dengan password database Anda
nano /usr/local/bin/backup-arbonkas.sh

# Buat executable
chmod +x /usr/local/bin/backup-arbonkas.sh

# Tambahkan ke crontab (backup setiap hari jam 2 pagi)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-arbonkas.sh") | crontab -
```

---

## 3. Deploy Backend (Node.js API)

### 3.1 Persiapan Directory dan Dependencies

```bash
# Masuk ke directory backend
cd /var/www/app-keuangan/backend

# Install dependencies
npm install
```

**Catatan:** Proses ini membutuhkan waktu 1-3 menit.

### 3.2 Konfigurasi Environment

```bash
# Copy file .env.example ke .env
cp .env.example .env

# Edit file .env
nano .env
```

**Isi file `.env` dengan konfigurasi berikut:**
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=arbonkas_user
DB_PASSWORD=PASSWORD_YANG_KUAT
DB_NAME=arbonkas_db

# JWT
JWT_SECRET=RANDOM_STRING_MINIMAL_32_KARAKTER
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

**Penting:**
- Ganti `PASSWORD_YANG_KUAT` dengan password database Anda
- Ganti `RANDOM_STRING_MINIMAL_32_KARAKTER` dengan string random yang kuat. Generate dengan:
  ```bash
  openssl rand -hex 32
  ```
- Ganti `https://yourdomain.com` dengan domain Anda

**Simpan file:** Tekan `Ctrl+X`, lalu `Y`, lalu `Enter`

### 3.3 Test Backend Secara Manual

```bash
# Test jalankan server
node server.js
```

**Output yang diharapkan:**
```
✅ Database connected successfully
═══════════════════════════════════════
🚀 ArBonKas Backend Server Started
═══════════════════════════════════════
📡 Server running on port 3000
🌍 Environment: production
🔗 API URL: http://localhost:3000
💚 Health Check: http://localhost:3000/health
═══════════════════════════════════════
```

**Test API dari terminal lain:**
```bash
curl http://localhost:3000/health
```

**Output yang diharapkan:**
```json
{"success":true,"message":"ArBonKas API is running","timestamp":"..."}
```

Jika berhasil, tekan `Ctrl+C` untuk stop server.

### 3.4 Deploy dengan PM2

```bash
# Start aplikasi dengan PM2
pm2 start server.js --name arbonkas-api

# Save PM2 process list
pm2 save

# Setup PM2 startup (agar auto-start saat server reboot)
pm2 startup

# Jalankan command yang ditampilkan PM2 (contoh):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

**Verifikasi PM2:**
```bash
pm2 list
```

**Output yang diharapkan:**
```
┌─────┬────────────────┬─────────┬──────┬─────┬──────────┐
│ id  │ name           │ status  │ cpu  │ mem │ uptime   │
├─────┼────────────────┼─────────┼──────┼─────┼──────────┤
│ 0   │ arbonkas-api   │ online  │ 0%   │ 50M │ 10s      │
└─────┴────────────────┴─────────┴──────┴─────┴──────────┘
```

**Lihat logs:**
```bash
pm2 logs arbonkas-api
```

**Ctrl+C untuk keluar dari logs**

---

## 4. Deploy Frontend

### 4.1 Copy Frontend ke Nginx Directory

```bash
# Buat directory untuk frontend
mkdir -p /var/www/arbonkas

# Copy semua file frontend (kecuali backend, android-package)
cd /var/www/app-keuangan
cp index.html login.html ArBonKas_logo_compressed_2MB.png /var/www/arbonkas/
cp -r css js /var/www/arbonkas/

# Set permissions
chown -R www-data:www-data /var/www/arbonkas
chmod -R 755 /var/www/arbonkas
```

### 4.2 Konfigurasi API Base URL

```bash
# Edit file API untuk production
nano /var/www/arbonkas/js/api.js
```

**Cari baris:**
```javascript
baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`,
```

**Pastikan konfigurasi sudah benar** (tidak perlu diubah jika sudah seperti di atas, karena akan otomatis menggunakan `/api` untuk production).

---

## 5. Konfigurasi Nginx

### 5.1 Buat Konfigurasi Nginx

```bash
# Buat file konfigurasi untuk ArBonKas
nano /etc/nginx/sites-available/arbonkas
```

**Paste konfigurasi berikut:**
```nginx
# ArBonKas Nginx Configuration

# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (akan diisi oleh Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Root directory untuk frontend
    root /var/www/arbonkas;
    index index.html;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend Routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/arbonkas_access.log;
    error_log /var/log/nginx/arbonkas_error.log;
}
```

**Ganti `yourdomain.com`** dengan domain Anda di 3 tempat:
- Baris `server_name yourdomain.com www.yourdomain.com;` (2x)
- Comment SSL certificate paths (untuk nanti)

**Simpan:** `Ctrl+X`, `Y`, `Enter`

### 5.2 Enable Konfigurasi dan Test

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/arbonkas /etc/nginx/sites-enabled/

# Hapus default config (opsional)
rm /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t
```

**Output yang diharapkan:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5.3 Restart Nginx

```bash
systemctl restart nginx
systemctl status nginx
```

---

## 6. Setup SSL (HTTPS)

### 6.1 Install Certbot

```bash
# Install Certbot dan plugin Nginx
apt install certbot python3-certbot-nginx -y
```

### 6.2 Generate SSL Certificate

```bash
# Generate certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Ganti `yourdomain.com`** dengan domain Anda.

**Jawab pertanyaan:**
- Email address: **masukkan email Anda**
- Terms of Service: **A** (Agree)
- Share email: **N** (No)

**Output yang diharapkan:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 6.3 Test SSL Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run
```

**Output yang diharapkan:**
```
Congratulations, all simulated renewals succeeded
```

SSL akan otomatis diperpanjang sebelum expired.

### 6.4 Verifikasi HTTPS

Buka browser dan akses:
```
https://yourdomain.com
```

Jika muncul halaman login ArBonKas dan ada icon gembok hijau di address bar, SSL berhasil!

---

## 7. Maintenance & Monitoring

### 7.1 Command PM2 Penting

```bash
# Lihat status semua aplikasi
pm2 list

# Lihat logs real-time
pm2 logs arbonkas-api

# Lihat logs specific lines
pm2 logs arbonkas-api --lines 100

# Restart aplikasi
pm2 restart arbonkas-api

# Stop aplikasi
pm2 stop arbonkas-api

# Start aplikasi
pm2 start arbonkas-api

# Reload aplikasi (zero-downtime)
pm2 reload arbonkas-api

# Hapus dari PM2
pm2 delete arbonkas-api

# Monitoring
pm2 monit

# Info detail
pm2 info arbonkas-api
```

### 7.2 Update Kode Aplikasi

```bash
# Masuk ke directory
cd /var/www/app-keuangan

# Pull update dari GitHub
git pull origin main

# Update backend
cd backend
npm install
pm2 reload arbonkas-api

# Update frontend
cd ..
cp index.html login.html /var/www/arbonkas/
cp -r css js /var/www/arbonkas/
chown -R www-data:www-data /var/www/arbonkas
```

### 7.3 Lihat Logs

```bash
# PM2 logs
pm2 logs arbonkas-api --lines 100

# Nginx access log
tail -f /var/log/nginx/arbonkas_access.log

# Nginx error log
tail -f /var/log/nginx/arbonkas_error.log

# MySQL error log
tail -f /var/log/mysql/error.log
```

### 7.4 Monitoring Resource

```bash
# CPU dan Memory usage
pm2 monit

# Disk usage
df -h

# Memory usage
free -h

# Top processes
htop
```

### 7.5 Backup Manual Database

```bash
# Backup database
mysqldump -u arbonkas_user -p arbonkas_db > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql
```

### 7.6 Restore Database dari Backup

```bash
# Extract backup
gunzip backup_20260206.sql.gz

# Restore
mysql -u arbonkas_user -p arbonkas_db < backup_20260206.sql
```

---

## 8. Troubleshooting

### 8.1 Backend Tidak Bisa Start

**Cek logs PM2:**
```bash
pm2 logs arbonkas-api --lines 50
```

**Kemungkinan masalah:**

**1. Database connection failed**
```bash
# Cek MySQL running
systemctl status mysql

# Cek kredensial di .env
nano /var/www/app-keuangan/backend/.env

# Test koneksi manual
mysql -u arbonkas_user -p arbonkas_db
```

**2. Port 3000 sudah digunakan**
```bash
# Cek port
lsof -i :3000

# Atau ganti port di .env
nano /var/www/app-keuangan/backend/.env
# Ubah PORT=3000 ke PORT=3001
# Jangan lupa update nginx config juga
```

### 8.2 Frontend Tidak Muncul

**Cek Nginx:**
```bash
# Test config
nginx -t

# Restart Nginx
systemctl restart nginx

# Cek logs
tail -f /var/log/nginx/arbonkas_error.log
```

**Cek permissions:**
```bash
# Set ownership
chown -R www-data:www-data /var/www/arbonkas

# Set permissions
chmod -R 755 /var/www/arbonkas
```

### 8.3 API Error 502 Bad Gateway

**Kemungkinan penyebab:**

**1. Backend tidak running**
```bash
pm2 list
pm2 restart arbonkas-api
```

**2. Port mismatch**
```bash
# Cek port di .env backend
cat /var/www/app-keuangan/backend/.env | grep PORT

# Cek port di nginx config
cat /etc/nginx/sites-available/arbonkas | grep proxy_pass

# Harus sama!
```

### 8.4 Database Error

**Check MySQL status:**
```bash
systemctl status mysql
systemctl restart mysql
```

**Check tables:**
```bash
mysql -u arbonkas_user -p arbonkas_db -e "SHOW TABLES;"
```

**Re-run migrations:**
```bash
cd /var/www/app-keuangan
mysql -u arbonkas_user -p arbonkas_db < backend/migrations/001_initial_schema.sql
```

### 8.5 SSL Certificate Error

**Renew certificate:**
```bash
certbot renew --force-renewal
systemctl restart nginx
```

### 8.6 Reset User Password

```bash
# Login ke MySQL
mysql -u arbonkas_user -p arbonkas_db

# Update password user (bcrypt hash untuk 'password123')
UPDATE users SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiIkWV8U6' WHERE email = 'user@example.com';
EXIT;
```

**Catatan:** Hash di atas adalah untuk password `password123`. User harus login dan ganti password segera!

### 8.7 Check Services Status

```bash
# Check all services
systemctl status nginx
systemctl status mysql
pm2 list

# Restart all if needed
systemctl restart nginx
systemctl restart mysql
pm2 restart all
```

---

## ✅ Checklist Deployment

Pastikan semua langkah berikut sudah dilakukan:

- [ ] VPS sudah update dan Node.js terinstall
- [ ] MySQL terinstall dan database terbuat
- [ ] PM2 terinstall
- [ ] Nginx terinstall
- [ ] Repository ter-clone di `/var/www/app-keuangan`
- [ ] Database schema dan seeder ter-import
- [ ] File `.env` backend sudah dikonfigurasi
- [ ] Backend dependencies ter-install (`npm install`)
- [ ] Backend running dengan PM2
- [ ] Frontend files ter-copy ke `/var/www/arbonkas`
- [ ] Nginx config terbuat dan enabled
- [ ] SSL certificate ter-generate
- [ ] Website bisa diakses via HTTPS
- [ ] Backup otomatis database sudah dikonfigurasi

---

## 📞 Support

Jika mengalami masalah yang tidak tercantum di panduan ini:

1. Cek logs dengan command di bagian Troubleshooting
2. Baca error message dengan teliti
3. Cari solusi di Google dengan keyword error message
4. Buka issue di GitHub repository: `https://github.com/ArBonTimKhusus/app-keuangan/issues`

---

## 📝 Catatan Penting

- **Selalu backup database** sebelum melakukan update
- **Jangan share kredensial** (password, JWT secret) ke siapapun
- **Monitor logs secara berkala** untuk detect masalah lebih awal
- **Update dependencies** secara berkala untuk security patches
- **Gunakan password yang kuat** (minimal 12 karakter, kombinasi huruf, angka, simbol)

---

**Selamat! ArBonKas sudah ter-deploy dan siap digunakan! 🎉**
