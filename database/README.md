# Panduan Database SIGAP (MySQL XAMPP)

File skema database telah disediakan pada `database/sigap.sql`.

## Cara Import ke MySQL / phpMyAdmin:

1. Buka control panel **XAMPP**, lalu nyalakan modul **Apache** dan **MySQL**.
2. Buka browser dan akses **phpMyAdmin**:
   ```
   http://localhost/phpmyadmin
   ```
3. Klik tab **Import** pada menu atas.
4. Pilih file `sigap.sql` yang ada di:
   ```
   C:\xampp\htdocs\sigap\database\sigap.sql
   ```
5. Klik tombol **Go / Kirim** di bagian bawah.
6. Database `sigap_db` akan otomatis terbuat beserta seluruh tabel dan data awalnya:
   - `users`: data pengguna (warga dan admin).
   - `kategori`: kategori pengaduan dan aspirasi.
   - `pengaduan`: data laporan pengaduan masyarakat.
   - `pengaduan_foto`: foto bukti lampiran pengaduan.
   - `pengaduan_riwayat`: riwayat perubahan status penanganan.
   - `aspirasi`: data aspirasi dan usulan pembangunan.
   - `aspirasi_lampiran`: dokumen pendukung aspirasi.

## Akun Bawaan (Default):
- **Admin**: `admin@sigap.go.id` / `admin123`
- **Warga**: `budi.santoso@email.com` / sembarang password

