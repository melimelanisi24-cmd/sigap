<?php
require_once __DIR__ . '/../config/database.php';

$stmt = $conn->query("SELECT id, nama, icon, warna FROM kategori ORDER BY id ASC");
$list = $stmt->fetchAll();

sendResponse(true, $list, 'Data kategori berhasil dimuat');

