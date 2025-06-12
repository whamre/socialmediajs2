import { API_CONFIG, buildApiUrl, getAuthHeaders } from './config.js';

/**
 * Profiles service for handling user profile operations
 * @class ProfilesService
 */
export class ProfilesService {
    /**
     * Get all profiles with optional search and pagination
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of profiles to fetch (default: 12)
     * @param {number} options.page - Page number (default: 1)
     * @param {string} options.search - Search query for profiles
     * @returns {Promise<Object>} Profiles data from API
     * @throws {Error} Throws error if request fails
     */
    async getProfiles({ limit = 12, page = 1, search = '' } = {}) {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
                _followers: 'true',
                _following: 'true',
                _posts: 'true'
            });

            let url = `${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}?${params.toString()}`;

            // If search is provided, use the search endpoint
            if (search) {
                url = `${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/search?q=${encodeURIComponent(search)}&${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to fetch profiles');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to fetch profiles: ${error.message}`);
        }
    }

    /**
     * Get a single profile by username
     * @param {string} username - Profile username
     * @returns {Promise<Object>} Single profile data
     * @throws {Error} Throws error if request fails
     */
    async getProfileByUsername(username) {
        try {
            const params = new URLSearchParams({
                _followers: 'true',
                _following: 'true',
                _posts: 'true'
            });

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/${username}?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to fetch profile');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to fetch profile: ${error.message}`);
        }
    }

    /**
     * Get current user's profile
     * @returns {Promise<Object>} Current user's profile data
     * @throws {Error} Throws error if request fails
     */
    async getCurrentProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (!userData.name) {
                throw new Error('No authenticated user found');
            }

            return await this.getProfileByUsername(userData.name);
        } catch (error) {
            throw new Error(`Failed to fetch current profile: ${error.message}`);
        }
    }

    /**
     * Update user profile
     * @param {string} username - Username to update
     * @param {Object} profileData - Profile update data
     * @param {string} profileData.bio - User bio
     * @param {Object} profileData.avatar - Avatar data
     * @param {string} profileData.avatar.url - Avatar URL
     * @param {string} profileData.avatar.alt - Avatar alt text
     * @param {Object} profileData.banner - Banner data
     * @param {string} profileData.banner.url - Banner URL
     * @param {string} profileData.banner.alt - Banner alt text
     * @returns {Promise<Object>} Updated profile data
     * @throws {Error} Throws error if update fails
     */
    async updateProfile(username, { bio, avatar, banner } = {}) {
        try {
            const updateData = {};

            if (bio !== undefined) {
                updateData.bio = bio.trim();
            }

            if (avatar && avatar.url) {
                updateData.avatar = {
                    url: avatar.url.trim(),
                    alt: avatar.alt || 'Profile avatar'
                };
            }

            if (banner && banner.url) {
                updateData.banner = {
                    url: banner.url.trim(),
                    alt: banner.alt || 'Profile banner'
                };
            }

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/${username}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to update profile');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }

    /**
     * Follow a user
     * @param {string} username - Username to follow
     * @returns {Promise<Object>} Follow response
     * @throws {Error} Throws error if follow fails
     */
    async followUser(username) {
        try {
            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/${username}/follow`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to follow user');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to follow user: ${error.message}`);
        }
    }

    /**
     * Unfollow a user
     * @param {string} username - Username to unfollow
     * @returns {Promise<Object>} Unfollow response
     * @throws {Error} Throws error if unfollow fails
     */
    async unfollowUser(username) {
        try {
            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/${username}/unfollow`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to unfollow user');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to unfollow user: ${error.message}`);
        }
    }

    /**
     * Get posts by a specific user
     * @param {string} username - Username to get posts from
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of posts to fetch
     * @param {number} options.page - Page number
     * @returns {Promise<Object>} User's posts data
     * @throws {Error} Throws error if request fails
     */
    async getUserPosts(username, { limit = 12, page = 1 } = {}) {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
                _author: 'true',
                _comments: 'true',
                _reactions: 'true'
            });

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/${username}/posts?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to fetch user posts');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to fetch user posts: ${error.message}`);
        }
    }

    /**
     * Search profiles by query
     * @param {string} query - Search query
     * @param {Object} options - Additional options
     * @param {number} options.limit - Number of profiles to fetch
     * @param {number} options.page - Page number
     * @returns {Promise<Object>} Search results
     * @throws {Error} Throws error if search fails
     */
    async searchProfiles(query, { limit = 12, page = 1 } = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit.toString(),
                page: page.toString(),
                _followers: 'true',
                _following: 'true',
                _posts: 'true'
            });

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PROFILES)}/search?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to search profiles');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to search profiles: ${error.message}`);
        }
    }
} 