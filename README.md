# 🚀 Company Profile: Percetakan Karya Mitra

Website profil perusahaan untuk **Percetakan Karya Mitra**. Proyek ini dikembangkan untuk memberikan informasi layanan percetakan secara profesional kepada pelanggan serta menyediakan sistem *Content Management System* (CMS) untuk memudahkan pengelolaan data secara dinamis.

---

### 🌟 Fitur Utama

#### **1. Sisi Pengunjung (User Interface)**
Menampilkan informasi perusahaan secara publik agar mudah diakses pelanggan:
- **Beranda:** Ringkasan informasi dan daya tarik utama perusahaan.
- **Tentang Kami:** Profil lengkap dan visi misi perusahaan.
- **Layanan:** Katalog detail jenis layanan percetakan yang ditawarkan.
- **FAQ:** Informasi mengenai pertanyaan yang sering diajukan pelanggan.
- **Kontak:** Saluran komunikasi untuk pelanggan.

#### **2. Sisi Admin (Panel Pengelola)**
Panel kontrol untuk administrator mengelola data website secara *real-time*:
- **Kelola Produk:** Manajemen data produk (Tambah, Edit, Hapus).
- **Kelola Kategori:** Pengaturan klasifikasi produk dengan fitur tambah, edit, dan hapus kategori agar navigasi lebih terstruktur.
- **Backup & Restore:** Fitur untuk menjaga keamanan data dengan mencadangkan dan memulihkan database.

---

### 🛠️ Teknologi
- **Front-end:** HTML5, CSS3, JavaScript.
- **Back-end:** PHP & MySQL (Database diolah melalui Laragon).

---

### ⚙️ Cara Menjalankan Proyek
1. Pastikan **Laragon** sudah aktif (Apache & MySQL).
2. Pindahkan folder proyek ke direktori `C:\laragon\www\`.
3. Import file database (`percetakan_karyamitra.sql`) melalui *phpMyAdmin*.
4. Pastikan konfigurasi database di `admin/db_config.php` sudah sesuai dengan kredensial database lokal Anda.
5. **Akses Website:** Buka browser dan ketik: `http://localhost/PercetakanKaryaMitra/`
6. **Akses Panel Admin:** Buka browser dan ketik: `http://localhost/PercetakanKaryaMitra/admin/`

---
*Proyek ini dikembangkan sebagai bagian dari tugas mata kuliah Teknik Informatika.*
