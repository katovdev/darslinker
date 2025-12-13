// Import i18n functions
import { t, getCurrentLanguage, setLanguage, initI18n } from '../../utils/i18n.js';

// Initialize function called from dashboard.jsana
export async function initLandingStudentDashboard() {
  // Initialize i18n
  await initI18n();
  // Clear body and set up for dashboard
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';

  // Load teacher theme BEFORE rendering to prevent color flash
  await loadTeacherTheme();

  // Add language change listener
  window.addEventListener('languageChanged', () => {
    console.log('Language changed, re-rendering dashboard...');
    setTimeout(() => {
      renderLandingStudentDashboard();
    }, 100);
  });

  renderLandingStudentDashboard();

  // Load notification count in background (don't wait)
  loadNotificationCount();

  // Load teacher's courses after rendering
  loadTeacherCourses();
}

// Global variable to store teacher theme
let teacherTheme = {
  primaryColor: '#7ea2d4',
  backgroundColor: '#232323',
  textColor: '#ffffff',
  logoText: 'darslinker'
};

// Global variable to store notification count
// Global variable to store notification count
let notificationCount = 0;

// Get logo HTML based on teacher theme
function getLogoHTML() {
  const logoText = teacherTheme.logoText || 'darslinker';
  const lowerText = logoText.toLowerCase();
  
  if (lowerText.includes('linker')) {
    const parts = logoText.split(/linker/i);
    const firstPart = parts[0] || '';
    return `<span class="landing-logo-text">${firstPart}<span class="landing-logo-highlight">linker</span></span>`;
  } else {
    return `<span class="landing-logo-text">${logoText}</span>`;
  }
}

// Load teacher theme early to prevent color flash
async function loadTeacherTheme() {
  try {
    // Get teacher ID from sessionStorage
    const teacherId = sessionStorage.getItem('currentTeacherId');

    if (!teacherId) {
      console.log('⚠️ No teacher ID found, using default theme');
      return;
    }

    console.log('🎨 Loading teacher theme early for:', teacherId);

    // Get API base URL from env
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    // Fetch teacher's landing settings
    const landingResponse = await fetch(`${apiBaseUrl}/landing/public/${teacherId}`);
    const landingResult = await landingResponse.json();

    if (landingResult.success && landingResult.landing) {
      console.log('✅ Teacher theme loaded early:', landingResult.landing);
      // Store theme globally
      teacherTheme = {
        primaryColor: landingResult.landing.primaryColor || '#7ea2d4',
        backgroundColor: landingResult.landing.backgroundColor || '#232323',
        textColor: landingResult.landing.textColor || '#ffffff',
        logoText: landingResult.landing.logoText || 'darslinker'
      };
      applyLandingTheme(landingResult.landing);
    } else {
      console.log('⚠️ No landing settings found, using default theme');
    }
  } catch (error) {
    console.error('⚠️ Could not load teacher theme early:', error);
  }
}

export function renderLandingStudentDashboard() {
  console.log('🎨 Rendering dashboard... notificationCount:', notificationCount);
  
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
        color: var(--primary-color, #7ea2d4);
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

      /* Mobile Menu Toggle Button */
      .landing-mobile-menu-toggle {
        display: none;
        position: fixed;
        top: 22px;
        left: 18px;
        z-index: 1001;
        background: transparent;
        border: none;
        color: var(--primary-color);
        padding: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .landing-mobile-menu-toggle:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }

      /* Mobile Sidebar Overlay */
      .landing-sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .landing-sidebar-overlay.active {
        opacity: 1;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .landing-courses-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 968px) {
        .landing-mobile-menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-sidebar {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        .landing-sidebar.mobile-open {
          transform: translateX(0);
        }

        .landing-main-content {
          margin-left: 0;
        }

        .landing-header {
          padding: 20px 20px 20px 70px;
        }

        .landing-stats-grid,
        .landing-courses-grid {
          grid-template-columns: 1fr;
        }

        .landing-dashboard-content {
          padding: 24px 20px;
        }

        .landing-welcome-card {
          padding: 24px;
        }

        .landing-welcome-title {
          font-size: 24px;
        }
      }

      @media (max-width: 480px) {
        .landing-header {
          padding: 15px 15px 15px 60px;
        }

        .landing-dashboard-content {
          padding: 20px 15px;
        }

        .landing-welcome-card {
          padding: 20px;
        }

        .landing-welcome-title {
          font-size: 20px;
        }

        .landing-welcome-subtitle {
          font-size: 14px;
        }

        .landing-stat-card {
          padding: 24px;
        }

        .landing-stat-value {
          font-size: 36px;
        }

        .landing-header-actions {
          gap: 8px;
        }

        .landing-logout-btn .landing-logout-text {
          display: none;
        }

        .landing-logout-btn {
          width: 40px !important;
          padding: 0 !important;
        }
      }
    </style>

    <div class="landing-dashboard-container">
      <!-- Mobile Menu Toggle -->
      <button class="landing-mobile-menu-toggle" onclick="toggleMobileSidebar()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Sidebar Overlay -->
      <div class="landing-sidebar-overlay" onclick="closeMobileSidebar()"></div>

      <!-- Sidebar -->
      <aside class="landing-sidebar" id="landing-sidebar">
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
              <span class="landing-nav-title">${t('sidebar.general')}</span>
              <span class="landing-nav-arrow" id="general-arrow">▶</span>
            </div>
            <div class="landing-nav-children hidden" id="general-children">
              <a class="landing-nav-item active" data-page="home">${t('sidebar.home')}</a>
              <a class="landing-nav-item" data-page="messages">${t('sidebar.messages')}</a>
            </div>
          </div>



          <!-- Account Section -->
          <div class="landing-nav-section">
            <div class="landing-nav-parent" onclick="toggleLandingMenu('account')">
              <span class="landing-nav-title">${t('sidebar.account')}</span>
              <span class="landing-nav-arrow" id="account-arrow">▶</span>
            </div>
            <div class="landing-nav-children hidden" id="account-children">
              <a class="landing-nav-item" data-page="language">${t('sidebar.language')}</a>
              <a class="landing-nav-item" data-page="edit-profile">${t('sidebar.editProfile')}</a>
            </div>
          </div>
        </nav>

        <!-- Support Button -->
        <div class="landing-sidebar-footer">
          <button class="landing-support-btn">${t('sidebar.support')}</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="landing-main-content">
        <!-- Header -->
        <header class="landing-header">
          <div class="landing-header-logo">
            ${getLogoHTML()}
          </div>
          <div class="landing-header-actions">
            <button class="landing-icon-btn landing-meeting-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button class="landing-icon-btn landing-notification-btn" onclick="openStudentNotifications()" style="position: relative;">
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
            <button class="landing-icon-btn landing-logout-btn" title="${t('dashboard.logout')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="landing-logout-text">${t('dashboard.logout')}</span>
            </button>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="landing-dashboard-content">
          <!-- Welcome Section -->
          <div class="landing-welcome-card">
            <h1 class="landing-welcome-title">${t('dashboard.welcomeBack', { name: firstName })}</h1>
            <p class="landing-welcome-subtitle">${t('dashboard.continueJourney')}</p>
          </div>

          <!-- Stats Cards -->
          <div class="landing-stats-grid">
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">${t('dashboard.activeCourses')}</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">${t('dashboard.totalPoints')}</div>
            </div>
            <div class="landing-stat-card">
              <div class="landing-stat-value">0</div>
              <div class="landing-stat-label">${t('dashboard.certificates')}</div>
            </div>
          </div>

          <!-- Continue Learning Section -->
          <div class="landing-learning-section">
            <div class="landing-course-filters">
              <button class="landing-filter-tab" data-filter="my-courses">${t('dashboard.myCourses')}</button>
              <button class="landing-filter-tab active" data-filter="all-courses">${t('dashboard.allCourses')}</button>
            </div>
            <div class="landing-courses-grid">
              <!-- Loading spinner will be shown here -->
              <div class="landing-courses-loading" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid color-mix(in srgb, var(--primary-color) 20%, transparent); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #9CA3AF; margin-top: 20px; font-size: 14px;">${t('dashboard.loadingCourses')}</p>
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

// Mobile sidebar functions
window.toggleMobileSidebar = function() {
  const sidebar = document.getElementById('landing-sidebar');
  const overlay = document.querySelector('.landing-sidebar-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('mobile-open')) {
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = 'auto';
    }
  }
};

window.closeMobileSidebar = function() {
  const sidebar = document.getElementById('landing-sidebar');
  const overlay = document.querySelector('.landing-sidebar-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
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
      
      // Close mobile sidebar on navigation
      closeMobileSidebar();
    });
  });

  // Support button
  const supportBtn = document.querySelector('.landing-support-btn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      alert(t('common.comingSoon'));
    });
  }

  // Meeting button - show coming soon toast
  const meetingBtn = document.querySelector('.landing-meeting-btn');
  if (meetingBtn) {
    meetingBtn.addEventListener('click', () => {
      showToast(t('common.comingSoon'));
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
  // Get teacher ID before clearing session
  const teacherId = sessionStorage.getItem('currentTeacherId');
  
  // Clear session storage
  sessionStorage.removeItem('landingUser');
  sessionStorage.removeItem('currentTeacherId');
  
  // Show toast
  showToast(t('dashboard.loggingOut'));
  
  // Redirect to teacher landing page after short delay
  setTimeout(() => {
    if (teacherId) {
      window.location.href = `/teacher/${teacherId}`;
    } else {
      window.location.href = '/';
    }
  }, 1000);
}

function handleNavigation(page) {
  console.log('Navigate to:', page);

  if (page === 'home') {
    // Reload dashboard home
    initLandingStudentDashboard();
  } else if (page === 'messages') {
    // Show coming soon for messages
    showToast(t('common.comingSoon'));
  } else if (page === 'language') {
    // Show language selection page
    showLanguagePage();
  } else if (page === 'edit-profile') {
    // Show edit profile page
    showEditProfilePage();
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
          <p style="color: #9CA3AF; font-size: 16px; margin-bottom: 8px;">${t('dashboard.noEnrolledCourses')}</p>
          <p style="color: #6B7280; font-size: 14px;">${t('dashboard.browseAllCourses')}</p>
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

// Load notification count and update badge
async function loadNotificationCount() {
  console.log('🔔 Loading notification count... Current count:', notificationCount);
  
  try {
    // Get student ID
    const landingUser = sessionStorage.getItem('landingUser');
    if (!landingUser) {
      console.log('⚠️ No landing user found');
      return;
    }
    
    const userData = JSON.parse(landingUser);
    const studentId = userData._id;
    
    if (!studentId) {
      console.log('⚠️ No student ID found');
      return;
    }
    
    console.log('📡 Fetching notifications for student:', studentId);
    
    // Get API base URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    // Fetch all notifications and count unread ones
    const response = await fetch(`${apiBaseUrl}/notifications/user/${studentId}?userType=Student`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    console.log('📬 API Response:', result);
    
    if (result.success) {
      // Use unreadCount from backend if available, otherwise count manually
      const unreadCount = result.unreadCount !== undefined 
        ? result.unreadCount 
        : (result.notifications ? result.notifications.filter(n => !n.isRead).length : 0);
      
      notificationCount = unreadCount;
      console.log('✅ Notification count updated to:', notificationCount, '(from backend:', result.unreadCount, ')');
      
      // Update badge
      const badge = document.getElementById('notification-badge');
      if (badge) {
        console.log('🎯 Updating badge element...');
        if (notificationCount > 0) {
          badge.textContent = notificationCount;
          badge.style.display = 'block';
          console.log('✅ Badge shown with count:', notificationCount);
        } else {
          badge.style.display = 'none';
          console.log('❌ Badge hidden (no notifications)');
        }
      } else {
        console.log('⚠️ Badge element not found!');
      }
    } else {
      console.log('📭 No unread notifications');
    }
  } catch (error) {
    console.error('❌ Error loading notification count:', error);
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
        <p>${t('dashboard.noCoursesAvailable')}</p>
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
            <span>${t('dashboard.progress')}</span>
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
            <span class="landing-course-price">${course.courseType === 'free' ? t('dashboard.free') : `${(course.price || 0).toLocaleString('uz-UZ')} ${t('dashboard.sum')}`}</span>
          </div>
          <p class="landing-course-instructor">${teacherName}</p>
          <p class="landing-course-meta">${course.duration || t('dashboard.selfPaced')} • ${course.level || t('dashboard.allLevels')} • ${course.totalStudents || 0} ${t('dashboard.students')}</p>
        </div>
        <button class="landing-continue-btn" onclick="openCourse('${course._id}', '${course.courseType || 'free'}')">${course.isEnrolled ? t('dashboard.continueLearning') : t('dashboard.startLearning')}</button>
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
    showToast(t('common.comingSoon'));
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
      } else if (page === 'language') {
        // Show language selection page
        showLanguagePage();
      } else if (page === 'edit-profile') {
        // Show edit profile page
        showEditProfilePage();
      } else {
        console.log('Navigate to:', page);
        // Add other page handlers here
      }
    });
  });
}, 100);
// Student notification function
window.openStudentNotifications = async function() {
  const userId = JSON.parse(sessionStorage.getItem('landingUser') || '{}')._id;
  if (!userId) { 
    alert('No user found'); 
    return; 
  }
  
  const content = document.querySelector('.landing-dashboard-content');
  content.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--primary-color); font-size: 18px;">${t('notifications.loading')}</div>`;
  
  try {
    const response = await fetch('http://localhost:8001/api/notifications/user/' + userId + '?userType=Student');
    const data = await response.json();
    
    if (data.success) {
      const notifs = data.notifications || [];
      const unreadCount = notifs.filter(n => !n.read).length;

      let notificationCards = '';
      if (notifs.length > 0) {
        notificationCards = notifs.map(n => {
          const isUnread = !n.read;
          const date = new Date(n.createdAt);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          let timeAgo = t('notifications.justNow');
          if (diffMins >= 1 && diffMins < 60) {
            timeAgo = t('notifications.minuteAgo', {
              count: diffMins,
              plural: diffMins > 1 ? 's' : ''
            });
          } else if (diffHours >= 1 && diffHours < 24) {
            timeAgo = t('notifications.hourAgo', {
              count: diffHours,
              plural: diffHours > 1 ? 's' : ''
            });
          } else if (diffDays >= 1) {
            timeAgo = t('notifications.dayAgo', {
              count: diffDays,
              plural: diffDays > 1 ? 's' : ''
            });
          }
          
          // Translate notification title and message based on type
          let translatedTitle = n.title;
          let translatedMessage = n.message;
          
          // Map notification types to translation keys
          if (n.type === 'assignment_graded') {
            translatedTitle = t('notifications.assignmentGraded');
            // Extract lesson title and grade from original message if available
            const lessonMatch = n.message.match(/Your assignment "([^"]+)" has been graded/);
            const gradeMatch = n.message.match(/Grade: (\d+)%/);
            const lessonTitle = lessonMatch ? lessonMatch[1] : 'Assignment';
            const grade = gradeMatch ? gradeMatch[1] : '';
            
            if (grade) {
              translatedMessage = `${t('notifications.assignmentGradedMessage')}: "${lessonTitle}". ${t('notifications.grade')}: ${grade}%`;
            } else {
              translatedMessage = `${t('notifications.assignmentGradedMessage')}: "${lessonTitle}"`;
            }
          } else if (n.type === 'new_assignment') {
            translatedTitle = t('notifications.newAssignment');
            translatedMessage = t('notifications.newAssignmentMessage');
          } else if (n.type === 'course_update') {
            translatedTitle = t('notifications.courseUpdate');
            translatedMessage = t('notifications.courseUpdateMessage');
          } else if (n.type === 'new_lesson') {
            translatedTitle = t('notifications.newLesson');
            translatedMessage = t('notifications.newLessonMessage');
          } else if (n.type === 'certificate_earned') {
            translatedTitle = t('notifications.certificateEarned');
            translatedMessage = t('notifications.certificateEarnedMessage');
          }

          return `
            <div onclick="markAsRead('${n._id}')" 
                 style="background: ${isUnread ? 'rgba(126, 162, 212, 0.1)' : 'rgba(58, 56, 56, 0.3)'}; 
                        border: 1px solid rgba(126, 162, 212, 0.2); 
                        border-radius: 12px; 
                        padding: 20px; 
                        cursor: pointer; 
                        transition: all 0.2s; 
                        ${isUnread ? 'border-left: 4px solid var(--primary-color);' : ''}" 
                 id="notif-${n._id}"
                 onmouseover="this.style.background='rgba(58, 56, 56, 0.5)'"
                 onmouseout="this.style.background='${isUnread ? 'rgba(126, 162, 212, 0.1)' : 'rgba(58, 56, 56, 0.3)'}'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="font-weight: 600; font-size: 16px; color: #ffffff;">${translatedTitle}</div>
                ${isUnread ? '<div style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; margin-top: 4px;"></div>' : ''}
              </div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.5; margin-bottom: 10px;">${translatedMessage}</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.5);">${timeAgo}</div>
            </div>
          `;
        }).join('');
      }
      
      // Format unread count text
      let unreadText = t('notifications.allCaughtUp');
      if (unreadCount > 0) {
        unreadText = t('notifications.unreadCount', {
          count: unreadCount,
          plural: unreadCount > 1 ? 's' : ''
        });
      }

      content.innerHTML = `
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div>
              <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${t('notifications.title')}</h2>
              <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 14px;">
                ${unreadText}
              </p>
            </div>
            <button onclick="location.reload()" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">${t('notifications.back')}</button>
          </div>
          ${notifs.length === 0 ?
            `<div style="text-align: center; padding: 80px 20px; color: rgba(255,255,255,0.5);">
              <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;">🔔</div>
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: rgba(255,255,255,0.7);">${t('notifications.noNotificationsYet')}</div>
            </div>` :
            `<div style="display: flex; flex-direction: column; gap: 15px;">${notificationCards}</div>`
          }
        </div>
      `;
      
      document.getElementById('notification-badge').style.display = 'none';
    }
  } catch (e) {
    content.innerHTML = `<div style="padding: 40px; text-align: center; color: #EF4444;">${t('notifications.errorLoading')}</div>`;
  }
};

// Mark notification as read
window.markAsRead = function(notificationId) {
  fetch('http://localhost:8001/api/notifications/' + notificationId + '/read', {
    method: 'PATCH'
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      const notifElement = document.getElementById('notif-' + notificationId);
      if (notifElement) {
        notifElement.style.background = 'rgba(58, 56, 56, 0.3)';
        notifElement.style.borderLeft = 'none';
        const dot = notifElement.querySelector('div[style*="width: 8px"]');
        if (dot) dot.remove();
      }
    }
  })
  .catch(e => {});
};

// Show language selection page
function showLanguagePage() {
  const content = document.querySelector('.landing-dashboard-content');

  // Get current language from localStorage or default to 'en'
  const currentLang = localStorage.getItem('language') || 'en';

  // Set initial selected language
  selectedLanguage = currentLang;

  content.innerHTML = `
    <div style="padding: 40px; max-width: 1000px; width: 100%; margin: 0 auto;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: white; font-size: 28px; font-weight: 700; margin-bottom: 10px;">${t('language.settings')}</h2>
        <p style="color: rgba(255,255,255,0.7); font-size: 16px;">${t('language.choosePreferred')}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
        <div onclick="selectLanguage('en')"
             style="display: flex; align-items: center; height: 70px; padding: 20px; background: rgba(58, 56, 56, 0.3); border: 2px solid ${currentLang === 'en' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; outline: none; box-shadow: none;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; margin-right: 20px; flex-shrink: 0;">E</div>
          <span style="font-size: 18px; font-weight: 600; color: white; flex: 1;">${t('language.english')}</span>
          <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${currentLang === 'en' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.3)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${currentLang === 'en' ? 'background: var(--primary-color);' : ''}">
            ${currentLang === 'en' ? '<span style="color: white; font-size: 12px; font-weight: 700;">✓</span>' : ''}
          </div>
        </div>

        <div onclick="selectLanguage('uz')"
             style="display: flex; align-items: center; height: 70px; padding: 20px; background: rgba(58, 56, 56, 0.3); border: 2px solid ${currentLang === 'uz' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; outline: none; box-shadow: none;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; margin-right: 20px; flex-shrink: 0;">U</div>
          <span style="font-size: 18px; font-weight: 600; color: white; flex: 1;">${t('language.uzbek')}</span>
          <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${currentLang === 'uz' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.3)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${currentLang === 'uz' ? 'background: var(--primary-color);' : ''}">
            ${currentLang === 'uz' ? '<span style="color: white; font-size: 12px; font-weight: 700;">✓</span>' : ''}
          </div>
        </div>

        <div onclick="selectLanguage('ru')"
             style="display: flex; align-items: center; height: 70px; padding: 20px; background: rgba(58, 56, 56, 0.3); border: 2px solid ${currentLang === 'ru' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; outline: none; box-shadow: none;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; margin-right: 20px; flex-shrink: 0;">R</div>
          <span style="font-size: 18px; font-weight: 600; color: white; flex: 1;">${t('language.russian')}</span>
          <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${currentLang === 'ru' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.3)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${currentLang === 'ru' ? 'background: var(--primary-color);' : ''}">
            ${currentLang === 'ru' ? '<span style="color: white; font-size: 12px; font-weight: 700;">✓</span>' : ''}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 16px;">
        <button onclick="applyLanguageChanges()"
                style="flex: 1; padding: 16px; background: var(--primary-color); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          ${t('language.applyChanges')}
        </button>
        <button onclick="cancelLanguageChanges()"
                style="flex: 1; padding: 16px; background: transparent; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 12px; color: rgba(255, 255, 255, 0.8); font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          ${t('common.cancel')}
        </button>
      </div>
    </div>
  `;
}

// Show edit profile page
function showEditProfilePage() {
  const content = document.querySelector('.landing-dashboard-content');

  // Get user data
  const landingUser = sessionStorage.getItem('landingUser');
  let userData = {};
  if (landingUser) {
    try {
      userData = JSON.parse(landingUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  content.innerHTML = `
    <div style="padding: 40px; max-width: 1000px; width: 100%; margin: 0 auto;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: white; font-size: 28px; font-weight: 700; margin-bottom: 10px;">${t('profile.editProfile')}</h2>
        <p style="color: rgba(255,255,255,0.7); font-size: 16px;">${t('profile.updateInfo')}</p>
      </div>

      <form onsubmit="saveProfileChanges(event)" style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <label style="display: block; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; margin-bottom: 8px;">${t('profile.firstName')}</label>
          <input type="text" id="firstName" value="${userData.firstName || ''}"
                 style="width: 100%; padding: 16px; background: rgba(58, 56, 56, 0.8); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-size: 16px; transition: all 0.3s ease;"
                 placeholder="${t('profile.enterFirstName')}" required>
        </div>

        <div>
          <label style="display: block; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; margin-bottom: 8px;">${t('profile.lastName')}</label>
          <input type="text" id="lastName" value="${userData.lastName || ''}"
                 style="width: 100%; padding: 16px; background: rgba(58, 56, 56, 0.8); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-size: 16px; transition: all 0.3s ease;"
                 placeholder="${t('profile.enterLastName')}" required>
        </div>

        <div>
          <label style="display: block; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; margin-bottom: 8px;">${t('profile.phone')}</label>
          <input type="tel" id="phone" value="${userData.phone || ''}"
                 style="width: 100%; padding: 16px; background: rgba(58, 56, 56, 0.8); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-size: 16px; transition: all 0.3s ease;"
                 placeholder="${t('profile.enterPhone')}">
        </div>

        <div style="display: flex; gap: 16px; margin-top: 20px;">
          <button type="submit"
                  style="flex: 1; padding: 16px; background: var(--primary-color); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            ${t('profile.saveChanges')}
          </button>
          <button type="button" onclick="cancelProfileChanges()"
                  style="flex: 1; padding: 16px; background: transparent; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 12px; color: rgba(255, 255, 255, 0.8); font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            ${t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  `;

  // Add focus styles
  const inputs = content.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.borderColor = 'var(--primary-color)';
      this.style.background = 'rgba(58, 56, 56, 1)';
    });
    input.addEventListener('blur', function() {
      this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      this.style.background = 'rgba(58, 56, 56, 0.8)';
    });
  });
}

// Language selection functions
let selectedLanguage = null;

window.selectLanguage = function(lang) {
  selectedLanguage = lang;
  console.log('Selected language:', lang);

  // Update all language options by checking onclick attribute
  const content = document.querySelector('.landing-dashboard-content');
  const languageOptions = content.querySelectorAll('div[onclick^="selectLanguage"]');

  languageOptions.forEach(option => {
    const clickHandler = option.getAttribute('onclick');
    const isSelected = clickHandler && clickHandler.includes(`'${lang}'`);

    if (isSelected) {
      // Selected state
      option.style.border = '2px solid var(--primary-color)';
      const checkmark = option.querySelector('div:last-child');
      if (checkmark) {
        checkmark.style.background = 'var(--primary-color)';
        checkmark.style.border = '2px solid var(--primary-color)';
        checkmark.innerHTML = '<span style="color: white; font-size: 12px; font-weight: 700;">✓</span>';
      }
    } else {
      // Unselected state
      option.style.border = '2px solid rgba(255, 255, 255, 0.1)';
      const checkmark = option.querySelector('div:last-child');
      if (checkmark) {
        checkmark.style.background = 'transparent';
        checkmark.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        checkmark.innerHTML = '';
      }
    }
  });
};

window.applyLanguageChanges = function() {
  if (selectedLanguage) {
    // Set the language first
    setLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);

    showToast(t('language.updated'));

    // Reload page with new language
    setTimeout(() => {
      initLandingStudentDashboard();
    }, 1000);
  }
};

window.cancelLanguageChanges = function() {
  // Go back to dashboard
  initLandingStudentDashboard();
};

// Profile editing functions
window.saveProfileChanges = function(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!firstName || !lastName) {
    showToast(t('common.fillRequiredFields'));
    return;
  }

  // Get current user data
  const landingUser = sessionStorage.getItem('landingUser');
  let userData = {};
  if (landingUser) {
    try {
      userData = JSON.parse(landingUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // Update user data
  const updatedUser = {
    ...userData,
    firstName: firstName,
    lastName: lastName,
    phone: phone
  };

  // Save to sessionStorage
  sessionStorage.setItem('landingUser', JSON.stringify(updatedUser));

  showToast(t('profile.updated'));

  // Go back to dashboard
  setTimeout(() => {
    initLandingStudentDashboard();
  }, 1000);
};

window.cancelProfileChanges = function() {
  // Go back to dashboard
  initLandingStudentDashboard();
};