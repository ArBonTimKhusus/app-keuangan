# API Testing Guide

Quick guide untuk testing API ArBonKas menggunakan cURL atau Postman.

## Prerequisites

1. Backend server harus running di `http://localhost:3000`
2. Database sudah ter-setup dengan migrations dan seeders

## Step-by-Step Testing

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "ArBonKas API is running",
  "timestamp": "2026-02-06T09:00:00.000Z"
}
```

### 2. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token!** You'll need it for authenticated requests.

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get Profile

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Categories

```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: List of default categories (Gaji, Makanan, Transport, etc.)

### 6. Get Wallets

```bash
curl http://localhost:3000/api/wallets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: One default wallet created during registration

### 7. Create Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "category_id": 1,
    "type": "income",
    "amount": 5000000,
    "description": "Gaji Bulanan",
    "date": "2026-02-01",
    "notes": "Gaji bulan Februari"
  }'
```

### 8. Get Transactions

```bash
# Get all
curl http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With filters
curl "http://localhost:3000/api/transactions?type=income&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 9. Get Reports

```bash
# Summary
curl http://localhost:3000/api/reports/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# By category
curl http://localhost:3000/api/reports/by-category \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Monthly trend
curl "http://localhost:3000/api/reports/monthly?year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 10. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Postman Collection

You can import this collection to Postman:

1. Create new collection "ArBonKas API"
2. Add environment variable `base_url` = `http://localhost:3000`
3. Add environment variable `token` (will be set after login)
4. Add the following requests:

### Folder: Auth
- POST {{base_url}}/api/auth/register
- POST {{base_url}}/api/auth/login (Save token to environment)
- POST {{base_url}}/api/auth/logout
- GET {{base_url}}/api/auth/me
- PUT {{base_url}}/api/auth/profile

### Folder: Transactions
- GET {{base_url}}/api/transactions
- GET {{base_url}}/api/transactions/:id
- POST {{base_url}}/api/transactions
- PUT {{base_url}}/api/transactions/:id
- DELETE {{base_url}}/api/transactions/:id

### Folder: Wallets
- GET {{base_url}}/api/wallets
- GET {{base_url}}/api/wallets/:id
- POST {{base_url}}/api/wallets
- PUT {{base_url}}/api/wallets/:id
- DELETE {{base_url}}/api/wallets/:id

### Folder: Categories
- GET {{base_url}}/api/categories
- POST {{base_url}}/api/categories
- PUT {{base_url}}/api/categories/:id
- DELETE {{base_url}}/api/categories/:id

### Folder: Debts
- GET {{base_url}}/api/debts
- POST {{base_url}}/api/debts
- GET {{base_url}}/api/debts/summary
- PATCH {{base_url}}/api/debts/:id/pay
- DELETE {{base_url}}/api/debts/:id

### Folder: Reports
- GET {{base_url}}/api/reports/summary
- GET {{base_url}}/api/reports/by-category
- GET {{base_url}}/api/reports/by-wallet
- GET {{base_url}}/api/reports/monthly

## Common Issues

### 401 Unauthorized
- Token invalid or expired
- Token not included in Authorization header
- Solution: Login again and get new token

### 404 Not Found
- Endpoint URL salah
- Resource tidak ditemukan
- Solution: Check URL dan pastikan resource exists

### 422 Validation Error
- Input data tidak valid
- Solution: Check response.errors untuk detail validasi

### 500 Internal Server Error
- Server error atau database error
- Solution: Check server logs dengan `pm2 logs arbonkas-api`

## Tips

1. Save token di environment variable untuk mudah digunakan
2. Gunakan Postman Tests untuk auto-save token:
   ```javascript
   if (pm.response.code === 200) {
       const response = pm.response.json();
       pm.environment.set("token", response.data.token);
   }
   ```
3. Set Authorization header di folder level untuk semua requests
4. Use Postman variables untuk reusable IDs (wallet_id, transaction_id, etc.)
