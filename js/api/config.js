/**
 * API Configuration for Noroff Social Media API
 * Contains base URLs, endpoints, and API configuration
 */

export const API_CONFIG = {
    BASE_URL: 'https://v2.api.noroff.dev',
    ENDPOINTS: {
        // Auth endpoints
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile',
        
        // Social endpoints
        POSTS: '/social/posts',
        PROFILES: '/social/profiles',
        
        // API Key endpoint
        API_KEY: '/auth/create-api-key'
    },
    
    // Request headers
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

/**
 * Get authorization headers including JWT token and API key
 * @returns {Object} Headers object with authorization
 */
export function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const apiKey = localStorage.getItem('apiKey');
    
    const headers = { ...API_CONFIG.HEADERS };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    if (apiKey) {
        headers['X-Noroff-API-Key'] = apiKey;
    }
    
    return headers;
}

/**
 * Build complete API URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Complete URL
 */
export function buildApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
} 