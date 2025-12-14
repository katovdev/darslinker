// Notifications page for students and teachers
export async function loadNotificationsPage() {
  // Try to get user from multiple sources
  let userId = null;
  
  // Try localStorage first (teacher dashboard)
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (currentUser._id && currentUser.role === 'teacher') {
    userId = currentUser._id;
  }
  
  // Fallback to sessionStorage (landing/student)
  if (!userId) {
    const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
    userId = landingUser._id;
  }
  
  if (!userId) {
    console.error('No user ID found');
    const mainContent = document.querySelector('.figma-content-area') || document.querySelector('.landing-dashboard-content');
    if (mainContent) {
      mainContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #EF4444;">Please log in to view notifications</div>';
    }
    return;
  }

  // Get main content area (try both teacher and student dashboards)
  const mainContent = document.querySelector('.figma-content-area') || document.querySelector('.landing-dashboard-content');
  if (!mainContent) {
    console.error('Main content area not found');
    return;
  }

  // Show loading
  mainContent.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--primary-color);">Loading notifications...</div>';

  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    // Determine user type based on where user data is stored
    const teacherUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const studentUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');

    let userType = 'Student'; // Default
    let token = null;

    if (teacherUser._id && teacherUser.role === 'teacher') {
      userType = 'Teacher';
      token = localStorage.getItem('accessToken');
      userId = teacherUser._id;
    } else if (studentUser._id) {
      userType = 'Student';
      userId = studentUser._id;
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('🔔 Loading notifications for:', { userId, userType });

    const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}?userType=${userType}`, {
      headers
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to load notifications');
    }

    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;

    // Render notifications page
    mainContent.innerHTML = `
      <style>
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        }
        .notifications-title {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
        }
        .notifications-stats {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
        }
        .mark-all-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .mark-all-btn:hover {
          opacity: 0.9;
        }
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .notification-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid rgba(126, 162, 212, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .notification-item:hover {
          background: rgba(58, 56, 56, 0.5);
          border-color: var(--primary-color);
          transform: translateX(4px);
        }
        .notification-item.unread {
          background: rgba(126, 162, 212, 0.1);
          border-left: 4px solid var(--primary-color);
        }
        .notification-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(126, 162, 212, 0.2);
          border-radius: 50%;
        }
        .notification-content {
          flex: 1;
        }
        .notification-title {
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .notification-message {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .notification-time {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .notification-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 10px;
          height: 10px;
          background: var(--primary-color);
          border-radius: 50%;
        }
        .empty-state {
          padding: 80px 40px;
          text-align: center;
          color: rgba(255,255,255,0.5);
        }
        .empty-state svg {
          margin: 0 auto 24px;
          opacity: 0.3;
        }
        .empty-state-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: rgba(255,255,255,0.7);
        }
        .empty-state-text {
          font-size: 14px;
          opacity: 0.7;
        }
      </style>

      <div class="notifications-header">
        <div>
          <h1 class="notifications-title">Notifications</h1>
          <div class="notifications-stats">
            ${unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </div>
        </div>
        ${notifications.length > 0 && unreadCount > 0 ? `
          <button class="mark-all-btn" onclick="markAllNotificationsRead('${userId}')">
            Mark all as read
          </button>
        ` : ''}
      </div>

      ${notifications.length === 0 ? `
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <div class="empty-state-title">No notifications yet</div>
          <div class="empty-state-text">You'll see notifications here when you have updates</div>
        </div>
      ` : `
        <div class="notifications-list">
          ${notifications.map(notif => {
            const date = new Date(notif.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            let icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
            
            if (notif.type === 'assignment_graded') {
              icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
            } else if (notif.type === 'payment_approved') {
              icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
            } else if (notif.type === 'payment_submitted') {
              icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBB936" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
            }
            
            return `
              <div class="notification-item ${notif.read ? 'read' : 'unread'}" 
                   data-notification-id="${notif._id}" 
                   data-notification-link="${(notif.link || '').replace(/"/g, '&quot;')}"
                   onclick="handleNotificationClick(this.dataset.notificationId, this.dataset.notificationLink)">
                <div class="notification-icon">${icon}</div>
                <div class="notification-content">
                  <div class="notification-title">${notif.title}</div>
                  <div class="notification-message">${notif.message}</div>
                  <div class="notification-time">${date}</div>
                </div>
                ${!notif.read ? '<div class="notification-badge"></div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Update badge
    if (window.updateNotificationBadge) {
      window.updateNotificationBadge(unreadCount);
    }

  } catch (error) {
    console.error('Error loading notifications:', error);
    mainContent.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #EF4444;">
        <div style="font-size: 18px; margin-bottom: 8px;">Failed to load notifications</div>
        <div style="font-size: 14px; opacity: 0.8;">Please try again later</div>
      </div>
    `;
  }
}

// Handle notification click
window.handleNotificationClick = async function(notificationId, link) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    console.log('Marking notification as read:', notificationId);
    
    // Mark as read
    const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });

    const result = await response.json();
    console.log('Mark as read result:', result);

    // Reload notifications page
    await loadNotificationsPage();

    // Navigate to link if exists
    if (link && link !== 'undefined' && link !== 'null') {
      // You can add navigation logic here if needed
      console.log('Navigate to:', link);
    }

  } catch (error) {
    console.error('Error handling notification:', error);
  }
};

// Mark all as read
window.markAllNotificationsRead = async function(userId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    console.log('Marking all as read for user:', userId);
    
    const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}/read-all`, {
      method: 'PATCH'
    });

    const result = await response.json();
    console.log('Mark all as read result:', result);

    // Reload page
    await loadNotificationsPage();

  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};
