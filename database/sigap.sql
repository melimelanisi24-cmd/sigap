-- ========================================================
-- DATABASE SCHEMA: SIGAP (Sistem Informasi Pengaduan & Aspirasi)
-- Compatible with MySQL 5.7+ / MariaDB 10.4+ (XAMPP Default)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `sigap_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigap_db`;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('warga', 'admin') NOT NULL DEFAULT 'warga',
  `nik` VARCHAR(20) DEFAULT NULL,
  `phone` VARCHAR(25) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT 'Jawa Barat',
  `regency` VARCHAR(100) DEFAULT 'Sukabumi',
  `district` VARCHAR(100) DEFAULT 'Kalapanunggal',
  `village` VARCHAR(100) DEFAULT 'Kalapanunggal',
  `rw` VARCHAR(10) DEFAULT '02',
  `rt` VARCHAR(10) DEFAULT '03',
  `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: kategori
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kategori` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) DEFAULT '📋',
  `warna` VARCHAR(100) DEFAULT 'bg-blue-100 text-blue-700',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: pengaduan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengaduan` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `pelapor` VARCHAR(150) NOT NULL,
  `email_pelapor` VARCHAR(150) DEFAULT NULL,
  `telepon_pelapor` VARCHAR(25) DEFAULT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `lokasi` TEXT NOT NULL,
  `province` VARCHAR(100) DEFAULT 'Jawa Barat',
  `regency` VARCHAR(100) DEFAULT 'Sukabumi',
  `district` VARCHAR(100) DEFAULT 'Kalapanunggal',
  `village` VARCHAR(100) DEFAULT 'Kalapanunggal',
  `rw` VARCHAR(10) DEFAULT '02',
  `rt` VARCHAR(10) DEFAULT '03',
  `deskripsi` TEXT NOT NULL,
  `status` ENUM('menunggu', 'diproses', 'selesai', 'ditolak') NOT NULL DEFAULT 'menunggu',
  `prioritas` ENUM('rendah', 'sedang', 'tinggi') NOT NULL DEFAULT 'sedang',
  `penanggung_jawab` VARCHAR(255) DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `tanggal_update` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pengaduan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: pengaduan_foto
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengaduan_foto` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pengaduan_id` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) DEFAULT NULL,
  `file_url` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_foto_pengaduan` FOREIGN KEY (`pengaduan_id`) REFERENCES `pengaduan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: pengaduan_riwayat
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengaduan_riwayat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pengaduan_id` VARCHAR(50) NOT NULL,
  `tanggal` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `keterangan` TEXT NOT NULL,
  `oleh` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_riwayat_pengaduan` FOREIGN KEY (`pengaduan_id`) REFERENCES `pengaduan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: aspirasi
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `aspirasi` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `pelapor` VARCHAR(150) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `status` ENUM('ditinjau', 'diterima', 'ditolak') NOT NULL DEFAULT 'ditinjau',
  `dukungan` INT NOT NULL DEFAULT 0,
  `tanggal` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_aspirasi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: aspirasi_lampiran
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `aspirasi_lampiran` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `aspirasi_id` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) DEFAULT NULL,
  `file_type` VARCHAR(50) DEFAULT 'doc',
  `file_url` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_lampiran_aspirasi` FOREIGN KEY (`aspirasi_id`) REFERENCES `aspirasi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- OPTIONAL SEED DATA (DATA AWAL DARI DUMMY SIGAP)
-- ========================================================
-- Uncomment/import the statements below only when sample records are explicitly needed.

/*
-- Users
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `nik`, `phone`, `address`, `status`) VALUES
(1, 'Budi Santoso', 'budi.santoso@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'warga', '3201234567890001', '081234567890', 'Jl. Merdeka No. 10, Bandung', 'aktif'),
(2, 'Siti Rahayu', 'siti.rahayu@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'warga', '3201234567890002', '082345678901', 'Jl. Diponegoro No. 15, Bandung', 'aktif'),
(3, 'Ahmad Fauzi', 'ahmad.fauzi@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'warga', '3201234567890003', '083456789012', 'Jl. Asia Afrika No. 40, Bandung', 'aktif'),
(99, 'Admin SIGAP', 'admin@sigap.go.id', '$2y$10$abcdefghijklmnopqrstuv', 'admin', NULL, '02212345678', 'Kantor Pemkot Bandung', 'aktif')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Kategori
INSERT INTO `kategori` (`id`, `nama`, `icon`, `warna`) VALUES
(1, 'Infrastruktur', '🏗️', 'bg-orange-100 text-orange-700'),
(2, 'Pelayanan Publik', '🏛️', 'bg-blue-100 text-blue-700'),
(3, 'Lingkungan', '🌿', 'bg-green-100 text-green-700'),
(4, 'Keamanan', '🛡️', 'bg-red-100 text-red-700'),
(5, 'Sosial', '👥', 'bg-purple-100 text-purple-700'),
(6, 'Pendidikan', '📚', 'bg-yellow-100 text-yellow-700')
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);

-- Pengaduan
INSERT INTO `pengaduan` (`id`, `user_id`, `pelapor`, `email_pelapor`, `telepon_pelapor`, `judul`, `kategori`, `lokasi`, `deskripsi`, `status`, `prioritas`, `penanggung_jawab`, `catatan`, `tanggal`, `tanggal_update`) VALUES
('ADU-2024-001', 1, 'Budi Santoso', 'budi.santoso@email.com', '081234567890', 'Jalan Berlubang di Jl. Sudirman RT 03', 'Infrastruktur', 'Jl. Sudirman RT 03/RW 02, Bandung', 'Terdapat lubang besar di tengah jalan yang membahayakan pengendara, sudah terjadi sejak 2 minggu lalu. Lubang berukuran sekitar 50x40 cm dengan kedalaman ±20 cm.', 'diproses', 'tinggi', 'Dinas Pekerjaan Umum Kota Bandung', 'Tim survei telah melakukan pengecekan lapangan pada 12 Juni 2024. Perbaikan dijadwalkan pada minggu ketiga Juni 2024.', '2024-06-10', '2024-06-13'),
('ADU-2024-002', 2, 'Siti Rahayu', 'siti.rahayu@email.com', '082345678901', 'Lampu Jalan Mati di Gg. Mawar', 'Infrastruktur', 'Gg. Mawar No. 5, Bandung', 'Lampu penerangan jalan di gang mawar sudah mati lebih dari 1 minggu, rawan kejahatan di malam hari. Terdapat 3 titik lampu yang padam sepanjang ±150 meter.', 'selesai', 'sedang', 'Dinas Perhubungan Kota Bandung', 'Lampu telah diganti dan berfungsi normal kembali per tanggal 11 Juni 2024.', '2024-06-08', '2024-06-11'),
('ADU-2024-003', 3, 'Ahmad Fauzi', 'ahmad.fauzi@email.com', '083456789012', 'Pelayanan KTP Lambat', 'Pelayanan Publik', 'Kantor Kelurahan Sukasari', 'Proses pengurusan KTP sudah lebih dari 3 bulan belum selesai, padahal berkas sudah lengkap.', 'menunggu', 'sedang', NULL, NULL, '2024-06-12', '2024-06-12')
ON DUPLICATE KEY UPDATE `judul`=VALUES(`judul`);

-- Pengaduan Riwayat
INSERT INTO `pengaduan_riwayat` (`pengaduan_id`, `tanggal`, `status`, `keterangan`, `oleh`) VALUES
('ADU-2024-001', '2024-06-10', 'menunggu', 'Pengaduan diterima dan sedang menunggu verifikasi.', 'Sistem'),
('ADU-2024-001', '2024-06-11', 'menunggu', 'Pengaduan telah diverifikasi oleh admin.', 'Admin SIGAP'),
('ADU-2024-001', '2024-06-12', 'diproses', 'Diteruskan ke Dinas PU untuk penanganan.', 'Admin SIGAP'),
('ADU-2024-002', '2024-06-08', 'menunggu', 'Pengaduan diterima.', 'Sistem'),
('ADU-2024-002', '2024-06-09', 'diproses', 'Diteruskan ke Dinas Perhubungan.', 'Admin SIGAP'),
('ADU-2024-002', '2024-06-11', 'selesai', 'Lampu jalan telah diperbaiki dan berfungsi normal.', 'Dinas Perhubungan');

-- Aspirasi
INSERT INTO `aspirasi` (`id`, `user_id`, `pelapor`, `judul`, `kategori`, `deskripsi`, `status`, `dukungan`, `tanggal`) VALUES
('ASP-2024-001', 1, 'Budi Santoso', 'Perlu Penambahan Rute Angkutan Umum', 'Pelayanan Publik', 'Mohon ditambahkan rute angkutan kota ke kawasan perumahan baru di Jl. Bunga Raya.', 'diterima', 127, '2024-06-09'),
('ASP-2024-002', 2, 'Siti Rahayu', 'Pembangunan Ruang Baca Publik', 'Pendidikan', 'Usulan pembangunan ruang baca dan perpustakaan mini di taman kota untuk masyarakat.', 'ditinjau', 89, '2024-06-07'),
('ASP-2024-003', 3, 'Ahmad Fauzi', 'Program Beasiswa Warga Kurang Mampu', 'Pendidikan', 'Usulan program beasiswa untuk anak-anak warga tidak mampu agar tetap bisa bersekolah.', 'diterima', 214, '2024-06-06')
ON DUPLICATE KEY UPDATE `judul`=VALUES(`judul`);
*/
