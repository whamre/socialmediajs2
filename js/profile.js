import { AuthService } from './api/auth.js';
import { ProfilesService } from './api/profiles.js';
import { PostsService } from './api/posts.js';
import { showMessage, formatDate, escapeHtml, showModal, hideModal } from './utils/ui.js';

/**
 * Profile page controller
 */
class ProfileController {
    constructor() {
        this.authService = new AuthService();
        this.profilesService = new ProfilesService();
        this.postsService = new PostsService();
        
        this.currentUsername = null;
        this.currentProfile = null;
        this.isOwnProfile = false;
        this.currentTab = 'posts';
        
        this.init();
    }

    /**
     * Initialize the profile page
     */
    async init() {
        try {
            // Check if user is authenticated
            if (!this.authService.isAuthenticated()) {
                window.location.href = 'index.html';
                return;
            }

            // Get username from URL params or use current user
            const urlParams = new URLSearchParams(window.location.search);
            this.currentUsername = urlParams.get('user') || this.authService.getCurrentUser()?.name;

            if (!this.currentUsername) {
                showMessage('Unable to load profile', 'error');
                return;
            }

            this.setupEventListeners();
            await this.loadProfile();
            
        } catch (error) {
            console.error('Error initializing profile:', error);
            showMessage('Failed to load profile', 'error');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.authService.logout();
            window.location.href = 'index.html';
        });

        // Profile tabs
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Edit profile
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.openEditModal();
        });

        // Follow/Unfollow
        document.getElementById('followBtn')?.addEventListener('click', () => {
            this.followUser();
        });

        document.getElementById('unfollowBtn')?.addEventListener('click', () => {
            this.unfollowUser();
        });

        // Edit profile modal
        document.getElementById('closeEditModal')?.addEventListener('click', () => {
            hideModal('editProfileModal');
        });

        document.getElementById('cancelEdit')?.addEventListener('click', () => {
            hideModal('editProfileModal');
        });

        document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileChanges();
        });

        // Post modal
        document.getElementById('closePostModal')?.addEventListener('click', () => {
            hideModal('postModal');
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target.id);
            }
        });
    }

    /**
     * Load profile data
     */
    async loadProfile() {
        try {
            document.getElementById('loadingOverlay').style.display = 'flex';

            // Get profile data
            this.currentProfile = await this.profilesService.getProfileByUsername(this.currentUsername);
            const profileData = this.currentProfile.data;

            // Check if this is the current user's profile
            const currentUser = this.authService.getCurrentUser();
            this.isOwnProfile = currentUser && currentUser.name === this.currentUsername;

            // Update profile header
            this.updateProfileHeader(profileData);
            
            // Load initial tab content
            await this.loadTabContent(this.currentTab);

        } catch (error) {
            console.error('Error loading profile:', error);
            showMessage('Failed to load profile', 'error');
        } finally {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
    }

    /**
     * Update profile header with data
     */
    updateProfileHeader(profile) {
        // Basic info
        document.getElementById('profileName').textContent = profile.name || 'Unknown User';
        document.getElementById('profileEmail').textContent = profile.email || '';
        document.getElementById('profileBio').textContent = profile.bio || 'No bio available';

        // Avatar
        const avatarImg = document.getElementById('profileAvatar');
        if (profile.avatar?.url) {
            avatarImg.src = profile.avatar.url;
            avatarImg.alt = profile.avatar.alt || `${profile.name}'s avatar`;
        } else {
            avatarImg.src = 'https://via.placeholder.com/150/cccccc/969696?text=No+Avatar';
        }

        // Banner
        const bannerImg = document.getElementById('bannerImage');
        const bannerContainer = document.getElementById('profileBanner');
        if (profile.banner?.url) {
            bannerImg.src = profile.banner.url;
            bannerImg.alt = profile.banner.alt || `${profile.name}'s banner`;
            bannerImg.style.display = 'block';
            bannerContainer.style.backgroundColor = 'transparent';
        } else {
            bannerImg.style.display = 'none';
            bannerContainer.style.backgroundColor = 'var(--primary-color)';
        }

        // Stats
        document.getElementById('postsCount').textContent = profile._count?.posts || 0;
        document.getElementById('followersCount').textContent = profile._count?.followers || 0;
        document.getElementById('followingCount').textContent = profile._count?.following || 0;

        // Show/hide action buttons
        this.updateActionButtons(profile);
    }

    /**
     * Update action buttons based on profile ownership and follow status
     */
    updateActionButtons(profile) {
        const editBtn = document.getElementById('editProfileBtn');
        const followBtn = document.getElementById('followBtn');
        const unfollowBtn = document.getElementById('unfollowBtn');

        if (this.isOwnProfile) {
            // Show edit button for own profile
            editBtn.style.display = 'inline-flex';
            followBtn.style.display = 'none';
            unfollowBtn.style.display = 'none';
        } else {
            // Show follow/unfollow buttons for other profiles
            editBtn.style.display = 'none';
            
            // Check if currently following this user
            const currentUser = this.authService.getCurrentUser();
            const isFollowing = profile.followers?.some(follower => follower.name === currentUser.name);
            
            if (isFollowing) {
                followBtn.style.display = 'none';
                unfollowBtn.style.display = 'inline-flex';
            } else {
                followBtn.style.display = 'inline-flex';
                unfollowBtn.style.display = 'none';
            }
        }
    }

    /**
     * Switch between profile tabs
     */
    async switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update tab buttons
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.toggle('active', tab.id === `${tabName}Tab`);
        });

        this.currentTab = tabName;
        await this.loadTabContent(tabName);
    }

    /**
     * Load content for specific tab
     */
    async loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'posts':
                    await this.loadUserPosts();
                    break;
                case 'followers':
                    await this.loadFollowers();
                    break;
                case 'following':
                    await this.loadFollowing();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            showMessage(`Failed to load ${tabName}`, 'error');
        }
    }

    /**
     * Load user posts
     */
    async loadUserPosts() {
        const container = document.getElementById('userPosts');
        const loading = document.getElementById('postsLoading');
        const noPosts = document.getElementById('noPosts');

        try {
            loading.style.display = 'block';
            container.innerHTML = '';
            noPosts.style.display = 'none';

            const response = await this.profilesService.getUserPosts(this.currentUsername);
            const posts = response.data || [];

            if (posts.length === 0) {
                noPosts.style.display = 'block';
                return;
            }

            container.innerHTML = posts.map(post => this.createPostCard(post)).join('');

            // Add click listeners to post cards
            container.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => {
                    const postId = card.dataset.postId;
                    this.openPostModal(postId);
                });
            });

        } catch (error) {
            console.error('Error loading posts:', error);
            showMessage('Failed to load posts', 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    /**
     * Load followers
     */
    async loadFollowers() {
        const container = document.getElementById('followersList');
        const loading = document.getElementById('followersLoading');
        const noFollowers = document.getElementById('noFollowers');

        try {
            loading.style.display = 'block';
            container.innerHTML = '';
            noFollowers.style.display = 'none';

            const followers = this.currentProfile.data.followers || [];

            if (followers.length === 0) {
                noFollowers.style.display = 'block';
                return;
            }

            container.innerHTML = followers.map(user => this.createUserCard(user)).join('');

        } catch (error) {
            console.error('Error loading followers:', error);
            showMessage('Failed to load followers', 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    /**
     * Load following
     */
    async loadFollowing() {
        const container = document.getElementById('followingList');
        const loading = document.getElementById('followingLoading');
        const noFollowing = document.getElementById('noFollowing');

        try {
            loading.style.display = 'block';
            container.innerHTML = '';
            noFollowing.style.display = 'none';

            const following = this.currentProfile.data.following || [];

            if (following.length === 0) {
                noFollowing.style.display = 'block';
                return;
            }

            container.innerHTML = following.map(user => this.createUserCard(user)).join('');

        } catch (error) {
            console.error('Error loading following:', error);
            showMessage('Failed to load following', 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    /**
     * Create post card HTML
     */
    createPostCard(post) {
        const mediaHtml = post.media?.url ? 
            `<img src="${escapeHtml(post.media.url)}" alt="${escapeHtml(post.media.alt || 'Post image')}" class="post-image">` : '';

        return `
            <div class="post-card" data-post-id="${post.id}">
                ${mediaHtml}
                <div class="post-content">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <p class="post-body">${escapeHtml(post.body.substring(0, 100))}${post.body.length > 100 ? '...' : ''}</p>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.created)}</span>
                        <div class="post-stats">
                            <span><i class="fas fa-heart"></i> ${post._count?.reactions || 0}</span>
                            <span><i class="fas fa-comment"></i> ${post._count?.comments || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create user card HTML
     */
    createUserCard(user) {
        const avatarUrl = user.avatar?.url || 'https://via.placeholder.com/80/cccccc/969696?text=No+Avatar';
        
        return `
            <div class="user-card" onclick="window.location.href='profile.html?user=${encodeURIComponent(user.name)}'">
                <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(user.name)}'s avatar" class="user-avatar">
                <div class="user-info">
                    <h4 class="user-name">${escapeHtml(user.name)}</h4>
                    <p class="user-bio">${escapeHtml(user.bio || 'No bio available')}</p>
                    <div class="user-stats">
                        <span>${user._count?.followers || 0} followers</span>
                        <span>${user._count?.posts || 0} posts</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Open edit profile modal
     */
    openEditModal() {
        const profile = this.currentProfile.data;
        
        // Populate form with current data
        document.getElementById('editBio').value = profile.bio || '';
        document.getElementById('editAvatarUrl').value = profile.avatar?.url || '';
        document.getElementById('editBannerUrl').value = profile.banner?.url || '';
        
        showModal('editProfileModal');
    }

    /**
     * Save profile changes
     */
    async saveProfileChanges() {
        try {
            const form = document.getElementById('editProfileForm');
            const formData = new FormData(form);
            
            const bio = formData.get('bio');
            const avatarUrl = formData.get('avatarUrl');
            const bannerUrl = formData.get('bannerUrl');
            
            const updateData = { bio };
            
            if (avatarUrl) {
                updateData.avatar = { url: avatarUrl };
            }
            
            if (bannerUrl) {
                updateData.banner = { url: bannerUrl };
            }
            
            await this.profilesService.updateProfile(this.currentUsername, updateData);
            
            hideModal('editProfileModal');
            showMessage('Profile updated successfully!', 'success');
            
            // Reload profile data
            await this.loadProfile();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage(error.message || 'Failed to update profile', 'error');
        }
    }

    /**
     * Follow user
     */
    async followUser() {
        try {
            await this.profilesService.followUser(this.currentUsername);
            showMessage(`You are now following ${this.currentUsername}!`, 'success');
            
            // Reload profile to update follow status
            await this.loadProfile();
            
        } catch (error) {
            console.error('Error following user:', error);
            showMessage(error.message || 'Failed to follow user', 'error');
        }
    }

    /**
     * Unfollow user
     */
    async unfollowUser() {
        try {
            await this.profilesService.unfollowUser(this.currentUsername);
            showMessage(`You unfollowed ${this.currentUsername}`, 'success');
            
            // Reload profile to update follow status
            await this.loadProfile();
            
        } catch (error) {
            console.error('Error unfollowing user:', error);
            showMessage(error.message || 'Failed to unfollow user', 'error');
        }
    }

    /**
     * Open post modal with post details
     */
    async openPostModal(postId) {
        try {
            const modalBody = document.getElementById('postModalBody');
            modalBody.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading post...</div>';
            
            showModal('postModal');
            
            const response = await this.postsService.getPostById(postId);
            const post = response.data;
            
            modalBody.innerHTML = this.createPostDetailHTML(post);
            
        } catch (error) {
            console.error('Error loading post:', error);
            document.getElementById('postModalBody').innerHTML = '<p class="error">Failed to load post</p>';
        }
    }

    /**
     * Create detailed post HTML for modal
     */
    createPostDetailHTML(post) {
        const mediaHtml = post.media?.url ? 
            `<img src="${escapeHtml(post.media.url)}" alt="${escapeHtml(post.media.alt || 'Post image')}" class="post-detail-image">` : '';

        const tagsHtml = post.tags?.length ? 
            `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>` : '';

        return `
            <article class="post-detail">
                <div class="post-detail-header">
                    <div class="author-info">
                        <img src="${escapeHtml(post.author?.avatar?.url || 'https://via.placeholder.com/40/cccccc/969696?text=A')}" 
                             alt="${escapeHtml(post.author?.name || 'Author')}" class="author-avatar">
                        <div>
                            <h3 class="author-name">${escapeHtml(post.author?.name || 'Unknown Author')}</h3>
                            <span class="post-date">${formatDate(post.created)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="post-detail-content">
                    <h2 class="post-detail-title">${escapeHtml(post.title)}</h2>
                    ${mediaHtml}
                    <p class="post-detail-body">${escapeHtml(post.body)}</p>
                    ${tagsHtml}
                    
                    <div class="post-detail-stats">
                        <span><i class="fas fa-heart"></i> ${post._count?.reactions || 0} reactions</span>
                        <span><i class="fas fa-comment"></i> ${post._count?.comments || 0} comments</span>
                    </div>
                </div>
            </article>
        `;
    }
}

// Initialize the profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileController();
}); 