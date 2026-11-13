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
