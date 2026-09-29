// ============================================
// College Sangi - Router & Layout Controller
// ============================================

        function setupPageNavigation() {
            console.log('🔗 Setting up page navigation');
            
            // Logo click handler - redirect to home page
            const logoLink = document.getElementById('logoLink');
            if (logoLink) {
                logoLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🏠 Clicked logo, navigating to home');
                    showPage('home');
                    updateActiveNavLink('home');
                });
            }
            
            // Method 1: Get nav links from the header
            const headerNav = document.querySelector('header nav');
            if (headerNav) {
                const navLinks = headerNav.querySelectorAll('a[data-page]');
                console.log('📍 Found header nav links:', navLinks.length);
                
                navLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const pageId = this.getAttribute('data-page');
                        console.log('🖱️ Clicked header nav link:', pageId);
                        if (pageId === 'profile') {
                            showProfilePage();
                        } else {
                            showPage(pageId);
                        }
                        
                        // Close mobile menu if open
                        if (headerNav.classList.contains('active')) {
                            headerNav.classList.remove('active');
                        }
                    });

                    link.addEventListener('mouseenter', function() {
                        updateNavIndicator(this);
                    });

                    link.addEventListener('mouseleave', function() {
                        const activeLink = headerNav.querySelector('a.active');
                        if (activeLink) {
                            updateNavIndicator(activeLink);
                        }
                    });
                });
            } else {
                console.warn('⚠️ Header nav element not found');
            }
            
            // Method 2: Also try footer links
            const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
            console.log('📍 Found footer nav links:', footerLinks.length);
            
            footerLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('data-page');
                    console.log('🖱️ Clicked footer nav link:', pageId);
                    showPage(pageId);
                });
            });
        }

        // Show specific page
        function showPage(pageId, updateHistory = true) {
            console.log('🔄 Navigating to page:', pageId, 'Update history:', updateHistory);

            // Don't update history if we're navigating back/forward via browser buttons
            if (updateHistory && !navigationState.isNavigatingBack) {
                // Add current page to history before navigating
                const currentPage = navigationState.history[navigationState.currentIndex];
                if (currentPage !== pageId) {
                    // Remove any forward history when navigating to a new page
                    navigationState.history = navigationState.history.slice(0, navigationState.currentIndex + 1);
                    navigationState.history.push(pageId);
                    navigationState.currentIndex = navigationState.history.length - 1;

                    // Update browser history
                    const url = pageId === 'home' ? '/' : `/${pageId}`;
                    history.pushState({ page: pageId }, '', url);
                    console.log('📝 Updated history - Current:', navigationState.history, 'Index:', navigationState.currentIndex);
                }
            }

            // Reset the back navigation flag
            navigationState.isNavigatingBack = false;

            // Save the current page to localStorage
            localStorage.setItem('collegeSangiCurrentPage', pageId);

            // Update active nav link
            updateActiveNavLink(pageId);

            // Hide all page contents
            const allPages = document.querySelectorAll('.page-content');
            console.log('📌 Found pages to hide:', allPages.length);
            allPages.forEach(page => {
                page.classList.remove('active');
                console.log('   Hidden:', page.id);
            });

            // Show the selected page
            let pageElement;
            switch(pageId) {
                case 'home':
                    pageElement = document.getElementById('homePage');
                    break;
                case 'forum':
                    pageElement = document.getElementById('forumPage');
                    console.log('📄 Forum page element:', pageElement);
                    renderForumPosts(); // Load forum content
                    break;
                case 'marketplace':
                    pageElement = document.getElementById('marketplacePage');
                    renderMarketplaceProducts(); // Load marketplace content
                    break;
                case 'events':
                    pageElement = document.getElementById('eventsPage');
                    renderEvents(); // Load events content
                    break;
                case 'questionBank':
                    pageElement = document.getElementById('questionBankPage');
                    renderQuestionPhotos(); // Load question bank content
                    break;
                case 'materials':
                    pageElement = document.getElementById('materialsPage');
                    renderMaterials(); // Load materials content
                    break;
                case 'app':
                    // Scroll to app section on home page
                    showPage('home');
                    setTimeout(() => {
                        document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                    return;
                case 'privacy':
                    // Special case for privacy policy - it's not in main nav
                    showPrivacyPolicyPage();
                    return;
                case 'terms':
                    // Special case for terms of service - it's not in main nav
                    showTermsOfServicePage();
                    return;
                case 'contactUs':
                    showContactUsPage();
                    return;
                case 'communityGuidelines':
                    showCommunityGuidelinesPage();
                    return;
                case 'helpCenter':
                    showHelpCenterPage();
                    return;
                default:
                    pageElement = document.getElementById('homePage');
            }
            
            if (pageElement) {
                console.log('✅ Adding active class to:', pageElement.id);
                pageElement.classList.add('active');
                // Scroll the active page container to the top
                scrollActivePageToTop();
            } else {
                console.warn('⚠️ Page element not found for:', pageId);
            }
        }

        function scrollActivePageToTop() {
            const activePage = document.querySelector('.page-content.active');
            if (activePage) {
                activePage.scrollTop = 0;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Show my profile

        function showDialog(dialogId) {
            document.getElementById(dialogId).classList.add('active');
        }

        // Hide dialog function
        function hideDialog(dialogId) {
            document.getElementById(dialogId).classList.remove('active');
        }

        // Add Post Dialog

        function updateActiveNavLink(pageId) {
            const headerNav = document.querySelector('header nav');
            if (headerNav) {
                // Remove active class from all nav links
                headerNav.querySelectorAll('a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to the matching nav link
                const activeLink = headerNav.querySelector(`a[data-page="${pageId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    updateNavIndicator(activeLink);
                    console.log('✨ Updated nav highlight to:', pageId);
                } else {
                    updateNavIndicator(null);
                }
            }
        }

        function updateNavIndicator(link) {
            const headerNav = document.querySelector('header nav');
            if (!headerNav) {
                return;
            }

            if (!link) {
                headerNav.setAttribute('data-indicator-visible', 'false');
                return;
            }

            const navRect = headerNav.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();

            headerNav.style.setProperty('--nav-indicator-left', `${linkRect.left - navRect.left}px`);
            headerNav.style.setProperty('--nav-indicator-width', `${linkRect.width}px`);
            headerNav.setAttribute('data-indicator-visible', 'true');
        }

        window.addEventListener('resize', function() {
            const activeLink = document.querySelector('header nav a.active');
            if (activeLink) {
                updateNavIndicator(activeLink);
            }
        });

        // Initialize the application
