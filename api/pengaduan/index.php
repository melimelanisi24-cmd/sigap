<?php
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Ambil semua pengaduan
    $stmt = $conn->query("SELECT id, user_id, pelapor, email_pelapor, telepon_pelapor, judul, kategori, lokasi, province, regency, district, village, deskripsi, status, prioritas, penanggung_jawab AS penanggungJawab, catatan, tanggal, tanggal_update AS tanggalUpdate FROM pengaduan ORDER BY tanggal DESC, created_at DESC");
    $list = $stmt->fetchAll();

    // Attach foto dan riwayat untuk tiap pengaduan
    foreach ($list as &$item) {
        // Foto
        $fStmt = $conn->prepare("SELECT file_name AS name, file_size AS size, file_url AS url FROM pengaduan_foto WHERE pengaduan_id = :id");
        $fStmt->execute([':id' => $item['id']]);
        $item['foto'] = $fStmt->fetchAll();

        // Riwayat
        $rStmt = $conn->prepare("SELECT tanggal, status, keterangan, oleh FROM pengaduan_riwayat WHERE pengaduan_id = :id ORDER BY id ASC");
        $rStmt->execute([':id' => $item['id']]);
        $item['riwayat'] = $rStmt->fetchAll();
    }
    unset($item);

    sendResponse(true, $list, 'Data pengaduan berhasil dimuat');

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $judul = trim($input['judul'] ?? '');
    $kategori = trim($input['kategori'] ?? '');
    $lokasi = trim($input['lokasi'] ?? '');
    $deskripsi = trim($input['deskripsi'] ?? '');
    $pelapor = trim($input['pelapor'] ?? 'Warga');
    $emailPelapor = trim($input['emailPelapor'] ?? '');
    $province = trim($input['province'] ?? 'Jawa Barat');
    $regency = trim($input['regency'] ?? 'Sukabumi');
    $district = trim($input['district'] ?? 'Kalapanunggal');
    $village = trim($input['village'] ?? 'Kalapanunggal');
    $rw = trim($input['rw'] ?? '02');
    $rt = trim($input['rt'] ?? '03');
    $foto = $input['foto'] ?? [];

    if (empty($judul) || empty($kategori) || empty($lokasi) || empty($deskripsi)) {
        sendResponse(false, null, 'Data formulir tidak lengkap', 400);
    }

    $now = date('Y-m-d');
    $year = date('Y');

    // Generate ID pengaduan
    $countStmt = $conn->query("SELECT COUNT(*) AS total FROM pengaduan");
    $count = (int)$countStmt->fetch()['total'] + 1;
    $id = sprintf("ADU-%s-%03d", $year, $count);

    $conn->beginTransaction();
    try {
        $insert = $conn->prepare("INSERT INTO pengaduan (id, pelapor, email_pelapor, judul, kategori, lokasi, province, regency, district, village, rw, rt, deskripsi, status, prioritas, tanggal, tanggal_update) VALUES (:id, :pelapor, :email_pelapor, :judul, :kategori, :lokasi, :province, :regency, :district, :village, :rw, :rt, :deskripsi, 'menunggu', 'sedang', :tanggal, :tanggal_update)");
        $insert->execute([
            ':id' => $id,
            ':pelapor' => $pelapor,
            ':email_pelapor' => $emailPelapor,
            ':judul' => $judul,
            ':kategori' => $kategori,
            ':lokasi' => $lokasi,
            ':province' => $province,
            ':regency' => $regency,
            ':district' => $district,
            ':village' => $village,
            ':rw' => $rw,
            ':rt' => $rt,
            ':deskripsi' => $deskripsi,
            ':tanggal' => $now,
            ':tanggal_update' => $now,
        ]);

        // Insert riwayat awal
        $rInsert = $conn->prepare("INSERT INTO pengaduan_riwayat (pengaduan_id, tanggal, status, keterangan, oleh) VALUES (:id, :tanggal, 'menunggu', 'Pengaduan diterima dan sedang menunggu verifikasi.', 'Sistem')");
        $rInsert->execute([':id' => $id, ':tanggal' => $now]);

        // Insert foto bukti jika ada
        if (is_array($foto) && count($foto) > 0) {
            $fInsert = $conn->prepare("INSERT INTO pengaduan_foto (pengaduan_id, file_name, file_size, file_url) VALUES (:id, :name, :size, :url)");
            foreach ($foto as $f) {
                $fInsert->execute([
                    ':id' => $id,
                    ':name' => $f['name'] ?? 'Foto',
                    ':size' => $f['size'] ?? '',
                    ':url' => $f['url'] ?? '',
                ]);
            }
        }

        $conn->commit();
        sendResponse(true, ['id' => $id], 'Pengaduan berhasil dibuat', 201);
    } catch (Exception $e) {
        $conn->rollBack();
        sendResponse(false, null, 'Gagal menyimpan pengaduan: ' . $e->getMessage(), 500);
    }
} else {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}
