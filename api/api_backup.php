<?php
require_once '../config/config.php';
require_once 'helpers.php';

// Handle the request
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'signup':
        handleSignup();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'checkAuth':
        handleCheckAuth();
        break;
    case 'getUserInfo':
        handleGetUserInfo();
        break;
    case 'getAllRestaurants':
        handleGetAllRestaurants();
        break;
    case 'filterRestaurants':
        handleFilterRestaurants();
        break;
    case 'restDetail':
        handleRestaurantDetail();
        break;
    case 'addReview':
        handleAddReview();
        break;
    case 'admin_getRestaurants':
        requireAdmin();
        handleAdminGetRestaurants();
        break;
    case 'admin_addRestaurant':
        requireAdmin();
        handleAdminAddRestaurant();
        break;
    case 'admin_updateRestaurant':
        requireAdmin();
        handleAdminUpdateRestaurant();
        break;
    case 'admin_deleteRestaurant':
        requireAdmin();
        handleAdminDeleteRestaurant();
        break;
    case 'admin_getDishes':
        requireAdmin();
        handleAdminGetDishes();
        break;
    case 'admin_addDish':
        requireAdmin();
        handleAdminAddDish();
        break;
    case 'admin_updateDish':
        requireAdmin();
        handleAdminUpdateDish();
        break;
    case 'admin_deleteDish':
        requireAdmin();
        handleAdminDeleteDish();
        break;
    // Admin-only endpoints
    case 'getAdminStats':
        requireAdmin();
        getAdminStats();
        break;
        
    case 'getRecentActivities':
        requireAdmin();
        getRecentActivities();
        break;
        
    case 'getAllUsers':
        requireAdmin();
        getAllUsers();
        break;
        
    case 'addUser':
        requireAdmin();
        addUser();
        break;
        
    case 'updateUser':
        requireAdmin();
        updateUser();
        break;
        
    case 'deleteUser':
        requireAdmin();
        deleteUser();
        break;
        
    default:
        jsonResponse(false, 'Invalid action');
}

// Authentication functions
function handleSignup() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['pwd'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonResponse(false, 'Email and password are required');
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, 'Invalid email format');
        return;
    }
    
    $db = getDB();
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(false, 'User already exists');
        return;
    }
    
    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (email, pass_hash) VALUES (?, ?)");
    
    if ($stmt->execute([$email, $passwordHash])) {
        jsonResponse(true, 'User created successfully');
    } else {
        jsonResponse(false, 'Failed to create user');
    }
}

function handleLogin() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['pwd'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonResponse(false, 'Email and password are required');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, pass_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['pass_hash'])) {
        jsonResponse(false, 'Invalid credentials');
        return;
    }
    
    $_SESSION['user_id'] = $user['id'];
    jsonResponse(true, 'Login successful');
}

function handleLogout() {
    session_destroy();
    jsonResponse(true, 'Logged out successfully');
}

function handleCheckAuth() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, 'Not authenticated');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'User not found');
        return;
    }
    
    $isAdmin = strpos($user['email'], 'admin') !== false;
    
    jsonResponse(true, 'Authenticated', [
        'email' => $user['email'],
        'isAdmin' => $isAdmin
    ]);
}

function handleGetUserInfo() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, 'Not authenticated');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'User not found');
        return;
    }
    
    jsonResponse(true, 'User info retrieved', ['email' => $user['email']]);
}

// Restaurant functions
function handleGetAllRestaurants() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM restaurants ORDER BY name");
    $restaurants = $stmt->fetchAll();
    
    jsonResponse(true, 'Restaurants retrieved', ['restaurants' => $restaurants]);
}

function handleFilterRestaurants() {
    $cuisines = $_GET['cuisines'] ?? '';
    $priceRange = $_GET['priceRange'] ?? '0,50';
    $distanceRange = $_GET['distanceRange'] ?? '0,5';
    $rating = $_GET['rating'] ?? '0';
    $searchText = $_GET['searchText'] ?? '';
    
    $db = getDB();
    
    $sql = "SELECT * FROM restaurants WHERE 1=1";
    $params = [];
    
    if (!empty($cuisines)) {
        $cuisineList = explode(',', $cuisines);
        $placeholders = str_repeat('?,', count($cuisineList) - 1) . '?';
        $sql .= " AND (";
        foreach ($cuisineList as $i => $cuisine) {
            if ($i > 0) $sql .= " OR ";
            $sql .= "cuisines LIKE ?";
            $params[] = "%$cuisine%";
        }
        $sql .= ")";
    }
    
    $priceRangeParts = explode(',', $priceRange);
    if (count($priceRangeParts) == 2) {
        $sql .= " AND avg_price BETWEEN ? AND ?";
        $params[] = $priceRangeParts[0];
        $params[] = $priceRangeParts[1];
    }
    
    if (!empty($searchText)) {
        $sql .= " AND (name LIKE ? OR description LIKE ?)";
        $params[] = "%$searchText%";
        $params[] = "%$searchText%";
    }
    
    $sql .= " ORDER BY name";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $restaurants = $stmt->fetchAll();
    
    jsonResponse(true, 'Filtered restaurants retrieved', ['restaurants' => $restaurants]);
}

function handleRestaurantDetail() {
    $restId = $_GET['rest'] ?? '';
    
    if (empty($restId)) {
        jsonResponse(false, 'Restaurant ID is required');
        return;
    }
    
    $db = getDB();
    
    // Get restaurant info
    $stmt = $db->prepare("SELECT * FROM restaurants WHERE id = ?");
    $stmt->execute([$restId]);
    $restaurant = $stmt->fetch();
    
    if (!$restaurant) {
        jsonResponse(false, 'Restaurant not found');
        return;
    }
    
    // Get dishes
    $stmt = $db->prepare("SELECT * FROM dishes WHERE rest_id = ? ORDER BY name");
    $stmt->execute([$restId]);
    $dishes = $stmt->fetchAll();
    
    // Get reviews with user info
    $stmt = $db->prepare("
        SELECT r.*, u.email as user_email 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.dish_id IN (SELECT id FROM dishes WHERE rest_id = ?) 
        ORDER BY r.ts DESC
    ");
    $stmt->execute([$restId]);
    $reviews = $stmt->fetchAll();
    
    // Calculate average rating
    if (!empty($reviews)) {
        $totalStars = array_sum(array_column($reviews, 'stars'));
        $avgRating = round($totalStars / count($reviews), 1);
        $restaurant['rating'] = $avgRating;
    } else {
        $restaurant['rating'] = 0;
    }
    
    jsonResponse(true, 'Restaurant details retrieved', [
        'restaurant' => $restaurant,
        'dishes' => $dishes,
        'reviews' => $reviews
    ]);
}

function handleAddReview() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, 'Authentication required');
        return;
    }
    
    $dishId = $_POST['dish_id'] ?? '';
    $stars = $_POST['stars'] ?? '';
    $comment = $_POST['comment'] ?? '';
    
    if (empty($dishId) || empty($stars)) {
        jsonResponse(false, 'Dish ID and rating are required');
        return;
    }
    
    if ($stars < 1 || $stars > 5) {
        jsonResponse(false, 'Rating must be between 1 and 5');
        return;
    }
    
    $db = getDB();
    
    // Handle file uploads
    $photoUrl = null;
    $audioUrl = null;
    
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $photoUrl = handleFileUpload($_FILES['photo'], 'images');
    }
    
    if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
        $audioUrl = handleFileUpload($_FILES['audio'], 'audio');
    }
    
    // Insert review
    $stmt = $db->prepare("\n        INSERT INTO reviews (dish_id, user_id, stars, comment, photo_url, audio_url) \n        VALUES (?, ?, ?, ?, ?, ?)\n    ");
    
    if ($stmt->execute([$dishId, $_SESSION['user_id'], $stars, $comment, $photoUrl, $audioUrl])) {
        jsonResponse(true, 'Review added successfully');
    } else {
        jsonResponse(false, 'Failed to add review');
    }
}

function requireAdmin() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, 'Not authenticated');
        exit;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ? AND email LIKE '%admin%'");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'Admin access required');
        exit;
    }
}

function getAdminStats() {
    $db = getDB();
    
    $stats = [];
    
    // Count users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $stats['users'] = $stmt->fetch()['count'];
    
    // Count restaurants
    $stmt = $db->query("SELECT COUNT(*) as count FROM restaurants");
    $stats['restaurants'] = $stmt->fetch()['count'];
    
    // Count dishes
    $stmt = $db->query("SELECT COUNT(*) as count FROM dishes");
    $stats['dishes'] = $stmt->fetch()['count'];
    
    // Count reviews
    $stmt = $db->query("SELECT COUNT(*) as count FROM reviews");
    $stats['reviews'] = $stmt->fetch()['count'];
    
    jsonResponse(true, 'Stats retrieved', ['stats' => $stats]);
}

function getRecentActivities() {
    $db = getDB();
    
    // Get recent reviews as activities
    $stmt = $db->prepare("\n        SELECT r.ts as timestamp, u.email as user_email, \n               '添加评价' as action, \n               CONCAT('对 ', d.name, ' 评价了 ', r.stars, ' 星') as details\n        FROM reviews r \n        JOIN users u ON r.user_id = u.id \n        JOIN dishes d ON r.dish_id = d.id \n        ORDER BY r.ts DESC \n        LIMIT 10\n    ");
    $stmt->execute();
    $activities = $stmt->fetchAll();
    
    jsonResponse(true, 'Activities retrieved', ['activities' => $activities]);
}

function getAllUsers() {
    $db = getDB();
    
    $stmt = $db->query("SELECT id, email, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    jsonResponse(true, 'Users retrieved', ['users' => $users]);
}

function addUser() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonResponse(false, 'Email and password are required');
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, 'Invalid email format');
        return;
    }
    
    $db = getDB();
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(false, 'User with this email already exists');
        return;
    }
    
    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (email, pass_hash) VALUES (?, ?)");
    
    if ($stmt->execute([$email, $passwordHash])) {
        jsonResponse(true, 'User added successfully');
    } else {
        jsonResponse(false, 'Failed to add user');
    }
}

function updateUser() {
    $userId = $_POST['userId'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($userId) || empty($email)) {
        jsonResponse(false, 'User ID and email are required');
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, 'Invalid email format');
        return;
    }
    
    $db = getDB();
    
    // Check if email is already used by another user
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        jsonResponse(false, 'Email is already used by another user');
        return;
    }
    
    // Update user
    if (!empty($password)) {
        // Update email and password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET email = ?, pass_hash = ? WHERE id = ?");
        $success = $stmt->execute([$email, $passwordHash, $userId]);
    } else {
        // Update email only
        $stmt = $db->prepare("UPDATE users SET email = ? WHERE id = ?");
        $success = $stmt->execute([$email, $userId]);
    }
    
    if ($success) {
        jsonResponse(true, 'User updated successfully');
    } else {
        jsonResponse(false, 'Failed to update user');
    }
}

function deleteUser() {
    $userId = $_POST['userId'] ?? '';
    
    if (empty($userId)) {
        jsonResponse(false, 'User ID is required');
        return;
    }
    
    // Prevent deleting admin user
    if ($userId == $_SESSION['user_id']) {
        jsonResponse(false, 'Cannot delete your own account');
        return;
    }
    
    $db = getDB();
    
    // Delete user (reviews will be kept but user_id will be invalid)
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    
    if ($stmt->execute([$userId])) {
        jsonResponse(true, 'User deleted successfully');
    } else {
        jsonResponse(false, 'Failed to delete user');
    }
}

// Placeholder admin functions (to be implemented)
function handleAdminGetRestaurants() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminAddRestaurant() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminUpdateRestaurant() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminDeleteRestaurant() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminGetDishes() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminAddDish() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminUpdateDish() {
    jsonResponse(false, 'Not implemented yet');
}

function handleAdminDeleteDish() {
    jsonResponse(false, 'Not implemented yet');
}
?>

