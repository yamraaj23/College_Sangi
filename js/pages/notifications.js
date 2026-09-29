// ============================================
// College Sangi - Notifications Extensions Module
// ============================================

        async function initializeNotifications() {
            try {
                // server state already loaded by loadAppStateFromServer
                const soundRes = await fetch('/api/state');
                if (soundRes.ok) {
                    const s = await soundRes.json();
                    appState.notifications = s.notifications || appState.notifications;
                }
                const soundEnabled = localStorage.getItem('collegeSangiNotificationSound');
                appState.notificationSoundEnabled = soundEnabled !== 'false';
                updateUnreadCounts();
            } catch (err) {
                console.error('Error initializing notifications:', err);
            }
        }

        function createNotification(type, targetId, targetType, content, author) {
            if (!appState.currentUser) return null;
            
            // Find the target item (post, product, etc.)
            let targetItem = null;
            let targetOwner = null;
            
            if (targetType === 'post') {
                targetItem = appState.forumPosts.find(p => p.id === targetId);
                if (targetItem) {
                    targetOwner = targetItem.author;
                }
            } else if (targetType === 'product') {
                targetItem = appState.marketplaceProducts.find(p => p.id === targetId);
                if (targetItem) {
                    targetOwner = targetItem.seller;
                }
            } else if (targetType === 'question') {
                targetItem = appState.questionPhotos.find(q => q.id === targetId);
                if (targetItem) {
                    targetOwner = targetItem.author;
                }
            }
            
            // Don't create notification if:
            // 1. Target doesn't exist
            // 2. Author is the owner (don't notify about your own content)
            if (!targetItem || !targetOwner) return null;
            
            // Check if author is the owner - don't notify about your own content
            if (targetOwner === author) {
                return null;
            }
            
            // Check if duplicate notification exists (same type, same target, same author, within last 1 minute)
            const now = new Date();
            const existingDuplicate = appState.notifications.find(n => 
                n.type === type && 
                n.targetId === targetId && 
                n.targetType === targetType &&
                n.author === author &&
                n.recipientName === targetOwner &&
                (now - new Date(n.timestamp)) < 60000
            );
            
            if (existingDuplicate) {
                return null;
            }
            
            // Create notification object
            const notification = {
                id: Date.now(),
                type: type, // 'like', 'comment', 'reply'
                targetId: targetId,
                targetType: targetType,
                content: content,
                author: author,
                recipientName: targetOwner, // Who should see this notification
                timestamp: new Date().toISOString(),
                read: false
            };
            
            // Add to notifications array (at the beginning)
            appState.notifications.unshift(notification);
            
            // Save to localStorage
            saveNotificationsToStorage();
            
            // Update unread count
            updateUnreadCounts();
            
            // Play notification sound
            playNotificationSound();
            
            // Show a subtle toast notification
            let toastMessage = `${author} ${type === 'like' ? 'liked' : type === 'comment' ? 'commented on' : 'interacted with'} your ${targetType}`;
            showToast(toastMessage, 'info');
            
            // Re-render notifications in dropdown
            renderNotifications();
            
            return notification;
        }

        // Play notification sound
        function playNotificationSound() {
            // Check if sound is enabled
            if (!appState.notificationSoundEnabled) return;
            
            // Create a simple beep sound using Web Audio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                // Silent fail if audio context not available
            }
        }

        // Update the unread count and badge
        function updateUnreadCounts() {
            // Filter unread notifications for current user only
            const currentUserName = appState.currentUser ? 
                `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : null;
            const currentUserId = appState.currentUser ? appState.currentUser.id : null;
            
            appState.unreadNotifications = appState.notifications.filter(notification => 
                !notification.read && (notification.recipientName === currentUserName || notification.recipientId === currentUserId)
            ).length;
            
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = appState.unreadNotifications > 0 ? appState.unreadNotifications : '';
                badge.style.display = appState.unreadNotifications > 0 ? 'flex' : 'none';
            }
            
            // Update the mark all as read button visibility
            const markAllReadBtn = document.getElementById('markAllRead');
            if (markAllReadBtn) {
                markAllReadBtn.style.display = appState.unreadNotifications > 0 ? 'block' : 'none';
            }
        }

        // Toggle notification dropdown
        function toggleNotificationDropdown() {
            const dropdown = document.getElementById('notificationDropdown');
            if (!dropdown) return;
            
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            } else {
                dropdown.style.display = 'block';
                setTimeout(() => {
                    dropdown.classList.add('show');
                }, 10);
                
                // Render notifications when dropdown is opened
                renderNotifications();
            }
        }

        // Render notifications in the dropdown
        function renderNotifications() {
            const notificationList = document.getElementById('notificationList');
            if (!notificationList) return;
            
            notificationList.innerHTML = '';
            
            // Filter notifications for current user only
            const currentUserName = appState.currentUser ? 
                `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : null;
            const currentUserId = appState.currentUser ? appState.currentUser.id : null;
            
            const userNotifications = appState.notifications.filter(n => 
                n.recipientName === currentUserName || n.recipientId === currentUserId
            );
            
            if (userNotifications.length === 0) {
                notificationList.innerHTML = '<div class="no-notifications"><i class="fas fa-inbox"></i><p>No notifications yet</p></div>';
                return;
            }
            
            // Show notifications (paginate if needed)
            const notificationsToShow = userNotifications.slice(0, 15);
            
            notificationsToShow.forEach(notification => {
                const notificationItem = createNotificationItem(notification);
                notificationList.appendChild(notificationItem);
            });
            
            // Show "more" indicator if there are more notifications
            if (userNotifications.length > 15) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'notification-more';
                moreDiv.innerHTML = `<small>...and ${userNotifications.length - 15} more notifications</small>`;
                notificationList.appendChild(moreDiv);
            }
        }

        // Create a single notification item
        function createNotificationItem(notification) {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.setAttribute('data-id', notification.id);
            
            // Format time
            const timeAgo = getTimeAgo(notification.timestamp);
            
            // Determine icon and text based on notification type
            let iconClass = '';
            let icon = '';
            let text = '';
            let bgColor = '';
            
            switch(notification.type) {
                case 'like':
                    iconClass = 'like';
                    icon = 'heart';
                    text = `<strong class="profile-link" data-author="${notification.author}">${notification.author}</strong> liked your ${notification.targetType}`;
                    bgColor = 'rgba(231, 76, 60, 0.1)';
                    break;
                case 'comment':
                    iconClass = 'comment';
                    icon = 'comment';
                    text = `<strong class="profile-link" data-author="${notification.author}">${notification.author}</strong> commented on your ${notification.targetType}`;
                    if (notification.content) {
                        text += `: <em>"${notification.content.substring(0, 40)}${notification.content.length > 40 ? '...' : ''}"</em>`;
                    }
                    bgColor = 'rgba(52, 152, 219, 0.1)';
                    break;
                case 'message':
                    iconClass = 'message';
                    icon = 'envelope';
                    text = `<strong class="profile-link" data-author="${notification.author}">${notification.author}</strong> sent you a message`;
                    if (notification.content) {
                        text += `: <em>"${notification.content.substring(0, 40)}${notification.content.length > 40 ? '...' : ''}"</em>`;
                    }
                    bgColor = 'rgba(46, 204, 113, 0.1)';
                    break;
                default:
                    iconClass = 'info';
                    icon = 'info-circle';
                    text = notification.content || 'New notification';
                    bgColor = 'rgba(155, 89, 182, 0.1)';
            }
            
            item.innerHTML = `
                <div class="notification-item-wrapper" style="background-color: ${bgColor}; padding: 12px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s ease;">
                    <div class="notification-icon ${iconClass}">
                        <i class="fas fa-${icon}" style="color: white;"></i>
                    </div>
                    <div class="notification-content" style="flex: 1; min-width: 0;">
                        <p class="notification-text" style="margin: 0 0 4px 0; font-size: 0.9rem; color: #3498db;">${text}</p>
                        <div class="notification-time" style="font-size: 0.75rem; color: #7f8c8d;">${timeAgo}</div>
                    </div>
                    ${!notification.read ? '<div class="notification-unread-dot" style="width: 8px; height: 8px; background-color: var(--secondary); border-radius: 50%; margin-top: 4px; flex-shrink: 0;"></div>' : ''}
                </div>
            `;
            
            // Add click event to mark as read and navigate
            item.addEventListener('click', () => {
                // Mark as read
                markNotificationAsRead(notification.id);
                
                // Navigate to the item
                navigateToNotificationTarget(notification);
                
                // Close dropdown
                toggleNotificationDropdown();
            });
            
            // Add hover effect
            item.addEventListener('mouseover', function() {
                this.style.opacity = '0.8';
            });
            
            item.addEventListener('mouseout', function() {
                this.style.opacity = '1';
            });
            
            return item;
        }

        // Mark notification as read
        function markNotificationAsRead(notificationId) {
            const notification = appState.notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                notification.read = true;
                saveNotificationsToStorage();
                updateUnreadCounts();
                
                // Update the notification item in the dropdown
                const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
                if (notificationItem) {
                    notificationItem.classList.remove('unread');
                    const unreadDot = notificationItem.querySelector('.notification-unread-dot');
                    if (unreadDot) unreadDot.remove();
                }
            }
        }

        // Mark all notifications as read
        function markAllNotificationsAsRead() {
            const currentUserName = appState.currentUser ? 
                `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : null;
            
            appState.notifications.forEach(notification => {
                if (notification.recipientName === currentUserName) {
                    notification.read = true;
                }
            });
            
            saveNotificationsToStorage();
            updateUnreadCounts();
            renderNotifications();
            showToast('All notifications marked as read');
        }

        // Clear all notifications
        function clearAllNotifications() {
            const currentUserName = appState.currentUser ? 
                `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : null;
            const currentUserId = appState.currentUser ? appState.currentUser.id : null;
            
            const userNotifications = appState.notifications.filter(n => 
                n.recipientName === currentUserName || n.recipientId === currentUserId
            );
            if (userNotifications.length === 0) return;
            
            if (confirm('Are you sure you want to clear all notifications?')) {
                // Remove only current user's notifications
                appState.notifications = appState.notifications.filter(n => 
                    !(n.recipientName === currentUserName || n.recipientId === currentUserId)
                );
                saveNotificationsToStorage();
                updateUnreadCounts();
                renderNotifications();
                showToast('All notifications cleared');
            }
        }

        // Navigate to notification target
        function navigateToNotificationTarget(notification) {
            switch(notification.targetType) {
                case 'post':
                    const post = appState.forumPosts.find(p => p.id === notification.targetId);
                    if (post) {
                        showPage('forum');
                        setTimeout(() => {
                            viewPostComments(post.id);
                        }, 300);
                    }
                    break;
                case 'product':
                    showPage('marketplace');
                    break;
                case 'question':
                    showPage('questionBank');
                    break;
            }
        }

        // Helper function to get time ago
        function getTimeAgo(timestamp) {
            const now = new Date();
            const past = new Date(timestamp);
            const diffInSeconds = Math.floor((now - past) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Just now';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes}m ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours}h ago`;
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days}d ago`;
            } else {
                return past.toLocaleDateString();
            }
        }

        // DOM Elements
        const loginPage = document.getElementById('loginPage');
        const mainWebsite = document.getElementById('mainWebsite');
        const loginForm = document.getElementById('loginForm');
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        // forumPostsContainer, marketplaceGrid, eventsContainer, questionPhotosContainer removed - will be fetched dynamically when needed
        const newPostBtn = document.getElementById('newPostBtn');
        const addProductBtn = document.getElementById('addProductBtn');
        const addEventBtn = document.getElementById('addEventBtn');
        const uploadQuestionBtn = document.getElementById('uploadQuestionBtn');
        const loginFormContainer = document.getElementById('loginFormContainer');
        const showSignupLink = document.getElementById('showSignupLink');
        const googleLoginBtn = document.querySelector('.social-icon.google');
        const facebookLoginBtn = document.querySelector('.social-icon.facebook');
        const emptyQuestionBankMessage = document.getElementById('emptyQuestionBankMessage');
        const emptyQuestionBankUploadBtn = document.getElementById('emptyQuestionBankUploadBtn');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const settingsTabBtn = document.getElementById('settingsTabBtn');
        const settingsForm = document.getElementById('settingsForm');
        const cancelSettings = document.getElementById('cancelSettings');
        const downloadAppBtn = document.getElementById('downloadAppBtn');
        const notificationBell = document.getElementById('notificationBell');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const markAllReadBtn = document.getElementById('markAllRead');
        const viewAllNotificationsBtn = document.getElementById('viewAllNotifications');
        const clearAllNotificationsBtn = document.getElementById('clearAllNotifications');
        
        // NEW: Show Privacy Policy Page
