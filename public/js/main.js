// Main JavaScript file for XMUM Hungry
// Import API configuration
import { apiRequest, buildApiUrl } from './config.js';

// Import all Web Components
import './components/map-container.js';
import './components/fab-recommend.js';
import './components/fab-filter.js';
import './components/filter-sheet.js';
import './components/mini-card.js';
import './components/toast-msg.js';

// Global event bus
export const bus = new EventTarget();

// Safe toast message function
function safeToast(type, message, duration) {
    try {
        if (typeof ToastMsg !== 'undefined' && ToastMsg[type]) {
            ToastMsg[type](message, duration);
        } else {
            console.log(`Toast ${type}: ${message}`);
        }
    } catch (error) {
        console.log(`Toast ${type}: ${message}`);
    }
}

// Global state
const state = {
    currentUser: null,
    currentFilters: {},
    currentRestaurants: [],
    isLoading: false
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Check authentication
        await checkAuth();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize components
        initializeComponents();
        
        // Load initial data
        await loadInitialData();
        
        console.log('XMUM Hungry app initialized successfully');
    } catch (error) {
        console.error('App initialization error:', error);
        safeToast('error', '应用初始化失败，请刷新页面重试');
    }
}

async function checkAuth() {
    try {
        const result = await apiRequest('/api/api.php?action=checkAuth');
        
        if (!result.ok) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        state.currentUser = result.user;
        console.log('User authenticated:', state.currentUser);
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
    }
}

function setupEventListeners() {
    // Recommend button click
    document.addEventListener('recommend-click', async (e) => {
        const sortMode = e.detail.sortMode;
        await handleRecommendClick(sortMode);
    });

    // Filter button click
    document.addEventListener('open-filter', (e) => {
        const filterSheet = document.querySelector('filter-sheet');
        const fabFilter = document.querySelector('fab-filter');
        
        if (e.detail.isOpen) {
            filterSheet.open();
        } else {
            filterSheet.close();
        }
    });

    // Filters updated
    document.addEventListener('filters-updated', async (e) => {
        state.currentFilters = e.detail.filters;
        await applyFilters();
    });

    // Restaurant highlighted
    document.addEventListener('highlight-restaurant', (e) => {
        const miniCard = document.querySelector('mini-card');
        miniCard.show(e.detail);
    });

    // Enter detail page
    document.addEventListener('enter-detail', (e) => {
        const restaurant = e.detail.restaurant;
        window.location.href = `detail.html?id=${restaurant.id}`;
    });

    // Parse natural language
    document.addEventListener('parse-llm', async (e) => {
        await parseNaturalLanguage(e.detail.text);
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        // Handle navigation state if needed
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
        safeToast('success', '网络连接已恢复');
    });

    window.addEventListener('offline', () => {
        safeToast('warning', '网络连接已断开，某些功能可能不可用');
    });
}

function initializeComponents() {
    // Create toast container if not exists
    if (!document.querySelector('toast-msg')) {
        const toastMsg = document.createElement('toast-msg');
        document.body.appendChild(toastMsg);
    }

    // Initialize map container
    const mapContainer = document.querySelector('map-container');
    if (mapContainer) {
        console.log('Map container initialized');
    }

    // Initialize FAB buttons
    const fabRecommend = document.querySelector('fab-recommend');
    const fabFilter = document.querySelector('fab-filter');
    
    if (fabRecommend) {
        console.log('FAB recommend initialized');
    }
    
    if (fabFilter) {
        console.log('FAB filter initialized');
    }

    // Initialize filter sheet
    const filterSheet = document.querySelector('filter-sheet');
    if (filterSheet) {
        console.log('Filter sheet initialized');
    }

    // Initialize mini card
    const miniCard = document.querySelector('mini-card');
    if (miniCard) {
        console.log('Mini card initialized');
    }
}

async function loadInitialData() {
    try {
        // Load restaurants for initial display
        const result = await apiRequest('/api/api.php?action=getAllRestaurants');
        
        if (result.ok && result.restaurants) {
            state.currentRestaurants = result.restaurants;
            console.log(`Loaded ${result.restaurants.length} restaurants`);
        }
    } catch (error) {
        console.error('Failed to load initial data:', error);
        safeToast('warning', '加载餐厅数据失败，请稍后重试');
    }
}

async function handleRecommendClick(sortMode) {
    if (state.isLoading) return;
    
    state.isLoading = true;
    
    try {
        // Show loading state
        safeToast('info', '正在为您推荐餐厅...');
        
        // Get current filters
        const filterSheet = document.querySelector('filter-sheet');
        const filters = filterSheet ? filterSheet.value : {};
        
        // Add sort mode to filters
        const params = new URLSearchParams({
            ...filters,
            sortMode: sortMode,
            limit: 3
        });
        
        const result = await apiRequest(`/api/api.php?action=random3&${params}`);
        
        if (result.ok && result.restaurants) {
            // Update map with recommended restaurants
            const mapContainer = document.querySelector('map-container');
            if (mapContainer) {
                mapContainer.setRestaurants(result.restaurants);
            }
            
            state.currentRestaurants = result.restaurants;
            
            safeToast('success', `为您推荐了 ${result.restaurants.length} 家餐厅`);
        } else {
            throw new Error(result.error || '推荐失败');
        }
    } catch (error) {
        console.error('Recommend error:', error);
        safeToast('error', '推荐失败，请稍后重试');
    } finally {
        state.isLoading = false;
    }
}

async function applyFilters() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    
    try {
        const params = new URLSearchParams(state.currentFilters);
        const result = await apiRequest(`/api/api.php?action=filterRestaurants&${params}`);
        
        if (result.ok && result.restaurants) {
            // Update map with filtered restaurants
            const mapContainer = document.querySelector('map-container');
            if (mapContainer) {
                mapContainer.setRestaurants(result.restaurants);
            }
            
            state.currentRestaurants = result.restaurants;
            
            if (result.restaurants.length === 0) {
                safeToast('warning', '没有找到符合条件的餐厅，请调整筛选条件');
            } else {
                safeToast('success', `找到 ${result.restaurants.length} 家符合条件的餐厅`);
            }
        } else {
            throw new Error(result.error || '筛选失败');
        }
    } catch (error) {
        console.error('Filter error:', error);
        safeToast('error', '筛选失败，请稍后重试');
    } finally {
        state.isLoading = false;
    }
}

async function parseNaturalLanguage(text) {
    try {
        // Simple keyword-based parsing as fallback
        const filters = {
            cuisines: [],
            priceRange: [0, 50],
            distanceRange: [0, 5],
            rating: 0
        };
        
        const lowerText = text.toLowerCase();
        
        // Cuisine detection
        const cuisineMap = {
            '中式': ['中式', '中餐', '中国', '面条', '饺子'],
            '马来': ['马来', '马来西亚', 'malay', '椰浆饭'],
            '印度': ['印度', 'indian', '咖喱', '印度飞饼'],
            '西式': ['西式', '西餐', 'western', '汉堡', '牛排'],
            '泰式': ['泰式', '泰国', 'thai', '冬阴功', '泰式'],
            '日式': ['日式', '日本', 'japanese', '寿司', '拉面'],
            '韩式': ['韩式', '韩国', 'korean', '烧烤', '泡菜'],
            '意式': ['意式', '意大利', 'italian', '披萨', '意面']
        };
        
        Object.entries(cuisineMap).forEach(([cuisine, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                filters.cuisines.push(cuisine);
            }
        });
        
        // Price detection
        if (lowerText.includes('便宜') || lowerText.includes('不贵') || lowerText.includes('实惠')) {
            filters.priceRange[1] = 15;
        } else if (lowerText.includes('贵') || lowerText.includes('高档')) {
            filters.priceRange[1] = 50;
        }
        
        // Distance detection
        if (lowerText.includes('近') || lowerText.includes('附近')) {
            filters.distanceRange[1] = 1;
        }
        
        // Rating detection
        if (lowerText.includes('好评') || lowerText.includes('评分高')) {
            filters.rating = 4;
        }
        
        // Update filter sheet
        const filterSheet = document.querySelector('filter-sheet');
        if (filterSheet) {
            filterSheet.value = filters;
        }
        
        safeToast('success', '已根据您的描述更新筛选条件');
        
        // Apply filters
        state.currentFilters = filters;
        await applyFilters();
        
    } catch (error) {
        console.error('NLP parsing error:', error);
        safeToast('error', '解析失败，请手动选择筛选条件');
    }
}

// Utility functions
export function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
}

export function formatPrice(price) {
    return `RM ${price}`;
}

export function formatRating(rating) {
    return rating.toFixed(1);
}

// Export state for debugging
window.xmumHungryState = state;

// Service worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

