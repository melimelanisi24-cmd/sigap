<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$nik = trim($input['nik'] ?? '');
$password = trim($input['password'] ?? '');
$province = trim($input['province'] ?? 'Jawa Barat');
$regency = trim($input['regency'] ?? 'Sukabumi');
$district = trim($input['district'] ?? 'Kalapanunggal');
$village = trim($input['village'] ?? 'Kalapanunggal');
$rw = trim($input['rw'] ?? '02');
$rt = trim($input['rt'] ?? '03');

if (empty($name) || empty($email) || empty($nik) || empty($password)) {
    sendResponse(false, null, 'Semua kolom wajib diisi', 400);
}
if (empty($province) || empty($regency) || empty($district) || empty($village) || empty($rw) || empty($rt)) {
    sendResponse(false, null, 'Lengkapi informasi wilayah untuk melanjutkan.', 400);
}

// Cek apakah email sudah terdaftar
$stmt = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    sendResponse(false, null, 'Email sudah terdaftar', 409);
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insert = $conn->prepare("INSERT INTO users (name, email, password, role, nik, phone, address, province, regency, district, village, rw, rt, status) VALUES (:name, :email, :password, 'warga', :nik, '081234567890', :address, :province, :regency, :district, :village, :rw, :rt, 'aktif')");

try {
    $insert->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashedPassword,
        ':nik' => $nik,
        ':address' => "RT $rt / RW $rw, $village",
        ':province' => $province,
        ':regency' => $regency,
        ':district' => $district,
        ':village' => $village,
        ':rw' => $rw,
        ':rt' => $rt,
    ]);

    $newId = (int)$conn->lastInsertId();
    sendResponse(true, [
        'id' => $newId,
        'name' => $name,
        'email' => $email,
        'role' => 'warga',
        'nik' => $nik,
        'phone' => '081234567890',
        'address' => "RT $rt / RW $rw, $village",
        'province' => $province,
        'regency' => $regency,
        'district' => $district,
        'village' => $village,
        'rw' => $rw,
        'rt' => $rt,
    ], 'Registrasi berhasil', 201);
} catch (PDOException $e) {
    sendResponse(false, null, 'Gagal mendaftarkan akun: ' . $e->getMessage(), 500);
}

