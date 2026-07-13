-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 13, 2026 at 04:22 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `percetakan_karyamitra`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`) VALUES
('cat-1', 'Kalender', 'kalender', 'fa-solid fa-calendar-days'),
('cat-2', 'Spanduk-Banner', 'spanduk-banner', 'fa-solid fa-panorama'),
('cat-3', 'Display', 'display', 'fa-solid fa-display'),
('cat-4', 'Kartu-Undangan', 'kartu-undangan', 'fa-solid fa-envelope-open-text'),
('cat-5', 'Stiker-Label', 'stiker-label', 'fa-solid fa-tags'),
('cat-6', 'Materi Promo', 'materi-promosi', 'fa-solid fa-bullhorn'),
('cat-7', 'Buku-Dokumen', 'buku-dokumen', 'fa-solid fa-book'),
('cat-8', 'Box Makanan', 'box', 'fa-solid fa-box'),
('cat-9', 'Merchandise', 'merchandise', 'fa-solid fa-bag-shopping');

-- --------------------------------------------------------

--
-- Table structure for table `company_profile`
--

CREATE TABLE `company_profile` (
  `cfg_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cfg_value` longtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_profile`
--

INSERT INTO `company_profile` (`cfg_key`, `cfg_value`) VALUES
('aboutLead', 'Mitra Cetak Terpercaya untuk Bisnis Anda'),
('aboutText', 'Di Mejasem, Tegal, Karya Mitra hadir sebagai mitra cetak — mengutamakan kualitas, ketepatan waktu, dan harga transparan untuk UMKM hingga instansi. Didukung fasilitas produksi lengkap dan mesin banner digital, kami melayani paper bag, spanduk, stiker, kemasan, hingga cetak personal — dari desain gratis hingga siap pakai.'),
('address', 'Ruko The Orchid I, Mejasem, Jl. Siklepuh Raya No.1A, Sibata, Mejasem Bar., Kec. Kramat, Kabupaten Tegal, Jawa Tengah 52181'),
('facebook', 'percetakan.karyamitra.77'),
('heroDesc', 'Dari spanduk, stiker, kemasan, hingga kebutuhan cetak personal — kualitas premium, harga transparan, dan pengerjaan tepat waktu di Mejasem, Tegal.'),
('heroTitle', 'Solusi Cetak Berkualitas untuk Bisnis Anda'),
('hours', 'Senin – Sabtu, 08.00 – 17.00 WIB'),
('inaproc', 'https://katalog.inaproc.id/karya-mitra'),
('instagram', 'karyamitra.percetakan'),
('mapDirection', 'https://www.google.com/maps/dir/?api=1&destination=Ruko+The+Orchid+I,+Mejasem,+Jl.+Siklepuh+Raya+No.1A,+Sibata,+Mejasem+Bar.,+Kec.+Kramat,+Kabupaten+Tegal,+Jawa+Tengah+52181'),
('mapEmbed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4858.7633867477!2d109.125728!3d-6.875627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTInMzIuMyJTIDEwOcKwMDcnMzIuNiJF!5e0!3m2!1sid!2sid!4v1738800000000!5m2!1sid!2sid'),
('mission', 'Memberikan hasil cetak berkualitas dengan teknologi dan bahan terbaik\nMemberikan pelayanan cepat, transparan, dan solutif bagi setiap pelanggan\nMendampingi UMKM dan instansi dalam kebutuhan branding & promosi\nTerus berinovasi mengikuti kebutuhan pasar percetakan digital'),
('name', 'KARYA MITRA'),
('orderUrl', 'http://Percetakan.test/index.php'),
('phone', '0878-0015-0583'),
('subtitle', 'DIGITAL PRINTING'),
('tagline', '18 tahun pengalaman — mitra cetak terpercaya di Tegal dan sekitarnya.'),
('tiktok', 'karyamitra.percetakan'),
('vision', 'Menjadi percetakan terpercaya di Tegal dan sekitarnya yang dikenal akan kualitas hasil, pelayanan ramah, dan harga yang terjangkau.'),
('youtube', 'percetakankaryamitra2732');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`) VALUES
('faq-1', 'Apakah ada minimal order untuk pemesanan cetak?', 'Minimal order tergantung jenis produk. Untuk banner, stiker, dan cetak digital lainnya, pesanan satuan dapat kami proses. Silakan hubungi kami terlebih dahulu untuk konfirmasi.', 0),
('faq-2', 'Berapa lama durasi pengerjaan pesanan?', 'Cetak digital biasanya selesai dalam 1–3 hari kerja. Pesanan offset atau jumlah besar membutuhkan sekitar 3–7 hari kerja. Estimasi waktu akan kami sampaikan sebelum produksi dimulai.', 1),
('faq-3', 'Apa syarat file untuk cetak?', 'File wajib siap cetak dan dikirim saat pemesanan melalui email. Format yang diterima: TIFF, JPEG, atau file yang sudah dikonversi sesuai ketentuan.\n\nApabila file tidak memenuhi syarat tersebut, kami tidak bertanggung jawab atas kesalahan hasil cetak.', 2),
('faq-4', 'Apakah tersedia jasa desain?', 'Kami menyediakan jasa desain di meja desain. Biaya dihitung berdasarkan lama waktu penggunaan. Siapkan brief, referensi, dan detail pesanan agar proses lebih efisien.', 3),
('faq-5', 'Bagaimana cara memesan dan pembayaran?', 'Klik Pesan Sekarang, pilih produk, lalu unggah file siap cetak — tim kami konfirmasi harga sebelum produksi. Bisa juga via WhatsApp, email, atau datang ke workshop.\n\nBayar QRIS, transfer bank, atau tunai. Kode QRIS dikirim setelah konfirmasi. Bisa DP; pelunasan saat barang siap.', 4);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `image`, `uploaded_at`) VALUES
('prod-1', 'Kalender Dinding Hanger', 'kalender', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgICA8ZGVmcz4KICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNGY0NmU1O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA2YjZkNDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+CiAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxODAiIHI9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1IiAvPgogICAgPHBhdGggZD0iTTE3MCAxODAgTDIzMCAxODAgTTIwMCAxNTAgTDIwMCAyMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMjkwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ091dGZpdCcsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5LYWxlbmRlciBEaW5kaW5nPC90ZXh0PgogICAgPHRleHQgeD0iNTAlIiB5PSIzMjAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSInUGx1cyBKYWthcnRhIFNhbnMnLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNTAwIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC43Ij5LYXJ5YSBNaXRyYSBQcmludGluZzwvdGV4dD4KICA8L3N2Zz4=', '2026-07-09 15:36:45'),
('prod-2', 'Kalender Meja / Duduk', 'kalender', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgICA8ZGVmcz4KICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDI4NGM3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNiODJmNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+CiAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxODAiIHI9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1IiAvPgogICAgPHBhdGggZD0iTTE3MCAxODAgTDIzMCAxODAgTTIwMCAxNTAgTDIwMCAyMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMjkwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ091dGZpdCcsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5LYWxlbmRlciBEdWR1azwvdGV4dD4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMzIwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ1BsdXMgSmFrYXJ0YSBTYW5zJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjUwMCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyI+S2FyeWEgTWl0cmEgUHJpbnRpbmc8L3RleHQ+CiAgPC9zdmc+', '2026-07-09 15:36:45'),
('prod-3', 'Spanduk Flexi Banner 280g', 'spanduk-banner', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgICA8ZGVmcz4KICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYjkxYzFjO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y5NzMxNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+CiAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxODAiIHI9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1IiAvPgogICAgPHBhdGggZD0iTTE3MCAxODAgTDIzMCAxODAgTTIwMCAxNTAgTDIwMCAyMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMjkwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ091dGZpdCcsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5TcGFuZHVrIEZsZXhpPC90ZXh0PgogICAgPHRleHQgeD0iNTAlIiB5PSIzMjAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSInUGx1cyBKYWthcnRhIFNhbnMnLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNTAwIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC43Ij5LYXJ5YSBNaXRyYSBQcmludGluZzwvdGV4dD4KICA8L3N2Zz4=', '2026-07-09 15:36:45'),
('prod-4', 'Roll Up Banner Aluminium', 'display', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgICA8ZGVmcz4KICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMGY3NjZlO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzE0YjhhNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+CiAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxODAiIHI9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1IiAvPgogICAgPHBhdGggZD0iTTE3MCAxODAgTDIzMCAxODAgTTIwMCAxNTAgTDIwMCAyMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMjkwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ091dGZpdCcsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5Sb2xsIFVwIEJhbm5lcjwvdGV4dD4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMzIwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ1BsdXMgSmFrYXJ0YSBTYW5zJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjUwMCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyI+S2FyeWEgTWl0cmEgUHJpbnRpbmc8L3RleHQ+CiAgPC9zdmc+', '2026-07-09 15:36:45'),
('prod-5', 'Stiker Vinyl Die Cut', 'stiker-label', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgICA8ZGVmcz4KICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmQyOGQ5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2E4NTVmNztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+CiAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxODAiIHI9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1IiAvPgogICAgPHBhdGggZD0iTTE3MCAxODAgTDIzMCAxODAgTTIwMCAxNTAgTDIwMCAyMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iMjkwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iJ091dGZpdCcsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5TdGlrZXIgVmlueWw8L3RleHQ+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjMyMCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IidQbHVzIEpha2FydGEgU2FucycsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI1MDAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciPkthcnlhIE1pdHJhIFByaW50aW5nPC90ZXh0PgogIDwvc3ZnPg==', '2026-07-09 15:36:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `role`) VALUES
(1, 'admin', '$2y$10$7ZFPwOD.FBMVuNJw6Aaw8O0/OW1pT91a5wzqkACej49eae71HATGu', 'Administrator', 'Super Admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `company_profile`
--
ALTER TABLE `company_profile`
  ADD PRIMARY KEY (`cfg_key`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category` (`category`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category`) REFERENCES `categories` (`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
