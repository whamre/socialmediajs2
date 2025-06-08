import { API_CONFIG, buildApiUrl, getAuthHeaders } from './config.js';

/**
 * Posts service for handling social media posts
 */
export class PostsService {
    /**
     * Get all posts with optional query parameters
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of posts to fetch (default: 12)
     * @param {number} options.page - Page number (default: 1)
     * @param {string} options.tag - Filter by tag
     * @param {string} options.search - Search in post content
     * @returns {Promise<Object>} Posts data from API
     * @throws {Error} Throws error if request fails
     */
    async getPosts({ limit = 12, page = 1, tag = '', search = '' } = {}) {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
                _author: 'true',
                _comments: 'true',
                _reactions: 'true'
            });

            if (tag) params.append('_tag', tag);

            let url = `${buildApiUrl(API_CONFIG.ENDPOINTS.POSTS)}?${params.toString()}`;

            // If search is provided, use the search endpoint
            if (search) {
                url = `${buildApiUrl(API_CONFIG.ENDPOINTS.POSTS)}/search?q=${encodeURIComponent(search)}&${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to fetch posts');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    /**
     * Get a single post by ID
     * @param {string} id - Post ID
     * @returns {Promise<Object>} Single post data
     * @throws {Error} Throws error if request fails
     */
    async getPostById(id) {
        try {
            const params = new URLSearchParams({
                _author: 'true',
                _comments: 'true',
                _reactions: 'true'
            });

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.POSTS)}/${id}?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to fetch post');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to fetch post: ${error.message}`);
        }
    }

    /**
     * Create a new post
     * @param {Object} postData - Post data
     * @param {string} postData.title - Post title
     * @param {string} postData.body - Post content
     * @param {string[]} postData.tags - Array of tags
     * @param {string} postData.media - Media URL (optional)
     * @returns {Promise<Object>} Created post data
     * @throws {Error} Throws error if creation fails
     */
    async createPost({ title, body, tags = [], media = null }) {
        try {
            const postPayload = {
                title: title.trim(),
                body: body.trim(),
                tags: tags.filter(tag => tag.trim().length > 0).map(tag => tag.trim())
            };

            if (media && media.trim()) {
                postPayload.media = {
                    url: media.trim(),
                    alt: title || 'Post media'
                };
            }

            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.POSTS), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(postPayload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to create post');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    /**
     * Update an existing post
     * @param {string} id - Post ID
     * @param {Object} postData - Updated post data
     * @param {string} postData.title - Post title
     * @param {string} postData.body - Post content
     * @param {string[]} postData.tags - Array of tags
     * @param {string} postData.media - Media URL (optional)
     * @returns {Promise<Object>} Updated post data
     * @throws {Error} Throws error if update fails
     */
    async updatePost(id, { title, body, tags = [], media = null }) {
        try {
            const postPayload = {
                title: title.trim(),
                body: body.trim(),
                tags: tags.filter(tag => tag.trim().length > 0).map(tag => tag.trim())
            };

            if (media && media.trim()) {
                postPayload.media = {
                    url: media.trim(),
                    alt: title || 'Post media'
                };
            }

            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.POSTS)}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(postPayload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.message || 'Failed to update post');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to update post: ${error.message}`);
        }
    }

    /**
     * Delete a post
     * @param {string} id - Post ID to delete
     * @returns {Promise<void>}
     * @throws {Error} Throws error if deletion fails
     */
    async deletePost(id) {
        try {
            const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.POSTS)}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.errors?.[0]?.message || 'Failed to delete post');
            }
        } catch (error) {
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    /**
     * Search posts by query
     * @param {string} query - Search query
     * @param {Object} options - Additional options
     * @param {number} options.limit - Number of posts to fetch
     * @param {number} options.page - Page number
     * @returns {Promise<Object>} Search results
     * @throws {Error} Throws error if search fails
     */
    async searchPosts(query, { limit = 12, page = 1 } = {}) {
        return this.getPosts({ search: query, limit, page });
    }
} 