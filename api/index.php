<?php
require_once __DIR__ . '/config/database.php';

sendResponse(true, [
    'app' => 'SIGAP API Backend',
    'version' => '1.0.0',
    'status' => 'online',
    'database' => 'connected',
], 'SIGAP REST API aktif dan siap digunakan.');

