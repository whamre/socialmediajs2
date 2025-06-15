import { AuthService } from './api/auth.js';
import { PostsService } from './api/posts.js';
import { 
    showAlert, 
    showLoading, 
    formatDate
} from './utils/ui.js';

/**
 * Individual Post Page Class
 * Handles viewing a single post with comments
 */
class PostPage {
    constructor() {
        this.authService = new AuthService();
        this.postsService = new PostsService();
        this.currentUser = null;
        this.currentPost = null;
        this.postId = null;
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        this.checkAuthStatus();
        this.getPostIdFromUrl();
        this.attachEventListeners();
        
        if (this.postId) {
            await this.loadPost();
        } else {
            this.showError('No post ID provided');
        }
    }
    
    /**
     * Check authentication status and update UI accordingly
     */
    checkAuthStatus() {
        if (this.authService.isAuthenticated()) {
            this.currentUser = this.authService.getCurrentUser();
            this.updateAuthUI(true);
        } else {
            this.updateAuthUI(false);
        }
    }
    
    /**
     * Update authentication UI elements
     */
    updateAuthUI(isAuthenticated) {
        const authNav = document.getElementById('authNav');
        const logoutNav = document.getElementById('logoutNav');
        const addCommentForm = document.getElementById('addCommentForm');
        
        if (isAuthenticated) {
            authNav.classList.add('d-none');
            logoutNav.classList.remove('d-none');
            if (addCommentForm) {
                addCommentForm.classList.remove('d-none');
            }
        } else {
            authNav.classList.remove('d-none');
            logoutNav.classList.add('d-none');
            if (addCommentForm) {
                addCommentForm.classList.add('d-none');
            }
        }
    }
    
    /**
     * Get post ID from URL parameters
     */
    getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.postId = urlParams.get('id');
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Logout link
        document.getElementById('logoutLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // Comment form
        document.getElementById('submitComment')?.addEventListener('click', () => {
            this.handleSubmitComment();
        });
        
        // Character counter for comments
        document.getElementById('commentText')?.addEventListener('input', (e) => {
            this.updateCharacterCount(e.target);
        });
    }
    
    /**
     * Load the post data
     */
    async loadPost() {
        try {
            showLoading(true);
            const response = await this.postsService.getPostById(this.postId);
            this.currentPost = response.data;
            
            this.renderPost();
            this.renderComments();
            this.showContent();
            
        } catch (error) {
            this.showError('Failed to load post. The post may not exist or you may not have permission to view it.');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Render the main post
     */
    renderPost() {
        const { author, created, title, body, tags = [], media, id, _count } = this.currentPost;
        const isOwner = this.currentUser && author?.name === this.currentUser.name;
        
        const postHTML = `
            <div class="card-body">
                <div class="post-header">
                    <div class="post-author">
                        <img src="${author?.avatar?.url || 'https://via.placeholder.com/50'}" 
                             alt="${author?.name || 'User'}" 
                             onerror="this.src='https://via.placeholder.com/50'"
                             class="rounded-circle"
                             style="width: 50px; height: 50px; object-fit: cover;">
                        <div class="ms-3">
                            <h6 class="mb-1">${author?.name || 'Anonymous'}</h6>
                            <div class="post-meta text-muted">${formatDate(created)}</div>
                        </div>
                    </div>
                    ${isOwner ? `
                        <div class="post-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="window.location.href='index.html'">
                                <i class="fas fa-edit me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="this.deletePost('${id}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-content mt-4">
                    <h2 class="post-title mb-3">${title}</h2>
                    <div class="post-body mb-4" style="white-space: pre-wrap; line-height: 1.6;">${body}</div>
                    
                    ${media ? `
                        <div class="mb-4">
                            <img src="${media.url}" alt="${media.alt || 'Post media'}" 
                                 class="img-fluid rounded shadow-sm" 
                                 style="max-height: 500px; width: 100%; object-fit: cover;"
                                 onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                    
                    ${tags.length > 0 ? `
                        <div class="post-tags mb-4">
                            ${tags.map(tag => `<span class="badge bg-primary me-2 mb-2">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="post-stats text-muted">
                        <span class="me-4">
                            <i class="fas fa-comments me-1"></i>
                            ${_count?.comments || 0} comment${(_count?.comments || 0) !== 1 ? 's' : ''}
                        </span>
                        <span>
                            <i class="fas fa-heart me-1"></i>
                            ${_count?.reactions || 0} reaction${(_count?.reactions || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainPost').innerHTML = postHTML;
        document.title = `${title} - SocialFlow`;
    }
    
    /**
     * Render comments
     */
    renderComments() {
        const comments = this.currentPost.comments || [];
        const commentsList = document.getElementById('commentsList');
        const noComments = document.getElementById('noComments');
        const commentCount = document.getElementById('commentCount');
        
        commentCount.textContent = `(${comments.length})`;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '';
            noComments.classList.remove('d-none');
            return;
        }
        
        noComments.classList.add('d-none');
        
        const commentsHTML = comments.map(comment => `
            <div class="comment mb-4 pb-4 border-bottom">
                <div class="d-flex">
                    <img src="${comment.author?.avatar?.url || 'https://via.placeholder.com/40'}" 
                         alt="${comment.author?.name || 'User'}"
                         onerror="this.src='https://via.placeholder.com/40'"
                         class="rounded-circle me-3"
                         style="width: 40px; height: 40px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${comment.author?.name || 'Anonymous'}</h6>
                                <small class="text-muted">${formatDate(comment.created)}</small>
                            </div>
                        </div>
                        <p class="mt-2 mb-0" style="white-space: pre-wrap;">${comment.body}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        commentsList.innerHTML = commentsHTML;
    }
    
    /**
     * Handle comment submission
     */
    async handleSubmitComment() {
        const commentText = document.getElementById('commentText');
        const comment = commentText.value.trim();
        
        if (!comment) {
            showAlert('Please enter a comment', 'warning');
            return;
        }
        
        if (!this.authService.isAuthenticated()) {
            showAlert('Please log in to comment', 'warning');
            return;
        }
        
        try {
            showLoading(true);
            
            // Note: This assumes there's a comment endpoint. 
            // You might need to implement this in your PostsService
            showAlert('Comment feature coming soon!', 'info');
            
            // For now, just clear the form
            commentText.value = '';
            this.updateCharacterCount(commentText);
            
        } catch (error) {
            showAlert('Failed to post comment: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Update character count for comment textarea
     */
    updateCharacterCount(textarea) {
        const remaining = 280 - textarea.value.length;
        document.getElementById('commentCharCount').textContent = remaining;
    }
    
    /**
     * Handle logout
     */
    handleLogout() {
        this.authService.logout();
        this.currentUser = null;
        this.updateAuthUI(false);
        showAlert('Logged out successfully', 'info');
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    /**
     * Show the main content
     */
    showContent() {
        document.getElementById('loadingSpinner').classList.add('d-none');
        document.getElementById('errorMessage').classList.add('d-none');
        document.getElementById('backButton').classList.remove('d-none');
        document.getElementById('postContainer').classList.remove('d-none');
    }
    
    /**
     * Show error message
     */
    showError(message) {
        document.getElementById('loadingSpinner').classList.add('d-none');
        document.getElementById('postContainer').classList.add('d-none');
        document.getElementById('backButton').classList.add('d-none');
        
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.querySelector('p').textContent = message;
        errorDiv.classList.remove('d-none');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PostPage();
}); 