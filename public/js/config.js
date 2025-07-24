// API Configuration
export const API_CONFIG = {
    // Automatically detect the correct API base URL
    baseURL: window.location.origin,
    
    // API endpoints
    endpoints: {
        login: '/api/api.php?action=login',
        signup: '/api/api.php?action=signup',
        logout: '/api/api.php?action=logout',
        checkAuth: '/api/api.php?action=checkAuth',
        getUserInfo: '/api/api.php?action=getUserInfo',
        getAllRestaurants: '/api/api.php?action=getAllRestaurants',
        filterRestaurants: '/api/api.php?action=filterRestaurants',
        random3: '/api/api.php?action=random3',
        restDetail: '/api/api.php?action=restDetail',
        addReview: '/api/api.php?action=addReview'
    }
};

// Helper function to build full API URL
export function buildApiUrl(endpoint, params = {}) {
    let url = API_CONFIG.baseURL + endpoint;
    if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += (endpoint.includes('?') ? '&' : '?') + searchParams.toString();
    }
    return url;
}

// Helper function for API requests
export async function apiRequest(endpoint, options = {}) {
    const url = typeof endpoint === 'string' ? 
        API_CONFIG.baseURL + endpoint : 
        buildApiUrl(endpoint.path, endpoint.params);
    
    const defaultOptions = {
        headers: {}
    };
    
    // Only set Content-Type if not FormData (let browser set it for FormData)
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            // If not JSON, it might be an error page
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned non-JSON response');
        }
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}
