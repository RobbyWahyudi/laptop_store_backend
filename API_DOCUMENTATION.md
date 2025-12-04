# Aplikasi Kasir Pintar - Backend API

Backend API untuk Aplikasi Kasir Pintar Penjualan Laptop menggunakan Next.js, Supabase (PostgreSQL), dan AI Recommendation System.

## 🚀 Fitur Utama

### A. Fitur Kasir / Transaksi

- ✅ Scan barcode / pilih laptop
- ✅ Tambah laptop ke cart
- ✅ Pilih aksesoris tambahan (AI cross-sell)
- ✅ Input data pembeli (opsional)
- ✅ Pembayaran cash / transfer / QRIS
- ✅ Cetak struk PDF
- ✅ Riwayat transaksi
- ✅ Pembatalan transaksi (void)

### B. Fitur Produk & Inventory

- ✅ CRUD laptop (Create, Read, Update, Delete)
- ✅ CRUD aksesoris
- ✅ Input spesifikasi lengkap (CPU, GPU, RAM, Storage, dll)
- ✅ Monitoring stok menipis
- ✅ Stock logging otomatis

### C. Fitur AI Rekomendasi Laptop

AI memberikan rekomendasi berdasarkan:

1. **Kebutuhan Pengguna**: Gaming, Editing, Programming, Office, Bisnis
2. **Budget**: Range harga minimum dan maksimum
3. **Spesifikasi**: RAM, Storage, Brand preference
4. **Pola Penjualan**: Collaborative filtering dari transaksi

### D. Fitur Rekomendasi Aksesoris (Cross-selling)

- Market basket analysis
- Association rule mining
- Rekomendasi berdasarkan kategori laptop

### E. Fitur Dashboard Admin

- ✅ Total penjualan harian, mingguan, bulanan
- ✅ Laptop paling laku
- ✅ Produk dengan stok menipis
- ✅ Grafik penjualan
- ✅ Analisis performa kasir

### F. Manajemen User

- ✅ Role-based access control (Admin, Kasir, Owner)
- ✅ JWT Authentication
- ✅ Password hashing dengan bcrypt

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 📦 Installation

1. Clone repository

```bash
git clone <repository-url>
cd laptop_store_backend
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
```

4. Run development server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### Register User

```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "kasir" // admin, kasir, owner
}
```

#### Login

```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "kasir",
    "token": "jwt_token_here"
  }
}
```

#### Get Current User

```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Products

#### Get All Laptops

```
GET /api/products?type=laptop&page=1&limit=20
Query Params:
  - type: laptop | accessory | category
  - page: number (default: 1)
  - limit: number (default: 20)
  - brand: string
  - min_price: number
  - max_price: number
  - min_ram: number
  - search: string
```

#### Get Product by ID

```
GET /api/products/[id]?type=laptop
```

#### Create Product (Admin Only)

```
POST /api/products
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "type": "laptop",
  "name": "ASUS TUF A15",
  "brand": "ASUS",
  "cpu": "AMD Ryzen 7 5800H",
  "gpu": "NVIDIA RTX 3060",
  "ram": 16,
  "storage": "512GB SSD",
  "display": "15.6\" 144Hz",
  "weight": 2.3,
  "os": "Windows 11",
  "price": 15000000,
  "stock": 10,
  "category_id": 1
}
```

#### Update Product (Admin Only)

```
PUT /api/products/[id]
Headers: { "Authorization": "Bearer <admin_token>" }
Body: { "price": 14500000, "stock": 15 }
```

#### Delete Product (Admin Only)

```
DELETE /api/products/[id]?type=laptop
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Get Low Stock Products

```
GET /api/products/low-stock?threshold=10&type=all
```

### Categories

#### Get All Categories

```
GET /api/categories
```

#### Create Category (Admin Only)

```
POST /api/categories
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "name": "gaming"
}
```

#### Get Category by ID

```
GET /api/categories/[id]
```

#### Update Category (Admin Only)

```
PUT /api/categories/[id]
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "name": "updated_category_name"
}
```

#### Delete Category (Admin Only)

```
DELETE /api/categories/[id]
Headers: { "Authorization": "Bearer <admin_token>" }
```

### Transactions

#### Create Transaction (Kasir/Admin)

```
POST /api/transactions
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "customer_name": "Customer Name",
  "payment_method": "cash", // cash, qris, transfer
  "items": [
    {
      "product_type": "laptop",
      "product_id": 1,
      "qty": 1,
      "price": 15000000
    },
    {
      "product_type": "accessory",
      "product_id": 5,
      "qty": 2,
      "price": 250000
    }
  ],
  "total_price": 15500000
}
```

#### Get All Transactions

```
GET /api/transactions?page=1&limit=20&date_from=2025-01-01
Headers: { "Authorization": "Bearer <token>" }
```

#### Get Transaction by ID

```
GET /api/transactions/[id]
Headers: { "Authorization": "Bearer <token>" }
```

#### Void Transaction (Admin Only)

```
DELETE /api/transactions/[id]?reason=Customer%20request
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Get Today's Stats

```
GET /api/transactions/today
Headers: { "Authorization": "Bearer <token>" }
```

### AI Recommendations

#### Get Laptop Recommendations

```
POST /api/ai/recommend-laptop
Body: {
  "need": "gaming", // gaming, editing, programming, office, bisnis
  "min_budget": 10000000,
  "max_budget": 15000000,
  "min_ram": 16,
  "brand_preference": "ASUS"
}
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ASUS TUF A15",
      "brand": "ASUS",
      "price": 15000000,
      "recommendation_score": 85,
      "match_reason": "GPU kuat untuk gaming, RAM cukup untuk game modern"
    }
  ]
}
```

#### Get Accessory Recommendations

```
GET /api/ai/recommend-accessories?laptop_id=1
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cooling Pad RGB",
      "price": 250000,
      "reason": "Cooling pad membantu menjaga suhu laptop gaming tetap optimal"
    }
  ]
}
```

### Analytics

#### Get Dashboard Overview

```
GET /api/analytics/dashboard
Headers: { "Authorization": "Bearer <token>" }
```

#### Get Sales Summary

```
GET /api/analytics/sales-summary?period=daily
Query Params: period = daily | weekly | monthly | yearly
```

#### Get Top Selling Products

```
GET /api/analytics/best-sellers?limit=10&type=all
Query Params:
  - limit: number (default: 10)
  - type: all | laptop | accessory
```

#### Get Sales Chart Data

```
GET /api/analytics/revenue?period=weekly
Query Params: period = weekly | monthly | yearly
```

#### Get Cashier Performance (Admin/Owner Only)

```
GET /api/analytics/cashier-performance?start_date=2025-01-01&end_date=2025-01-31
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Get Low Stock Alerts

```
GET /api/analytics/stock-alert?threshold=10
```

## 🗄️ Database Schema

Database sudah dibuat di Supabase dengan struktur:

- **users**: User accounts dengan role-based access
- **laptop_categories**: Kategori laptop (gaming, office, editing, dll)
- **laptops**: Data laptop dengan spesifikasi lengkap
- **accessories**: Data aksesoris
- **transactions**: Header transaksi
- **transaction_items**: Detail item transaksi
- **ai_logs**: Log rekomendasi AI
- **stock_logs**: History perubahan stok

## 🔐 Authentication & Authorization

Sistem menggunakan JWT (JSON Web Token) untuk authentication.

**Roles**:

- **Admin**: Full access (CRUD products, void transactions, view all analytics)
- **Kasir**: Create transactions, view own transactions
- **Owner**: View-only access untuk analytics dan reports

**Headers untuk authenticated requests**:

```
Authorization: Bearer <jwt_token>
```

## 🧪 Testing API

Gunakan Postman, Thunder Client, atau tools API testing lainnya.

1. Register user admin
2. Login untuk mendapatkan token
3. Gunakan token di header untuk request berikutnya

## 📱 Integrasi dengan Flutter

Frontend Flutter dapat menggunakan package:

- `http` atau `dio` untuk HTTP requests
- `flutter_secure_storage` untuk menyimpan JWT token
- `provider` atau `bloc` untuk state management

Example Flutter HTTP request:

```dart
final response = await http.get(
  Uri.parse('http://localhost:3000/api/products?type=laptop'),
  headers: {
    'Authorization': 'Bearer $token',
  },
);
```

## 🚀 Deployment

### Deploy ke Vercel

```bash
npm run build
vercel deploy
```

### Environment Variables di Production

Pastikan set semua environment variables di platform deployment (Vercel, Railway, dll):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET

## 📝 Notes

- Semua endpoint yang memerlukan authentication akan return 401 jika token tidak valid
- Admin dapat mengakses semua endpoint
- Kasir hanya bisa melihat transaksi mereka sendiri
- Owner hanya bisa melihat analytics, tidak bisa create/update
- Stock otomatis berkurang saat transaksi dibuat
- Stock otomatis bertambah saat transaksi di-void

## 🤝 Support

Untuk pertanyaan atau issues, silakan buat issue di repository.

## 📄 License

MIT License
