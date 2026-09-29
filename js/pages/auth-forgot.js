// ============================================
// College Sangi - Authentication & Password Recovery
// ============================================

        // Password toggle setup: show/hide password fields
        function setupPasswordToggles() {
            document.querySelectorAll('.password-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const wrapper = btn.closest('.password-wrapper');
                    if (!wrapper) return;
                    const input = wrapper.querySelector('input[type="password"], input[type="text"]');
                    if (!input) return;
                    if (input.type === 'password') {
                        input.type = 'text';
                        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        input.type = 'password';
                        btn.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                });
            });
        }

        // run once to attach listeners for existing inputs
        setupPasswordToggles();


        // ========== FORGOT PASSWORD FUNCTIONALITY ==========
        let resetState = {
            email: null,
            code: null,
            userId: null
        };

        function openForgotPasswordModal(e) {
            e.preventDefault();
            document.getElementById('forgotPasswordModal').classList.add('active');
            resetState = {email: null, code: null, userId: null};
            showForgotStep('step1-email');
            clearForgotMessages();
        }

        function closeForgotPasswordModal() {
            document.getElementById('forgotPasswordModal').classList.remove('active');
            resetState = {email: null, code: null, userId: null};
        }

        function showForgotStep(stepId) {
            document.querySelectorAll('.forgot-password-step').forEach(s => s.classList.remove('active'));
            document.getElementById(stepId).classList.add('active');
            setupPasswordToggles(); // re-attach toggles for new password fields
        }

        function clearForgotMessages() {
            document.getElementById('forgotPasswordMsg').innerHTML = '';
        }

        function showForgotMessage(msg, type) {
            const el = document.getElementById('forgotPasswordMsg');
            el.innerHTML = `<div class="forgot-password-message ${type}">${msg}</div>`;
        }

        function goBackToStep1() {
            showForgotStep('step1-email');
            clearForgotMessages();
        }

        function goBackToStep2() {
            showForgotStep('step2-code');
            clearForgotMessages();
        }

        function handleEmailVerification() {
            const email = document.getElementById('resetEmail').value.trim();
            if (!email) {
                showForgotMessage('Please enter your email address.', 'error');
                return;
            }
            if (!email.includes('@')) {
                showForgotMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Check if user exists with this email
            const user = appState.users.find(u => u.email === email);
            if (!user) {
                showForgotMessage('No account found with this email address.', 'error');
                return;
            }

            // Generate a 4-digit code (simulate sending email)
            const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
            resetState.email = email;
            resetState.code = code;
            resetState.userId = user.id;

            // In production, send code via email; here we show it for demo
            showForgotMessage(`✓ Verification code sent to ${email}. For demo, code is: <strong>${code}</strong>`, 'success');
            
            setTimeout(() => showForgotStep('step2-code'), 1500);
        }

        function handleCodeVerification() {
            const enteredCode = document.getElementById('resetCode').value.trim();
            if (!enteredCode) {
                showForgotMessage('Please enter the verification code.', 'error');
                return;
            }
            if (enteredCode !== resetState.code) {
                showForgotMessage('Invalid code. Please try again.', 'error');
                return;
            }

            showForgotMessage('✓ Code verified!', 'success');
            setTimeout(() => showForgotStep('step3-password'), 1000);
        }

        async function handlePasswordReset() {
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmNewPassword').value;

            if (!newPass || !confirmPass) {
                showForgotMessage('Please fill in all password fields.', 'error');
                return;
            }
            if (newPass.length < 6) {
                showForgotMessage('Password must be at least 6 characters.', 'error');
                return;
            }
            if (newPass !== confirmPass) {
                showForgotMessage('Passwords do not match.', 'error');
                return;
            }
            if (!resetState.email) {
                showForgotMessage('Please verify your email first.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetState.email, newPassword: newPass })
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Password reset failed');
                }

                showForgotMessage('✓ Password reset successfully! Redirecting...', 'success');
                setTimeout(() => {
                    closeForgotPasswordModal();
                    showToast('Password has been reset. Please sign in with your new password.', 'success');
                }, 1500);
            } catch (error) {
                showForgotMessage(error.message || 'Unable to reset password. Please try again.', 'error');
            }
        }

        async function saveUsersToStorage() {
            try {
                await fetch('/api/sync/users', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.users)});
            } catch (e) { console.error(e); }
        }

        // NOTIFICATION FUNCTIONS - FIXED VERSION

        // Create a notification for post owner only (FIXED VERSION)

        function initializeOAuth() {
            // Initialize Facebook SDK
            try {
                if (typeof FB !== 'undefined') {
                    FB.init({
                        appId: 'YOUR_FACEBOOK_APP_ID',
                        xfbml: true,
                        version: 'v18.0'
                    });
                    console.log('Facebook SDK initialized');
                }
            } catch (error) {
                console.log('Facebook SDK not available (requires internet)', error.message);
            }
            
            // Initialize Google Sign-In
            try {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    google.accounts.id.initialize({
                        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                        callback: handleGoogleSignInResponse
                    });
                    console.log('Google Sign-In initialized');
                }
            } catch (error) {
                console.log('Google Sign-In not available (requires internet)', error.message);
            }
        }

        // Page navigation functionality

        async function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<div class="loading"></div> Signing In...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Invalid email or password');
                }

                const user = result.user;
                localStorage.setItem('collegeSangiLoggedIn', 'true');
                localStorage.setItem('collegeSangiUser', JSON.stringify(user));
                
                if (remember) {
                    localStorage.setItem('collegeSangiRememberedEmail', email);
                } else {
                    localStorage.removeItem('collegeSangiRememberedEmail');
                }
                
                appState.currentUser = user;
                const userIndex = appState.users.findIndex(u => String(u.id) === String(user.id));
                if (userIndex >= 0) {
                    appState.users[userIndex] = user;
                } else {
                    appState.users.push(user);
                }
                
                showMainWebsite();
                showPage('home');
                loadAppData();
                updateProfilePage();
                updateUnreadCounts();
                showToast('Login successful!');
            } catch (error) {
                showToast(error.message || 'Invalid email or password', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }

        // Show signup dialog
        function showSignupDialog(e) {
            e.preventDefault();
            document.getElementById('signupDialog').classList.add('active');
            // Initialize signup filters when dialog is shown
            setupSignupFilters();
        }

        // Hide signup dialog
        function hideSignupDialog() {
            document.getElementById('signupDialog').classList.remove('active');
            document.getElementById('signupDialogForm').reset();
            document.getElementById('dialogPasswordStrength').className = 'password-strength';
            document.getElementById('dialogPasswordHint').textContent = 'Use 8+ characters with a mix of letters, numbers & symbols';
        }

        // Check password strength for dialog
        function checkDialogPasswordStrength() {
            const password = document.getElementById('dialogPassword').value;
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength++;
            
            // Contains lowercase
            if (/[a-z]/.test(password)) strength++;
            
            // Contains uppercase
            if (/[A-Z]/.test(password)) strength++;
            
            // Contains numbers
            if (/[0-9]/.test(password)) strength++;
            
            // Contains special characters
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Update strength indicator
            const passwordStrength = document.getElementById('dialogPasswordStrength');
            const passwordHint = document.getElementById('dialogPasswordHint');
            
            passwordStrength.className = 'password-strength';
            if (password.length > 0) {
                if (strength <= 2) {
                    passwordStrength.classList.add('weak');
                    passwordHint.textContent = 'Weak password';
                } else if (strength <= 4) {
                    passwordStrength.classList.add('medium');
                    passwordHint.textContent = 'Medium strength password';
                } else {
                    passwordStrength.classList.add('strong');
                    passwordHint.textContent = 'Strong password';
                }
            } else {
                passwordHint.textContent = 'Use 8+ characters with a mix of letters, numbers & symbols';
            }
        }

        // Handle dialog signup
        function handleDialogSignup(e) {
            e.preventDefault();
            console.log('Signup form submitted');
            
            const firstName = document.getElementById('dialogFirstName').value.trim();
            const lastName = document.getElementById('dialogLastName').value.trim();
            const email = document.getElementById('dialogEmail').value.trim();
            const password = document.getElementById('dialogPassword').value;
            const confirmPassword = document.getElementById('dialogConfirmPassword').value;
            const university = document.getElementById('dialogUniversity').value.trim();
            const course = document.getElementById('dialogCourse').value.trim();
            const agreeTerms = document.getElementById('dialogAgreeTerms').checked;
            
            console.log('Form data:', { firstName, lastName, email, university, course, agreeTerms });
            
            // Validation
            if (!firstName || !lastName || !email || !password || !confirmPassword || !university || !course) {
                console.log('Validation failed: missing required fields');
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                console.log('Validation failed: passwords do not match');
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                console.log('Validation failed: password too short');
                showToast('Password must be at least 8 characters long', 'error');
                return;
            }
            
            if (!agreeTerms) {
                console.log('Validation failed: terms not agreed');
                showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('submitSignup');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<div class="loading"></div> Creating Account...';
            submitBtn.disabled = true;
            
            // Register new user via API with encrypted password
            const registrationData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                university: university,
                course: course,
                joinDate: new Date().toISOString().split('T')[0],
                location: '',
                bio: '',
                mobile: '',
                whatsapp: '',
                contactPublic: false,
                authProvider: 'email'
            };
            
            console.log('Sending registration request...');
            
            // Use the secure /api/register endpoint
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            })
            .then(res => {
                console.log('API response status:', res.status);
                if (!res.ok) {
                    return res.json().then(data => {
                        console.error('API error:', data);
                        throw new Error(data.error || `HTTP ${res.status}: Registration failed`);
                    });
                }
                return res.json();
            })
            .then(result => {
                console.log('Registration result:', result);
                if (result.success && result.user) {
                    const newUser = result.user;
                    console.log('Account created successfully:', newUser.email);
                    
                    // Add to users array (without password)
                    appState.users.push(newUser);
                    
                    // Store login state - DO NOT STORE PASSWORD
                    localStorage.setItem('collegeSangiLoggedIn', 'true');
                    localStorage.setItem('collegeSangiUser', JSON.stringify(newUser));
                    
                    appState.currentUser = newUser;
                    
                    // Hide dialog
                    hideSignupDialog();
                    
                    // Show main website and navigate to home page
                    showMainWebsite();
                    showPage('home');
                    loadAppData();
                    updateProfilePage();
                    updateUnreadCounts();
                    
                    showToast('Account created successfully!');
                    
                    // Reset button
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                } else {
                    console.error('Registration failed:', result);
                    throw new Error(result.error || 'Failed to create account');
                }
            })
            .catch(err => {
                console.error('Signup error:', err);
                showToast(err.message || 'Failed to create account. Please try again.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        }

        // Handle logout
        function handleLogout() {
            localStorage.removeItem('collegeSangiLoggedIn');
            localStorage.removeItem('collegeSangiUser');
            appState.currentUser = null;
            appState.viewingProfile = null;
            showLoginPage();
            showToast('You have been logged out');
        }

        // Show main website
        function showMainWebsite() {
            loginPage.classList.remove('show');
            mainWebsite.classList.add('active');
            initializeNotifications(); // Initialize notifications when user logs in
        }

        // Show login page
        function showLoginPage() {
            loginPage.classList.add('show');
            mainWebsite.classList.remove('active');
            loginForm.reset();
        }

        // NEW: Edit and Delete Functionality for Posts

        function setupSignupFilters() {
            setupFilterDropdown('dialogUniversity', 'dialogUniversityDropdown', allUniversities);
            setupFilterDropdown('dialogCourse', 'dialogCourseDropdown', allCourses);
            
            // Add event listener for university change to update courses
            const dialogUniversity = document.getElementById('dialogUniversity');
            if (dialogUniversity) {
                dialogUniversity.addEventListener('change', () => {
                    updateCoursesForUniversity('dialogUniversity', 'dialogCourse', 'dialogCourseDropdown');
                });
            }
        }

        // Helper function to get courses for a specific university

        function handleGoogleLogin() {
            googleLoginBtn.classList.add('loading');
            googleLoginBtn.disabled = true;
            
            try {
                // Initialize Google Sign-In if not already done
                if (typeof google !== 'undefined' && google.accounts) {
                    google.accounts.id.initialize({
                        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                        callback: handleGoogleSignInResponse
                    });
                    
                    google.accounts.id.renderButton(
                        document.querySelector('.google-signin-container'),
                        { theme: 'outline', size: 'large', text: 'signin_with' }
                    );
                } else {
                    // Fallback: Direct credential flow
                    const credential = prompt('Enter your Google account email:');
                    if (credential) {
                        // Create a mock Google user for testing
                        handleGoogleCredential(credential);
                    }
                }
            } catch (error) {
                showToast('Google login is not available. Please check your internet connection.', 'error');
                googleLoginBtn.classList.remove('loading');
                googleLoginBtn.disabled = false;
            }
        }
        
        // Handle Google Sign-In Response
        function handleGoogleSignInResponse(response) {
            try {
                // Decode JWT token to get user info
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const tokenPayload = JSON.parse(jsonPayload);
                
                const googleUser = {
                    id: 'google_' + tokenPayload.sub,
                    firstName: tokenPayload.given_name || 'User',
                    lastName: tokenPayload.family_name || 'Google',
                    email: tokenPayload.email,
                    picture: tokenPayload.picture,
                    university: '',
                    course: '',
                    role: 'student',
                    authProvider: 'google',
                    joinedAt: new Date().toISOString(),
                    profileComplete: false
                };
                
                processSocialLogin(googleUser);
                googleLoginBtn.classList.remove('loading');
                googleLoginBtn.disabled = false;
            } catch (error) {
                console.error('Google login error:', error);
                showToast('Failed to process Google login', 'error');
                googleLoginBtn.classList.remove('loading');
                googleLoginBtn.disabled = false;
            }
        }
        
        // Handle Google credential (for testing/fallback)
        function handleGoogleCredential(email) {
            const [firstName, ...lastNameParts] = email.split('@')[0].split('.');
            const googleUser = {
                id: 'google_' + Date.now(),
                firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
                lastName: lastNameParts.join(' ') || 'User',
                email: email,
                university: '',
                course: '',
                role: 'student',
                authProvider: 'google',
                joinedAt: new Date().toISOString(),
                profileComplete: false
            };
            processSocialLogin(googleUser);
        }

        // Handle Facebook Login with real OAuth
        function handleFacebookLogin() {
            facebookLoginBtn.classList.add('loading');
            facebookLoginBtn.disabled = true;
            
            try {
                // Initialize Facebook SDK if not already done
                if (typeof FB !== 'undefined') {
                    FB.login(function(response) {
                        if (response.authResponse) {
                            // Get user profile info
                            FB.api('/me?fields=id,first_name,last_name,email,picture', function(userInfo) {
                                const facebookUser = {
                                    id: 'facebook_' + userInfo.id,
                                    firstName: userInfo.first_name || 'User',
                                    lastName: userInfo.last_name || 'Facebook',
                                    email: userInfo.email || `facebook.${userInfo.id}@facebook.com`,
                                    picture: userInfo.picture.data.url,
                                    university: '',
                                    course: '',
                                    role: 'student',
                                    authProvider: 'facebook',
                                    joinedAt: new Date().toISOString(),
                                    profileComplete: false
                                };
                                
                                processSocialLogin(facebookUser);
                                facebookLoginBtn.classList.remove('loading');
                                facebookLoginBtn.disabled = false;
                            });
                        } else {
                            showToast('Facebook login cancelled', 'info');
                            facebookLoginBtn.classList.remove('loading');
                            facebookLoginBtn.disabled = false;
                        }
                    }, {scope: 'public_profile,email'});
                } else {
                    // Fallback: manual email input
                    const email = prompt('Enter your Facebook email:');
                    if (email) {
                        const [firstName, ...lastNameParts] = email.split('@')[0].split('.');
                        const facebookUser = {
                            id: 'facebook_' + Date.now(),
                            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
                            lastName: lastNameParts.join(' ') || 'User',
                            email: email,
                            university: '',
                            course: '',
                            role: 'student',
                            authProvider: 'facebook',
                            joinedAt: new Date().toISOString(),
                            profileComplete: false
                        };
                        processSocialLogin(facebookUser);
                    }
                    facebookLoginBtn.classList.remove('loading');
                    facebookLoginBtn.disabled = false;
                }
            } catch (error) {
                console.error('Facebook login error:', error);
                showToast('Facebook login is not available', 'error');
                facebookLoginBtn.classList.remove('loading');
                facebookLoginBtn.disabled = false;
            }
        }

        // Process Social Login
        function processSocialLogin(socialUser) {
            // Check if user already exists in our system
            let user = appState.users.find(u => u.email === socialUser.email);
            
            if (user) {
                // User exists, log them in
                appState.currentUser = user;
                localStorage.setItem('collegeSangiLoggedIn', 'true');
                localStorage.setItem('collegeSangiUser', JSON.stringify(user));
                
                showMainWebsite();
                showPage('home');
                loadAppData();
                updateProfilePage();
                updateUnreadCounts();
                
                showToast(`Welcome back, ${user.firstName}!`);
            } else {
                // New user, create account
                const newUser = {
                    id: socialUser.id,
                    firstName: socialUser.firstName,
                    lastName: socialUser.lastName,
                    email: socialUser.email,
                    authProvider: socialUser.authProvider,
                    university: socialUser.university || '',
                    course: socialUser.course || '',
                    joinDate: new Date().toISOString().split('T')[0],
                    location: '',
                    bio: '',
                    mobile: '',
                    whatsapp: '',
                    contactPublic: false
                };
                
                // Add to users array
                appState.users.push(newUser);
                localStorage.setItem('collegeSangiUsers', JSON.stringify(appState.users));
                
                // Log the user in
                appState.currentUser = newUser;
                localStorage.setItem('collegeSangiLoggedIn', 'true');
                localStorage.setItem('collegeSangiUser', JSON.stringify(newUser));
                
                showMainWebsite();
                showPage('home');
                loadAppData();
                updateProfilePage();
                updateUnreadCounts();
                
                showToast(`Welcome to College Sangi, ${newUser.firstName}!`);
            }
        }

        // Handle Download App Button Click
