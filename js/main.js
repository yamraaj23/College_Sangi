// ==========================================================================
// College Sangi - Central Application Entry Point & Orchestrator
// ==========================================================================

// Global initialization of password toggles and filter listeners
        function setupFilterListeners() {
            // Forum filters (buttons)
            document.querySelectorAll('.forum-filters .filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.forum-filters .filter-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    this.classList.add('active');
                    appState.currentForumFilter = this.getAttribute('data-course');
                    
                    // Clear text inputs when using button filter
                    const courseInput = document.getElementById('forumCourseInput');
                    if (courseInput) {
                        courseInput.value = '';
                    }
                    
                    renderForumPosts();
                });
            });
            
            // Marketplace category buttons removed; no JS listeners necessary
        }


        function setupEventListeners() {
            // Restore remembered email if it exists
            const rememberedEmail = localStorage.getItem('collegeSangiRememberedEmail');
            if (rememberedEmail) {
                const emailInput = document.getElementById('email');
                const rememberCheckbox = document.getElementById('remember');
                if (emailInput && rememberCheckbox) {
                    emailInput.value = rememberedEmail;
                    rememberCheckbox.checked = true;
                }
            }
            
            // Login form
            loginForm.addEventListener('submit', handleLogin);
            
            // Signup dialog
            showSignupLink.addEventListener('click', showSignupDialog);
            
            // Privacy Policy link in signup dialog
            const signupDialogPrivacyLink = document.getElementById('signupDialogPrivacyLink');
            if (signupDialogPrivacyLink) {
                signupDialogPrivacyLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('signupPrivacyModal').classList.add('active');
                });
            }
            
            // Terms of Service link in signup dialog
            const signupDialogTermsLink = document.getElementById('signupDialogTermsLink');
            if (signupDialogTermsLink) {
                signupDialogTermsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('signupTermsModal').classList.add('active');
                });
            }
            
            // Close signup privacy modal
            const closeSignupPrivacy = document.getElementById('closeSignupPrivacy');
            if (closeSignupPrivacy) {
                closeSignupPrivacy.addEventListener('click', () => {
                    document.getElementById('signupPrivacyModal').classList.remove('active');
                });
            }
            
            // Accept signup privacy modal
            const acceptSignupPrivacy = document.getElementById('acceptSignupPrivacy');
            if (acceptSignupPrivacy) {
                acceptSignupPrivacy.addEventListener('click', () => {
                    document.getElementById('signupPrivacyModal').classList.remove('active');
                });
            }
            
            // Close signup terms modal
            const closeSignupTerms = document.getElementById('closeSignupTerms');
            if (closeSignupTerms) {
                closeSignupTerms.addEventListener('click', () => {
                    document.getElementById('signupTermsModal').classList.remove('active');
                });
            }
            
            // Accept signup terms modal
            const acceptSignupTerms = document.getElementById('acceptSignupTerms');
            if (acceptSignupTerms) {
                acceptSignupTerms.addEventListener('click', () => {
                    document.getElementById('signupTermsModal').classList.remove('active');
                });
            }
            
            // Signup dialog buttons
            const closeSignupDialog = document.getElementById('closeSignupDialog');
            const cancelSignup = document.getElementById('cancelSignup');
            const signupDialogForm = document.getElementById('signupDialogForm');
            const dialogPassword = document.getElementById('dialogPassword');
            
            if (closeSignupDialog) {
                closeSignupDialog.addEventListener('click', hideSignupDialog);
            }
            
            if (cancelSignup) {
                cancelSignup.addEventListener('click', hideSignupDialog);
            }
            
            if (signupDialogForm) {
                signupDialogForm.addEventListener('submit', handleDialogSignup);
            }
            
            if (dialogPassword) {
                dialogPassword.addEventListener('input', checkDialogPasswordStrength);
            }
            
            // Social login buttons
            if (googleLoginBtn) {
                googleLoginBtn.addEventListener('click', handleGoogleLogin);
            }
            if (facebookLoginBtn) {
                facebookLoginBtn.addEventListener('click', handleFacebookLogin);
            }
            
            // Logout button - Get fresh reference after HTML components are loaded
            const logoutBtnElement = document.getElementById('logoutBtn');
            if (logoutBtnElement) {
                logoutBtnElement.addEventListener('click', handleLogout);
            }

            // Also use delegated handling in case the header button is replaced dynamically
            document.body.addEventListener('click', function(event) {
                if (event.target.closest('#logoutBtn')) {
                    handleLogout();
                }
            });
            
            // Profile navigation - Get fresh reference after HTML components are loaded
            const profileLinkElement = document.getElementById('profileLink');
            if (profileLinkElement) {
                profileLinkElement.addEventListener('click', showMyProfile);
            }
            if (backToHomeBtn) {
                backToHomeBtn.addEventListener('click', showHomePage);
            }
            // Edit profile button opens settings tab
            if (editProfileBtn) {
                editProfileBtn.addEventListener('click', () => {
                    showMyProfile();
                    // Activate settings tab
                    document.querySelectorAll('.profile-tab').forEach(tab => tab.classList.remove('active'));
                    const settingsTab = document.querySelector('.profile-tab[data-tab="settings"]');
                    if (settingsTab) settingsTab.classList.add('active');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    const settingsContent = document.getElementById('settingsTab');
                    if (settingsContent) settingsContent.classList.add('active');
                });
            }

            // Avatar upload handling
            const avatarUploadBtnEl = document.getElementById('avatarUploadBtn');
            const avatarFileInput = document.getElementById('avatarFileInput');
            if (avatarUploadBtnEl && avatarFileInput) {
                avatarUploadBtnEl.addEventListener('click', () => avatarFileInput.click());
                avatarFileInput.addEventListener('change', function() {
                    const file = this.files[0];
                    if (!file) return;
                    // Basic size check (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('Avatar must be smaller than 5MB', 'error');
                        this.value = '';
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const dataUrl = e.target.result;
                        if (appState.currentUser) {
                            appState.currentUser.avatar = dataUrl;
                            // update users array
                            const idx = appState.users.findIndex(u => u.id === appState.currentUser.id);
                            if (idx !== -1) appState.users[idx] = appState.currentUser;
                            localStorage.setItem('collegeSangiUser', JSON.stringify(appState.currentUser));
                            localStorage.setItem('collegeSangiUsers', JSON.stringify(appState.users));
                            saveUsersToStorage();
                            updateProfilePage();
                            showToast('Avatar updated');
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Subscribe form handling
            const subscribeForm = document.getElementById('subscribeForm');
            const subscribeEmail = document.getElementById('subscribeEmail');
            if (subscribeForm && subscribeEmail) {
                subscribeForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = subscribeEmail.value.trim().toLowerCase();
                    if (!email) {
                        showToast('Please enter your email', 'error');
                        return;
                    }
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        showToast('Please enter a valid email address', 'error');
                        return;
                    }

                    // Load existing subscribers
                    let subs = [];
                    try {
                        subs = JSON.parse(localStorage.getItem('collegeSangiSubscribers') || '[]');
                    } catch (err) {
                        subs = [];
                    }

                    // Check duplicate
                    if (subs.find(s => s.email === email)) {
                        showToast('This email is already subscribed', 'info');
                        subscribeForm.reset();
                        return;
                    }

                    const newSub = { email: email, date: new Date().toISOString() };
                    subs.push(newSub);
                    localStorage.setItem('collegeSangiSubscribers', JSON.stringify(subs));

                    showToast('Subscribed successfully!');
                    subscribeForm.reset();
                });
            }
            
            // Notification sound toggle in settings
            const notificationSoundToggle = document.getElementById('notificationSoundToggle');
            if (notificationSoundToggle) {
                // Set initial state from appState
                notificationSoundToggle.checked = appState.notificationSoundEnabled;
                notificationSoundToggle.addEventListener('change', function() {
                    appState.notificationSoundEnabled = this.checked;
                    localStorage.setItem('collegeSangiNotificationSound', this.checked);
                    showToast(this.checked ? 'Notification sound enabled' : 'Notification sound disabled');
                });
            }
            
            // Initialize OAuth
            initializeOAuth();
            
            // Page navigation
            setupPageNavigation();
            
            // Mobile menu
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const nav = document.querySelector('nav');

            function closeMobileNav() {
                if (nav && nav.classList.contains('active')) nav.classList.remove('active');
            }

            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    if (!nav) return;
                    nav.classList.toggle('active');
                });
            }

            // Close when clicking any nav link (mobile)
            if (nav) {
                nav.addEventListener('click', (ev) => {
                    const a = ev.target.closest && ev.target.closest('a');
                    if (a) {
                        // Close shortly after click to allow navigation handlers
                        setTimeout(() => closeMobileNav(), 50);
                    }
                });
            }

            // Close when clicking outside nav or mobile button
            document.addEventListener('click', (ev) => {
                const insideNav = ev.target.closest && ev.target.closest('nav');
                const isBtn = ev.target.closest && ev.target.closest('.mobile-menu-btn');
                if (!insideNav && !isBtn) closeMobileNav();
            });

            // Close on Escape key
            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') closeMobileNav();
            });
            
            // Get started button (removed from DOM)

            // Make usernames clickable across the app: open that user's profile
            document.addEventListener('click', function(e) {
                const el = e.target.closest && e.target.closest('.profile-link');
                if (!el) return;
                e.preventDefault();

                // Prefer data-author attribute (used throughout templates), fallback to text
                const author = el.getAttribute('data-author') || el.textContent.trim();

                // Try to find matching user by full name, email or username
                let user = (appState.users || []).find(u => {
                    const full = `${u.firstName} ${u.lastName}`.trim();
                    return full === author || u.email === author || (u.username && u.username === author);
                });

                // Fallback: match by first name inclusion (useful for org/short names)
                if (!user) {
                    user = (appState.users || []).find(u => author.includes(u.firstName));
                }

                if (user) {
                    appState.viewingProfile = user;
                    showProfilePage();
                } else {
                    showToast('User profile not found', 'info');
                }
            });
            
            // Download App button (removed from DOM)
            
            // Settings form
            if (settingsForm) {
                settingsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    saveSettings();
                });
            }
            
            // Cancel settings button
            if (cancelSettings) {
                cancelSettings.addEventListener('click', () => {
                    // Switch back to info tab
                    document.querySelectorAll('.profile-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    document.querySelector('.profile-tab[data-tab="info"]').classList.add('active');
                    
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById('infoTab').classList.add('active');
                });
            }
            
            // Delete profile button
            // Delete Profile Modal functionality
            console.log('Initializing delete profile modal...');
            const deleteProfileBtn = document.getElementById('deleteProfileBtn');
            const deleteProfileModal = document.getElementById('deleteProfileModal');
            const deleteEmailInput = document.getElementById('deleteEmailInput');
            const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
            const deleteCancelBtn = document.getElementById('deleteCancelBtn');
            
            console.log('Delete modal elements:', {
                deleteProfileBtn: !!deleteProfileBtn,
                deleteProfileModal: !!deleteProfileModal,
                deleteEmailInput: !!deleteEmailInput,
                deleteConfirmBtn: !!deleteConfirmBtn,
                deleteCancelBtn: !!deleteCancelBtn
            });

            if (deleteProfileBtn && deleteProfileModal && deleteEmailInput && deleteConfirmBtn && deleteCancelBtn) {
                // Open modal on button click
                deleteProfileBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Delete button clicked, opening modal');
                    console.log('Current user:', appState.currentUser);
                    deleteProfileModal.classList.add('active');
                    deleteEmailInput.value = '';
                    deleteConfirmBtn.disabled = true;
                    deleteEmailInput.focus();
                });

                // Enable/disable confirm button based on email input
                deleteEmailInput.addEventListener('input', () => {
                    const enteredEmail = deleteEmailInput.value.trim().toLowerCase();
                    const userEmail = (appState.currentUser && appState.currentUser.email ? appState.currentUser.email : '').toLowerCase();
                    const emailMatch = enteredEmail === userEmail;
                    deleteConfirmBtn.disabled = !emailMatch;
                    console.log('Email input changed:', {
                        entered: enteredEmail,
                        expected: userEmail,
                        match: emailMatch,
                        buttonDisabled: deleteConfirmBtn.disabled
                    });
                });

                // Cancel button - close modal
                deleteCancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Cancel button clicked');
                    deleteProfileModal.classList.remove('active');
                    deleteEmailInput.value = '';
                    deleteConfirmBtn.disabled = true;
                });

                // Confirm delete - show final confirmation dialog
                deleteConfirmBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const enteredEmail = deleteEmailInput.value.trim().toLowerCase();
                    const userEmail = (appState.currentUser && appState.currentUser.email ? appState.currentUser.email : '').toLowerCase();
                    
                    console.log('Confirm clicked:', {
                        entered: enteredEmail,
                        expected: userEmail,
                        match: enteredEmail === userEmail
                    });
                    
                    if (enteredEmail === userEmail) {
                        console.log('Email verified, showing final confirmation...');
                        // Show final confirmation dialog
                        const finalDeleteConfirmDialog = document.getElementById('finalDeleteConfirmDialog');
                        if (finalDeleteConfirmDialog) {
                            finalDeleteConfirmDialog.classList.add('active');
                        }
                    } else {
                        showToast('Email does not match. Please try again.', 'error');
                    }
                });

                // Final confirmation dialog event listeners
                const finalDeleteConfirmDialog = document.getElementById('finalDeleteConfirmDialog');
                const finalDeleteCancelBtn = document.getElementById('finalDeleteCancelBtn');
                const finalDeleteConfirmBtn = document.getElementById('finalDeleteConfirmBtn');

                if (finalDeleteCancelBtn) {
                    finalDeleteCancelBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('Final delete cancelled');
                        finalDeleteConfirmDialog.classList.remove('active');
                    });
                }

                if (finalDeleteConfirmBtn) {
                    finalDeleteConfirmBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('Final confirmation - deleting user profile...');
                        finalDeleteConfirmDialog.classList.remove('active');
                        deleteUserProfile();
                    });
                }

                // Close final dialog when clicking outside
                if (finalDeleteConfirmDialog) {
                    finalDeleteConfirmDialog.addEventListener('click', (e) => {
                        if (e.target === finalDeleteConfirmDialog) {
                            console.log('Closing final confirm dialog by clicking outside');
                            finalDeleteConfirmDialog.classList.remove('active');
                        }
                    });
                }

                // Close modal when clicking outside of it
                deleteProfileModal.addEventListener('click', (e) => {
                    if (e.target === deleteProfileModal) {
                        console.log('Closing modal by clicking outside');
                        deleteProfileModal.classList.remove('active');
                        deleteEmailInput.value = '';
                        deleteConfirmBtn.disabled = true;
                    }
                });
            } else {
                console.warn('Delete profile modal elements not found:', {
                    deleteProfileBtn: !!deleteProfileBtn,
                    deleteProfileModal: !!deleteProfileModal,
                    deleteEmailInput: !!deleteEmailInput,
                    deleteConfirmBtn: !!deleteConfirmBtn,
                    deleteCancelBtn: !!deleteCancelBtn
                });
            }
            
            // Notification bell - Fetch dynamically
            const notificationBellEl = document.getElementById('notificationBell');
            if (notificationBellEl) {
                notificationBellEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleNotificationDropdown();
                });
            }
            
            // Notification dropdown buttons - Fetch dynamically
            const markAllReadBtnEl = document.getElementById('markAllRead');
            if (markAllReadBtnEl) {
                markAllReadBtnEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    markAllNotificationsAsRead();
                });
            }
            
            const viewAllNotificationsBtnEl = document.getElementById('viewAllNotifications');
            if (viewAllNotificationsBtnEl) {
                viewAllNotificationsBtnEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showToast('View all notifications feature would show here', 'info');
                });
            }
            
            const clearAllNotificationsBtnEl = document.getElementById('clearAllNotifications');
            if (clearAllNotificationsBtnEl) {
                clearAllNotificationsBtnEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    clearAllNotifications();
                });
            }
            
            // Close notification dropdown when clicking outside
            document.addEventListener('click', function(e) {
                const dropdown = document.getElementById('notificationDropdown');
                const bell = document.getElementById('notificationBell');
                
                if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                    dropdown.classList.remove('show');
                    setTimeout(() => {
                        dropdown.style.display = 'none';
                    }, 200);
                }
            });
            
            // NEW: Privacy Policy link
            const privacyPolicyLink = document.getElementById('privacyPolicyLink');
            if (privacyPolicyLink) {
                privacyPolicyLink.addEventListener('click', showPrivacyPolicyPage);
            }
            
            // NEW: Privacy Policy back button
            const privacyBackBtn = document.getElementById('privacyBackBtn');
            if (privacyBackBtn) {
                privacyBackBtn.addEventListener('click', goBackFromPrivacy);
            }
            
            // NEW: Privacy Policy link in signup dialog
            const dialogPrivacyLink = document.getElementById('dialogPrivacyLink');
            if (dialogPrivacyLink) {
                dialogPrivacyLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideSignupDialog();
                    showPrivacyPolicyPage(e);
                });
            }
            
            // NEW: Community Guidelines link in footer
            const communityGuidelinesLink = document.getElementById('communityGuidelinesLink');
            if (communityGuidelinesLink) {
                communityGuidelinesLink.addEventListener('click', showCommunityGuidelinesPage);
            }
            
            // NEW: Community Guidelines back button
            const guidelinesBackBtn = document.getElementById('guidelinesBackBtn');
            if (guidelinesBackBtn) {
                guidelinesBackBtn.addEventListener('click', goBackFromGuidelines);
            }
            
            // NEW: Terms of Service link in footer
            const termsOfServiceLink = document.getElementById('termsOfServiceLink');
            if (termsOfServiceLink) {
                termsOfServiceLink.addEventListener('click', showTermsOfServicePage);
            }
            
            // NEW: Terms of Service back button
            const termsBackBtn = document.getElementById('termsBackBtn');
            if (termsBackBtn) {
                termsBackBtn.addEventListener('click', goBackFromTerms);
            }
            
            // NEW: Help Center link in footer
            const helpCenterLink = document.getElementById('helpCenterLink');
            if (helpCenterLink) {
                helpCenterLink.addEventListener('click', showHelpCenterPage);
            }
            
            // NEW: Help Center back button
            const helpBackBtn = document.getElementById('helpBackBtn');
            if (helpBackBtn) {
                helpBackBtn.addEventListener('click', goBackFromHelp);
            }

            // NEW: Contact Us link and back button
            const contactUsLink = document.getElementById('contactUsLink');
            if (contactUsLink) {
                contactUsLink.addEventListener('click', showContactUsPage);
            }

            const contactBackBtn = document.getElementById('contactBackBtn');
            if (contactBackBtn) {
                contactBackBtn.addEventListener('click', goBackFromContact);
            }

            // Contact form interactivity
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactFormSubmit);
                
                // Character counter for message
                const messageInput = document.getElementById('contactMessage');
                if (messageInput) {
                    messageInput.addEventListener('input', function() {
                        const count = this.value.length;
                        document.getElementById('charCount').textContent = Math.min(count, 1000);
                    });
                }
            }

            // Contact Us page link shortcuts
            const contactToHelpLink = document.getElementById('contactToHelpLink');
            if (contactToHelpLink) {
                contactToHelpLink.addEventListener('click', showHelpCenterPage);
            }

            const contactToPrivacyLink = document.getElementById('contactToPrivacyLink');
            if (contactToPrivacyLink) {
                contactToPrivacyLink.addEventListener('click', showPrivacyPolicyPage);
            }
            
            // NEW: Dialog setups
            setupAddPostDialog();
            setupAddTextbookDialog();
            setupAddEventDialog();
            setupUploadQuestionDialog();
            setupUploadMaterialDialog();
        }

        // Function to update the active navigation link


        window.addEventListener('resize', function() {
            const activeLink = document.querySelector('header nav a.active');
            if (activeLink) {
                updateNavIndicator(activeLink);
            }
        });

        // Initialize the application
        document.addEventListener('DOMContentLoaded', async function() {
            // Load HTML components first
            await loadHTMLComponents();
            
            // Load app state from server
            console.log('📡 Loading app state from server...');
            await loadAppStateFromServer();
            console.log('✅ App state loaded from server');
            
            // Check if user is already logged in
            const isLoggedIn = localStorage.getItem('collegeSangiLoggedIn');
            const savedUser = localStorage.getItem('collegeSangiUser');
            
            if (isLoggedIn === 'true' && savedUser) {
                appState.currentUser = JSON.parse(savedUser);
                showMainWebsite();
                console.log('📊 Rendering app data...');
                loadAppData();
                console.log('✅ App data rendered');
                updateProfilePage();
                updateUnreadCounts();
                
                // Determine initial page: URL takes priority over localStorage for direct access
                let initialPage = 'home';
                const path = window.location.pathname;
                if (path === '/forum') {
                    initialPage = 'forum';
                } else if (path === '/marketplace') {
                    initialPage = 'marketplace';
                } else if (path === '/events') {
                    initialPage = 'events';
                } else if (path === '/materials') {
                    initialPage = 'materials';
                } else if (path === '/question-bank' || path === '/questionBank') {
                    initialPage = 'questionBank';
                } else if (path === '/profile') {
                    initialPage = 'profile';
                } else {
                    // Use localStorage if URL doesn't specify a page
                    const lastPage = localStorage.getItem('collegeSangiCurrentPage');
                    if (lastPage && lastPage !== 'home') {
                        initialPage = lastPage;
                    }
                }
                
                // Navigate to the determined initial page
                if (initialPage === 'profile') {
                    console.log('👤 Restoring profile page');
                    showProfilePage();
                } else if (initialPage !== 'home') {
                    console.log('📄 Showing initial page:', initialPage);
                    showPage(initialPage);
                    updateActiveNavLink(initialPage);
                } else {
                    console.log('🏠 Showing home page');
                    showPage('home');
                    updateActiveNavLink('home');
                }
            } else {
                // Show login page if not logged in
                showLoginPage();
            }
            
            // Set up event listeners
            setupEventListeners();

            // Set up browser navigation history management
            setupBrowserHistory();

            // ===== COMPREHENSIVE MOBILE EVENT OPTIMIZATION =====
            
            // Browser History Management
            function setupBrowserHistory() {
                // Handle browser back/forward buttons
                window.addEventListener('popstate', function(event) {
                    console.log('🔙 Browser navigation detected:', event.state);
                    if (event.state && event.state.page) {
                        navigationState.isNavigatingBack = true;
                        if (event.state.page === 'profile') {
                            showProfilePage(null, false);
                        } else {
                            showPage(event.state.page, false); // Don't update history when navigating via browser buttons
                        }
                        console.log('📄 Navigated to:', event.state.page, 'History:', navigationState.history);
                    }
                });

                // Handle direct URL navigation (e.g., /forum, /marketplace)
                function handleUrlNavigation() {
                    const path = window.location.pathname;
                    let targetPage = 'home';

                    if (path === '/forum') {
                        targetPage = 'forum';
                    } else if (path === '/marketplace') {
                        targetPage = 'marketplace';
                    } else if (path === '/events') {
                        targetPage = 'events';
                    } else if (path === '/materials') {
                        targetPage = 'materials';
                    } else if (path === '/question-bank' || path === '/questionBank') {
                        targetPage = 'questionBank';
                    } else if (path === '/profile') {
                        targetPage = 'profile';
                    }

                    // Initialize history with current page
                    navigationState.history = [targetPage];
                    navigationState.currentIndex = 0;
                    history.replaceState({ page: targetPage }, '', path);
                    console.log('🌐 URL navigation - Path:', path, 'Page:', targetPage);

                    return targetPage;
                }

                // Initialize browser history state based on current URL
                handleUrlNavigation();
            }

            // Initialize mobile-specific optimizations
            function initializeMobileOptimizations() {
                if (!mobileOptimizationState.isMobile) return;

                // 1. Touch Event Optimization
                setupTouchOptimizations();

                // 2. Scroll Performance Optimization
                setupScrollOptimizations();

                // 3. Viewport Management
                setupViewportOptimizations();

                // 4. Input Optimization
                setupInputOptimizations();

                // 5. Modal Optimization
                setupModalOptimizations();

                // 6. Memory Management
                setupMemoryOptimizations();

                console.log('✅ Mobile optimizations initialized');
            }

            // Touch Event Optimization
            function setupTouchOptimizations() {
                let touchStartX = 0;
                let touchEndX = 0;
                let touchStartTime = 0;

                document.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                    touchStartTime = Date.now();
                    mobileOptimizationState.lastTouchTime = Date.now();

                    // Add visual feedback
                    if (e.target.closest('button, a, input, [role="button"]')) {
                        e.target.closest('button, a, input, [role="button"]').classList.add('touching');
                    }
                }, { passive: true });

                document.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    const touchDuration = Date.now() - touchStartTime;

                    // Remove visual feedback
                    const touchedElement = document.querySelector('.touching');
                    if (touchedElement) {
                        touchedElement.classList.remove('touching');
                    }

                    // Detect swipe gestures (left/right)
                    const swipeThreshold = 50;
                    const diffX = touchStartX - touchEndX;

                    if (Math.abs(diffX) > swipeThreshold && touchDuration < 500) {
                        if (diffX > 0) {
                            // Swiped left
                            onSwipeLeft();
                        } else {
                            // Swiped right
                            onSwipeRight();
                        }
                    }
                }, { passive: true });

                // Prevent default touch behaviors that cause delays
                document.addEventListener('touchmove', (e) => {
                    // Allow scrolling on specific elements
                    if (!e.target.closest('[data-scroll-lock]')) {
                        // Prevent iOS rubber band effect on body
                    }
                }, { passive: true });
            }

            // Scroll Performance Optimization
            function setupScrollOptimizations() {
                let scrollTimeout;
                let isScrolling = false;

                window.addEventListener('scroll', () => {
                    isScrolling = true;
                    mobileOptimizationState.isScrolling = true;
                    
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        isScrolling = false;
                        mobileOptimizationState.isScrolling = false;
                    }, 150);
                }, { passive: true });

                // Detect scroll direction
                window.addEventListener('scroll', () => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    if (scrollTop > mobileOptimizationState.lastScrollTop) {
                        mobileOptimizationState.scrollDirection = 'down';
                    } else {
                        mobileOptimizationState.scrollDirection = 'up';
                    }
                    mobileOptimizationState.lastScrollTop = scrollTop;
                }, { passive: true });
            }

            // Viewport and Orientation Optimization
            function setupViewportOptimizations() {
                // Handle orientation changes
                window.addEventListener('orientationchange', () => {
                    setTimeout(() => {
                        // Refresh layout after orientation change
                        window.scrollTo(0, 0);
                        // Trigger layout recalculation
                        document.body.style.height = window.innerHeight + 'px';
                        setTimeout(() => {
                            document.body.style.height = 'auto';
                        }, 100);
                    }, 100);
                });

                // Handle resize (for responsive adjustments)
                window.addEventListener('resize', debounce(() => {
                    // Adjust UI based on new dimensions
                    const isMobile = window.innerWidth < 768;
                    document.documentElement.setAttribute('data-viewport', isMobile ? 'mobile' : 'desktop');
                }, 250));
            }

            // Input Optimization
            function setupInputOptimizations() {
                const inputs = document.querySelectorAll('input, textarea, select');

                inputs.forEach(input => {
                    // Prevent iOS zoom on input focus
                    input.addEventListener('focus', () => {
                        // Only set font-size if not already set
                        if (!input.style.fontSize) {
                            input.style.fontSize = '16px';
                        }
                    });

                    // Auto-dismiss keyboard on Enter for single-line inputs
                    if (input.tagName === 'INPUT' && input.type !== 'submit' && input.type !== 'button') {
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' && input.type === 'text') {
                                input.blur();
                            }
                        });
                    }
                });

                // Optimize form submission
                document.querySelectorAll('form').forEach(form => {
                    form.addEventListener('submit', (e) => {
                        // Prevent multiple submissions
                        if (form.classList.contains('submitting')) {
                            e.preventDefault();
                        }
                        form.classList.add('submitting');
                        setTimeout(() => {
                            form.classList.remove('submitting');
                        }, 3000);
                    });
                });
            }

            // Modal Optimization
            function setupModalOptimizations() {
                // Prevent body scroll when modal is open
                document.querySelectorAll('[role="dialog"], .modal-content').forEach(modal => {
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.attributeName === 'class') {
                                const isActive = modal.classList.contains('active') || modal.style.display !== 'none';
                                if (isActive) {
                                    document.body.style.overflow = 'hidden';
                                    document.body.style.position = 'fixed';
                                    document.body.style.width = '100%';
                                } else {
                                    document.body.style.overflow = '';
                                    document.body.style.position = '';
                                    document.body.style.width = '';
                                }
                            }
                        });
                    });

                    observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
                });
            }

            // Memory Management
            function setupMemoryOptimizations() {
                // Clear old listeners periodically
                window.addEventListener('beforeunload', () => {
                    // Clean up resources
                    mobileOptimizationState.pendingUpdates = [];
                    if (mobileOptimizationState.scrollTimeout) {
                        clearTimeout(mobileOptimizationState.scrollTimeout);
                    }
                });

                // Detect low memory on mobile
                if (performance.memory && mobileOptimizationState.isMobile) {
                    setInterval(() => {
                        if (performance.memory.jsHeapSizeLimit) {
                            const memUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
                            if (memUsage > 0.8) {
                                console.warn('⚠️ High memory usage detected:', (memUsage * 100).toFixed(1) + '%');
                                // Trigger garbage collection by clearing old listeners
                            }
                        }
                    }, 5000);
                }
            }

            // Swipe gesture handlers
            function onSwipeLeft() {
                // Example: Move to next section or close menu
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
            }

            function onSwipeRight() {
                // Example: Open menu or go back
                // Implement based on your navigation structure
            }

            // Debounce utility
            function debounce(func, wait) {
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

            // Initialize all mobile optimizations
            initializeMobileOptimizations();

            // Performance Optimization: RequestAnimationFrame for smooth animations
            function setupAnimationOptimizations() {
                // Use RAF for scroll-related operations
                let rafId;
                window.addEventListener('scroll', () => {
                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        // Update scroll-dependent UI elements
                    });
                }, { passive: true });
            }

            setupAnimationOptimizations();

            // Mobile Performance Optimizations - Legacy
            // Debounce function for resize events
            function debounceResize(func, wait) {
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

            // Fix viewport for mobile
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                viewportMeta.setAttribute('content', 
                    'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5, user-scalable=yes');
            }

            // Optimize image loading for mobile
            if ('IntersectionObserver' in window) {
                const images = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                images.forEach(img => imageObserver.observe(img));
            }

            // Prevent iOS rubber band scrolling on specific elements
            document.addEventListener('touchmove', function(event) {
                const target = event.target;
                // Allow scroll only on specific elements
                if (target.closest('.notification-dropdown') ||
                    target.closest('.modal-content') ||
                    target.closest('.tab-content')) {
                    return;
                }
                // For other cases, let default behavior happen
            }, { passive: true });

            // Optimize form input for mobile
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    // Disable body scroll when input is focused on mobile
                    if (window.innerWidth <= 768) {
                        // This is handled by browser default behavior
                    }
                });
            });

            // Monitor performance on mobile
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > 50) {
                                // Log long tasks in development
                            }
                        }
                    });
                    // Observe long tasks (available in some browsers)
                    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
                        observer.observe({ entryTypes: ['longtask'] });
                    }
                } catch (e) {
                    // PerformanceObserver not fully supported
                }
            }

            // Optimize touch responses
            document.addEventListener('touchend', () => {
                // Re-enable hover states if needed
            }, false);

            document.addEventListener('touchstart', () => {
                // Disable hover states for touch
            }, false);

            // Reduce animation on low-end devices
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.style.setProperty('--transition', 'none');
            }
        });
    
