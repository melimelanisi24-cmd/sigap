<?php
require_once __DIR__ . '/../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$village = isset($_GET['village']) ? trim($_GET['village']) : (isset($_GET['wilayah']) ? trim($_GET['wilayah']) : 'Kalapanunggal');
$district = isset($_GET['district']) ? trim($_GET['district']) : '';
$rw = isset($_GET['rw']) ? trim($_GET['rw']) : '';
$rt = isset($_GET['rt']) ? trim($_GET['rt']) : '';

try {
    // Ambil data pengaduan publik dengan menyamarkan identitas pribadi pelapor (Privasi Terjaga)
    $sql = "
        SELECT 
            p.id,
            p.judul,
            p.judul AS title,
            p.kategori,
            p.kategori AS category,
            p.lokasi,
            CONCAT('RT ', LPAD(COALESCE(p.rt, '03'), 2, '0'), ' / RW ', LPAD(COALESCE(p.rw, '02'), 2, '0')) AS lokasiUmum,
            COALESCE(p.province, 'Jawa Barat') AS province,
            COALESCE(p.regency, 'Sukabumi') AS regency,
            COALESCE(p.district, 'Kalapanunggal') AS district,
            COALESCE(p.village, :fallbackVillage) AS village,
            COALESCE(p.rw, '02') AS rw,
            COALESCE(p.rt, '03') AS rt,
            CASE 
                WHEN p.status = 'menunggu' THEN 'Baru'
                WHEN p.status = 'diproses' THEN 'Dalam Proses'
                WHEN p.status = 'selesai' THEN 'Selesai'
                WHEN p.status = 'ditolak' THEN 'Ditolak'
                ELSE 'Baru'
            END AS status,
            p.tanggal,
            p.tanggal AS createdAt,
            p.tanggal_update AS tanggalUpdate,
            SUBSTRING(p.deskripsi, 1, 120) AS deskripsiSingkat,
            p.deskripsi AS deskripsiLengkap,
            p.deskripsi AS description,
            p.penanggung_jawab AS penanggungJawab,
            p.catatan AS catatanPetugas
        FROM pengaduan p
        WHERE LOWER(COALESCE(p.village, '')) = LOWER(:village)
    ";

    $params = [
        ':village' => $village,
        ':fallbackVillage' => $village,
    ];

    if (!empty($district)) {
        $sql .= " AND LOWER(COALESCE(p.district, '')) = LOWER(:district)";
        $params[':district'] = $district;
    }

    if (!empty($rw) && !empty($rt)) {
        $sql .= " AND p.rw = :rw AND p.rt = :rt";
        $params[':rw'] = $rw;
        $params[':rt'] = $rt;
    }

    $sql .= " ORDER BY p.tanggal DESC, p.created_at DESC LIMIT 30";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();

    // Attach riwayat progress publik
    foreach ($list as &$item) {
        $rStmt = $conn->prepare("
            SELECT 
                keterangan AS step,
                CASE 
                    WHEN status = 'selesai' THEN 'selesai'
                    WHEN status = 'diproses' THEN 'aktif'
                    ELSE 'menunggu'
                END AS status,
                tanggal,
                keterangan
            FROM pengaduan_riwayat 
            WHERE pengaduan_id = :id 
            ORDER BY id ASC
        ");
        $rStmt->execute([':id' => $item['id']]);
        $riwayat = $rStmt->fetchAll();

        if (empty($riwayat)) {
            $item['progress'] = [
                [
                    'step' => 'Pengaduan dikirim',
                    'status' => 'selesai',
                    'tanggal' => $item['tanggal'],
                    'keterangan' => 'Laporan warga tercatat di sistem SIGAP.'
                ],
                [
                    'step' => 'Pengaduan diverifikasi',
                    'status' => $item['status'] !== 'Baru' ? 'selesai' : 'menunggu',
                    'tanggal' => $item['tanggalUpdate'],
                    'keterangan' => 'Verifikasi oleh perangkat wilayah.'
                ],
                [
                    'step' => 'Sedang ditindaklanjuti',
                    'status' => $item['status'] === 'Dalam Proses' ? 'aktif' : ($item['status'] === 'Selesai' ? 'selesai' : 'menunggu'),
                    'tanggal' => $item['tanggalUpdate'],
                    'keterangan' => 'Penanganan oleh unit teknis lapangan.'
                ],
                [
                    'step' => 'Selesai',
                    'status' => $item['status'] === 'Selesai' ? 'selesai' : 'menunggu',
                    'tanggal' => $item['status'] === 'Selesai' ? $item['tanggalUpdate'] : '-',
                    'keterangan' => 'Konfirmasi penyelesaian pekerjaan.'
                ]
            ];
        } else {
            $item['progress'] = $riwayat;
        }
    }
    unset($item);

    sendResponse(true, $list, 'Data pengaduan warga sekitar berhasil dimuat');

} catch (Exception $e) {
    sendResponse(false, null, 'Gagal memuat data pengaduan sekitar: ' . $e->getMessage(), 500);
}
