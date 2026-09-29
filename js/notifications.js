// ============================================
// College Sangi - Notifications Module
// ============================================
// Handles notification system and management

let notificationState = {
    notifications: [],
    unreadCount: 0
};

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notificationState.unreadCount;
        badge.style.display = notificationState.unreadCount > 0 ? 'flex' : 'none';
    }
}

// Show notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Add new notification
function addNotification(type, message) {
    const notification = {
        id: Date.now(),
        type: type,
        message: message,
        read: false,
        timestamp: new Date().toISOString()
    };
    
    notificationState.notifications.unshift(notification);
    notificationState.unreadCount++;
    updateNotificationBadge();
    renderNotifications();
}

// Render notifications list
function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    
    list.innerHTML = notificationState.notifications.map(n => `
        <div class="notification-item ${!n.read ? 'unread' : ''}">
            <div class="notification-icon ${n.type}">
                <i class="fas fa-${n.type === 'like' ? 'heart' : 'comment'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-text">${n.message}</div>
                <div class="notification-time">${formatDate(n.timestamp)}</div>
            </div>
            ${!n.read ? '<div class="notification-unread-dot"></div>' : ''}
        </div>
    `).join('') || '<div class="no-notifications">No notifications</div>';
}

// Mark all as read
function markAllNotificationsAsRead() {
    notificationState.notifications.forEach(n => n.read = true);
    notificationState.unreadCount = 0;
    updateNotificationBadge();
    renderNotifications();
}
