<?php
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->query("SELECT id, user_id, pelapor, judul, kategori, deskripsi, status, dukungan, tanggal FROM aspirasi ORDER BY tanggal DESC, created_at DESC");
    $list = $stmt->fetchAll();

    foreach ($list as &$item) {
        $lStmt = $conn->prepare("SELECT file_name AS name, file_size AS size, file_type AS type, file_url AS url FROM aspirasi_lampiran WHERE aspirasi_id = :id");
        $lStmt->execute([':id' => $item['id']]);
        $item['lampiran'] = $lStmt->fetchAll();
    }
    unset($item);

    sendResponse(true, $list, 'Data aspirasi berhasil dimuat');

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $judul = trim($input['judul'] ?? '');
    $kategori = trim($input['kategori'] ?? '');
    $deskripsi = trim($input['deskripsi'] ?? '');
    $pelapor = trim($input['pelapor'] ?? 'Warga');
    $lampiran = $input['lampiran'] ?? [];

    if (empty($judul) || empty($kategori) || empty($deskripsi)) {
        sendResponse(false, null, 'Data formulir tidak lengkap', 400);
    }

    $now = date('Y-m-d');
    $year = date('Y');

    // Generate ID aspirasi
    $countStmt = $conn->query("SELECT COUNT(*) AS total FROM aspirasi");
    $count = (int)$countStmt->fetch()['total'] + 1;
    $id = sprintf("ASP-%s-%03d", $year, $count);

    $conn->beginTransaction();
    try {
        $insert = $conn->prepare("INSERT INTO aspirasi (id, pelapor, judul, kategori, deskripsi, status, dukungan, tanggal) VALUES (:id, :pelapor, :judul, :kategori, :deskripsi, 'ditinjau', 0, :tanggal)");
        $insert->execute([
            ':id' => $id,
            ':pelapor' => $pelapor,
            ':judul' => $judul,
            ':kategori' => $kategori,
            ':deskripsi' => $deskripsi,
            ':tanggal' => $now,
        ]);

        if (is_array($lampiran) && count($lampiran) > 0) {
            $lInsert = $conn->prepare("INSERT INTO aspirasi_lampiran (aspirasi_id, file_name, file_size, file_type, file_url) VALUES (:id, :name, :size, :type, :url)");
            foreach ($lampiran as $l) {
                $lInsert->execute([
                    ':id' => $id,
                    ':name' => $l['name'] ?? 'Lampiran',
                    ':size' => $l['size'] ?? '',
                    ':type' => $l['type'] ?? 'doc',
                    ':url' => $l['url'] ?? '',
                ]);
            }
        }

        $conn->commit();
        sendResponse(true, ['id' => $id], 'Aspirasi berhasil dikirim', 201);
    } catch (Exception $e) {
        $conn->rollBack();
        sendResponse(false, null, 'Gagal menyimpan aspirasi: ' . $e->getMessage(), 500);
    }
} else {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}

