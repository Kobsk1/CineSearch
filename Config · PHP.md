<?php
session_start();

$host = 'localhost';
$db   = 'cinesearch';
$user = 'root';
$pass = '';          // XAMPP default has no password

try {
  $pdo = new PDO(
    "mysql:host=$host;dbname=$db;charset=utf8mb4",
    $user, $pass,
    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC ]
  );
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed.']);
  exit;
}

// Helper: send JSON and stop
function respond($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}

// Helper: require login
function requireLogin() {
  if (empty($_SESSION['user_id'])) {
    respond(['error' => 'Not logged in.'], 401);
  }
}
?>