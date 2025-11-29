// Initialize function called from dashboard.js
export function initLandingStudentDashboard() {
  // Clear body and set up for dashboard
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  
  renderLandingStudentDashboard();
}

export function renderLandingStudentDashboard() {
  // Render directly to body
  const container = document.body;

  // Get user data from localStorage or sessionStorage
  const userData = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("landingUser") || "{}");
  const userName = userData.name || "John Derting";
  const userLevel = userData.level || 5;
  const userPoints = userData.points || 1240;

  container.innerHTML = `
    <style>
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
        border-right: 1px solid rgba(126, 162, 212, 0.2);
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
        background: rgba(126, 162, 212, 0.3);
        border-radius: 2px;
      }

      .landing-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(126, 162, 212, 0.5);
      }

      /* Profile Section */
      .landing-profile-section {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
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
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 15px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .landing-nav-parent:hover {
        background: rgba(126, 162, 212, 0.1);
        border-color: #7ea2d4;
      }

      .landing-nav-parent.expanded {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: none;
      }

      .landing-nav-title {
        color: #7ea2d4;
        font-size: 14px;
        font-weight: 500;
      }

      .landing-nav-arrow {
        color: #7ea2d4;
        font-size: 10px;
        transition: transform 0.3s ease;
      }

      .landing-nav-arrow.rotated {
        transform: rotate(90deg);
      }

      .landing-nav-children {
        background: rgba(40, 40, 40, 0.8);
        border-left: 0.5px solid rgba(126, 162, 212, 0.2);
        border-right: 0.5px solid rgba(126, 162, 212, 0.2);
        border-bottom: 0.5px solid rgba(126, 162, 212, 0.2);
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
        border-top: 1px solid rgba(126, 162, 212, 0.2);
      }

      .landing-support-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.15), rgba(126, 162, 212, 0.05));
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 15px;
        color: #7ea2d4;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
      }

      .landing-support-btn:hover {
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.25), rgba(126, 162, 212, 0.15));
        border-color: #7ea2d4;
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
        background: rgba(126, 162, 212, 0.3);
        border-radius: 4px;
      }

      .landing-main-content::-webkit-scrollbar-thumb:hover {
        background: rgba(126, 162, 212, 0.5);
      }

      /* Header */
      .landing-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 40px;
        background: #232323;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
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
        color: #7EA2D4;
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
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        color: #9CA3AF;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .landing-icon-btn:hover {
        background: rgba(126, 162, 212, 0.1);
        color: #ffffff;
        border-color: #7ea2d4;
      }

      .landing-notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 18px;
        height: 18px;
        background: #EF4444;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }

      /* Dashboard Content */
      .landing-dashboard-content {
        padding: 40px;
      }

      /* Welcome Card */
      .landing-welcome-card {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
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
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .landing-stat-card:hover {
        background: rgba(58, 56, 56, 0.4);
        border-color: #7ea2d4;
        transform: translateY(-4px);
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

      .landing-section-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 24px;
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
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
      }

      .landing-course-card:hover {
        background: rgba(58, 56, 56, 0.4);
        border-color: #7ea2d4;
        transform: translateY(-4px);
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
        background: rgba(126, 162, 212, 0.2);
        border: 1px solid rgba(126, 162, 212, 0.5);
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .landing-continue-btn:hover {
        background: rgba(126, 162, 212, 0.3);
        border-color: #7EA2D4;
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
            <div class="landing-profile-name">${userName}</div>
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
              <a class="landing-nav-item" data-page="courses">My Courses</a>
              <a class="landing-nav-item" data-page="messages">Messages</a>
              <a class="landing-nav-item" data-page="assignments">Assignments</a>
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
            <button class="landing-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button class="landing-icon-btn landing-notification-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="landing-notification-badge">3</span>
            </button>
            <button class="landing-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button class="landing-icon-btn landing-menu-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="landing-dashboard-content">
          <!-- Welcome Section -->
          <div class="landing-welcome-card">
            <h1 class="landing-welcome-title">Welcome back, ${userName.split(' ')[0]} !</h1>
            <p class="landing-welcome-subtitle">Continue your learning journey and achieve your goals</p>
          </div>

          <!-- Stats Cards -->
          <div class="landing-stats-grid">
            <div class="landing-stat-card">
              <div class="landing-stat-value">3</div>
              <div class="landing-stat-label">Active Courses</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">${userPoints.toLocaleString()}</div>
              <div class="landing-stat-label">Total Points</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">2</div>
              <div class="landing-stat-label">Certificates</div>
            </div>
          </div>

          <!-- Continue Learning Section -->
          <div class="landing-learning-section">
            <h2 class="landing-section-title">Continue Learning</h2>
            <div class="landing-courses-grid">
              ${generateCourseCards()}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  attachEventListeners();
}

function generateCourseCards() {
  const courses = [
    {
      id: 1,
      title: "React Masterclass 2025",
      instructor: "John Derting",
      progress: 65,
      lessons: "21/47 lessons",
      duration: "3.2 hrs left"
    },
    {
      id: 2,
      title: "React Masterclass 2025",
      instructor: "John Derting",
      progress: 65,
      lessons: "20/47 lessons",
      duration: "3.2 hrs left"
    },
    {
      id: 3,
      title: "React Masterclass 2025",
      instructor: "John Derting",
      progress: 65,
      lessons: "20/47 lessons",
      duration: "3.2 hrs left"
    }
  ];

  return courses.map(course => `
    <div class="landing-course-card">
      <div class="landing-course-thumbnail">
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect width="80" height="60" rx="8" fill="#374151"/>
          <rect x="20" y="15" width="40" height="30" rx="4" fill="#E5E7EB"/>
        </svg>
      </div>
      <div class="landing-course-progress-bar">
        <div class="landing-course-progress-label">
          <span>Progress</span>
          <span>${course.progress}%</span>
        </div>
        <div class="landing-progress-track">
          <div class="landing-progress-fill" style="width: ${course.progress}%"></div>
        </div>
      </div>
      <div class="landing-course-info">
        <h3 class="landing-course-title">${course.title}</h3>
        <p class="landing-course-instructor">${course.instructor}</p>
        <p class="landing-course-meta">${course.lessons} • ${course.duration}</p>
      </div>
      <button class="landing-continue-btn">Continue learning</button>
    </div>
  `).join('');
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

  // Continue learning buttons
  document.querySelectorAll('.landing-continue-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.landing-course-card');
      console.log('Continue learning clicked', card);
    });
  });
}

function handleNavigation(page) {
  console.log('Navigate to:', page);
  // Add your navigation logic here
}
