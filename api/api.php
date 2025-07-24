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
    case 'random3':
        handleRandom3();
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
        
    case 'admin_updateRestaurantLocation':
        requireAdmin();
        handleAdminUpdateRestaurantLocation();
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
        respond(['ok' => false, 'error' => 'Invalid action'], 400);
}

// Authentication functions
function handleSignup() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['pwd'] ?? '';
    
    if (empty($email) || empty($password)) {
        respond(['ok' => false, 'error' => 'Email and password are required'], 400);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['ok' => false, 'error' => 'Invalid email format'], 400);
        return;
    }
    
    $db = getDB();
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        respond(['ok' => false, 'error' => 'User already exists'], 400);
        return;
    }
    
    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (email, pass_hash) VALUES (?, ?)");
    
    if ($stmt->execute([$email, $passwordHash])) {
        respond(['ok' => true, 'message' => 'User created successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to create user'], 500);
    }
}

function handleLogin() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['pwd'] ?? '';
    
    if (empty($email) || empty($password)) {
        respond(['ok' => false, 'error' => 'Email and password are required'], 400);
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, pass_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['pass_hash'])) {
        respond(['ok' => false, 'error' => 'Invalid credentials'], 401);
        return;
    }
    
    $_SESSION['user_id'] = $user['id'];
    respond(['ok' => true, 'message' => 'Login successful']);
}

function handleLogout() {
    session_destroy();
    respond(['ok' => true, 'message' => 'Logged out successfully']);
}

function handleCheckAuth() {
    if (!isset($_SESSION['user_id'])) {
        respond(['ok' => false, 'error' => 'Not authenticated'], 401);
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        respond(['ok' => false, 'error' => 'User not found'], 404);
        return;
    }
    
    $isAdmin = strpos($user['email'], 'admin') !== false;
    
    respond(['ok' => true, 'message' => 'Authenticated', 'data' => [
        'email' => $user['email'],
        'isAdmin' => $isAdmin
    ]]);
}

function handleGetUserInfo() {
    if (!isset($_SESSION['user_id'])) {
        respond(['ok' => false, 'error' => 'Not authenticated'], 401);
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        respond(['ok' => false, 'error' => 'User not found'], 404);
        return;
    }
    
    respond(['ok' => true, 'message' => 'User info retrieved', 'data' => ['email' => $user['email']]]);
}

// Restaurant functions
function handleGetAllRestaurants() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM restaurants ORDER BY name");
    $restaurants = $stmt->fetchAll();
    
    respond(['ok' => true, 'message' => 'Restaurants retrieved', 'data' => ['restaurants' => $restaurants]]);
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
    
    respond(['ok' => true, 'message' => 'Filtered restaurants retrieved', 'data' => ['restaurants' => $restaurants]]);
}

function handleRestaurantDetail() {
    $restId = $_GET['rest'] ?? '';
    
    if (empty($restId)) {
        respond(['ok' => false, 'error' => 'Restaurant ID is required'], 400);
        return;
    }
    
    $db = getDB();
    
    // Get restaurant info
    $stmt = $db->prepare("SELECT * FROM restaurants WHERE id = ?");
    $stmt->execute([$restId]);
    $restaurant = $stmt->fetch();
    
    if (!$restaurant) {
        respond(['ok' => false, 'error' => 'Restaurant not found'], 404);
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
    
    respond(['ok' => true, 'message' => 'Restaurant details retrieved', 'data' => [
        'restaurant' => $restaurant,
        'dishes' => $dishes,
        'reviews' => $reviews
    ]]);
}

function handleAddReview() {
    if (!isset($_SESSION['user_id'])) {
        respond(['ok' => false, 'error' => 'Authentication required'], 401);
        return;
    }
    
    $dishId = $_POST['dish_id'] ?? '';
    $stars = $_POST['stars'] ?? '';
    $comment = $_POST['comment'] ?? '';
    
    if (empty($dishId) || empty($stars)) {
        respond(['ok' => false, 'error' => 'Dish ID and rating are required'], 400);
        return;
    }
    
    if ($stars < 1 || $stars > 5) {
        respond(['ok' => false, 'error' => 'Rating must be between 1 and 5'], 400);
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
    $stmt = $db->prepare("
        INSERT INTO reviews (dish_id, user_id, stars, comment, photo_url, audio_url) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    if ($stmt->execute([$dishId, $_SESSION['user_id'], $stars, $comment, $photoUrl, $audioUrl])) {
        respond(['ok' => true, 'message' => 'Review added successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to add review'], 500);
    }
}

function requireAdmin() {
    if (!isset($_SESSION['user_id'])) {
        respond(['ok' => false, 'error' => 'Not authenticated'], 401);
        exit;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT email FROM users WHERE id = ? AND email LIKE '%admin%'");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        respond(['ok' => false, 'error' => 'Admin access required'], 403);
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
    
    respond(['ok' => true, 'message' => 'Stats retrieved', 'data' => ['stats' => $stats]]);
}

function getRecentActivities() {
    $db = getDB();
    
    // Get recent reviews as activities (SQLite compatible)
    $stmt = $db->prepare("
        SELECT r.ts as timestamp, u.email as user_email, 
               '添加评价' as action, 
               ('对 ' || d.name || ' 评价了 ' || r.stars || ' 星') as details
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        JOIN dishes d ON r.dish_id = d.id 
        ORDER BY r.ts DESC 
        LIMIT 10
    ");
    
    $stmt->execute();
    $activities = $stmt->fetchAll();
    
    return $activities;
}

function handleGetRecentActivities() {
    $activities = getRecentActivities();
    respond(['ok' => true, 'message' => 'Activities retrieved', 'data' => ['activities' => $activities]]);
}

function getAllUsers() {
    $db = getDB();
    
    $stmt = $db->query("SELECT id, email, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    respond(['ok' => true, 'message' => 'Users retrieved', 'data' => ['users' => $users]]);
}

function addUser() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        respond(['ok' => false, 'error' => 'Email and password are required'], 400);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['ok' => false, 'error' => 'Invalid email format'], 400);
        return;
    }
    
    $db = getDB();
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        respond(['ok' => false, 'error' => 'User with this email already exists'], 400);
        return;
    }
    
    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (email, pass_hash) VALUES (?, ?)");
    
    if ($stmt->execute([$email, $passwordHash])) {
        respond(['ok' => true, 'message' => 'User added successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to add user'], 500);
    }
}

function updateUser() {
    $userId = $_POST['userId'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($userId) || empty($email)) {
        respond(['ok' => false, 'error' => 'User ID and email are required'], 400);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['ok' => false, 'error' => 'Invalid email format'], 400);
        return;
    }
    
    $db = getDB();
    
    // Check if email is already used by another user
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        respond(['ok' => false, 'error' => 'Email is already used by another user'], 400);
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
        respond(['ok' => true, 'message' => 'User updated successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to update user'], 500);
    }
}

function deleteUser() {
    $userId = $_POST['userId'] ?? '';
    
    if (empty($userId)) {
        respond(['ok' => false, 'error' => 'User ID is required'], 400);
        return;
    }
    
    // Prevent deleting admin user
    if ($userId == $_SESSION['user_id']) {
        respond(['ok' => false, 'error' => 'Cannot delete your own account'], 400);
        return;
    }
    
    $db = getDB();
    
    // Delete user (reviews will be kept but user_id will be invalid)
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    
    if ($stmt->execute([$userId])) {
        respond(['ok' => true, 'message' => 'User deleted successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to delete user'], 500);
    }
}

// Admin restaurant management functions
function handleAdminGetRestaurants() {
    $db = getDB();
    
    $stmt = $db->query("SELECT * FROM restaurants ORDER BY name");
    $restaurants = $stmt->fetchAll();
    
    respond(['ok' => true, 'message' => 'Restaurants retrieved', 'data' => ['restaurants' => $restaurants]]);
}

function handleAdminAddRestaurant() {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $cuisines = $_POST['cuisines'] ?? '';
    $avgPrice = $_POST['avgPrice'] ?? '';
    $latitude = $_POST['latitude'] ?? '';
    $longitude = $_POST['longitude'] ?? '';
    $address = $_POST['address'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $hours = $_POST['hours'] ?? '';
    $imageUrl = $_POST['imageUrl'] ?? '';
    $videoUrl = $_POST['videoUrl'] ?? '';
    
    if (empty($name) || empty($description) || empty($cuisines) || empty($avgPrice) || empty($latitude) || empty($longitude)) {
        respond(['ok' => false, 'error' => 'Name, description, cuisines, price, latitude and longitude are required'], 400);
        return;
    }
    
    $db = getDB();
    
    // Handle file uploads
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageUrl = handleFileUpload($_FILES['image'], 'images');
    }
    
    if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
        $videoUrl = handleFileUpload($_FILES['video'], 'videos');
    }
    
    $stmt = $db->prepare("
        INSERT INTO restaurants (name, description, cuisines, avg_price, latitude, longitude, address, phone, hours, image_url, video_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    if ($stmt->execute([$name, $description, $cuisines, $avgPrice, $latitude, $longitude, $address, $phone, $hours, $imageUrl, $videoUrl])) {
        respond(['ok' => true, 'message' => 'Restaurant added successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to add restaurant'], 500);
    }
}

function handleAdminUpdateRestaurant() {
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $cuisines = $_POST['cuisines'] ?? '';
    $avgPrice = $_POST['avgPrice'] ?? '';
    $latitude = $_POST['latitude'] ?? '';
    $longitude = $_POST['longitude'] ?? '';
    $address = $_POST['address'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $hours = $_POST['hours'] ?? '';
    $imageUrl = $_POST['imageUrl'] ?? '';
    $videoUrl = $_POST['videoUrl'] ?? '';
    
    if (empty($id) || empty($name) || empty($description) || empty($cuisines) || empty($avgPrice) || empty($latitude) || empty($longitude)) {
        respond(['ok' => false, 'error' => 'ID, name, description, cuisines, price, latitude and longitude are required'], 400);
        return;
    }
    
    $db = getDB();
    
    // Handle file uploads
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageUrl = handleFileUpload($_FILES['image'], 'images');
    }
    
    if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
        $videoUrl = handleFileUpload($_FILES['video'], 'videos');
    }
    
    $stmt = $db->prepare("
        UPDATE restaurants 
        SET name = ?, description = ?, cuisines = ?, avg_price = ?, latitude = ?, longitude = ?, 
            address = ?, phone = ?, hours = ?, image_url = ?, video_url = ?
        WHERE id = ?
    ");
    
    if ($stmt->execute([$name, $description, $cuisines, $avgPrice, $latitude, $longitude, $address, $phone, $hours, $imageUrl, $videoUrl, $id])) {
        respond(['ok' => true, 'message' => 'Restaurant updated successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to update restaurant'], 500);
    }
}

function handleAdminDeleteRestaurant() {
    $id = $_POST['id'] ?? '';
    
    if (empty($id)) {
        respond(['ok' => false, 'error' => 'Restaurant ID is required'], 400);
        return;
    }
    
    $db = getDB();
    
    // Delete related dishes and reviews first
    $stmt = $db->prepare("DELETE FROM reviews WHERE dish_id IN (SELECT id FROM dishes WHERE rest_id = ?)");
    $stmt->execute([$id]);
    
    $stmt = $db->prepare("DELETE FROM dishes WHERE rest_id = ?");
    $stmt->execute([$id]);
    
    // Delete restaurant
    $stmt = $db->prepare("DELETE FROM restaurants WHERE id = ?");
    
    if ($stmt->execute([$id])) {
        respond(['ok' => true, 'message' => 'Restaurant deleted successfully']);
    } else {
        respond(['ok' => false, 'error' => 'Failed to delete restaurant'], 500);
    }
}

function handleAdminUpdateRestaurantLocation() {
    $id = $_POST['id'] ?? '';
    $latitude = $_POST['latitude'] ?? '';
    $longitude = $_POST['longitude'] ?? '';
    
    if (empty($id) || empty($latitude) || empty($longitude)) {
        respond(['ok' => false, 'error' => 'Missing required fields']);
        return;
    }
    
    $db = getDB();
    
    try {
        $stmt = $db->prepare("UPDATE restaurants SET lat = ?, lng = ? WHERE id = ?");
        $stmt->execute([$latitude, $longitude, $id]);
        
        if ($stmt->rowCount() === 0) {
            respond(['ok' => false, 'error' => 'Restaurant not found']);
            return;
        }
        
        respond(['ok' => true, 'message' => 'Restaurant location updated successfully']);
    } catch (Exception $e) {
        respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleAdminGetDishes() {
    respond(['ok' => false, 'error' => 'Not implemented yet'], 501);
}

function handleAdminAddDish() {
    respond(['ok' => false, 'error' => 'Not implemented yet'], 501);
}

function handleAdminUpdateDish() {
    respond(['ok' => false, 'error' => 'Not implemented yet'], 501);
}

function handleAdminDeleteDish() {
    respond(['ok' => false, 'error' => 'Not implemented yet'], 501);
}

function handleRandom3() {
    $sortMode = $_GET['sortMode'] ?? 'random';
    $limit = intval($_GET['limit'] ?? 3);
    $cuisine = $_GET['cuisine'] ?? '';
    $minPrice = floatval($_GET['minPrice'] ?? 0);
    $maxPrice = floatval($_GET['maxPrice'] ?? 100);
    $maxDistance = floatval($_GET['maxDistance'] ?? 10);
    $minRating = floatval($_GET['minRating'] ?? 0);
    
    $db = getDB();
    
    try {
        // Build the query with filters
        $sql = "SELECT r.*, 
                       COALESCE(AVG(rv.stars), 0) as avg_rating,
                       COUNT(rv.id) as review_count
                FROM restaurants r 
                LEFT JOIN dishes d ON r.id = d.rest_id
                LEFT JOIN reviews rv ON d.id = rv.dish_id 
                WHERE 1=1";
        
        $params = [];
        
        // Apply filters
        if (!empty($cuisine)) {
            $sql .= " AND r.cuisine = ?";
            $params[] = $cuisine;
        }
        
        if ($minPrice > 0) {
            $sql .= " AND r.price >= ?";
            $params[] = $minPrice;
        }
        
        if ($maxPrice < 100) {
            $sql .= " AND r.price <= ?";
            $params[] = $maxPrice;
        }
        
        $sql .= " GROUP BY r.id";
        
        // Apply rating filter after grouping
        if ($minRating > 0) {
            $sql .= " HAVING avg_rating >= ?";
            $params[] = $minRating;
        }
        
        // Apply sorting
        switch ($sortMode) {
            case 'rating':
                $sql .= " ORDER BY avg_rating DESC, review_count DESC";
                break;
            case 'price_low':
                $sql .= " ORDER BY r.price ASC";
                break;
            case 'price_high':
                $sql .= " ORDER BY r.price DESC";
                break;
            case 'distance':
                $sql .= " ORDER BY r.id ASC"; // Simple ordering by ID as distance proxy
                break;
            default: // random
                $sql .= " ORDER BY RANDOM()";
                break;
        }
        
        $sql .= " LIMIT ?";
        $params[] = $limit;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $restaurants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the results
        foreach ($restaurants as &$restaurant) {
            $restaurant['rating'] = round(floatval($restaurant['avg_rating']), 1);
            $restaurant['lat'] = floatval($restaurant['lat']);
            $restaurant['lng'] = floatval($restaurant['lng']);
            $restaurant['price'] = floatval($restaurant['price']);
            unset($restaurant['avg_rating']);
        }
        
        respond(['ok' => true, 'restaurants' => $restaurants]);
    } catch (Exception $e) {
        respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

?>

