// ============================================
// College Sangi - Home Page Controller
// ============================================

        function showHomePage(e) {
            if (e) e.preventDefault();
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'home');
            
            // Hide other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            // Show home page
            document.getElementById('homePage').classList.add('active');
            appState.viewingProfile = null;
            
            // Update navigation
            document.querySelectorAll('nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            document.querySelector('nav a[data-page="home"]').classList.add('active');
        }

        // Handle login

        function handleDownloadAppClick() {
            // First show the home page if not already there
            showPage('home');
            
            // Then scroll to the app section after a brief delay
            setTimeout(() => {
                const appSection = document.getElementById('app');
                if (appSection) {
                    appSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Add highlight class for visual feedback
                    appSection.classList.add('highlight');
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        appSection.classList.remove('highlight');
                    }, 2000);
                }
            }, 100);
        }

        // NEW: Dialog Box Functions

        // Show dialog function
