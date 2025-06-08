import { AuthService } from './api/auth.js';
import { PostsService } from './api/posts.js';
import { 
    showAlert, 
    showLoading, 
    togglePageVisibility, 
    toggleAuthForms,
    clearForm,
    validateInput,
    formatDate,
    truncateText,
    debounce
} from './utils/ui.js';

/**
 * Main Application Class
 * Coordinates all application functionality
 */
class SocialMediaApp {
    constructor() {
        this.authService = new AuthService();
        this.postsService = new PostsService();
        this.currentUser = null;
        this.currentPostId = null;
        this.isEditMode = false;
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.checkAuthStatus();
        this.attachEventListeners();
        
        // Load posts if authenticated
        if (this.authService.isAuthenticated()) {
            this.loadPosts();
        }
    }
    
    /**
     * Check authentication status and update UI accordingly
     */
    checkAuthStatus() {
        if (this.authService.isAuthenticated()) {
            this.currentUser = this.authService.getCurrentUser();
            togglePageVisibility(false); // Show main app
        } else {
            togglePageVisibility(true); // Show auth page
        }
    }
    
    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Auth form toggles
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForms(false);
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForms(true);
        });
        
        // Form submissions
        document.getElementById('loginFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('registerFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Navigation
        document.getElementById('logoutLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        document.getElementById('homeLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPosts();
        });
        
        // Post actions
        document.getElementById('createPostBtn')?.addEventListener('click', () => {
            this.showPostModal();
        });
        
        document.getElementById('savePostBtn')?.addEventListener('click', () => {
            this.handleSavePost();
        });
        
        // Search and filter
        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = debounce((query) => {
            this.handleSearch(query);
        }, 500);
        
        searchInput?.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
        
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.handleSearch(searchInput.value);
        });
        
        document.getElementById('filterSelect')?.addEventListener('change', (e) => {
            this.handleFilter(e.target.value);
        });
        
        // Email validation
        document.getElementById('registerEmail')?.addEventListener('blur', (e) => {
            this.validateEmail(e.target);
        });
    }
    
    /**
     * Handle user login
     */
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }
        
        try {
            showLoading(true);
            await this.authService.login({ email, password });
            
            this.currentUser = this.authService.getCurrentUser();
            showAlert('Login successful!', 'success');
            
            clearForm('loginFormElement');
            togglePageVisibility(false);
            this.loadPosts();
            
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Handle user registration
     */
    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }
        
        if (!this.authService.isValidNoroffEmail(email)) {
            showAlert('Email must be @noroff.no or @stud.noroff.no', 'danger');
            return;
        }
        
        if (password.length < 8) {
            showAlert('Password must be at least 8 characters', 'danger');
            return;
        }
        
        try {
            showLoading(true);
            await this.authService.register({ name, email, password });
            
            showAlert('Registration successful! Please login.', 'success');
            clearForm('registerFormElement');
            toggleAuthForms(true);
            
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Handle user logout
     */
    handleLogout() {
        this.authService.logout();
        this.currentUser = null;
        togglePageVisibility(true);
        showAlert('Logged out successfully', 'info');
    }
    
    /**
     * Load and render posts
     */
    async loadPosts({ search = '', filter = '' } = {}) {
        try {
            showLoading(true);
            
            let options = { limit: 12 };
            
            if (search) {
                options.search = search;
            }
            
            // Handle filter options
            if (filter === 'my') {
                // This would need to be implemented with author filtering
                // For now, we'll load all posts and filter client-side
            }
            
            const response = await this.postsService.getPosts(options);
            const posts = response.data || [];
            
            this.renderPosts(posts, filter);
            
        } catch (error) {
            showAlert('Failed to load posts: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Render posts in the feed
     */
    renderPosts(posts, filter = '') {
        const postsFeed = document.getElementById('postsFeed');
        
        // Filter posts if needed
        let filteredPosts = posts;
        if (filter === 'my' && this.currentUser) {
            filteredPosts = posts.filter(post => 
                post.author?.name === this.currentUser.name
            );
        }
        
        if (filteredPosts.length === 0) {
            postsFeed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No posts found</h3>
                    <p>Be the first to create a post!</p>
                </div>
            `;
            return;
        }
        
        postsFeed.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');
        
        // Attach event listeners to post actions
        this.attachPostEventListeners();
    }
    
    /**
     * Create HTML for a single post
     */
    createPostHTML(post) {
        const { author, created, title, body, tags = [], media, id } = post;
        const isOwner = this.currentUser && author?.name === this.currentUser.name;
        
        return `
            <div class="card post-card post-enter">
                <div class="card-body">
                    <div class="post-header">
                        <div class="post-author">
                            <img src="${author?.avatar?.url || 'https://via.placeholder.com/40'}" 
                                 alt="${author?.name || 'User'}" 
                                 onerror="this.src='https://via.placeholder.com/40'">
                            <div>
                                <strong>${author?.name || 'Anonymous'}</strong>
                                <div class="post-meta">${formatDate(created)}</div>
                            </div>
                        </div>
                        ${isOwner ? `
                            <div class="post-actions">
                                <button class="btn btn-sm btn-outline-primary edit-post" data-id="${id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-post" data-id="${id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="post-content">
                        <h5 class="post-title">${title}</h5>
                        <p class="post-body">${body}</p>
                        
                        ${media ? `
                            <img src="${media.url}" alt="${media.alt || 'Post media'}" 
                                 class="img-fluid post-media" 
                                 onerror="this.style.display='none'">
                        ` : ''}
                        
                        ${tags.length > 0 ? `
                            <div class="post-tags">
                                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners to post action buttons
     */
    attachPostEventListeners() {
        // Edit post buttons
        document.querySelectorAll('.edit-post').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.dataset.id;
                this.editPost(postId);
            });
        });
        
        // Delete post buttons
        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.dataset.id;
                this.deletePost(postId);
            });
        });
    }
    
    /**
     * Show post modal for creating or editing
     */
    showPostModal(post = null) {
        const modal = new bootstrap.Modal(document.getElementById('postModal'));
        const modalTitle = document.getElementById('postModalTitle');
        
        if (post) {
            // Edit mode
            modalTitle.textContent = 'Edit Post';
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postBody').value = post.body;
            document.getElementById('postTags').value = post.tags?.join(', ') || '';
            document.getElementById('postMedia').value = post.media?.url || '';
            this.currentPostId = post.id;
            this.isEditMode = true;
        } else {
            // Create mode
            modalTitle.textContent = 'Create Post';
            clearForm('postForm');
            this.currentPostId = null;
            this.isEditMode = false;
        }
        
        modal.show();
    }
    
    /**
     * Handle saving post (create or update)
     */
    async handleSavePost() {
        const title = document.getElementById('postTitle').value.trim();
        const body = document.getElementById('postBody').value.trim();
        const tagsInput = document.getElementById('postTags').value.trim();
        const media = document.getElementById('postMedia').value.trim();
        
        if (!title || !body) {
            showAlert('Title and content are required', 'danger');
            return;
        }
        
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        const postData = { title, body, tags, media: media || null };
        
        try {
            showLoading(true);
            
            if (this.isEditMode && this.currentPostId) {
                await this.postsService.updatePost(this.currentPostId, postData);
                showAlert('Post updated successfully!', 'success');
            } else {
                await this.postsService.createPost(postData);
                showAlert('Post created successfully!', 'success');
            }
            
            // Close modal and refresh posts
            const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            modal.hide();
            
            this.loadPosts();
            
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Edit post
     */
    async editPost(postId) {
        try {
            showLoading(true);
            const response = await this.postsService.getPostById(postId);
            const post = response.data;
            
            this.showPostModal(post);
            
        } catch (error) {
            showAlert('Failed to load post for editing: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Delete post
     */
    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }
        
        try {
            showLoading(true);
            await this.postsService.deletePost(postId);
            showAlert('Post deleted successfully!', 'success');
            this.loadPosts();
            
        } catch (error) {
            showAlert('Failed to delete post: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Handle search
     */
    handleSearch(query) {
        this.loadPosts({ search: query });
    }
    
    /**
     * Handle filter
     */
    handleFilter(filter) {
        this.loadPosts({ filter });
    }
    
    /**
     * Validate email input
     */
    validateEmail(input) {
        const email = input.value;
        const isValid = this.authService.isValidNoroffEmail(email);
        
        validateInput(
            input, 
            isValid, 
            isValid ? 'Valid email' : 'Must be @noroff.no or @stud.noroff.no'
        );
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SocialMediaApp();
}); 