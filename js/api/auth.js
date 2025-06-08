import { API_CONFIG, buildApiUrl, getAuthHeaders } from './config.js';

/**
 * Authentication service for handling user registration, login, and API key management
 * @class AuthService
 */
export class AuthService {
    /**
     * Register a new user account
     * @param {Object} userData - User registration data
     * @param {string} userData.name - User's full name
     * @param {string} userData.email - User's email (must be @noroff.no or @stud.noroff.no)
     * @param {string} userData.password - User's password (minimum 8 characters)
     * @returns {Promise<Object>} Registration response from API
     * @throws {Error} Throws error if registration fails
     * 
     * @example
     * // Register a new user
     * const authService = new AuthService();
     * try {
     *     const result = await authService.register({
     *         name: "John Doe",
     *         email: "john.doe@stud.noroff.no",
     *         password: "securePassword123"
     *     });
     *     console.log('Registration successful:', result);
     * } catch (error) {
     *     console.error('Registration failed:', error.message);
     * }
     */
    async register({ name, email, password }) {
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Login user and store authentication tokens
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @returns {Promise<Object>} Login response with user data and token
     * @throws {Error} Throws error if login fails
     */
    async login({ email, password }) {
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Login failed');
            }

            // Store the JWT token
            if (data.data?.accessToken) {
                localStorage.setItem('authToken', data.data.accessToken);
                localStorage.setItem('userData', JSON.stringify(data.data));
                
                // Create API key after successful login
                await this.createApiKey();
            }

            return data;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Create API key for authenticated requests
     * @returns {Promise<void>}
     * @throws {Error} Throws error if API key creation fails
     */
    async createApiKey() {
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.API_KEY), {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'API key creation failed');
            }

            // Store the API key
            if (data.data?.key) {
                localStorage.setItem('apiKey', data.data.key);
            }
        } catch (error) {
            console.error('API key creation failed:', error.message);
            // Don't throw here as this shouldn't break the login flow
        }
    }

    /**
     * Logout user and clear stored data
     * @returns {void}
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('userData');
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} True if user has valid authentication token
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const apiKey = localStorage.getItem('apiKey');
        return !!(token && apiKey);
    }

    /**
     * Get current user data from localStorage
     * @returns {Object|null} User data object or null if not authenticated
     */
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Validate email format for Noroff domains
     * @param {string} email - Email to validate
     * @returns {boolean} True if email is valid Noroff domain
     */
    isValidNoroffEmail(email) {
        const noroffDomains = ['@noroff.no', '@stud.noroff.no'];
        return noroffDomains.some(domain => email.toLowerCase().endsWith(domain));
    }
} 