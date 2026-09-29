// ============================================
// College Sangi - Support Page Controller
// ============================================

        function showPrivacyPolicyPage(e) {
            if (e) e.preventDefault();
            
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'privacy');
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show privacy policy page
            document.getElementById('privacyPolicyPage').classList.add('active');
            
            // Scroll the privacy policy page container to the top
            scrollActivePageToTop();
        }
        
        // NEW: Go back from privacy policy
        function goBackFromPrivacy(e) {
            if (e) e.preventDefault();
            // If signup dialog was open, show it again; otherwise go home
            if (appState.fromSignupDialog) {
                appState.fromSignupDialog = false;
                showSignupDialog();
            } else {
                showHomePage();
            }
        }
        
        // NEW: Show Community Guidelines Page
        function showCommunityGuidelinesPage(e) {
            if (e) e.preventDefault();
            
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'communityGuidelines');
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show community guidelines page
            document.getElementById('communityGuidelinesPage').classList.add('active');
            
            // Scroll the community guidelines page container to the top
            scrollActivePageToTop();
        }
        
        // NEW: Go back from community guidelines
        function goBackFromGuidelines(e) {
            if (e) e.preventDefault();
            showHomePage();
        }
        
        // NEW: Show Terms of Service Page
        function showTermsOfServicePage(e) {
            if (e) e.preventDefault();
            
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'terms');
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show terms of service page
            document.getElementById('termsOfServicePage').classList.add('active');
            
            // Scroll the terms of service page container to the top
            scrollActivePageToTop();
        }
        
        // NEW: Go back from terms of service
        function goBackFromTerms(e) {
            if (e) e.preventDefault();
            // If signup dialog was open, show it again; otherwise go home
            if (appState.fromSignupDialog) {
                appState.fromSignupDialog = false;
                showSignupDialog();
            } else {
                showHomePage();
            }
        }
        
        // NEW: Show Help Center Page
        function showHelpCenterPage(e) {
            if (e) e.preventDefault();
            
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'helpCenter');
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show help center page
            document.getElementById('helpCenterPage').classList.add('active');
            
            // Setup collapsible sections
            setupHelpCollapsibles();
            
            // Scroll the help center page container to the top
            scrollActivePageToTop();
        }
        
        // NEW: Go back from help center
        function goBackFromHelp(e) {
            if (e) e.preventDefault();
            showHomePage();
        }
        
        // NEW: Setup collapsible help sections
        function setupHelpCollapsibles() {
            const helpSubsections = document.querySelectorAll('.help-subsection h3');
            
            helpSubsections.forEach(heading => {
                heading.addEventListener('click', function() {
                    const subsection = this.parentElement;
                    subsection.classList.toggle('collapsed');
                });
            });
            
            // Collapse all initially
            document.querySelectorAll('.help-subsection').forEach(subsection => {
                subsection.classList.add('collapsed');
            });
        }

        // Contact Us Page Functions
        function showContactUsPage(e) {
            if (e) e.preventDefault();
            
            // Persist the current page so refresh restores it
            localStorage.setItem('collegeSangiCurrentPage', 'contactUs');
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show contact us page
            document.getElementById('contactUsPage').classList.add('active');
            
            // Hide messages if present
            const contactSuccessMessage = document.getElementById('contactSuccessMessage');
            const contactErrorMessage = document.getElementById('contactErrorMessage');
            if (contactSuccessMessage) {
                contactSuccessMessage.style.display = 'none';
            }
            if (contactErrorMessage) {
                contactErrorMessage.style.display = 'none';
            }
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.reset();
            }
            
            // Scroll the contact page container to the top
            scrollActivePageToTop();
        }

        function goBackFromContact(e) {
            e.preventDefault();
            showHomePage();
        }

        // Copy email to clipboard from department cards
        function copyToClipboard(email, event) {
            event.stopPropagation();
            
            // Copy to clipboard using modern Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(email).then(() => {
                    showToast('Email copied: ' + email, 'success');
                }).catch(() => {
                    // Fallback
                    fallbackCopyToClipboard(email);
                });
            } else {
                fallbackCopyToClipboard(email);
            }
        }

        // Fallback copy method for older browsers
        function fallbackCopyToClipboard(email) {
            const textarea = document.createElement('textarea');
            textarea.value = email;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Email copied: ' + email, 'success');
            } catch (err) {
                showToast('Failed to copy email', 'error');
            }
            document.body.removeChild(textarea);
        }

        // Toggle FAQ items
        function toggleFAQ(element) {
            element.classList.toggle('active');
            const content = element.querySelector('.faq-content');
            const icon = element.querySelector('.fa-chevron-down');
            
            if (element.classList.contains('active')) {
                content.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            }
        }

        // Handle contact form submission
        function handleContactFormSubmit(e) {
            e.preventDefault();
            
            const form = document.getElementById('contactForm');
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            const messageDiv = document.getElementById('contactFormMessage');
            
            // Validation
            if (!name || !email || !subject || !message) {
                messageDiv.textContent = '❌ Please fill in all required fields';
                messageDiv.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                messageDiv.style.color = '#e74c3c';
                messageDiv.style.display = 'block';
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.textContent = '❌ Please enter a valid email address';
                messageDiv.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                messageDiv.style.color = '#e74c3c';
                messageDiv.style.display = 'block';
                return;
            }
            
            // Send to server
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    // Show success message
                    messageDiv.textContent = '✅ Thank you! Your message has been sent to support@collegesangi.net. We will get back to you soon.';
                    messageDiv.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                    messageDiv.style.color = '#27ae60';
                    messageDiv.style.display = 'block';
                    
                    // Reset form
                    form.reset();
                    document.getElementById('charCount').textContent = '0';
                    
                    // Hide message after 5 seconds
                    setTimeout(() => {
                        messageDiv.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Error sending contact form:', error);
                messageDiv.textContent = '❌ Error sending message. Please try again.';
                messageDiv.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                messageDiv.style.color = '#e74c3c';
                messageDiv.style.display = 'block';
            });
        }

        function submitContactForm(e) {
            e.preventDefault();
            
            const form = document.getElementById('contactForm');
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const university = document.getElementById('contactUniversity').value.trim();
            const course = document.getElementById('contactCourse').value.trim();
            const issueType = document.getElementById('contactIssueType').value;
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            
            // Simple validation
            if (!name || !email || !university || !issueType || !subject || !message) {
                document.getElementById('contactErrorMessage').style.display = 'flex';
                document.getElementById('contactSuccessMessage').style.display = 'none';
                return false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('contactErrorMessage').style.display = 'flex';
                document.getElementById('contactSuccessMessage').style.display = 'none';
                return false;
            }
            
            // Create contact inquiry object
            const contactInquiry = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone || 'Not provided',
                university: university,
                course: course || 'Not specified',
                issueType: issueType,
                subject: subject,
                message: message,
                status: 'received',
                createdAt: new Date().toISOString(),
                response: null
            };
            
            // Save to localStorage
            let contacts = JSON.parse(localStorage.getItem('contactInquiries')) || [];
            contacts.push(contactInquiry);
            localStorage.setItem('contactInquiries', JSON.stringify(contacts));
            
            // Show success message
            document.getElementById('contactSuccessMessage').style.display = 'flex';
            document.getElementById('contactErrorMessage').style.display = 'none';
            form.reset();
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('contactSuccessMessage').style.display = 'none';
            }, 5000);
            
            return false;
        }

        // Initialize OAuth SDKs
