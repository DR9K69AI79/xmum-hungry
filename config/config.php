<?php
// Configuration file for XMUM Hungry

define('APP_NAME', 'XMUM Hungry');
define('DB_PATH', __DIR__ . '/../db/app.sqlite');
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('ADMIN_UID', 1); // Admin user ID

// LLM Configuration (optional)
define('LLM_API_KEY', ''); // OpenAI API key if needed
define('LLM_API_BASE', 'https://api.openai.com/v1/');

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    session_start();
}
?>

