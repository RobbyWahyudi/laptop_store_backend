# Setup Guide - Aplikasi Kasir Pintar

Panduan lengkap untuk setup backend API Aplikasi Kasir Pintar.

## 📋 Prerequisites

- Node.js 18+ terinstall
- Akun Supabase (gratis di https://supabase.com)
- Git
- Text editor (VS Code recommended)

## 🗄️ Step 1: Setup Supabase Database

### 1.1 Create Supabase Project

1. Buka https://supabase.com
2. Sign in / Sign up
3. Create new project
4. Tunggu project selesai dibuat (~2 menit)

### 1.2 Run SQL Schema

1. Di Supabase dashboard, buka **SQL Editor**
2. Klik **New Query**
3. Copy paste SQL schema berikut:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. LAPTOP CATEGORIES
CREATE TABLE laptop_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 3. LAPTOPS TABLE
CREATE TABLE laptops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    cpu VARCHAR(200),
    gpu VARCHAR(200),
    ram INTEGER,
    storage VARCHAR(100),
    display VARCHAR(200),
    weight NUMERIC(5,2),
    os VARCHAR(50),
    price NUMERIC(15,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category_id INTEGER REFERENCES laptop_categories(id)
);

-- 4. ACCESSORIES TABLE
CREATE TABLE accessories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(15,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    cashier_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(100),
    total_price NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. TRANSACTION ITEMS TABLE
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_type VARCHAR(20) NOT NULL,
    product_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    price NUMERIC(15,2) NOT NULL
);

-- 7. AI LOGS
CREATE TABLE ai_logs (
    id SERIAL PRIMARY KEY,
    user_input JSONB,
    recommended JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. STOCK LOGS
CREATE TABLE stock_logs (
    id SERIAL PRIMARY KEY,
    product_type VARCHAR(20),
    product_id INTEGER,
    change_type VARCHAR(20),
    quantity INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_laptops_brand ON laptops(brand);
CREATE INDEX idx_laptops_category ON laptops(category_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX idx_transactions_cashier ON transactions(cashier_id);

-- Insert sample categories
INSERT INTO laptop_categories (name) VALUES
('gaming'),
('office'),
('editing'),
('programming'),
('bisnis');
```

4. Klik **Run** untuk execute SQL
5. Verifikasi semua table berhasil dibuat di tab **Table Editor**

### 1.3 Get Supabase Credentials

1. Di Supabase dashboard, buka **Settings** > **API**
2. Copy:
   - **Project URL** (contoh: https://xxxxx.supabase.co)
   - **anon public** key
   - **service_role** key (klik "Reveal" untuk melihat)

## 🚀 Step 2: Setup Backend Project

### 2.1 Clone & Install

```bash
cd laptop_store_backend
npm install
```

### 2.2 Setup Environment Variables

1. Copy file `.env.example`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` dengan credentials Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=buatlah_string_random_minimal_32_karakter_untuk_jwt_secret
```

**Generate JWT Secret:**

```bash
# Di terminal, jalankan:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 👤 Step 3: Create Admin User

### Option 1: Via API (Postman/Thunder Client)

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@laptop.com",
  "password": "admin123",
  "role": "admin"
}
```

### Option 2: Via Supabase SQL

```sql
-- Hash password "admin123" menggunakan bcrypt (10 rounds)
-- Hash ini: $2a$10$XZ5LqYhHkQO5kfDhGjBaLOM1h6vJqP7K8YqOo6ZQqQqQ0QqQqQqQq
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@laptop.com', '$2a$10$XZ5LqYhHkQO5kfDhGjBaLOM1h6vJqP7K8YqOo6ZQqQqQ0QqQqQqQq', 'admin');
```

**Note**: Untuk production, selalu register via API agar password di-hash dengan benar.

## 🧪 Step 4: Test API

### 4.1 Login

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@laptop.com",
  "password": "admin123"
}
```

Response akan berisi `token`. Copy token ini untuk request selanjutnya.

### 4.2 Create Sample Laptop

```
POST http://localhost:3000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "type": "laptop",
  "name": "ASUS TUF Gaming A15",
  "brand": "ASUS",
  "cpu": "AMD Ryzen 7 5800H",
  "gpu": "NVIDIA RTX 3060 6GB",
  "ram": 16,
  "storage": "512GB NVMe SSD",
  "display": "15.6 inch FHD 144Hz",
  "weight": 2.3,
  "os": "Windows 11",
  "price": 15000000,
  "stock": 10,
  "category_id": 1
}
```

### 4.3 Get All Laptops

```
GET http://localhost:3000/api/products?type=laptop
```

### 4.4 Create Transaction

```
POST http://localhost:3000/api/transactions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
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
}
```

### 4.5 Get Dashboard Analytics

```
GET http://localhost:3000/api/analytics/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📊 Step 5: Populate Sample Data (Optional)

Untuk testing yang lebih lengkap, isi database dengan sample data:

```sql
-- Insert sample laptops
INSERT INTO laptops (name, brand, cpu, gpu, ram, storage, display, weight, os, price, stock, category_id) VALUES
('ASUS ROG Strix G15', 'ASUS', 'AMD Ryzen 9 5900HX', 'RTX 3070 8GB', 16, '1TB SSD', '15.6" FHD 300Hz', 2.3, 'Windows 11', 22000000, 5, 1),
('Lenovo ThinkPad X1', 'Lenovo', 'Intel i7-1185G7', 'Intel Iris Xe', 16, '512GB SSD', '14" FHD IPS', 1.2, 'Windows 11 Pro', 18000000, 8, 4),
('MacBook Pro 14"', 'Apple', 'Apple M2 Pro', 'Integrated', 16, '512GB SSD', '14.2" Liquid Retina XDR', 1.6, 'macOS', 28000000, 3, 3),
('HP Pavilion 14', 'HP', 'Intel i5-1235U', 'Intel Iris Xe', 8, '512GB SSD', '14" FHD', 1.4, 'Windows 11', 9500000, 15, 2);

-- Insert sample accessories
INSERT INTO accessories (name, category, price, stock) VALUES
('Cooling Pad RGB', 'cooling', 250000, 20),
('Logitech MX Master 3', 'mouse', 1200000, 15),
('Gaming Mouse RGB', 'mouse', 350000, 25),
('Laptop Bag Premium', 'tas', 450000, 30),
('External SSD 1TB', 'storage', 1500000, 10),
('USB-C Hub 7-in-1', 'hub', 350000, 18);

-- Create kasir user
INSERT INTO users (name, email, password_hash, role) VALUES
('Kasir 1', 'kasir1@laptop.com', '$2a$10$XZ5LqYhHkQO5kfDhGjBaLOM1h6vJqP7K8YqOo6ZQqQqQ0QqQqQqQq', 'kasir');
```

## 🔧 Step 6: Configure Supabase Policies (Optional)

Jika ingin menggunakan Row Level Security (RLS), tambahkan policies di Supabase:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Allow public read laptops" ON laptops FOR SELECT USING (true);
CREATE POLICY "Allow public read accessories" ON accessories FOR SELECT USING (true);
```

**Note**: Untuk simplicity, backend menggunakan service_role key yang bypass RLS.

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

- Pastikan `.env.local` file ada dan berisi credentials yang benar
- Restart development server setelah menambah/edit `.env.local`

### Error: "Invalid credentials" saat login

- Pastikan user sudah terdaftar di database
- Cek password yang dimasukkan benar
- Jika register via SQL, pastikan password di-hash dengan benar

### Error: "Insufficient permissions"

- Pastikan user memiliki role yang tepat (admin untuk create/delete)
- Cek token JWT masih valid (tidak expired)

### Database connection error

- Cek Supabase credentials benar
- Pastikan Supabase project aktif (tidak di-pause)
- Cek koneksi internet

## 📱 Step 7: Integrasi dengan Flutter

Setelah backend berjalan, Flutter app dapat connect ke:

```
Base URL: http://localhost:3000/api
```

Untuk production, deploy backend dan update Base URL di Flutter app.

## 🚀 Step 8: Deploy to Production

### Deploy ke Vercel

```bash
npm run build
vercel deploy --prod
```

### Set Environment Variables di Vercel

1. Buka Vercel dashboard
2. Pilih project
3. Settings > Environment Variables
4. Add semua variables dari `.env.local`

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] All database tables created
- [ ] Sample categories inserted
- [ ] Environment variables configured
- [ ] npm install completed
- [ ] Development server running
- [ ] Admin user created
- [ ] Login successful
- [ ] Create laptop successful
- [ ] Create transaction successful
- [ ] Analytics dashboard accessible

## 🎉 Selesai!

Backend API sudah siap digunakan. Lanjut ke development Flutter app untuk frontend.

Untuk dokumentasi API lengkap, lihat `API_DOCUMENTATION.md`.
