/**
 * UI Utilities for managing user interface interactions
 */

/**
 * Show alert message to user
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alertContainer');
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Auto-remove alert after duration
    setTimeout(() => {
        if (alertElement && alertElement.parentNode) {
            alertElement.remove();
        }
    }, duration);
}

/**
 * Show loading spinner
 * @param {boolean} show - Whether to show or hide spinner
 */
export function showLoading(show = true) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

/**
 * Toggle visibility between authentication page and main app
 * @param {boolean} showAuth - Whether to show auth page or main app
 */
export function togglePageVisibility(showAuth = true) {
    const authPage = document.getElementById('authPage');
    const mainPage = document.getElementById('mainPage');
    const authNav = document.getElementById('authNav');
    const logoutNav = document.getElementById('logoutNav');
    
    if (showAuth) {
        authPage.classList.remove('d-none');
        mainPage.classList.add('d-none');
        authNav.classList.remove('d-none');
        logoutNav.classList.add('d-none');
    } else {
        authPage.classList.add('d-none');
        mainPage.classList.remove('d-none');
        authNav.classList.add('d-none');
        logoutNav.classList.remove('d-none');
    }
}

/**
 * Toggle between login and register forms
 * @param {boolean} showLogin - Whether to show login form or register form
 */
export function toggleAuthForms(showLogin = true) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (showLogin) {
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
    } else {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    }
}

/**
 * Clear form data
 * @param {string} formId - Form element ID
 */
export function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Remove validation classes
        const inputs = form.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
    }
}

/**
 * Validate form input
 * @param {HTMLElement} input - Input element
 * @param {boolean} isValid - Whether input is valid
 * @param {string} message - Validation message
 */
export function validateInput(input, isValid, message = '') {
    const feedback = input.parentNode.querySelector('.invalid-feedback') || 
                    input.parentNode.querySelector('.valid-feedback');
    
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (feedback) feedback.textContent = message;
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        if (feedback) {
            feedback.textContent = message;
        } else {
            // Create feedback element if it doesn't exist
            const feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            feedbackElement.textContent = message;
            input.parentNode.appendChild(feedbackElement);
        }
    }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 1) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 