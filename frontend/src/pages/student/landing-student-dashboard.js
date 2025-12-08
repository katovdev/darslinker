// Initialize function called from dashboard.jsana 
export function initLandingStudentDashboard() {
  // Clear body and set up for dashboard
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  
  renderLandingStudentDashboard();
  
  // Load teacher's courses after rendering
  loadTeacherCourses();
}

export function renderLandingStudentDashboard() {
  // Render directly to body
  const container = document.body;

  // Get user data from sessionStorage (saved during login/register)
  const landingUser = sessionStorage.getItem("landingUser");
  const userData = landingUser ? JSON.parse(landingUser) : {};
  
  // Check if _id exists, if not, clear sessionStorage and redirect to login
  if (!userData._id) {
    console.error('❌ No _id found in sessionStorage.');
    console.error('📦 Current sessionStorage:', {
      landingUser: sessionStorage.getItem('landingUser'),
      currentTeacherId: sessionStorage.getItem('currentTeacherId')
    });
    
    // Don't clear sessionStorage yet, just redirect to landing page
    const teacherId = sessionStorage.getItem('currentTeacherId');
    if (teacherId) {
      console.log('🔄 Redirecting to landing page:', `/teacher/${teacherId}`);
      window.location.href = `/teacher/${teacherId}`;
    } else {
      console.log('🔄 Redirecting to home page');
      window.location.href = '/';
    }
    return;
  }
  
  // Build full name from firstName and lastName
  const firstName = userData.firstName || "Student";
  const lastName = userData.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const phone = userData.phone || "";
  
  // Default values for level and points (new user starts with 0)
  const userLevel = userData.level || 1;
  const userPoints = userData.points || 0;
  
  console.log('👤 Landing User Data:', { 
    firstName, 
    lastName, 
    fullName, 
    phone, 
    _id: userData._id,
    displayId: userData._id ? userData._id.slice(-5) : 'N/A',
    fullUserData: userData 
  });

  container.innerHTML = `
    <style>
      /* CSS Variables for theming */
      :root {
        --primary-color: #7ea2d4;
        --background-color: #232323;
        --text-color: #ffffff;
      }

      /* Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        overflow: hidden;
      }

      /* Main Container */
      .landing-dashboard-container {
        display: flex;
        min-height: 100vh;
        background: #232323;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
      }

      /* Sidebar - Fixed, No Scroll */
      .landing-sidebar {
        width: 260px;
        background: #232323;
        border-right: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        display: flex;
        flex-direction: column;
        padding: 24px 16px;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        overflow-y: auto;
        z-index: 1000;
      }

      /* Hide scrollbar but keep functionality */
      .landing-sidebar::-webkit-scrollbar {
        width: 4px;
      }

      .landing-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      .landing-sidebar::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 2px;
      }

      .landing-sidebar::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--primary-color) 50%, transparent);
      }

      /* Profile Section */
      .landing-profile-section {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 12px;
        margin-bottom: 24px;
      }

      .landing-profile-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .landing-profile-info {
        flex: 1;
        min-width: 0;
      }

      .landing-profile-name {
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4px;
      }

      .landing-profile-level {
        font-size: 12px;
        color: #9CA3AF;
      }

      /* Navigation Styles - Like Teacher Dashboard */
      .landing-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .landing-nav-section {
        margin-bottom: 12px;
      }

      .landing-nav-parent {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 15px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .landing-nav-parent:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border-color: var(--primary-color);
      }

      .landing-nav-parent.expanded {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: none;
      }

      .landing-nav-title {
        color: var(--primary-color);
        font-size: 14px;
        font-weight: 500;
      }

      .landing-nav-arrow {
        color: var(--primary-color);
        font-size: 10px;
        transition: transform 0.3s ease;
      }

      .landing-nav-arrow.rotated {
        transform: rotate(90deg);
      }

      .landing-nav-children {
        background: rgba(40, 40, 40, 0.8);
        border-left: 0.5px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-right: 0.5px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-bottom: 0.5px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        padding: 8px 16px 12px 16px;
        max-height: 500px;
        opacity: 1;
        overflow: hidden;
        transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease;
      }

      .landing-nav-children.hidden {
        max-height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
        border: none;
      }

      .landing-nav-item {
        display: block;
        color: #a0a0a0;
        text-decoration: none;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 400;
        border-radius: 6px;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .landing-nav-item:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
      }

      .landing-nav-item.active {
        color: #ffffff !important;
        font-weight: 500;
        background: transparent !important;
      }

      .landing-sidebar-footer {
        margin-top: auto;
        padding-top: 20px;
        border-top: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
      }

      .landing-support-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 15%, transparent), color-mix(in srgb, var(--primary-color) 5%, transparent));
        border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 15px;
        color: var(--primary-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
      }

      .landing-support-btn:hover {
        background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 25%, transparent), color-mix(in srgb, var(--primary-color) 15%, transparent));
        border-color: var(--primary-color);
        transform: translateY(-2px);
      }

      /* Main Content - Scrollable */
      .landing-main-content {
        flex: 1;
        margin-left: 260px;
        background: #232323;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
      }

      /* Custom Scrollbar for Content */
      .landing-main-content::-webkit-scrollbar {
        width: 8px;
      }

      .landing-main-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .landing-main-content::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 4px;
      }

      .landing-main-content::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--primary-color) 50%, transparent);
      }

      /* Header */
      .landing-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 40px;
        background: #232323;
        border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(10px);
      }

      .landing-header-logo {
        display: flex;
        align-items: center;
      }

      .landing-logo-text {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
      }

      .landing-logo-highlight {
        color: var(--primary-color);
      }

      .landing-header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .landing-icon-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 8px;
        color: #9CA3AF;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .landing-icon-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        color: #ffffff;
        border-color: var(--primary-color);
      }

      /* Toast Notification - Bottom Right */
      .landing-toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--primary-color);
        color: #ffffff;
        padding: 16px 32px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInBottomRight 0.3s ease;
      }

      @keyframes slideInBottomRight {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutBottomRight {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100px);
          opacity: 0;
        }
      }

      /* Meeting and Notification buttons - lighter color */
      .landing-meeting-btn,
      .landing-notification-btn {
        color: #6B7280 !important;
      }

      .landing-meeting-btn:hover,
      .landing-notification-btn:hover {
        color: #9CA3AF !important;
      }

      /* Logout button with text and blue border */
      .landing-logout-btn {
        width: auto !important;
        padding: 0 16px !important;
        gap: 8px;
        border-color: var(--primary-color) !important;
        margin-left: 8px;
        color: var(--primary-color) !important;
      }

      .landing-logout-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
      }

      .landing-logout-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-color);
      }

      /* Dashboard Content */
      .landing-dashboard-content {
        padding: 40px;
      }

      /* Welcome Card */
      .landing-welcome-card {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 20px;
        padding: 32px;
        margin-bottom: 32px;
      }

      .landing-welcome-title {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .landing-welcome-subtitle {
        font-size: 16px;
        color: #9CA3AF;
      }

      /* Stats Grid */
      .landing-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 40px;
      }

      .landing-stat-card {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .landing-stat-card:hover {
        background: rgba(58, 56, 56, 0.4);
        border-color: var(--primary-color);
      }

      .landing-stat-value {
        font-size: 48px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .landing-stat-label {
        font-size: 14px;
        color: #9CA3AF;
        font-weight: 500;
      }

      /* Learning Section */
      .landing-learning-section {
        margin-top: 48px;
      }

      /* Course Filter Tabs */
      .landing-course-filters {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }

      .landing-filter-tab {
        padding: 10px 20px;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 8px;
        color: #9CA3AF;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .landing-filter-tab:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border-color: var(--primary-color);
        color: #ffffff;
      }

      .landing-filter-tab.active {
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-color: var(--primary-color);
        color: #ffffff;
      }

      .landing-courses-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 40px;
      }

      /* Course Card */
      .landing-course-card {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
      }

      .landing-course-card:hover {
        background: rgba(58, 56, 56, 0.4);
        border-color: var(--primary-color);
      }

      .landing-course-thumbnail {
        width: 100%;
        height: 160px;
        background: rgba(40, 40, 40, 0.8);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .landing-course-progress-bar {
        margin-bottom: 16px;
      }

      .landing-course-progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #9CA3AF;
        margin-bottom: 8px;
      }

      .landing-progress-track {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .landing-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #10B981, #34D399);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .landing-course-info {
        margin-bottom: 16px;
      }

      .landing-course-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .landing-course-price {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        white-space: nowrap;
        margin-left: 12px;
      }

      .landing-course-instructor {
        font-size: 14px;
        color: #9CA3AF;
        margin-bottom: 4px;
      }

      .landing-course-meta {
        font-size: 12px;
        color: #6B7280;
      }

      .landing-continue-btn {
        width: 100%;
        padding: 12px;
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        border: 1px solid color-mix(in srgb, var(--primary-color) 50%, transparent);
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .landing-continue-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-color: var(--primary-color);
      }

      /* Loading Animation */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .landing-courses-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .landing-sidebar {
          width: 200px;
        }

        .landing-main-content {
          margin-left: 200px;
        }

        .landing-stats-grid,
        .landing-courses-grid {
          grid-template-columns: 1fr;
        }

        .landing-dashboard-content {
          padding: 24px;
        }
      }
    </style>

    <div class="landing-dashboard-container">
      <!-- Sidebar -->
      <aside class="landing-sidebar">
        <!-- Profile Section -->
        <div class="landing-profile-section">
          <div class="landing-profile-avatar">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#4A5568"/>
              <circle cx="20" cy="15" r="7" fill="#E2E8F0"/>
              <path d="M8 35C8 28 13 24 20 24C27 24 32 28 32 35" fill="#E2E8F0"/>
            </svg>
          </div>
          <div class="landing-profile-info">
            <div class="landing-profile-name">${fullName}</div>
            <div class="landing-profile-id" style="font-size: 12px; color: #9CA3AF; margin: 4px 0;">ID: ${userData._id ? userData._id.slice(-5) : 'N/A'}</div>
            <div class="landing-profile-level">Level ${userLevel} • ${userPoints} pts</div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="landing-nav">
          <!-- General Section -->
          <div class="landing-nav-section">
            <div class="landing-nav-parent" onclick="toggleLandingMenu('general')">
              <span class="landing-nav-title">General</span>
              <span class="landing-nav-arrow" id="general-arrow">▶</span>
            </div>
            <div class="landing-nav-children hidden" id="general-children">
              <a class="landing-nav-item active" data-page="home">Home</a>
              <a class="landing-nav-item" data-page="messages">Messages</a>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="landing-nav-section">
            <div class="landing-nav-parent" onclick="toggleLandingMenu('progress')">
              <span class="landing-nav-title">Progress</span>
              <span class="landing-nav-arrow" id="progress-arrow">▶</span>
            </div>
            <div class="landing-nav-children hidden" id="progress-children">
              <a class="landing-nav-item" data-page="progress">My Progress</a>
            </div>
          </div>

          <!-- Account Section -->
          <div class="landing-nav-section">
            <div class="landing-nav-parent" onclick="toggleLandingMenu('account')">
              <span class="landing-nav-title">Account</span>
              <span class="landing-nav-arrow" id="account-arrow">▶</span>
            </div>
            <div class="landing-nav-children hidden" id="account-children">
              <a class="landing-nav-item" data-page="account">Settings</a>
            </div>
          </div>
        </nav>

        <!-- Support Button -->
        <div class="landing-sidebar-footer">
          <button class="landing-support-btn">Support</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="landing-main-content">
        <!-- Header -->
        <header class="landing-header">
          <div class="landing-header-logo">
            <span class="landing-logo-text">dars<span class="landing-logo-highlight">linker</span></span>
          </div>
          <div class="landing-header-actions">
            <button class="landing-icon-btn landing-meeting-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button class="landing-icon-btn landing-notification-btn" onclick="openNotifications()" style="position: relative;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span id="notification-badge" style="position: absolute; top: -4px; right: -4px; background: #EF4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; font-weight: 600; display: none; min-width: 18px; text-align: center;"></span>
            </button>
            <button class="landing-icon-btn" style="margin-right: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button class="landing-icon-btn landing-logout-btn" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="landing-logout-text">Log out</span>
            </button>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="landing-dashboard-content">
          <!-- Welcome Section -->
          <div class="landing-welcome-card">
            <h1 class="landing-welcome-title">Welcome back, ${firstName} !</h1>
            <p class="landing-welcome-subtitle">Continue your learning journey and achieve your goals</p>
          </div>

          <!-- Stats Cards -->
          <div class="landing-stats-grid">
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">Active Courses</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">Total Points</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">Certificates</div>
            </div>
          </div>

          <!-- Continue Learning Section -->
          <div class="landing-learning-section">
            <div class="landing-course-filters">
              <button class="landing-filter-tab" data-filter="my-courses">My Courses</button>
              <button class="landing-filter-tab active" data-filter="all-courses">All Courses</button>
            </div>
            <div class="landing-courses-grid">
              <!-- Loading spinner will be shown here -->
              <div class="landing-courses-loading" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid color-mix(in srgb, var(--primary-color) 20%, transparent); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #9CA3AF; margin-top: 20px; font-size: 14px;">Loading courses...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  attachEventListeners();
}

// Toggle menu function
window.toggleLandingMenu = function(menuId) {
  const children = document.getElementById(`${menuId}-children`);
  const arrow = document.getElementById(`${menuId}-arrow`);
  const parent = arrow?.closest('.landing-nav-parent');
  
  if (children && arrow && parent) {
    children.classList.toggle('hidden');
    arrow.classList.toggle('rotated');
    parent.classList.toggle('expanded');
  }
};

function attachEventListeners() {
  // Navigation items
  document.querySelectorAll('.landing-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.landing-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const page = item.dataset.page;
      handleNavigation(page);
    });
  });

  // Support button
  const supportBtn = document.querySelector('.landing-support-btn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      alert('Support feature coming soon!');
    });
  }

  // Meeting button - show coming soon toast
  const meetingBtn = document.querySelector('.landing-meeting-btn');
  if (meetingBtn) {
    meetingBtn.addEventListener('click', () => {
      showToast('Coming soon');
    });
  }

  // Notification button - handled by onclick in HTML (openNotifications)

  // Logout button
  const logoutBtn = document.querySelector('.landing-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      handleLogout();
    });
  }

  // Continue learning buttons
  document.querySelectorAll('.landing-continue-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.landing-course-card');
      console.log('Continue learning clicked', card);
    });
  });

  // Course filter tabs
  document.querySelectorAll('.landing-filter-tab').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      // Remove active class from all tabs
      document.querySelectorAll('.landing-filter-tab').forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      const filter = tab.dataset.filter;
      await handleCourseFilter(filter);
    });
  });
}

// Show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.landing-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'landing-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutBottomRight 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Handle logout
function handleLogout() {
  // Clear session storage
  sessionStorage.removeItem('landingUser');
  sessionStorage.removeItem('currentTeacherId');
  
  // Show toast
  showToast('Logging out...');
  
  // Redirect to login page after short delay
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

function handleNavigation(page) {
  console.log('Navigate to:', page);
  
  // Show coming soon for messages
  if (page === 'messages') {
    showToast('Coming soon');
  }
  // Add your navigation logic here
}

// Handle course filter
let allCoursesData = []; // Store all courses globally

// Apply landing theme (colors and logo)
function applyLandingTheme(landing) {
  const primaryColor = landing.primaryColor || '#7ea2d4';
  const backgroundColor = landing.backgroundColor || '#232323';
  const textColor = landing.textColor || '#ffffff';
  const logoText = landing.logoText || 'darslinker';
  
  console.log('🎨 Applying theme:', { primaryColor, backgroundColor, textColor, logoText });
  
  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--background-color', backgroundColor);
  document.documentElement.style.setProperty('--text-color', textColor);
  
  // Update logo in header
  const logoElement = document.querySelector('.landing-header-logo');
  if (logoElement) {
    // Use logo text - split by "linker" or use as is
    const lowerText = logoText.toLowerCase();
    if (lowerText.includes('linker')) {
      const parts = logoText.split(/linker/i);
      const firstPart = parts[0] || '';
      logoElement.innerHTML = `<span class="landing-logo-text">${firstPart}<span class="landing-logo-highlight">linker</span></span>`;
    } else {
      logoElement.innerHTML = `<span class="landing-logo-text">${logoText}</span>`;
    }
  }
}

// Get enrolled courses for current student
async function getEnrolledCourses(courses) {
  // Get student ID
  let studentId = null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user._id) {
    studentId = user._id;
  } else {
    const landingUser = sessionStorage.getItem('landingUser');
    if (landingUser) {
      try {
        const userData = JSON.parse(landingUser);
        if (userData._id) {
          studentId = userData._id;
        }
      } catch (error) {
        console.error('Error parsing landing user:', error);
      }
    }
  }

  if (!studentId) {
    return [];
  }

  // Filter courses where student is enrolled
  const enrolledCourses = [];
  
  for (const course of courses) {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiBaseUrl}/students/${studentId}/check-enrollment/${course._id}`);
      const result = await response.json();
      
      if (result.success && result.isEnrolled) {
        enrolledCourses.push(course);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  }
  
  return enrolledCourses;
}

async function handleCourseFilter(filter) {
  console.log('Filter changed to:', filter);
  
  const coursesGrid = document.querySelector('.landing-courses-grid');
  
  if (filter === 'my-courses') {
    // Filter enrolled courses
    const enrolledCourses = await getEnrolledCourses(allCoursesData);
    
    if (enrolledCourses.length > 0) {
      await updateCoursesGrid(enrolledCourses, true); // true = isEnrolledView
    } else {
      coursesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="color: #9CA3AF; font-size: 16px; margin-bottom: 8px;">No enrolled courses yet</p>
          <p style="color: #6B7280; font-size: 14px;">Browse all courses and start learning!</p>
        </div>
      `;
    }
  } else {
    // Show all courses
    if (allCoursesData.length > 0) {
      await updateCoursesGrid(allCoursesData, false); // false = not enrolled view
    } else {
      coursesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid color-mix(in srgb, var(--primary-color) 20%, transparent); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="color: #9CA3AF; margin-top: 20px; font-size: 14px;">Loading courses...</p>
        </div>
      `;
    }
  }
}

// Load teacher's courses and landing settings from backend
async function loadTeacherCourses() {
  try {
    // Get teacher ID from sessionStorage
    const teacherId = sessionStorage.getItem('currentTeacherId');
    
    if (!teacherId) {
      console.error('❌ Teacher ID not found in sessionStorage');
      return;
    }
    
    console.log('📚 Loading courses for teacher:', teacherId);
    
    // Get API base URL from env
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    // Fetch teacher's landing settings first
    try {
      const landingResponse = await fetch(`${apiBaseUrl}/landing/public/${teacherId}`);
      const landingResult = await landingResponse.json();
      
      if (landingResult.success && landingResult.landing) {
        console.log('✅ Landing settings loaded:', landingResult.landing);
        applyLandingTheme(landingResult.landing);
      }
    } catch (error) {
      console.error('⚠️ Could not load landing settings:', error);
    }
    
    // Fetch teacher's courses
    const response = await fetch(`${apiBaseUrl}/courses?teacher=${teacherId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success && result.courses) {
      console.log('✅ Courses loaded:', result.courses);
      
      // Store courses globally
      allCoursesData = result.courses;
      
      // Update the courses grid with real data
      updateCoursesGrid(result.courses);
      
      // Update stats
      updateStats(result.courses);
    } else {
      console.error('❌ Failed to load courses:', result.message || 'No courses found');
    }
  } catch (error) {
    console.error('❌ Error loading courses:', error);
  }
}

// Update courses grid with real data
async function updateCoursesGrid(courses, isEnrolledView = false) {
  const coursesGrid = document.querySelector('.landing-courses-grid');
  
  if (!coursesGrid) {
    console.error('❌ Courses grid not found');
    return;
  }
  
  if (!courses || courses.length === 0) {
    coursesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #9CA3AF;">
        <p>No courses available yet</p>
      </div>
    `;
    return;
  }
  
  console.log('📝 Rendering courses:', courses);
  
  // Get student ID
  let studentId = null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user._id) {
    studentId = user._id;
  } else {
    const landingUser = sessionStorage.getItem('landingUser');
    if (landingUser) {
      try {
        const userData = JSON.parse(landingUser);
        if (userData._id) {
          studentId = userData._id;
        }
      } catch (error) {
        console.error('Error parsing landing user:', error);
      }
    }
  }
  
  // Check enrollment and progress for each course
  const coursesWithEnrollment = await Promise.all(courses.map(async (course) => {
    let isEnrolled = false;
    let progressPercentage = 0;
    
    if (studentId) {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
        
        // Check enrollment
        const enrollResponse = await fetch(`${apiBaseUrl}/students/${studentId}/check-enrollment/${course._id}`);
        const enrollResult = await enrollResponse.json();
        if (enrollResult.success) {
          isEnrolled = enrollResult.isEnrolled;
        }
        
        // Get progress if enrolled
        if (isEnrolled) {
          const progressResponse = await fetch(`${apiBaseUrl}/students/${studentId}/progress/${course._id}`);
          const progressResult = await progressResponse.json();
          if (progressResult.success && progressResult.progress) {
            progressPercentage = progressResult.progress.progressPercentage || 0;
          }
        }
      } catch (error) {
        console.error('Error checking enrollment/progress:', error);
      }
    }
    return { ...course, isEnrolled, progressPercentage };
  }));
  
  // Generate course cards from real data
  coursesGrid.innerHTML = coursesWithEnrollment.map(course => {
    // Use real progress from backend
    const progress = course.progressPercentage || 0;
    const hasStarted = course.isEnrolled; // Show progress bar if enrolled
    
    // Get teacher name
    const teacherName = course.teacher 
      ? `${course.teacher.firstName || ''} ${course.teacher.lastName || ''}`.trim() || 'Instructor'
      : 'Instructor';
    
    // Get course image (field name is 'thumbnail' in database)
    const courseImage = course.thumbnail || course.courseImage || '';
    
    console.log('Course:', {
      title: course.title,
      image: courseImage,
      teacher: teacherName,
      duration: course.duration,
      courseType: course.courseType,
      price: course.price,
      rawCourse: course
    });
    
    return `
      <div class="landing-course-card">
        <div class="landing-course-thumbnail">
          ${courseImage 
            ? `<img src="${courseImage}" alt="${course.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />`
            : `<svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                <rect width="80" height="60" rx="8" fill="#374151"/>
                <rect x="20" y="15" width="40" height="30" rx="4" fill="#E5E7EB"/>
              </svg>`
          }
        </div>
        ${hasStarted ? `
        <div class="landing-course-progress-bar">
          <div class="landing-course-progress-label">
            <span>Progress</span>
            <span>${progress}%</span>
          </div>
          <div class="landing-progress-track">
            <div class="landing-progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        ` : ''}
        ${!hasStarted ? `<div style="height: 60px;"></div>` : ''}
        <div class="landing-course-info">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 class="landing-course-title" style="margin-bottom: 0; flex: 1;">${course.title || 'Untitled Course'}</h3>
            <span class="landing-course-price">${course.courseType === 'free' ? 'Bepul' : `${(course.price || 0).toLocaleString('uz-UZ')} so'm`}</span>
          </div>
          <p class="landing-course-instructor">${teacherName}</p>
          <p class="landing-course-meta">${course.duration || 'Self-paced'} • ${course.level || 'All levels'} • ${course.totalStudents || 0} o'quvchi</p>
        </div>
        <button class="landing-continue-btn" onclick="openCourse('${course._id}', '${course.courseType || 'free'}')">${course.isEnrolled ? 'Continue learning' : 'Start learning'}</button>
      </div>
    `;
  }).join('');
}

// Update stats with real data
function updateStats(courses) {
  // Count active courses
  const activeCourses = courses.filter(c => c.status === 'active' || !c.status).length;
  
  // Update stat cards
  const statCards = document.querySelectorAll('.landing-stat-card');
  if (statCards[0]) {
    statCards[0].querySelector('.landing-stat-value').textContent = activeCourses;
  }
}

// Open course - Check enrollment first, then navigate
window.openCourse = async function(courseId, courseType = 'free') {
  console.log('Opening course:', courseId, 'courseType:', courseType);
  
  if (courseType !== 'free') {
    // For paid courses, show coming soon toast
    showToast('Coming soon');
    return;
  }

  // Get student ID
  let studentId = null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user._id) {
    studentId = user._id;
  } else {
    const landingUser = sessionStorage.getItem('landingUser');
    if (landingUser) {
      try {
        const userData = JSON.parse(landingUser);
        if (userData._id) {
          studentId = userData._id;
        }
      } catch (error) {
        console.error('Error parsing landing user:', error);
      }
    }
  }

  if (!studentId) {
    // No student ID, go to course start page
    window.location.href = `/course-start/${courseId}`;
    return;
  }

  // Check if already enrolled
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/students/${studentId}/check-enrollment/${courseId}`);
    const result = await response.json();
    
    if (result.success && result.isEnrolled) {
      // Already enrolled, go directly to course learning
      console.log('✅ Already enrolled, going to course learning');
      window.location.href = `/course-learning/${courseId}`;
    } else {
      // Not enrolled, go to course start page
      console.log('📝 Not enrolled, going to course start page');
      window.location.href = `/course-start/${courseId}`;
    }
  } catch (error) {
    console.error('❌ Error checking enrollment:', error);
    // On error, go to course start page
    window.location.href = `/course-start/${courseId}`;
  }
};

 


// Add navigation event listeners for sidebar
setTimeout(() => {
  document.querySelectorAll('.landing-nav-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      
      // Remove active class from all items
      document.querySelectorAll('.landing-nav-item').forEach(i => i.classList.remove('active'));
      // Add active to clicked item
      item.classList.add('active');
      
      // Handle navigation
      if (page === 'home') {
        // Reload dashboard home
        const { initLandingStudentDashboard } = await import('./landing-student-dashboard.js');
        initLandingStudentDashboard();
      } else {
        console.log('Navigate to:', page);
        // Add other page handlers here
      }
    });
  });
}, 100);
