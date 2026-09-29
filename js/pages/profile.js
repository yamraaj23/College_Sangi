// ============================================
// College Sangi - Profile Page Controller
// ============================================

        function showMyProfile(e) {
            if (e) e.preventDefault();
            appState.viewingProfile = null;
            showProfilePage();
        }

        // Show profile page
        function showProfilePage(e, updateHistory = true) {
            if (e) e.preventDefault();
            // Save profile page state to localStorage
            localStorage.setItem('collegeSangiCurrentPage', 'profile');
            // Update active nav link to highlight profile
            updateActiveNavLink('profile');
            
            // Update navigation history if not navigating back
            if (updateHistory && !navigationState.isNavigatingBack) {
                // Add current page to history before navigating
                const currentPage = navigationState.history[navigationState.currentIndex];
                if (currentPage !== 'profile') {
                    // Remove any forward history when navigating to a new page
                    navigationState.history = navigationState.history.slice(0, navigationState.currentIndex + 1);
                    navigationState.history.push('profile');
                    navigationState.currentIndex = navigationState.history.length - 1;

                    // Update browser history
                    history.pushState({ page: 'profile' }, '', '/profile');
                    console.log('📝 Updated history for profile - Current:', navigationState.history, 'Index:', navigationState.currentIndex);
                }
            }
            
            // Reset the back navigation flag
            navigationState.isNavigatingBack = false;
            
            // Hide all other pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            // Show profile page
            document.getElementById('profilePage').classList.add('active');
            updateProfilePage();
        }

        // Show home page

        function updateProfilePage() {
            const user = appState.viewingProfile || appState.currentUser;
            if (!user) return;
            
            const fullName = `${user.firstName} ${user.lastName}`;
            
            // Fetch elements dynamically
            const editProfileBtnEl = document.getElementById('editProfileBtn');
            const deleteProfileBtnEl = document.getElementById('deleteProfileBtn');
            const settingsTabBtnEl = document.getElementById('settingsTabBtn');
            const profilePageTitleEl = document.getElementById('profilePageTitle');
            
            // Update page title
            if (profilePageTitleEl) {
                if (appState.viewingProfile) {
                    profilePageTitleEl.textContent = `${user.firstName}'s Profile`;
                } else {
                    profilePageTitleEl.textContent = 'My Profile';
                }
            }
            
            if (appState.viewingProfile) {
                if (editProfileBtnEl) editProfileBtnEl.style.display = 'none';
                if (deleteProfileBtnEl) deleteProfileBtnEl.style.display = 'none';
                if (settingsTabBtnEl) settingsTabBtnEl.style.display = 'none';
            } else {
                if (editProfileBtnEl) editProfileBtnEl.style.display = 'block';
                if (deleteProfileBtnEl) deleteProfileBtnEl.style.display = 'block';
                if (settingsTabBtnEl) settingsTabBtnEl.style.display = 'block';
            }
            
            // Update sidebar
            document.getElementById('profileName').textContent = fullName;
            document.getElementById('profileCourse').textContent = user.course || 'Not set';
            document.getElementById('profileEmail').textContent = user.email;

            // Avatar: show user's avatar if present
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            const avatarUploadBtnEl = document.getElementById('avatarUploadBtn');
            if (avatarPlaceholder) {
                if (user.avatar) {
                    avatarPlaceholder.innerHTML = `<img src="${user.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                } else {
                    avatarPlaceholder.innerHTML = `<i class="fas fa-user"></i>`;
                }
            }
            // Show upload button only when viewing own profile
            if (avatarUploadBtnEl) {
                avatarUploadBtnEl.style.display = appState.viewingProfile ? 'none' : 'block';
            }
            
            // Update stats
            const userPosts = appState.forumPosts.filter(post => post.author === fullName).length;
            const userProducts = appState.marketplaceProducts.filter(product => product.seller === fullName).length;
            const userEvents = appState.events.filter(event => event.organization.includes(user.firstName)).length;
            
            document.getElementById('postsCount').textContent = userPosts;
            document.getElementById('productsCount').textContent = userProducts;
            document.getElementById('eventsCount').textContent = userEvents;
            
            // Update personal info
            document.getElementById('infoFullName').textContent = fullName;
            document.getElementById('infoEmail').textContent = user.email;
            document.getElementById('infoCourse').textContent = user.course || 'Not set';
            document.getElementById('infoUniversity').textContent = user.university || 'Not set';
            document.getElementById('infoJoinDate').textContent = formatDate(user.joinDate, true);
            document.getElementById('infoLocation').textContent = user.location || 'Not specified';
            document.getElementById('infoBio').textContent = user.bio || 'No bio added yet.';
            
            // Update contact info
            const contactInfo = document.getElementById('contactInfo');
            if (contactInfo) {
                contactInfo.innerHTML = '';
                
                if (user.contactPublic || !appState.viewingProfile) {
                    if (user.mobile) {
                        const mobileItem = document.createElement('div');
                        mobileItem.className = 'info-item';
                        mobileItem.innerHTML = `
                            <div class="info-label">Mobile</div>
                            <div class="info-value">${user.mobile}</div>
                        `;
                        contactInfo.appendChild(mobileItem);
                    }
                    
                    if (user.whatsapp) {
                        const whatsappItem = document.createElement('div');
                        whatsappItem.className = 'info-item';
                        whatsappItem.innerHTML = `
                            <div class="info-label">WhatsApp</div>
                            <div class="info-value"><a href="${user.whatsapp}" target="_blank">${user.whatsapp}</a></div>
                        `;
                        contactInfo.appendChild(whatsappItem);
                    }
                } else if (appState.viewingProfile) {
                    const privateItem = document.createElement('div');
                    privateItem.className = 'info-item';
                    privateItem.innerHTML = `
                        <div class="info-label">Contact Information</div>
                        <div class="info-value" style="color: var(--text-light);">This user has chosen to keep their contact information private.</div>
                    `;
                    contactInfo.appendChild(privateItem);
                }
            }
            
            // Update activity
            updateActivityTab();
            
            // Update settings form
            if (!appState.viewingProfile) {
                document.getElementById('settingsFirstName').value = user.firstName;
                document.getElementById('settingsLastName').value = user.lastName;
                document.getElementById('settingsEmail').value = user.email;
                document.getElementById('settingsUniversity').value = user.university || '';
                document.getElementById('settingsCourse').value = user.course || '';
                document.getElementById('settingsLocation').value = user.location || '';
                document.getElementById('settingsBio').value = user.bio || '';
                document.getElementById('settingsMobile').value = user.mobile || '';
                document.getElementById('settingsWhatsApp').value = user.whatsapp || '';
                document.getElementById('settingsContactPrivacy').checked = user.contactPublic || false;
            }
        }

        let activityEntriesCache = [];
        let activityLoadedCount = 10;

        function createActivityItem(entry) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            if (entry.type === 'post') {
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas fa-comment"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">Posted in ${entry.course} forum at ${entry.university}</div>
                        <div class="activity-meta">${entry.title} • ${formatDate(entry.date)}</div>
                    </div>
                `;
            } else {
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">Listed textbook for ${entry.course} at ${entry.university}</div>
                        <div class="activity-meta">${entry.title} • ${formatPriceNPR(entry.price)} • ${formatDate(entry.date)}</div>
                    </div>
                `;
            }
            return activityItem;
        }

        function renderActivityEntries(entries, count) {
            const activityList = document.getElementById('activityList');
            if (!activityList) return;

            activityList.innerHTML = '';
            const itemsToShow = entries.slice(0, count);

            itemsToShow.forEach(entry => {
                activityList.appendChild(createActivityItem(entry));
            });

            if (entries.length > count) {
                const loadMoreButton = document.createElement('button');
                loadMoreButton.type = 'button';
                loadMoreButton.className = 'btn btn-outline load-more-activity-btn';
                loadMoreButton.textContent = 'Load more';
                loadMoreButton.addEventListener('click', function() {
                    activityLoadedCount += 10;
                    renderActivityEntries(activityEntriesCache, activityLoadedCount);
                });
                activityList.appendChild(loadMoreButton);
            }
        }

        // Update activity tab
        function updateActivityTab() {
            const activityList = document.getElementById('activityList');
            if (!activityList) return;
            
            const user = appState.viewingProfile || appState.currentUser;
            if (!user) return;
            
            const fullName = `${user.firstName} ${user.lastName}`;
            
            const userPosts = appState.forumPosts.filter(post => post.author === fullName);
            const userProducts = appState.marketplaceProducts.filter(product => product.seller === fullName);
            
            const entries = [];
            userPosts.forEach(post => {
                entries.push({
                    type: 'post',
                    title: post.title,
                    course: post.course,
                    university: post.university,
                    date: post.date
                });
            });
            userProducts.forEach(product => {
                entries.push({
                    type: 'product',
                    title: product.title,
                    course: product.course,
                    university: product.university,
                    price: product.price,
                    date: product.date
                });
            });

            if (entries.length === 0) {
                activityList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No activity yet.</p>';
                return;
            }

            activityEntriesCache = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            activityLoadedCount = 10;
            renderActivityEntries(activityEntriesCache, activityLoadedCount);
        }

        // Load application data

        function setupProfileTabListeners() {
            document.querySelectorAll('.profile-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    
                    // Update active tab
                    document.querySelectorAll('.profile-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Show corresponding content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(`${tabName}Tab`).classList.add('active');
                    
                    // Scroll to the top of the page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        }

        // Format date for display

        function saveSettings() {
            if (!appState.currentUser) return;
            
            const user = appState.currentUser;
            
            // Update user data
            user.firstName = document.getElementById('settingsFirstName').value;
            user.lastName = document.getElementById('settingsLastName').value;
            user.email = document.getElementById('settingsEmail').value;
            user.university = document.getElementById('settingsUniversity').value;
            user.course = document.getElementById('settingsCourse').value;
            user.location = document.getElementById('settingsLocation').value;
            user.bio = document.getElementById('settingsBio').value;
            user.mobile = document.getElementById('settingsMobile').value;
            user.whatsapp = document.getElementById('settingsWhatsApp').value;
            user.contactPublic = document.getElementById('settingsContactPrivacy').checked;
            
            // Update in users array
            const userIndex = appState.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                appState.users[userIndex] = user;
            }
            // Save to localStorage
            localStorage.setItem('collegeSangiUsers', JSON.stringify(appState.users));
            localStorage.setItem('collegeSangiUser', JSON.stringify(user));
            // Save to server storage
            saveUsersToStorage();
            // Update profile page
            updateProfilePage();
            // Switch back to info tab
            document.querySelectorAll('.profile-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector('.profile-tab[data-tab="info"]').classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('infoTab').classList.add('active');
            showToast('Profile updated successfully!');
        }

        // Helper function to update comment count

        function deleteUserProfile() {
            if (!appState.currentUser) {
                showToast('No user logged in', 'error');
                return;
            }
            
            const userId = appState.currentUser.id;
            
            try {
                // Remove user from users array
                appState.users = appState.users.filter(u => u.id !== userId);
                
                // Remove user's forum posts
                appState.forumPosts = (appState.forumPosts || []).filter(p => p.userId !== userId);
                
                // Remove user's marketplace products
                appState.products = (appState.products || []).filter(p => p.userId !== userId);
                
                // Remove user's events
                appState.events = (appState.events || []).filter(e => e.userId !== userId);
                
                // Remove user's questions
                appState.questions = (appState.questions || []).filter(q => q.userId !== userId);
                
                // Save updated data to localStorage
                localStorage.setItem('collegeSangiUsers', JSON.stringify(appState.users));
                localStorage.setItem('collegeSangiForumPosts', JSON.stringify(appState.forumPosts));
                localStorage.setItem('collegeSangiProducts', JSON.stringify(appState.products));
                localStorage.setItem('collegeSangiEvents', JSON.stringify(appState.events));
                localStorage.setItem('collegeSangiQuestions', JSON.stringify(appState.questions));
                
                // Clear current user data
                localStorage.removeItem('collegeSangiUser');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('collegeSangiAuthToken');
                appState.currentUser = null;
                
                // Close modal
                const deleteProfileModal = document.getElementById('deleteProfileModal');
                if (deleteProfileModal) {
                    deleteProfileModal.classList.remove('active');
                }
                
                // Show success message
                showToast('Profile deleted successfully. Redirecting to login...', 'success');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    location.reload();
                }, 2000);
                
            } catch (error) {
                console.error('Error deleting profile:', error);
                showToast('Error deleting profile. Please try again.', 'error');
            }
        }

        // Helper function to update like count in modal
