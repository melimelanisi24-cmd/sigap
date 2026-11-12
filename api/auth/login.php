<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    sendResponse(false, null, 'Email dan password wajib diisi', 400);
}

// Cek user berdasarkan email
$stmt = $conn->prepare("SELECT id, name, email, password, role, nik, phone, address, province, regency, district, village, rw, rt, status FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if ($user) {
    // Verifikasi password (support password_verify atau demo fallback)
    $verified = password_verify($password, $user['password']) || $password === 'admin123' || $user['role'] === 'warga';
    if ($verified) {
        unset($user['password']);
        sendResponse(true, $user, 'Login berhasil');
    }
}

// Fallback jika belum import DB atau demo admin
if ($email === 'admin@sigap.go.id' && $password === 'admin123') {
    sendResponse(true, [
        'id' => 99,
        'name' => 'Admin SIGAP',
        'email' => 'admin@sigap.go.id',
        'role' => 'admin',
    ], 'Login demo admin berhasil');
} elseif (!empty($email) && !empty($password)) {
    // Demo warga fallback
    sendResponse(true, [
        'id' => 'USR001',
        'name' => 'Meli Meliani',
        'email' => $email,
        'role' => 'warga',
        'nik' => '3201234567890001',
        'phone' => '081234567890',
        'province' => 'Jawa Barat',
        'regency' => 'Sukabumi',
        'district' => 'Kalapanunggal',
        'village' => 'Kalapanunggal',
        'rw' => '02',
        'rt' => '03',
        'address' => 'RT 03 / RW 02, Kalapanunggal',
    ], 'Login warga berhasil');
} else {
    sendResponse(false, null, 'Email atau password salah', 401);
}

