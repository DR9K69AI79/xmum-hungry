<?php
require_once __DIR__ . '/helpers.php';

/**
 * Admin Guard - Check if current user is admin
 */
function checkAdminAccess() {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    
    $userId = $_SESSION['user_id'];
    
    // Check if user is admin (user ID 1 or specific admin email)
    if ($userId == ADMIN_UID) {
        return true;
    }
    
    // Additional admin check by email
    if (isset($_SESSION['user_email'])) {
        $adminEmails = [
            'admin@xmum.edu.my',
            'admin@example.com'
        ];
        
        if (in_array($_SESSION['user_email'], $adminEmails)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Require admin access or return error
 */
function requireAdminAccess() {
    if (!checkAdminAccess()) {
        respond(['error' => 'Admin access required'], 403);
    }
}

/**
 * Get admin dashboard data
 */
function getAdminDashboardData() {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        // Get statistics
        $stats = [];
        
        // Total restaurants
        $stmt = $db->query('SELECT COUNT(*) as count FROM restaurants');
        $stats['restaurants'] = $stmt->fetch()['count'];
        
        // Total dishes
        $stmt = $db->query('SELECT COUNT(*) as count FROM dishes');
        $stats['dishes'] = $stmt->fetch()['count'];
        
        // Total reviews
        $stmt = $db->query('SELECT COUNT(*) as count FROM reviews');
        $stats['reviews'] = $stmt->fetch()['count'];
        
        // Total users
        $stmt = $db->query('SELECT COUNT(*) as count FROM users');
        $stats['users'] = $stmt->fetch()['count'];
        
        // Recent reviews
        $stmt = $db->query('
            SELECT r.*, u.email, d.name as dish_name, rest.name as restaurant_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN dishes d ON r.dish_id = d.id
            JOIN restaurants rest ON d.rest_id = rest.id
            ORDER BY r.ts DESC
            LIMIT 10
        ');
        $recentReviews = $stmt->fetchAll();
        
        // Popular restaurants (mock data based on review count)
        $stmt = $db->query('
            SELECT rest.*, COUNT(r.id) as review_count
            FROM restaurants rest
            LEFT JOIN dishes d ON rest.id = d.rest_id
            LEFT JOIN reviews r ON d.id = r.dish_id
            GROUP BY rest.id
            ORDER BY review_count DESC, rest.name
            LIMIT 5
        ');
        $popularRestaurants = $stmt->fetchAll();
        
        return [
            'ok' => true,
            'stats' => $stats,
            'recentReviews' => $recentReviews,
            'popularRestaurants' => $popularRestaurants
        ];
        
    } catch (PDOException $e) {
        error_log("Admin dashboard error: " . $e->getMessage());
        return ['error' => 'Failed to load dashboard data'];
    }
}

/**
 * Get all restaurants for admin management
 */
function getRestaurantsForAdmin() {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        $stmt = $db->query('
            SELECT r.*, COUNT(d.id) as dish_count
            FROM restaurants r
            LEFT JOIN dishes d ON r.id = d.rest_id
            GROUP BY r.id
            ORDER BY r.name
        ');
        $restaurants = $stmt->fetchAll();
        
        return [
            'ok' => true,
            'restaurants' => $restaurants
        ];
        
    } catch (PDOException $e) {
        error_log("Get restaurants for admin error: " . $e->getMessage());
        return ['error' => 'Failed to load restaurants'];
    }
}

/**
 * Get all dishes for admin management
 */
function getDishesForAdmin($restaurantId = null) {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        if ($restaurantId) {
            $stmt = $db->prepare('
                SELECT d.*, r.name as restaurant_name
                FROM dishes d
                JOIN restaurants r ON d.rest_id = r.id
                WHERE d.rest_id = ?
                ORDER BY d.name
            ');
            $stmt->execute([$restaurantId]);
        } else {
            $stmt = $db->query('
                SELECT d.*, r.name as restaurant_name
                FROM dishes d
                JOIN restaurants r ON d.rest_id = r.id
                ORDER BY r.name, d.name
            ');
        }
        
        $dishes = $stmt->fetchAll();
        
        return [
            'ok' => true,
            'dishes' => $dishes
        ];
        
    } catch (PDOException $e) {
        error_log("Get dishes for admin error: " . $e->getMessage());
        return ['error' => 'Failed to load dishes'];
    }
}

/**
 * Get all reviews for admin management
 */
function getReviewsForAdmin($limit = 50) {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare('
            SELECT r.*, u.email, d.name as dish_name, rest.name as restaurant_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN dishes d ON r.dish_id = d.id
            JOIN restaurants rest ON d.rest_id = rest.id
            ORDER BY r.ts DESC
            LIMIT ?
        ');
        $stmt->execute([$limit]);
        $reviews = $stmt->fetchAll();
        
        return [
            'ok' => true,
            'reviews' => $reviews
        ];
        
    } catch (PDOException $e) {
        error_log("Get reviews for admin error: " . $e->getMessage());
        return ['error' => 'Failed to load reviews'];
    }
}

/**
 * Delete review (admin only)
 */
function deleteReview($reviewId) {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        // Get review info first to delete associated files
        $stmt = $db->prepare('SELECT photo_url, audio_url FROM reviews WHERE id = ?');
        $stmt->execute([$reviewId]);
        $review = $stmt->fetch();
        
        if ($review) {
            // Delete associated files
            if ($review['photo_url'] && file_exists(UPLOAD_PATH . $review['photo_url'])) {
                unlink(UPLOAD_PATH . $review['photo_url']);
            }
            if ($review['audio_url'] && file_exists(UPLOAD_PATH . $review['audio_url'])) {
                unlink(UPLOAD_PATH . $review['audio_url']);
            }
        }
        
        // Delete review
        $stmt = $db->prepare('DELETE FROM reviews WHERE id = ?');
        $stmt->execute([$reviewId]);
        
        return [
            'ok' => true,
            'message' => 'Review deleted successfully'
        ];
        
    } catch (PDOException $e) {
        error_log("Delete review error: " . $e->getMessage());
        return ['error' => 'Failed to delete review'];
    }
}

/**
 * Get system logs (simplified)
 */
function getSystemLogs() {
    requireAdminAccess();
    
    // This is a simplified version - in production you'd read actual log files
    $logs = [
        [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'INFO',
            'message' => 'System running normally'
        ],
        [
            'timestamp' => date('Y-m-d H:i:s', strtotime('-1 hour')),
            'level' => 'INFO',
            'message' => 'Database backup completed'
        ],
        [
            'timestamp' => date('Y-m-d H:i:s', strtotime('-2 hours')),
            'level' => 'WARNING',
            'message' => 'High memory usage detected'
        ]
    ];
    
    return [
        'ok' => true,
        'logs' => $logs
    ];
}

/**
 * Export data (CSV format)
 */
function exportData($type) {
    requireAdminAccess();
    
    try {
        $db = getDB();
        
        switch ($type) {
            case 'restaurants':
                $stmt = $db->query('SELECT * FROM restaurants ORDER BY name');
                $data = $stmt->fetchAll();
                break;
                
            case 'dishes':
                $stmt = $db->query('
                    SELECT d.*, r.name as restaurant_name
                    FROM dishes d
                    JOIN restaurants r ON d.rest_id = r.id
                    ORDER BY r.name, d.name
                ');
                $data = $stmt->fetchAll();
                break;
                
            case 'reviews':
                $stmt = $db->query('
                    SELECT r.*, u.email, d.name as dish_name, rest.name as restaurant_name
                    FROM reviews r
                    JOIN users u ON r.user_id = u.id
                    JOIN dishes d ON r.dish_id = d.id
                    JOIN restaurants rest ON d.rest_id = rest.id
                    ORDER BY r.ts DESC
                ');
                $data = $stmt->fetchAll();
                break;
                
            default:
                return ['error' => 'Invalid export type'];
        }
        
        // Convert to CSV
        if (empty($data)) {
            return ['error' => 'No data to export'];
        }
        
        $csv = '';
        
        // Header row
        $headers = array_keys($data[0]);
        $csv .= implode(',', $headers) . "\n";
        
        // Data rows
        foreach ($data as $row) {
            $csv .= implode(',', array_map(function($value) {
                return '"' . str_replace('"', '""', $value) . '"';
            }, $row)) . "\n";
        }
        
        return [
            'ok' => true,
            'csv' => $csv,
            'filename' => $type . '_' . date('Y-m-d_H-i-s') . '.csv'
        ];
        
    } catch (PDOException $e) {
        error_log("Export data error: " . $e->getMessage());
        return ['error' => 'Failed to export data'];
    }
}
?>

