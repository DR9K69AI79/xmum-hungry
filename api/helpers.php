<?php
require_once __DIR__ . '/../config/config.php';

/**
 * Database connection helper
 */
function getDB() {
    try {
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        respond(['error' => 'Database connection failed'], 500);
    }
}

/**
 * JSON response helper
 */
function respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data);
    exit;
}

/**
 * Authentication helper
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        respond(['error' => 'Authentication required'], 401);
    }
    return $_SESSION['user_id'];
}

/**
 * Password hashing helper
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Password verification helper
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * File upload helper
 */
function handleFileUpload($fileKey, $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/webm', 'audio/wav']) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    $file = $_FILES[$fileKey];
    $fileType = $file['type'];
    
    if (!in_array($fileType, $allowedTypes)) {
        respond(['error' => 'Invalid file type'], 400);
    }
    
    // Check file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        respond(['error' => 'File too large'], 400);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $uploadPath = UPLOAD_PATH . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        respond(['error' => 'File upload failed'], 500);
    }
    
    return $filename;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance($lat1, $lng1, $lat2, $lng2) {
    $earthRadius = 6371; // km
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    
    $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}
?>

