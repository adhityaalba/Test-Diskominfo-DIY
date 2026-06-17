# Test-Diskominfo-DIY: HR, Presensi, dan Payroll System

Aplikasi berbasis web sederhana untuk mengelola data pegawai, presensi harian, dan perhitungan gaji bulanan di **PT Maju Jaya Teknologi**.

## Tech Stack
- **Backend:** Laravel 11, PHP 8.2+
- **Frontend:** React JS (Vite), Node v24.14.0
- **Database:** PostgreSQL

## Struktur Direktori
- `/BE` : Source code backend Laravel.
- `/FE` : Source code frontend React JS.

## Prasyarat
- PHP >= 8.2 & Composer
- Node.js = v24.14.0 (Gunakan `nvm use v24.14.0`)
- PostgreSQL database lokal berjalan di `127.0.0.1:5432` dengan user/password standar atau disesuaikan di `.env`.

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Backend (Laravel)
Buka terminal dan jalankan perintah berikut:

```bash
cd BE

# Install dependencies
composer install

# Copy .env jika belum ada dan konfigurasi DB
cp .env.example .env

# Konfigurasi DB di .env (pastikan database postgresql 'project_diskominfo_diy' tersedia)
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=project_diskominfo_diy
# DB_USERNAME=postgres
# DB_PASSWORD=postgres

# Generate App Key
php artisan key:generate

# Jalankan migrasi dan seeder untuk data awal
php artisan migrate:fresh --seed

# Jalankan server
php artisan serve
# Server backend akan berjalan di http://localhost:8000
```

### 2. Frontend (React JS)
Buka terminal baru dan jalankan perintah berikut:

```bash
cd FE

# Gunakan Node versi yang sesuai
nvm use v24.14.0

# Install dependencies
npm install

# Jalankan development server
npm run dev
# Server frontend akan berjalan di http://localhost:5173
```

## Akun Default untuk Login
Setelah menjalankan seeder di backend, Anda dapat login menggunakan akun berikut:

**Admin:**
- Email: `admin@majujaya.com`
- Password: `password`

**User (Pegawai):**
- Email: `budi@majujaya.com`
- Password: `password`
