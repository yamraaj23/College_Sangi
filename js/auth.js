// ============================================
// College Sangi - Authentication Module
// ============================================
// Handles login, signup, and authentication logic

// Authentication state
let authState = {
    isAuthenticated: false,
    currentUser: null,
    rememberMe: false
};

// Initialize authentication on page load
function initializeAuth() {
    const stored = getFromStorage('collegeSangiUser');
    if (stored) {
        authState.currentUser = stored;
        authState.isAuthenticated = true;
    }
}

// Handle login form submission
async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        // Make API call to server for authentication
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            authState.currentUser = result.user;
            authState.isAuthenticated = true;
            saveToStorage('collegeSangiUser', result.user);
            showToast('Login successful!');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Logout functionality
function handleLogout() {
    authState.isAuthenticated = false;
    authState.currentUser = null;
    localStorage.removeItem('collegeSangiUser');
    localStorage.removeItem('collegeSangiLoggedIn');
    showToast('Logged out successfully');
    setTimeout(() => location.reload(), 1000);
}
