# HikeMate - Aplikasi Pendakian

HikeMate adalah aplikasi untuk membantu perencanaan dan pengelolaan pendakian gunung, termasuk manajemen trip, logistik, dan rencana operasional perjalanan (ROP). Aplikasi ini menyediakan fitur untuk mencatat logistik, menambahkan rencana kegiatan, serta menghitung biaya perjalanan per orang. Aplikasi ini juga mendukung autentikasi pengguna menggunakan **AWS Cognito** dan menggunakan **AWS RDS** untuk database.

## Fitur

- **Manajemen Trip**: Membuat, mengedit, dan menghapus trip pendakian.
- **Manajemen Logistik**: Mengelola barang-barang logistik yang dibutuhkan untuk perjalanan.
- **Rencana Operasional Perjalanan (ROP)**: Menambahkan dan mengelola jadwal kegiatan selama perjalanan.
- **Perhitungan Biaya**: Menghitung total biaya perjalanan per orang berdasarkan logistik yang dibutuhkan.
- **Autentikasi Pengguna**: Pengguna dapat mendaftar dan masuk menggunakan AWS Cognito.

## Getting Started

Untuk memulai dengan aplikasi ini, pastikan kamu sudah menginstal **Node.js**, **npm**, dan memiliki akses ke layanan AWS. Ikuti langkah-langkah di bawah ini untuk mengatur proyek ini di lokal kamu.

### Prasyarat

- **Node.js** (v14.x.x atau lebih baru)
- **npm** (terpasang otomatis bersama Node.js)
- **AWS Cognito** untuk autentikasi pengguna
- **AWS RDS** untuk database PostgreSQL

### Instalasi

1. **Clone repositori ini:**

   ```bash
   git clone https://github.com/diditaditia66/HikeMate.git
   cd hikemate
