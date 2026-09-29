// ============================================
// College Sangi - UI Module
// ============================================
// Handles DOM manipulation and UI events

let uiState = {
    currentPage: 'home',
    modalsOpen: [],
    htmlComponentsLoaded: false
};

// Load HTML components (header, footer, pages)
async function loadHTMLComponents() {
    try {
        // Load header
        const headerRes = await fetch('html/header.html');
        if (headerRes.ok) {
            const headerHTML = await headerRes.text();
            const headerPlaceholder = document.getElementById('headerPlaceholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHTML;
            }
        }
        
        // Load footer
        const footerRes = await fetch('html/footer.html');
        if (footerRes.ok) {
            const footerHTML = await footerRes.text();
            const footerPlaceholder = document.getElementById('footerPlaceholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHTML;
            }
        }
        
        // Load all page components
        const pageMap = {
            'homePage': 'html/pages/home.html',
            'forumPage': 'html/pages/forum.html',
            'eventsPage': 'html/pages/events.html',
            'marketplacePage': 'html/pages/marketplace.html',
            'questionBankPage': 'html/pages/question-bank.html',
            'materialsPage': 'html/pages/materials.html',
            'profilePage': 'html/pages/profile.html',
            'privacyPolicyPage': 'html/pages/privacy-policy.html',
            'communityGuidelinesPage': 'html/pages/community-guidelines.html',
            'termsOfServicePage': 'html/pages/terms-of-service.html',
            'helpCenterPage': 'html/pages/help-center.html',
            'contactUsPage': 'html/pages/contact-us.html'
        };
        
        for (const [pageId, filePath] of Object.entries(pageMap)) {
            try {
                const pageRes = await fetch(filePath);
                if (pageRes.ok) {
                    const pageHTML = await pageRes.text();
                    const pageElement = document.getElementById(pageId);
                    if (pageElement) {
                        pageElement.innerHTML = pageHTML;
                    }
                }
            } catch (err) {
                console.error(`Error loading ${filePath}:`, err);
            }
        }
        
        uiState.htmlComponentsLoaded = true;
        console.log('✅ All HTML components loaded successfully');
    } catch (err) {
        console.error('Error loading HTML components:', err);
    }
}

// Note: showPage function is defined in main.js, not here
// This file only handles HTML component loading and UI state management

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        uiState.modalsOpen.push(modalId);
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        uiState.modalsOpen = uiState.modalsOpen.filter(m => m !== modalId);
    }
}
