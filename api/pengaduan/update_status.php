<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = trim($input['id'] ?? '');
$status = trim($input['status'] ?? '');
$keterangan = trim($input['keterangan'] ?? '');
$oleh = trim($input['oleh'] ?? 'Admin SIGAP');

if (empty($id) || empty($status)) {
    sendResponse(false, null, 'ID pengaduan dan status wajib diisi', 400);
}

if (empty($keterangan)) {
    $keterangan = "Status diubah menjadi $status.";
}

$now = date('Y-m-d');

$conn->beginTransaction();
try {
    // Update pengaduan
    $update = $conn->prepare("UPDATE pengaduan SET status = :status, tanggal_update = :tanggal WHERE id = :id");
    $update->execute([
        ':status' => $status,
        ':tanggal' => $now,
        ':id' => $id,
    ]);

    // Tambah entri riwayat
    $rInsert = $conn->prepare("INSERT INTO pengaduan_riwayat (pengaduan_id, tanggal, status, keterangan, oleh) VALUES (:id, :tanggal, :status, :keterangan, :oleh)");
    $rInsert->execute([
        ':id' => $id,
        ':tanggal' => $now,
        ':status' => $status,
        ':keterangan' => $keterangan,
        ':oleh' => $oleh,
    ]);

    $conn->commit();
    sendResponse(true, ['id' => $id, 'status' => $status], 'Status pengaduan berhasil diperbarui');
} catch (Exception $e) {
    $conn->rollBack();
    sendResponse(false, null, 'Gagal memperbarui status: ' . $e->getMessage(), 500);
}

