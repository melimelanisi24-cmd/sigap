<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$input = is_array($input) ? $input : [];
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!is_string($email) || !is_string($password) || trim($email) === '' || $password === '') {
    sendResponse(false, null, 'Email dan password wajib diisi', 400);
}
$email = trim($email);

// Cek user berdasarkan email
$stmt = $conn->prepare("SELECT id, name, email, password, role, nik, phone, address, province, regency, district, village, rw, rt, status FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if ($user) {
    if (password_verify($password, $user['password'])) {
        unset($user['password']);
        sendResponse(true, $user, 'Login berhasil');
    }
}

sendResponse(false, null, 'Email atau password salah', 401);
