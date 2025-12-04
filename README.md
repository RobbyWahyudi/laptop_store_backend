# Aplikasi Kasir Pintar - Laptop Store Backend API

🚀 **Backend API lengkap untuk Aplikasi Kasir Pintar Penjualan Laptop dengan AI Recommendation System**

## 🎯 Overview

Backend API yang dibangun dengan Next.js 16 dan Supabase (PostgreSQL) untuk mendukung aplikasi kasir cerdas dengan fitur:

- ✅ Manajemen Produk (Laptop & Aksesoris)
- ✅ Transaksi Penjualan dengan auto stock management
- ✅ AI Recommendation System (Laptop & Aksesoris)
- ✅ Dashboard Analytics & Reports
- ✅ Role-based Access Control (Admin, Kasir, Owner)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials

# Run development server
npm run dev
```

Server berjalan di `http://localhost:3000`

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Panduan lengkap setup dari awal
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Project Summary](PROJECT_SUMMARY.md)** - Technical overview & features

## ✨ Features

### A. Kasir / Transaksi

- [x] Tambah produk ke cart
- [x] Pilih laptop dan aksesoris
- [x] Input data pembeli (opsional)
- [x] Multiple payment methods (Cash, QRIS, Transfer)
- [x] Riwayat transaksi
- [x] Void/pembatalan transaksi
- [x] Auto stock management

### B. Produk & Inventory

- [x] CRUD Laptop (full specs: CPU, GPU, RAM, Storage, dll)
- [x] CRUD Aksesoris
- [x] Category management
- [x] Stock monitoring
- [x] Low stock alerts
- [x] Stock change logging

### C. AI Rekomendasi Laptop

AI memberikan rekomendasi berdasarkan:

- ✅ Kebutuhan: Gaming, Editing, Programming, Office, Bisnis
- ✅ Budget range (min/max)
- ✅ Spesifikasi (RAM, CPU, GPU, Brand)
- ✅ Scoring algorithm dengan match reason

### D. Rekomendasi Aksesoris (Cross-selling)

- ✅ Rule-based recommendations
- ✅ Market basket analysis
- ✅ Collaborative filtering from purchase history

### E. Dashboard & Analytics

- [x] Sales summary (daily, weekly, monthly, yearly)
- [x] Top selling products
- [x] Revenue charts
- [x] Cashier performance
- [x] Low stock monitoring

### F. User Management

- [x] JWT Authentication
- [x] Role-based authorization (Admin, Kasir, Owner)
- [x] Password hashing (bcrypt)

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password**: bcryptjs

## 📊 Database Schema

8 Tables:

- `users` - User accounts with roles
- `laptop_categories` - Product categories
- `laptops` - Laptop inventory with full specs
- `accessories` - Accessory inventory
- `transactions` - Transaction headers
- `transaction_items` - Transaction details
- `ai_logs` - AI recommendation logs
- `stock_logs` - Stock change history

## 🔑 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Products

```
GET    /api/products
POST   /api/products
GET    /api/products/[id]
PUT    /api/products/[id]
DELETE /api/products/[id]
GET    /api/products/low-stock
```

### Categories

```
GET    /api/categories
POST   /api/categories
GET    /api/categories/[id]
PUT    /api/categories/[id]
DELETE /api/categories/[id]
```

### Transactions

```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/[id]
PUT    /api/transactions/[id]
DELETE /api/transactions/[id]  # Void transaction
GET    /api/transactions/today
```

### AI Recommendations

```
POST /api/ai/recommend-laptop
GET  /api/ai/recommend-accessories
```

### Analytics

```
GET /api/analytics/dashboard
GET /api/analytics/sales-summary
GET /api/analytics/best-sellers
GET /api/analytics/revenue
GET /api/analytics/cashier-performance
GET /api/analytics/stock-alert
```

## 🔬 Example Request

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@laptop.com","password":"admin123"}'
```

### Create Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "payment_method": "cash",
    "items": [
      {
        "product_type": "laptop",
        "product_id": 1,
        "qty": 1,
        "price": 15000000
      }
    ],
    "total_price": 15000000
  }'
```

### Get AI Recommendations

```
curl -X POST http://localhost:3000/api/ai/recommend-laptop \
  -H "Content-Type: application/json" \
  -d '{
    "need": "gaming",
    "min_budget": 10000000,
    "max_budget": 20000000,
    "min_ram": 16
  }'
```

## 📁 Project Structure

```
laptop_store_backend/
├── app/api/          # API routes
│   ├── auth/         # Authentication
│   ├── products/     # Product management
│   ├── transactions/ # Transaction handling
│   ├── ai/           # AI recommendations
│   └── analytics/    # Analytics & dashboard
├── lib/              # Core utilities
│   ├── supabase.js   # DB client
│   ├── auth.js       # Auth helpers
│   ├── validations.js # Zod schemas
│   └── utils.js      # Helper functions
└── services/         # Business logic
    ├── product.service.js
    ├── transaction.service.js
    ├── ai.service.js
    └── analytics.service.js
```

## 🔒 Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Role-based authorization
- ✅ Input validation (Zod)
- ✅ SQL injection protection
- ✅ Secure environment variables

## 📱 Flutter Integration Ready

All endpoints return consistent JSON:

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy --prod
```

Set environment variables di Vercel dashboard.

### Railway / Render

Support deployment ke platform lain dengan environment variables yang sesuai.

## 📝 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_32_chars_min
```

## 🧪 Testing

Gunakan Postman, Thunder Client, atau curl untuk testing API.

Import Postman collection (coming soon) untuk quick testing.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [API Documentation](API_DOCUMENTATION.md)
- [Setup Guide](SETUP_GUIDE.md)

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📄 License

MIT License

## 👨‍💻 Author

Developed for Laptop Store Smart Cashier System

---

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: November 2025
