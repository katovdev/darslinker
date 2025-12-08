import { store } from '../../utils/store.js';
import { apiService } from '../../utils/api.js';
import { router } from '../../utils/router.js';
import { t, getCurrentLanguage, setLanguage, initI18n } from '../../utils/i18n.js';
import { getTheme, saveTheme, initTheme, presetColors } from '../../utils/theme.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.js';
import { config } from '../../utils/config.js';
import heroImage from '../../assets/images/undraw_online-stats_d57c.png';

export async function initDashboard() {
  console.log('=== Dashboard initializing ===');

  // Initialize i18n and theme
  initI18n();
  initTheme();
  
  // Load and apply saved primary color
  loadSavedPrimaryColor();
  
  // Add language change listener to reload dashboard when language changes
  window.removeEventListener('languageChanged', handleLanguageChange);
  window.addEventListener('languageChanged', handleLanguageChange);

  // Clean up any existing page-specific styles and reset body styles
  cleanupPageStyles();

  // Reset body styles
  document.body.style.overflow = '';
  document.body.style.height = '';
  document.body.style.paddingTop = '0';

  // Check if user is logged in
  const token = localStorage.getItem('accessToken');
  console.log('Token found:', !!token);

  if (!token) {
    console.log('No token, redirecting to login');
    router.navigate('/login');
    return;
  }

  // Get user data - try localStorage first (most recent), then sessionStorage
  let currentUserData = localStorage.getItem('currentUser');
  let source = 'localStorage';
  
  if (!currentUserData || currentUserData === 'undefined' || currentUserData === 'null') {
    currentUserData = sessionStorage.getItem('currentUser');
    source = 'sessionStorage';
  }
  
  console.log(`Raw currentUser from ${source}:`, currentUserData);

  let userData = null;
  if (currentUserData && currentUserData !== 'undefined' && currentUserData !== 'null') {
    try {
      userData = JSON.parse(currentUserData);
      console.log('✅ Parsed user data:', userData);
      
      // Sync to both storages
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      userData = null;
    }
  }

  if (!userData) {
    console.log('No user data, redirecting to login');
    router.navigate('/login');
    return;
  }

  // Update store with user data
  store.setState({
    user: userData,
    isAuthenticated: true
  });

  console.log('User role:', userData.role);

  // Check user role and render appropriate dashboard
  console.log('User role detected:', userData.role);

  // Force teacher dashboard for testing
  console.log('Forcing teacher dashboard for testing');
  console.log('👤 User data being passed to renderTeacherDashboard:', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    fullData: userData
  });
  await renderTeacherDashboard(userData);

  // Original logic (commented out for testing):
  // if (userData.role === 'teacher') {
  //   console.log('Rendering teacher dashboard');
  //   renderTeacherDashboard(userData);
  // } else {
  //   console.log('Rendering student dashboard');
  //   renderStudentDashboard(userData);
  // }

  console.log('=== Dashboard initialization complete ===');
  const finalCheck = document.querySelector('#app');
  if (finalCheck) {
    console.log('Final HTML check:', finalCheck.innerHTML.substring(0, 200));
  }
}

function cleanupPageStyles() {
  // Remove page-specific styles
  const pagesToClean = ['#login-page-styles', '#password-page-styles', '#register-page-styles'];
  pagesToClean.forEach(styleId => {
    const styleElement = document.querySelector(styleId);
    if (styleElement) {
      styleElement.remove();
    }
  });
}

async function renderTeacherDashboard(user) {
  console.log('=== renderTeacherDashboard user data ===', user);
  console.log('specialization:', user.specialization);
  console.log('city:', user.city);
  console.log('country:', user.country);
  console.log('ratingAverage:', user.ratingAverage);
  
  // Fetch dashboard data first to get real stats
  let dashboardStats = {
    activeCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  };
  
  try {
    console.log('🔄 Attempting to fetch teacher dashboard data...');
    console.log('🆔 Teacher ID:', user._id);
    console.log('🔐 Token in localStorage:', !!localStorage.getItem('accessToken'));
    console.log('🌐 API Base URL:', config.api.baseUrl || 'undefined');

    const dashboardData = await apiService.getTeacherDashboard(user._id);
    console.log('📡 Dashboard API response:', dashboardData);

    if (dashboardData.success) {
      const { overview, teacher } = dashboardData.data;
      console.log('✅ Dashboard data received successfully:', {
        overview,
        teacher: {
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          ratingAverage: teacher.ratingAverage
        }
      });
      dashboardStats = {
        activeCourses: overview.activeCourses || 0,
        totalStudents: overview.totalStudents || 0,
        totalRevenue: overview.totalRevenue || 0,
        avgRating: teacher.ratingAverage || 0
      };
    } else {
      console.error('❌ Dashboard API returned error:', dashboardData.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);

    // Show error to user
    if (error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error - backend might not be running or CORS issue');
    } else if (error.message.includes('401')) {
      console.error('🔐 Authentication error - token might be invalid or expired');
    }
  }
  
  const appElement = document.querySelector('#app');
  if (!appElement) {
    console.error('❌ App element not found - cannot render dashboard');
    return;
  }
  
  appElement.innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header exactly like Figma -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2 id="page-title">${t('dashboard.title')}</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="startNewMeeting()">${t('header.newMeeting')}</button>
          <button class="figma-btn" onclick="openTelegramBot()">${t('header.telegramBot')}</button>
          <button class="figma-btn figma-btn-primary" onclick="openCreateCourse()">${t('header.newCourse')}</button>
        </div>
      </div>

      <!-- Main Layout with Sidebar + Content -->
      <div class="figma-main-layout">
        <!-- Left Sidebar -->
        <div class="figma-sidebar">
          <!-- General Menu (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('general')">
              <span class="figma-menu-title">${t('sidebar.general')}</span>
              <span class="figma-menu-arrow" id="general-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="general-children">
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event); loadMainDashboard()">${t('sidebar.dashboard')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">${t('sidebar.profile')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openLandingSettings()">Landing</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMessagesPage()">${t('sidebar.messages')}</a>
            </div>
          </div>

          <!-- Content Management (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('content')">
              <span class="figma-menu-title">${t('sidebar.contentManagement')}</span>
              <span class="figma-menu-arrow" id="content-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="content-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openCreateCourse()">${t('sidebar.createCourse')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMyCourses()">${t('sidebar.myCourses')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openFinancePage()">${t('sidebar.finance')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openAssignmentsPage()">${t('sidebar.assignments')}</a>
            </div>
          </div>

          <!-- AI Assistant (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('ai')">
              <span class="figma-menu-title">${t('sidebar.aiAssistant')}</span>
              <span class="figma-menu-arrow" id="ai-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="ai-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openAIAssistantPage()">${t('sidebar.aiAssistant')}</a>
            </div>
          </div>

          <!-- Analytics (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('analytics')">
              <span class="figma-menu-title">${t('sidebar.analytics')}</span>
              <span class="figma-menu-arrow" id="analytics-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="analytics-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openQuizAnalytics()">${t('sidebar.quizAnalytics')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openRatingComments(); return false;">${t('sidebar.ratingComments')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openStudentsAnalytics(); return false;">${t('sidebar.studentsAnalytics')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openProgress(); return false;">${t('sidebar.progress')}</a>
            </div>
          </div>

          <!-- Rolls (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('rolls')">
              <span class="figma-menu-title">${t('sidebar.rolls')}</span>
              <span class="figma-menu-arrow" id="rolls-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="rolls-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openSubAdmin(); return false;">${t('sidebar.subAdmin')}</a>
            </div>
          </div>

          <!-- Settings (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('settings')">
              <span class="figma-menu-title">${t('sidebar.settings')}</span>
              <span class="figma-menu-arrow" id="settings-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="settings-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openLanguagePage(); return false;">${t('sidebar.language')}</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openCustomizeUI(); return false;">${t('sidebar.customizeUI')}</a>
            </div>
          </div>

          <!-- Subscription at bottom -->
          <div class="figma-subscription">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link" onclick="openMySubscription(); return false;">${t('sidebar.mySubscription')}</a>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="figma-content-area">
          <!-- Profile Section -->
          <div class="figma-profile-section">
            <div class="figma-profile-avatar">
              <div class="figma-avatar-circle">
                ${user.profileImage
                  ? `<img src="${user.profileImage}" alt="Profile">`
                  : `<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>`
                }
              </div>
            </div>
            <div class="figma-profile-info">
              <h2 class="figma-profile-name">${user.firstName} ${user.lastName}</h2>
              <p class="figma-profile-title">${user.specialization || ''}</p>
              <p class="figma-profile-location">${user.city && user.country ? `${user.city}, ${user.country}` : ''}</p>
              <div class="figma-profile-rating">
                ${user.ratingAverage > 0 ? `
                  <div class="figma-stars">
                    ${[1,2,3,4,5].map(star => `
                      <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="${star <= user.ratingAverage ? '#ffd700' : 'rgba(255,255,255,0.3)'}">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    `).join('')}
                  </div>
                  <span class="figma-rating-text">${(user.ratingAverage || 0).toFixed(1)}/5 (${user.reviewsCount || 0} reviews)</span>
                ` : ''}
                <span class="figma-joined">• Joined ${new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
            <div class="figma-profile-buttons">
              <button class="figma-profile-btn" onclick="openEditProfile()">${t('dashboard.profile.editProfile')}</button>
              <button class="figma-profile-btn" onclick="customizeUI()">${t('dashboard.profile.customizeUI')}</button>
            </div>
          </div>

          <!-- Stats Cards Grid -->
          <div class="figma-stats-grid">
            <!-- My Statistics Card -->
            <div class="figma-stats-card">
              <h3 class="figma-stats-title">${t('stats.myStatistics')}</h3>
              <div class="figma-stats-list" id="stats-loading">
                <div class="figma-stat-row">
                  <span class="figma-stat-label">${t('stats.activeCourses')}</span>
                  <span class="figma-stat-value">${dashboardStats.activeCourses}</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">${t('stats.totalStudents')}</span>
                  <span class="figma-stat-value">${dashboardStats.totalStudents}</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">${t('stats.totalRevenue')}</span>
                  <span class="figma-stat-value">$${(dashboardStats.totalRevenue || 0).toLocaleString()}</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">${t('stats.avgRating')}</span>
                  <span class="figma-stat-value">${dashboardStats.avgRating > 0 ? dashboardStats.avgRating.toFixed(1) : '0'}/5</span>
                </div>
              </div>
            </div>

            <!-- Achievements Card -->
            <div class="figma-stats-card">
              <h3 class="figma-stats-title">${t('stats.achievements')}</h3>
              <div class="figma-achievements-list">
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">${t('stats.topInstructor')}</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">${t('stats.students1000')}</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">${t('stats.revenue10k')}</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">${t('stats.highRating')}</span>
                </div>
              </div>
            </div>

            <!-- Bio & Specialties Card -->
            <div class="figma-stats-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 class="figma-stats-title">Bio & About Me</h3>
                <button class="edit-bio-btn" onclick="editBio()" style="background: none; border: 1px solid #7ea2d4; color: #7ea2d4; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.edit')}</button>
              </div>
              <p class="figma-bio-text" id="bioText" style="color: rgba(255,255,255,0.5); font-style: italic;">${user.bio || 'No bio added yet. Click Edit to add your bio.'}</p>
              <div id="bioEditor" style="display: none;">
                <textarea id="bioTextarea" style="width: 100%; background: rgba(20, 20, 20, 0.8); border-radius: 8px; padding: 12px; color: #ffffff; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;" rows="4"></textarea>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                  <button onclick="saveBio()" style="background: #7ea2d4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.save')}</button>
                  <button onclick="cancelBioEdit()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load dashboard data from API
  if (typeof window.loadMainDashboard === 'function') {
    window.loadMainDashboard();
  }

  // Set up event listeners
  setupTeacherEventListeners();
}

function renderStudentDashboard(user) {
  document.querySelector('#app').innerHTML = `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="container">
          <div class="dashboard-nav">
            <div class="nav-brand">
              <h1 class="brand-text">Dars <span class="brand-highlight">Linker</span></h1>
              <span class="user-role">O'quvchi Dashboard</span>
            </div>
            <div class="nav-actions">
              <span class="user-welcome">Salom, ${user.firstName} ${user.lastName}</span>
              <button class="btn-logout" onclick="handleLogout()">Chiqish</button>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <h3 id="enrolled-courses">0</h3>
                <p>Yozilgan kurslar</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3 id="completed-courses">0</h3>
                <p>Tugallangan</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3 id="pending-assignments">0</h3>
                <p>Kutilayotgan vazifalar</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <h3 id="achievements">0</h3>
                <p>Yutuqlar</p>
              </div>
            </div>
          </div>

          <div class="student-content">
            <h2>Davom etish</h2>
            <div class="continue-learning" id="continue-courses">
              <!-- Continue learning courses -->
            </div>

            <h2>Yangi kurslar</h2>
            <div class="available-courses" id="available-courses">
              <!-- Available courses -->
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  loadStudentDashboardData();
}

async function loadTeacherDashboardData() {
  try {
    // Load courses, students, assignments data
    // This would call your API endpoints

    // For now, let's add some sample data
    // Add null checks to prevent errors
    const coursesCount = document.getElementById('courses-count');
    const studentsCount = document.getElementById('students-count');
    const assignmentsCount = document.getElementById('assignments-count');
    const completedLessons = document.getElementById('completed-lessons');

    if (coursesCount) coursesCount.textContent = '5';
    if (studentsCount) studentsCount.textContent = '24';
    if (assignmentsCount) assignmentsCount.textContent = '12';
    if (completedLessons) completedLessons.textContent = '18';

    // Load recent courses
    loadRecentCourses();
    loadRecentActivity();

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadStudentDashboardData() {
  try {
    // Load student-specific data
    // Add null checks to prevent errors
    const enrolledCourses = document.getElementById('enrolled-courses');
    const completedCourses = document.getElementById('completed-courses');
    const pendingAssignments = document.getElementById('pending-assignments');
    const achievements = document.getElementById('achievements');

    if (enrolledCourses) enrolledCourses.textContent = '3';
    if (completedCourses) completedCourses.textContent = '1';
    if (pendingAssignments) pendingAssignments.textContent = '4';
    if (achievements) achievements.textContent = '2';

  } catch (error) {
    console.error('Error loading student dashboard data:', error);
  }
}

function loadRecentCourses() {
  const coursesContainer = document.getElementById('recent-courses');

  // Check if container exists before trying to modify it
  if (!coursesContainer) {
    console.log('Recent courses container not found, skipping...');
    return;
  }

  // Sample courses data
  const courses = [
    {
      id: 1,
      title: 'JavaScript asoslari',
      students: 15,
      lessons: 8,
      image: 'https://via.placeholder.com/300x200?text=JS'
    },
    {
      id: 2,
      title: 'React.js kursi',
      students: 9,
      lessons: 12,
      image: 'https://via.placeholder.com/300x200?text=React'
    }
  ];

  coursesContainer.innerHTML = courses.map(course => `
    <div class="course-card">
      <img src="${course.image}" alt="${course.title}" class="course-image">
      <div class="course-content">
        <h3>${course.title}</h3>
        <div class="course-stats">
          <span>👥 ${course.students} o'quvchi</span>
          <span>📖 ${course.lessons} dars</span>
        </div>
        <div class="course-actions">
          <button class="btn-edit">Tahrirlash</button>
          <button class="btn-view">Ko'rish</button>
        </div>
      </div>
    </div>
  `).join('');
}

function loadRecentActivity() {
  const activityContainer = document.getElementById('recent-activity');

  // Check if container exists before trying to modify it
  if (!activityContainer) {
    console.log('Recent activity container not found, skipping...');
    return;
  }

  const activities = [
    'Yangi o\'quvchi "JavaScript asoslari" kursiga yozildi',
    'Ahmed Ali 3-darsni yakunladi',
    'Yangi vazifa "React Components" yaratildi',
    'Madina Karimova kursingiz uchun 5 yulduz baho berdi'
  ];

  activityContainer.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">🔔</div>
      <span>${activity}</span>
      <small>2 soat oldin</small>
    </div>
  `).join('');
}

function setupTeacherEventListeners() {
  // Create course form submission
  const createCourseForm = document.getElementById('create-course-form');
  if (createCourseForm) {
    createCourseForm.addEventListener('submit', handleCreateCourse);
  }
}

async function handleCreateCourse(e) {
  e.preventDefault();

  const user = store.getState().user;
  if (!user) {
    showErrorToast('User not found');
    return;
  }

  // Check course limit by fetching from backend
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses?teacher=${user._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    const currentCourses = result.courses || [];
    
    if (currentCourses.length >= 2) {
      showErrorToast('You have already created 2 courses. Upgrade your plan to create more courses.');
      return;
    }
  } catch (error) {
    console.error('Error checking course limit:', error);
    // If API fails, allow course creation (fallback)
  }

  // Determine which button was clicked
  const clickedButton = e.submitter;
  const action = clickedButton?.value || 'publish'; // Default to publish
  const status = action === 'draft' ? 'draft' : 'active';
  
  console.log('📝 Form submitted with action:', action, 'status:', status);

  // Show loading state
  const originalText = clickedButton.textContent;
  clickedButton.textContent = action === 'draft' ? 'Saving...' : 'Publishing...';
  clickedButton.disabled = true;

  try {
    const formData = new FormData(e.target);
    
    // Get basic course info
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const courseType = formData.get('courseType') || 'free';
    const price = courseType === 'paid' ? parseInt(formData.get('price')) || 0 : 0;
    const discountPrice = courseType === 'paid' ? parseInt(formData.get('discountPrice')) || 0 : 0;
    
    // Get thumbnail URL (should be uploaded already)
    const thumbnail = window.uploadedThumbnailUrl || '';
    
    console.log('🖼️ Thumbnail check:', {
      uploadedThumbnailUrl: window.uploadedThumbnailUrl,
      thumbnail: thumbnail,
      hasThumbnail: !!thumbnail
    });
    
    // Validate required fields
    if (!title || !description || !category) {
      throw new Error('Please fill in all required fields');
    }
    
    if (!thumbnail) {
      console.error('❌ No thumbnail found! window.uploadedThumbnailUrl:', window.uploadedThumbnailUrl);
      throw new Error('Please upload a course thumbnail');
    }
    
    // Collect modules data
    const modules = [];
    const moduleItems = document.querySelectorAll('.module-item');
    
    moduleItems.forEach((moduleItem, moduleIndex) => {
      const moduleTitle = moduleItem.querySelector('.module-info h4')?.textContent || `Module ${moduleIndex + 1}`;
      const lessons = [];
      
      const lessonItems = moduleItem.querySelectorAll('.lesson-item');
      lessonItems.forEach((lessonItem, lessonIndex) => {
        const lessonTitleElement = lessonItem.querySelector('.lesson-title-with-icon span:last-child');
        const lessonTitle = lessonTitleElement?.textContent || `Lesson ${lessonIndex + 1}`;
        const duration = lessonItem.querySelector('span:last-child')?.textContent || '';
        
        // Determine lesson type from duration text
        let type = 'video';
        if (duration.includes('Quiz')) type = 'quiz';
        else if (duration.includes('Assignment')) type = 'assignment';
        else if (duration.includes('File')) type = 'file';
        
        // Get full lesson data from stored data
        const lessonData = lessonItem.lessonData || {};
        
        console.log('📚 lessonItem.lessonData:', lessonData);
        console.log('📚 lessonData.questions:', lessonData.questions);
        
        const lesson = {
          type,
          title: lessonTitle,
          order: lessonIndex + 1,
          duration,
          ...lessonData // Include all lesson data (fileName, fileUrl, instructions, etc.)
        };
        
        console.log('📚 Final lesson object being saved:', lesson);
        console.log('📚 lesson.questions:', lesson.questions);
        lessons.push(lesson);
      });
      
      if (lessons.length > 0) {
        modules.push({
          title: moduleTitle,
          order: moduleIndex + 1,
          lessons,
        });
      }
    });
    
    console.log('👤 Current user:', user);
    console.log('👤 User ID:', user._id);
    
    const courseData = {
      title,
      description,
      category,
      thumbnail,
      level: 'beginner', // Default value
      language: 'Uzbek', // Default value
      duration: '0', // Will be calculated from lessons
      courseType,
      price: courseType === 'paid' ? price : 0,
      discountPrice: courseType === 'paid' ? discountPrice : 0,
      status, // 'draft' or 'active' based on button clicked
      modules,
      teacher: user._id,
    };
    
    console.log('📦 Sending course data:', courseData);
    console.log('📦 Teacher field:', courseData.teacher);

    // Call API to create course
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const createCourseUrl = `${apiBaseUrl}/courses`;
    
    console.log('📤 Creating course at:', createCourseUrl);
    
    const response = await fetch(createCourseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(courseData),
    });
    
    const result = await response.json();
    console.log('📥 API Response:', result);

    if (!response.ok) {
      console.error('❌ Validation errors:', result.errors || result.message);
      throw new Error(result.message || 'Validation failed');
    }

    if (result.success) {
      const message = status === 'draft' 
        ? 'Course saved as draft!' 
        : 'Course published successfully!';
      showSuccessToast(message);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to create course');
    }

  } catch (error) {
    console.error('Error creating course:', error);
    showErrorToast(error.message || 'Failed to create course. Please try again.');
  } finally {
    // Restore button state
    if (clickedButton) {
      clickedButton.textContent = originalText;
      clickedButton.disabled = false;
    }
  }
}

// Global functions for onclick handlers
window.handleLogout = async function() {
  try {
    await apiService.logout();
    localStorage.removeItem('accessToken');
    store.setState({ user: null, isAuthenticated: false });
    router.navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if API call fails
    localStorage.removeItem('accessToken');
    store.setState({ user: null, isAuthenticated: false });
    router.navigate('/login');
  }
};

// openCreateCourse is defined later in the file (line ~9692)

window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.add('hidden');
};

window.openCreateLesson = function() {
  alert('Dars yaratish oynasi ishlab chiqilmoqda...');
};

window.openCreateAssignment = function() {
  alert('Vazifa yaratish oynasi ishlab chiqilmoqda...');
};

window.viewStudents = function() {
  alert('O\'quvchilar ro\'yxati oynasi ishlab chiqilmoqda...');
};

window.viewAllCourses = function() {
  alert('Barcha kurslar sahifasi ishlab chiqilmoqda...');
};

// New functions for the Figma design
window.openNewMeeting = function() {
  alert('New meeting functionality coming soon...');
};

window.openTelegramBot = function() {
  alert('Telegram Bot integration coming soon...');
};

window.editProfile = function() {
  openEditProfile();
};

window.openEditProfile = function() {
  // Get fresh user data from state
  const user = store.getState().user;

  if (!user) {
    console.error('No user found in state');
    return;
  }

  console.log('🔍 Opening edit profile with user data:', {
    bio: user.bio,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    fullUser: user
  }); // Debug log

  // Check if dashboard structure exists
  const contentArea = document.querySelector('.figma-content-area');

  if (contentArea) {
    // Just update content area, keep sidebar
    updatePageTitle(t('editProfile.title'));
    contentArea.innerHTML = getEditProfileHTML(user);
    updateActiveMenuItem('Profile');
    
    // Add form handler
    const form = document.getElementById('editProfileForm');
    if (form) {
      form.addEventListener('submit', handleProfileSave);
    }
    
    // Add image upload handler
    const imageInput = document.getElementById('profileImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', handleImageUpload);
    }
    
    return;
  }
  
  // If no dashboard structure, render full page
  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Edit Profile Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2 id="page-title">${t('editProfile.title')}</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="backToDashboard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            ${t('editProfile.back')}
          </button>
        </div>
      </div>

      <!-- Edit Profile Content -->
      <div class="figma-main-layout">
        <!-- Left Sidebar -->
        <div class="figma-sidebar">
          <!-- General Menu -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent expanded">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow">▼</span>
            </div>
            <div class="figma-menu-children">
              <a href="#" class="figma-menu-child" onclick="backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child active">Profile</a>
              <a href="#" class="figma-menu-child" onclick="openLandingSettings()">Landing</a>
              <a href="#" class="figma-menu-child">Messages</a>
            </div>
          </div>

          <!-- Other Menu Items -->
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">Content Management</a>
            </div>
          </div>
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">AI Assistant</a>
            </div>
          </div>
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">Analytics</a>
            </div>
          </div>
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">Rolls</a>
            </div>
          </div>
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">Settings</a>
            </div>
          </div>

          <!-- Subscription -->
          <div class="figma-subscription">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">My Subscription</a>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="figma-content-area">
          <form class="edit-profile-form" id="editProfileForm">

            <!-- Personal Information Section -->
            <div class="profile-section">
              <h3 class="section-title">${t('editProfile.personalInfo')}</h3>

              <!-- Profile Picture -->
              <div class="profile-picture-section">
                <label class="field-label">${t('editProfile.profilePicture')}</label>
                <div class="profile-picture-upload">
                  <div class="profile-picture-preview">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div class="upload-instructions">
                    <p>${t('editProfile.uploadText')}</p>
                    <small>${t('editProfile.uploadHint')}</small>
                  </div>
                </div>
              </div>

              <!-- Name Fields -->
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('editProfile.firstName')}</label>
                  <input type="text" class="form-input" name="firstName" value="${user.firstName || ''}" />
                </div>
                <div class="form-field">
                  <label class="field-label">${t('editProfile.lastName')}</label>
                  <input type="text" class="form-input" name="lastName" value="${user.lastName || ''}" />
                </div>
              </div>

              <!-- Professional Title -->
              <div class="form-field">
                <label class="field-label">${t('editProfile.professionalTitle')}</label>
                <input type="text" class="form-input" name="specialization" value="${user.specialization || ''}" />
              </div>

              <!-- Bio -->
              <div class="form-field">
                <label class="field-label">${t('editProfile.bio')}</label>
                <textarea class="form-textarea" name="bio" rows="4">${user.bio || ''}</textarea>
              </div>

              <!-- Location -->
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('editProfile.city')}</label>
                  <input type="text" class="form-input" name="city" value="${user.city || ''}" />
                </div>
                <div class="form-field">
                  <label class="field-label">${t('editProfile.country')}</label>
                  <input type="text" class="form-input" name="country" value="${user.country || ''}" />
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="profile-section">
              <h3 class="section-title">${t('editProfile.contactInfo')}</h3>

              <div class="form-field">
                <label class="field-label">${t('editProfile.emailAddress')}</label>
                <input type="email" class="form-input" name="email" value="${user.email || ''}" />
              </div>

              <div class="form-field">
                <label class="field-label">${t('editProfile.phoneNumber')}</label>
                <input type="tel" class="form-input" name="phone" value="${user.phone || ''}" />
              </div>

              <div class="form-field">
                <label class="field-label">${t('editProfile.telegramUsername')}</label>
                <input type="text" class="form-input" name="telegramUsername" value="${user.telegramUsername || ''}" />
              </div>
            </div>

            <!-- Payment Information Section -->
            <div class="profile-section">
              <h3 class="section-title">${t('editProfile.paymentInfo')}</h3>

              <div class="form-field">
                <label class="field-label">${t('editProfile.accountHolder')}</label>
                <input type="text" class="form-input" name="accountHolder" value="${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''}" />
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('editProfile.bankName')}</label>
                  <input type="text" class="form-input" name="bankName" value="${user.paymentMethods?.bankAccount || ''}" />
                </div>
                <div class="form-field">
                  <label class="field-label">${t('editProfile.cardNumber')}</label>
                  <input type="text" class="form-input" name="cardNumber" value="${user.paymentMethods?.cardNumber || ''}" />
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" onclick="backToDashboard()">${t('editProfile.cancel')}</button>
              <button type="submit" class="btn-save">${t('editProfile.saveChanges')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Add form submission handler
  document.getElementById('editProfileForm').addEventListener('submit', handleProfileSave);
};

// Open Landing Page Settings
window.openLandingSettings = async function() {
  // Get fresh user data from state
  const user = store.getState().user;

  if (!user) {
    console.error('No user found in state');
    return;
  }

  console.log('🔍 Opening landing settings with user data:', user);

  // Load landing settings from backend
  let landingData = null;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/landing/${user._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    if (result.success) {
      landingData = result.landing;
    }
  } catch (error) {
    console.error('Error loading landing settings:', error);
  }

  // Check if dashboard structure exists
  const contentArea = document.querySelector('.figma-content-area');

  if (contentArea) {
    // Just update content area, keep sidebar
    updatePageTitle('Landing Page Settings');
    contentArea.innerHTML = getLandingSettingsHTML(user, landingData);
    updateActiveMenuItem('Landing');

    // Initialize landing settings
    initializeLandingSettings(landingData);

    return;
  }

  // If no dashboard structure, render full page
  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Landing Settings Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2 id="page-title">Landing Page Settings</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="backToDashboard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Landing Settings Content -->
      <div class="figma-main-layout">
        <!-- Left Sidebar Menu -->
        <div class="figma-sidebar">
          <!-- General Menu (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent expanded">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow">▼</span>
            </div>
            <div class="figma-menu-children">
              <a href="#" class="figma-menu-child" onclick="backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child active">Landing</a>
              <a href="#" class="figma-menu-child">Messages</a>
            </div>
          </div>

          <!-- Other Menu Items -->
          <div class="figma-menu-section">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">AI Assistant</a>
            </div>
          </div>
        </div>

        <!-- Landing Settings Form -->
        <div class="figma-content-area">
          ${getLandingSettingsHTML(user)}
        </div>
      </div>
    </div>
  `;

  // Initialize landing settings
  initializeLandingSettings();
};

// Helper function to get landing settings HTML
function getLandingSettingsHTML(user, landingData = null) {
  const theme = getTheme();
  const productionURL = 'https://bucolic-fairy-0e50d6.netlify.app';
  const landingURL = `${productionURL}/teacher/${user._id}`;

  // Default values or from landingData
  const settings = {
    title: landingData?.title || `${user.firstName} ${user.lastName}'s Courses`,
    subtitle: landingData?.subtitle || user.specialization || 'Expert Instructor',
    description: landingData?.description || 'Discover amazing courses and start your learning journey today.',
    heroText: landingData?.heroText || 'DASTURLASH NI\nPROFESSIONAL\nO\'QITUVCHI BILAN O\'RGANING',
    heroImage: landingData?.heroImage || user.heroImage || '',
    primaryColor: landingData?.primaryColor || '#7ea2d4',
    backgroundColor: landingData?.backgroundColor || '#1a1a1a',
    textColor: landingData?.textColor || '#ffffff',
    showCourses: landingData?.showCourses !== undefined ? landingData.showCourses : true,
    showAbout: landingData?.showAbout !== undefined ? landingData.showAbout : true,
    aboutText: landingData?.aboutText || user.bio || '',
    socialLinks: {
      telegram: landingData?.socialLinks?.telegram || user.telegramUsername || '',
      instagram: '',
      youtube: '',
      linkedin: ''
    }
  };

  return `
    <div class="landing-settings-page">
      <style>
        .landing-settings-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          color: #ffffff;
        }

        .landing-section {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-color-20);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .landing-section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #ffffff;
        }

        .landing-url-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .landing-url-input {
          flex: 1;
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid var(--primary-color-20);
          border-radius: 8px;
          padding: 12px;
          color: #ffffff;
          font-size: 14px;
        }

        .copy-link-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }

        .copy-link-btn:hover {
          background: var(--primary-color-80);
        }

        .profile-upload-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(40, 40, 40, 0.5);
          border-radius: 12px;
        }

        .profile-avatar-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--primary-color-20);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
        }

        .upload-text {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .upload-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin-top: 4px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-field {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .form-input, .form-textarea {
          width: 100%;
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid var(--primary-color-20);
          border-radius: 8px;
          padding: 12px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: var(--primary-color);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .social-links-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        #certificatesList {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .certificate-card {
          position: relative;
          background: rgba(58, 56, 56, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .certificate-image {
          width: 100%;
          height: 250px;
          overflow: hidden;
          cursor: pointer;
        }

        .certificate-image img {
          transition: transform 0.3s ease;
        }

        .certificate-image:hover img {
          transform: scale(1.05);
        }

        .certificate-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .certificate-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          z-index: 10000;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .certificate-modal.active {
          display: flex;
        }

        .certificate-modal-content {
          max-width: 90%;
          max-height: 90%;
          position: relative;
        }

        .certificate-modal-content img {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .certificate-modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .certificate-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .certificate-remove-btn:hover {
          background: rgba(239, 68, 68, 0.8) !important;
        }

        .certificate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(40, 40, 40, 0.5);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .certificate-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .certificate-info p {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .remove-btn {
          background: none;
          border: none;
          color: rgba(239, 68, 68, 0.8);
          cursor: pointer;
          padding: 4px;
        }

        .add-new-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 20px;
        }

        .course-item, .testimonial-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(40, 40, 40, 0.5);
          border: 1px solid var(--primary-color-20);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .course-item.selected, .testimonial-item.selected {
          border-color: var(--primary-color);
          background: var(--primary-color-10);
        }

        .course-checkbox, .testimonial-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .course-info h4, .testimonial-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .course-info p, .testimonial-info p {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .stars {
          display: flex;
          gap: 2px;
          margin-top: 4px;
        }

        .star {
          color: #ffd700;
          font-size: 12px;
        }

        .theme-colors {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .color-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .color-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
        }

        .color-option.active .color-circle {
          border-color: #ffffff;
        }

        .color-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--primary-color-20);
        }

        .btn-cancel {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .btn-save {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 32px;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        /* Landing Color Picker Styles */
        .color-picker-wrapper-landing {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .color-preview-landing {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          border: 2px solid var(--primary-color-20);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .color-preview-landing:hover {
          transform: scale(1.05);
          border-color: var(--primary-color);
        }
        .color-input-wrapper-landing {
          flex: 1;
          position: relative;
        }
        .color-input-landing {
          width: 100%;
          padding: 12px 16px;
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid var(--primary-color-20);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-family: monospace;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .color-input-landing:focus {
          border-color: var(--primary-color);
        }
        #landingColorPicker {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .preset-colors-label-landing {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .preset-colors-landing {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .preset-color-landing {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .preset-color-landing:hover {
          transform: scale(1.1);
          border-color: #ffffff;
        }
        .preset-color-landing.active {
          border-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }
      </style>

      <form id="landingSettingsForm">
        <!-- Landing Page URL Section -->
        <div class="landing-section">
          <div class="landing-section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 8px;">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Your Landing Page URL
          </div>
          <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 16px; font-size: 14px;">
            Share this link with your students
          </p>
          <div class="landing-url-container">
            <input type="text" class="landing-url-input" value="${landingURL}" readonly>
            <button type="button" class="copy-link-btn" onclick="copyLandingURL('${landingURL}')">Copy link</button>
          </div>
        </div>

        <!-- Customize Landing Page Section -->
        <div class="landing-section">
          <div class="landing-section-title">Customize Your Landing Page</div>

          <!-- 1. Logo Text -->
          <div class="form-field">
            <label class="field-label">Logo Text</label>
            <input type="text" class="form-input" name="logoText" value="${settings.logoText || 'DarsLinker'}" placeholder="DarsLinker">
            <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px; display: block;">
              Landing page tepasida ko'rsatiladigan logo text
            </small>
          </div>

          <!-- 2. Hero Text -->
          <div class="form-field">
            <label class="field-label">Hero Section - Main Text</label>
            <textarea class="form-textarea" name="heroText" rows="3" placeholder="DASTURLASH NI PROFESSIONAL O'QITUVCHI BILAN O'RGANING">${settings.heroText || user.heroText || 'DASTURLASH NI\nPROFESSIONAL\nO\'QITUVCHI BILAN O\'RGANING'}</textarea>
            <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px; display: block;">
              Bu matn landing page hero qismida ko'rsatiladi. Har bir qatorni yangi qatordan yozing.
            </small>
          </div>

          <!-- 3. Hero Image -->
          <div class="form-field">
            <label class="field-label">Hero Section - Image</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              ${user.heroImage ? `
                <img src="${user.heroImage}" alt="Hero" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #7ea2d4;">
              ` : `
                <div style="width: 100px; height: 100px; background: rgba(126, 162, 212, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px dashed #7ea2d4;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7ea2d4" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              `}
              <div style="flex: 1;">
                <input type="file" id="heroImageInput" accept="image/*" style="display: none;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('heroImageInput').click()">
                  ${user.heroImage ? 'Change Image' : 'Upload Image'}
                </button>
                <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px; display: block;">
                  Bu rasm landing page hero qismining o'ng tomonida ko'rsatiladi. Recommended: 800x600px, max 2MB
                </small>
              </div>
            </div>
          </div>

          <!-- 4. Avatar / Profile Photo (Read-only) -->
          <div style="position: relative; background: rgba(126, 162, 212, 0.05); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div class="form-field" style="margin-bottom: 0;">
              <label class="field-label">Profile Photo (Avatar)</label>
              <div class="profile-upload-section" style="cursor: not-allowed; opacity: 0.6; pointer-events: none;">
                <div class="profile-avatar-placeholder" id="landingProfileAvatar">
                  ${user.profileImage 
                    ? `<img src="${user.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>`
                  }
                </div>
                <div>
                  <div class="upload-text">Profile Photo</div>
                  <div class="upload-subtitle">Bu rasm "About" qismida profil rasmi sifatida ko'rsatiladi.</div>
                </div>
              </div>
              <small style="color: rgba(126, 162, 212, 0.8); font-size: 12px; display: block; margin-top: 8px;">
                Update this in your profile settings
              </small>
            </div>
          </div>

          <!-- 5. Profile Information (Read-only) -->
          <div style="position: relative; background: rgba(126, 162, 212, 0.05); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="margin-bottom: 12px;">
              <span style="color: rgba(126, 162, 212, 0.9); font-size: 13px; font-weight: 500;">Profile Information</span>
            </div>
            <div class="form-row">
              <div class="form-field" style="margin-bottom: 0;">
                <label class="field-label">First Name</label>
                <input type="text" class="form-input" name="firstName" value="${user.firstName || ''}" disabled readonly autocomplete="off" tabindex="-1" style="background: rgba(255,255,255,0.03); cursor: not-allowed; opacity: 0.6;">
              </div>
              <div class="form-field" style="margin-bottom: 0;">
                <label class="field-label">Last Name</label>
                <input type="text" class="form-input" name="lastName" value="${user.lastName || ''}" disabled readonly autocomplete="off" tabindex="-1" style="background: rgba(255,255,255,0.03); cursor: not-allowed; opacity: 0.6;">
              </div>
            </div>
          </div>

          <!-- 6. Professional Title (Read-only) -->
          <div style="position: relative; background: rgba(126, 162, 212, 0.05); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div class="form-field" style="margin-bottom: 0;">
              <label class="field-label">Professional Title / Specialty</label>
              <input type="text" class="form-input" name="specialty" value="${user.specialization || ''}" disabled readonly autocomplete="off" tabindex="-1" style="background: rgba(255,255,255,0.03); cursor: not-allowed; opacity: 0.6;">
              <small style="color: rgba(126, 162, 212, 0.8); font-size: 12px; display: block; margin-top: 8px;">
                 Update this in your profile settings
              </small>
            </div>
          </div>

          <!-- 7. Bio (Read-only) -->
          <div style="position: relative; background: rgba(126, 162, 212, 0.05); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div class="form-field" style="margin-bottom: 0;">
              <label class="field-label">Bio / About Me</label>
              <textarea class="form-textarea" name="bio" disabled readonly autocomplete="off" tabindex="-1" style="background: rgba(255,255,255,0.03); cursor: not-allowed; opacity: 0.6; resize: none;">${user.bio || 'Not set'}</textarea>
              <small style="color: rgba(126, 162, 212, 0.8); font-size: 12px; display: block; margin-top: 8px;">
                 Update this in your profile settings
              </small>
            </div>
          </div>

          <!-- 8. Social Media Links -->
          <h4 style="color: #ffffff; margin: 24px 0 16px 0; font-size: 14px;">Social media links</h4>
          <div class="social-links-grid">
            <div class="form-field">
              <label class="field-label">LinkedIn</label>
              <input type="url" class="form-input" name="linkedin" value="${settings.socialLinks?.linkedin || ''}" placeholder="https://linkedin.com/in/johndoe">
            </div>
            <div class="form-field">
              <label class="field-label">Instagram</label>
              <input type="text" class="form-input" name="instagram" value="${settings.socialLinks?.instagram || ''}" placeholder="johndoe (@ siz)">
            </div>
            <div class="form-field">
              <label class="field-label">Telegram</label>
              <input type="text" class="form-input" name="telegram" value="${settings.socialLinks?.telegram || ''}" placeholder="johndoe (@ siz)">
            </div>
            <div class="form-field">
              <label class="field-label">YouTube</label>
              <input type="url" class="form-input" name="youtube" value="${settings.socialLinks?.youtube || ''}" placeholder="https://youtube.com/@johndoe">
            </div>
          </div>
        </div>

        <!-- Certificates & Achievements -->
        <div class="landing-section">
          <div class="landing-section-title">Certificates & Achievements</div>
          <div id="certificatesList">
            <!-- Certificates will be loaded here -->
          </div>
          <button type="button" class="add-new-btn" onclick="addNewCertificate()">+ Add new</button>
        </div>

        <!-- Featured Testimonials -->
        <div class="landing-section testimonials-locked" style="position: relative; opacity: 0.6;">
          <div class="lock-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; pointer-events: none;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="landing-section-title" style="position: relative;">
            Featured Testimonials
            <span class="coming-soon-badge" style="position: absolute; top: -5px; right: -10px; background: var(--primary-color); color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 500;">Soon</span>
          </div>
          <p style="color: rgba(255, 255, 255, 0.4); margin-bottom: 16px; font-size: 14px;">
            Select best reviews to showcase (up to 5)
          </p>
          <div id="featuredTestimonialsList" style="filter: blur(2px); pointer-events: none;">
            <div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.3);">
              <div style="margin-bottom: 12px;">📝 Testimonials coming soon...</div>
              <div style="font-size: 12px;">This feature will be available in the next update</div>
            </div>
          </div>
          <div class="hover-tooltip" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0); transition: background 0.3s; cursor: not-allowed; opacity: 0;">
            <div style="background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 6px; color: white; font-size: 14px; font-weight: 500;">
              Coming Soon
            </div>
          </div>
        </div>

        <style>
          .testimonials-locked:hover .hover-tooltip {
            opacity: 1;
            background: rgba(0,0,0,0.1);
          }
          .testimonials-locked .coming-soon-badge {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        </style>

        <!-- Theme & Colors -->
        <div class="landing-section">
          <div class="landing-section-title">Theme & Colors</div>
          <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 16px; font-size: 14px;">
            Choose a primary color for your landing page
          </p>
          
          <div class="color-picker-wrapper-landing">
            <div class="color-preview-landing" id="landingColorPreview" style="background-color: ${user.landingPageSettings?.themeColor || theme.primaryColor};">
              <input type="color" id="landingColorPicker" value="${user.landingPageSettings?.themeColor || theme.primaryColor}" onchange="updateLandingColorFromPicker(this.value)">
            </div>
            <div class="color-input-wrapper-landing">
              <input type="text" class="color-input-landing" id="landingColorInput" value="${user.landingPageSettings?.themeColor || theme.primaryColor}" placeholder="#7ea2d4" oninput="updateLandingColorPreview(this.value)">
            </div>
          </div>
          
          <div class="preset-colors-label-landing">Quick Presets</div>
          <div class="preset-colors-landing" id="landingPresetColors">
            ${presetColors.map(color => `
              <div class="preset-color-landing ${(user.landingPageSettings?.themeColor || theme.primaryColor) === color.value ? 'active' : ''}" 
                   style="background-color: ${color.value};" 
                   onclick="selectLandingPresetColor('${color.value}')"
                   title="${color.name}">
              </div>
            `).join('')}
            
            <!-- Add Custom Color Button -->
            <div class="preset-color-landing add-color-btn-landing" 
                 onclick="openLandingColorPickerModal()"
                 title="Add Custom Color"
                 style="background: transparent; border: 2px dashed var(--primary-color); display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="backToDashboard()">Cancel</button>

          <button type="submit" class="btn-save">Save and publish</button>
        </div>
      </form>
    </div>
  `;
}

// Initialize landing settings functionality
function initializeLandingSettings() {
  // Load testimonials and certificates
  // loadFeaturedCourses(); // Removed - all courses will be shown automatically
  // loadFeaturedTestimonials(); // Disabled - feature coming soon
  loadCertificates();
  
  // Setup hero image upload
  const heroImageInput = document.getElementById('heroImageInput');
  if (heroImageInput) {
    heroImageInput.addEventListener('change', handleHeroImageUpload);
  }

  // Add form submission handler
  const form = document.getElementById('landingSettingsForm');
  if (form) {
    form.addEventListener('submit', handleLandingSettingsSave);
  }

  // Add color selection handlers
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Add certificate file upload handler
  const certFileInput = document.getElementById('certificateFileInput');
  if (certFileInput) {
    certFileInput.addEventListener('change', handleCertificateFileUpload);
  }

  // Add profile photo upload handler for landing page
  const landingPhotoInput = document.getElementById('landingProfilePhotoInput');
  if (landingPhotoInput) {
    landingPhotoInput.addEventListener('change', handleLandingProfilePhotoUpload);
  }
}

// Handle hero image upload
async function handleHeroImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showErrorToast('File size too large. Max 2MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showErrorToast('Invalid file type. Only images allowed');
    return;
  }

  try {
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Update Landing API with hero image
      const user = store.getState().user;
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      
      const landingResponse = await fetch(`${apiBaseUrl}/landing/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          heroImage: data.url
        })
      });

      const landingResult = await landingResponse.json();

      if (landingResult.success) {
        // Update store
        store.setState({ user: { ...user, heroImage: data.url } });
        showSuccessToast('Hero image updated successfully');
        
        // Reload landing settings to show new image
        openLandingSettings();
      } else {
        showErrorToast('Failed to update hero image');
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Hero image upload error:', error);
    showErrorToast('Failed to upload hero image');
  }
}

// Handle landing profile photo upload
async function handleLandingProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    console.log('❌ No file selected for photo upload');
    return;
  }

  console.log('📸 Starting photo upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showErrorToast('File size too large. Max 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showErrorToast('Invalid file type. Only images allowed');
    return;
  }

  try {
    // Show loading
    const avatar = document.getElementById('landingProfileAvatar');
    avatar.innerHTML = '<div style="width: 30px; height: 30px; border: 3px solid rgba(126,162,212,0.3); border-top: 3px solid #7ea2d4; border-radius: 50%; animation: spin 1s linear infinite;"></div>';

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    console.log('🔐 Using token for photo upload:', token ? 'Token present' : 'No token found');

    console.log('📡 Uploading to:', `${config.api.baseUrl}/upload/image`);
    const response = await fetch(`${config.api.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('📡 Upload response status:', response.status);
    const data = await response.json();
    console.log('📡 Upload response data:', data);

    if (data.success) {
      // Update avatar preview
      avatar.innerHTML = `<img src="${data.url}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      
      // Update user profile via API
      const user = store.getState().user;
      console.log('👤 Updating teacher profile with image URL:', data.url);
      const result = await apiService.updateTeacherProfile(user._id, { profileImage: data.url });
      console.log('👤 Profile update result:', result);

      if (result.success) {
        // Update store and session
        store.setState({ user: { ...user, ...result.teacher } });
        sessionStorage.setItem('currentUser', JSON.stringify({ ...user, ...result.teacher }));
        console.log('✅ Photo upload and profile update completed successfully');
        showSuccessToast('Profile photo updated successfully');
      } else {
        console.error('❌ Profile update failed:', result.message);
        showErrorToast('Failed to update profile with new photo');
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    showErrorToast('Failed to upload photo');
    
    // Restore previous image
    const user = store.getState().user;
    const avatar = document.getElementById('landingProfileAvatar');
    avatar.innerHTML = user.profileImage 
      ? `<img src="${user.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
      : `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
  }
}

// Helper function to get video duration
function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function() {
      URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);

      const formattedDuration = hours > 0
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      resolve(formattedDuration);
    };
    video.onerror = function() {
      resolve('00:00'); // fallback
    };
    video.src = URL.createObjectURL(file);
  });
}

// Helper function to create hidden input
function createHiddenInput(form, className) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.className = className;
  form.appendChild(input);
  return input;
}

// Store active XHR requests for cancellation
window.activeVideoUploads = window.activeVideoUploads || {};

// Handle video upload for lesson creation
window.handleVideoUpload = async function(input) {
  const file = input.files[0];
  if (!file) return;

  const lessonForm = input.closest('.lesson-form');
  const uploadSection = lessonForm.querySelector('.video-upload-section');
  const uploadContent = uploadSection.querySelector('.upload-content');
  const uploadProgress = uploadSection.querySelector('.upload-progress');
  const uploadSuccess = uploadSection.querySelector('.upload-success');
  const progressFill = uploadProgress.querySelector('.progress-fill');
  const uploadStatus = uploadProgress.querySelector('.upload-status');
  const videoUrlInput = lessonForm.querySelector('.video-url-input');
  const videoFilename = uploadSuccess.querySelector('.video-filename');

  // Validate file size (max 500MB)
  if (file.size > 500 * 1024 * 1024) {
    showErrorToast('File size too large. Maximum 500MB allowed');
    input.value = '';
    return;
  }

  // Validate file type
  if (!file.type.startsWith('video/')) {
    showErrorToast('Invalid file type. Only video files allowed');
    input.value = '';
    return;
  }

  // Get video duration
  const videoDuration = await getVideoDuration(file);
  const durationInput = lessonForm.querySelector('.video-duration-input') || createHiddenInput(lessonForm, 'video-duration-input');
  durationInput.value = videoDuration;

  try {
    // Show upload progress
    uploadContent.style.display = 'none';
    uploadProgress.style.display = 'block';
    uploadSuccess.style.display = 'none';

    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('accessToken');

    const xhr = new XMLHttpRequest();
    
    // Store XHR for cancellation
    const uploadId = Date.now();
    window.activeVideoUploads[uploadId] = xhr;
    uploadSection.dataset.uploadId = uploadId;

    xhr.onload = function() {
      // Remove from active uploads
      delete window.activeVideoUploads[uploadId];
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            // Store video URL
            videoUrlInput.value = response.url;
            videoFilename.textContent = file.name;

            // Show success state
            uploadProgress.style.display = 'none';
            uploadSuccess.style.display = 'block';

            // Show compression info if available
            let message = 'Video uploaded successfully';
            if (response.compression) {
              const saved = response.compression.savedPercentage;
              const originalMB = (response.compression.originalSize / 1024 / 1024).toFixed(2);
              const compressedMB = (response.compression.compressedSize / 1024 / 1024).toFixed(2);
              message += ` (${originalMB}MB → ${compressedMB}MB, ${saved}% saved)`;
              console.log('🎉 Compression:', { originalMB, compressedMB, saved: `${saved}%` });
            }

            showSuccessToast(message);
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (e) {
          console.error('Parse error:', e);
          throw new Error('Failed to parse server response');
        }
      } else {
        throw new Error(`Upload failed with status: ${xhr.status}`);
      }
    };

    xhr.onerror = function() {
      delete window.activeVideoUploads[uploadId];
      console.error('Network error during upload');
      
      // Reset UI
      uploadContent.style.display = 'block';
      uploadProgress.style.display = 'none';
      uploadSuccess.style.display = 'none';
      input.value = '';
      videoUrlInput.value = '';
      
      showErrorToast('Network error during upload');
    };

    xhr.onabort = function() {
      delete window.activeVideoUploads[uploadId];
      console.log('✅ Upload cancelled by user');
      
      // Reset UI
      uploadContent.style.display = 'block';
      uploadProgress.style.display = 'none';
      uploadSuccess.style.display = 'none';
      input.value = '';
      videoUrlInput.value = '';
    };

    xhr.open('POST', `${config.api.baseUrl}/upload/video`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);

  } catch (error) {
    console.error('Video upload error:', error);
    showErrorToast('Failed to upload video. Please try again.');

    // Reset upload section
    uploadContent.style.display = 'block';
    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'none';
    progressFill.style.width = '0%';
    input.value = '';
    videoUrlInput.value = '';
  }
};

// Cancel video upload
window.cancelVideoUpload = function(button) {
  const uploadSection = button.closest('.video-upload-section');
  const uploadId = uploadSection.dataset.uploadId;
  
  console.log('🛑 Cancelling upload...', { uploadId, hasActiveUpload: !!window.activeVideoUploads[uploadId] });
  
  if (uploadId && window.activeVideoUploads[uploadId]) {
    // Abort the XHR request - this will trigger xhr.onabort
    try {
      window.activeVideoUploads[uploadId].abort();
      console.log('✅ XHR request aborted');
    } catch (error) {
      console.error('Error aborting XHR:', error);
    }
    delete window.activeVideoUploads[uploadId];
  }
  
  // Reset UI immediately
  const lessonForm = button.closest('.lesson-form');
  const uploadContent = uploadSection.querySelector('.upload-content');
  const uploadProgress = uploadSection.querySelector('.upload-progress');
  const uploadSuccess = uploadSection.querySelector('.upload-success');
  const videoInput = lessonForm.querySelector('input[type="file"]');
  const videoUrlInput = lessonForm.querySelector('.video-url-input');
  
  uploadContent.style.display = 'block';
  uploadProgress.style.display = 'none';
  uploadSuccess.style.display = 'none';
  if (videoInput) videoInput.value = '';
  if (videoUrlInput) videoUrlInput.value = '';
  
  showSuccessToast('Upload cancelled');
};

// Quiz Type Selection
window.selectQuizType = function(option, type) {
  const selector = option.closest('.quiz-type-selector');
  const options = selector.querySelectorAll('.quiz-type-option');

  // Remove active class from all options
  options.forEach(opt => opt.classList.remove('active'));

  // Add active class to selected option
  option.classList.add('active');

  // Store selected type
  option.closest('.lesson-form').setAttribute('data-quiz-type', type);
};

// Add Quiz Question
window.addQuizQuestion = function(button) {
  const lessonForm = button.closest('.lesson-form');
  const questionsList = lessonForm.querySelector('.questions-list');
  const quizType = lessonForm.getAttribute('data-quiz-type') || 'multiple-choice';
  const questionCount = questionsList.querySelectorAll('.question-item').length + 1;

  const questionHTML = `
    <div class="question-item">
      <div class="question-header">
        <span class="question-number">Question ${questionCount}</span>
        <button type="button" class="delete-question-btn" onclick="deleteQuestion(this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <input type="text" class="question-input" placeholder="Enter question text..." />
      <div class="answers-section">
        <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: block;">Answer options:</label>
        <div class="answers-list">
          <div class="answer-item">
            <div class="${quizType === 'multiple-choice' ? 'answer-radio' : 'answer-checkbox'}" onclick="toggleAnswer(this)">
              ${quizType === 'multiple-choice' ? '○' : '☐'}
            </div>
            <input type="text" class="answer-input" placeholder="Enter answer option..." />
          </div>
          <div class="answer-item">
            <div class="${quizType === 'multiple-choice' ? 'answer-radio' : 'answer-checkbox'}" onclick="toggleAnswer(this)">
              ${quizType === 'multiple-choice' ? '○' : '☐'}
            </div>
            <input type="text" class="answer-input" placeholder="Enter answer option..." />
          </div>
        </div>
        <button type="button" class="add-answer-btn" onclick="addAnswer(this)">+ Add Option</button>
      </div>
    </div>
  `;

  questionsList.insertAdjacentHTML('beforeend', questionHTML);
};

// Delete Question
window.deleteQuestion = function(button) {
  const questionItem = button.closest('.question-item');
  const questionsList = questionItem.parentElement;

  questionItem.remove();

  // Update question numbers
  const questions = questionsList.querySelectorAll('.question-item');
  questions.forEach((question, index) => {
    const numberSpan = question.querySelector('.question-number');
    numberSpan.textContent = `Question ${index + 1}`;
  });
};

// Add Option
window.addAnswer = function(button) {
  const answersSection = button.closest('.answers-section');
  const answersList = answersSection.querySelector('.answers-list');
  const lessonForm = button.closest('.lesson-form');
  const quizType = lessonForm.getAttribute('data-quiz-type') || 'multiple-choice';

  const answerHTML = `
    <div class="answer-item">
      <div class="${quizType === 'multiple-choice' ? 'answer-radio' : 'answer-checkbox'}" onclick="toggleAnswer(this)">
        ${quizType === 'multiple-choice' ? '○' : '☐'}
      </div>
      <input type="text" class="answer-input" placeholder="Enter answer option..." />
    </div>
  `;

  answersList.insertAdjacentHTML('beforeend', answerHTML);
};

// Toggle Answer (Mark as Correct)
window.toggleAnswer = function(element) {
  const lessonForm = element.closest('.lesson-form');
  const quizType = lessonForm.getAttribute('data-quiz-type') || 'multiple-choice';

  if (quizType === 'multiple-choice') {
    // For multiple choice, only one answer can be correct
    const allRadios = element.closest('.answers-list').querySelectorAll('.answer-radio');
    allRadios.forEach(radio => {
      radio.classList.remove('checked');
      radio.textContent = '○';
    });

    element.classList.add('checked');
    element.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>';
  } else {
    // For multiple correct, check max limit
    const answersList = element.closest('.answers-list');
    const maxCorrect = parseInt(answersList.getAttribute('data-max-correct')) || 999;
    const currentChecked = answersList.querySelectorAll('.answer-checkbox.checked').length;
    
    if (element.classList.contains('checked')) {
      // Unchecking
      element.classList.remove('checked');
      element.textContent = '☐';
    } else {
      // Checking - validate max limit
      if (currentChecked >= maxCorrect) {
        showErrorToast(`You can only select ${maxCorrect} correct answer${maxCorrect > 1 ? 's' : ''} for this question`);
        return;
      }
      element.classList.add('checked');
      element.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    }
  }
};

// Handle certificate file upload
async function handleCertificateFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showErrorToast('File size too large. Max 10MB');
    return;
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    showErrorToast('Invalid file type. Only images and PDF allowed');
    return;
  }

  try {
    // Show file name
    document.getElementById('certificateFileName').textContent = `Uploading ${file.name}...`;

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const endpoint = file.type === 'application/pdf' ? '/upload/document' : '/upload/image';
    
    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Update URL input with uploaded file URL
      document.getElementById('certificateUrlInput').value = data.url;
      document.getElementById('certificateFileName').textContent = `✓ ${file.name}`;
      showSuccessToast('Certificate file uploaded successfully');
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Certificate upload error:', error);
    showErrorToast('Failed to upload certificate file');
    document.getElementById('certificateFileName').textContent = '';
  }
}

// Copy landing page URL to clipboard
window.copyLandingURL = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    showSuccessToast('Landing page URL copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccessToast('Landing page URL copied to clipboard!');
  });
};

// Landing Color Picker Functions
window.updateLandingColorPreview = function(color) {
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    const preview = document.getElementById('landingColorPreview');
    const picker = document.getElementById('landingColorPicker');
    if (preview) preview.style.backgroundColor = color;
    if (picker) picker.value = color;
    
    // Update active preset
    document.querySelectorAll('.preset-color-landing').forEach(preset => {
      preset.classList.remove('active');
    });
  }
};

window.updateLandingColorFromPicker = function(color) {
  const input = document.getElementById('landingColorInput');
  const preview = document.getElementById('landingColorPreview');
  if (input) input.value = color;
  if (preview) preview.style.backgroundColor = color;
  
  // Update active preset
  document.querySelectorAll('.preset-color-landing').forEach(preset => {
    preset.classList.remove('active');
  });
};

window.selectLandingPresetColor = function(color) {
  const input = document.getElementById('landingColorInput');
  const preview = document.getElementById('landingColorPreview');
  const picker = document.getElementById('landingColorPicker');
  
  if (input) input.value = color;
  if (preview) preview.style.backgroundColor = color;
  if (picker) picker.value = color;
  
  // Update active state
  document.querySelectorAll('.preset-color-landing').forEach(preset => {
    preset.classList.remove('active');
    if (preset.style.backgroundColor === color || rgbToHex(preset.style.backgroundColor) === color) {
      preset.classList.add('active');
    }
  });
};

// Helper function to convert RGB to Hex
function rgbToHex(rgb) {
  if (!rgb || rgb.startsWith('#')) return rgb;
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Open color picker modal for landing settings (same as Customize UI)
window.openLandingColorPickerModal = function() {
  const currentColor = document.getElementById('landingColorInput')?.value || '#7ea2d4';
  
  // Generate color palette grid
  const generateColorPalette = () => {
    const colors = [];
    // Grayscale row
    for (let i = 0; i <= 10; i++) {
      const val = Math.round((i / 10) * 255);
      colors.push(`rgb(${val}, ${val}, ${val})`);
    }
    
    // Color rows - Hue variations
    const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const lightnesses = [50, 60, 70, 80, 90];
    
    hues.forEach(hue => {
      lightnesses.forEach(lightness => {
        colors.push(`hsl(${hue}, 100%, ${lightness}%)`);
      });
    });
    
    return colors;
  };
  
  const colors = generateColorPalette();
  
  const modal = document.createElement('div');
  modal.id = 'landingColorPickerModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeLandingColorPickerModal()"></div>
    <div class="color-picker-modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #ffffff; margin: 0;">Choose Color</h3>
        <button onclick="closeLandingColorPickerModal()" style="background: none; border: none; color: rgba(255,255,255,0.6); font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px;">×</button>
      </div>
      
      <!-- Color Palette Grid -->
      <div class="color-palette-grid">
        ${colors.map(color => `
          <div class="palette-color" 
               style="background: ${color};" 
               onclick="selectLandingPaletteColor('${color}')"
               title="${color}">
          </div>
        `).join('')}
      </div>
      
      <!-- Selected Color Preview -->
      <div style="margin-top: 20px; padding: 16px; background: rgba(20,20,20,0.5); border-radius: 12px; display: flex; align-items: center; gap: 16px;">
        <div id="selectedLandingColorPreview" style="width: 60px; height: 60px; border-radius: 12px; background: ${currentColor}; border: 2px solid rgba(255,255,255,0.2);"></div>
        <div style="flex: 1;">
          <label style="color: rgba(255,255,255,0.6); font-size: 12px; display: block; margin-bottom: 4px;">Selected Color:</label>
          <input type="text" id="selectedLandingColorHex" value="${currentColor}" readonly
                 style="width: 100%; padding: 10px; background: rgba(20,20,20,0.8); border: 1px solid var(--primary-color-20); border-radius: 8px; color: #ffffff; font-family: monospace; font-size: 14px;">
        </div>
      </div>
      
      <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
        <button onclick="closeLandingColorPickerModal()" class="btn-cancel">Cancel</button>
        <button onclick="applyLandingCustomColor()" class="btn-save">Apply Color</button>
      </div>
    </div>
    
    <style>
      #landingColorPickerModal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #landingColorPickerModal .color-picker-modal-content {
        position: relative;
        background: rgba(30, 30, 30, 0.98);
        border-radius: 20px;
        padding: 28px;
        width: 90%;
        max-width: 650px;
        max-height: 85vh;
        overflow-y: auto;
        border: 2px solid var(--primary-color);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--primary-color);
      }
      #landingColorPickerModal .color-palette-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 4px;
      }
      #landingColorPickerModal .palette-color {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }
      #landingColorPickerModal .palette-color:hover {
        transform: scale(1.15);
        border-color: rgba(255,255,255,0.8);
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  window.selectedLandingCustomColor = currentColor;
};

window.closeLandingColorPickerModal = function() {
  const modal = document.getElementById('landingColorPickerModal');
  if (modal) modal.remove();
};

window.selectLandingPaletteColor = function(color) {
  // Convert RGB/HSL to HEX
  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g);
    if (!result) return color;
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const hslToHex = (hsl) => {
    const result = hsl.match(/\d+/g);
    if (!result) return color;
    let h = parseInt(result[0]) / 360;
    let s = parseInt(result[1]) / 100;
    let l = parseInt(result[2]) / 100;
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  let hexColor = color;
  if (color.startsWith('rgb')) {
    hexColor = rgbToHex(color);
  } else if (color.startsWith('hsl')) {
    hexColor = hslToHex(color);
  }
  
  // Update preview
  document.getElementById('selectedLandingColorPreview').style.background = color;
  document.getElementById('selectedLandingColorHex').value = hexColor;
  window.selectedLandingCustomColor = hexColor;
};

window.applyLandingCustomColor = function() {
  const color = window.selectedLandingCustomColor || '#7ea2d4';
  selectLandingPresetColor(color);
  closeLandingColorPickerModal();
};

// Load featured courses from backend
async function loadFeaturedCourses() {
  try {
    const user = store.getState().user;
    const response = await apiService.getCourses(user._id);

    const coursesList = document.getElementById('featuredCoursesList');
    if (!coursesList) return;

    if (response.success && response.courses && response.courses.length > 0) {
      // Get previously selected courses
      const selectedCourseIds = user.landingPageSettings?.featuredCourses || [];
      
      console.log('🎓 Loading featured courses...');
      console.log('🎓 User landing page settings:', user.landingPageSettings);
      console.log('🎓 Selected course IDs:', selectedCourseIds);
      console.log('🎓 Available courses:', response.courses.map(c => ({ id: c._id, title: c.title })));
      
      coursesList.innerHTML = response.courses.map(course => {
        const isSelected = selectedCourseIds.includes(course._id);
        console.log(`🎓 Course ${course.title}: isSelected = ${isSelected}`);
        return `
          <div class="course-item ${isSelected ? 'selected' : ''}" data-course-id="${course._id}">
            <input type="checkbox" class="course-checkbox" name="featuredCourses" value="${course._id}" ${isSelected ? 'checked' : ''}>
            <div class="course-info">
              <h4>${course.title}</h4>
              <p>${course.enrollmentCount || 0} students • ${course.courseType === 'free' ? 'Free' : (course.price ? course.price.toLocaleString() + ' so\'m' : 'Free')}</p>
            </div>
          </div>
        `;
      }).join('');

      // Add event listeners for course selection
      coursesList.querySelectorAll('.course-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const item = this.closest('.course-item');
          if (this.checked) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }

          // Limit selection to 6 courses
          const selectedCourses = coursesList.querySelectorAll('.course-checkbox:checked');
          if (selectedCourses.length > 6) {
            this.checked = false;
            item.classList.remove('selected');
            showErrorToast('You can select maximum 6 courses for your landing page');
          }
        });
      });
    } else {
      coursesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h3 style="margin-bottom: 8px;">No courses yet</h3>
          <p>Create your first course to feature it on your landing page</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    document.getElementById('featuredCoursesList').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="color: #ef4444;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 style="margin-bottom: 8px;">Failed to load courses</h3>
        <p>Please try again later</p>
      </div>
    `;
  }
}

// Load featured testimonials from backend
async function loadFeaturedTestimonials() {
  try {
    const user = store.getState().user;
    const testimonialsList = document.getElementById('featuredTestimonialsList');
    if (!testimonialsList) return;

    // Get teacher profile with reviews from backend
    let testimonials = [];
    
    try {
      const teacherProfile = await apiService.getTeacherProfile(user._id);
      if (teacherProfile.success && teacherProfile.teacher.reviews) {
        testimonials = teacherProfile.teacher.reviews.map(review => ({
          _id: review._id || review.studentId,
          studentName: review.studentName || 'Anonymous Student',
          rating: review.rating || 5,
          comment: review.comment || '',
          courseName: review.courseName || 'Course'
        }));
      }
    } catch (error) {
      console.log('Could not load reviews from backend, using empty state');
    }

    if (testimonials.length > 0) {
      testimonialsList.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-item" data-testimonial-id="${testimonial._id}">
          <input type="checkbox" class="testimonial-checkbox" name="featuredTestimonials" value="${testimonial._id}">
          <div class="testimonial-info">
            <h4>${testimonial.studentName}</h4>
            <p>"${testimonial.comment.length > 60 ? testimonial.comment.substring(0, 60) + '...' : testimonial.comment}"</p>
            <div class="stars">
              ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
            </div>
          </div>
        </div>
      `).join('');

      // Add event listeners for testimonial selection
      testimonialsList.querySelectorAll('.testimonial-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const item = this.closest('.testimonial-item');
          if (this.checked) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }

          // Limit selection to 5 testimonials
          const selectedTestimonials = testimonialsList.querySelectorAll('.testimonial-checkbox:checked');
          if (selectedTestimonials.length > 5) {
            this.checked = false;
            item.classList.remove('selected');
            showErrorToast('You can select maximum 5 testimonials for your landing page');
          }
        });
      });
    } else {
      testimonialsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: #fbbf24;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 style="margin-bottom: 8px;">No reviews yet</h3>
          <p>Student reviews will appear here once you start receiving feedback</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading testimonials:', error);
    document.getElementById('featuredTestimonialsList').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="color: #ef4444;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 style="margin-bottom: 8px;">Failed to load testimonials</h3>
        <p>Please try again later</p>
      </div>
    `;
  }
}

// Load certificates from backend
async function loadCertificates() {
  try {
    const user = store.getState().user;
    const certificatesList = document.getElementById('certificatesList');
    if (!certificatesList) return;

    console.log('🔄 Loading certificates from backend...');

    // Fetch fresh teacher data from backend to get latest certificates
    const response = await apiService.getTeacherDashboard(user._id);
    console.log('📡 Full API response:', response);

    if (response && response.success && response.data && response.data.teacher) {
      const latestTeacher = response.data.teacher;
      console.log('👤 Teacher data structure:', latestTeacher);
      console.log('📋 Teacher certificates field:', latestTeacher.certificates);
      console.log('📋 Certificates array length:', (latestTeacher.certificates || []).length);

      // Update store with latest teacher data
      const updatedUser = { ...user, ...latestTeacher };
      store.setState({ user: updatedUser });

      console.log('✅ Latest certificates from backend:', latestTeacher.certificates || []);

      // Check if user has certificates in their profile
      if (latestTeacher.certificates && latestTeacher.certificates.length > 0) {
      certificatesList.innerHTML = latestTeacher.certificates.map((cert, index) => `
        <div class="certificate-card" data-certificate-index="${index}">
          <div class="certificate-image" onclick="openCertificateModal('${cert.url}', '${cert.title}')">
            <img src="${cert.url}" alt="${cert.title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="certificate-content">
            <div style="margin-bottom: 8px;">
              <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Certificate title:</p>
              <h4 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${cert.title}</h4>
            </div>
            <div style="margin-bottom: 8px;">
              <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Issued organization:</p>
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">${cert.issuer}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Issue year:</p>
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">${cert.year || (cert.issueDate ? new Date(cert.issueDate).getFullYear() : new Date().getFullYear())}</p>
            </div>
          </div>
          <button type="button" class="certificate-remove-btn" onclick="removeCertificate(${index})" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      `).join('');
      
      // Add modal to page if not exists
      if (!document.getElementById('certificateModal')) {
        const modal = document.createElement('div');
        modal.id = 'certificateModal';
        modal.className = 'certificate-modal';
        modal.innerHTML = `
          <div class="certificate-modal-content">
            <button class="certificate-modal-close" onclick="closeCertificateModal()">×</button>
            <img id="certificateModalImage" src="" alt="">
          </div>
        `;
        modal.onclick = (e) => {
          if (e.target === modal) closeCertificateModal();
        };
        document.body.appendChild(modal);
      }
    } else {
      // Show empty state when no certificates exist
      certificatesList.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p style="color: rgba(255,255,255,0.6); margin: 0; text-align: center;">No certificates added yet. Add your first certificate to showcase your expertise.</p>
        </div>
      `;
      }
    } else {
      console.error('❌ Failed to load teacher data for certificates');
      // Fallback to local data if API fails
      const localCertificates = user.certificates || [];
      if (localCertificates.length > 0) {
        certificatesList.innerHTML = localCertificates.map((cert, index) => `
          <div class="certificate-card" data-certificate-index="${index}">
            <div class="certificate-image" onclick="openCertificateModal('${cert.url}', '${cert.title}')">
              <img src="${cert.url}" alt="${cert.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="certificate-content">
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Certificate title:</p>
                <h4 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${cert.title}</h4>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Issued organization:</p>
                <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">${cert.issuer}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;">Issue year:</p>
                <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">${cert.year || (cert.issueDate ? new Date(cert.issueDate).getFullYear() : new Date().getFullYear())}</p>
              </div>
            </div>
            <button type="button" class="certificate-remove-btn" onclick="removeCertificate(${index})" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        `).join('');
        
        // Add modal to page if not exists
        if (!document.getElementById('certificateModal')) {
          const modal = document.createElement('div');
          modal.id = 'certificateModal';
          modal.className = 'certificate-modal';
          modal.innerHTML = `
            <div class="certificate-modal-content">
              <button class="certificate-modal-close" onclick="closeCertificateModal()">×</button>
              <img id="certificateModalImage" src="" alt="">
            </div>
          `;
          modal.onclick = (e) => {
            if (e.target === modal) closeCertificateModal();
          };
          document.body.appendChild(modal);
        }
      } else {
        certificatesList.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p style="color: rgba(255,255,255,0.6); margin: 0; text-align: center;">No certificates added yet. Add your first certificate to showcase your expertise.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('❌ Error loading certificates:', error);
  }
}

// Add new certificate
window.addNewCertificate = async function() {
  const modal = document.createElement('div');
  modal.className = 'certificate-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCertificateModal()"></div>
    <div class="modal-content" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px; color: #ffffff;">Add Certificate</h3>
      <form id="addCertificateForm">
        <div class="form-field">
          <label class="field-label">Certificate Title *</label>
          <input type="text" class="form-input" name="title" placeholder="e.g. Full Stack Web Developer" required>
        </div>
        <div class="form-field">
          <label class="field-label">Issuing Organization *</label>
          <input type="text" class="form-input" name="issuer" placeholder="e.g. Meta (Facebook)" required>
        </div>
        <div class="form-field">
          <label class="field-label">Issue Year *</label>
          <input type="number" class="form-input" name="year" placeholder="2023" min="2000" max="${new Date().getFullYear()}" required>
        </div>
        <div class="form-field">
          <label class="field-label">Upload Certificate Image *</label>
          <input type="file" id="certificateFileInput" accept="image/jpeg,image/jpg,image/png" style="display: none;" onchange="handleCertificateFileSelect(event)">
          <button type="button" class="btn-upload-cert" onclick="document.getElementById('certificateFileInput').click()">
            📎 Choose File
          </button>
          <span id="certificateFileName" style="margin-left: 12px; color: rgba(255,255,255,0.6); font-size: 13px;"></span>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick="closeCertificateModal()">Cancel</button>
          <button type="submit" class="btn-save" id="addCertificateBtn">Add Certificate</button>
        </div>
      </form>
    </div>
    <style>
      .certificate-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
      }
      .modal-content {
        position: relative;
        background: rgba(58, 56, 56, 0.95);
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 500px;
        border: 1px solid var(--primary-color-20);
        z-index: 10000;
      }
      .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }
    </style>
  `;

  document.body.appendChild(modal);
  window.certificateFileToUpload = null;

  // Handle form submission
  document.getElementById('addCertificateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const title = formData.get('title');
    const issuer = formData.get('issuer');
    const year = formData.get('year');
    
    if (!window.certificateFileToUpload) {
      showErrorToast('Please upload a certificate file');
      return;
    }

    try {
      const btn = document.getElementById('addCertificateBtn');
      btn.disabled = true;
      btn.textContent = 'Uploading...';

      console.log('📋 Starting certificate creation:', { title, issuer, year });

      // Upload file to backend
      const uploadFormData = new FormData();
      uploadFormData.append('file', window.certificateFileToUpload);

      const token = localStorage.getItem('accessToken');
      console.log('📤 Uploading certificate file...');
      const uploadResponse = await fetch(`${config.api.baseUrl}/upload/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      console.log('📤 Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      console.log('📤 Upload data:', uploadData);

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      // Save certificate to user profile
      const user = store.getState().user;
      const certificates = user.certificates || [];
      const newCertificate = {
        title,
        issuer,
        year: year,
        issueDate: new Date(year, 0, 1).toISOString(),
        url: uploadData.url
      };
      certificates.push(newCertificate);

      console.log('📋 Saving certificate to profile:', newCertificate);
      console.log('📋 Updated certificates array:', certificates);

      const result = await apiService.updateTeacherProfile(user._id, { certificates });
      console.log('📋 Profile update result:', result);

      if (result.success) {
        console.log('✅ Certificate saved successfully, updating local state');
        store.setState({ user: { ...user, certificates } });
        loadCertificates();
        closeCertificateModal();
        showSuccessToast('Certificate added successfully!');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Certificate add error:', error);
      showErrorToast(error.message || 'Failed to add certificate');
      const btn = document.getElementById('addCertificateBtn');
      btn.disabled = false;
      btn.textContent = 'Add Certificate';
    }
  });
};

// Handle certificate file selection
window.handleCertificateFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showErrorToast('File size too large. Max 10MB');
    event.target.value = '';
    return;
  }

  // Validate file type (only images and PDF, no videos)
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    showErrorToast('Invalid file type. Only images (JPEG, PNG) and PDF allowed');
    event.target.value = '';
    return;
  }

  window.certificateFileToUpload = file;
  document.getElementById('certificateFileName').textContent = file.name;
};

// Close certificate modal
window.closeCertificateModal = function() {
  const modal = document.querySelector('.certificate-modal');
  if (modal) {
    modal.remove();
  }
};

// Remove certificate with confirmation
window.removeCertificate = function(index) {
  const user = store.getState().user;
  const certificate = user.certificates?.[index];
  
  if (!certificate) return;
  
  // Show confirmation modal
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
      <div onclick="event.stopPropagation()" style="background: rgba(58, 56, 56, 0.98); border-radius: 16px; padding: 28px; width: 90%; max-width: 420px; border: 2px solid var(--primary-color-20);">
        <div style="text-align: center; margin-bottom: 20px;">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 16px;">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px;">Delete Certificate?</h3>
          <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">Are you sure you want to delete "${certificate.title}"? This action cannot be undone.</p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button onclick="this.closest('div[style*=fixed]').remove()" class="btn-cancel">Cancel</button>
          <button onclick="confirmRemoveCertificate(${index})" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.confirmRemoveCertificate = async function(index) {
  try {
    const user = store.getState().user;
    const certificates = [...(user.certificates || [])];
    certificates.splice(index, 1);

    const result = await apiService.updateTeacherProfile(user._id, { certificates });

    if (result.success) {
      store.setState({ user: { ...user, certificates } });
      loadCertificates();
      document.querySelector('div[style*="position: fixed"]')?.remove();
      showSuccessToast('Certificate deleted successfully');
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Certificate delete error:', error);
    showErrorToast('Failed to delete certificate');
  }
};

// Handle landing settings form submission
async function handleLandingSettingsSave(event) {
  event.preventDefault();

  try {
    const formData = new FormData(event.target);
    const user = store.getState().user;

    // Collect form data
    const landingData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      specialization: formData.get('specialty'),
      bio: formData.get('bio'),
      logoText: formData.get('logoText'),
      heroText: formData.get('heroText'),
      socialLinks: {
        linkedin: formData.get('linkedin'),
        instagram: formData.get('instagram'),
        telegram: formData.get('telegram'),
        youtube: formData.get('youtube')
      },
      featuredCourses: formData.getAll('featuredCourses'),
      featuredTestimonials: formData.getAll('featuredTestimonials'),
      themeColor: document.getElementById('landingColorInput')?.value || '#7ea2d4'
    };

    console.log('💾 Saving landing page data:', landingData);

    // Save to Landing API (separate from teacher profile)
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${apiBaseUrl}/landing/${user._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: `${landingData.firstName} ${landingData.lastName}'s Courses`,
        subtitle: landingData.specialization,
        description: 'Discover amazing courses and start your learning journey today.',
        logoText: landingData.logoText,
        heroText: landingData.heroText,
        heroImage: user.heroImage || '',
        aboutText: landingData.bio,
        socialLinks: landingData.socialLinks,
        primaryColor: landingData.themeColor
      })
    });

    const result = await response.json();
    console.log('📥 Landing update response:', result);

    if (result.success) {
      // Update local state
      const updatedUser = {
        ...user,
        ...landingData,
        landingPageSettings: landingData
      };
      store.setState({ user: updatedUser });

      showSuccessToast('Landing page settings saved successfully!');

      // Optionally redirect back to dashboard
      setTimeout(() => {
        backToDashboard();
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to save landing page settings');
    }
  } catch (error) {
    console.error('❌ Landing page save error:', error);
    showErrorToast(error.message || 'Failed to save landing page settings');
  }
}

window.customizeUI = function() {
  openCustomizeUI();
};

// Open Landing Page Preview
window.openLandingPreview = async function() {
  try {
    const user = store.getState().user;
    if (!user) {
      showErrorToast('User data not found');
      return;
    }

    // Get the latest teacher profile data
    const teacherResult = await apiService.getTeacherProfile(user._id);
    if (!teacherResult.success) {
      showErrorToast('Failed to load teacher data');
      return;
    }

    const teacher = teacherResult.teacher;
    const landingPageHTML = await generateLandingPageHTML(teacher);

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(landingPageHTML);
    previewWindow.document.close();

  } catch (error) {
    console.error('Preview error:', error);
    showErrorToast('Failed to open preview');
  }
};

// Generate Landing Page HTML
async function generateLandingPageHTML(teacher) {
  // Translation object for landing page
  const translations = {
    uz: {
      // Menu
      home: 'Asosiy',
      about: 'Haqida',
      certificates: 'Sertifikatlar',
      courses: 'Kurslar',
      testimonials: 'Sharhlar',
      contact: 'Aloqa',
      // Buttons
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      startLearning: "O'rganishni boshlash",
      viewCourse: "Kursni ko'rish",
      viewCourses: "Kurslarni ko'rish",
      enrollNow: "Hozir yozilish",
      // Sections
      myCourses: 'Mening kurslarim',
      aboutMe: "O'qituvchi haqida",
      myTestimonials: 'Sharhlar',
      contactMe: 'Menga murojaat',
      certificatesSection: 'Sertifikatlar & Malaka',
      availableCourses: 'Mavjud Kurslar',
      // Certificate fields
      certTitle: 'Sertifikat nomi:',
      certOrg: 'Bergan tashkilot:',
      certYear: 'Berilgan yili:',
      // Other
      students: "o'quvchi",
      studentsPlural: "o'quvchilar",
      rating: 'Reyting',
      experience: 'Tajriba',
      price: 'Narx',
      free: 'Bepul',
      paid: 'Pullik',
      footer: 'DarsLinker platformasi orqali yaratilgan.'
    },
    ru: {
      // Menu
      home: 'Главная',
      about: 'О себе',
      certificates: 'Сертификаты',
      courses: 'Курсы',
      testimonials: 'Отзывы',
      contact: 'Контакты',
      // Buttons
      login: 'Войти',
      register: 'Регистрация',
      startLearning: 'Начать обучение',
      viewCourse: 'Посмотреть курс',
      viewCourses: 'Посмотреть курсы',
      enrollNow: 'Записаться сейчас',
      // Sections
      myCourses: 'Мои курсы',
      aboutMe: 'О преподавателе',
      myTestimonials: 'Отзывы',
      contactMe: 'Связаться со мной',
      certificatesSection: 'Сертификаты и квалификация',
      availableCourses: 'Доступные курсы',
      // Certificate fields
      certTitle: 'Название сертификата:',
      certOrg: 'Организация:',
      certYear: 'Год выдачи:',
      // Other
      students: 'студент',
      studentsPlural: 'студентов',
      rating: 'Рейтинг',
      experience: 'Опыт',
      price: 'Цена',
      free: 'Бесплатно',
      paid: 'Платно',
      footer: 'Создано на платформе DarsLinker.'
    },
    en: {
      // Menu
      home: 'Home',
      about: 'About',
      certificates: 'Certificates',
      courses: 'Courses',
      testimonials: 'Testimonials',
      contact: 'Contact',
      // Buttons
      login: 'Login',
      register: 'Register',
      startLearning: 'Start Learning',
      viewCourse: 'View Course',
      viewCourses: 'View Courses',
      enrollNow: 'Enroll Now',
      // Sections
      myCourses: 'My Courses',
      aboutMe: 'About Teacher',
      myTestimonials: 'Testimonials',
      contactMe: 'Contact Me',
      certificatesSection: 'Certificates & Qualifications',
      availableCourses: 'Available Courses',
      // Certificate fields
      certTitle: 'Certificate Title:',
      certOrg: 'Issued Organization:',
      certYear: 'Issue Year:',
      // Other
      students: 'Students',
      rating: 'Rating',
      experience: 'Experience',
      price: 'Price',
      free: 'Free',
      paid: 'Paid',
      footer: 'Created with DarsLinker platform.'
    }
  };

  // Fetch landing data from Landing API
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
  let landingData = null;
  
  try {
    const response = await fetch(`${apiBaseUrl}/landing/public/${teacher._id}`);
    const data = await response.json();
    if (data.success) {
      landingData = data.landing;
    }
  } catch (error) {
    console.error('Error fetching landing data:', error);
  }
  
  const themeColor = landingData?.primaryColor || '#7EA2D4';
  const logoText = landingData?.logoText || 'DarsLinker';
  const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
  const heroText = landingData?.heroText || 'DASTURLASH NI\nPROFESSIONAL\nO\'QITUVCHI BILAN O\'RGANING';
  const heroImage = landingData?.heroImage || '';
  
  // Merge teacher data with landing data
  const teacherWithLanding = {
    ...teacher,
    socialLinks: landingData?.socialLinks || teacher.socialLinks || {}
  };
  
  console.log('🎓 Landing data:', landingData);
  console.log('🎓 Hero text:', heroText);
  console.log('🎓 Hero image:', heroImage);
  console.log('🎓 Social links:', teacherWithLanding.socialLinks);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fullName} - Professional Teacher</title>
    <style>
        :root {
            --theme-color: ${themeColor};
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: #232323;
            color: var(--theme-color);
            overflow-x: hidden;
        }

        html {
            scroll-behavior: smooth;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header */
        .header {
            background: #232323;
            padding: 25px 0;
            box-shadow: 0 2px 10px rgba(126, 162, 212, 0.1);
            border-bottom: 1px solid rgba(126, 162, 212, 0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            font-family: 'League Spartan', sans-serif;
            font-size: 32px;
            font-weight: 600;
        }

        .logo-text {
            color: #ffffff;
        }

        .logo-text-colored {
            color: ${themeColor};
        }

        .nav-menu {
            display: flex;
            gap: 40px;
            align-items: center;
        }

        .nav-link {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .nav-link:hover {
            color: ${themeColor};
        }

        .nav-link.active {
            color: ${themeColor};
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .language-selector {
            position: relative;
        }

        .lang-current {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid ${themeColor};
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            height: 42px;
            box-sizing: border-box;
        }

        .lang-current:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: ${themeColor};
        }

        .lang-current img {
            width: 22px;
            height: 16px;
            object-fit: cover;
            border-radius: 2px;
        }

        .lang-current span {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            font-size: 13px;
        }

        .lang-arrow {
            color: rgba(255, 255, 255, 0.6);
            font-size: 8px;
            transition: transform 0.3s ease;
            margin-left: 2px;
        }

        .language-selector.open .lang-arrow {
            transform: rotate(180deg);
        }

        .lang-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: #2a2a2a;
            border: 1px solid ${themeColor};
            border-radius: 6px;
            padding: 6px;
            min-width: 100px;
            display: none;
            flex-direction: column;
            gap: 2px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        }

        .language-selector.open .lang-dropdown {
            display: flex;
        }

        .lang-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .lang-option:hover {
            background: rgba(126, 162, 212, 0.1);
        }

        .lang-option.active {
            background: rgba(126, 162, 212, 0.2);
        }

        .lang-option img {
            width: 22px;
            height: 16px;
            object-fit: cover;
            border-radius: 2px;
        }

        .lang-option span {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            font-size: 13px;
        }

        .auth-buttons {
            display: flex;
            gap: 12px;
        }

        .auth-button {
            background: ${themeColor};
            color: white;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .auth-button:hover {
            background: ${themeColor}dd;
            transform: translateY(-1px);
        }

        .auth-button.secondary {
            background: transparent;
            border: 1px solid ${themeColor};
            color: ${themeColor};
        }

      

        /* Hero Section */
        .hero {
            background: white;
            padding: 130px 0;
            text-align: center;
        }

        .hero-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            max-width: 1000px;
            margin: 0 auto;
        }

        .hero-text {
            text-align: left;
        }

        .hero h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 20px;
            color: #333;
        }

        .hero h1 .highlight {
            color: ${themeColor};
        }


        .cta-button {
            background: ${themeColor};
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .cta-button:hover {
            background: ${themeColor}dd;
            transform: translateY(-2px);
        }

        .hero-image {
            text-align: center;
        }

        .hero-image img {
            max-width: 500px;
            width: 500px;
            height: 500px;
            object-fit: cover;
            border-radius: 50%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .stats-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stats-number {
            font-size: 24px;
            font-weight: bold;
            color: ${themeColor};
        }

        .stats-label {
            font-size: 12px;
            color: #666;
        }

        /* About Section */
        .about {
            background: #232323;
            padding: 80px 0;
        }

        .about h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #ffffff;
        }

        .about p {
            font-size: 1.1rem;
            color: #ffffff;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Certificates Section */
        .certificates {
            background: #232323;
            padding: 80px 0;
        }

        .certificates h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--theme-color);
            margin-bottom: 50px;
            text-align: center;
        }

        .certificates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .certificate-item {
            background: rgba(58, 56, 56, 0.6);
            border: 1px solid var(--theme-color);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
        }

        .certificate-image-wrapper {
            width: 100%;
            height: 300px;
            overflow: hidden;
            background: rgba(126, 162, 212, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
        }

        .certificate-image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .certificate-image-wrapper:hover img {
            transform: scale(1.05);
        }

        .certificate-icon {
            width: 80px;
            height: 80px;
            background: ${themeColor};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
        }

        .certificate-info {
            padding: 20px;
            background: rgba(40, 40, 40, 0.8);
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .certificate-info-row {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .certificate-info-label {
            color: rgba(255, 255, 255, 0.5);
            font-size: 13px;
            font-weight: 500;
            min-width: 140px;
        }

        .certificate-info-value {
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
        }

        /* Certificate Modal */
        .certificate-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        }

        .certificate-modal-content {
            max-width: 90vw;
            max-height: 90vh;
            position: relative;
        }

        .certificate-modal-content img {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 8px;
        }

        .certificate-modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
        }

        .certificate-modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Courses Section */
        .courses {
            background: #232323;
            padding: 80px 0;
        }

        .courses h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--theme-color);
            margin-bottom: 50px;
            text-align: center;
        }

        .course-card {
            background: rgba(58, 56, 56, 0.3);
            border: 1px solid var(--theme-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .course-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .course-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
        }

        .course-content {
            padding: 20px;
        }

        .course-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #ffffff;
        }

        .course-meta {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-top: 15px;
        }

        .course-price {
            font-size: 1.1rem;
            font-weight: 600;
            color: ${themeColor};
        }

        /* Profile Section */
        .profile {
            background: #232323 !important;
            padding: 80px 0;
        }

        .profile-card {
            background: rgba(58, 56, 56, 0.6);
            border: 1px solid rgba(126, 162, 212, 0.3);
            border-radius: 20px;
            padding: 60px;
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 80px;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .profile-info {
            text-align: left;
        }

        .profile-info h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 15px;
            color: #ffffff;
            line-height: 1.2;
        }

        .profile-specialization {
            color: ${themeColor};
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 25px;
        }

        .profile-about-title {
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 15px;
            margin-top: 20px;
        }

        .profile-bio {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1rem;
            line-height: 1.7;
            margin-bottom: 30px;
        }

        .profile-image-container {
            text-align: center;
            position: relative;
        }

        .profile-image {
            width: 350px;
            height: 350px;
            border-radius: 50%;
            object-fit: cover;
            border: 6px solid ${themeColor};
            box-shadow: 0 15px 50px rgba(126, 162, 212, 0.4);
        }

        .profile-placeholder {
            width: 350px;
            height: 350px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 100px;
            color: white;
            font-weight: bold;
            box-shadow: 0 15px 50px rgba(126, 162, 212, 0.4);
        }

        .social-links {
            display: flex;
            gap: 15px;
            justify-content: flex-start;
        }

        .social-link {
            width: 45px;
            height: 45px;
            background: ${themeColor};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 20px;
        }

        .social-link:hover {
            background: ${themeColor}dd;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(126, 162, 212, 0.4);
        }

        .social-media-section {
            display: flex;
            gap: 15px;
            justify-content: flex-start;
        }

        .social-media-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 45px;
            height: 45px;
            background: rgba(126, 162, 212, 0.1);
            border: 2px solid ${themeColor};
            border-radius: 12px;
            color: ${themeColor};
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-media-link:hover {
            background: ${themeColor};
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(126, 162, 212, 0.4);
        }



            font-weight: 600;
        }

        /* Contact Section */
        .contact {
            background: #232323;
            padding: 80px 0;
            text-align: center;
        }

        .contact h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #ffffff;
        }

        .contact p {
            color: #ffffff;
            margin-bottom: 30px;
        }

        .contact-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .contact-button {
            background: ${themeColor};
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .contact-button:hover {
            background: ${themeColor}dd;
            transform: translateY(-2px);
        }

        /* Footer */
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 40px 0;
            text-align: center;
            border-top: 2px solid var(--theme-color);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-content {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .hero-features {
                justify-content: center;
                flex-wrap: wrap;
            }

            .stats-section {
                flex-direction: column;
                gap: 30px;
            }

            .contact-buttons {
                flex-direction: column;
                align-items: center;
            }

            .profile-card {
                grid-template-columns: 1fr;
                gap: 40px;
                padding: 30px;
                text-align: center;
            }

            .profile-info {
                order: 2;
                text-align: center;
            }

            .profile-image-container {
                order: 1;
            }

            .profile-image,
            .profile-placeholder {
                width: 250px;
                height: 250px;
                margin: 0 auto;
                font-size: 80px;
            }

            .social-media-section {
                justify-content: center;
            }

            .profile-info h2 {
                font-size: 2rem;
            }

            .features-content {
                grid-template-columns: 1fr;
                gap: 40px;
                text-align: center;
            }

            .features-slide-container {
                height: 350px;
            }

            .slide-card {
                padding: 30px;
            }

            .slide-controls {
                gap: 15px;
            }

            .slide-btn {
                width: 35px;
                height: 35px;
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <span class="logo-text" style="color: ${themeColor};">${logoText}</span>
                </div>
                
                <nav class="nav-menu">
                    <a href="#hero" class="nav-link active" onclick="scrollToSection(event, 'hero')" data-i18n="home">Asosiy</a>
                    <a href="#about" class="nav-link" onclick="scrollToSection(event, 'about')" data-i18n="about">Haqida</a>
                    <a href="#certificates" class="nav-link" onclick="scrollToSection(event, 'certificates')" data-i18n="certificates">Sertifikatlar</a>
                    <a href="#courses" class="nav-link" onclick="scrollToSection(event, 'courses')" data-i18n="courses">Kurslar</a>
                </nav>
                
                <div class="header-actions">
                    <!-- Language Selector -->
                    <div class="language-selector" onclick="toggleLangDropdown(event)">
                        <div class="lang-current">
                            <img src="/images/uz-flag.jpg" alt="UZ" id="currentLangFlag">
                            <span id="currentLangText">UZ</span>
                            <span class="lang-arrow">▼</span>
                        </div>
                        <div class="lang-dropdown">
                            <div class="lang-option active" data-lang="uz" onclick="selectLanguage(event, 'uz')">
                                <img src="/images/uz-flag.jpg" alt="UZ">
                                <span>UZ</span>
                            </div>
                            <div class="lang-option" data-lang="en" onclick="selectLanguage(event, 'en')">
                                <img src="/images/us-flag.png" alt="EN">
                                <span>EN</span>
                            </div>
                            <div class="lang-option" data-lang="ru" onclick="selectLanguage(event, 'ru')">
                                <img src="/images/ru-flag.jpg" alt="RU">
                                <span>RU</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Auth Buttons -->
                    <div class="auth-buttons">
                        <a href="#" class="auth-button secondary" style="border-color: ${themeColor}; color: ${themeColor};" onclick="openLoginModal(event)" data-i18n="login">Kirish</a>
                        <a href="#" class="auth-button" style="background: ${themeColor};" onclick="openRegistrationModal(event)" data-i18n="register" data-teacher-id="${teacher._id}">Ro'yxatdan o'tish</a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>${heroText.split('\n').map((line, i) => 
                      i === 1 ? `<span class="highlight">${line}</span>` : line
                    ).join('<br>')}</h1>

                    <a href="#courses" class="cta-button" data-i18n="viewCourses">Kurslarni ko'rish</a>
                </div>
                
                <div class="hero-image" style="position: relative;">
                    <img src="${heroImage || '/src/assets/images/undraw_online-stats_d57c.png'}" alt="Learning" />
                    <div class="stats-badge">
                        <div class="stats-number">500+</div>
                        <div class="stats-label">O'quvchi</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Profile Section -->
    <section class="profile" id="about">
        <div class="container">
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 50px; color: ${themeColor}; text-align: center;" data-i18n="aboutMe">O'qituvchi haqida</h2>
            <div class="profile-card">
                <!-- Profile Information - Left Side -->
                <div class="profile-info">
                    <h2>${fullName || 'Teacher'}</h2>
                    <div class="profile-specialization">${teacher.specialization || 'Senior Software Engineer'}</div>
                    <div class="profile-bio">${teacher.bio || 'Men 7 yildan ortiq dasturlash sohasida faoliyat yuritaman. 500+ o\'quvchiga dasturlashni o\'rgatganman va ularning ko\'pchiligi hozir yirik kompaniyalarda ishlaydilar.'}</div>

                    <!-- Social Media Links -->
                    <div class="social-media-section">
                        ${teacherWithLanding.socialLinks?.instagram ? `
                        <!-- Instagram -->
                        <a href="https://instagram.com/${teacherWithLanding.socialLinks.instagram.replace('@', '')}" class="social-media-link" target="_blank">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        ` : ''}

                        ${teacherWithLanding.socialLinks?.telegram ? `
                        <!-- Telegram -->
                        <a href="https://t.me/${teacherWithLanding.socialLinks.telegram.replace('@', '')}" class="social-media-link" target="_blank">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                        </a>
                        ` : ''}

                        ${teacherWithLanding.socialLinks?.linkedin ? `
                        <!-- LinkedIn -->
                        <a href="${teacherWithLanding.socialLinks.linkedin}" class="social-media-link" target="_blank">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                        ` : ''}

                        ${teacherWithLanding.socialLinks?.youtube ? `
                        <!-- YouTube -->
                        <a href="${teacherWithLanding.socialLinks.youtube}" class="social-media-link" target="_blank">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                        ` : ''}
                    </div>
                </div>

                <!-- Profile Image - Right Side -->
                <div class="profile-image-container">
                    ${teacher.profileImage
                        ? `<img src="${teacher.profileImage}" alt="${fullName}" class="profile-image">`
                        : `<div class="profile-placeholder">${fullName.charAt(0) || 'T'}</div>`
                    }
                </div>
            </div>
        </div>
    </section>

    ${teacher.courses && teacher.courses.length > 0 ? `
    <!-- Courses Section -->
    <section class="courses" id="courses">
        <div class="container">
            <h2 data-i18n="availableCourses">Mavjud Kurslar</h2>
            <div class="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
                ${teacher.courses.map(course => `
                    <div class="course-card" onclick="window.location.href='/course/${course._id}'" style="cursor: pointer;">
                        ${course.thumbnail
                            ? `<img src="${course.thumbnail}" alt="${course.title}" class="course-image">`
                            : `<div style="height: 250px; background: linear-gradient(135deg, ${themeColor}, #4a90e2); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📚</div>`
                        }
                        <div class="course-content">
                            <h3 class="course-title">${course.title}</h3>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 10px 0; line-height: 1.5;">${course.description ? (course.description.length > 100 ? course.description.substring(0, 100) + '...' : course.description) : ''}</p>
                            <div class="course-meta">
                                <div class="course-price"><span data-i18n="${course.courseType === 'free' ? 'free' : 'paid'}">${course.courseType === 'free' ? 'Bepul' : 'Pullik'}</span>${course.courseType !== 'free' ? ': ' + (course.discountPrice ? course.discountPrice.toLocaleString() + ' so\'m' : (course.price || 0).toLocaleString() + ' so\'m') : ''}</div>
                            </div>
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span>${course.totalStudents || 0} <span data-i18n="students">o'quvchi</span></span>
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    ${teacher.certificates && teacher.certificates.length > 0 ? `
    <!-- Certificates Section -->
    <section class="certificates" id="certificates">
        <div class="container">
            <h2 data-i18n="certificatesSection">Sertifikatlar & Malaka</h2>
            <div class="certificates-grid">
                ${teacher.certificates.map((cert, index) => `
                    <div class="certificate-item">
                        <div class="certificate-image-wrapper" onclick="openCertificateModal('${cert.url}', '${cert.title}')">
                            ${cert.url ? `
                                <img src="${cert.url}" alt="${cert.title}" />
                            ` : `
                                <div class="certificate-icon">🏆</div>
                            `}
                        </div>
                        <div class="certificate-info">
                            <div class="certificate-info-row">
                                <span class="certificate-info-label" data-i18n="certTitle">Certificate Title:</span>
                                <span class="certificate-info-value">${cert.title}</span>
                            </div>
                            <div class="certificate-info-row">
                                <span class="certificate-info-label" data-i18n="certOrg">Issued Organization:</span>
                                <span class="certificate-info-value">${cert.issuer || cert.issuedBy || 'Certificate'}</span>
                            </div>
                            <div class="certificate-info-row">
                                <span class="certificate-info-label" data-i18n="certYear">Issue Year:</span>
                                <span class="certificate-info-value">${cert.year || (cert.issueDate ? new Date(cert.issueDate).getFullYear() : new Date().getFullYear())}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : `
    <!-- Default Certificates Section -->
    <section class="certificates" id="certificates">
        <div class="container">
            <h2>Sertifikatlar & Malaka</h2>
            <div class="certificates-grid">
                <div class="certificate-item">
                    <div class="certificate-icon">🏆</div>
                    <div class="certificate-info">
                        <h4>AWS Certified Developer</h4>
                        <p>Amazon • 2023</p>
                    </div>
                </div>
                <div class="certificate-item">
                    <div class="certificate-icon">🏆</div>
                    <div class="certificate-info">
                        <h4>Google Cloud Professional</h4>
                        <p>Google • 2022</p>
                    </div>
                </div>
                <div class="certificate-item">
                    <div class="certificate-icon">🏆</div>
                    <div class="certificate-info">
                        <h4>Meta React Developer</h4>
                        <p>Meta • 2021</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `}

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${fullName}. <span data-i18n="footer">DarsLinker platformasi orqali yaratilgan.</span></p>
        </div>
    </footer>

    <script>
        // Registration Modal Functions
        let currentStep = 1;
        let registrationData = {
            firstName: '',
            lastName: '',
            phone: '',
            verificationCode: ''
        };

        function openRegistrationModal(e) {
            e.preventDefault();
            
            // Get teacherId from button's data attribute
            const teacherId = e.target.getAttribute('data-teacher-id');
            
            currentStep = 1;
            registrationData = { firstName: '', lastName: '', phone: '', verificationCode: '', teacherId: teacherId };
            console.log('🎯 Opening registration modal with teacherId:', teacherId);
            console.log('🎯 Registration data:', registrationData);
            
            const modal = document.createElement('div');
            modal.id = 'registrationModal';
            modal.innerHTML = \`
                <div class="modal-overlay" onclick="closeRegistrationModal()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="closeRegistrationModal()">&times;</button>
                        <div id="modalBody"></div>
                    </div>
                </div>
                <style>
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modal-content {
                        background: rgba(58, 56, 56, 0.95);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(126, 162, 212, 0.3);
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 500px;
                        width: 90%;
                        position: relative;
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .modal-close {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 32px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                    }
                    .modal-close:hover {
                        color: #ffffff;
                    }
                    .modal-title {
                        color: #ffffff;
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .modal-subtitle {
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 14px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    .step-indicator {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-bottom: 30px;
                    }
                    .step-dot {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: rgba(126, 162, 212, 0.3);
                        transition: all 0.3s ease;
                    }
                    .step-dot.active {
                        background: ${themeColor};
                        transform: scale(1.3);
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    .form-label {
                        display: block;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 500;
                        margin-bottom: 8px;
                    }
                    .form-input {
                        width: 100%;
                        padding: 12px 16px;
                        background: rgba(40, 40, 40, 0.8);
                        border: 1px solid rgba(126, 162, 212, 0.3);
                        border-radius: 10px;
                        color: #ffffff;
                        font-size: 16px;
                        outline: none;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                    }
                    .form-input:focus {
                        border-color: ${themeColor};
                        box-shadow: 0 0 0 3px ${themeColor}20;
                    }
                    .form-input::placeholder {
                        color: rgba(255, 255, 255, 0.4);
                    }
                    .phone-input-wrapper {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    .phone-prefix {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 16px;
                        background: rgba(40, 40, 40, 0.8);
                        border: 1px solid rgba(126, 162, 212, 0.3);
                        border-radius: 10px;
                        color: #ffffff;
                        font-size: 16px;
                        white-space: nowrap;
                    }
                    .flag-icon {
                        width: 24px;
                        height: 18px;
                        border-radius: 3px;
                    }
                    .phone-input {
                        flex: 1;
                    }
                    .password-input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .password-input-field {
                        padding-right: 50px !important;
                    }
                    .password-toggle-btn {
                        position: absolute;
                        right: 14px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                        z-index: 1;
                        width: 24px;
                        height: 24px;
                    }
                    .password-toggle-btn:hover {
                        color: rgba(255, 255, 255, 0.9);
                    }
                    .password-toggle-btn svg {
                        width: 20px;
                        height: 20px;
                    }
                    .error-message {
                        color: #ff6b6b;
                        font-size: 13px;
                        margin-top: 5px;
                        display: none;
                    }
                    .error-message.show {
                        display: block;
                    }
                    .modal-button {
                        width: 100%;
                        padding: 14px;
                        background: ${themeColor};
                        border: none;
                        border-radius: 10px;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin-top: 10px;
                    }
                    
                    .modal-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    .back-button {
                        background: transparent;
                        border: 1px solid rgba(126, 162, 212, 0.3);
                        margin-top: 10px;
                    }
                    .back-button:hover {
                        background: rgba(126, 162, 212, 0.1);
                    }
                    .verification-info {
                        background: rgba(126, 162, 212, 0.1);
                        border: 1px solid rgba(126, 162, 212, 0.3);
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 20px;
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 14px;
                        text-align: center;
                    }
                    .resend-link {
                        color: ${themeColor};
                        text-decoration: none;
                        font-weight: 500;
                        cursor: pointer;
                        transition: color 0.3s ease;
                    }
                    .resend-link:hover {
                        color: #5A85C7;
                        text-decoration: underline;
                    }
                </style>
            \`;
            document.body.appendChild(modal);
            renderStep(1);
        }

        function closeRegistrationModal() {
            const modal = document.getElementById('registrationModal');
            if (modal) {
                modal.remove();
            }
        }

        // Login Modal Functions
        function openLoginModal(e) {
            e.preventDefault();
            
            const modal = document.createElement('div');
            modal.id = 'loginModal';
            modal.innerHTML = \`
                <div class="modal-overlay" onclick="closeLoginModal()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="closeLoginModal()">&times;</button>
                        <div id="loginModalBody">
                            <h2 class="modal-title">Kirish</h2>
                            <p class="modal-subtitle">Telefon raqam va parolingizni kiriting</p>
                            
                            <div class="form-group">
                                <label class="form-label">Telefon raqam</label>
                                <div class="phone-input-wrapper">
                                    <div class="phone-prefix">
                                        <img src="/images/uz-flag.jpg" alt="UZ" class="flag-icon" />
                                        <span>+998</span>
                                    </div>
                                    <input type="tel" id="loginPhone" class="form-input phone-input" placeholder="90 123 45 67" maxlength="12" autocomplete="off" name="login-phone-new" />
                                </div>
                                <div class="error-message" id="loginPhoneError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Parol</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="loginPassword" class="form-input password-input-field" placeholder="Parolingizni kiriting" autocomplete="new-password" name="login-password-new" />
                                    <button type="button" class="password-toggle-btn" onclick="togglePassword('loginPassword', 'loginPasswordToggle')">
                                        <svg id="loginPasswordToggle" class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                                        </svg>
                                    </button>
                                </div>
                                <div class="error-message" id="loginPasswordError"></div>
                            </div>
                            
                            <button class="modal-button" onclick="handleLogin()">Kirish</button>
                            <button class="modal-button back-button" onclick="handleForgotPassword()">Parolni unutdingizmi?</button>
                        </div>
                    </div>
                </div>
                <style>
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(35, 35, 35, 0.95);
                        backdrop-filter: blur(10px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modal-content {
                        background: rgba(90, 90, 90, 0.1);
                        backdrop-filter: blur(50px);
                        -webkit-backdrop-filter: blur(50px);
                        border: 1px solid ${themeColor};
                        border-radius: 24px;
                        padding: 40px;
                        max-width: 500px;
                        width: 90%;
                        position: relative;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .modal-close {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 32px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                    }
                    .modal-close:hover {
                        color: #ffffff;
                    }
                    .modal-title {
                        color: #ffffff;
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .modal-subtitle {
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 14px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    .form-label {
                        display: block;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 500;
                        margin-bottom: 8px;
                    }
                    .form-input {
                        width: 100%;
                        padding: 12px 16px;
                        background: rgba(60, 60, 80, 0.5);
                        border: 1px solid ${themeColor};
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        outline: none;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                    }
                    .form-input:focus {
                        border-color: ${themeColor};
                        box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
                    }
                    .form-input::placeholder {
                        color: rgba(255, 255, 255, 0.4);
                    }
                    .phone-input-wrapper {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    .phone-prefix {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 16px;
                        background: rgba(70, 70, 90, 0.5);
                        border: 1px solid ${themeColor};
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        white-space: nowrap;
                    }
                    .flag-icon {
                        width: 24px;
                        height: 18px;
                        border-radius: 3px;
                    }
                    .phone-input {
                        flex: 1;
                    }
                    .password-input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .password-input-field {
                        padding-right: 50px !important;
                    }
                    .password-toggle-btn {
                        position: absolute;
                        right: 14px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                        z-index: 1;
                        width: 24px;
                        height: 24px;
                    }
                    .password-toggle-btn:hover {
                        color: rgba(255, 255, 255, 0.9);
                    }
                    .password-toggle-btn svg {
                        width: 20px;
                        height: 20px;
                    }
                    .error-message {
                        color: #ff6b6b;
                        font-size: 13px;
                        margin-top: 5px;
                        display: none;
                    }
                    .error-message.show {
                        display: block;
                    }
                    .modal-button {
                        width: 100%;
                        padding: 14px;
                        background: ${themeColor};
                        border: none;
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin-top: 10px;
                        box-shadow: 0 4px 12px ${themeColor}50;
                    }
                    .modal-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px ${themeColor}66;
                    }
                    .modal-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    .back-button {
                        background: transparent;
                        border: 1px solid ${themeColor};
                        margin-top: 10px;
                        box-shadow: none;
                    }
                    .back-button:hover {
                        background: rgba(60, 60, 80, 0.5);
                        transform: none;
                        box-shadow: none;
                    }
                </style>
            \`;
            document.body.appendChild(modal);
            
            // Clear autofill values
            setTimeout(() => {
                const phoneInput = document.getElementById('loginPhone');
                const passwordInput = document.getElementById('loginPassword');
                if (phoneInput) phoneInput.value = '';
                if (passwordInput) passwordInput.value = '';
            }, 10);
            
            // Format phone number input
            const phoneInput = document.getElementById('loginPhone');
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\\D/g, '');
                if (value.length > 0) {
                    if (value.length <= 2) {
                        value = value;
                    } else if (value.length <= 5) {
                        value = value.slice(0, 2) + ' ' + value.slice(2);
                    } else if (value.length <= 7) {
                        value = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5);
                    } else {
                        value = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 7) + ' ' + value.slice(7, 9);
                    }
                }
                e.target.value = value;
            });
        }

        function closeLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.remove();
            }
        }

        async function handleLogin() {
            const phone = document.getElementById('loginPhone').value.replace(/\\s/g, '');
            const password = document.getElementById('loginPassword').value.trim();
            const phoneError = document.getElementById('loginPhoneError');
            const passwordError = document.getElementById('loginPasswordError');
            
            let isValid = true;
            
            if (!phone || phone.length !== 9) {
                phoneError.textContent = 'To\\'g\\'ri telefon raqam kiriting (9 ta raqam)';
                phoneError.classList.add('show');
                isValid = false;
            } else {
                phoneError.classList.remove('show');
            }
            
            if (!password) {
                passwordError.textContent = 'Parolni kiriting';
                passwordError.classList.add('show');
                isValid = false;
            } else {
                passwordError.classList.remove('show');
            }
            
            if (!isValid) return;
            
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Kirilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/login\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + phone,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                console.log('🔐 Login response:', data);
                console.log('👤 User data:', data.user);
                
                if (data.success) {
                    const userDataToSave = {
                        _id: data.user.id || data.user._id,
                        phone: data.user.phone,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName
                    };
                    
                    console.log('💾 Saving to sessionStorage:', userDataToSave);
                    
                    sessionStorage.setItem('landingUser', JSON.stringify(userDataToSave));
                    
                    showToast('success', 'Muvaffaqiyatli kirdingiz!');
                    closeLoginModal();
                    
                    // Redirect to student dashboard (coming soon page)
                    setTimeout(() => {
                        const teacherId = sessionStorage.getItem('currentTeacherId');
                        if (teacherId) {
                            window.location.href = \`/teacher/\${teacherId}/student-dashboard\`;
                        } else {
                            window.location.href = '/student-dashboard.html';
                        }
                    }, 1500);
                } else {
                    showToast('error', data.message || 'Telefon yoki parol noto\\'g\\'ri');
                    button.disabled = false;
                    button.textContent = 'Kirish';
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('error', 'Kirishda xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Kirish';
            }
        }

        async function handleForgotPassword() {
            const phone = document.getElementById('loginPhone').value.replace(/\\s/g, '');
            const phoneError = document.getElementById('loginPhoneError');
            
            if (!phone || phone.length !== 9) {
                phoneError.textContent = 'Avval telefon raqamingizni kiriting';
                phoneError.classList.add('show');
                return;
            }
            
            phoneError.classList.remove('show');
            
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Yuborilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/send-reset-code\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + phone
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Always show toast with instructions
                    showToast('success', 'Telegram botga /login yozing va kontaktingizni yuboring', 8000);
                    
                    // Show bot info modal
                    const botUsername = 'darslinkerrr_bot';
                    showBotInfoModal(botUsername, null);
                    
                    // Close login modal and open reset password modal
                    closeLoginModal();
                    showResetPasswordModal(phone);
                } else {
                    showToast('error', data.message || 'Xatolik yuz berdi');
                    button.disabled = false;
                    button.textContent = 'Parolni unutdingizmi?';
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                showToast('error', 'Xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Parolni unutdingizmi?';
            }
        }

        function showResetPasswordModal(phone) {
            const modal = document.createElement('div');
            modal.id = 'resetPasswordModal';
            modal.innerHTML = \`
                <div class="modal-overlay" onclick="closeResetPasswordModal()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="closeResetPasswordModal()">&times;</button>
                        <div id="resetPasswordBody">
                            <h2 class="modal-title">Parolni tiklash</h2>
                            <p class="modal-subtitle">Telegram botdan kelgan kodni kiriting</p>
                            
                            <div class="form-group">
                                <label class="form-label">Tasdiqlash kodi</label>
                                <input type="text" id="resetCode" class="form-input" placeholder="123456" maxlength="6" style="text-align: center; font-size: 24px; letter-spacing: 8px;" />
                                <div class="error-message" id="resetCodeError"></div>
                            </div>
                            
                            <button class="modal-button" onclick="verifyResetCode('\${phone}')">Tasdiqlash</button>
                        </div>
                    </div>
                </div>
                <style>
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(35, 35, 35, 0.95);
                        backdrop-filter: blur(10px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    }
                    .modal-content {
                        background: rgba(90, 90, 90, 0.1);
                        backdrop-filter: blur(50px);
                        -webkit-backdrop-filter: blur(50px);
                        border: 1px solid ${themeColor};
                        border-radius: 24px;
                        padding: 40px;
                        max-width: 500px;
                        width: 90%;
                        position: relative;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
                        animation: slideUp 0.3s ease;
                    }
                    .modal-close {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 32px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                    }
                    .modal-close:hover {
                        color: #ffffff;
                    }
                    .modal-title {
                        color: #ffffff;
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .modal-subtitle {
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 14px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    .form-label {
                        display: block;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 500;
                        margin-bottom: 8px;
                    }
                    .form-input {
                        width: 100%;
                        padding: 12px 16px;
                        background: rgba(60, 60, 80, 0.5);
                        border: 1px solid ${themeColor};
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        outline: none;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                    }
                    .form-input:focus {
                        border-color: ${themeColor};
                        box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
                    }
                    .password-input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .password-input-field {
                        padding-right: 50px !important;
                    }
                    .password-toggle-btn {
                        position: absolute;
                        right: 14px;
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.3s ease;
                        z-index: 1;
                        width: 24px;
                        height: 24px;
                    }
                    .password-toggle-btn:hover {
                        color: rgba(255, 255, 255, 0.9);
                    }
                    .error-message {
                        color: #ff6b6b;
                        font-size: 13px;
                        margin-top: 5px;
                        display: none;
                    }
                    .error-message.show {
                        display: block;
                    }
                    .modal-button {
                        width: 100%;
                        padding: 14px;
                        background: ${themeColor};
                        border: none;
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin-top: 10px;
                        box-shadow: 0 4px 12px ${themeColor}50;
                    }
                    .modal-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px ${themeColor}66;
                    }
                    .modal-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                </style>
            \`;
            document.body.appendChild(modal);
            
            // Only numbers for reset code
            const codeInput = document.getElementById('resetCode');
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\\D/g, '');
            });
            codeInput.focus();
        }

        function closeResetPasswordModal() {
            const modal = document.getElementById('resetPasswordModal');
            if (modal) {
                modal.remove();
            }
        }

        async function verifyResetCode(phone) {
            const code = document.getElementById('resetCode').value.trim();
            const codeError = document.getElementById('resetCodeError');
            
            if (!code || code.length !== 6) {
                codeError.textContent = '6 raqamli kodni kiriting';
                codeError.classList.add('show');
                return;
            }
            
            codeError.classList.remove('show');
            
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Tekshirilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/verify-reset-code\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + phone,
                        code: code
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show new password form
                    showNewPasswordForm(phone, code);
                } else {
                    showToast('error', data.message || 'Noto\\'g\\'ri kod');
                    button.disabled = false;
                    button.textContent = 'Tasdiqlash';
                }
            } catch (error) {
                console.error('Verify reset code error:', error);
                showToast('error', 'Xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Tasdiqlash';
            }
        }

        function showNewPasswordForm(phone, code) {
            const resetPasswordBody = document.getElementById('resetPasswordBody');
            resetPasswordBody.innerHTML = \`
                <h2 class="modal-title">Yangi parol</h2>
                <p class="modal-subtitle">Yangi parolingizni kiriting</p>
                
                <div class="form-group">
                    <label class="form-label">Yangi parol</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="newPassword" class="form-input password-input-field" placeholder="Kamida 6 ta belgi" />
                        <button type="button" class="password-toggle-btn" onclick="togglePassword('newPassword', 'newPasswordToggle')">
                            <svg id="newPasswordToggle" class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                    </div>
                    <div class="error-message" id="newPasswordError"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Yangi parolni tasdiqlang</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="confirmNewPassword" class="form-input password-input-field" placeholder="Parolni qayta kiriting" />
                        <button type="button" class="password-toggle-btn" onclick="togglePassword('confirmNewPassword', 'confirmNewPasswordToggle')">
                            <svg id="confirmNewPasswordToggle" class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                    </div>
                    <div class="error-message" id="confirmNewPasswordError"></div>
                </div>
                
                <button class="modal-button" onclick="resetPassword('\${phone}', '\${code}')">Parolni o'zgartirish</button>
            \`;
        }

        async function resetPassword(phone, code) {
            const newPassword = document.getElementById('newPassword').value.trim();
            const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();
            const newPasswordError = document.getElementById('newPasswordError');
            const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');
            
            let isValid = true;
            
            if (!newPassword || newPassword.length < 6) {
                newPasswordError.textContent = 'Parol kamida 6 ta belgidan iborat bo\\'lishi kerak';
                newPasswordError.classList.add('show');
                isValid = false;
            } else {
                newPasswordError.classList.remove('show');
            }
            
            if (!confirmNewPassword) {
                confirmNewPasswordError.textContent = 'Parolni tasdiqlang';
                confirmNewPasswordError.classList.add('show');
                isValid = false;
            } else if (newPassword !== confirmNewPassword) {
                confirmNewPasswordError.textContent = 'Parollar mos kelmaydi';
                confirmNewPasswordError.classList.add('show');
                isValid = false;
            } else {
                confirmNewPasswordError.classList.remove('show');
            }
            
            if (!isValid) return;
            
            const button = event.target;
            button.disabled = true;
            button.textContent = 'O\\'zgartrilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/reset-password\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + phone,
                        code: code,
                        newPassword: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast('success', 'Parol muvaffaqiyatli o\\'zgartirildi!');
                    closeResetPasswordModal();
                    
                    // Open login modal after 1 second
                    setTimeout(() => {
                        openLoginModal({ preventDefault: () => {} });
                    }, 1000);
                } else {
                    showToast('error', data.message || 'Xatolik yuz berdi');
                    button.disabled = false;
                    button.textContent = 'Parolni o\\'zgartirish';
                }
            } catch (error) {
                console.error('Reset password error:', error);
                showToast('error', 'Xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Parolni o\\'zgartirish';
            }
        }

        function renderStep(step) {
            currentStep = step;
            const modalBody = document.getElementById('modalBody');
            
            if (step === 1) {
                modalBody.innerHTML = \`
                    <h2 class="modal-title">Ro'yxatdan o'tish</h2>
                    <p class="modal-subtitle">Ism va familiyangizni kiriting</p>
                    <div class="step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ism</label>
                        <input type="text" id="firstName" class="form-input" placeholder="Ismingiz" value="\${registrationData.firstName}" />
                        <div class="error-message" id="firstNameError"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Familiya</label>
                        <input type="text" id="lastName" class="form-input" placeholder="Familiyangiz" value="\${registrationData.lastName}" />
                        <div class="error-message" id="lastNameError"></div>
                    </div>
                    <button class="modal-button" onclick="validateStep1()">Keyingisi</button>
                \`;
                
                // Add input validation - only letters
                const firstNameInput = document.getElementById('firstName');
                const lastNameInput = document.getElementById('lastName');
                
                firstNameInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Zа-яА-ЯўғҳқўҒҲҚЎ\\s]/g, '');
                });
                
                lastNameInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Zа-яА-ЯўғҳқўҒҲҚЎ\\s]/g, '');
                });
                
            } else if (step === 2) {
                modalBody.innerHTML = \`
                    <h2 class="modal-title">Telefon raqamingiz</h2>
                    <p class="modal-subtitle">O'zbekiston raqamingizni kiriting</p>
                    <div class="step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon raqam</label>
                        <div class="phone-input-wrapper">
                            <div class="phone-prefix">
                                <img src="/images/uz-flag.jpg" alt="UZ" class="flag-icon" />
                                <span>+998</span>
                            </div>
                            <input type="tel" id="phone" class="form-input phone-input" placeholder="90 123 45 67" value="\${registrationData.phone}" maxlength="12" />
                        </div>
                        <div class="error-message" id="phoneError"></div>
                    </div>
                    <button class="modal-button" onclick="validateStep2()">Keyingisi</button>
                    <button class="modal-button back-button" onclick="renderStep(1)">Orqaga</button>
                \`;
                
                // Format phone number input
                const phoneInput = document.getElementById('phone');
                phoneInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\\D/g, '');
                    if (value.length > 0) {
                        if (value.length <= 2) {
                            value = value;
                        } else if (value.length <= 5) {
                            value = value.slice(0, 2) + ' ' + value.slice(2);
                        } else if (value.length <= 7) {
                            value = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5);
                        } else {
                            value = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 7) + ' ' + value.slice(7, 9);
                        }
                    }
                    e.target.value = value;
                });
                
            } else if (step === 3) {
                modalBody.innerHTML = \`
                    <h2 class="modal-title">Parol yarating</h2>
                    <p class="modal-subtitle">Hisobingiz uchun xavfsiz parol yarating</p>
                    <div class="step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Parol</label>
                        <div class="password-input-wrapper">
                            <input type="password" id="password" class="form-input password-input-field" placeholder="Kamida 6 ta belgi" value="\${registrationData.password || ''}" />
                            <button type="button" class="password-toggle-btn" onclick="togglePassword('password', 'passwordToggle')">
                                <svg id="passwordToggle" class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                            </button>
                        </div>
                        <div class="error-message" id="passwordError"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Parolni tasdiqlang</label>
                        <div class="password-input-wrapper">
                            <input type="password" id="confirmPassword" class="form-input password-input-field" placeholder="Parolni qayta kiriting" value="\${registrationData.confirmPassword || ''}" />
                            <button type="button" class="password-toggle-btn" onclick="togglePassword('confirmPassword', 'confirmPasswordToggle')">
                                <svg id="confirmPasswordToggle" class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                            </button>
                        </div>
                        <div class="error-message" id="confirmPasswordError"></div>
                    </div>
                    <button class="modal-button" onclick="validateStep3()">Kod yuborish</button>
                    <button class="modal-button back-button" onclick="renderStep(2)">Orqaga</button>
                \`;
                
            } else if (step === 4) {
                modalBody.innerHTML = \`
                    <h2 class="modal-title">Tasdiqlash kodi</h2>
                    <p class="modal-subtitle">Telegram botdan kelgan kodni kiriting</p>
                    <div class="step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tasdiqlash kodi</label>
                        <input type="text" id="verificationCode" class="form-input" placeholder="123456" maxlength="6" style="text-align: center; font-size: 24px; letter-spacing: 8px;" />
                        <div class="error-message" id="codeError"></div>
                    </div>
                    <button class="modal-button" onclick="validateStep4()">Tasdiqlash</button>
                    <button class="modal-button back-button" onclick="renderStep(3)">Orqaga</button>
                \`;
                
                // Only numbers for verification code
                const codeInput = document.getElementById('verificationCode');
                codeInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\\D/g, '');
                });
                codeInput.focus();
            }
        }
        
        window.togglePassword = function(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = \`
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
                \`;
            } else {
                input.type = 'password';
                icon.innerHTML = \`
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                \`;
            }
        }

        function showBotInfoModal(botUsername, code) {
            const infoModal = document.createElement('div');
            infoModal.className = 'bot-info-overlay';
            infoModal.innerHTML = \`
                <div class="bot-info-modal">
                    <div class="bot-info-header">
                        <div class="bot-info-icon">📱</div>
                        <h3>Telegram Botga O'ting</h3>
                    </div>
                    <div class="bot-info-content">
                        <p class="bot-info-text">Tasdiqlash kodi <strong>@\${botUsername}</strong> botga yuborildi</p>
                        <div class="bot-info-steps">
                            <div class="bot-step">
                                <span class="step-number">1</span>
                                <span class="step-text">Botga /start bosing</span>
                            </div>
                            <div class="bot-step">
                                <span class="step-number">2</span>
                                <span class="step-text">Telefon raqamingizni yuboring</span>
                            </div>
                            <div class="bot-step">
                                <span class="step-number">3</span>
                                <span class="step-text">Tasdiqlash kodini oling</span>
                            </div>
                        </div>
                    </div>
                    <button class="bot-info-close" onclick="closeBotInfoModal()">Kod olish</button>
                </div>
                <style>
                    .bot-info-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(35, 35, 35, 0.95);
                        backdrop-filter: blur(10px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 20000;
                        animation: fadeIn 0.3s ease;
                    }
                    .bot-info-modal {
                        background: rgba(90, 90, 90, 0.1);
                        backdrop-filter: blur(50px);
                        -webkit-backdrop-filter: blur(50px);
                        border: 1px solid ${themeColor};
                        border-radius: 24px;
                        padding: 35px;
                        max-width: 450px;
                        width: 90%;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
                        animation: slideUp 0.4s ease;
                    }
                    .bot-info-header {
                        text-align: center;
                        margin-bottom: 25px;
                    }
                    .bot-info-icon {
                        font-size: 48px;
                        margin-bottom: 15px;
                        animation: bounce 1s ease infinite;
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    .bot-info-header h3 {
                        color: #ffffff;
                        font-size: 22px;
                        font-weight: 700;
                        margin: 0;
                    }
                    .bot-info-content {
                        margin-bottom: 25px;
                    }
                    .bot-info-text {
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 15px;
                        text-align: center;
                        margin-bottom: 25px;
                        line-height: 1.6;
                    }
                    .bot-info-text strong {
                        color: ${themeColor};
                        font-weight: 600;
                    }
                    .bot-info-steps {
                        background: rgba(60, 60, 80, 0.5);
                        border: 1px solid ${themeColor};
                        border-radius: 12px;
                        padding: 20px;
                    }
                    .bot-step {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 15px;
                        color: #ffffff;
                    }
                    .bot-step:last-child {
                        margin-bottom: 0;
                    }
                    .step-number {
                        width: 32px;
                        height: 32px;
                        background: ${themeColor};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 14px;
                        flex-shrink: 0;
                    }
                    .step-text {
                        font-size: 14px;
                        font-weight: 500;
                    }
                    .bot-info-close {
                        width: 100%;
                        padding: 14px;
                        background: ${themeColor};
                        border: none;
                        border-radius: 25px;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px ${themeColor}50;
                    }
                    .bot-info-close:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px ${themeColor}66;
                    }
                </style>
            \`;
            document.body.appendChild(infoModal);
        }

        function closeBotInfoModal() {
            const modal = document.querySelector('.bot-info-overlay');
            if (modal) {
                modal.remove();
                // Redirect to Telegram bot
                const botUsername = 'darslinkerrr_bot';
                window.open(\`https://t.me/\${botUsername}\`, '_blank');
            }
        }

        function validateStep1() {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const firstNameError = document.getElementById('firstNameError');
            const lastNameError = document.getElementById('lastNameError');
            
            let isValid = true;
            
            if (!firstName || firstName.length < 2) {
                firstNameError.textContent = 'Ism kamida 2 ta harfdan iborat bo\\'lishi kerak';
                firstNameError.classList.add('show');
                isValid = false;
            } else {
                firstNameError.classList.remove('show');
            }
            
            if (!lastName || lastName.length < 2) {
                lastNameError.textContent = 'Familiya kamida 2 ta harfdan iborat bo\\'lishi kerak';
                lastNameError.classList.add('show');
                isValid = false;
            } else {
                lastNameError.classList.remove('show');
            }
            
            if (isValid) {
                registrationData.firstName = firstName;
                registrationData.lastName = lastName;
                renderStep(2);
            }
        }

        function validateStep2() {
            const phone = document.getElementById('phone').value.replace(/\\s/g, '');
            const phoneError = document.getElementById('phoneError');
            
            if (!phone || phone.length !== 9) {
                phoneError.textContent = 'To\\'g\\'ri telefon raqam kiriting (9 ta raqam)';
                phoneError.classList.add('show');
                return;
            }
            
            phoneError.classList.remove('show');
            registrationData.phone = phone;
            renderStep(3);
        }

        async function sendVerificationCode() {
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Yuborilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/send-verification\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + registrationData.phone,
                        firstName: registrationData.firstName,
                        lastName: registrationData.lastName,
                        teacherId: registrationData.teacherId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const botUsername = data.data.telegramBot;
                    const code = data.data.code; // Only in development
                    
                    // Show beautiful info modal
                    showBotInfoModal(botUsername, code);
                    
                    // Open Telegram bot in new tab after 8 seconds (give time to read modal)
                    setTimeout(() => {
                        window.open(\`https://t.me/\${botUsername}\`, '_blank');
                    }, 8000);
                    
                    renderStep(4);
                } else {
                    showToast('error', data.message || 'Kod yuborishda xatolik');
                    button.disabled = false;
                    button.textContent = 'Kod yuborish';
                }
            } catch (error) {
                console.error('Error sending verification code:', error);
                showToast('error', 'Kod yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Kod yuborish';
            }
        }

        async function resendCode() {
            await sendVerificationCode();
        }

        function validateStep3() {
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const passwordError = document.getElementById('passwordError');
            const confirmPasswordError = document.getElementById('confirmPasswordError');
            
            let isValid = true;
            
            if (!password || password.length < 6) {
                passwordError.textContent = 'Parol kamida 6 ta belgidan iborat bo\\'lishi kerak';
                passwordError.classList.add('show');
                isValid = false;
            } else {
                passwordError.classList.remove('show');
            }
            
            if (!confirmPassword) {
                confirmPasswordError.textContent = 'Parolni tasdiqlang';
                confirmPasswordError.classList.add('show');
                isValid = false;
            } else if (password !== confirmPassword) {
                confirmPasswordError.textContent = 'Parollar mos kelmaydi';
                confirmPasswordError.classList.add('show');
                isValid = false;
            } else {
                confirmPasswordError.classList.remove('show');
            }
            
            if (isValid) {
                registrationData.password = password;
                registrationData.confirmPassword = confirmPassword;
                sendVerificationCode();
            }
        }

        async function validateStep4() {
            const code = document.getElementById('verificationCode').value.trim();
            const codeError = document.getElementById('codeError');
            
            if (!code || code.length !== 6) {
                codeError.textContent = '6 raqamli kodni kiriting';
                codeError.classList.add('show');
                return;
            }
            
            codeError.classList.remove('show');
            registrationData.verificationCode = code;
            
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Tekshirilmoqda...';
            
            try {
                const apiBaseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8001/api' 
                    : 'https://darslinker-backend.onrender.com/api';
                console.log('🔍 Registration data being sent:', {
                    phone: '+998' + registrationData.phone,
                    firstName: registrationData.firstName,
                    lastName: registrationData.lastName,
                    teacherId: registrationData.teacherId
                });
                
                const response = await fetch(\`\${apiBaseUrl}/landing-auth/verify-and-register\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '+998' + registrationData.phone,
                        firstName: registrationData.firstName,
                        lastName: registrationData.lastName,
                        password: registrationData.password,
                        verificationCode: code,
                        teacherId: registrationData.teacherId
                    })
                });
                
                const data = await response.json();
                
                console.log('📝 Registration response:', data);
                console.log('👤 User data:', data.user);
                
                if (data.success) {
                    // DON'T save to localStorage - landing registration should not affect main dashboard
                    // Save to temporary sessionStorage only for coming soon page
                    const userDataToSave = {
                        _id: data.user._id,
                        phone: data.user.phone,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName
                    };
                    
                    console.log('💾 Saving to sessionStorage:', userDataToSave);
                    
                    sessionStorage.setItem('landingUser', JSON.stringify(userDataToSave));
                    
                    showToast('success', 'Muvaffaqiyatli ro\\'yxatdan o\\'tdingiz!');
                    closeRegistrationModal();
                    
                    // Redirect to student dashboard (coming soon page)
                    setTimeout(() => {
                        const teacherId = sessionStorage.getItem('currentTeacherId');
                        if (teacherId) {
                            window.location.href = \`/teacher/\${teacherId}/student-dashboard\`;
                        } else {
                            window.location.href = '/student-dashboard';
                        }
                    }, 1500);
                } else {
                    codeError.textContent = data.message || 'Noto\\'g\\'ri kod';
                    codeError.classList.add('show');
                    button.disabled = false;
                    button.textContent = 'Tasdiqlash';
                }
            } catch (error) {
                console.error('Error verifying code:', error);
                showToast('error', 'Tasdiqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\\'ring.');
                button.disabled = false;
                button.textContent = 'Tasdiqlash';
            }
        }

        // Toast notification function
        function showToast(type, message, duration = 5000) {
            const toast = document.createElement('div');
            toast.className = \`landing-toast landing-toast-\${type}\`;
            toast.innerHTML = \`
                <div class="toast-icon">\${type === 'success' ? '✓' : '✕'}</div>
                <div class="toast-message">\${message}</div>
            \`;
            
            const style = document.createElement('style');
            style.textContent = \`
                .landing-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 30000;
                    animation: slideInRight 0.3s ease;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                }
                .landing-toast-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }
                .landing-toast-error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }
                .toast-icon {
                    width: 24px;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                .toast-message {
                    font-size: 14px;
                    line-height: 1.5;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            \`;
            
            document.head.appendChild(style);
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                    if (style.parentNode) {
                        style.parentNode.removeChild(style);
                    }
                }, 300);
            }, duration);
        }

        // Smooth scroll to section and update active nav link
        window.scrollToSection = function(e, sectionId) {
            e.preventDefault();
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to clicked link
            e.target.classList.add('active');
            
            // Scroll to section
            const section = document.getElementById(sectionId);
            if (section) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const sectionTop = section.offsetTop - headerHeight;
                window.scrollTo({
                    top: sectionTop,
                    behavior: 'smooth'
                });
            }
        };

        // Toggle language dropdown
        window.toggleLangDropdown = function(e) {
            e.stopPropagation();
            const selector = document.querySelector('.language-selector');
            selector.classList.toggle('open');
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const selector = document.querySelector('.language-selector');
            if (selector && !selector.contains(e.target)) {
                selector.classList.remove('open');
            }
        });

        // Change landing page language
        window.changeLandingLanguage = function(e, lang, flagSrc, langText) {
            e.stopPropagation();
            
            // Update current language display
            document.getElementById('currentLangFlag').src = flagSrc;
            document.getElementById('currentLangText').textContent = langText;
            
            // Remove active class from all options
            document.querySelectorAll('.lang-option').forEach(option => {
                option.classList.remove('active');
            });
            
            // Add active class to selected option
            e.currentTarget.classList.add('active');
            
            // Close dropdown
            document.querySelector('.language-selector').classList.remove('open');
            
            // Store language preference
            localStorage.setItem('landingLanguage', lang);
            
            // TODO: Implement actual translation logic here
            console.log('Language changed to:', lang);
        };

        // Translation system - SIMPLE VERSION
        const translations = ${JSON.stringify(translations)};
        let currentLang = localStorage.getItem('landingPageLang') || 'uz';

        window.selectLanguage = function(event, lang) {
            event.stopPropagation();
            
            console.log('🌐 Selected language:', lang);
            console.log('📚 Available translations:', Object.keys(translations));
            
            currentLang = lang;
            localStorage.setItem('landingPageLang', lang);
            
            // Update texts
            const elements = document.querySelectorAll('[data-i18n]');
            console.log('📝 Elements to translate:', elements.length);
            
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const oldText = el.textContent;
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                    console.log(\`✅ \${key}: "\${oldText}" -> "\${translations[lang][key]}"\`);
                } else {
                    console.log(\`❌ Missing translation for "\${key}" in "\${lang}"\`);
                }
            });
            
            // Update flag
            const flags = { uz: '/images/uz-flag.jpg', ru: '/images/ru-flag.jpg', en: '/images/us-flag.png' };
            const names = { uz: 'UZ', ru: 'RU', en: 'EN' };
            
            document.getElementById('currentLangFlag').src = flags[lang];
            document.getElementById('currentLangText').textContent = names[lang];
            
            // Update active
            document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
            document.querySelector(\`.lang-option[data-lang="\${lang}"]\`).classList.add('active');
            
            // Close dropdown
            document.querySelector('.language-selector').classList.remove('open');
        };

        // Init on load
        setTimeout(() => window.selectLanguage({ stopPropagation: () => {} }, currentLang), 300);

        // Make functions globally available
        window.selectLanguage = selectLanguage;
        window.changeLandingLanguage = changeLandingLanguage;
        window.openRegistrationModal = openRegistrationModal;
        window.closeRegistrationModal = closeRegistrationModal;
        window.openLoginModal = openLoginModal;
        window.closeLoginModal = closeLoginModal;
        window.handleLogin = handleLogin;
        window.handleForgotPassword = handleForgotPassword;
        window.showResetPasswordModal = showResetPasswordModal;
        window.closeResetPasswordModal = closeResetPasswordModal;
        window.verifyResetCode = verifyResetCode;
        window.resetPassword = resetPassword;
        window.closeBotInfoModal = closeBotInfoModal;
        window.renderStep = renderStep;
        window.validateStep1 = validateStep1;
        window.validateStep2 = validateStep2;
        window.validateStep3 = validateStep3;
        window.resendCode = resendCode;
        window.showToast = showToast;
        
        // Auto-open modal if redirected from course detail page
        window.addEventListener('load', function() {
            const openLogin = sessionStorage.getItem('openLoginModal');
            const openRegister = sessionStorage.getItem('openRegisterModal');
            
            if (openLogin === 'true') {
                sessionStorage.removeItem('openLoginModal');
                setTimeout(() => {
                    const loginBtn = document.querySelector('[onclick*="openLoginModal"]');
                    if (loginBtn) loginBtn.click();
                }, 500);
            } else if (openRegister === 'true') {
                sessionStorage.removeItem('openRegisterModal');
                setTimeout(() => {
                    const registerBtn = document.querySelector('[onclick*="openRegistrationModal"]');
                    if (registerBtn) registerBtn.click();
                }, 500);
            }
        });
    </script>
</body>
</html>
  `;
}

// Helper function to update page title
function updatePageTitle(title) {
  const titleElement = document.querySelector('.figma-title h2');
  if (titleElement) {
    titleElement.textContent = title;
  }
}

// Removed problematic loadMainDashboard function and CSS content - see correct implementation below

// Reload dashboard to show updated data
function reloadDashboard() {
  // Save current user data before reload
  const currentUser = store.getState().user;
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('💾 User data saved before reload:', currentUser);
  }
  
  // Reload dashboard to show updated data
  location.reload();
}

// Load main dashboard content (without reloading entire page)
function loadMainDashboard() {
  // This function should contain the main dashboard loading logic
  console.log('Loading main dashboard...');
}

// Additional dashboard functions can be added here

// Helper function to update active menu item
function updateActiveMenuItem(itemName) {
  document.querySelectorAll('.figma-menu-child').forEach(child => {
    child.classList.remove('active');
    if (child.textContent.trim() === itemName) {
      child.classList.add('active');
    }
  });
}

// Open Sub Admin Page
window.openSubAdmin = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('subAdmin.title'));
    contentArea.innerHTML = getSubAdminHTML();
    updateActiveMenuItem('Sub Admin');
    
    // Apply saved primary color to Sub Admin page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    return;
  }
};

// Helper function to get sub admin HTML
function getSubAdminHTML() {
  return `
    <div class="sub-admin-page">
      <style>
        .sub-admin-page {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .sub-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          color: rgba(156, 163, 175, 1);
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .search-admin {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .search-admin:focus {
          outline: none;
          border-color: var(--primary-border-hover);
          background: rgba(58, 56, 56, 0.5);
        }
        .search-admin:focus + .search-icon,
        .search-wrapper:hover .search-icon {
          color: var(--primary-color);
        }
        .add-admin-btn {
          padding: 12px 24px;
          background: var(--primary-light);
          border: 1px solid var(--primary-border-hover);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .add-admin-btn:hover {
          background: var(--border-color);
          border-color: var(--primary-border-strong);
          transform: translateY(-2px);
        }
        .admin-card {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-card:hover {
          border-color: var(--primary-border-hover);
          background: rgba(58, 56, 56, 0.5);
          transform: translateX(4px);
        }
        .admin-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .admin-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 18px;
        }
        .admin-details h4 {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .admin-details p {
          color: rgba(156, 163, 175, 1);
          font-size: 13px;
        }
        .admin-meta {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .meta-label {
          color: rgba(156, 163, 175, 1);
          font-size: 11px;
        }
        .meta-value {
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
        }
        .delete-admin-btn {
          width: 36px;
          height: 36px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 24px;
        }
        .delete-admin-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          transform: scale(1.1);
        }
        .add-admin-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: fadeIn 0.3s ease;
        }
        .add-admin-modal.hidden {
          display: none;
        }
        .modal-content {
          background: rgba(35, 35, 35, 0.95);
          border: 1px solid rgba(126, 162, 212, 0.3);
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.3s ease;
          position: relative;
          z-index: 100000;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-title {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }
        .close-modal-btn {
          background: none;
          border: none;
          color: rgba(156, 163, 175, 1);
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .close-modal-btn:hover {
          color: #ffffff;
          transform: rotate(90deg);
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          color: rgba(156, 163, 175, 1);
          font-size: 13px;
          margin-bottom: 8px;
          display: block;
        }
        .form-input-admin {
          width: 100%;
          padding: 12px 16px;
          background: rgba(58, 56, 56, 0.5);
          border: 1px solid rgba(126, 162, 212, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .form-input-admin:focus {
          outline: none;
          border-color: rgba(126, 162, 212, 0.5);
          background: rgba(58, 56, 56, 0.7);
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .btn-cancel {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(126, 162, 212, 0.3);
          border-radius: 8px;
          color: rgba(126, 162, 212, 1);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-cancel:hover {
          background: rgba(126, 162, 212, 0.1);
        }
        .btn-submit {
          padding: 10px 20px;
          background: rgba(126, 162, 212, 0.3);
          border: 1px solid rgba(126, 162, 212, 0.5);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-submit:hover {
          background: rgba(126, 162, 212, 0.4);
          transform: translateY(-2px);
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      </style>

      <!-- Header with Search and Add Button -->
      <div class="sub-admin-header">
        <div class="search-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" class="search-admin" placeholder="Search sub admins..." oninput="searchSubAdmins(this.value)">
        </div>
        <button class="add-admin-btn" onclick="openAddAdminModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add Subadmin
        </button>
      </div>

      <!-- Admin Cards List -->
      <div class="admin-cards-list" id="adminCardsList">
        <div class="admin-card">
          <div class="admin-info">
            <div class="admin-avatar">JD</div>
            <div class="admin-details">
              <h4>John Derting</h4>
              <p>john.derting@darslinker.com</p>
            </div>
          </div>
          <div class="admin-meta">
            <div class="meta-item">
              <span class="meta-label">Telephone</span>
              <span class="meta-value">+1 (555) 123-4567</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Added</span>
              <span class="meta-value">2025-01-15</span>
            </div>
          </div>
          <button class="delete-admin-btn" onclick="deleteSubAdmin(this, 'John Derting')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>

        <div class="admin-card">
          <div class="admin-info">
            <div class="admin-avatar">SK</div>
            <div class="admin-details">
              <h4>Sarah Kim</h4>
              <p>sarah.kim@darslinker.com</p>
            </div>
          </div>
          <div class="admin-meta">
            <div class="meta-item">
              <span class="meta-label">Telephone</span>
              <span class="meta-value">+1 (555) 987-6543</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Added</span>
              <span class="meta-value">2025-01-10</span>
            </div>
          </div>
          <button class="delete-admin-btn" onclick="deleteSubAdmin(this, 'Sarah Kim')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>

        <div class="admin-card">
          <div class="admin-info">
            <div class="admin-avatar">ML</div>
            <div class="admin-details">
              <h4>Mike Lee</h4>
              <p>mike.lee@darslinker.com</p>
            </div>
          </div>
          <div class="admin-meta">
            <div class="meta-item">
              <span class="meta-label">Telephone</span>
              <span class="meta-value">+1 (555) 456-7890</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Added</span>
              <span class="meta-value">2025-01-05</span>
            </div>
          </div>
          <button class="delete-admin-btn" onclick="deleteSubAdmin(this, 'Mike Lee')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Add Admin Modal -->
      <div class="add-admin-modal hidden" id="addAdminModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Add New Sub Admin</h3>
            <button class="close-modal-btn" onclick="closeAddAdminModal()">×</button>
          </div>
          
          <form onsubmit="submitNewAdmin(event)">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input-admin" id="adminName" placeholder="Enter full name" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input-admin" id="adminEmail" placeholder="admin@darslinker.com" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Telephone</label>
              <input type="tel" class="form-input-admin" id="adminPhone" placeholder="+1 (555) 000-0000" required>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-cancel" onclick="closeAddAdminModal()">Cancel</button>
              <button type="submit" class="btn-submit">Add Admin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Open add admin modal
window.openAddAdminModal = function() {
  const modal = document.getElementById('addAdminModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
};

// Close add admin modal
window.closeAddAdminModal = function() {
  const modal = document.getElementById('addAdminModal');
  if (modal) {
    modal.classList.add('hidden');
    // Reset form
    document.getElementById('adminName').value = '';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPhone').value = '';
  }
};

// Submit new admin
window.submitNewAdmin = function(event) {
  event.preventDefault();
  
  const name = document.getElementById('adminName').value;
  const email = document.getElementById('adminEmail').value;
  const phone = document.getElementById('adminPhone').value;
  
  // Get initials
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Create new admin card
  const newAdminHTML = `
    <div class="admin-card" style="animation: slideIn 0.5s ease;">
      <div class="admin-info">
        <div class="admin-avatar">${initials}</div>
        <div class="admin-details">
          <h4>${name}</h4>
          <p>${email}</p>
        </div>
      </div>
      <div class="admin-meta">
        <div class="meta-item">
          <span class="meta-label">Telephone</span>
          <span class="meta-value">${phone}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Added</span>
          <span class="meta-value">${today}</span>
        </div>
      </div>
      <button class="delete-admin-btn" onclick="deleteSubAdmin(this, '${name}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    </div>
  `;
  
  // Add to list
  const list = document.getElementById('adminCardsList');
  list.insertAdjacentHTML('beforeend', newAdminHTML);
  
  // Update count in title
  const count = list.querySelectorAll('.admin-card').length;
  updatePageTitle(t('subAdmin.titleWithCount').replace('{count}', count));
  
  // Close modal
  closeAddAdminModal();
};

// Delete sub admin
window.deleteSubAdmin = function(button, name) {
  // Create custom confirmation modal
  const modal = document.createElement('div');
  modal.className = 'delete-confirm-modal';
  modal.innerHTML = `
    <div class="delete-confirm-overlay"></div>
    <div class="delete-confirm-content">
      <div class="delete-confirm-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="delete-confirm-title">Remove Sub Admin?</h3>
      <p class="delete-confirm-message">Are you sure you want to remove <strong>${name}</strong> as sub admin? This action cannot be undone.</p>
      <div class="delete-confirm-actions">
        <button class="delete-confirm-cancel" onclick="closeDeleteConfirm()">Cancel</button>
        <button class="delete-confirm-delete" onclick="confirmDeleteSubAdmin(this)">Remove</button>
      </div>
    </div>
    <style>
      .delete-confirm-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }
      .delete-confirm-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }
      .delete-confirm-content {
        position: relative;
        background: rgba(30, 30, 30, 0.98);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 16px;
        padding: 32px;
        max-width: 420px;
        width: 90%;
        text-align: center;
        animation: slideUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      .delete-confirm-icon {
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
      }
      .delete-confirm-icon svg {
        animation: scaleIn 0.4s ease;
      }
      .delete-confirm-title {
        color: #ffffff;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      .delete-confirm-message {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 28px;
      }
      .delete-confirm-message strong {
        color: #ffffff;
        font-weight: 600;
      }
      .delete-confirm-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .delete-confirm-cancel,
      .delete-confirm-delete {
        padding: 12px 28px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }
      .delete-confirm-cancel {
        background: rgba(58, 56, 56, 0.5);
        border: 1px solid rgba(126, 162, 212, 0.3);
        color: rgba(126, 162, 212, 1);
      }
      .delete-confirm-cancel:hover {
        background: rgba(126, 162, 212, 0.1);
        border-color: rgba(126, 162, 212, 0.5);
        transform: translateY(-2px);
      }
      .delete-confirm-delete {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #ef4444;
      }
      .delete-confirm-delete:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.7);
        transform: translateY(-2px);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { 
          transform: translateY(30px);
          opacity: 0;
        }
        to { 
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from { 
          transform: scale(0.5);
          opacity: 0;
        }
        to { 
          transform: scale(1);
          opacity: 1;
        }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  // Store button reference for later use
  modal.dataset.buttonRef = button.closest('.admin-card').outerHTML;
  modal.dataset.cardElement = Array.from(document.querySelectorAll('.admin-card')).indexOf(button.closest('.admin-card'));
};

// Close delete confirmation modal
window.closeDeleteConfirm = function() {
  const modal = document.querySelector('.delete-confirm-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => modal.remove(), 200);
  }
};

// Confirm delete sub admin
window.confirmDeleteSubAdmin = function(confirmButton) {
  const modal = confirmButton.closest('.delete-confirm-modal');
  const cardIndex = parseInt(modal.dataset.cardElement);
  const cards = document.querySelectorAll('.admin-card');
  const card = cards[cardIndex];
  
  if (card) {
    card.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      card.remove();
      
      // Update count
      const list = document.getElementById('adminCardsList');
      const count = list.querySelectorAll('.admin-card').length;
      updatePageTitle(t('subAdmin.titleWithCount').replace('{count}', count));
      
      // Close modal
      closeDeleteConfirm();
    }, 300);
  } else {
    closeDeleteConfirm();
  }
};

// Search sub admins
window.searchSubAdmins = function(query) {
  const cards = document.querySelectorAll('.admin-card');
  const searchLower = query.toLowerCase();
  
  cards.forEach(card => {
    const name = card.querySelector('.admin-details h4').textContent.toLowerCase();
    const email = card.querySelector('.admin-details p').textContent.toLowerCase();
    
    if (name.includes(searchLower) || email.includes(searchLower)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};

// Open Language Page
window.openLanguagePage = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('language.title'));
    contentArea.innerHTML = getLanguagePageHTML();
    updateActiveMenuItem('Language');
    
    // Set current language as selected
    const currentLang = getCurrentLanguage();
    document.querySelectorAll('.language-option').forEach(option => {
      if (option.dataset.lang === currentLang) {
        option.classList.add('selected');
      }
    });
    
    // Apply saved primary color to Language page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    return;
  }
};

// Helper function to get language page HTML
function getLanguagePageHTML() {
  const currentLang = getCurrentLanguage();
  
  return `
    <div class="language-page">
      <style>
        .language-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .language-header {
          margin-bottom: 32px;
        }
        .language-subtitle {
          color: rgba(156, 163, 175, 1);
          font-size: 16px;
          margin-bottom: 32px;
        }
        .language-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .language-option {
          background: rgba(58, 56, 56, 0.3);
          border: 2px solid var(--primary-border);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .language-option:hover {
          background: rgba(58, 56, 56, 0.5);
          border-color: var(--primary-border-hover);
          transform: translateX(4px);
        }
        .language-option.selected {
          background: var(--primary-light);
          border-color: var(--primary-color);
        }
        .language-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 20px;
        }
        .language-option.selected .language-icon {
          background: var(--primary-border-strong);
        }
        .language-name {
          flex: 1;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }
        .language-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .language-option.selected .language-check {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }
        .language-check svg {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .language-option.selected .language-check svg {
          opacity: 1;
        }
        .language-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .btn-apply {
          padding: 14px 32px;
          background: var(--border-color);
          border: 1px solid var(--primary-border-strong);
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-apply:hover {
          background: var(--primary-border-hover);
          transform: translateY(-2px);
        }
        .btn-apply:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>

      <div class="language-header">
        <h2 class="language-subtitle">${t('language.choosePreferred')}</h2>
      </div>

      <div class="language-options">
        <div class="language-option ${currentLang === 'en' ? 'selected' : ''}" data-lang="en" onclick="selectLanguage('en')">
          <div class="language-icon">E</div>
          <div class="language-name">${t('language.english')}</div>
          <div class="language-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="language-option ${currentLang === 'uz' ? 'selected' : ''}" data-lang="uz" onclick="selectLanguage('uz')">
          <div class="language-icon">U</div>
          <div class="language-name">${t('language.uzbek')}</div>
          <div class="language-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="language-option ${currentLang === 'ru' ? 'selected' : ''}" data-lang="ru" onclick="selectLanguage('ru')">
          <div class="language-icon">R</div>
          <div class="language-name">${t('language.russian')}</div>
          <div class="language-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="language-actions">
        <button class="btn-apply" onclick="applyLanguageChanges()">${t('language.applyChanges')}</button>
      </div>
    </div>
  `;
}

// Select language
window.selectLanguage = function(lang) {
  document.querySelectorAll('.language-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`[data-lang="${lang}"]`).classList.add('selected');
  
  // Store selected language temporarily
  window.selectedLanguage = lang;
};

// Apply language changes
window.applyLanguageChanges = function() {
  const selectedLang = window.selectedLanguage || getCurrentLanguage();
  setLanguage(selectedLang);
  
  // Reload dashboard with new language
  initDashboard();
};

// Open Customize UI Page
window.openCustomizeUI = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('pages.customizeUI'));
    contentArea.innerHTML = getCustomizeUIHTML();
    updateActiveMenuItem('Customize UI');
    
    // Initialize color picker and theme settings
    initializeCustomizeUI();
    return;
  }
};

// Helper function to get Customize UI HTML
function getCustomizeUIHTML() {
  const theme = getTheme();
  
  return `
    <div class="customize-ui-page">
      <style>
        .customize-ui-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .customize-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 32px;
        }
        .customize-section {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .section-title {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .section-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 20px;
        }
        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .color-preview {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .color-preview:hover {
          transform: scale(1.05);
          border-color: var(--primary-color);
        }
        .color-input-wrapper {
          flex: 1;
          position: relative;
        }
        .color-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: monospace;
        }
        #colorPicker {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .preset-colors-label {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .preset-colors {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .preset-color {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .preset-color:hover {
          transform: scale(1.1);
          border-color: var(--text-primary);
        }
        .preset-color.active {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.3);
        }
        .theme-toggle-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }
        .theme-toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 500;
        }
        .theme-toggle-label svg {
          color: var(--primary-color);
        }
        .toggle-switch {
          position: relative;
          width: 56px;
          height: 28px;
          background: rgba(var(--primary-color-rgb), 0.2);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .toggle-switch.active {
          background: var(--primary-color);
        }
        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .toggle-switch.active .toggle-slider {
          transform: translateX(28px);
        }
        .font-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .font-option {
          padding: 16px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        .font-option:hover {
          border-color: var(--primary-color);
          background: var(--card-hover);
        }
        .font-option.active {
          border-color: var(--primary-color);
          background: rgba(var(--primary-color-rgb), 0.1);
        }
        .font-name {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .font-preview {
          color: var(--text-secondary);
          font-size: 12px;
        }
        .save-btn {
          width: 100%;
          padding: 14px 32px;
          background: var(--primary-color);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .save-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      </style>

      <div class="customize-subtitle">${t('customizeUI.subtitle')}</div>

      <!-- Theme Color Section -->
      <div class="customize-section">
        <h3 class="section-title">${t('customizeUI.themeColor')}</h3>
        <p class="section-subtitle">${t('customizeUI.customColor')}</p>
        
        <div class="color-picker-wrapper">
          <div class="color-preview" id="colorPreview" style="background-color: ${theme.primaryColor};">
            <input type="color" id="colorPicker" value="${theme.primaryColor}" onchange="updateColorFromPicker(this.value)">
          </div>
          <div class="color-input-wrapper">
            <input type="text" class="color-input" id="colorInput" value="${theme.primaryColor}" placeholder="#7ea2d4" oninput="updateColorPreview(this.value)">
          </div>
        </div>
        
        <div class="preset-colors-label">${t('customizeUI.quickPresets')}</div>
        <div class="preset-colors" id="presetColors">
          ${presetColors.map(color => `
            <div class="preset-color ${theme.primaryColor === color.value ? 'active' : ''}" 
                 style="background-color: ${color.value};" 
                 onclick="selectPresetColor('${color.value}')"
                 title="${color.name}">
            </div>
          `).join('')}
          
          <!-- Add Custom Color Button -->
          <div class="preset-color add-color-btn" 
               onclick="openColorPickerModal()"
               title="Add Custom Color"
               style="background: transparent; border: 2px dashed var(--primary-color); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>

      <!-- Light Mode Section -->
      <div class="customize-section">
        <div class="theme-toggle-wrapper">
          <div class="theme-toggle-label">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            ${t('customizeUI.lightMode')}
          </div>
          <div class="toggle-switch ${theme.mode === 'light' ? 'active' : ''}" id="lightModeToggle" onclick="toggleLightMode()">
            <div class="toggle-slider"></div>
          </div>
        </div>
      </div>

      <!-- Font Family Section -->
      <div class="customize-section">
        <h3 class="section-title">${t('customizeUI.fontFamily')}</h3>
        <p class="section-subtitle">${t('customizeUI.chooseFont')}</p>
        
        <div class="font-options">
          <div class="font-option ${theme.fontFamily === 'system' ? 'active' : ''}" onclick="selectFont('system')">
            <div class="font-name" style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">${t('customizeUI.systemFont')}</div>
            <div class="font-preview">${t('customizeUI.systemFontDesc')}</div>
          </div>
          <div class="font-option ${theme.fontFamily === 'inter' ? 'active' : ''}" onclick="selectFont('inter')">
            <div class="font-name" style="font-family: 'Inter', sans-serif;">Inter</div>
            <div class="font-preview">${t('customizeUI.modernClean')}</div>
          </div>
          <div class="font-option ${theme.fontFamily === 'roboto' ? 'active' : ''}" onclick="selectFont('roboto')">
            <div class="font-name" style="font-family: 'Roboto', sans-serif;">Roboto</div>
            <div class="font-preview">${t('customizeUI.googleFont')}</div>
          </div>
          <div class="font-option ${theme.fontFamily === 'poppins' ? 'active' : ''}" onclick="selectFont('poppins')">
            <div class="font-name" style="font-family: 'Poppins', sans-serif;">Poppins</div>
            <div class="font-preview">${t('customizeUI.geometricFriendly')}</div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <button class="save-btn" onclick="saveCustomization()">${t('customizeUI.saveCustomization')}</button>
    </div>
  `;
}

// Initialize Customize UI
function initializeCustomizeUI() {
  const theme = getTheme();
  window.currentTheme = { ...theme };
}

// Update color preview
window.updateColorPreview = function(color) {
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    document.getElementById('colorPreview').style.backgroundColor = color;
    document.getElementById('colorPicker').value = color;
    window.currentTheme.primaryColor = color;
    
    // Apply color to entire app
    applyPrimaryColor(color);
    
    // Update active preset
    document.querySelectorAll('.preset-color').forEach(preset => {
      preset.classList.remove('active');
    });
  }
};

// Apply primary color to entire app
window.applyPrimaryColor = function(color) {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', color);
  document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
  document.documentElement.style.setProperty('--primary-hover', `rgba(${r}, ${g}, ${b}, 0.8)`);
  document.documentElement.style.setProperty('--primary-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
  document.documentElement.style.setProperty('--primary-light-hover', `rgba(${r}, ${g}, ${b}, 0.15)`);
  document.documentElement.style.setProperty('--primary-color-light', `rgba(${r}, ${g}, ${b}, 0.7)`);
  
  // Update border-color variables (used in many places)
  document.documentElement.style.setProperty('--border-color', `rgba(${r}, ${g}, ${b}, 0.3)`);
  document.documentElement.style.setProperty('--primary-border', `rgba(${r}, ${g}, ${b}, 0.2)`);
  document.documentElement.style.setProperty('--primary-border-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
  document.documentElement.style.setProperty('--primary-border-hover', `rgba(${r}, ${g}, ${b}, 0.4)`);
  document.documentElement.style.setProperty('--primary-border-strong', `rgba(${r}, ${g}, ${b}, 0.5)`);
  
  // Create dynamic style tag to override hardcoded colors
  let styleTag = document.getElementById('dynamic-primary-color');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-primary-color';
    document.head.appendChild(styleTag);
  }
  
  // Override all hardcoded #7ea2d4 and rgba(126, 162, 212, ...) colors
  styleTag.textContent = `
    /* Override hardcoded blue colors with custom primary color */
    .figma-title h2,
    .figma-logo h1 span,
    .figma-stats-title,
    .figma-menu-child.active,
    .figma-menu-child:hover,
    .figma-menu-parent.expanded,
    .figma-menu-title,
    .figma-menu-arrow,
    .figma-subscription .figma-single-link,
    .figma-single-link:hover,
    .assignments-card-title,
    .finance-card-title,
    .quiz-stat-title,
    .progress-stat-title,
    .section-title,
    .assignments-section-title,
    .course-assignment-subtitle,
    .course-filter-label,
    .assignment-counter,
    .course-section-title {
      color: ${color} !important;
    }
    
    .figma-subscription {
      border-top-color: ${color} !important;
    }
    
    .figma-stats-card:hover,
    .stat-card-my-courses:hover,
    .assignments-card:hover,
    .finance-card:hover,
    .quiz-stat-card:hover,
    .progress-stat-card:hover,
    .student-progress-card:hover,
    .assignment-item:hover,
    .quiz-item:hover,
    .payment-method-card:hover,
    .figma-subscription .figma-single-link,
    .sidebar-menu,
    .figma-menu-children,
    .messages-welcome,
    .messages-header,
    .add-module-btn:hover,
    .course-section {
      border-color: ${color} !important;
    }
    
    /* Create Course page - radio buttons */
    .radio-option input[type="radio"]:checked + .radio-custom {
      border-color: ${color} !important;
      background: ${color} !important;
    }
    
    /* Create Course page - toggle switches */
    input:checked + .toggle-slider {
      background-color: ${color} !important;
    }
    
    /* Create Course page - add lesson button */
    .add-btn {
      background: ${color} !important;
      color: white !important;
    }
    
    .add-btn:hover {
      background: rgba(${r}, ${g}, ${b}, 0.9) !important;
    }
    
    /* Create Course page - dropdown menu */
    .dropdown-menu {
      border-color: rgba(${r}, ${g}, ${b}, 0.3) !important;
    }
    
    .dropdown-menu a {
      color: ${color} !important;
    }
    
    .dropdown-menu a:hover {
      background: rgba(${r}, ${g}, ${b}, 0.15) !important;
      color: #ffffff !important;
    }
    
    .dropdown-menu a svg {
      stroke: ${color} !important;
    }
    
    .dropdown-menu a:hover svg {
      stroke: #ffffff !important;
    }
    
    /* Create Course page - add module button */
    .add-module-btn {
      border-color: rgba(${r}, ${g}, ${b}, 0.3) !important;
      color: ${color} !important;
    }
    
    .add-module-btn:hover {
      background: rgba(${r}, ${g}, ${b}, 0.05) !important;
    }
    
    /* Create Course page - publish button */
    .btn-save,
    .btn-save-profile {
      background: linear-gradient(135deg, ${color} 0%, rgba(${r}, ${g}, ${b}, 0.85) 100%) !important;
      border-color: rgba(${r}, ${g}, ${b}, 0.5) !important;
    }
    
    .btn-save:hover,
    .btn-save-profile:hover {
      background: linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.9) 0%, rgba(${r}, ${g}, ${b}, 0.75) 100%) !important;
    }
    
    /* Create Course page - cancel button */
    .btn-cancel,
    .btn-cancel-profile {
      border-color: rgba(${r}, ${g}, ${b}, 0.3) !important;
    }
    
    .btn-cancel:hover,
    .btn-cancel-profile:hover {
      border-color: rgba(${r}, ${g}, ${b}, 0.6) !important;
      background: rgba(${r}, ${g}, ${b}, 0.15) !important;
    }
    
    /* Create Course page - info tip box */
    .info-tip {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
      color: ${color} !important;
    }
    
    .info-tip svg {
      color: ${color} !important;
    }
    
    /* Create Course page - module items */
    .module-item {
      border-color: rgba(${r}, ${g}, ${b}, 0.15) !important;
    }
    
    .module-header.expanded {
      border-bottom-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    /* My Courses page - stat cards */
    .stat-card-my-courses {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .stat-card-my-courses h3 {
      color: rgba(${r}, ${g}, ${b}, 0.8) !important;
    }
    
    .stat-number {
      color: ${color} !important;
    }
    
    /* My Courses page - filter tabs */
    .course-filter-tabs {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .filter-tab.active {
      background: rgba(${r}, ${g}, ${b}, 0.2) !important;
      color: ${color} !important;
    }
    
    /* My Courses page - course cards */
    .course-card-figma,
    .my-course-card {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .course-card-figma:hover,
    .my-course-card:hover {
      border-color: rgba(${r}, ${g}, ${b}, 0.4) !important;
    }
    
    .course-card-category {
      color: ${color} !important;
    }
    
    .course-card-footer {
      border-top-color: rgba(${r}, ${g}, ${b}, 0.1) !important;
    }
    
    /* My Courses page - search input */
    #courseSearchInput {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    #courseSearchInput:focus {
      border-color: rgba(${r}, ${g}, ${b}, 0.5) !important;
    }
    
    /* My Courses page - sort dropdown */
    #courseSortSelect {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    /* My Courses page - revenue */
    .course-revenue {
      border-top-color: rgba(${r}, ${g}, ${b}, 0.1) !important;
    }
    
    .revenue-amount {
      color: ${color} !important;
    }
    
    /* My Courses page - course buttons (Edit, Stats) */
    .course-btn {
      background: rgba(${r}, ${g}, ${b}, 0.2) !important;
      border-color: rgba(${r}, ${g}, ${b}, 0.3) !important;
      color: ${color} !important;
    }
    
    .course-btn:hover {
      background: rgba(${r}, ${g}, ${b}, 0.3) !important;
      border-color: rgba(${r}, ${g}, ${b}, 0.5) !important;
    }
    
    /* Finance page - stat cards */
    .figma-content-area.finance-page .finance-card {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .figma-content-area.finance-page .finance-card:hover {
      border-color: rgba(${r}, ${g}, ${b}, 0.4) !important;
    }
    
    .figma-content-area.finance-page .finance-card-title {
      color: ${color} !important;
    }
    
    /* Finance page - transactions section */
    .transactions-section {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .transaction-search,
    .transaction-date-filter {
      border-color: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .transactions-table th,
    .transactions-table td {
      border-bottom-color: rgba(${r}, ${g}, ${b}, 0.1) !important;
    }
    
    .transactions-table tbody tr:hover {
      background: rgba(${r}, ${g}, ${b}, 0.05) !important;
    }
    
    /* Finance page - payment method cards */
    .figma-content-area.finance-page .payment-method-card {
      border-color: rgba(${r}, ${g}, ${b}, 0.3) !important;
    }
    
    .action-btn,
    .grade-btn,
    .quiz-action-btn,
    .edit-btn,
    .promo-edit-btn,
    .edit-bio-btn,
    .figma-header-buttons button,
    .figma-header-buttons .figma-btn,
    .figma-btn-primary,
    .save-profile-btn,
    button[onclick*="openEditProfile"],
    button[onclick*="openCustomizeUI"],
    button[onclick*="customizeUI"],
    button[onclick*="openCreateCourse"],
    button[onclick*="saveProfile"] {
      border-color: ${color} !important;
      color: ${color} !important;
    }
    
    /* New Course button - transparent background like other buttons */
    .figma-btn-primary:not(.edit-profile-form button[type="submit"]),
    button[onclick*="openCreateCourse"] {
      background: transparent !important;
    }
    
    /* Create Group button - use dynamic color background */
    .create-group-btn {
      background: ${color} !important;
      border-color: ${color} !important;
      color: #ffffff !important;
    }
    
    /* Save changes button - use dynamic color background */
    .edit-profile-form button[type="submit"],
    button[type="submit"].save-profile-btn {
      background: ${color} !important;
      border-color: ${color} !important;
      color: #ffffff !important;
    }
    
    /* Cancel button - use dynamic color border and background */
    .edit-profile-form button[type="button"],
    button.cancel-btn {
      background: rgba(${r}, ${g}, ${b}, 0.1) !important;
      border-color: ${color} !important;
      color: ${color} !important;
    }
    
    .action-btn:hover,
    .grade-btn:hover,
    .figma-header-buttons .figma-btn:hover,
    .figma-btn-primary:hover,
    button[onclick*="openCreateCourse"]:hover {
      background: rgba(${r}, ${g}, ${b}, 0.1) !important;
    }
    
    .edit-profile-form button[type="submit"]:hover {
      background: rgba(${r}, ${g}, ${b}, 0.9) !important;
    }
    
    .edit-profile-form button[type="button"]:hover,
    button.cancel-btn:hover {
      background: rgba(${r}, ${g}, ${b}, 0.2) !important;
    }
    
    .assignment-tab.active,
    .quiz-tab.active,
    .filter-btn.active {
      background: rgba(${r}, ${g}, ${b}, 0.1) !important;
      border-color: ${color} !important;
      color: ${color} !important;
    }
    
    .student-avatar-progress {
      background: rgba(${r}, ${g}, ${b}, 0.15) !important;
      color: ${color} !important;
    }

    /* Bio editor styles */
    #bioTextarea {
      border: 1px solid rgba(${r}, ${g}, ${b}, 0.2) !important;
      outline: none !important;
      transition: all 0.2s ease !important;
    }

    #bioTextarea:focus {
      border: 1px solid rgba(${r}, ${g}, ${b}, 0.7) !important;
      box-shadow: 0 0 0 3px rgba(${r}, ${g}, ${b}, 0.15) !important;
      outline: none !important;
    }

    /* Bio card - when editing */
    #bioEditor {
      border: 1px solid rgba(${r}, ${g}, ${b}, 0.2) !important;
      border-radius: 8px !important;
      padding: 12px !important;
      background: rgba(${r}, ${g}, ${b}, 0.05) !important;
    }

    /* Bio save button */
    button[onclick="saveBio()"] {
      background: ${color} !important;
      border-color: ${color} !important;
    }

    button[onclick="saveBio()"]:hover {
      background: rgba(${r}, ${g}, ${b}, 0.9) !important;
    }
  `;
  
  // Save to localStorage
  localStorage.setItem('primaryColor', color);

  console.log('Primary color updated to:', color);
};

// Load saved primary color from localStorage
window.loadSavedPrimaryColor = function() {
  const savedColor = localStorage.getItem('primaryColor');
  if (savedColor && /^#[0-9A-F]{6}$/i.test(savedColor)) {
    applyPrimaryColor(savedColor);
    console.log('Loaded saved primary color:', savedColor);
  } else {
    console.log('No saved color, using default: #7ea2d4');
  }
};

// Update color from picker
window.updateColorFromPicker = function(color) {
  document.getElementById('colorInput').value = color;
  updateColorPreview(color);
};

// Select preset color
window.selectPresetColor = function(color) {
  document.getElementById('colorInput').value = color;
  updateColorPreview(color);
  
  // Update active state
  document.querySelectorAll('.preset-color').forEach(preset => {
    preset.classList.remove('active');
  });
  event.target.classList.add('active');
};

// Open color picker modal with full palette
window.openColorPickerModal = function() {
  // Generate color palette grid
  const generateColorPalette = () => {
    const colors = [];
    // Grayscale row
    for (let i = 0; i <= 10; i++) {
      const val = Math.round((i / 10) * 255);
      colors.push(`rgb(${val}, ${val}, ${val})`);
    }
    
    // Color rows - Hue variations
    const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]; // 12 hues
    const saturations = [100, 80, 60, 40, 20]; // 5 saturation levels
    const lightnesses = [50, 60, 70, 80, 90]; // 5 lightness levels
    
    hues.forEach(hue => {
      lightnesses.forEach(lightness => {
        colors.push(`hsl(${hue}, 100%, ${lightness}%)`);
      });
    });
    
    return colors;
  };
  
  const colors = generateColorPalette();
  
  const modal = document.createElement('div');
  modal.id = 'colorPickerModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeColorPickerModal()"></div>
    <div class="color-picker-modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #ffffff; margin: 0;">Choose Color</h3>
        <button onclick="closeColorPickerModal()" style="background: none; border: none; color: rgba(255,255,255,0.6); font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px;">×</button>
      </div>
      
      <!-- Color Palette Grid -->
      <div class="color-palette-grid">
        ${colors.map(color => `
          <div class="palette-color" 
               style="background: ${color};" 
               onclick="selectPaletteColor('${color}')"
               title="${color}">
          </div>
        `).join('')}
      </div>
      
      <!-- Selected Color Preview -->
      <div style="margin-top: 20px; padding: 16px; background: rgba(20,20,20,0.5); border-radius: 12px; display: flex; align-items: center; gap: 16px;">
        <div id="selectedColorPreview" style="width: 60px; height: 60px; border-radius: 12px; background: #7ea2d4; border: 2px solid rgba(255,255,255,0.2);"></div>
        <div style="flex: 1;">
          <label style="color: rgba(255,255,255,0.6); font-size: 12px; display: block; margin-bottom: 4px;">Selected Color:</label>
          <input type="text" id="selectedColorHex" value="#7ea2d4" readonly
                 style="width: 100%; padding: 10px; background: rgba(20,20,20,0.8); border: 1px solid rgba(126,162,212,0.3); border-radius: 8px; color: #ffffff; font-family: monospace; font-size: 14px;">
        </div>
      </div>
      
      <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
        <button onclick="closeColorPickerModal()" class="btn-cancel">Cancel</button>
        <button onclick="applyCustomColor()" class="btn-save">Apply Color</button>
      </div>
    </div>
    
    <style>
      #colorPickerModal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .color-picker-modal-content {
        position: relative;
        background: rgba(30, 30, 30, 0.98);
        border-radius: 20px;
        padding: 28px;
        width: 90%;
        max-width: 650px;
        max-height: 85vh;
        overflow-y: auto;
        border: 2px solid var(--primary-color);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--primary-color);
      }
      .color-palette-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 4px;
      }
      .palette-color {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }
      .palette-color:hover {
        transform: scale(1.15);
        border-color: rgba(255,255,255,0.8);
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  // Store selected color
  window.selectedCustomColor = '#7ea2d4';
};

// Close color picker modal
window.closeColorPickerModal = function() {
  const modal = document.getElementById('colorPickerModal');
  if (modal) {
    modal.remove();
  }
};

// Select color from palette
window.selectPaletteColor = function(color) {
  // Convert RGB/HSL to HEX
  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g);
    if (!result) return color;
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const hslToHex = (hsl) => {
    const result = hsl.match(/\d+/g);
    if (!result) return color;
    let h = parseInt(result[0]) / 360;
    let s = parseInt(result[1]) / 100;
    let l = parseInt(result[2]) / 100;
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  let hexColor = color;
  if (color.startsWith('rgb')) {
    hexColor = rgbToHex(color);
  } else if (color.startsWith('hsl')) {
    hexColor = hslToHex(color);
  }
  
  // Update preview
  document.getElementById('selectedColorPreview').style.background = color;
  document.getElementById('selectedColorHex').value = hexColor;
  window.selectedCustomColor = hexColor;
};

// Apply custom color
window.applyCustomColor = function() {
  const color = window.selectedCustomColor || '#7ea2d4';
  
  document.getElementById('colorInput').value = color;
  updateColorPreview(color);
  
  // Update active state
  document.querySelectorAll('.preset-color').forEach(preset => {
    preset.classList.remove('active');
  });
  
  showSuccessToast('Custom color applied!');
  closeColorPickerModal();
};

// Toggle light mode
window.toggleLightMode = function() {
  const toggle = document.getElementById('lightModeToggle');
  const isActive = toggle.classList.contains('active');
  
  if (isActive) {
    toggle.classList.remove('active');
    window.currentTheme.mode = 'dark';
  } else {
    toggle.classList.add('active');
    window.currentTheme.mode = 'light';
  }
};

// Select font
window.selectFont = function(font) {
  window.currentTheme.fontFamily = font;
  
  // Update active state
  document.querySelectorAll('.font-option').forEach(option => {
    option.classList.remove('active');
  });
  event.target.closest('.font-option').classList.add('active');
};

// Save customization
window.saveCustomization = function() {
  saveTheme(window.currentTheme);
  
  // Show success toast
  showSuccessToast(t('notifications.customizationSaved'));
  
  // Reload dashboard to apply changes after a short delay
  setTimeout(() => {
    initDashboard();
  }, 800);
};

// Open My Subscription Page
window.openMySubscription = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('pages.mySubscription'));
    contentArea.innerHTML = getMySubscriptionHTML();
    updateActiveMenuItem('My Subscription');
    return;
  }
};

// Helper function to get My Subscription HTML
function getMySubscriptionHTML() {
  return `
    <div class="subscription-page">
      <style>
        .subscription-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .subscription-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 32px;
        }
        .subscription-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
        }
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .plan-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .plan-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-active {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .badge-pro {
          background: var(--primary-light);
          color: var(--primary-color);
        }
        .plan-name {
          color: var(--text-primary);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .plan-description {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .plan-price {
          text-align: right;
        }
        .price-amount {
          color: var(--text-primary);
          font-size: 32px;
          font-weight: 700;
        }
        .price-period {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .subscription-period {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .period-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .period-title {
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
        }
        .period-dates {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .period-date {
          color: var(--text-secondary);
        }
        .days-left {
          color: #f59e0b;
          font-size: 12px;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #d97706);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .payment-info {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--border-color);
        }
        .payment-label {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .payment-value {
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-upgrade {
          flex: 1;
          padding: 14px 24px;
          background: var(--primary-color);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-upgrade:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }
        .btn-change-payment {
          flex: 1;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-change-payment:hover {
          background: var(--card-hover);
          border-color: var(--primary-color);
        }
        .warning-box {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .warning-icon {
          width: 40px;
          height: 40px;
          background: rgba(245, 158, 11, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .warning-content {
          flex: 1;
        }
        .warning-text {
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .btn-pay-now {
          padding: 10px 20px;
          background: #f59e0b;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-pay-now:hover {
          background: #d97706;
          transform: translateY(-2px);
        }
      </style>

      <div class="subscription-subtitle">Your Pro plan and all premium features</div>

      <!-- Subscription Card -->
      <div class="subscription-card">
        <div class="plan-header">
          <div class="plan-info">
            <div class="plan-badges">
              <span class="badge badge-active">Active</span>
              <span class="badge badge-pro">Pro Plan</span>
            </div>
            <h2 class="plan-name">Pro Plan</h2>
            <p class="plan-description">All pro features included</p>
          </div>
          <div class="plan-price">
            <div class="price-amount">1 290 000 UZS</div>
            <div class="price-period">per month</div>
          </div>
        </div>

        <!-- Subscription Period -->
        <div class="subscription-period">
          <div class="period-header">
            <span class="period-title">Subscription Period</span>
            <span class="days-left">28 days left</span>
          </div>
          <div class="period-dates">
            <span class="period-date">Started: Oct 13, 2025</span>
            <span class="period-date">Ends: Nov 13, 2025</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 50%;"></div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
          <span class="payment-label">Payment Method</span>
          <span class="payment-value">•••• •••• •••• 4242</span>
        </div>
        <div class="payment-info" style="border-top: none;">
          <span class="payment-label">Next Payment</span>
          <span class="payment-value">Nov 13</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-upgrade" onclick="upgradePlan()">Upgrade plan</button>
          <button class="btn-change-payment" onclick="changePaymentMethod()">Change payment method</button>
        </div>
      </div>

      <!-- Warning Box -->
      <div class="warning-box">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="warning-content">
          <p class="warning-text">Your subscription will expire on November 13, 2025. After this date, your account will be automatically blocked and you will lose access to all Pro features. To continue using the platform, please make a payment before the expiration date.</p>
          <button class="btn-pay-now" onclick="payNow()">Pay now</button>
        </div>
      </div>
    </div>
  `;
}

// Subscription page functions
window.upgradePlan = function() {
  showSuccessToast('Upgrade plan feature coming soon!');
};

window.changePaymentMethod = function() {
  showSuccessToast('Change payment method feature coming soon!');
};

window.payNow = function() {
  showSuccessToast('Payment processing feature coming soon!');
};

// Open Progress Page
window.openProgress = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('pages.progress'));
    contentArea.innerHTML = getProgressHTML();
    updateActiveMenuItem('Progress');
    
    // Apply saved primary color to Progress page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    return;
  }
};

// Helper function to get progress HTML
function getProgressHTML() {
  return `
    <div class="progress-page">
      <style>
        .progress-page {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .progress-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .progress-stat-card {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .progress-stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-border-hover);
          background: rgba(58, 56, 56, 0.5);
        }
        .progress-stat-title {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }
        .progress-stat-value {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .progress-stat-subtitle {
          color: #10b981;
          font-size: 12px;
        }
        .course-filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 10px 20px;
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 8px;
          color: rgba(156, 163, 175, 1);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-btn.active {
          background: var(--primary-light);
          border-color: var(--primary-color);
          color: #ffffff;
        }
        .filter-btn:hover {
          border-color: var(--primary-border-hover);
          color: #ffffff;
        }
        .students-progress-section {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
        }
        .section-header {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .student-progress-card {
          background: rgba(58, 56, 56, 0.5);
          border: 1px solid var(--primary-border-light);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }
        .student-progress-card:hover {
          border-color: var(--border-color);
          background: rgba(58, 56, 56, 0.7);
        }
        .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .student-info-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .student-avatar-progress {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
        }
        .student-name-email h4 {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .student-name-email p {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
        }
        .student-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(126, 162, 212, 0.3);
          border-radius: 8px;
          color: rgba(126, 162, 212, 1);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .action-btn:hover {
          background: rgba(126, 162, 212, 0.1);
          border-color: rgba(126, 162, 212, 0.5);
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-badge.needs-help {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .status-badge.live {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .current-lesson {
          background: rgba(58, 56, 56, 0.7);
          border: 1px solid rgba(126, 162, 212, 0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .lesson-title {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .lesson-subtitle {
          color: rgba(156, 163, 175, 1);
          font-size: 11px;
          margin-bottom: 8px;
        }
        .lesson-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(58, 56, 56, 0.5);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        .lesson-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .lesson-progress-fill.green {
          background: linear-gradient(90deg, #10b981, #059669);
        }
        .lesson-progress-fill.yellow {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }
        .progress-text {
          color: rgba(156, 163, 175, 1);
          font-size: 11px;
          text-align: right;
        }
        .progress-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 12px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-label {
          color: rgba(156, 163, 175, 1);
          font-size: 11px;
          margin-bottom: 4px;
        }
        .stat-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }
        .show-more-progress-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--primary-color);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 24px auto 0;
        }
        .show-more-progress-btn:hover {
          background: var(--primary-light);
          border-color: var(--primary-border-strong);
        }
      </style>

      <div class="progress-stats-grid">
        <div class="progress-stat-card">
          <div class="progress-stat-title">Avg Completion</div>
          <div class="progress-stat-value">68%</div>
        </div>
        <div class="progress-stat-card">
          <div class="progress-stat-title">Currently Learning</div>
          <div class="progress-stat-value">23</div>
          <div class="progress-stat-subtitle">● Live now</div>
        </div>
        <div class="progress-stat-card">
          <div class="progress-stat-title">Completed</div>
          <div class="progress-stat-value">156</div>
          <div class="progress-stat-subtitle">Finished all modules</div>
        </div>
      </div>

      <div class="course-filters">
        <button class="filter-btn active" onclick="filterProgressCourse(this, 'all')">All courses (4)</button>
        <button class="filter-btn" onclick="filterProgressCourse(this, 'javascript')">JavaScript</button>
        <button class="filter-btn" onclick="filterProgressCourse(this, 'react')">React</button>
        <button class="filter-btn" onclick="filterProgressCourse(this, 'ui')">UI/UX</button>
        <button class="filter-btn" onclick="filterProgressCourse(this, 'db')">Databases</button>
      </div>

      <!-- Student Progress Overview -->
      <div class="students-progress-section">
        <h3 class="section-header">Student Progress Overview</h3>
        
        <!-- Student 1 -->
        <div class="student-progress-card">
          <div class="student-header">
            <div class="student-info-header">
              <div class="student-avatar-progress">SM</div>
              <div class="student-name-email">
                <h4>Sarah Martinez</h4>
                <p>sarah.martinez@email.com</p>
              </div>
            </div>
            <div class="student-actions">
              <button class="action-btn">View details</button>
            </div>
          </div>
          
          <div class="current-lesson">
            <div class="lesson-title">Last Watched</div>
            <div class="lesson-subtitle">CSS Grid Layout Advanced Techniques</div>
            <div class="lesson-progress-bar">
              <div class="lesson-progress-fill green" style="width: 100%"></div>
            </div>
            <div class="progress-text">100% completed</div>
          </div>
          
          <div class="progress-stats-row">
            <div class="stat-item">
              <div class="stat-label">Overall Progress</div>
              <div class="stat-value">78%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Completed Lessons</div>
              <div class="stat-value">37/47</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Quiz Average</div>
              <div class="stat-value">92%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Last Active</div>
              <div class="stat-value">30 ago</div>
            </div>
          </div>
        </div>

        <!-- Student 2 -->
        <div class="student-progress-card">
          <div class="student-header">
            <div class="student-info-header">
              <div class="student-avatar-progress">MJ</div>
              <div class="student-name-email">
                <h4>Mike Johnson</h4>
                <p>mike.johnson@email.com</p>
              </div>
              <span class="status-badge needs-help">Needs help</span>
            </div>
            <div class="student-actions">
              <button class="action-btn">Send message</button>
            </div>
          </div>
          
          <div class="current-lesson">
            <div class="lesson-title">Stuck on</div>
            <div class="lesson-subtitle">JavaScript Async/Await Basics</div>
            <div class="lesson-progress-bar">
              <div class="lesson-progress-fill yellow" style="width: 18%"></div>
            </div>
            <div class="progress-text">18% • Watched 3 times</div>
          </div>
          
          <div class="progress-stats-row">
            <div class="stat-item">
              <div class="stat-label">Overall Progress</div>
              <div class="stat-value">28%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Completed Lessons</div>
              <div class="stat-value">13/47</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Quiz Average</div>
              <div class="stat-value">58%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Last Active</div>
              <div class="stat-value">1 day ago</div>
            </div>
          </div>
        </div>

        <!-- Student 3 -->
        <div class="student-progress-card">
          <div class="student-header">
            <div class="student-info-header">
              <div class="student-avatar-progress">AJ</div>
              <div class="student-name-email">
                <h4>Alex Johnson</h4>
                <p>alex.johnson@email.com</p>
              </div>
              <span class="status-badge live">● Live</span>
            </div>
            <div class="student-actions">
              <button class="action-btn">View details</button>
            </div>
          </div>
          
          <div class="current-lesson">
            <div class="lesson-title">Currently Watching</div>
            <div class="lesson-subtitle">React Hooks - Introduction to useState</div>
            <div class="lesson-progress-bar">
              <div class="lesson-progress-fill green" style="width: 45%"></div>
            </div>
            <div class="progress-text">Module 2 • Lesson 5 • 10:32 / 23:08</div>
          </div>
          
          <div class="progress-stats-row">
            <div class="stat-item">
              <div class="stat-label">Overall Progress</div>
              <div class="stat-value">45%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Completed Lessons</div>
              <div class="stat-value">21/47</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Quiz Average</div>
              <div class="stat-value">87%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Last Active</div>
              <div class="stat-value">Now</div>
            </div>
          </div>
        </div>

        <button class="show-more-progress-btn" onclick="loadMoreProgress()">Show more</button>
      </div>
    </div>
  `;
}

// Filter progress by course
window.filterProgressCourse = function(button, course) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  const section = document.querySelector('.students-progress-section');
  if (!section) return;
  
  // Remove extra students
  document.querySelectorAll('.student-progress-card.extra').forEach(card => card.remove());
  
  // Reset show more button
  const btn = document.querySelector('.show-more-progress-btn');
  if (btn) {
    btn.textContent = 'Show more';
    btn.dataset.loaded = 'false';
  }
  
  let studentsHTML = '';
  
  if (course === 'all') {
    studentsHTML = `
      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">SM</div>
            <div class="student-name-email">
              <h4>Sarah Martinez</h4>
              <p>sarah.martinez@email.com</p>
            </div>
          </div>
          <div class="student-actions">
            <button class="action-btn">View details</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Last Watched</div>
          <div class="lesson-subtitle">CSS Grid Layout Advanced Techniques</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill green" style="width: 100%"></div>
          </div>
          <div class="progress-text">100% completed</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">78%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">37/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">92%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">30 ago</div></div>
        </div>
      </div>

      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">MJ</div>
            <div class="student-name-email">
              <h4>Mike Johnson</h4>
              <p>mike.johnson@email.com</p>
            </div>
            <span class="status-badge needs-help">Needs help</span>
          </div>
          <div class="student-actions">
            <button class="action-btn">Send message</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Stuck on</div>
          <div class="lesson-subtitle">JavaScript Async/Await Basics</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill yellow" style="width: 18%"></div>
          </div>
          <div class="progress-text">18% • Watched 3 times</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">28%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">13/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">58%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">1 day ago</div></div>
        </div>
      </div>

      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">AJ</div>
            <div class="student-name-email">
              <h4>Alex Johnson</h4>
              <p>alex.johnson@email.com</p>
            </div>
            <span class="status-badge live">● Live</span>
          </div>
          <div class="student-actions">
            <button class="action-btn">View details</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Currently Watching</div>
          <div class="lesson-subtitle">React Hooks - Introduction to useState</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill green" style="width: 45%"></div>
          </div>
          <div class="progress-text">Module 2 • Lesson 5 • 10:32 / 23:08</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">45%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">21/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">87%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">Now</div></div>
        </div>
      </div>
    `;
  } else if (course === 'javascript') {
    studentsHTML = `
      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">MJ</div>
            <div class="student-name-email">
              <h4>Mike Johnson</h4>
              <p>mike.johnson@email.com</p>
            </div>
            <span class="status-badge needs-help">Needs help</span>
          </div>
          <div class="student-actions">
            <button class="action-btn">Send message</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Stuck on</div>
          <div class="lesson-subtitle">JavaScript Async/Await Basics</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill yellow" style="width: 18%"></div>
          </div>
          <div class="progress-text">18% • Watched 3 times</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">28%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">13/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">58%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">1 day ago</div></div>
        </div>
      </div>
    `;
  } else if (course === 'react') {
    studentsHTML = `
      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">AJ</div>
            <div class="student-name-email">
              <h4>Alex Johnson</h4>
              <p>alex.johnson@email.com</p>
            </div>
            <span class="status-badge live">● Live</span>
          </div>
          <div class="student-actions">
            <button class="action-btn">View details</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Currently Watching</div>
          <div class="lesson-subtitle">React Hooks - Introduction to useState</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill green" style="width: 45%"></div>
          </div>
          <div class="progress-text">Module 2 • Lesson 5 • 10:32 / 23:08</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">45%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">21/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">87%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">Now</div></div>
        </div>
      </div>
    `;
  } else if (course === 'ui') {
    studentsHTML = `
      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">SM</div>
            <div class="student-name-email">
              <h4>Sarah Martinez</h4>
              <p>sarah.martinez@email.com</p>
            </div>
          </div>
          <div class="student-actions">
            <button class="action-btn">View details</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Last Watched</div>
          <div class="lesson-subtitle">CSS Grid Layout Advanced Techniques</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill green" style="width: 100%"></div>
          </div>
          <div class="progress-text">100% completed</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">78%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">37/47</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">92%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">30 ago</div></div>
        </div>
      </div>
    `;
  } else if (course === 'db') {
    studentsHTML = `
      <div class="student-progress-card">
        <div class="student-header">
          <div class="student-info-header">
            <div class="student-avatar-progress">TM</div>
            <div class="student-name-email">
              <h4>Tom Martinez</h4>
              <p>tom.martinez@email.com</p>
            </div>
          </div>
          <div class="student-actions">
            <button class="action-btn">View details</button>
          </div>
        </div>
        <div class="current-lesson">
          <div class="lesson-title">Last Watched</div>
          <div class="lesson-subtitle">SQL Joins and Relationships</div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill green" style="width: 82%"></div>
          </div>
          <div class="progress-text">82% completed</div>
        </div>
        <div class="progress-stats-row">
          <div class="stat-item"><div class="stat-label">Overall Progress</div><div class="stat-value">82%</div></div>
          <div class="stat-item"><div class="stat-label">Completed Lessons</div><div class="stat-value">28/34</div></div>
          <div class="stat-item"><div class="stat-label">Quiz Average</div><div class="stat-value">88%</div></div>
          <div class="stat-item"><div class="stat-label">Last Active</div><div class="stat-value">5h ago</div></div>
        </div>
      </div>
    `;
  }
  
  // Remove existing students
  section.querySelectorAll('.student-progress-card').forEach(card => card.remove());
  
  // Insert new students before the button
  if (btn) {
    btn.insertAdjacentHTML('beforebegin', studentsHTML);
  }
};

// Load more progress
window.loadMoreProgress = function() {
  const btn = document.querySelector('.show-more-progress-btn');
  const section = document.querySelector('.students-progress-section');
  
  if (!btn || !section) return;
  
  if (btn.dataset.loaded === 'true') {
    // Hide extra students
    document.querySelectorAll('.student-progress-card.extra').forEach(card => {
      card.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => card.remove(), 300);
    });
    btn.textContent = 'Show more';
    btn.dataset.loaded = 'false';
    return;
  }
  
  const newStudentsHTML = `
    <div class="student-progress-card extra" style="animation: slideIn 0.5s ease;">
      <div class="student-header">
        <div class="student-info-header">
          <div class="student-avatar-progress">TM</div>
          <div class="student-name-email">
            <h4>Tom Martinez</h4>
            <p>tom.martinez@email.com</p>
          </div>
        </div>
        <div class="student-actions">
          <button class="action-btn">View details</button>
        </div>
      </div>
      
      <div class="current-lesson">
        <div class="lesson-title">Last Watched</div>
        <div class="lesson-subtitle">Python Data Structures</div>
        <div class="lesson-progress-bar">
          <div class="lesson-progress-fill green" style="width: 94%"></div>
        </div>
        <div class="progress-text">94% completed</div>
      </div>
      
      <div class="progress-stats-row">
        <div class="stat-item">
          <div class="stat-label">Overall Progress</div>
          <div class="stat-value">94%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Completed Lessons</div>
          <div class="stat-value">44/47</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Quiz Average</div>
          <div class="stat-value">96%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Active</div>
          <div class="stat-value">2h ago</div>
        </div>
      </div>
    </div>
  `;
  
  btn.insertAdjacentHTML('beforebegin', newStudentsHTML);
  btn.textContent = 'Show less';
  btn.dataset.loaded = 'true';
};

// Open Students Analytics Page
window.openStudentsAnalytics = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('pages.studentsAnalytics'));
    contentArea.innerHTML = getStudentsAnalyticsHTML();
    updateActiveMenuItem('Students Analytics');
    
    // Apply saved primary color to Students Analytics page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    return;
  }
};

// Helper function to get students analytics HTML
function getStudentsAnalyticsHTML() {
  // Load students data immediately after rendering
  setTimeout(() => loadStudentsAnalytics(), 100);

  return `
    <div class="students-analytics-page">
      <style>
        .students-analytics-page {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .analytics-stat-card {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .analytics-stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-border-hover);
          background: rgba(58, 56, 56, 0.5);
        }
        .analytics-stat-title {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }
        .analytics-stat-value {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .students-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--primary-border);
        }
        .student-tab {
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: rgba(156, 163, 175, 1);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .student-tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        .student-tab:hover {
          color: #ffffff;
        }
        .students-list {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
        }
        .student-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(58, 56, 56, 0.5);
          border: 1px solid var(--primary-border-light);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }
        .student-item:hover {
          border-color: var(--border-color);
          background: rgba(58, 56, 56, 0.7);
          transform: translateX(4px);
        }
        .student-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
        }
        .student-details h4 {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .student-details p {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
        }
        .student-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: right;
        }
        .student-id {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 600;
          min-width: 60px;
        }
        .registration-date {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
          min-width: 100px;
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          color: #9CA3AF;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(126, 162, 212, 0.2);
          border-top: 3px solid #7ea2d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9CA3AF;
        }
        .empty-state svg {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        .show-all-students-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--primary-color);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 24px auto 0;
        }
        .show-all-students-btn:hover {
          background: var(--primary-light);
          border-color: var(--primary-border-strong);
        }
      </style>

      <!-- Statistics Cards -->
      <div class="analytics-stats-grid">
        <div class="analytics-stat-card">
          <div class="analytics-stat-title">Total Students</div>
          <div class="analytics-stat-value" id="total-students">-</div>
        </div>
        <div class="analytics-stat-card">
          <div class="analytics-stat-title">Active Students</div>
          <div class="analytics-stat-value" id="active-students">-</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="students-tabs">
        <button class="student-tab active" onclick="switchStudentTab(this, 'all')">All Students</button>
        <button class="student-tab" onclick="switchStudentTab(this, 'recent')">Recent</button>
      </div>

      <!-- Students List -->
      <div class="students-list">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>Loading students...</span>
        </div>
      </div>
    </div>
  `;
}

// Load students analytics data
window.loadStudentsAnalytics = async function() {
  try {
    const user = store.getState().user;
    if (!user || !user._id) {
      console.error('No user found in store');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    console.log('📊 Loading students analytics for teacher:', user._id);

    // Fetch students data from API
    const response = await fetch(`${config.api.baseUrl}/teachers/${user._id}/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📊 Students analytics response:', data);

    if (data.success) {
      updateStudentsAnalytics(data.data);
    } else {
      showStudentsError(data.message || 'Failed to load students');
    }
  } catch (error) {
    console.error('❌ Error loading students analytics:', error);
    showStudentsError('Failed to load students data');
  }
};

// Update students analytics UI
function updateStudentsAnalytics(data) {
  const students = data.students || [];

  // Update statistics
  updateStudentsStats(students);

  // Update students list
  updateStudentsList(students);
}

// Update statistics cards
function updateStudentsStats(students) {
  const totalElement = document.getElementById('total-students');
  const newElement = document.getElementById('new-students');
  const monthElement = document.getElementById('month-students');

  if (totalElement) totalElement.textContent = students.length;

  // Calculate students from this week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  // Calculate active students (status === 'active')
  const activeStudents = students.filter(student => student.status === 'active').length;

  const activeElement = document.getElementById('active-students');
  if (activeElement) activeElement.textContent = activeStudents;
}

// Update students list
function updateStudentsList(students) {
  const studentsList = document.querySelector('.students-list');
  if (!studentsList) return;

  // Store students data globally for tab switching
  window.allStudentsData = students;

  if (students.length === 0) {
    studentsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14l3-3 3 3 3-3 3 3Z"/>
          <path d="M8 7h8"/>
          <path d="M8 11h8"/>
          <path d="M8 15h5"/>
        </svg>
        <h3>No students yet</h3>
        <p>Students who register through your landing page will appear here</p>
      </div>
    `;
    return;
  }

  // Render students
  renderStudentsList(students);
}

// Render students list based on current tab
function renderStudentsList(students) {
  const studentsList = document.querySelector('.students-list');
  if (!studentsList) return;

  const studentsHTML = students.map(student => {
    // Create initials from first name and last name
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

    // Format registration date
    const regDate = new Date(student.registrationDate);
    const formattedDate = regDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Format phone number
    const formattedPhone = student.phone || 'N/A';

    return `
      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar" style="background: linear-gradient(135deg, #7EA2D4, #5A85C7);">${initials}</div>
          <div class="student-details">
            <h4>${student.fullName}</h4>
            <p>${formattedPhone}</p>
          </div>
        </div>
        <div class="student-meta">
          <div class="student-id">ID: ${student._id ? student._id.slice(-5) : (student.studentId ? student.studentId.slice(-5) : 'N/A')}</div>
          <div class="registration-date">${formattedDate}</div>
        </div>
      </div>
    `;
  }).join('');

  studentsList.innerHTML = studentsHTML;
}

// Show error state
function showStudentsError(message) {
  const studentsList = document.querySelector('.students-list');
  if (!studentsList) return;

  studentsList.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Error loading students</h3>
      <p>${message}</p>
    </div>
  `;

  // Reset stats to 0
  const totalElement = document.getElementById('total-students');
  const newElement = document.getElementById('new-students');
  const monthElement = document.getElementById('month-students');

  if (totalElement) totalElement.textContent = '0';
  if (newElement) newElement.textContent = '0';
  if (monthElement) monthElement.textContent = '0';
}

// Update switch student tab function to work with real data
window.switchStudentTab = function(button, type) {
  // Remove active from all tabs
  document.querySelectorAll('.student-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Add active to clicked tab
  button.classList.add('active');

  const students = window.allStudentsData || [];

  if (type === 'recent') {
    // Show recent students (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentStudents = students.filter(student =>
      new Date(student.registrationDate) >= thirtyDaysAgo
    ).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    renderStudentsList(recentStudents);
  } else {
    // Show all students
    renderStudentsList(students);
  }
};

// Switch student tab
window.switchStudentTab = function(button, type) {
  // Remove active from all tabs
  document.querySelectorAll('.student-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Add active to clicked tab
  button.classList.add('active');
  
  const studentsList = document.querySelector('.students-list');
  if (!studentsList) return;
  
  // Remove extra students if any
  document.querySelectorAll('.student-item.extra-student').forEach(s => s.remove());
  
  // Reset show more button
  const btn = document.querySelector('.show-all-students-btn');
  if (btn) {
    btn.textContent = 'Show more';
    btn.dataset.loaded = 'false';
  }
  
  let studentsHTML = '';
  
  if (type === 'all') {
    // All students
    studentsHTML = `
      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">JS</div>
          <div class="student-details">
            <h4>John Smith</h4>
            <p>5 courses • 45 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 85%"></div>
            </div>
          </div>
          <span class="progress-percent">85% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">AK</div>
          <div class="student-details">
            <h4>Alice Kim</h4>
            <p>3 courses • 32 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 62%"></div>
            </div>
          </div>
          <span class="progress-percent">62% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">TM</div>
          <div class="student-details">
            <h4>Tom Martinez</h4>
            <p>7 courses • 58 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 94%"></div>
            </div>
          </div>
          <span class="progress-percent">94% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">RL</div>
          <div class="student-details">
            <h4>Rachel Lee</h4>
            <p>4 courses • 38 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 47%"></div>
            </div>
          </div>
          <span class="progress-percent">47% Progress</span>
        </div>
      </div>
    `;
  } else if (type === 'active') {
    // Most active students - sorted by hours
    studentsHTML = `
      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">TM</div>
          <div class="student-details">
            <h4>Tom Martinez</h4>
            <p>7 courses • 58 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 94%"></div>
            </div>
          </div>
          <span class="progress-percent">94% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">EW</div>
          <div class="student-details">
            <h4>Emma Wilson</h4>
            <p>6 courses • 52 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 91%"></div>
            </div>
          </div>
          <span class="progress-percent">91% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">JS</div>
          <div class="student-details">
            <h4>John Smith</h4>
            <p>5 courses • 45 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 85%"></div>
            </div>
          </div>
          <span class="progress-percent">85% Progress</span>
        </div>
      </div>

      <div class="student-item">
        <div class="student-info">
          <div class="student-avatar">LA</div>
          <div class="student-details">
            <h4>Lisa Anderson</h4>
            <p>5 courses • 42 hours</p>
          </div>
        </div>
        <div class="student-progress">
          <div class="progress-bar-container">
            <div class="progress-label">Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 78%"></div>
            </div>
          </div>
          <span class="progress-percent">78% Progress</span>
        </div>
      </div>
    `;
  }
  
  // Find the button and insert students before it
  const showMoreBtn = studentsList.querySelector('.show-all-students-btn');
  if (showMoreBtn) {
    // Remove all existing student items
    studentsList.querySelectorAll('.student-item').forEach(item => item.remove());
    // Insert new students
    showMoreBtn.insertAdjacentHTML('beforebegin', studentsHTML);
  }
};

// Load more students
window.loadMoreStudents = function() {
  const btn = document.querySelector('.show-all-students-btn');
  const studentsList = document.querySelector('.students-list');
  
  if (!btn || !studentsList) return;
  
  // Check if already loaded
  if (btn.dataset.loaded === 'true') {
    // Hide extra students
    const extraStudents = document.querySelectorAll('.student-item.extra-student');
    extraStudents.forEach(student => {
      student.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => student.remove(), 300);
    });
    
    // Change button back
    btn.textContent = 'Show more';
    btn.dataset.loaded = 'false';
    return;
  }
  
  // New students data
  const newStudents = [
    { name: 'Sarah Johnson', initials: 'SJ', courses: 3, hours: 28, progress: 72 },
    { name: 'Mike Davis', initials: 'MD', courses: 4, hours: 35, progress: 68 },
    { name: 'Emma Wilson', initials: 'EW', courses: 6, hours: 52, progress: 91 },
    { name: 'David Brown', initials: 'DB', courses: 2, hours: 18, progress: 55 },
    { name: 'Lisa Anderson', initials: 'LA', courses: 5, hours: 42, progress: 78 }
  ];
  
  // Create HTML for new students
  const newStudentsHTML = newStudents.map(student => `
    <div class="student-item extra-student" style="animation: slideIn 0.5s ease;">
      <div class="student-info">
        <div class="student-avatar">${student.initials}</div>
        <div class="student-details">
          <h4>${student.name}</h4>
          <p>${student.courses} courses • ${student.hours} hours</p>
        </div>
      </div>
      <div class="student-progress">
        <div class="progress-bar-container">
          <div class="progress-label">Progress</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${student.progress}%"></div>
          </div>
        </div>
        <span class="progress-percent">${student.progress}% Progress</span>
      </div>
    </div>
  `).join('');
  
  // Insert new students before the button
  btn.insertAdjacentHTML('beforebegin', newStudentsHTML);
  
  // Change button text
  btn.textContent = 'Show less';
  btn.dataset.loaded = 'true';
};

// Open Rating & Comments Page
window.openRatingComments = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    updatePageTitle(t('pages.ratingComments'));
    contentArea.innerHTML = getRatingCommentsHTML();
    updateActiveMenuItem('Rating Comments');
    
    // Apply saved primary color to Rating Comments page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    return;
  }
};

// Helper function to get rating comments HTML
function getRatingCommentsHTML() {
  return `
    <div class="rating-comments-page">
      <style>
        .rating-comments-page {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .rating-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .rating-stat-card {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .rating-stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-border-hover);
          background: rgba(58, 56, 56, 0.5);
        }
        .rating-stat-title {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }
        .rating-stat-value {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .rating-stars {
          color: #fbbf24;
          font-size: 20px;
          margin-bottom: 8px;
        }
        .rating-stat-subtitle {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
        }
        .rating-stat-change {
          color: #10b981;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }
        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .distribution-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .distribution-label {
          color: #fbbf24;
          font-size: 14px;
          min-width: 30px;
        }
        .distribution-progress {
          flex: 1;
          height: 8px;
          background: rgba(58, 56, 56, 0.5);
          border-radius: 4px;
          overflow: hidden;
        }
        .distribution-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .distribution-percent {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
          min-width: 35px;
          text-align: right;
        }
        .reviews-section {
          background: rgba(58, 56, 56, 0.3);
          border: 1px solid var(--primary-border);
          border-radius: 16px;
          padding: 24px;
        }
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .reviews-title {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }
        .review-card {
          background: rgba(58, 56, 56, 0.5);
          border: 1px solid var(--primary-border-light);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }
        .review-card:hover {
          border-color: var(--border-color);
          background: rgba(58, 56, 56, 0.7);
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .review-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .review-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(126, 162, 212, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
        }
        .review-user-info {
          display: flex;
          flex-direction: column;
        }
        .review-user-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }
        .review-course {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
        }
        .review-rating-date {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .review-rating {
          color: #fbbf24;
          font-size: 16px;
          font-weight: 600;
        }
        .review-date {
          color: rgba(156, 163, 175, 1);
          font-size: 12px;
        }
        .review-text {
          color: rgba(229, 231, 235, 1);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .review-verified {
          color: #10b981;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .show-all-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--primary-color);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 24px auto 0;
        }
        .show-all-btn:hover {
          background: var(--primary-light);
          border-color: var(--primary-border-strong);
        }
      </style>

      <!-- Rating Statistics -->
      <div class="rating-stats-grid">
        <!-- Overall Rating -->
        <div class="rating-stat-card">
          <div class="rating-stat-title">Overall rating</div>
          <div class="rating-stat-value">4.9</div>
          <div class="rating-stars">★★★★★</div>
          <div class="rating-stat-subtitle">324 reviews</div>
        </div>

        <!-- Distribution -->
        <div class="rating-stat-card">
          <div class="rating-stat-title">Distribution</div>
          <div class="distribution-bars">
            <div class="distribution-bar">
              <span class="distribution-label">5★</span>
              <div class="distribution-progress">
                <div class="distribution-fill" style="width: 89%"></div>
              </div>
              <span class="distribution-percent">89%</span>
            </div>
            <div class="distribution-bar">
              <span class="distribution-label">4★</span>
              <div class="distribution-progress">
                <div class="distribution-fill" style="width: 11%"></div>
              </div>
              <span class="distribution-percent">11%</span>
            </div>
            <div class="distribution-bar">
              <span class="distribution-label">3★</span>
              <div class="distribution-progress">
                <div class="distribution-fill" style="width: 0%"></div>
              </div>
              <span class="distribution-percent">0%</span>
            </div>
            <div class="distribution-bar">
              <span class="distribution-label">2★</span>
              <div class="distribution-progress">
                <div class="distribution-fill" style="width: 0%"></div>
              </div>
              <span class="distribution-percent">0%</span>
            </div>
            <div class="distribution-bar">
              <span class="distribution-label">1★</span>
              <div class="distribution-progress">
                <div class="distribution-fill" style="width: 0%"></div>
              </div>
              <span class="distribution-percent">0%</span>
            </div>
          </div>
        </div>

        <!-- New This Week -->
        <div class="rating-stat-card">
          <div class="rating-stat-title">New This Week</div>
          <div class="rating-stat-value">+0.2</div>
          <div class="rating-stat-change">↑ This month</div>
        </div>
      </div>

      <!-- Recent Reviews -->
      <div class="reviews-section">
        <div class="reviews-header">
          <h3 class="reviews-title">Recent Reviews</h3>
        </div>

        <!-- Review Card 1 -->
        <div class="review-card">
          <div class="review-header">
            <div class="review-user">
              <div class="review-avatar">JS</div>
              <div class="review-user-info">
                <div class="review-user-name">John Smith</div>
                <div class="review-course">React Masterclass • Oct 15</div>
              </div>
            </div>
            <div class="review-rating-date">
              <span class="review-rating">5.0 ★★★★★</span>
            </div>
          </div>
          <p class="review-text">"Absolutely amazing course! The explanations are crystal clear. Highly recommended! 🚀"</p>
          <div class="review-verified">✓ Verified</div>
        </div>

        <!-- Review Card 2 -->
        <div class="review-card">
          <div class="review-header">
            <div class="review-user">
              <div class="review-avatar">JS</div>
              <div class="review-user-info">
                <div class="review-user-name">John Smith</div>
                <div class="review-course">React Masterclass • Oct 15</div>
              </div>
            </div>
            <div class="review-rating-date">
              <span class="review-rating">5.0 ★★★★★</span>
            </div>
          </div>
          <p class="review-text">"Absolutely amazing course! The explanations are crystal clear. Highly recommended! 🚀"</p>
          <div class="review-verified">✓ Verified</div>
        </div>

        <!-- Review Card 3 -->
        <div class="review-card">
          <div class="review-header">
            <div class="review-user">
              <div class="review-avatar">JS</div>
              <div class="review-user-info">
                <div class="review-user-name">John Smith</div>
                <div class="review-course">React Masterclass • Oct 15</div>
              </div>
            </div>
            <div class="review-rating-date">
              <span class="review-rating">5.0 ★★★★★</span>
            </div>
          </div>
          <p class="review-text">"Absolutely amazing course! The explanations are crystal clear. Highly recommended! 🚀"</p>
          <div class="review-verified">✓ Verified</div>
        </div>

        <button class="show-all-btn" onclick="loadMoreReviews()">Show all</button>
      </div>
    </div>
  `;
}

// Load more reviews function
window.loadMoreReviews = function() {
  const reviewsSection = document.querySelector('.reviews-section');
  const showAllBtn = document.querySelector('.show-all-btn');
  
  if (!reviewsSection || !showAllBtn) return;
  
  // Check if already loaded
  if (showAllBtn.dataset.loaded === 'true') {
    // Hide extra reviews
    const extraReviews = document.querySelectorAll('.review-card.extra-review');
    extraReviews.forEach(review => {
      review.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => review.remove(), 300);
    });
    
    // Change button back
    showAllBtn.textContent = 'Show all';
    showAllBtn.dataset.loaded = 'false';
    return;
  }
  
  // Additional reviews data
  const newReviews = [
    {
      name: 'Sarah Johnson',
      initials: 'SJ',
      course: 'Python Basics',
      date: 'Oct 12',
      rating: 5.0,
      text: 'Great course! Very well structured and easy to follow. The instructor explains everything perfectly! 👍',
      verified: true
    },
    {
      name: 'Mike Davis',
      initials: 'MD',
      course: 'UI/UX Design',
      date: 'Oct 10',
      rating: 4.8,
      text: 'Excellent content and practical examples. Learned a lot about design principles and best practices.',
      verified: true
    },
    {
      name: 'Emma Wilson',
      initials: 'EW',
      course: 'JavaScript Advanced',
      date: 'Oct 8',
      rating: 5.0,
      text: 'This course exceeded my expectations! The projects are challenging and really help solidify the concepts. 💯',
      verified: true
    },
    {
      name: 'David Brown',
      initials: 'DB',
      course: 'React Masterclass',
      date: 'Oct 5',
      rating: 4.9,
      text: 'Amazing instructor! Clear explanations and great real-world examples. Highly recommend!',
      verified: true
    }
  ];
  
  // Create HTML for new reviews
  const newReviewsHTML = newReviews.map(review => `
    <div class="review-card extra-review" style="animation: slideIn 0.5s ease;">
      <div class="review-header">
        <div class="review-user">
          <div class="review-avatar">${review.initials}</div>
          <div class="review-user-info">
            <div class="review-user-name">${review.name}</div>
            <div class="review-course">${review.course} • ${review.date}</div>
          </div>
        </div>
        <div class="review-rating-date">
          <span class="review-rating">${review.rating} ★★★★★</span>
        </div>
      </div>
      <p class="review-text">"${review.text}"</p>
      ${review.verified ? '<div class="review-verified">✓ Verified</div>' : ''}
    </div>
  `).join('');
  
  // Insert new reviews before the button
  showAllBtn.insertAdjacentHTML('beforebegin', newReviewsHTML);
  
  // Change button text
  showAllBtn.textContent = 'Show less';
  showAllBtn.dataset.loaded = 'true';
  
  // Add animations
  if (!document.getElementById('review-animations')) {
    const style = document.createElement('style');
    style.id = 'review-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Helper function to get messages HTML
function getMessagesHTML() {
  return `
    <div class="messages-container">
      <!-- Simple Messages Interface -->
      <div class="messages-welcome">
        <div class="messages-header">
          <h3>${t('messages.title')}</h3>
          <button class="create-group-btn" onclick="createGroup()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            ${t('messages.createGroup')}
          </button>
        </div>

        <div class="messages-placeholder">
          <div class="placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>${t('messages.selectChat')}</h3>
          <p>${t('messages.chooseConversation')}</p>
        </div>
      </div>
    </div>
  `;
}

// Helper function to get edit profile HTML
function getEditProfileHTML(user) {
  console.log('getEditProfileHTML called with user bio:', user.bio); // Debug log
  return `
    <form class="edit-profile-form" id="editProfileForm">
      <!-- Personal Information Section -->
      <div class="profile-section">
        <h3 class="section-title">${t('editProfile.personalInfo')}</h3>

        <!-- Profile Picture -->
        <div class="profile-picture-section">
          <label class="field-label">${t('editProfile.profilePicture')}</label>
          <input type="hidden" name="profileImage" id="profileImageUrl" value="${user.profileImage || ''}" />
          <input type="file" id="profileImageInput" accept="image/*" style="display: none;" />
          <div class="profile-picture-upload" onclick="document.getElementById('profileImageInput').click()" style="cursor: pointer;">
            <div class="profile-picture-preview" id="profilePicturePreview">
              ${user.profileImage
                ? `<img src="${user.profileImage}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
                : `<svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                   </svg>`}
            </div>
            <div class="upload-instructions">
              <p style="margin: 0; font-weight: 500; color: #7ea2d4;">${t('editProfile.uploadPhoto') || 'Upload Photo'}</p>
              <small style="color: rgba(255,255,255,0.6);">${t('editProfile.uploadHint') || 'JPG, PNG or GIF. Max 5MB'}</small>
            </div>
          </div>
        </div>

        <!-- Name Fields -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">${t('editProfile.firstName')}</label>
            <input type="text" class="form-input" name="firstName" value="${user.firstName || ''}" required />
          </div>
          <div class="form-field">
            <label class="field-label">${t('editProfile.lastName')}</label>
            <input type="text" class="form-input" name="lastName" value="${user.lastName || ''}" required />
          </div>
        </div>

        <!-- Professional Title -->
        <div class="form-field">
          <label class="field-label">${t('editProfile.professionalTitle')}</label>
          <input type="text" class="form-input" name="specialization" value="${user.specialization || ''}" />
        </div>

        <!-- Bio -->
        <div class="form-field">
          <label class="field-label">${t('editProfile.bio')}</label>
          <textarea class="form-textarea" name="bio" rows="4">${user.bio || ''}</textarea>
        </div>

        <!-- Location -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">${t('editProfile.city')}</label>
            <input type="text" class="form-input" name="city" value="${user.city || ''}" />
          </div>
          <div class="form-field">
            <label class="field-label">${t('editProfile.country')}</label>
            <input type="text" class="form-input" name="country" value="${user.country || ''}" />
          </div>
        </div>
      </div>

      <!-- Contact Information Section -->
      <div class="profile-section">
        <h3 class="section-title">${t('editProfile.contactInfo')}</h3>

        <div class="form-field">
          <label class="field-label">${t('editProfile.emailAddress')}</label>
          <input type="email" class="form-input" name="email" value="${user.email || ''}" required />
        </div>

        <div class="form-field">
          <label class="field-label">${t('editProfile.phoneNumber')}</label>
          <input type="tel" class="form-input" name="phone" value="${user.phone || ''}" />
        </div>

        <div class="form-field">
          <label class="field-label">${t('editProfile.telegramUsername')}</label>
          <input type="text" class="form-input" name="telegramUsername" value="${user.telegramUsername || ''}" />
        </div>
      </div>

      <!-- Save Button -->
      <div class="form-actions">
        <button type="submit" class="btn-save-profile">${t('editProfile.saveChanges')}</button>
        <button type="button" class="btn-cancel-profile" onclick="backToDashboard()">${t('editProfile.cancel')}</button>
      </div>
    </form>
  `;
}

// Menu toggle function (accordion style - close others when opening one)
window.toggleMenu = function(menuName) {
  const allMenus = ['general', 'content', 'ai', 'analytics', 'rolls', 'settings'];
  const children = document.getElementById(menuName + '-children');
  const arrow = document.getElementById(menuName + '-arrow');
  const parent = arrow.parentElement;

  // Check if this menu is currently open
  const isCurrentlyOpen = !children.classList.contains('hidden');

  // Close all menus first and remove expanded class
  allMenus.forEach(menu => {
    const menuChildren = document.getElementById(menu + '-children');
    const menuArrow = document.getElementById(menu + '-arrow');
    const menuParent = menuArrow ? menuArrow.parentElement : null;

    if (menuChildren && menuArrow && menuParent) {
      menuChildren.classList.add('hidden');
      // Arrow stays the same - no rotation
      menuParent.classList.remove('expanded');
    }
  });

  // If the clicked menu was closed, open it
  if (isCurrentlyOpen) {
    // Keep it closed (it was open, now we closed all, so leave it closed)
    children.classList.add('hidden');
    // Arrow stays the same - no rotation
    parent.classList.remove('expanded');
  } else {
    // Open the clicked menu
    children.classList.remove('hidden');
    // Arrow stays the same - no rotation
    parent.classList.add('expanded');
  }
};

// Set active menu child - DON'T reload page, just update active state
window.setActiveChild = function(element, event) {
  // Prevent default link behavior
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Remove active from all menu children
  document.querySelectorAll('.figma-menu-child').forEach(child => {
    child.classList.remove('active');
  });

  // Add active to clicked element
  element.classList.add('active');

  // Don't navigate or reload - let the onclick handler do its job
  return false;
};

// Back to dashboard function
window.backToDashboard = function() {
  console.log('🔙 Going back to dashboard');
  
  // Make sure user data is in sessionStorage before reload
  const currentUser = store.getState().user;
  if (currentUser) {
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('💾 User data saved before reload:', currentUser);
  }
  
  // Reload dashboard to show updated data
  location.reload();
};

// Load main dashboard content (without reloading entire page)
window.loadMainDashboard = async function() {
  const contentArea = document.querySelector('.figma-content-area');
  const user = store.getState().user;

  if (!contentArea || !user) return;

  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = t('dashboard.title');
  }

  // Enable API call to load real dashboard data
  const useStaticData = false;

  if (useStaticData) {
    // Show static dashboard content directly
    contentArea.innerHTML = `
      <!-- Profile Section -->
      <div class="figma-profile-section">
        <div class="figma-profile-avatar">
          <div class="figma-avatar-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <div class="figma-profile-info">
          <h2 class="figma-profile-name">${user.firstName} ${user.lastName}</h2>
          <p class="figma-profile-title">${t('profile.title')}</p>
          <p class="figma-profile-location">${t('profile.location')}</p>
          <div class="figma-profile-rating">
            <div class="figma-stars">
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="figma-rating-text">${t('profile.rating')}</span>
            <span class="figma-joined">${t('profile.joined')}</span>
          </div>
        </div>
        <div class="figma-profile-buttons">
          <button class="figma-profile-btn" onclick="loadProfileContent()">${t('dashboard.profile.editProfile')}</button>
          <button class="figma-profile-btn" onclick="loadCustomizeUIContent()">${t('dashboard.profile.customizeUI')}</button>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="figma-stats-grid">
        <!-- My Statistics Card -->
        <div class="figma-stats-card">
          <h3 class="figma-stats-title">${t('stats.myStatistics')}</h3>
          <div class="figma-stats-list">
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.activeCourses')}</span>
              <span class="figma-stat-value">8</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.totalStudents')}</span>
              <span class="figma-stat-value">1111</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.totalRevenue')}</span>
              <span class="figma-stat-value">$12,460</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.avgRating')}</span>
              <span class="figma-stat-value">4.9/5</span>
            </div>
          </div>
        </div>

        <!-- Achievements Card -->
        <div class="figma-stats-card">
          <h3 class="figma-stats-title">${t('stats.achievements')}</h3>
          <div class="figma-achievements-list">
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.topInstructor')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.students1000')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.revenue10k')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.highRating')}</span>
            </div>
          </div>
        </div>

        <!-- Bio & Specialties Card -->
        <div class="figma-stats-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 class="figma-stats-title">Bio & About Me</h3>
            <button class="edit-bio-btn" onclick="editBio()" style="background: none; border: 1px solid #7ea2d4; color: #7ea2d4; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.edit')}</button>
          </div>
          <p class="figma-bio-text" id="bioText">${t('profile.bioDefault')}</p>
          <div id="bioEditor" style="display: none;">
            <textarea id="bioTextarea" style="width: 100%; background: rgba(20, 20, 20, 0.8); border-radius: 8px; padding: 12px; color: #ffffff; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;" rows="4"></textarea>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <button onclick="saveBio()" style="background: #7ea2d4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.save')}</button>
              <button onclick="cancelBioEdit()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.cancel')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    return; // Exit early, skip API call
  }

  // Show loading state (only if not using static data)
  contentArea.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div style="text-align: center; color: rgba(255,255,255,0.7);">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(126,162,212,0.3); border-top: 3px solid #7ea2d4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  `;

  try {
    // Get dashboard data from API
    const dashboardData = await apiService.getTeacherDashboard(user._id);

    if (dashboardData.success) {
      const { overview, growth, teacher } = dashboardData.data;

      // Debug: Log the actual data structure
      console.log('📊 Dashboard data breakdown:', {
        overview: overview,
        growth: growth,
        teacher: {
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          ratingAverage: teacher.ratingAverage,
          profileImage: teacher.profileImage
        }
      });
      
      // Update stats in the initial render
      const statsLoading = document.getElementById('stats-loading');
      if (statsLoading) {
        statsLoading.innerHTML = `
          <div class="figma-stat-row">
            <span class="figma-stat-label">${t('stats.activeCourses')}</span>
            <span class="figma-stat-value">${overview.activeCourses || 0}</span>
          </div>
          <div class="figma-stat-row">
            <span class="figma-stat-label">${t('stats.totalStudents')}</span>
            <span class="figma-stat-value">${overview.totalStudents || 0}</span>
          </div>
          <div class="figma-stat-row">
            <span class="figma-stat-label">${t('stats.totalRevenue')}</span>
            <span class="figma-stat-value">$${overview.totalRevenue ? overview.totalRevenue.toLocaleString() : '0'}</span>
          </div>
          <div class="figma-stat-row">
            <span class="figma-stat-label">${t('stats.avgRating')}</span>
            <span class="figma-stat-value">${teacher.ratingAverage ? teacher.ratingAverage.toFixed(1) : '0'}/5</span>
          </div>
        `;
      }

      // Generate star rating HTML
      const generateStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < 5; i++) {
          if (i < fullStars) {
            starsHTML += `<svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`;
          } else if (i === fullStars && hasHalfStar) {
            starsHTML += `<svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stop-color="#ffd700"/>
                  <stop offset="50%" stop-color="transparent"/>
                </linearGradient>
              </defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half-star)"/>
            </svg>`;
          } else {
            starsHTML += `<svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`;
          }
        }
        return starsHTML;
      };

      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
          style: 'currency',
          currency: 'UZS'
        }).format(amount);
      };

      // Load main dashboard content with real data
      contentArea.innerHTML = `
        <!-- Profile Section -->
        <div class="figma-profile-section">
          <div class="figma-profile-avatar">
            <div class="figma-avatar-circle">
              ${teacher.profileImage
                ? `<img src="${teacher.profileImage}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
                : `<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                   </svg>`
              }
            </div>
          </div>
          <div class="figma-profile-info">
            <h2 class="figma-profile-name">${teacher.firstName} ${teacher.lastName}</h2>
            <p class="figma-profile-title">${teacher.specialization || ''}</p>
            <p class="figma-profile-location">${teacher.city && teacher.country ? `${teacher.city}, ${teacher.country}` : ''}</p>
            <div class="figma-profile-rating">
              <div class="figma-stars">
                ${generateStars(overview.averageRating)}
              </div>
              <span class="figma-rating-text">${overview.averageRating.toFixed(1)}/5 (${teacher.reviewsCount} reviews)</span>
              <span class="figma-joined">${t('profile.joined')}</span>
            </div>
          </div>
          <div class="figma-profile-buttons">
            <button class="figma-profile-btn" onclick="openEditProfile()">${t('dashboard.profile.editProfile')}</button>
            <button class="figma-profile-btn" onclick="customizeUI()">${t('dashboard.profile.customizeUI')}</button>
          </div>
        </div>

        <!-- Stats Cards Grid -->
        <div class="figma-stats-grid" style="grid-template-columns: repeat(2, 1fr);">
          <!-- My Statistics Card -->
          <div class="figma-stats-card">
            <h3 class="figma-stats-title">${t('stats.myStatistics')}</h3>
            <div class="figma-stats-list">
              <div class="figma-stat-row">
                <span class="figma-stat-label">${t('stats.activeCourses')}</span>
                <span class="figma-stat-value">${overview.activeCourses || 0}</span>
              </div>
              <div class="figma-stat-row">
                <span class="figma-stat-label">${t('stats.totalStudents')}</span>
                <span class="figma-stat-value">${overview.totalStudents || 0}</span>
              </div>
              <div class="figma-stat-row">
                <span class="figma-stat-label">${t('stats.totalRevenue')}</span>
                <span class="figma-stat-value">${formatCurrency(overview.totalRevenue || 0)}</span>
              </div>
              <div class="figma-stat-row">
                <span class="figma-stat-label">${t('stats.avgRating')}</span>
                <span class="figma-stat-value">${(overview.averageRating || 0).toFixed(1)}/5</span>
              </div>
              <div class="figma-stat-row">
                <span class="figma-stat-label">Current Balance</span>
                <span class="figma-stat-value" style="color: #4ade80;">${formatCurrency(overview.currentBalance || 0)}</span>
              </div>
            </div>
          </div>

          <!-- Bio & About Me Card -->
          <div class="figma-stats-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 class="figma-stats-title">Bio & About Me</h3>
              <button class="edit-bio-btn" onclick="editBio()" style="background: none; border: 1px solid #7ea2d4; color: #7ea2d4; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.edit')}</button>
            </div>
            <p class="figma-bio-text" id="bioText">${teacher.bio || ''}</p>
            <div id="bioEditor" style="display: none;">
              <textarea id="bioTextarea" style="width: 100%; background: rgba(20, 20, 20, 0.8); border-radius: 8px; padding: 12px; color: #ffffff; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;" rows="4"></textarea>
              <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button onclick="saveBio()" style="background: #7ea2d4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.save')}</button>
                <button onclick="cancelBioEdit()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Store dashboard data globally for other functions
      window.currentDashboardData = dashboardData.data;

      // 🔄 SYNC FRESH TEACHER DATA TO STORE
      // This is crucial for Edit Profile to have latest data
      const currentUser = store.getState().user;
      const updatedUser = {
        ...currentUser,
        bio: teacher.bio,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.specialization,
        city: teacher.city,
        country: teacher.country,
        profileImage: teacher.profileImage
      };

      store.setState({ user: updatedUser });

      console.log('🔄 Synced teacher data to store:', {
        oldBio: currentUser.bio,
        newBio: teacher.bio,
        updatedUser: updatedUser
      });

    } else {
      throw new Error(dashboardData.message || 'Failed to load dashboard data');
    }

  } catch (error) {
    console.error('❌ Dashboard loading error in loadMainDashboard:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    console.error('🆔 Teacher ID:', user._id);
    console.error('🔐 Token exists:', !!localStorage.getItem('accessToken'));
    console.error('🌐 API Base URL:', config.api.baseUrl);

    // Show specific error types to user
    if (error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error - Check if backend is running at:', config.api.baseUrl);
    } else if (error.message.includes('401') || error.message.includes('Invalid token')) {
      console.error('🔐 Authentication error - Token might be invalid or expired');
      // Optionally redirect to login
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    } else if (error.message.includes('403')) {
      console.error('🚫 Permission denied - User might not have access to this dashboard');
    }

    console.error('📊 Loading fallback dashboard...');

    // Show static dashboard data as fallback
    contentArea.innerHTML = `
      <!-- Profile Section -->
      <div class="figma-profile-section">
        <div class="figma-profile-avatar">
          <div class="figma-avatar-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <div class="figma-profile-info">
          <h2 class="figma-profile-name">${user.firstName} ${user.lastName}</h2>
          <p class="figma-profile-title">${t('profile.title')}</p>
          <p class="figma-profile-location">${t('profile.location')}</p>
          <div class="figma-profile-rating">
            <div class="figma-stars">
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="figma-rating-text">${t('profile.rating')}</span>
            <span class="figma-joined">${t('profile.joined')}</span>
          </div>
        </div>
        <div class="figma-profile-buttons">
          <button class="figma-profile-btn" onclick="loadProfileContent()">${t('dashboard.profile.editProfile')}</button>
          <button class="figma-profile-btn" onclick="loadCustomizeUIContent()">${t('dashboard.profile.customizeUI')}</button>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="figma-stats-grid">
        <!-- My Statistics Card -->
        <div class="figma-stats-card">
          <h3 class="figma-stats-title">${t('stats.myStatistics')}</h3>
          <div class="figma-stats-list">
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.activeCourses')}</span>
              <span class="figma-stat-value">8</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.totalStudents')}</span>
              <span class="figma-stat-value">1111</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.totalRevenue')}</span>
              <span class="figma-stat-value">$12,460</span>
            </div>
            <div class="figma-stat-row">
              <span class="figma-stat-label">${t('stats.avgRating')}</span>
              <span class="figma-stat-value">4.9/5</span>
            </div>
          </div>
        </div>

        <!-- Achievements Card -->
        <div class="figma-stats-card">
          <h3 class="figma-stats-title">${t('stats.achievements')}</h3>
          <div class="figma-achievements-list">
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.topInstructor')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.students1000')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.revenue10k')}</span>
            </div>
            <div class="figma-achievement-item">
              <span class="figma-achievement-check">✓</span>
              <span class="figma-achievement-text">${t('stats.highRating')}</span>
            </div>
          </div>
        </div>

        <!-- Bio & Specialties Card -->
        <div class="figma-stats-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 class="figma-stats-title">Bio & About Me</h3>
            <button class="edit-bio-btn" onclick="editBio()" style="background: none; border: 1px solid #7ea2d4; color: #7ea2d4; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.edit')}</button>
          </div>
          <p class="figma-bio-text" id="bioText">${t('profile.bioDefault')}</p>
          <div id="bioEditor" style="display: none;">
            <textarea id="bioTextarea" style="width: 100%; background: rgba(20, 20, 20, 0.8); border-radius: 8px; padding: 12px; color: #ffffff; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;" rows="4"></textarea>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <button onclick="saveBio()" style="background: #7ea2d4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.save')}</button>
              <button onclick="cancelBioEdit()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">${t('stats.cancel')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

// Bio editing functions
window.editBio = function() {
  const bioText = document.getElementById('bioText');
  const bioEditor = document.getElementById('bioEditor');
  const bioTextarea = document.getElementById('bioTextarea');
  const user = store.getState().user;

  if (bioText && bioEditor && bioTextarea) {
    // Use the actual user bio, not the display text which might have placeholder
    bioTextarea.value = user.bio || '';
    bioText.style.display = 'none';
    bioEditor.style.display = 'block';
    bioTextarea.focus();
  }
};

window.saveBio = async function() {
  console.log('🔧 saveBio function called!'); // Debug log

  const bioText = document.getElementById('bioText');
  const bioEditor = document.getElementById('bioEditor');
  const bioTextarea = document.getElementById('bioTextarea');
  const user = store.getState().user;

  console.log('🔍 Elements found:', { bioText: !!bioText, bioEditor: !!bioEditor, bioTextarea: !!bioTextarea, user: !!user }); // Debug log

  if (user) {
    console.log('👤 User details:', { id: user._id, name: user.name, role: user.role });
  }

  if (!bioText || !bioEditor || !bioTextarea || !user) {
    console.error('❌ Missing required elements or user');
    return;
  }

  try {
    const newBio = bioTextarea.value.trim();
    console.log('📝 Saving bio:', newBio); // Debug log

    // Check if we have auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Auth token exists:', !!token);
    if (token) {
      console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    }

    // Check API base URL
    console.log('🌐 API base URL:', apiService.baseURL);
    console.log('🔗 Full API endpoint:', `${apiService.baseURL}/teachers/${user._id}`);

    // Update via API
    console.log('🚀 Making API call to update teacher profile...'); // Debug log
    const result = await apiService.updateTeacherProfile(user._id, {
      bio: newBio
    });

    console.log('📋 API response:', result); // Debug log

    if (result && result.success) {
      // Update local state
      const updatedUser = { ...user, bio: newBio };
      store.setState({
        user: updatedUser
      });

      console.log('🔄 Updated store state with bio:', {
        oldBio: user.bio,
        newBio: newBio,
        updatedUser: updatedUser
      });

      // Update UI
      bioText.textContent = newBio || 'No bio added yet. Click Edit to add your bio.';
      bioText.style.display = 'block';
      bioEditor.style.display = 'none';

      console.log('✅ Bio updated successfully in local state');
      showSuccessToast('Bio updated successfully!');
    } else {
      throw new Error(result?.message || 'Failed to update bio');
    }
  } catch (error) {
    console.error('❌ Bio update error:', error);
    console.error('❌ Error stack:', error.stack);
    showErrorToast(error.message || 'Failed to update bio');
  }
};

window.cancelBioEdit = function() {
  const bioText = document.getElementById('bioText');
  const bioEditor = document.getElementById('bioEditor');
  
  if (bioText && bioEditor) {
    bioText.style.display = 'block';
    bioEditor.style.display = 'none';
  }
};

// Handle image upload
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showErrorToast(t('editProfile.fileTooLarge') || 'File size too large. Max 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showErrorToast(t('editProfile.invalidFileType') || 'Invalid file type. Only images allowed');
    return;
  }

  try {
    // Show loading
    const preview = document.getElementById('profilePicturePreview');
    preview.innerHTML = '<div style="width: 40px; height: 40px; border: 3px solid rgba(126,162,212,0.3); border-top: 3px solid #7ea2d4; border-radius: 50%; animation: spin 1s linear infinite;"></div>';

    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Update preview
      preview.innerHTML = `<img src="${data.url}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
      
      // Update hidden input
      document.getElementById('profileImageUrl').value = data.url;
      
      showSuccessToast(t('editProfile.imageUploaded') || 'Image uploaded successfully');
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Image upload error:', error);
    showErrorToast(t('editProfile.uploadFailed') || 'Image upload failed');
    
    // Restore previous image
    const user = store.getState().user;
    const preview = document.getElementById('profilePicturePreview');
    preview.innerHTML = user.profileImage 
      ? `<img src="${user.profileImage}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
      : `<svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
  }
}

// Handle profile save
async function handleProfileSave(e) {
  e.preventDefault();
  const user = store.getState().user;

  if (!user) {
    showErrorToast('User not found');
    return;
  }

  // Show loading state
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Saving...';
  submitButton.disabled = true;

  try {
    // Collect form data
    const formData = new FormData(e.target);
    const profileData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      specialization: formData.get('specialization'),
      bio: formData.get('bio'),
      city: formData.get('city'),
      country: formData.get('country'),
      profileImage: formData.get('profileImage') || ''
    };

    console.log('📝 Profile data collected from form:', profileData);

    // Remove empty fields
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === null || profileData[key] === undefined || profileData[key] === '') {
        delete profileData[key];
      }
    });

    console.log('📤 Sending profile update to API:', profileData);
    console.log('👤 User ID:', user._id);

    // Update profile via API
    console.log('🌐 Making API request to:', `/teachers/${user._id}`);
    const result = await apiService.updateTeacherProfile(user._id, profileData);
    console.log('✅ API Response:', result);
    console.log('✅ Updated teacher data:', result.teacher);

    if (result.success) {
      const updatedUser = { ...user, ...result.teacher };
      
      console.log('💾 Updating user state:', updatedUser);
      
      // Update user state with new data
      store.setState({
        user: updatedUser
      });
      
      // Update BOTH localStorage and sessionStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Also update auth_user if it exists
      if (localStorage.getItem('auth_user')) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

      console.log('✅ User state updated successfully');
      showSuccessToast(t('editProfile.success') || 'Profile updated successfully');
      setTimeout(() => backToDashboard(), 1000);
    } else {
      throw new Error(result.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Profile save error:', error);
    showErrorToast(error.message || 'Failed to save profile. Please try again.');
  } finally {
    // Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// Open Messages Page
window.openMessagesPage = function() {
  const userData = store.getState().user;
  
  // Check if dashboard structure exists
  const contentArea = document.querySelector('.figma-content-area');
  
  if (contentArea) {
    // Just update content area, keep sidebar
    updatePageTitle(t('pages.messages'));
    contentArea.innerHTML = getMessagesHTML();
    updateActiveMenuItem('Messages');
    return;
  }

  // Check current general menu state before navigating
  const generalChildren = document.getElementById('general-children');
  const generalArrow = document.getElementById('general-arrow');
  const isGeneralExpanded = generalChildren && !generalChildren.classList.contains('hidden');

  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2 id="page-title">Messages</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="backToDashboard()">← Back</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="figma-main-layout">
        <!-- Left Sidebar Menu -->
        <div class="figma-sidebar">
          <!-- General Menu (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isGeneralExpanded ? 'expanded' : ''}" onclick="toggleMenu('general')">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow" id="general-arrow">${isGeneralExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isGeneralExpanded ? '' : 'hidden'}" id="general-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openLandingSettings()">Landing</a>
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event)">Messages</a>
            </div>
          </div>

          <!-- Content Management (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('content')">
              <span class="figma-menu-title">Content Management</span>
              <span class="figma-menu-arrow" id="content-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="content-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Courses</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Lessons</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Materials</a>
            </div>
          </div>

          <!-- AI Assistant (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="openAIAssistantPage(); return false;">
              <span class="figma-menu-title">AI Assistant</span>
              <span class="figma-menu-arrow" id="ai-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="ai-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Chat Assistant</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Content Generator</a>
            </div>
          </div>

          <!-- Analytics (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('analytics')">
              <span class="figma-menu-title">Analytics</span>
              <span class="figma-menu-arrow" id="analytics-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="analytics-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Student Progress</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Course Analytics</a>
            </div>
          </div>

          <!-- Rolls (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('rolls')">
              <span class="figma-menu-title">Rolls</span>
              <span class="figma-menu-arrow" id="rolls-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="rolls-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Attendance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Grade Book</a>
            </div>
          </div>

          <!-- Settings (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('settings')">
              <span class="figma-menu-title">Settings</span>
              <span class="figma-menu-arrow" id="settings-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="settings-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Account Settings</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Preferences</a>
            </div>
          </div>

          <!-- Subscription at bottom -->
          <div class="figma-subscription">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">My Subscription</a>
            </div>
          </div>
        </div>

        <!-- Messages Content -->
        <div class="figma-content-area">
          <div class="messages-container">
            <!-- Simple Messages Interface -->
            <div class="messages-welcome">
              <div class="messages-header">
                <h3>Messages</h3>
                <button class="create-group-btn" onclick="createGroup()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Create Group
                </button>
              </div>

              <div class="messages-placeholder">
                <div class="placeholder-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <h3>Select a chat to start messaging</h3>
                <p>Choose from your existing conversations or create a new group</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Create Group Function
window.createGroup = function() {
  alert('Group create functionality will be implemented here!');
  // Here you would implement the group creation logic
};

// Trigger File Upload
window.triggerFileUpload = function() {
  document.getElementById('thumbnailInput').click();
};

// Handle Image Upload
window.handleImageUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    showErrorToast('File size must be less than 5MB');
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    showErrorToast('Please select an image file');
    return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = function(e) {
    const uploadContent = document.getElementById('uploadContent');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    previewImg.src = e.target.result;
    uploadContent.classList.add('hidden');
    imagePreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
  
  // Upload to server
  try {
    const formData = new FormData();
    formData.append('file', file); // Backend expects 'file' not 'image'
    
    // Use API base URL from config
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const uploadUrl = apiBaseUrl.replace('/api', '') + '/api/upload/image';
    
    console.log('📤 Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    
    console.log('📤 Upload response:', result);
    
    // Backend returns url directly, not in data object
    if (result.success && result.url) {
      window.uploadedThumbnailUrl = result.url;
      console.log('✅ Thumbnail uploaded successfully! URL saved to window.uploadedThumbnailUrl:', result.url);
      showSuccessToast('Thumbnail uploaded successfully!');
    } else {
      console.error('❌ Upload failed:', result);
      throw new Error('Failed to upload thumbnail');
    }
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    showErrorToast('Failed to upload thumbnail. Please try again.');
  }
};

// Change Image
window.changeImage = function(event) {
  event.stopPropagation();
  document.getElementById('thumbnailInput').click();
};

// Delete Image
window.deleteImage = function(event) {
  event.stopPropagation();
  const uploadContent = document.getElementById('uploadContent');
  const imagePreview = document.getElementById('imagePreview');
  const thumbnailInput = document.getElementById('thumbnailInput');

  uploadContent.classList.remove('hidden');
  imagePreview.classList.add('hidden');
  thumbnailInput.value = '';
};

// Add Lesson Function
window.addLesson = function(type, dropdownLink, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const moduleItem = dropdownLink.closest('.module-item');
  const lessonsList = moduleItem.querySelector('.lessons-list');
  const addDropdown = lessonsList.querySelector('.add-lesson-dropdown');

  // Hide dropdown
  const dropdownMenu = dropdownLink.closest('.dropdown-menu');
  dropdownMenu.classList.remove('show');

  // Get lesson count for numbering
  const existingLessons = lessonsList.querySelectorAll('.lesson-item').length;
  const lessonNumber = existingLessons + 1;

  let lessonHTML = '';

  switch(type) {
    case 'video':
      lessonHTML = `
        <style>
          .lesson-form {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
          }
          .lesson-form h5 {
            color: var(--text-primary);
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: 600;
          }
          .lesson-form .form-group {
            margin-bottom: 16px;
          }
          .lesson-form .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
          }
          .lesson-form .lesson-title-input {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
          }
          .lesson-form .lesson-title-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px var(--primary-color-10);
          }
          .video-upload-section .video-upload-area {
            border: 2px dashed var(--primary-color-40);
            border-radius: 16px;
            padding: 48px 24px;
            text-align: center;
            background: var(--bg-tertiary);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            box-shadow: inset 0 2px 8px var(--shadow-light);
          }
          .video-upload-section .video-upload-area:hover {
            border-color: var(--primary-color-60);
            background: var(--bg-hover);
            transform: translateY(-2px);
            box-shadow: inset 0 2px 8px var(--shadow-medium), 0 8px 20px var(--primary-color-10);
          }
          .video-upload-section .upload-content {
            color: var(--text-secondary);
          }
          .video-upload-section .upload-content svg {
            color: var(--primary-color);
            margin-bottom: 16px;
          }
          .video-upload-section .upload-content p {
            margin: 8px 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }
          .video-upload-section .upload-content small {
            font-size: 13px;
            color: var(--text-secondary);
            font-weight: 500;
          }
          .video-upload-section .upload-progress {
            color: var(--text-secondary);
          }
          .video-upload-section .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--bg-tertiary);
            border-radius: 4px;
            overflow: hidden;
            margin: 16px 0;
          }
          .video-upload-section .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--primary-color-80));
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          .video-upload-section .upload-status {
            font-size: 14px;
            margin: 8px 0 0 0;
            color: var(--text-secondary);
          }
          .video-upload-section .upload-success {
            color: var(--text-primary);
          }
          .video-upload-section .upload-success svg {
            margin-bottom: 12px;
            color: var(--success-color);
          }
          .video-upload-section .upload-success .video-filename {
            font-size: 14px;
            font-weight: 500;
            margin: 8px 0 4px 0;
            color: var(--text-primary);
          }
          .video-upload-section .upload-success small {
            font-size: 12px;
            color: var(--success-color);
          }
          .lesson-form .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
          }
          .lesson-form .save-lesson-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .save-lesson-btn:hover {
            background: var(--primary-color-80);
            transform: translateY(-1px);
          }
          .lesson-form .cancel-lesson-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .cancel-lesson-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-hover);
          }
        </style>
        <div class="lesson-form">
          <h5>Add Video Lesson ${lessonNumber}</h5>
          <div class="form-group">
            <label>Lesson Title</label>
            <input type="text" class="lesson-title-input" placeholder="Enter lesson title" required />
          </div>
          <div class="form-group">
            <label>Video File</label>
            <div class="video-upload-section">
              <input type="file" class="video-file-input" accept="video/*" style="display: none;" onchange="handleVideoUpload(this)" />
              <input type="hidden" class="video-url-input" />
              <div class="video-upload-area" onclick="this.previousElementSibling.previousElementSibling.click()">
                <div class="upload-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  <p>📹 Video yuklash uchun bosing</p>
                  <small>Video formatlar: MP4, MOV, AVI, WMV (Maksimal 500MB)</small>
                </div>
                <div class="upload-progress" style="display: none;">
                  <style>
                    @keyframes pulse {
                      0%, 100% { opacity: 0.3; transform: scale(0.8); }
                      50% { opacity: 1; transform: scale(1.2); }
                    }
                    .loading-dots .dot:nth-child(1) { animation: pulse 1.4s ease-in-out infinite; }
                    .loading-dots .dot:nth-child(2) { animation: pulse 1.4s ease-in-out 0.2s infinite; }
                    .loading-dots .dot:nth-child(3) { animation: pulse 1.4s ease-in-out 0.4s infinite; }
                  </style>
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 50px 20px; min-height: 200px;">
                    <div class="loading-dots" style="display: flex; gap: 10px;">
                      <div class="dot" style="width: 14px; height: 14px; background: #7ea2d4; border-radius: 50%;"></div>
                      <div class="dot" style="width: 14px; height: 14px; background: #7ea2d4; border-radius: 50%;"></div>
                      <div class="dot" style="width: 14px; height: 14px; background: #7ea2d4; border-radius: 50%;"></div>
                    </div>
                    <p class="upload-status" style="color: var(--text-secondary); font-size: 14px; margin: 0; font-weight: 500;">Uploading video...</p>
                    <button type="button" onclick="cancelVideoUpload(this)" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 10px 24px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                      Cancel
                    </button>
                  </div>
                </div>
                <div class="upload-success" style="display: none;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <p class="video-filename"></p>
                  <small>Video uploaded successfully</small>
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="save-lesson-btn" onclick="saveLesson(this, 'video')">Save Lesson</button>
            <button type="button" class="cancel-lesson-btn" onclick="cancelLesson(this)">Cancel</button>
          </div>
        </div>
      `;
      break;

    case 'quiz':
      lessonHTML = `
        <style>
          .lesson-form {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
          }
          .lesson-form h5 {
            color: var(--text-primary);
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: 600;
          }
          .lesson-form .form-group {
            margin-bottom: 16px;
          }
          .lesson-form .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
          }
          .lesson-form input, .lesson-form textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
            font-family: inherit;
          }
          .lesson-form input:focus, .lesson-form textarea:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px var(--primary-color-10);
          }
          .lesson-form .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
          }
          .lesson-form .save-lesson-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .save-lesson-btn:hover {
            background: var(--primary-color-80);
            transform: translateY(-1px);
          }
          .lesson-form .cancel-lesson-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .cancel-lesson-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-hover);
          }
          .quiz-type-selector {
            display: flex;
            gap: 12px;
            margin-top: 8px;
          }
          .quiz-type-option {
            flex: 1;
            padding: 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .quiz-type-option:hover {
            border-color: var(--primary-color-40);
            background: var(--bg-hover);
          }
          .quiz-type-option.active {
            border-color: var(--primary-color);
            background: var(--primary-color-10);
          }
          .quiz-type-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: var(--bg-tertiary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
          }
          .quiz-type-option.active .quiz-type-icon {
            background: var(--primary-color);
            color: white;
          }
          .quiz-type-info h6 {
            margin: 0 0 4px 0;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 600;
          }
          .quiz-type-info small {
            color: var(--text-secondary);
            font-size: 12px;
          }
          .questions-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .add-question-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
          }
          .add-question-btn:hover {
            background: var(--primary-color-80);
            transform: translateY(-1px);
          }
          .question-item {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          }
          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .question-number {
            color: var(--primary-color);
            font-size: 14px;
            font-weight: 600;
          }
          .delete-question-btn {
            background: none;
            border: none;
            color: var(--text-danger);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          .delete-question-btn:hover {
            background: var(--bg-danger-light);
          }
          .question-input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            margin-bottom: 12px;
            outline: none;
            transition: border-color 0.2s ease;
          }
          .question-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px var(--primary-color-10);
          }
          .answers-list {
            margin-top: 12px;
          }
          .answer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .answer-checkbox, .answer-radio {
            width: 18px;
            height: 18px;
            border: 2px solid var(--border-color);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .answer-radio {
            border-radius: 50%;
          }
          .answer-checkbox.checked, .answer-radio.checked {
            border-color: var(--primary-color);
            background: var(--primary-color);
            color: white;
          }
          .answer-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
          }
          .answer-input:focus {
            border-color: var(--primary-color);
          }
          .add-answer-btn {
            background: transparent;
            color: var(--primary-color);
            border: 1px dashed var(--primary-color-40);
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            margin-top: 8px;
            transition: all 0.2s ease;
          }
          .add-answer-btn:hover {
            background: var(--primary-color-10);
            border-color: var(--primary-color);
          }
        </style>
        <div class="lesson-form" data-quiz-type="multiple-choice">
          <h5>Add Quiz ${lessonNumber}</h5>
          <div class="form-group">
            <label>Quiz Title</label>
            <input type="text" class="quiz-title-input" placeholder="Enter quiz title" />
          </div>
          <div class="form-group">
            <label>Time Limit (minutes)</label>
            <input type="number" class="quiz-time-input" placeholder="30" min="1" />
          </div>
          <div class="form-group">
            <label>Quiz Type</label>
            <div class="quiz-type-selector">
              <div class="quiz-type-option active" data-type="multiple-choice" onclick="selectQuizType(this, 'multiple-choice')">
                <div class="quiz-type-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div class="quiz-type-info">
                  <h6>Multiple Choice</h6>
                  <small>Single correct answer</small>
                </div>
              </div>
              <div class="quiz-type-option" data-type="multiple-correct" onclick="selectQuizType(this, 'multiple-correct')">
                <div class="quiz-type-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div class="quiz-type-info">
                  <h6>Multiple Correct</h6>
                  <small>Multiple correct answers</small>
                </div>
              </div>
            </div>
          </div>
          <div class="quiz-questions-section">
            <div class="form-group">
              <div class="questions-header">
                <label>Questions</label>
                <button type="button" class="create-questions-btn" onclick="openCreateQuestionsModal(this)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create Questions
                </button>
              </div>
              <div class="questions-list">
                <!-- Questions will be added here -->
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="save-lesson-btn" onclick="saveLesson(this, 'quiz')">Save Quiz</button>
            <button type="button" class="cancel-lesson-btn" onclick="cancelLesson(this)">Cancel</button>
          </div>
        </div>
      `;
      break;

    case 'assignment':
      lessonHTML = `
        <style>
          .lesson-form {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
          }
          .lesson-form h5 {
            color: var(--text-primary);
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: 600;
          }
          .lesson-form .form-group {
            margin-bottom: 16px;
          }
          .lesson-form .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
          }
          .lesson-form input, .lesson-form textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
            font-family: inherit;
          }
          .lesson-form input:focus, .lesson-form textarea:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px var(--primary-color-10);
          }
          .lesson-form .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
          }
          .lesson-form .save-lesson-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .save-lesson-btn:hover {
            background: var(--primary-color-80);
            transform: translateY(-1px);
          }
          .lesson-form .cancel-lesson-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .cancel-lesson-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-hover);
          }
        </style>
        <div class="lesson-form">
          <h5>Add Assignment ${lessonNumber}</h5>
          <div class="form-group">
            <label>Assignment Title</label>
            <input type="text" placeholder="Enter assignment title" class="assignment-title" />
          </div>
          <div class="form-group">
            <label>Instructions</label>
            <textarea placeholder="Enter assignment instructions" rows="4" class="assignment-instructions"></textarea>
          </div>
          
          <!-- Assignment Content Type Selection -->
          <div class="form-group">
            <label>Assignment Content Type</label>
            <p class="content-type-hint">Choose one of them to add assignment content</p>
            <div class="content-type-selector">
              <label class="radio-option">
                <input type="radio" name="assignment-content-type-${lessonNumber}" value="text" onchange="toggleAssignmentContentType(this)">
                <span>Text Content</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="assignment-content-type-${lessonNumber}" value="file" onchange="toggleAssignmentContentType(this)">
                <span>File Upload</span>
              </label>
            </div>
          </div>

          <!-- Text Content Area -->
          <div class="form-group assignment-text-content" style="display: none;">
            <label>Assignment Content (Text)</label>
            <textarea placeholder="Write your assignment content here..." rows="6" class="assignment-text"></textarea>
          </div>

          <!-- File Upload Area -->
          <div class="form-group assignment-file-content" style="display: none;">
            <label>Assignment File</label>
            <div class="file-upload-area" onclick="this.querySelector('input').click()">
              <input type="file" class="assignment-file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png" style="display: none;" onchange="handleAssignmentFileSelect(this)">
              <div class="upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Click to upload assignment file</p>
                <span>PDF, DOC, DOCX, TXT, ZIP (Max 10MB)</span>
              </div>
              <div class="file-preview" style="display: none;">
                <div class="file-info">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span class="file-name"></span>
                  <span class="file-size"></span>
                </div>
                <button type="button" class="remove-file-btn" onclick="removeAssignmentFile(this, event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="save-lesson-btn" onclick="saveLesson(this, 'assignment')">Save Assignment</button>
            <button type="button" class="cancel-lesson-btn" onclick="cancelLesson(this)">Cancel</button>
          </div>
        </div>
      `;
      break;

    case 'file':
      lessonHTML = `
        <style>
          .lesson-form {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
          }
          .lesson-form h5 {
            color: var(--text-primary);
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: 600;
          }
          .lesson-form .form-group {
            margin-bottom: 16px;
          }
          .lesson-form .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
          }
          .lesson-form input, .lesson-form textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
            font-family: inherit;
          }
          .lesson-form input:focus, .lesson-form textarea:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px var(--primary-color-10);
          }
          .lesson-form .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
          }
          .lesson-form .save-lesson-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .save-lesson-btn:hover {
            background: var(--primary-color-80);
            transform: translateY(-1px);
          }
          .lesson-form .cancel-lesson-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .lesson-form .cancel-lesson-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-hover);
          }
        </style>
        <div class="lesson-form">
          <h5>Add File Lesson ${lessonNumber}</h5>
          <div class="form-group">
            <label>Lesson Title</label>
            <input type="text" placeholder="Enter lesson title" />
          </div>
          <div class="form-group">
            <label>File Upload</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea placeholder="Describe this file and what students should learn" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="save-lesson-btn" onclick="saveLesson(this, 'file')">Save Lesson</button>
            <button type="button" class="cancel-lesson-btn" onclick="cancelLesson(this)">Cancel</button>
          </div>
        </div>
      `;
      break;
  }

  // Insert the form before the add dropdown
  addDropdown.insertAdjacentHTML('beforebegin', lessonHTML);
};

// Save Lesson Function
window.saveLesson = async function(button, type) {
  const lessonForm = button.closest('.lesson-form');
  const inputs = lessonForm.querySelectorAll('input, textarea');
  const moduleItem = lessonForm.closest('.module-item');
  const lessonsList = moduleItem.querySelector('.lessons-list');

  // Get form data
  let lessonTitle = '';
  let duration = '';

  // Extract lesson title based on type
  let titleInput;
  if (type === 'quiz') {
    titleInput = lessonForm.querySelector('.quiz-title-input');
  } else {
    titleInput = lessonForm.querySelector('.lesson-title-input') || lessonForm.querySelector('input[type="text"]');
  }

  if (titleInput && titleInput.value.trim()) {
    lessonTitle = titleInput.value.trim();
  } else {
    showErrorToast('Please enter a lesson title');
    return;
  }

  // Validate video upload for video lessons
  if (type === 'video') {
    const videoUrlInput = lessonForm.querySelector('.video-url-input');
    if (!videoUrlInput || !videoUrlInput.value.trim()) {
      showErrorToast('Please upload a video file first');
      return;
    }
  }

  // Validate quiz questions
  if (type === 'quiz') {
    const questions = lessonForm.querySelectorAll('.question-item');
    if (questions.length === 0) {
      showErrorToast('Please add at least one question');
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionInput = question.querySelector('.question-input');
      const answerInputs = question.querySelectorAll('.answer-input');
      const checkedAnswers = question.querySelectorAll('.answer-checkbox.checked, .answer-radio.checked');

      // Check question text
      if (!questionInput.value.trim()) {
        showErrorToast(`Please enter text for question ${i + 1}`);
        return;
      }

      // Check at least 2 answers
      let filledAnswers = 0;
      answerInputs.forEach(input => {
        if (input.value.trim()) filledAnswers++;
      });

      if (filledAnswers < 2) {
        showErrorToast(`Question ${i + 1} needs at least 2 answer options`);
        return;
      }

      // Check at least one correct answer
      if (checkedAnswers.length === 0) {
        showErrorToast(`Please mark correct answer(s) for question ${i + 1}`);
        return;
      }
    }
  }

  // Get duration for display
  if (type === 'video') {
    const durationInput = lessonForm.querySelector('.video-duration-input');
    duration = durationInput ? durationInput.value : '00:00';
  } else if (type === 'quiz') {
    const timeInput = lessonForm.querySelector('.quiz-time-input');
    const questionCount = lessonForm.querySelectorAll('.question-item').length;
    duration = `Quiz (${questionCount} questions)`;
    if (timeInput && timeInput.value) {
      duration += ` • ${timeInput.value} min`;
    }
  } else if (type === 'assignment') {
    duration = 'Assignment';
  } else if (type === 'file') {
    duration = 'File';
  }

  // Get icon based on type
  let iconSVG = '';
  switch(type) {
    case 'video':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>`;
      break;
    case 'quiz':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
      </svg>`;
      break;
    case 'assignment':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>`;
      break;
    case 'file':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13,2 13,9 20,9"/>
      </svg>`;
      break;
    default:
      iconSVG = '';
  }

  // Get video URL if it's a video lesson
  let videoUrl = '';
  if (type === 'video') {
    const videoUrlInput = lessonForm.querySelector('.video-url-input');
    videoUrl = videoUrlInput ? videoUrlInput.value : '';
  }

  // Store lesson data for editing
  const lessonData = {
    type: type,
    title: lessonTitle,
    duration: duration,
    videoUrl: videoUrl
  };

  // Get lesson form data for editing
  if (type === 'quiz') {
    const questions = [];
    const questionItems = lessonForm.querySelectorAll('.question-item');

    console.log('🎯 SAVE: Found question items:', questionItems.length);

    questionItems.forEach((questionItem, questionIndex) => {
      const questionText = questionItem.querySelector('.question-input')?.value || '';
      const answers = [];
      // Support both formats: new modal format and old format
      const answerItems = questionItem.querySelectorAll('.answer-item, .answer-option');

      console.log(`🎯 SAVE: Question ${questionIndex}: "${questionText}"`);
      console.log(`🎯 SAVE: Answer items found: ${answerItems.length}`);

      answerItems.forEach((answerItem, answerIndex) => {
        const answerInput = answerItem.querySelector('.answer-input');
        // Support both radio and checkbox formats
        const answerCheckbox = answerItem.querySelector('.answer-checkbox, .answer-radio');

        if (answerInput && answerInput.value.trim()) {
          // Check for multiple ways to determine if answer is correct
          const isCorrect = answerCheckbox && (
            answerCheckbox.classList.contains('checked') ||
            answerCheckbox.textContent.includes('●') ||
            answerCheckbox.textContent.includes('☑')
          );
          const answer = {
            text: answerInput.value.trim(),
            isCorrect: isCorrect
          };

          console.log(`🎯 SAVE: Answer ${answerIndex}:`, answer);
          answers.push(answer);
        }
      });

      if (questionText.trim() && answers.length > 0) {
        const question = {
          question: questionText,
          answers: answers
        };
        console.log(`🎯 SAVE: Adding question:`, question);
        questions.push(question);
      }
    });

    console.log('🎯 SAVE: Total questions saved:', questions);
    console.log('🎯 SAVE: Questions structure:', JSON.stringify(questions, null, 2));

    lessonData.questions = questions;
    lessonData.timeLimit = lessonForm.querySelector('.quiz-time-input')?.value || '';
    
    console.log('🎯 SAVE: Final lessonData for quiz:', JSON.stringify(lessonData, null, 2));
  } else if (type === 'assignment') {
    const instructionsInput = lessonForm.querySelector('.assignment-instructions');

    // Get content type (text or file)
    const contentTypeRadio = lessonForm.querySelector('input[name*="assignment-content-type"]:checked');
    const contentType = contentTypeRadio ? contentTypeRadio.value : 'text';

    lessonData.instructions = instructionsInput?.value || '';
    lessonData.contentType = contentType;

    if (contentType === 'text') {
      const textContentInput = lessonForm.querySelector('.assignment-text');
      lessonData.textContent = textContentInput?.value || '';
    } else if (contentType === 'file') {
      const fileInput = lessonForm.querySelector('.assignment-file');
      console.log('🔍 Assignment file input found:', !!fileInput);
      console.log('🔍 Files selected:', fileInput?.files?.length || 0);
      
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        lessonData.fileName = file.name;
        
        // Upload file to server
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
          const uploadUrl = `${apiBaseUrl}/upload/document`;
          console.log('📤 Uploading assignment file to:', uploadUrl);
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: formData,
          });
          
          const result = await response.json();
          if (result.success && result.url) {
            lessonData.fileUrl = result.url;
            console.log('✅ Assignment file uploaded:', result.url);
          }
        } catch (error) {
          console.error('❌ File upload failed:', error);
          showErrorToast('File upload failed. Please try again.');
          return; // Don't save lesson if file upload fails
        }
      }
    }

    console.log('🎯 SAVE Assignment - Final lessonData:', lessonData);
  } else if (type === 'file') {
    const descriptionInput = lessonForm.querySelector('textarea[placeholder*="file"], textarea[placeholder*="describe"]');
    const fileInput = lessonForm.querySelector('input[type="file"]');

    lessonData.description = descriptionInput?.value || '';
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      lessonData.fileName = file.name;
      
      // Upload file to server
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
        const uploadUrl = `${apiBaseUrl}/upload/document`;
        console.log('📤 Uploading file lesson to:', uploadUrl);
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData,
        });
        
        const result = await response.json();
        if (result.success && result.url) {
          lessonData.fileUrl = result.url;
          console.log('✅ File lesson uploaded:', result.url);
        }
      } catch (error) {
        console.error('❌ File upload failed:', error);
        showErrorToast('File upload failed. Please try again.');
        return; // Don't save lesson if file upload fails
      }
    }
    
    console.log('🎯 SAVE File Lesson - Final lessonData:', lessonData);
  }

  // Create lesson item HTML with edit and delete buttons
  let lessonHTML = '';
  if (type === 'video') {
    lessonHTML = `
      <div class="lesson-item" data-lesson='${JSON.stringify(lessonData).replace(/'/g, "&apos;")}' data-video-url="${videoUrl}">
        <div class="lesson-title-with-icon">
          <span class="lesson-icon">${iconSVG}</span>
          <span>${lessonTitle}</span>
        </div>
        <div class="lesson-info-actions">
          <span class="lesson-duration">${duration}</span>
          <button class="edit-btn" onclick="editLesson(this, event)">Edit</button>
          <button class="delete-btn" onclick="deleteLesson(this, event)">Delete</button>
          <button class="view-btn" onclick="viewVideo(this, event)">Ko'rish</button>
        </div>
      </div>
    `;
  } else {
    lessonHTML = `
      <div class="lesson-item" data-lesson='${JSON.stringify(lessonData).replace(/'/g, "&apos;")}'>
        <div class="lesson-title-with-icon">
          <span class="lesson-icon">${iconSVG}</span>
          <span>${lessonTitle}</span>
        </div>
        <div class="lesson-info-actions">
          <span class="lesson-duration">${duration}</span>
          <button class="edit-btn" onclick="editLesson(this, event)">Edit</button>
          <button class="delete-btn" onclick="deleteLesson(this, event)">Delete</button>
        </div>
      </div>
    `;
  }

  // Insert before the lesson form
  lessonForm.insertAdjacentHTML('beforebegin', lessonHTML);
  
  // Get the newly created lesson item and store lesson data
  const newLessonItem = lessonForm.previousElementSibling;
  newLessonItem.lessonData = lessonData;
  
  console.log('🎯 SAVE: Storing lessonData on element:', lessonData);
  console.log('🎯 SAVE: lessonData.questions:', lessonData.questions);
  
  // Also update the data-lesson attribute for edit functionality
  newLessonItem.setAttribute('data-lesson', JSON.stringify(lessonData).replace(/'/g, "&apos;"));

  // Remove the form
  lessonForm.remove();

  // Update module info (lesson count)
  updateModuleInfo(moduleItem);
};

// View Video Function
window.viewVideo = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const lessonItem = button.closest('.lesson-item');
  const videoUrl = lessonItem.dataset.videoUrl;
  const lessonTitle = lessonItem.querySelector('.lesson-title-with-icon span:last-child').textContent;

  if (!videoUrl) {
    showErrorToast('Video URL not found');
    return;
  }

  // Remove any existing modal first
  const existingModal = document.getElementById('videoPreviewModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create video modal with inline event handlers
  const modal = document.createElement('div');
  modal.className = 'video-modal';
  modal.id = 'videoPreviewModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); display: flex; justify-content: center; align-items: center; z-index: 99999; backdrop-filter: blur(4px);';
  
  modal.innerHTML = `
    <div class="video-modal-content" style="background: var(--bg-primary); border-radius: 12px; overflow: hidden; max-width: 90vw; max-height: 90vh; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); border: 1px solid var(--border-color);">
      <div class="video-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
        <h3 style="margin: 0; color: var(--text-primary); font-size: 18px; font-weight: 600;">${lessonTitle}</h3>
        <button class="close-modal-btn" type="button" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s ease;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="video-container" style="padding: 24px; background: var(--bg-primary);">
        <video controls autoplay style="width: 100%; height: auto; border-radius: 8px; max-width: 800px; min-width: 400px;">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Add event listeners
  const closeBtn = modal.querySelector('.close-modal-btn');
  const modalContent = modal.querySelector('.video-modal-content');
  
  if (closeBtn) {
    console.log('✅ Close button found, adding click handler');
    closeBtn.onclick = function(e) {
      console.log('🔴 X button clicked!');
      console.log('🔴 window.closeVideoModal exists?', typeof window.closeVideoModal);
      e.stopPropagation();
      e.preventDefault();
      
      // Close modal directly here
      const modalToClose = document.getElementById('videoPreviewModal');
      console.log('🔴 Modal to close:', modalToClose);
      if (modalToClose) {
        const video = modalToClose.querySelector('video');
        if (video) {
          video.pause();
          video.src = '';
        }
        modalToClose.remove();
        document.body.style.overflow = '';
        console.log('✅ Modal closed successfully!');
      } else {
        console.error('❌ Modal not found!');
      }
    };
  } else {
    console.error('❌ Close button NOT found!');
  }
  
  if (modalContent) {
    modalContent.onclick = function(e) {
      e.stopPropagation();
    };
  }
  
  modal.onclick = function(e) {
    if (e.target === modal) {
      console.log('🔴 Background clicked!');
      window.closeVideoModal();
    }
  };
};

// Close Video Modal Function
window.closeVideoModal = function() {
  console.log('🟢 closeVideoModal function called');
  const modal = document.getElementById('videoPreviewModal');
  console.log('🟢 Modal element:', modal);
  if (modal) {
    console.log('🟢 Modal found, removing...');
    const video = modal.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
      console.log('🟢 Video stopped');
    }
    modal.remove();
    console.log('🟢 Modal removed from DOM');
  } else {
    console.error('❌ Modal NOT found with ID: videoPreviewModal');
  }
  document.body.style.overflow = '';
  console.log('🟢 Body overflow reset');
};

// Edit Lesson Function
window.editLesson = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const lessonItem = button.closest('.lesson-item');
  const lessonDataStr = lessonItem.dataset.lesson;

  if (!lessonDataStr) {
    showErrorToast('Lesson data not found');
    return;
  }

  let lessonData;
  try {
    lessonData = JSON.parse(lessonDataStr.replace(/&apos;/g, "'"));
    console.log('🎯 Edit lesson data:', lessonData); // Debug log
    console.log('🎯 Lesson type:', lessonData.type);
    if (lessonData.type === 'assignment') {
      console.log('🎯 Assignment - Title:', lessonData.title);
      console.log('🎯 Assignment - Instructions:', lessonData.instructions);
      console.log('🎯 Assignment - ContentType:', lessonData.contentType);
      console.log('🎯 Assignment - TextContent:', lessonData.textContent);
      console.log('🎯 Assignment - FileName:', lessonData.fileName);
    }
  console.log('🎯 Questions data in edit:', lessonData.questions);
  console.log('🎯 Questions array length:', lessonData.questions ? lessonData.questions.length : 'undefined');
  } catch (error) {
    console.error('Error parsing lesson data:', error);
    showErrorToast('Invalid lesson data format');
    return;
  }

  const moduleItem = lessonItem.closest('.module-item');
  const lessonsList = moduleItem.querySelector('.lessons-list');

  // Hide the lesson item temporarily
  lessonItem.style.display = 'none';

  // Create edit form based on lesson type
  let editFormHTML = '';

  if (lessonData.type === 'quiz') {
    console.log('🎯 Creating quiz edit form with questions:', lessonData.questions); // Debug log
    editFormHTML = createQuizEditForm(lessonData);
  } else if (lessonData.type === 'video') {
    editFormHTML = createVideoEditForm(lessonData);
  } else if (lessonData.type === 'assignment') {
    editFormHTML = createAssignmentEditForm(lessonData);
  } else if (lessonData.type === 'file') {
    editFormHTML = createFileEditForm(lessonData);
  }

  // Insert edit form before the lesson item
  lessonItem.insertAdjacentHTML('beforebegin', editFormHTML);
};

// Create Quiz Edit Form
function createQuizEditForm(lessonData) {
  console.log('🎯 createQuizEditForm called with data:', lessonData);
  console.log('🎯 Questions array:', lessonData.questions);
  console.log('🎯 Questions exists?', !!lessonData.questions);
  console.log('🎯 Questions length:', lessonData.questions ? lessonData.questions.length : 0);

  const questionsHTML = lessonData.questions && Array.isArray(lessonData.questions) ? lessonData.questions.map((q, questionIndex) => {
    console.log(`🎯 Processing question ${questionIndex}:`, q);

    const answersHTML = q.answers && Array.isArray(q.answers) ? q.answers.map((answer, answerIndex) => {
      const escapedText = (answer.text || '').replace(/"/g, '&quot;');
      const isCorrect = answer.isCorrect;
      const symbol = isCorrect ? '●' : '○'; // Radio format
      return `
        <div class="answer-item">
          <div class="answer-radio ${isCorrect ? 'checked' : ''}" onclick="toggleAnswer(this)">
            ${symbol}
          </div>
          <input type="text" class="answer-input" value="${escapedText}" placeholder="Answer option ${answerIndex + 1}" />
        </div>
      `;
    }).join('') : '';

    const escapedQuestion = (q.question || '').replace(/"/g, '&quot;');

    return `
      <div class="question-item">
        <div class="question-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span class="question-number" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Question ${questionIndex + 1}</span>
            <span class="question-instruction" style="font-size: 12px; color: var(--primary-color); font-weight: 500;">Choose 1 correct answer</span>
          </div>
          <button type="button" class="delete-question-btn" onclick="deleteQuestion(this)" style="background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 6px; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <input type="text" class="question-input" value="${escapedQuestion}" placeholder="Enter question text..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary); margin-bottom: 12px;" />
        <div class="answers-section">
          <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: block;">
            Answer options:
          </label>
          <div class="answers-list" data-max-correct="1">
            ${answersHTML}
          </div>
        </div>
      </div>
    `;
  }).join('') : '';

  console.log('🎯 Generated questionsHTML:', questionsHTML);

  const escapedTitle = (lessonData.title || '').replace(/"/g, '&quot;');

  return `
    <div class="lesson-form lesson-edit-form" data-quiz-type="multiple-choice">
      <h5>Edit Quiz: ${escapedTitle}</h5>
      <div class="form-group">
        <label>Quiz Title</label>
        <input type="text" class="quiz-title-input" value="${escapedTitle}" placeholder="Enter quiz title" />
      </div>
      <div class="form-group">
        <label>Time Limit (minutes)</label>
        <input type="number" class="quiz-time-input" value="${lessonData.timeLimit || ''}" placeholder="30" min="1" />
      </div>
      <div class="form-group">
        <div class="questions-header">
          <label>Questions</label>
          <button type="button" class="add-question-btn" onclick="openCreateQuestionsModal(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Questions
          </button>
        </div>
        <div class="questions-list">
          ${questionsHTML}
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="save-lesson-btn" onclick="updateLesson(this, 'quiz')">Update Quiz</button>
        <button type="button" class="cancel-lesson-btn" onclick="cancelEdit(this)">Cancel</button>
      </div>
    </div>
  `;
}

// Create Video Edit Form
function createVideoEditForm(lessonData) {
  return `
    <div class="lesson-form lesson-edit-form">
      <h5>Edit Video: ${lessonData.title}</h5>
      <div class="form-group">
        <label>Lesson Title</label>
        <input type="text" class="lesson-title-input" value="${lessonData.title}" placeholder="Enter lesson title" required />
      </div>
      <div class="form-group">
        <label>Video File</label>
        <div class="video-upload-section">
          <input type="file" class="video-file-input" accept="video/*" style="display: none;" onchange="handleVideoUpload(this)" />
          <input type="hidden" class="video-url-input" value="${lessonData.videoUrl || ''}" />
          <input type="hidden" class="video-duration-input" value="${lessonData.duration || ''}" />
          <div class="current-video-info" style="padding: 16px; border: 1px dashed var(--border-color); border-radius: 8px; text-align: center;">
            <p style="color: var(--text-secondary); margin: 8px 0;">Current video: ${lessonData.title}</p>
            <p style="color: var(--text-secondary); margin: 8px 0; font-size: 14px;">Duration: ${lessonData.duration}</p>
            <button type="button" onclick="this.parentNode.style.display='none'; this.parentNode.nextElementSibling.style.display='block';" style="background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Change Video</button>
          </div>
          <div class="video-upload-area" style="display: none;" onclick="this.previousElementSibling.previousElementSibling.previousElementSibling.click()">
            <div class="upload-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <p>Click to upload new video</p>
              <small>MP4, MOV, AVI up to 100MB</small>
            </div>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="save-lesson-btn" onclick="updateLesson(this, 'video')">Update Video</button>
        <button type="button" class="cancel-lesson-btn" onclick="cancelEdit(this)">Cancel</button>
      </div>
    </div>
  `;
}

// Create Assignment Edit Form
function createAssignmentEditForm(lessonData) {
  console.log('🎯 createAssignmentEditForm received:', lessonData);
  console.log('🎯 File info - fileName:', lessonData.fileName);
  console.log('🎯 File info - fileUrl:', lessonData.fileUrl);
  console.log('🎯 File info - content:', lessonData.content);
  console.log('🎯 File info - textContent:', lessonData.textContent);
  
  const escapedTitle = (lessonData.title || '').replace(/"/g, '&quot;');
  const escapedInstructions = (lessonData.instructions || '').replace(/"/g, '&quot;');
  const escapedTextContent = (lessonData.textContent || '').replace(/"/g, '&quot;');
  const contentType = lessonData.contentType || 'text';
  const randomId = Math.random().toString(36).substr(2, 9);

  console.log('🎯 createAssignmentEditForm - Title:', escapedTitle);
  console.log('🎯 createAssignmentEditForm - Instructions:', escapedInstructions);
  console.log('🎯 createAssignmentEditForm - ContentType:', contentType);

  return `
    <div class="lesson-form lesson-edit-form">
      <h5>Edit Assignment: ${escapedTitle}</h5>
      <div class="form-group">
        <label>Assignment Title</label>
        <input type="text" class="assignment-title" value="${escapedTitle}" placeholder="Enter assignment title" />
      </div>
      <div class="form-group">
        <label>Instructions</label>
        <textarea class="assignment-instructions" placeholder="Enter assignment instructions" rows="4">${escapedInstructions}</textarea>
      </div>

      <!-- Assignment Content Type Selection -->
      <div class="form-group">
        <label>Assignment Content Type</label>
        <p class="content-type-hint" style="color: var(--text-secondary); font-size: 14px; margin: 8px 0;">Choose one of them to add assignment content</p>
        <div class="content-type-selector" style="display: flex; gap: 16px; margin: 12px 0;">
          <label class="radio-option" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="assignment-content-type-${randomId}" value="text" ${contentType === 'text' ? 'checked' : ''} onchange="toggleAssignmentContentType(this)">
            <span>Text Content</span>
          </label>
          <label class="radio-option" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="assignment-content-type-${randomId}" value="file" ${contentType === 'file' ? 'checked' : ''} onchange="toggleAssignmentContentType(this)">
            <span>File Upload</span>
          </label>
        </div>
      </div>

      <!-- Text Content Area -->
      <div class="form-group assignment-text-content" style="display: ${contentType === 'text' ? 'block' : 'none'};">
        <label>Assignment Content (Text)</label>
        <textarea placeholder="Write your assignment content here..." rows="6" class="assignment-text">${escapedTextContent}</textarea>
      </div>

      <!-- File Upload Area -->
      <div class="form-group assignment-file-content" style="display: ${contentType === 'file' ? 'block' : 'none'};">
        <label>Assignment Content (File)</label>
        ${lessonData.fileName ? `
          <div class="current-file-display" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; background: var(--primary-color); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13,2 13,9 20,9"/>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500; color: var(--text-primary);">${lessonData.fileName}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Current assignment file</div>
              </div>
              <button type="button" onclick="document.querySelector('.assignment-file').click()" style="color: var(--primary-color); background: transparent; border: 1px solid var(--primary-color); border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer;">
                Replace
              </button>
            </div>
          </div>
        ` : `
          <div style="background: var(--bg-tertiary); border: 1px dashed var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 12px; text-align: center;">
            <div style="color: var(--text-secondary); font-size: 14px;">No file uploaded yet</div>
          </div>
        `}
        <input type="file" class="assignment-file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png" style="display: none;" />
      </div>

      <div class="form-actions">
        <button type="button" class="save-lesson-btn" onclick="updateLesson(this, 'assignment')">Update Assignment</button>
        <button type="button" class="cancel-lesson-btn" onclick="cancelEdit(this)">Cancel</button>
      </div>
    </div>
  `;
}

// Create File Edit Form
function createFileEditForm(lessonData) {
  const escapedTitle = (lessonData.title || '').replace(/"/g, '&quot;');
  const escapedDescription = (lessonData.description || '').replace(/"/g, '&quot;');

  // File info display
  const currentFileDisplay = lessonData.fileName ? `
    <div class="current-file-display" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: var(--primary-color-10); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13,2 13,9 20,9"/>
            </svg>
          </div>
          <div>
            <h6 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: 14px; font-weight: 600;">${lessonData.fileName}</h6>
            <p style="margin: 0; color: var(--text-secondary); font-size: 12px;">Current file</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          ${lessonData.fileUrl ? `<button type="button" onclick="window.open('${lessonData.fileUrl}', '_blank')" style="background: var(--primary-color); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">View File</button>` : ''}
          <button type="button" onclick="this.closest('.current-file-display').style.display='none'; this.closest('.form-group').querySelector('.new-file-upload').style.display='block'" style="background: var(--bg-primary); color: var(--text-secondary); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Replace</button>
        </div>
      </div>
    </div>
    <div class="new-file-upload" style="display: none;">
      <input type="file" class="file-upload-input" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" />
      <small style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; display: block;">Choose a new file to replace the current one</small>
    </div>
  ` : `
    <div class="new-file-upload">
      <input type="file" class="file-upload-input" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" />
      <small style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; display: block;">No file uploaded yet. Choose a file to upload.</small>
    </div>
  `;

  return `
    <div class="lesson-form lesson-edit-form">
      <h5>Edit File: ${escapedTitle}</h5>
      <div class="form-group">
        <label>File Title</label>
        <input type="text" class="file-title" value="${escapedTitle}" placeholder="Enter file title" />
      </div>
      <div class="form-group">
        <label>File Upload</label>
        ${currentFileDisplay}
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="file-description" placeholder="Describe this file and what students should learn" rows="3">${escapedDescription}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="save-lesson-btn" onclick="updateLesson(this, 'file')">Update File</button>
        <button type="button" class="cancel-lesson-btn" onclick="cancelEdit(this)">Cancel</button>
      </div>
    </div>
  `;
}

// Update Lesson Function
window.updateLesson = function(button, type) {
  const editForm = button.closest('.lesson-edit-form');
  const moduleItem = editForm.closest('.module-item');
  const hiddenLessonItem = editForm.nextElementSibling;

  console.log('🎯 UPDATE: editForm found:', !!editForm);
  console.log('🎯 UPDATE: hiddenLessonItem found:', !!hiddenLessonItem);
  console.log('🎯 UPDATE: moduleItem found:', !!moduleItem);

  // Get updated data based on type
  let updatedData = { type: type };

  if (type === 'quiz') {
    const titleInput = editForm.querySelector('.quiz-title-input');
    const timeInput = editForm.querySelector('.quiz-time-input');
    const questions = [];

    editForm.querySelectorAll('.question-item').forEach(questionItem => {
      const questionText = questionItem.querySelector('.question-input')?.value || '';
      const answers = [];
      // Support both formats: new modal format and old format
      const answerItems = questionItem.querySelectorAll('.answer-item, .answer-option');

      answerItems.forEach((answerItem, index) => {
        const answerInput = answerItem.querySelector('.answer-input');
        const answerCheckbox = answerItem.querySelector('.answer-checkbox, .answer-radio');

        if (answerInput && answerInput.value.trim()) {
          const isCorrect = answerCheckbox && (
            answerCheckbox.classList.contains('checked') ||
            answerCheckbox.textContent.includes('●') ||
            answerCheckbox.textContent.includes('☑')
          );
          answers.push({
            text: answerInput.value.trim(),
            isCorrect: isCorrect
          });
        }
      });

      if (questionText.trim() && answers.length > 0) {
        questions.push({
          question: questionText,
          answers: answers
        });
      }
    });

    updatedData.title = titleInput ? titleInput.value.trim() : '';
    updatedData.timeLimit = timeInput ? timeInput.value : '';
    updatedData.questions = questions;
    updatedData.duration = `Quiz (${questions.length} questions)${timeInput && timeInput.value ? ` • ${timeInput.value} min` : ''}`;

  } else if (type === 'video') {
    const titleInput = editForm.querySelector('.lesson-title-input');
    const videoUrlInput = editForm.querySelector('.video-url-input');
    const durationInput = editForm.querySelector('.video-duration-input');

    updatedData.title = titleInput.value.trim();
    updatedData.videoUrl = videoUrlInput.value;
    updatedData.duration = durationInput.value || '00:00';

  } else if (type === 'assignment') {
    const titleInput = editForm.querySelector('.assignment-title');
    const instructionsInput = editForm.querySelector('.assignment-instructions');

    // Get content type (text or file)
    const contentTypeRadio = editForm.querySelector('input[name*="assignment-content-type"]:checked');
    const contentType = contentTypeRadio ? contentTypeRadio.value : 'text';

    // Get existing data to preserve file info
    const existingDataStr = hiddenLessonItem.getAttribute('data-lesson');
    let existingData = {};
    if (existingDataStr) {
      try {
        existingData = JSON.parse(existingDataStr.replace(/&apos;/g, "'"));
      } catch (e) {
        console.error('Error parsing existing data:', e);
      }
    }

    updatedData.title = titleInput.value.trim();
    updatedData.instructions = instructionsInput.value;
    updatedData.contentType = contentType;
    updatedData.duration = 'Assignment';

    if (contentType === 'text') {
      const textContentInput = editForm.querySelector('.assignment-text');
      updatedData.textContent = textContentInput?.value || '';
      // Clear file data if switching to text
      delete updatedData.fileName;
      delete updatedData.fileUrl;
    } else if (contentType === 'file') {
      const fileInput = editForm.querySelector('.assignment-file');
      
      // Keep existing file data
      updatedData.fileName = existingData.fileName;
      updatedData.fileUrl = existingData.fileUrl;
      
      // If new file is uploaded, update it
      if (fileInput && fileInput.files && fileInput.files[0]) {
        updatedData.fileName = fileInput.files[0].name;
        // You can add file upload logic here later
      }
    }

  } else if (type === 'file') {
    const titleInput = editForm.querySelector('.file-title');
    const descriptionInput = editForm.querySelector('.file-description');
    const fileInput = editForm.querySelector('.file-upload-input');

    updatedData.title = titleInput ? titleInput.value.trim() : '';
    updatedData.description = descriptionInput ? descriptionInput.value : '';
    updatedData.duration = 'File';

    // If new file is uploaded, handle it (you can extend this later)
    if (fileInput && fileInput.files && fileInput.files[0]) {
      updatedData.fileName = fileInput.files[0].name;
    }
  }

  // Validate title
  if (!updatedData.title) {
    showErrorToast('Please enter a title');
    return;
  }

  // Get icon based on type
  let iconSVG = '';
  switch(type) {
    case 'video':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>`;
      break;
    case 'quiz':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
      </svg>`;
      break;
    case 'assignment':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>`;
      break;
    case 'file':
      iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13,2 13,9 20,9"/>
      </svg>`;
      break;
  }

  // Update the lesson data attribute
  hiddenLessonItem.setAttribute('data-lesson', JSON.stringify(updatedData).replace(/'/g, "&apos;"));
  console.log('🎯 UPDATE: Updated data:', updatedData);

  // Update the title in the lesson item display
  const titleElement = hiddenLessonItem.querySelector('.lesson-title-with-icon span:last-child');
  console.log('🎯 UPDATE: titleElement found:', !!titleElement);
  console.log('🎯 UPDATE: old title:', titleElement ? titleElement.textContent : 'not found');
  console.log('🎯 UPDATE: new title:', updatedData.title);

  if (titleElement) {
    titleElement.textContent = updatedData.title;
    console.log('🎯 UPDATE: title updated to:', titleElement.textContent);
  }

  // Update the duration in the lesson item display
  const durationElement = hiddenLessonItem.querySelector('.lesson-duration');
  console.log('🎯 UPDATE: durationElement found:', !!durationElement);
  console.log('🎯 UPDATE: old duration:', durationElement ? durationElement.textContent : 'not found');
  console.log('🎯 UPDATE: new duration:', updatedData.duration);

  if (durationElement) {
    durationElement.textContent = updatedData.duration;
    console.log('🎯 UPDATE: duration updated to:', durationElement.textContent);
  }

  // For video lessons, update video URL
  if (type === 'video' && updatedData.videoUrl) {
    hiddenLessonItem.setAttribute('data-video-url', updatedData.videoUrl);
  }

  // Show the updated lesson item and remove edit form
  hiddenLessonItem.style.display = '';
  editForm.remove();

  // Update module info
  updateModuleInfo(moduleItem);

  showSuccessToast('Lesson updated successfully');
};

// Cancel Edit Function
window.cancelEdit = function(button) {
  const editForm = button.closest('.lesson-edit-form');
  const hiddenLessonItem = editForm.nextElementSibling;

  // Show the original lesson item
  hiddenLessonItem.style.display = '';

  // Remove edit form
  editForm.remove();
};

// Add Question Function
window.addQuestion = function(button) {
  const questionsContainer = button.closest('.form-group').querySelector('.questions-list');

  const questionHTML = `
    <div class="question-item">
      <div class="question-header">
        <input type="text" class="question-input" placeholder="Enter your question" />
        <button type="button" class="remove-question-btn" onclick="removeQuestion(this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="answers-section">
        <div class="answer-option">
          <input type="text" class="answer-input" placeholder="Answer option 1" />
          <div class="answer-checkbox" onclick="toggleAnswerSelection(this)">
            <span class="checkmark">✓</span>
          </div>
        </div>
        <div class="answer-option">
          <input type="text" class="answer-input" placeholder="Answer option 2" />
          <div class="answer-checkbox" onclick="toggleAnswerSelection(this)">
            <span class="checkmark">✓</span>
          </div>
        </div>
        <button type="button" class="add-answer-btn" onclick="addAnswer(this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Answer
        </button>
      </div>
    </div>
  `;

  questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
};

// Remove Question Function
window.removeQuestion = function(button) {
  const questionItem = button.closest('.question-item');
  if (questionItem) {
    questionItem.remove();
  }
};

// Add Answer Function
window.addAnswer = function(button) {
  const answersSection = button.closest('.answers-section');
  const answerCount = answersSection.querySelectorAll('.answer-option').length + 1;

  const answerHTML = `
    <div class="answer-option">
      <input type="text" class="answer-input" placeholder="Answer option ${answerCount}" />
      <div class="answer-checkbox" onclick="toggleAnswerSelection(this)">
        <span class="checkmark">✓</span>
      </div>
    </div>
  `;

  button.insertAdjacentHTML('beforebegin', answerHTML);
};

// Toggle Answer Selection Function
window.toggleAnswerSelection = function(checkbox) {
  checkbox.classList.toggle('checked');
};

// Custom Confirm Dialog
window.showCustomConfirm = function(message, onConfirm) {
  const modalHTML = `
    <div class="delete-confirm-overlay" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 10000; align-items: center; justify-content: center;">
      <div class="delete-confirm-modal" style="background: var(--bg-secondary); border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
        <div class="delete-confirm-header" style="text-align: center; margin-bottom: 16px;">
          <div class="delete-icon" style="width: 48px; height: 48px; background: rgba(255, 59, 48, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2">
              <path d="m3 6 3 0"></path>
              <path d="m19 6-1 0"></path>
              <path d="m8 6 0-2c0-1 1-2 2-2l4 0c1 0 2 1 2 2l0 2"></path>
              <path d="m10 12 0 6"></path>
              <path d="m14 12 0 6"></path>
              <path d="M6 6l1 14c0 1 1 2 2 2l6 0c1 0 2-1 2-2l1-14"></path>
            </svg>
          </div>
          <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 18px; font-weight: 600;">Delete Lesson</h3>
          <p style="margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.5;">${message}</p>
        </div>
        <div class="delete-confirm-actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="cancel-btn" onclick="closeCustomConfirm()" style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; min-width: 80px;">
            Cancel
          </button>
          <button class="confirm-btn" style="background: #ff3b30; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; min-width: 80px;">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.querySelector('.delete-confirm-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add click handler to confirm button
  const confirmBtn = document.querySelector('.delete-confirm-overlay .confirm-btn');
  confirmBtn.onclick = function() {
    closeCustomConfirm();
    if (onConfirm) onConfirm();
  };
};

window.closeCustomConfirm = function() {
  const modal = document.querySelector('.delete-confirm-overlay');
  if (modal) {
    modal.remove();
  }
};

// Delete Lesson Function
window.deleteLesson = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const lessonItem = button.closest('.lesson-item');
  const moduleItem = lessonItem.closest('.module-item');
  const lessonTitle = lessonItem.querySelector('.lesson-title-with-icon span:last-child').textContent;

  showCustomConfirm(`Are you sure you want to delete "${lessonTitle}"?`, function() {
    lessonItem.remove();
    updateModuleInfo(moduleItem);
    showSuccessToast('Lesson deleted successfully');
  });
};

// Cancel Lesson Function
window.cancelLesson = function(button) {
  const lessonForm = button.closest('.lesson-form');
  lessonForm.remove();
};

// Update Module Info
function updateModuleInfo(moduleItem) {
  const lessons = moduleItem.querySelectorAll('.lesson-item').length;
  const moduleInfo = moduleItem.querySelector('.module-info p');

  // Calculate total duration (simplified)
  let totalMinutes = 0;
  const lessonItems = moduleItem.querySelectorAll('.lesson-item');
  lessonItems.forEach(lesson => {
    const timeText = lesson.querySelector('span:last-child').textContent;
    if (timeText.includes('min')) {
      const minutes = parseInt(timeText);
      if (!isNaN(minutes)) {
        totalMinutes += minutes;
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let timeDisplay = '';

  if (hours > 0) {
    timeDisplay = `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) {
      timeDisplay += ` ${minutes} min`;
    }
  } else {
    timeDisplay = `${minutes} min`;
  }

  moduleInfo.textContent = `${lessons} lesson${lessons !== 1 ? 's' : ''} • ${timeDisplay}`;
}

// Add New Module Function
window.addNewModule = function() {
  const modulesContainer = document.getElementById('modulesContainer');
  const existingModules = modulesContainer.querySelectorAll('.module-item').length;
  const newModuleNumber = existingModules + 1;

  const newModuleHTML = `
    <div class="module-item">
      <div class="module-header expanded" onclick="toggleModule(this)">
        <div class="module-info">
          <h4>Module ${newModuleNumber}: New Module</h4>
          <p>0 lessons • 0 hours</p>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button type="button" class="action-btn" onclick="editModule(this, event)">Edit</button>
          <button type="button" class="action-btn delete" onclick="deleteModule(this, event)">Delete</button>
        </div>
      </div>
      <div class="lessons-list" style="display: block;">
        <div class="add-lesson-dropdown">
          <button type="button" class="add-btn dropdown-toggle" onclick="toggleLessonDropdown(this, event)">+ Add</button>
        <div class="dropdown-menu">
          <a href="#" onclick="addLesson('video', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            </svg>
            Video
          </a>
          <a href="#" onclick="addLesson('quiz', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
            </svg>
            Quiz
          </a>
          <a href="#" onclick="addLesson('assignment', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            Assignment
          </a>
          <a href="#" onclick="addLesson('file', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2"/>
              <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            File
          </a>
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
  `;

  // Insert before the "Add new module" button
  const addButton = modulesContainer.querySelector('.add-module-btn');
  addButton.insertAdjacentHTML('beforebegin', newModuleHTML);
};

// Toggle Module Expand/Collapse
window.toggleModule = function(moduleHeader) {
  const lessonsList = moduleHeader.nextElementSibling;
  
  // Check if lessons list is currently visible
  // Use getComputedStyle to check actual display value (including CSS)
  const computedStyle = window.getComputedStyle(lessonsList);
  const isVisible = computedStyle.display !== 'none';

  if (isVisible) {
    lessonsList.style.display = 'none';
    moduleHeader.classList.remove('expanded');
  } else {
    lessonsList.style.display = 'block';
    moduleHeader.classList.add('expanded');
  }
};

// Edit Module
window.editModule = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const moduleHeader = button.closest('.module-header');
  const moduleTitle = moduleHeader.querySelector('h4');
  const currentTitle = moduleTitle.textContent;

  const modalHTML = `
    <div class="modal-overlay" id="editModuleModal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; align-items: center; justify-content: center;" onclick="if(event.target === this) closeEditModuleModal()">
      <div class="modal-content" style="max-width: 500px; width: 90%; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--text-primary);">Edit Module Title</h3>
          <button class="modal-close-btn" onclick="closeEditModuleModal()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-size: 14px; font-weight: 500;">Module Title</label>
            <input type="text" id="moduleTitle" value="${currentTitle}" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary);">
          </div>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px;">
          <button class="btn-secondary" onclick="closeEditModuleModal()" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Cancel</button>
          <button class="btn-primary" onclick="saveModuleTitle()" style="background: var(--primary-color); color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Save</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Store reference to module title element
  window.currentModuleTitle = moduleTitle;
};

window.closeEditModuleModal = function() {
  const modal = document.getElementById('editModuleModal');
  if (modal) modal.remove();
};

window.saveModuleTitle = function() {
  const newTitle = document.getElementById('moduleTitle').value.trim();
  if (newTitle && window.currentModuleTitle) {
    window.currentModuleTitle.textContent = newTitle;
    showSuccessToast('Module title updated successfully!');
  }
  closeEditModuleModal();
};

// Delete Module
window.deleteModule = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const moduleItem = button.closest('.module-item');
  const moduleTitle = moduleItem.querySelector('h4').textContent;
  
  const modalHTML = `
    <div class="modal-overlay" id="deleteModuleModal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; align-items: center; justify-content: center;" onclick="if(event.target === this) closeDeleteModuleModal()">
      <div class="modal-content" style="max-width: 500px; width: 90%; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--text-primary);">Delete Module</h3>
          <button class="modal-close-btn" onclick="closeDeleteModuleModal()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-primary); margin: 0 0 16px 0;">Are you sure you want to delete this module?</p>
          <div style="background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <p style="color: #ff3b30; margin: 0; font-weight: 500;">${moduleTitle}</p>
          </div>
          <p style="color: var(--text-secondary); font-size: 13px; margin: 0;">This action cannot be undone. All lessons in this module will be deleted.</p>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px;">
          <button class="btn-secondary" onclick="closeDeleteModuleModal()" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Cancel</button>
          <button onclick="confirmDeleteModule()" style="background: #ff3b30; color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Delete Module</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Store reference to module item
  window.currentModuleToDelete = moduleItem;
};

window.closeDeleteModuleModal = function() {
  const modal = document.getElementById('deleteModuleModal');
  if (modal) modal.remove();
};

window.confirmDeleteModule = function() {
  if (window.currentModuleToDelete) {
    window.currentModuleToDelete.remove();

    // Renumber remaining modules
    const modulesContainer = document.getElementById('modulesContainer');
    const modules = modulesContainer.querySelectorAll('.module-item');
    modules.forEach((module, index) => {
      const title = module.querySelector('h4');
      const titleText = title.textContent;
      const colonIndex = titleText.indexOf(':');
      if (colonIndex !== -1) {
        const newTitle = `Module ${index + 1}:${titleText.substring(colonIndex + 1)}`;
        title.textContent = newTitle;
      }
    });
    
    showSuccessToast('Module deleted successfully!');
  }
  closeDeleteModuleModal();
};

// Toggle Lesson Dropdown
window.toggleLessonDropdown = function(button, event) {
  console.log('🎯 toggleLessonDropdown called!', button, event);
  
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const dropdown = button.nextElementSibling;
  
  if (!dropdown) {
    console.error('❌ Dropdown menu not found!');
    console.error('❌ Button:', button);
    console.error('❌ Button parent:', button.parentElement);
    console.error('❌ Button siblings:', button.parentElement.children);
    return;
  }
  
  const isVisible = dropdown.classList.contains('show');

  console.log('🎯 Toggle dropdown clicked', { isVisible, dropdown });

  // Close all other dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu !== dropdown) {
      menu.classList.remove('show');
    }
  });

  // Toggle current dropdown
  if (isVisible) {
    dropdown.classList.remove('show');
  } else {
    dropdown.classList.add('show');
  }

  console.log('Dropdown after toggle:', dropdown.classList.contains('show'));

  // Close dropdown when clicking outside
  if (!isVisible) {
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('show');
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }
};

// Open My Courses Page
window.openMyCourses = async function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'My Courses';
  }

  // Update content area only
  contentArea.innerHTML = `
          <!-- Search and Sort Section -->
          <div class="courses-controls">
            <div class="search-section">
              <div class="search-input-wrapper">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input type="text" id="courseSearchInput" placeholder="Search courses..." oninput="searchCourses()">
              </div>
            </div>
            <div class="sort-section">
              <select id="courseSortSelect" onchange="sortCourses()">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <button class="figma-btn figma-btn-primary" onclick="openCreateCourse()" style="margin-left: 15px;">+ Add Course</button>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-cards-grid" id="courseStatsCards">
            <div class="stat-card">
              <div class="stat-card-label">Total courses</div>
              <div class="stat-card-value" id="totalCoursesCount">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-label">Total enrolled</div>
              <div class="stat-card-value" id="totalEnrolledCount">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-label">Total revenue</div>
              <div class="stat-card-value" id="totalRevenueAmount">$0</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-label">Live now</div>
              <div class="stat-card-value" id="liveStudentsCount">0</div>
            </div>
          </div>

          <!-- Course Filter Tabs -->
          <div class="course-filter-tabs" id="courseFilterTabs">
            <button class="filter-tab active" data-filter="active" onclick="filterCourses('active')">Active</button>
            <button class="filter-tab" data-filter="draft" onclick="filterCourses('draft')">Draft</button>
            <button class="filter-tab" data-filter="archived" onclick="filterCourses('archived')">Archived</button>
            <button class="filter-tab" data-filter="free" onclick="filterCourses('free')">Free</button>
            <button class="filter-tab" data-filter="paid" onclick="filterCourses('paid')">Paid</button>
            <button class="filter-tab" data-filter="all" onclick="filterCourses('all')">All</button>
          </div>

          <!-- Course Cards Grid -->
          <div class="my-courses-grid" id="myCoursesGrid">
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading courses...</div>
          </div>
  `;

  // Load courses from backend
  await loadMyCoursesFromBackend();
};

// Enhanced interactive course data
let myCoursesData = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React and Node.js from scratch',
    students: 324,
    lessons: 42,
    price: 199,
    revenue: 6450,
    rating: 4.9,
    status: 'Active',
    type: 'Paid',
    category: 'Web Development',
    color: '#4A90E2',
    createdAt: '2024-01-15',
    updatedAt: '2024-11-10'
  },
  {
    id: 2,
    title: 'UI/UX Design Masterclass',
    description: 'Learn modern UI/UX design principles, Figma, prototyping and user research',
    students: 187,
    lessons: 28,
    price: 149,
    revenue: 2798,
    rating: 4.7,
    status: 'Active',
    type: 'Paid',
    category: 'Design',
    color: '#8B5CF6',
    createdAt: '2024-02-20',
    updatedAt: '2024-11-08'
  },
  {
    id: 3,
    title: 'Python for Beginners',
    description: 'Start your programming journey with Python basics and data structures',
    students: 445,
    lessons: 35,
    price: 99,
    revenue: 4405,
    rating: 4.8,
    status: 'Active',
    type: 'Paid',
    category: 'Programming',
    color: '#10B981',
    createdAt: '2024-01-10',
    updatedAt: '2024-11-05'
  },
  {
    id: 4,
    title: 'React Native Mobile Apps',
    description: 'Build cross-platform mobile applications with React Native',
    students: 89,
    lessons: 52,
    price: 249,
    revenue: 2216,
    rating: 4.6,
    status: 'Draft',
    type: 'Paid',
    category: 'Mobile Development',
    color: '#F59E0B',
    createdAt: '2024-10-15',
    updatedAt: '2024-11-11'
  },
  {
    id: 5,
    title: 'Digital Marketing Strategy',
    description: 'Complete guide to digital marketing, SEO, and social media marketing',
    students: 156,
    lessons: 24,
    price: 79,
    revenue: 1232,
    rating: 4.5,
    status: 'Active',
    type: 'Paid',
    category: 'Marketing',
    color: '#EF4444',
    createdAt: '2024-03-05',
    updatedAt: '2024-10-30'
  },
  {
    id: 6,
    title: 'Introduction to Programming',
    description: 'Free course covering basic programming concepts and logic',
    students: 892,
    lessons: 18,
    price: 0,
    revenue: 0,
    rating: 4.3,
    status: 'Active',
    type: 'Free',
    category: 'Programming',
    color: '#6366F1',
    createdAt: '2024-01-01',
    updatedAt: '2024-10-25'
  },
  {
    id: 7,
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into closures, async/await, and modern JS features',
    students: 67,
    lessons: 31,
    price: 179,
    revenue: 1201,
    rating: 4.9,
    status: 'Draft',
    type: 'Paid',
    category: 'Programming',
    color: '#F97316',
    createdAt: '2024-09-20',
    updatedAt: '2024-11-09'
  },
  {
    id: 8,
    title: 'Cybersecurity Fundamentals',
    description: 'Learn ethical hacking, network security and cybersecurity basics',
    students: 234,
    lessons: 40,
    price: 199,
    revenue: 4658,
    rating: 4.7,
    status: 'Archived',
    type: 'Paid',
    category: 'Security',
    color: '#DC2626',
    createdAt: '2023-11-15',
    updatedAt: '2024-05-20'
  },
  {
    id: 9,
    title: 'Data Science with Python',
    description: 'Learn pandas, numpy, matplotlib and machine learning basics',
    students: 178,
    lessons: 48,
    price: 229,
    revenue: 4074,
    rating: 4.8,
    status: 'Active',
    type: 'Paid',
    category: 'Data Science',
    color: '#059669',
    createdAt: '2024-04-10',
    updatedAt: '2024-11-01'
  },
  {
    id: 10,
    title: 'Blockchain Development',
    description: 'Build smart contracts and decentralized applications with Solidity',
    students: 23,
    lessons: 35,
    price: 299,
    revenue: 688,
    rating: 4.4,
    status: 'Draft',
    type: 'Paid',
    category: 'Blockchain',
    color: '#7C2D12',
    createdAt: '2024-08-15',
    updatedAt: '2024-11-11'
  },
  {
    id: 11,
    title: 'HTML & CSS Basics',
    description: 'Free introduction to web development with HTML and CSS',
    students: 567,
    lessons: 15,
    price: 0,
    revenue: 0,
    rating: 4.2,
    status: 'Active',
    type: 'Free',
    category: 'Web Development',
    color: '#2563EB',
    createdAt: '2023-12-01',
    updatedAt: '2024-09-15'
  },
  {
    id: 12,
    title: 'Machine Learning A-Z',
    description: 'Complete machine learning course with Python and real projects',
    students: 145,
    lessons: 65,
    price: 349,
    revenue: 5060,
    rating: 4.9,
    status: 'Archived',
    type: 'Paid',
    category: 'Machine Learning',
    color: '#7C3AED',
    createdAt: '2023-06-10',
    updatedAt: '2024-03-15'
  }
];

// Render course cards into the grid
function renderCourseCards(courses = mockCourses) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  
  if (courses.length === 0) {
    grid.innerHTML = '<p class="no-results">No courses found.</p>';
    return;
  }

  grid.innerHTML = courses.map(course => `
    <div class="course-card-figma">
      <div class="course-card-thumbnail">
        <img src="${course.image}" alt="${course.title}">
        <span class="course-card-status ${course.status.toLowerCase()}">${course.status}</span>
      </div>
      <div class="course-card-content">
        <span class="course-card-category">${course.category}</span>
        <h4 class="course-card-title">${course.title}</h4>
        <div class="course-card-meta">
          <span>${course.lessons} lessons</span>
          <span>${course.hours} hours</span>
          <span>${course.students} students</span>
        </div>
        <div class="course-card-footer">
          <span class="course-card-price">${course.price}</span>
          <div class="course-card-actions">
            <button class="action-btn-icon" onclick="viewCourse(${course.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="action-btn-icon" onclick="editCourse(${course.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn-icon delete" onclick="deleteCourse(${course.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Placeholder functions for course actions
window.viewCourse = (id) => alert(`Viewing course ${id}`);
window.editCourse = (id) => alert(`Editing course ${id}`);
window.deleteCourse = (id) => confirm(`Are you sure you want to delete course ${id}?`);

// Filtering and Sorting Logic
window.filterCourses = () => {
  const searchInput = document.querySelector('.search-bar input').value.toLowerCase();
  const categoryFilter = document.querySelectorAll('.filter-select')[0].value;
  const statusFilter = document.querySelectorAll('.filter-select')[1].value;

  let filtered = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchInput);
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  renderCourseCards(filtered);
};

window.sortCourses = (event) => {
  const sortBy = event.target.value;
  let sorted = [...mockCourses]; // Use a copy
  
  switch(sortBy) {
    case 'oldest':
      sorted.sort((a, b) => a.id - b.id);
      break;
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
       sorted.sort((a, b) => b.id - a.id);
      break;
  }
  
  // Re-apply filters after sorting
  const searchInput = document.querySelector('.search-bar input').value.toLowerCase();
  const categoryFilter = document.querySelectorAll('.filter-select')[0].value;
  const statusFilter = document.querySelectorAll('.filter-select')[1].value;

  let filteredAndSorted = sorted.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchInput);
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderCourseCards(filteredAndSorted);
};


// Open Finance Page
window.openFinancePage = function() {
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'Finance';
  }
  
  // Add finance-page class to content area
  contentArea.className = 'figma-content-area finance-page';
  
  // Update content area only
  contentArea.innerHTML = `
          <style>
            .figma-content-area.finance-page {
              padding: 24px !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 20px !important;
            }
            .figma-content-area.finance-page .finance-stats-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 16px !important;
              margin-bottom: 0 !important;
            }
            .figma-content-area.finance-page .finance-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 20px !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            }
            .figma-content-area.finance-page .finance-card:hover {
              transform: translateY(-5px) !important;
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.5) !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
            }
            .figma-content-area.finance-page .finance-card-title {
              color: var(--primary-color) !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              margin: 0 !important;
            }
            .figma-content-area.finance-page .finance-card-amount {
              color: #ffffff !important;
              font-size: 32px !important;
              font-weight: 700 !important;
              margin: 6px 0 !important;
              line-height: 1.1 !important;
            }
            .figma-content-area.finance-page .finance-card-subtitle {
              color: #10b981 !important;
              font-size: 12px !important;
              font-weight: 400 !important;
              margin: 0 !important;
            }
            .figma-content-area.finance-page .finance-section {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 24px !important;
              transition: all 0.3s ease !important;
            }
            .figma-content-area.finance-page .section-title {
              color: var(--primary-color) !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              margin: 0 0 20px 0 !important;
            }
            .figma-content-area.finance-page .payment-method-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              padding: 16px !important;
              margin-bottom: 16px !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            }
            .figma-content-area.finance-page .payment-method-card:hover {
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.5) !important;
              transform: translateY(-3px) !important;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3) !important;
            }
            .figma-content-area.finance-page .payment-method-options-btn {
              position: relative !important;
              background: rgba(32, 32, 32, 0.95) !important;
              border: 1px solid var(--primary-border-hover) !important;
              border-radius: 6px !important;
              padding: 6px 8px !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
              z-index: 20 !important;
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
            }
            .figma-content-area.finance-page .payment-method-options-btn:hover {
              background: var(--primary-light) !important;
              border-color: var(--primary-border-strong) !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            }
            .figma-content-area.finance-page .three-dots {
              width: 18px !important;
              height: 18px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: var(--primary-color) !important;
              font-size: 16px !important;
              font-weight: bold !important;
              line-height: 1 !important;
            }
            .figma-content-area.finance-page .payment-dropdown-menu {
              position: absolute !important;
              top: 100% !important;
              right: 0 !important;
              margin-top: 8px !important;
              background: rgba(32, 32, 32, 0.95) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 12px 0 !important;
              min-width: 140px !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--primary-border-light) !important;
              z-index: 1000 !important;
              display: none !important;
              overflow: hidden !important;
              backdrop-filter: blur(10px) !important;
            }
            .figma-content-area.finance-page .payment-dropdown-menu.show {
              display: block !important;
              animation: dropdownFadeIn 0.2s ease !important;
            }
            .figma-content-area.finance-page .dropdown-item {
              padding: 12px 20px !important;
              color: #ffffff !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
            }
            .figma-content-area.finance-page .dropdown-item:hover {
              background: var(--primary-light) !important;
              transform: translateX(2px) !important;
            }
            .figma-content-area.finance-page .dropdown-item.edit {
              color: var(--primary-color) !important;
            }
            .figma-content-area.finance-page .dropdown-item.edit:hover {
              background: var(--primary-light-hover) !important;
              color: var(--primary-color-light) !important;
            }
            .figma-content-area.finance-page .dropdown-item.delete {
              color: #ef4444 !important;
            }
            .figma-content-area.finance-page .dropdown-item.delete:hover {
              background: rgba(239, 68, 68, 0.15) !important;
              color: #f87171 !important;
            }
            .figma-content-area.finance-page .dropdown-item:before {
              content: '' !important;
              width: 6px !important;
              height: 6px !important;
              border-radius: 50% !important;
              background: currentColor !important;
              opacity: 0.6 !important;
            }
            @keyframes dropdownFadeIn {
              from {
                opacity: 0 !important;
                transform: translateY(-8px) scale(0.95) !important;
              }
              to {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
              }
            }
            .figma-content-area.finance-page .section-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              margin-bottom: 20px !important;
              flex-wrap: wrap !important;
              gap: 16px !important;
            }
            .figma-content-area.finance-page .transaction-controls {
              display: flex !important;
              gap: 12px !important;
              flex-wrap: wrap !important;
              align-items: center !important;
            }
            .figma-content-area.finance-page .transaction-search,
            .figma-content-area.finance-page .transaction-date-filter,
            .figma-content-area.finance-page .transaction-type-filter {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              padding: 8px 12px !important;
              color: #ffffff !important;
              font-size: 14px !important;
              transition: all 0.3s ease !important;
            }
            .figma-content-area.finance-page .transaction-search {
              min-width: 200px !important;
            }
            .figma-content-area.finance-page .transaction-search:focus,
            .figma-content-area.finance-page .transaction-date-filter:focus,
            .figma-content-area.finance-page .transaction-type-filter:focus {
              border-color: var(--primary-border-hover) !important;
              outline: none !important;
              background: rgba(58, 56, 56, 0.5) !important;
            }
            .figma-content-area.finance-page .payment-card-content {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .figma-content-area.finance-page .payment-card-name {
              color: #ffffff !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin-bottom: 4px !important;
            }
            .figma-content-area.finance-page .payment-card-number {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 14px !important;
            }
            .figma-content-area.finance-page .payment-card-badge {
              background: #10b981 !important;
              color: #ffffff !important;
              padding: 6px 12px !important;
              border-radius: 16px !important;
              font-size: 12px !important;
              font-weight: 600 !important;
            }
            .figma-content-area.finance-page .add-payment-btn {
              background: transparent !important;
              border: 1px solid var(--primary-border-strong) !important;
              color: var(--primary-color) !important;
              padding: 12px 16px !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              cursor: pointer !important;
              transition: all 0.2s !important;
            }
            .figma-content-area.finance-page .finance-transactions-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .figma-content-area.finance-page .finance-transactions-table th {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              text-align: left !important;
              padding: 12px !important;
              border-bottom: 1px solid var(--primary-border) !important;
            }
            .figma-content-area.finance-page .finance-transactions-table td {
              color: #ffffff !important;
              font-size: 14px !important;
              padding: 12px !important;
              border-bottom: 1px solid var(--primary-border-light) !important;
            }
            .figma-content-area.finance-page .status-completed {
              background: rgba(16, 185, 129, 0.2) !important;
              color: #10b981 !important;
              padding: 4px 10px !important;
              border-radius: 12px !important;
              font-size: 12px !important;
              font-weight: 500 !important;
            }
            .figma-content-area.finance-page .promo-code-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              padding: 16px !important;
              margin-bottom: 16px !important;
              transition: all 0.3s ease !important;
            }
            .figma-content-area.finance-page .promo-code-content {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
            }
            .figma-content-area.finance-page .promo-code-name {
              color: #ffffff !important;
              font-size: 16px !important;
              font-weight: 700 !important;
              margin-bottom: 4px !important;
            }
            .figma-content-area.finance-page .promo-code-description {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 12px !important;
              margin-bottom: 2px !important;
            }
            .figma-content-area.finance-page .promo-code-usage {
              color: rgba(107, 114, 128, 1) !important;
              font-size: 11px !important;
            }
            .figma-content-area.finance-page .promo-edit-btn {
              background: var(--primary-light) !important;
              border: 1px solid var(--primary-border-hover) !important;
              color: var(--primary-color) !important;
              padding: 8px 16px !important;
              border-radius: 8px !important;
              font-size: 12px !important;
              font-weight: 600 !important;
              cursor: pointer !important;
            }
            .figma-content-area.finance-page .add-promo-btn {
              background: transparent !important;
              border: 1px solid var(--primary-border-strong) !important;
              color: var(--primary-color) !important;
              padding: 12px 16px !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              cursor: pointer !important;
            }
            @media (max-width: 1200px) {
              .figma-content-area.finance-page .finance-stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (max-width: 768px) {
              .figma-content-area.finance-page .finance-stats-grid {
                grid-template-columns: 1fr !important;
              }
            }
          </style>
          <!-- Finance Stats Cards -->
          <div class="finance-stats-grid">
            <div class="finance-card" onclick="showFinanceDetails('revenue')">
              <div class="finance-card-header">
                <h3 class="finance-card-title">Total revenue</h3>
              </div>
              <div class="finance-card-amount">$12,450</div>
              <div class="finance-card-subtitle">+ $1,200 this month</div>
            </div>
            <div class="finance-card" onclick="showFinanceDetails('month')">
              <div class="finance-card-header">
                <h3 class="finance-card-title">This month</h3>
              </div>
              <div class="finance-card-amount">$2,845</div>
              <div class="finance-card-subtitle">+ $1,200 this month</div>
            </div>
            <div class="finance-card" onclick="showFinanceDetails('balance')">
              <div class="finance-card-header">
                <h3 class="finance-card-title">Available balance</h3>
              </div>
              <div class="finance-card-amount">$1,250</div>
              <div class="finance-card-subtitle">Ready to withdraw</div>
            </div>
            <div class="finance-card" onclick="showFinanceDetails('referral')">
              <div class="finance-card-header">
                <h3 class="finance-card-title">Referral Earnings</h3>
              </div>
              <div class="finance-card-amount">$485</div>
              <div class="finance-card-subtitle">From 12 referrals</div>
            </div>
          </div>

          <!-- Payment Methods Section -->
          <div class="finance-section payment-methods-section">
            <div class="section-header">
              <h3 class="section-title">Payment methods</h3>
              <div class="payment-method-options-btn" onclick="togglePaymentMenu(this)">
                <div class="three-dots">⋯</div>
                <div class="payment-dropdown-menu">
                  <div class="dropdown-item edit" onclick="editCard()">Edit</div>
                  <div class="dropdown-item delete" onclick="deleteCard()">Delete</div>
                </div>
              </div>
            </div>
            <div class="payment-method-card" onclick="showPaymentDetails()">
              <div class="payment-card-content">
                <div class="payment-card-info">
                  <div class="payment-card-name">UzBank Card</div>
                  <div class="payment-card-number">**** **** **** 1234</div>
                </div>
                <div class="payment-card-badge">Primary</div>
              </div>
            </div>
            <button class="add-payment-btn" onclick="addPaymentMethod()">+ Add a payment method</button>
          </div>

          <!-- Recent Transactions Section -->
          <div class="finance-section transactions-section">
            <div class="section-header">
              <h3 class="section-title">Recent transactions</h3>
              <div class="transaction-controls">
                <input type="text" placeholder="Search transactions..." class="transaction-search" oninput="filterTransactions()">
                <input type="date" class="transaction-date-filter" onchange="filterTransactions()">
                <select class="transaction-type-filter" onchange="filterTransactions()">
                  <option value="">All Types</option>
                  <option value="Sale">Sales</option>
                  <option value="Payout">Payouts</option>
                  <option value="Refund">Refunds</option>
                </select>
              </div>
            </div>
            <div class="transactions-table-wrapper">
              <table class="finance-transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Student</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Oct 10, 2025</td>
                    <td>React Masterclass</td>
                    <td>John Smith</td>
                    <td>Uzum</td>
                    <td>$150</td>
                    <td><span class="status-completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td>Oct 9, 2025</td>
                    <td>UI/UX Design</td>
                    <td>Sarah Connor</td>
                    <td>Uzum</td>
                    <td>$200</td>
                    <td><span class="status-completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td>Oct 8, 2025</td>
                    <td>JavaScript</td>
                    <td>Mike Johnson</td>
                    <td>Uzum</td>
                    <td>$135</td>
                    <td><span class="status-completed">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Promo Codes Section -->
          <div class="finance-section promo-section">
            <div class="section-header">
              <h3 class="section-title">Promo Codes</h3>
            </div>
            <div class="promo-code-card">
              <div class="promo-code-content">
                <div class="promo-code-info">
                  <div class="promo-code-name">NEWSTUDENT30</div>
                  <div class="promo-code-description">30% discount for new students</div>
                  <div class="promo-code-usage">Used: 45 times · Expires: Dec 31, 2025</div>
                </div>
                <button class="promo-edit-btn">Edit</button>
              </div>
            </div>
            <button class="add-promo-btn">+ Create a new Promo Code</button>
          </div>
  `;
  
  // Apply saved primary color to Finance page
  const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
  applyPrimaryColor(savedColor);
};

// Open AI Assistant Page
function openAIAssistantPage() {
  console.log('Opening AI Assistant Page');

  try {
    // Update page title
    const titleElement = document.querySelector('.figma-title h2');
    const contentArea = document.querySelector('.figma-content-area');

    if (titleElement) {
      titleElement.textContent = 'AI Assistant';
    }

    if (contentArea) {
      contentArea.className = 'figma-content-area ai-assistant-page';
      contentArea.innerHTML = `
        <div class="ai-assistant-container">
          <style>
            .figma-content-area.ai-assistant-page {
              background: #1a1a1a !important;
              padding: 24px !important;
              overflow-y: auto !important;
            }
            .ai-assistant-container {
              max-width: 900px !important;
              margin: 0 auto !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 20px !important;
            }
            .ai-status-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 24px !important;
              display: flex !important;
              align-items: center !important;
              gap: 16px !important;
            }
            .ai-icon {
              width: 56px !important;
              height: 56px !important;
              background: var(--primary-light-hover) !important;
              border-radius: 12px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 32px !important;
              flex-shrink: 0 !important;
            }
            .ai-status-content h3 {
              color: #ffffff !important;
              font-size: 24px !important;
              font-weight: 600 !important;
              margin: 0 0 8px 0 !important;
            }
            .ai-status-content p {
              color: rgba(156, 163, 175, 1) !important;
              margin: 0 !important;
              font-size: 16px !important;
            }
            .ai-metrics {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            .ai-metric-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 24px !important;
              text-align: center !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
            }
            .ai-metric-card:hover {
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.5) !important;
              transform: translateY(-5px) !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
            }
            .ai-metric-card h4 {
              color: var(--primary-color) !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              margin: 0 0 12px 0 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
            }
            .ai-metric-value {
              color: #ffffff !important;
              font-size: 36px !important;
              font-weight: 700 !important;
              margin: 0 0 8px 0 !important;
            }
            .ai-metric-change {
              color: #22c55e !important;
              font-size: 14px !important;
              font-weight: 500 !important;
            }
            .ai-personality-section,
            .ai-auto-response-section,
            .ai-responses-section {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 20px !important;
            }
            .section-title {
              color: #ffffff !important;
              font-size: 20px !important;
              font-weight: 600 !important;
              margin: 0 0 16px 0 !important;
            }
            .form-group {
              margin-bottom: 16px !important;
            }
            .form-group:last-child {
              margin-bottom: 0 !important;
            }
            .form-label {
              color: var(--primary-color) !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              margin-bottom: 8px !important;
              display: block !important;
            }
            .form-input,
            .form-textarea,
            select.form-input {
              width: 100% !important;
              padding: 12px !important;
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              color: #ffffff !important;
              font-size: 14px !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            }
            select.form-input {
              appearance: none !important;
              background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%237EA2D4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
              background-repeat: no-repeat !important;
              background-position: right 12px center !important;
              padding-right: 40px !important;
            }
            select.form-input option {
              background: #2d2d32 !important;
              color: #ffffff !important;
              padding: 12px !important;
            }
            .form-textarea {
              resize: vertical !important;
              min-height: 100px !important;
            }
            .form-input:focus,
            .form-textarea:focus {
              outline: none !important;
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.5) !important;
            }
            .settings-item {
              display: flex !important;
              align-items: flex-start !important;
              justify-content: space-between !important;
              padding: 16px !important;
              background: rgba(45, 45, 50, 0.3) !important;
              border: 1px solid rgba(75, 85, 99, 0.2) !important;
              border-radius: 8px !important;
              transition: all 0.3s ease !important;
            }
            .settings-item:hover {
              background: rgba(45, 45, 50, 0.5) !important;
            }
            .setting-left {
              flex: 1 !important;
              margin-right: 16px !important;
            }
            .setting-title {
              color: #ffffff !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin-bottom: 4px !important;
              line-height: 1.2 !important;
            }
            .setting-description {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 14px !important;
              line-height: 1.4 !important;
            }
            .setting-toggle {
              display: flex !important;
              align-items: flex-start !important;
            }
            .toggle-switch-new {
              position: relative !important;
              display: inline-block !important;
              width: 44px !important;
              height: 24px !important;
              background-color: rgba(75, 85, 99, 0.6) !important;
              border-radius: 12px !important;
              cursor: pointer !important;
              transition: background-color 0.3s ease !important;
            }
            .toggle-switch-new input {
              position: absolute !important;
              opacity: 0 !important;
              width: 0 !important;
              height: 0 !important;
            }
            .toggle-switch-new .toggle-thumb {
              position: absolute !important;
              top: 2px !important;
              left: 2px !important;
              width: 20px !important;
              height: 20px !important;
              background-color: white !important;
              border-radius: 50% !important;
              transition: transform 0.3s ease !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            }
            .toggle-switch-new input:checked ~ .toggle-thumb {
              transform: translateX(20px) !important;
            }
            .toggle-switch-new input:checked {
              background-color: #3b82f6 !important;
            }
            .toggle-switch-new:has(input:checked) {
              background-color: #3b82f6 !important;
            }
            .response-item {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              padding: 16px !important;
              margin-bottom: 12px !important;
              transition: all 0.3s ease !important;
            }
            .response-item:last-child {
              margin-bottom: 0 !important;
            }
            .response-item:hover {
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.5) !important;
            }
            .response-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              margin-bottom: 16px !important;
            }
            .response-user {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
            }
            .user-avatar {
              width: 32px !important;
              height: 32px !important;
              background: var(--border-color) !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 14px !important;
              color: var(--primary-color) !important;
            }
            .user-info h6 {
              color: #ffffff !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              margin: 0 !important;
            }
            .user-info span {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 12px !important;
            }
            .edit-btn {
              background: var(--primary-light) !important;
              border: 1px solid var(--primary-border-hover) !important;
              color: var(--primary-color) !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 12px !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
            }
            .edit-btn:hover {
              background: rgba(126, 162, 212, 0.3) !important;
            }
            .question-text,
            .response-text {
              color: rgba(156, 163, 175, 1) !important;
              font-size: 14px !important;
              margin: 0 0 12px 0 !important;
            }
            .ai-response-text {
              color: #ffffff !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
              margin: 0 !important;
            }
            @media (max-width: 768px) {
              .ai-metrics {
                grid-template-columns: 1fr !important;
              }
              .figma-content-area.ai-assistant-page {
                padding: 16px !important;
              }
            }
          </style>

          <!-- AI Status Card -->
          <div class="ai-status-card">
            <div class="ai-icon">🤖</div>
            <div class="ai-status-content">
              <h3>AI Assistant Status</h3>
              <p>• 156 questions answered today</p>
            </div>
          </div>

          <!-- AI Metrics -->
          <div class="ai-metrics">
            <div class="ai-metric-card" onclick="showAIMetrics('responses')">
              <h4>Total AI Responses</h4>
              <div class="ai-metric-value">2,847</div>
              <div class="ai-metric-change">↑ 23% this month</div>
            </div>
            <div class="ai-metric-card" onclick="showAIMetrics('time')">
              <h4>Response Time</h4>
              <div class="ai-metric-value">1.2s</div>
              <div class="ai-metric-change">Lightning fast</div>
            </div>
          </div>

          <!-- Course Selection Section -->
          <div class="ai-personality-section">
            <h3 class="section-title">Course Selection</h3>
            <div class="form-group">
              <label class="form-label">Select Course for AI Training</label>
              <select class="form-input" id="aiCourseSelect" onchange="handleCourseSelection(this.value)">
                <option value="">-- Kursni tanlang --</option>
                <option value="course1">React.js - Beginner to Advanced</option>
                <option value="course2">Node.js Backend Development</option>
                <option value="course3">Python for Data Science</option>
                <option value="course4">JavaScript Fundamentals</option>
              </select>
              <p style="color: rgba(156, 163, 175, 1); margin-top: 8px; font-size: 13px;">AI faqat tanlangan kurs bo'yicha ma'lumotlar bilan javob beradi</p>
            </div>
          </div>

          <!-- AI Personality Section -->
          <div class="ai-personality-section">
            <h3 class="section-title">AI Personality</h3>
            <div class="form-group">
              <label class="form-label">AI Name</label>
              <input type="text" class="form-input" value="DarsLinker AI Assistant" placeholder="AI yordamchi nomini kiriting">
            </div>
            <div class="form-group">
              <label class="form-label">AI Instructions</label>
              <textarea class="form-textarea" placeholder="AI qanday javob berishini tavsiflang...">Siz yordam beruvchi o'qituvchi yordamchisisiz. Har doim o'quvchilarni rag'batlantiring va aniq misollar keltiring. Faqat tanlangan kurs mavzulari bo'yicha javob bering.</textarea>
            </div>
          </div>

          <!-- Auto-Response Settings -->
          <div class="ai-auto-response-section">
            <h3 class="section-title">AI Auto-Response Settings</h3>
            <p style="color: rgba(156, 163, 175, 1); margin-bottom: 16px; font-size: 14px;">Control where and when AI can automatically respond to students</p>

            <div class="settings-item">
              <div class="setting-left">
                <div class="setting-title">Answer Lesson Comments</div>
                <div class="setting-description">AI will respond to student questions in lesson comment sections</div>
              </div>
              <div class="setting-toggle">
                <label class="toggle-switch-new">
                  <input type="checkbox" checked onchange="toggleAISetting(this)">
                  <div class="toggle-thumb"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Recent AI Responses -->
          <div class="ai-responses-section">
            <h3 class="section-title">Recent AI Responses</h3>

            <div class="response-item">
              <div class="response-header">
                <div class="response-user">
                  <div class="user-avatar">AJ</div>
                  <div class="user-info">
                    <h6>Alex Johnson</h6>
                    <span>React Hooks lesson • 2 min ago</span>
                  </div>
                </div>
                <button class="edit-btn" onclick="editAIResponse(1)">Edit</button>
              </div>
              <div class="response-content">
                <p class="question-text"><strong>Question:</strong><br>"What's the difference between useState and useEffect?"</p>
                <p class="response-text"><strong>AI Response:</strong><br>useState manages component state, while useEffect handles side effects like API calls. Check Lesson 5 for examples!</p>
              </div>
            </div>

            <div class="response-item">
              <div class="response-header">
                <div class="response-user">
                  <div class="user-avatar">AJ</div>
                  <div class="user-info">
                    <h6>Alex Johnson</h6>
                    <span>React Hooks lesson • 2 min ago</span>
                  </div>
                </div>
                <button class="edit-btn" onclick="editAIResponse(2)">Edit</button>
              </div>
              <div class="response-content">
                <p class="question-text"><strong>Question:</strong><br>"What's the difference between useState and useEffect?"</p>
                <p class="response-text"><strong>AI Response:</strong><br>useState manages component state, while useEffect handles side effects like API calls. Check Lesson 5 for examples!</p>
              </div>
            </div>
          </div>
        </div>
  `;
    } else {
      console.error('Content area not found');
    }
  } catch (error) {
    console.error('Error opening AI Assistant page:', error);
  }
};

// Open Assignments Page
window.openAssignmentsPage = async function() {
  const contentArea = document.querySelector('.figma-content-area');

  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'Assignments';
  }

  // Add assignments-page class to content area
  contentArea.className = 'figma-content-area assignments-page';

  // Show loading state first
  contentArea.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 400px; color: var(--primary-color); font-size: 18px;">
      <div>Loading assignments...</div>
    </div>
  `;

  try {
    // Get current teacher data - check multiple storage locations
    let currentTeacher = null;
    let teacherId = null;

    // First try to get full teacher data from localStorage/sessionStorage
    let currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
      currentUserData = sessionStorage.getItem('currentUser');
    }

    if (currentUserData) {
      try {
        currentTeacher = JSON.parse(currentUserData);
        teacherId = currentTeacher._id;
      } catch (e) {
        console.warn('Failed to parse currentUser data:', e);
      }
    }

    // If no full teacher data, try to get just the teacher ID
    if (!teacherId) {
      teacherId = sessionStorage.getItem('currentTeacherId');
    }

    if (!teacherId) {
      console.error('❌ No teacher ID found in session storage:', {
        localStorage_currentUser: localStorage.getItem('currentUser'),
        sessionStorage_currentUser: sessionStorage.getItem('currentUser'),
        sessionStorage_currentTeacherId: sessionStorage.getItem('currentTeacherId')
      });
      throw new Error('Teacher ID not found in session storage');
    }

    console.log('✅ Found teacher ID:', teacherId);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    // Fetch teacher's submissions and courses in parallel
    const [submissionsResponse, coursesResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/submissions/teacher/${teacherId}`),
      fetch(`${apiBaseUrl}/teachers/${teacherId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      })
    ]);

    if (!submissionsResponse.ok) {
      throw new Error('Failed to fetch submissions');
    }

    const submissionsData = await submissionsResponse.json();
    const submissions = submissionsData.submissions || [];

    // Calculate statistics
    const totalAssignments = submissions.length;
    const pendingAssignments = submissions.filter(s => s.status === 'submitted').length;
    const gradedAssignments = submissions.filter(s => s.status === 'graded').length;
    const averageGrade = gradedAssignments > 0
      ? Math.round(submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / gradedAssignments)
      : 0;

    // Get unique courses from submissions
    const courseMap = new Map();
    submissions.forEach(submission => {
      if (submission.courseId && submission.courseId._id) {
        courseMap.set(submission.courseId._id, submission.courseId.title);
      }
    });

    // Generate course filter options
    const courseOptions = Array.from(courseMap.entries()).map(([id, title]) =>
      `<option value="${id}">${title}</option>`
    ).join('');

    // Store data globally for filter function access
    window.assignmentSubmissions = submissions;
    window.assignmentCourseData = {
      'all': 'all courses',
      ...Object.fromEntries(courseMap)
    };

    // Update content area with dynamic data
    contentArea.innerHTML = `
          <style>
            .course-filter-section {
              background: rgba(32, 32, 32, 0.4) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 20px 24px !important;
              margin-bottom: 24px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              gap: 20px !important;
            }
            .course-filter-left {
              display: flex !important;
              align-items: center !important;
              gap: 16px !important;
            }
            .course-filter-label {
              color: var(--primary-color) !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              white-space: nowrap !important;
            }
            .course-select {
              background: rgba(32, 32, 32, 0.8) !important;
              border: 1px solid var(--border-color) !important;
              border-radius: 10px !important;
              padding: 12px 16px !important;
              color: #ffffff !important;
              font-size: 14px !important;
              min-width: 250px !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
            }
            .course-select:hover, .course-select:focus {
              border-color: var(--primary-border-strong) !important;
              outline: none !important;
              box-shadow: 0 0 0 3px var(--primary-light) !important;
            }
            .course-select option {
              background: rgba(32, 32, 32, 1) !important;
              color: #ffffff !important;
              padding: 10px !important;
            }
            .assignment-counter {
              background: var(--primary-light) !important;
              border: 1px solid var(--border-color) !important;
              border-radius: 8px !important;
              padding: 8px 16px !important;
              color: var(--primary-color) !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              white-space: nowrap !important;
            }
            .figma-content-area.assignments-page {
              padding: 24px !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 20px !important;
            }
            .assignments-stats-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 16px !important;
              margin-bottom: 0 !important;
            }
            .assignments-card {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 20px !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
              transition: all 0.3s ease !important;
            }
            .assignments-card-title {
              color: var(--primary-color) !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              margin: 0 !important;
            }
            .assignments-card-amount {
              color: #ffffff !important;
              font-size: 32px !important;
              font-weight: 700 !important;
              margin: 4px 0 !important;
            }
            .assignment-tabs {
              display: flex !important;
              gap: 0 !important;
              margin-bottom: 20px !important;
            }
            .assignment-tab {
              background: rgba(58, 56, 56, 0.3) !important;
              color: rgba(156, 163, 175, 1) !important;
              border: 1px solid var(--primary-border) !important;
              padding: 12px 24px !important;
              cursor: pointer !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              transition: all 0.3s ease !important;
            }
            .assignment-tab:first-child {
              border-radius: 8px 0 0 8px !important;
            }
            .assignment-tab:last-child {
              border-radius: 0 8px 8px 0 !important;
              border-left: none !important;
            }
            .assignment-tab.active {
              background: var(--primary-light) !important;
              color: var(--primary-color) !important;
            }
            .assignments-section {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 12px !important;
              padding: 24px !important;
            }
            .assignments-section-title {
              color: var(--primary-color) !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              margin: 0 0 20px 0 !important;
            }
            .assignment-item {
              background: rgba(58, 56, 56, 0.3) !important;
              border: 1px solid var(--primary-border) !important;
              border-radius: 8px !important;
              padding: 20px !important;
              margin-bottom: 16px !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            }
            .assignment-item:hover {
              border-color: var(--primary-border-hover) !important;
              background: rgba(58, 56, 56, 0.4) !important;
            }
            .assignment-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              margin-bottom: 12px !important;
            }
            .assignment-title {
              color: #ffffff !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin: 0 0 4px 0 !important;
            }
            .assignment-meta {
              font-size: 12px !important;
              color: rgba(156, 163, 175, 1) !important;
            }
            .assignment-status {
              background: rgba(249, 115, 22, 0.2) !important;
              color: #f97316 !important;
              padding: 4px 12px !important;
              border-radius: 12px !important;
              font-size: 12px !important;
              font-weight: 500 !important;
            }
            .assignment-status.graded {
              background: rgba(16, 185, 129, 0.2) !important;
              color: #10B981 !important;
            }
            .assignment-description {
              color: rgba(255, 255, 255, 0.8) !important;
              font-size: 14px !important;
              margin-bottom: 16px !important;
            }
            .assignment-action {
              align-self: flex-end !important;
            }
            .assignment-action {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
            }
            .grade-btn {
              background: var(--primary-light) !important;
              border: 1px solid var(--primary-color) !important;
              color: var(--primary-color) !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 12px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: background 0.2s ease, border-color 0.2s ease !important;
              height: 32px !important;
            }
            .grade-btn:hover {
              background: rgba(var(--primary-color-rgb), 0.2) !important;
              border-color: var(--primary-color) !important;
            }
            .view-file-btn {
              display: inline-flex !important;
              align-items: center !important;
              gap: 6px !important;
              background: var(--primary-light) !important;
              border: 1px solid var(--primary-color) !important;
              color: var(--primary-color) !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 12px !important;
              font-weight: 500 !important;
              text-decoration: none !important;
              cursor: pointer !important;
              transition: background 0.2s ease, border-color 0.2s ease !important;
              height: 32px !important;
            }
            .view-file-btn:hover {
              background: rgba(var(--primary-color-rgb), 0.2) !important;
              border-color: var(--primary-color) !important;
            }
            .view-file-btn svg {
              width: 14px !important;
              height: 14px !important;
            }
            @media (max-width: 1200px) {
              .assignments-stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (max-width: 768px) {
              .assignments-stats-grid {
                grid-template-columns: 1fr !important;
              }
              .figma-content-area.assignments-page {
                padding: 16px !important;
              }
            }
          </style>


          <!-- Course Filter Section -->
          <div class="course-filter-section">
            <div class="course-filter-left">
              <span class="course-filter-label">Filter by Course:</span>
              <select class="course-select" id="courseFilterSelect" onchange="filterAssignmentsByCourse(this.value)">
                <option value="all">All Courses</option>
                ${courseOptions}
              </select>
            </div>
            <div class="assignment-counter" id="assignment-counter">
              Showing ${totalAssignments} assignments from all courses
            </div>
          </div>

          <!-- Assignment Statistics Cards -->
          <div class="assignments-stats-grid">
            <div class="assignments-card" style="cursor: default;">
              <h3 class="assignments-card-title">Total assignments</h3>
              <div class="assignments-card-amount">${totalAssignments}</div>
            </div>
            <div class="assignments-card" style="cursor: default;">
              <h3 class="assignments-card-title">Pending Review</h3>
              <div class="assignments-card-amount">${pendingAssignments}</div>
            </div>
            <div class="assignments-card" style="cursor: default;">
              <h3 class="assignments-card-title">Graded</h3>
              <div class="assignments-card-amount">${gradedAssignments}</div>
            </div>
            <div class="assignments-card" style="cursor: default;">
              <h3 class="assignments-card-title">Average grade</h3>
              <div class="assignments-card-amount">${averageGrade}%</div>
            </div>
          </div>

          <!-- Assignment Filter Tabs -->
          <div class="assignment-tabs">
            <div class="assignment-tab active" onclick="switchAssignmentTab(this, 'all')">All</div>
            <div class="assignment-tab" onclick="switchAssignmentTab(this, 'pending')">Pending</div>
            <div class="assignment-tab" onclick="switchAssignmentTab(this, 'graded')">Graded</div>
          </div>

          <!-- Assignments Section -->
          <div class="assignments-section">
            <h3 class="assignments-section-title">All assignments</h3>

            <!-- Assignment Items -->
            ${submissions.length === 0 ? `
              <div class="no-assignments">
                <div class="no-assignments-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3>No assignments yet</h3>
                <p>Assignment submissions will appear here once students start submitting their work.</p>
              </div>
            ` : submissions.map((submission, index) => {
              const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const courseTitle = submission.courseId?.title || 'Unknown Course';
              const studentName = submission.studentId?.firstName && submission.studentId?.lastName
                ? `${submission.studentId.firstName} ${submission.studentId.lastName}`
                : 'Unknown Student';

              return `
                <div class="assignment-item" data-course="${submission.courseId?._id || ''}" data-status="${submission.status}">
                  <div class="assignment-header">
                    <div>
                      <h4 class="assignment-title">${submission.lessonTitle || 'Assignment Submission'}</h4>
                      <div class="assignment-meta">
                        Submitted: ${submittedDate} • ${courseTitle} • ${studentName}
                      </div>
                    </div>
                    <span class="assignment-status ${submission.status === 'graded' ? 'graded' : 'pending'}">${submission.status === 'graded' ? 'Graded' : 'Pending'}</span>
                  </div>
                  <div class="assignment-description">
                    <strong>File:</strong> ${submission.fileName || 'submission.pdf'}
                    ${submission.instructions ? `<br><strong>Instructions:</strong> ${submission.instructions}` : ''}
                    ${submission.feedback ? `<br><strong>Feedback:</strong> ${submission.feedback}` : ''}
                  </div>
                  <div class="assignment-action">
                    ${submission.status === 'graded'
                      ? `<div class="grade-display">Grade: ${submission.grade}%</div>`
                      : `<button class="grade-btn" onclick="gradeAssignment('${submission._id}', '${submission.fileName}', '${submission.fileUrl}')">Grade now</button>`
                    }
                    <a href="${submission.fileUrl}" target="_blank" class="view-file-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      View File
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
  `;

    // Apply saved primary color to Assignment page
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);

  } catch (error) {
    console.error('Error loading assignments:', error);

    // Show error state
    contentArea.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; text-align: center; color: #ff6b6b;">
        <div style="margin-bottom: 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #ffffff;">Failed to load assignments</h3>
        <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.7);">There was an error loading the assignment data. Please try again.</p>
        <button onclick="openAssignmentsPage()" style="padding: 10px 20px; background: #7ea2d4; border: none; border-radius: 6px; color: white; cursor: pointer;">
          Try Again
        </button>
      </div>
    `;
  }
};

// Assignment Interactive Functions
window.showAssignmentDetails = function(cardType) {
  const details = {
    total: {
      title: 'Total Assignments Overview',
      content: `
        <div class="modal-content">
          <h3>Assignment Statistics</h3>
          <div class="assignment-breakdown">
            <div class="breakdown-item">
              <span>This Month:</span>
              <span>45 assignments</span>
            </div>
            <div class="breakdown-item">
              <span>This Week:</span>
              <span>12 assignments</span>
            </div>
            <div class="breakdown-item">
              <span>Today:</span>
              <span>3 assignments</span>
            </div>
            <div class="breakdown-total">
              <span>Total All Time:</span>
              <span>235 assignments</span>
            </div>
          </div>
        </div>
      `
    },
    pending: {
      title: 'Pending Assignments Details',
      content: `
        <div class="modal-content">
          <h3>Review Queue</h3>
          <div class="pending-stats">
            <div class="stat-item">
              <span>Submitted Today:</span>
              <span>5</span>
            </div>
            <div class="stat-item">
              <span>Overdue Reviews:</span>
              <span>3</span>
            </div>
            <div class="stat-item">
              <span>Average Wait Time:</span>
              <span>2.5 days</span>
            </div>
          </div>
          <button class="review-all-btn" onclick="reviewAllAssignments()">Start Review Session</button>
        </div>
      `
    },
    graded: {
      title: 'Graded Assignments',
      content: `
        <div class="modal-content">
          <h3>Grading Summary</h3>
          <div class="graded-stats">
            <div class="stat-item">
              <span>A Grade (90-100%):</span>
              <span>85 assignments</span>
            </div>
            <div class="stat-item">
              <span>B Grade (80-89%):</span>
              <span>90 assignments</span>
            </div>
            <div class="stat-item">
              <span>C Grade (70-79%):</span>
              <span>35 assignments</span>
            </div>
            <div class="stat-item">
              <span>Below 70%:</span>
              <span>10 assignments</span>
            </div>
          </div>
        </div>
      `
    },
    grade: {
      title: 'Grade Analysis',
      content: `
        <div class="modal-content">
          <h3>Grade Distribution</h3>
          <div class="grade-analysis">
            <div class="grade-bar">
              <span>Average Grade: 80%</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 80%"></div>
              </div>
            </div>
            <div class="grade-trends">
              <div class="trend-item">
                <span>Trend:</span>
                <span style="color: #22c55e;">↗ +2.5% this month</span>
              </div>
              <div class="trend-item">
                <span>Best Course:</span>
                <span>React Masterclass (85%)</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  showModal(details[cardType].title, details[cardType].content);
};

window.reviewAllAssignments = function() {
  showMessage('Starting review session...', 'info');
  closeModal();
  // Switch to all tab by default
  const allTab = document.querySelector('.assignment-tab');
  switchAssignmentTab(allTab, 'all');
};

// Enhanced Assignment tab switching function
window.switchAssignmentTab = function(tabElement, tabType) {
  // Remove active class from all tabs
  document.querySelectorAll('.assignment-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Add active class to clicked tab
  tabElement.classList.add('active');

  // Update section title and content
  const sectionTitle = document.querySelector('.assignments-section-title');
  const assignmentsSection = document.querySelector('.assignments-section');

  if (tabType === 'all') {
    sectionTitle.textContent = 'All assignments';
    updateAssignmentsList('all');
  } else if (tabType === 'pending') {
    sectionTitle.textContent = 'Pending assignments';
    updateAssignmentsList('pending');
  } else {
    sectionTitle.textContent = 'Graded assignments';
    updateAssignmentsList('graded');
  }
};

// Update assignments list based on filter
window.updateAssignmentsList = function(filterType) {
  const assignmentsContainer = document.querySelector('.assignments-section');
  
  // Get all assignment items
  const allItems = assignmentsContainer.querySelectorAll('.assignment-item');
  
  // Filter and show/hide based on status
  allItems.forEach(item => {
    const status = item.getAttribute('data-status');
    
    if (filterType === 'pending') {
      // Show only submitted (pending) assignments
      if (status === 'submitted') {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    } else if (filterType === 'graded') {
      // Show only graded assignments
      if (status === 'graded') {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    } else {
      // Show all
      item.style.display = 'block';
    }
  });
  
  // Check if any items are visible
  const visibleItems = Array.from(allItems).filter(item => item.style.display !== 'none');
  
  if (visibleItems.length === 0) {
    // Show "no assignments" message
    const existingNoMsg = assignmentsContainer.querySelector('.no-assignments-msg');
    if (existingNoMsg) existingNoMsg.remove();
    
    const noAssignmentsMsg = document.createElement('div');
    noAssignmentsMsg.className = 'no-assignments-msg';
    noAssignmentsMsg.style.cssText = 'padding: 40px; text-align: center; color: rgba(255,255,255,0.5);';
    noAssignmentsMsg.textContent = filterType === 'pending' ? 'No pending assignments' : 'No graded assignments yet';
    assignmentsContainer.appendChild(noAssignmentsMsg);
  } else {
    // Remove "no assignments" message if exists
    const existingNoMsg = assignmentsContainer.querySelector('.no-assignments-msg');
    if (existingNoMsg) existingNoMsg.remove();
  }
};

// Course Filter Function
window.filterAssignmentsByCourse = function(courseValue) {
  const assignmentItems = document.querySelectorAll('.assignment-item');
  const counter = document.getElementById('assignment-counter');
  const statsCards = document.querySelectorAll('.assignments-card-amount');

  let visibleCount = 0;

  // Get actual course data from global assignment data
  const courseNames = window.assignmentCourseData || { 'all': 'all courses' };
  const allSubmissions = window.assignmentSubmissions || [];

  // Filter assignment items
  assignmentItems.forEach(item => {
    const itemCourse = item.getAttribute('data-course');
    if (courseValue === 'all' || itemCourse === courseValue) {
      item.style.display = 'block';
      item.style.animation = 'slideInRight 0.3s ease';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  // Calculate statistics for filtered submissions
  let filteredSubmissions = allSubmissions;
  if (courseValue !== 'all') {
    filteredSubmissions = allSubmissions.filter(s => s.courseId && s.courseId._id === courseValue);
  }

  const totalAssignments = filteredSubmissions.length;
  const pendingAssignments = filteredSubmissions.filter(s => s.status === 'submitted').length;
  const gradedAssignments = filteredSubmissions.filter(s => s.status === 'graded').length;
  const averageGrade = gradedAssignments > 0
    ? Math.round(filteredSubmissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / gradedAssignments)
    : 0;

  // Update counter
  const courseName = courseNames[courseValue] || courseNames['all'] || 'selected course';
  counter.textContent = `Showing ${visibleCount} assignments from ${courseName}`;

  // Update statistics cards
  if (statsCards[0]) statsCards[0].textContent = totalAssignments;
  if (statsCards[1]) statsCards[1].textContent = pendingAssignments;
  if (statsCards[2]) statsCards[2].textContent = gradedAssignments;
  if (statsCards[3]) statsCards[3].textContent = averageGrade + '%';


  // Add slide-in animation CSS if not exists
  if (!document.getElementById('slideAnimation')) {
    const style = document.createElement('style');
    style.id = 'slideAnimation';
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Enhanced Grade assignment function
window.gradeAssignment = async function(assignmentId, fileName, fileUrl) {
  const gradingModal = `
    <div class="grading-form">
      <div class="grade-input-group">
        <label>Grade (0-100)</label>
        <input type="number" min="0" max="100" placeholder="85" class="grade-input" id="gradeValue" />
      </div>

      <div class="feedback-group">
        <label>Feedback</label>
        <textarea class="feedback-textarea" placeholder="Write your feedback here..." rows="4"></textarea>
      </div>

      <div class="grading-actions">
        <button class="cancel-grade-btn" onclick="closeModal()">Cancel</button>
        <button class="submit-grade-btn" onclick="submitGrade('${assignmentId}')">Submit Grade</button>
      </div>
    </div>
    <style>
      .grading-form .grade-input-group,
      .grading-form .feedback-group {
        margin-bottom: 20px;
      }
      .grading-form label {
        display: block;
        margin-bottom: 8px;
        color: var(--primary-color);
        font-weight: 500;
        font-size: 14px;
      }
      .grade-input {
        width: 100%;
        padding: 10px 12px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 16px;
        transition: border-color 0.2s ease;
      }
      .grade-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      .feedback-textarea {
        width: 100%;
        padding: 12px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 14px;
        resize: vertical;
        min-height: 100px;
        transition: border-color 0.2s ease;
      }
      .feedback-textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      .grading-actions {
        display: flex;
        gap: 12px;
      }
      .submit-grade-btn {
        background: var(--primary-color);
        border: none;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        flex: 1;
        transition: opacity 0.2s ease;
      }
      .submit-grade-btn:hover {
        opacity: 0.9;
      }
      .cancel-grade-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        flex: 1;
        transition: background 0.2s ease;
      }
      .cancel-grade-btn:hover {
        background: var(--bg-tertiary);
      }
    </style>
  `;

  showModal('Grade Assignment', gradingModal);
};

window.submitGrade = async function(assignmentId) {
  const grade = document.getElementById('gradeValue').value;
  const feedback = document.querySelector('.feedback-textarea').value;

  if (!grade || grade < 0 || grade > 100) {
    showMessage('Please enter a valid grade between 0 and 100', 'error');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/submissions/${assignmentId}/grade`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        grade: parseInt(grade),
        feedback: feedback || ''
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit grade');
    }

    showMessage(`Assignment graded successfully! Grade: ${grade}%`, 'success');
    closeModal();
    
    // Refresh assignments page
    openAssignmentsPage();
  } catch (error) {
    console.error('Error submitting grade:', error);
    showMessage('Failed to submit grade. Please try again.', 'error');
  }
};

window.reviewGrade = function(assignmentId) {
  showMessage('Opening grade review interface...', 'info');
};

const mockTransactions = [
  { date: '2025-11-02', type: 'Sale', course: 'Complete React Developer Course 2025', student: 'Ali Valiyev', amount: 49.99, status: 'Cleared' },
  { date: '2025-11-01', type: 'Sale', course: 'Advanced UI/UX Design Principles', student: 'Zarina Karimova', amount: 79.99, status: 'Cleared' },
  { date: '2025-10-30', type: 'Payout', course: '-', student: '-', amount: -2500.00, status: 'Paid' },
  { date: '2025-10-28', type: 'Sale', course: 'Node.js for Beginners', student: 'John Doe', amount: 29.99, status: 'Pending' },
  { date: '2025-10-25', type: 'Refund', course: 'Complete React Developer Course 2025', student: 'Jane Smith', amount: -49.99, status: 'Refunded' },
  { date: '2025-10-22', type: 'Sale', course: 'Introduction to Machine Learning', student: 'Peter Jones', amount: 99.99, status: 'Cleared' },
];

function renderTransactions(transactions = mockTransactions) {
  const tbody = document.getElementById('transactionsBody');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-results">No transactions found.</td></tr>';
    return;
  }

  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.course}</td>
      <td>${t.student}</td>
      <td class="amount ${t.amount > 0 ? 'positive' : 'negative'}">${t.amount.toFixed(2)}</td>
      <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
    </tr>
  `).join('');
}

window.filterTransactions = () => {
  const searchInput = document.querySelector('.transaction-search')?.value.toLowerCase() || '';
  const dateInput = document.querySelector('.transaction-date-filter')?.value || '';
  const typeInput = document.querySelector('.transaction-type-filter')?.value || '';

  let filtered = mockTransactions.filter(t => {
    const matchesSearch = searchInput === '' ||
      t.course.toLowerCase().includes(searchInput) ||
      t.student.toLowerCase().includes(searchInput) ||
      t.type.toLowerCase().includes(searchInput);
    const matchesDate = dateInput === '' || t.date === dateInput;
    const matchesType = typeInput === '' || t.type === typeInput;

    return matchesSearch && matchesDate && matchesType;
  });

  renderTransactions(filtered);

  // Show filter results count
  const resultsCount = filtered.length;
  const totalCount = mockTransactions.length;
  if (resultsCount !== totalCount) {
    showMessage(`Showing ${resultsCount} of ${totalCount} transactions`, 'info');
  }
};

// Finance Interactive Functions
window.showFinanceDetails = function(cardType) {
  const details = {
    revenue: {
      title: 'Total Revenue Details',
      content: `
        <div class="modal-content">
          <h3>Revenue Breakdown</h3>
          <div class="revenue-chart">
            <div class="revenue-item">
              <span>Course Sales:</span>
              <span>$8,200</span>
            </div>
            <div class="revenue-item">
              <span>Subscriptions:</span>
              <span>$3,450</span>
            </div>
            <div class="revenue-item">
              <span>Referrals:</span>
              <span>$800</span>
            </div>
            <div class="revenue-total">
              <span>Total:</span>
              <span>$12,450</span>
            </div>
          </div>
        </div>
      `
    },
    month: {
      title: 'This Month Earnings',
      content: `
        <div class="modal-content">
          <h3>Monthly Performance</h3>
          <div class="monthly-stats">
            <div class="stat-item">
              <span>Week 1:</span>
              <span>$645</span>
            </div>
            <div class="stat-item">
              <span>Week 2:</span>
              <span>$780</span>
            </div>
            <div class="stat-item">
              <span>Week 3:</span>
              <span>$720</span>
            </div>
            <div class="stat-item">
              <span>Week 4:</span>
              <span>$700</span>
            </div>
          </div>
        </div>
      `
    },
    balance: {
      title: 'Available Balance',
      content: `
        <div class="modal-content">
          <h3>Withdrawal Information</h3>
          <p>Available for withdrawal: <strong>$1,250</strong></p>
          <p>Processing time: 2-3 business days</p>
          <button class="withdraw-btn" onclick="requestWithdrawal()">Request Withdrawal</button>
        </div>
      `
    },
    referral: {
      title: 'Referral Earnings',
      content: `
        <div class="modal-content">
          <h3>Referral Program</h3>
          <p>Total referred users: 12</p>
          <p>Active referrals: 8</p>
          <p>Commission rate: 10%</p>
          <p>Total earnings: <strong>$485</strong></p>
        </div>
      `
    }
  };

  showModal(details[cardType].title, details[cardType].content);
};

window.requestWithdrawal = function() {
  showMessage('Withdrawal request submitted! You will receive confirmation via email.', 'success');
  closeModal();
};

// Payment Method Dropdown Functions
window.togglePaymentMenu = function(button) {
  const dropdown = button.querySelector('.payment-dropdown-menu');
  const isOpen = dropdown.classList.contains('show');

  // Close all other dropdowns
  document.querySelectorAll('.payment-dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });

  // Toggle current dropdown
  if (!isOpen) {
    dropdown.classList.add('show');

    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!button.contains(e.target)) {
          dropdown.classList.remove('show');
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }
};

window.showPaymentDetails = function() {
  const cardDetails = `
    <div class="modal-content">
      <h3>Payment Method Details</h3>
      <div class="card-info-detail" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Card Type:</span>
          <span style="color: #ffffff;">UzBank Visa</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Card Number:</span>
          <span style="color: #ffffff;">**** **** **** 1234</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Cardholder:</span>
          <span style="color: #ffffff;">Umaraliyeva Zarnigor</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Expiry Date:</span>
          <span style="color: #ffffff;">12/28</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Status:</span>
          <span style="color: #10b981; background: rgba(16, 185, 129, 0.2); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">Primary</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 12px 0;">
          <span style="color: rgba(156, 163, 175, 1); font-weight: 600;">Added:</span>
          <span style="color: #ffffff;">Nov 15, 2024</span>
        </div>
      </div>
    </div>
  `;
  showModal('UzBank Card Details', cardDetails);
};

// Enhanced Finance Interactive Functions
window.manageCard = function() {
  const cardDetails = `
    <div class="modal-content">
      <h3>Card Details</h3>
      <div class="card-info-detail">
        <div class="info-row">
          <span>Card Type:</span>
          <span>UzBank Visa</span>
        </div>
        <div class="info-row">
          <span>Card Number:</span>
          <span>**** **** **** 1234</span>
        </div>
        <div class="info-row">
          <span>Cardholder:</span>
          <span>Umaraliyeva Zarnigor</span>
        </div>
        <div class="info-row">
          <span>Status:</span>
          <span class="status-active">Active</span>
        </div>
        <div class="info-row">
          <span>Expires:</span>
          <span>12/2028</span>
        </div>
      </div>
    </div>
    <style>
      .card-info-detail {
        padding: 20px 0;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(126, 162, 212, 0.1);
        color: #ffffff;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-row span:first-child {
        color: rgba(156, 163, 175, 1);
        font-weight: 500;
      }
      .status-active {
        color: #22c55e !important;
        font-weight: 600;
      }
    </style>
  `;

  showModal('UzBank Card Details', cardDetails);
};

window.editCard = function() {
  const editModal = `
    <div class="modern-modal-overlay" onclick="closeEditModal()">
      <div class="modern-modal-container" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C17.523 2 22 6.477 22 12s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 13h2l.15-.007a1 1 0 0 0 .85-.993l-.001-2h2l.15-.007A1 1 0 0 0 15 11l-.001-2h-2l-.15-.007A1 1 0 0 0 12 9l-.001 2h-2l-.15-.007A1 1 0 0 0 9 11l.001 2h2l.15.007A1 1 0 0 0 11 15z" fill="#7ea2d4"/>
            </svg>
          </div>
          <div class="modal-title-section">
            <h3 class="modal-title">Edit Payment Method</h3>
            <p class="modal-subtitle">Update your card information and preferences</p>
          </div>
          <button class="modal-close-btn" onclick="closeEditModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="card-preview">
            <div class="card-mini">
              <div class="card-mini-content">
                <div class="card-mini-name">UzBank Card</div>
                <div class="card-mini-number">8600 1234 5678 1234</div>
              </div>
              <div class="card-mini-badge">Primary</div>
            </div>
          </div>

          <div class="form-section">
            <div class="input-group">
              <label class="input-label">Card Nickname</label>
              <input type="text" value="UzBank Card" class="modern-input" id="editCardNickname" placeholder="Enter a nickname for this card">
              <span class="input-helper">Give your card a memorable name</span>
            </div>

            <div class="input-group">
              <label class="input-label">Card Type</label>
              <div class="card-type-display">
                <div class="card-type-icon">
                  <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                    <rect width="32" height="20" rx="4" fill="#1f2937"/>
                    <text x="16" y="12" text-anchor="middle" fill="#7ea2d4" font-size="8" font-family="monospace">VISA</text>
                  </svg>
                </div>
                <div class="card-type-info">
                  <div class="card-type-name">Visa Debit Card</div>
                  <div class="card-type-ending">8600 1234 5678 1234</div>
                </div>
              </div>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-container">
                <input type="checkbox" checked id="editIsPrimary" class="modern-checkbox">
                <span class="checkmark"></span>
                <div class="checkbox-content">
                  <div class="checkbox-title">Set as Primary Payment Method</div>
                  <div class="checkbox-description">This will be used as your default payment option</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveCardChanges()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <style>
      .modern-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modalFadeIn 0.3s ease;
      }

      .modern-modal-container {
        background: rgba(24, 24, 24, 0.95);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        animation: modalSlideUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(126, 162, 212, 0.1);
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        padding: 24px 24px 20px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.1);
        gap: 16px;
      }

      .modal-icon {
        width: 48px;
        height: 48px;
        background: rgba(126, 162, 212, 0.1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .modal-title-section {
        flex: 1;
      }

      .modal-title {
        color: #ffffff;
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 4px;
      }

      .modal-subtitle {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
        margin: 0;
      }

      .modal-close-btn {
        background: rgba(156, 163, 175, 0.1);
        border: 1px solid rgba(156, 163, 175, 0.2);
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .modal-close-btn:hover {
        background: rgba(156, 163, 175, 0.2);
        border-color: rgba(156, 163, 175, 0.3);
      }

      .modal-body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .card-preview {
        margin-bottom: 24px;
      }

      .card-mini {
        background: rgba(58, 56, 56, 0.4);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-mini-name {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .card-mini-number {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
      }

      .card-mini-badge {
        background: #10b981;
        color: white;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .input-label {
        color: rgba(126, 162, 212, 1);
        font-size: 14px;
        font-weight: 600;
      }

      .modern-input {
        background: rgba(32, 32, 32, 0.8);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 10px;
        padding: 14px 16px;
        color: #ffffff;
        font-size: 16px;
        transition: all 0.2s ease;
      }

      .modern-input:focus {
        outline: none;
        border-color: rgba(126, 162, 212, 0.5);
        box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
      }

      .input-helper {
        color: rgba(156, 163, 175, 1);
        font-size: 12px;
      }

      .card-type-display {
        background: rgba(32, 32, 32, 0.6);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 10px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .card-type-info {
        flex: 1;
      }

      .card-type-name {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .card-type-ending {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
      }

      .checkbox-group {
        margin-top: 8px;
      }

      .checkbox-container {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
        padding: 16px;
        background: rgba(32, 32, 32, 0.4);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 10px;
        transition: all 0.2s ease;
        position: relative;
      }

      .checkbox-container:hover {
        background: rgba(32, 32, 32, 0.6);
        border-color: rgba(126, 162, 212, 0.3);
      }

      .modern-checkbox {
        width: 20px;
        height: 20px;
        margin: 0;
        opacity: 0;
        position: absolute;
      }

      .checkmark {
        position: relative;
        display: block;
        height: 20px;
        width: 20px;
        background: rgba(126, 162, 212, 0.1);
        border: 2px solid rgba(126, 162, 212, 0.4);
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .modern-checkbox:checked + .checkmark {
        background: #7ea2d4;
        border-color: #7ea2d4;
      }

      .checkmark:after {
        content: "";
        position: absolute;
        display: none;
        left: 5px;
        top: 2px;
        width: 6px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .modern-checkbox:checked + .checkmark:after {
        display: block;
      }

      .checkbox-content {
        flex: 1;
      }

      .checkbox-title {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .checkbox-description {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
      }

      .modal-footer {
        padding: 20px 24px 24px;
        border-top: 1px solid rgba(126, 162, 212, 0.1);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .btn {
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 120px;
      }

      .btn-secondary {
        background: rgba(75, 85, 99, 0.3);
        border: 1px solid rgba(75, 85, 99, 0.5);
        color: rgba(156, 163, 175, 1);
      }

      .btn-secondary:hover {
        background: rgba(75, 85, 99, 0.4);
        border-color: rgba(75, 85, 99, 0.6);
      }

      .btn-primary {
        background: linear-gradient(135deg, #7ea2d4 0%, #9bb5e0 100%);
        border: 1px solid rgba(126, 162, 212, 0.5);
        color: white;
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #6b91c7 0%, #8ba7d8 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(126, 162, 212, 0.3);
      }

      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes modalSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', editModal);
};

window.closeEditModal = function() {
  const modal = document.querySelector('.modern-modal-overlay');
  if (modal) {
    modal.style.animation = 'modalFadeOut 0.2s ease';
    setTimeout(() => modal.remove(), 200);
  }
};

window.deleteCard = function() {
  const deleteModal = `
    <div class="delete-modal-overlay" onclick="closeDeleteModal()">
      <div class="delete-modal-container" onclick="event.stopPropagation()">
        <div class="delete-modal-header">
          <div class="delete-modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C17.523 2 22 6.477 22 12s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="#ef4444" fill-opacity="0.1"/>
              <path d="M12 2C17.523 2 22 6.477 22 12s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" stroke="#ef4444" stroke-width="1.5"/>
              <path d="M15 9l-6 6m0-6l6 6" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <button class="delete-modal-close-btn" onclick="closeDeleteModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="delete-modal-body">
          <div class="delete-title">
            <h3>Delete Payment Method</h3>
            <p class="delete-subtitle">This action cannot be undone</p>
          </div>

          <div class="delete-content">
            <div class="card-to-delete">
              <div class="card-delete-preview">
                <div class="card-delete-icon">
                  <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                    <rect x="2" y="4" width="20" height="12" rx="3" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                    <path d="M6 8h4m-4 3h6" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="card-delete-info">
                  <div class="card-delete-name">UzBank Card</div>
                  <div class="card-delete-number">**** **** **** 1234</div>
                </div>
                <div class="card-delete-badge">Primary</div>
              </div>
            </div>

            <div class="delete-warning">
              <div class="warning-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="warning-content">
                <div class="warning-title">Warning</div>
                <div class="warning-description">
                  Deleting this payment method will remove it permanently from your account.
                  Any pending transactions will be canceled.
                </div>
              </div>
            </div>

            <div class="delete-consequences">
              <div class="consequence-item">
                <div class="consequence-icon">●</div>
                <div class="consequence-text">Card will be removed from all subscriptions</div>
              </div>
              <div class="consequence-item">
                <div class="consequence-icon">●</div>
                <div class="consequence-text">Transaction history will remain visible</div>
              </div>
              <div class="consequence-item">
                <div class="consequence-icon">●</div>
                <div class="consequence-text">You'll need to add a new primary method if this is primary</div>
              </div>
            </div>
          </div>
        </div>

        <div class="delete-modal-footer">
          <button class="btn btn-cancel" onclick="closeDeleteModal()">Keep Card</button>
          <button class="btn btn-danger" onclick="confirmDeleteCard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
              <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>

    <style>
      .delete-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: deleteFadeIn 0.3s ease;
      }

      .delete-modal-container {
        background: rgba(20, 20, 20, 0.98);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 20px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        animation: deleteSlideUp 0.3s ease;
        box-shadow: 0 25px 80px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1);
      }

      .delete-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 24px 20px;
        border-bottom: 1px solid rgba(239, 68, 68, 0.1);
      }

      .delete-modal-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 16px;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      .delete-modal-close-btn {
        background: rgba(75, 85, 99, 0.2);
        border: 1px solid rgba(75, 85, 99, 0.3);
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .delete-modal-close-btn:hover {
        background: rgba(75, 85, 99, 0.3);
      }

      .delete-modal-body {
        padding: 24px;
      }

      .delete-title {
        text-align: center;
        margin-bottom: 24px;
      }

      .delete-title h3 {
        color: #ffffff;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .delete-subtitle {
        color: #ef4444;
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }

      .delete-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .card-to-delete {
        background: rgba(32, 32, 32, 0.5);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 16px;
      }

      .card-delete-preview {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .card-delete-icon {
        background: rgba(239, 68, 68, 0.1);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-delete-info {
        flex: 1;
      }

      .card-delete-name {
        color: #ffffff;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .card-delete-number {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
      }

      .card-delete-badge {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .delete-warning {
        display: flex;
        gap: 12px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 12px;
        padding: 16px;
      }

      .warning-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .warning-title {
        color: #f59e0b;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .warning-description {
        color: rgba(245, 158, 11, 0.9);
        font-size: 14px;
        line-height: 1.5;
      }

      .delete-consequences {
        background: rgba(32, 32, 32, 0.4);
        border: 1px solid rgba(75, 85, 99, 0.3);
        border-radius: 12px;
        padding: 16px;
      }

      .consequence-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 8px;
      }

      .consequence-item:last-child {
        margin-bottom: 0;
      }

      .consequence-icon {
        color: rgba(239, 68, 68, 0.8);
        margin-top: 2px;
        font-size: 12px;
      }

      .consequence-text {
        color: rgba(156, 163, 175, 1);
        font-size: 14px;
        line-height: 1.4;
      }

      .delete-modal-footer {
        padding: 20px 24px 24px;
        border-top: 1px solid rgba(239, 68, 68, 0.1);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .btn-cancel {
        background: rgba(75, 85, 99, 0.3);
        border: 1px solid rgba(75, 85, 99, 0.5);
        color: rgba(156, 163, 175, 1);
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-cancel:hover {
        background: rgba(75, 85, 99, 0.4);
        border-color: rgba(75, 85, 99, 0.6);
      }

      .btn-danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 160px;
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
      }

      @keyframes deleteFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes deleteSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes deleteFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', deleteModal);
};

window.closeDeleteModal = function() {
  const modal = document.querySelector('.delete-modal-overlay');
  if (modal) {
    modal.style.animation = 'deleteFadeOut 0.2s ease';
    setTimeout(() => modal.remove(), 200);
  }
};

window.addPaymentMethod = function() {
  const addForm = `
    <div class="modal-content">
      <h3>Add Payment Method</h3>
      <div class="add-payment-form">
        <div class="form-group">
          <label>Card Number:</label>
          <input type="text" placeholder="**** **** **** ****" class="form-input" id="newCardNumber">
        </div>
        <div class="form-group">
          <label>Cardholder Name:</label>
          <input type="text" placeholder="Full name as shown on card" class="form-input" id="cardholderName">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Expiry Date:</label>
            <input type="text" placeholder="MM/YY" class="form-input" id="expiryDate">
          </div>
          <div class="form-group">
            <label>CVV:</label>
            <input type="text" placeholder="123" class="form-input" id="cvv">
          </div>
        </div>
        <div class="form-actions">
          <button class="add-card-btn" onclick="saveNewCard()">Add Card</button>
          <button class="cancel-btn" onclick="closeModal()">Cancel</button>
        </div>
      </div>
    </div>
    <style>
      .add-payment-form {
        padding: 20px 0;
      }
      .form-row {
        display: flex;
        gap: 16px;
      }
      .form-row .form-group {
        flex: 1;
      }
      .add-card-btn {
        background: rgba(126, 162, 212, 0.2);
        border: 1px solid rgba(126, 162, 212, 0.4);
        color: rgba(126, 162, 212, 1);
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        flex: 1;
      }
      .add-card-btn:hover {
        background: rgba(126, 162, 212, 0.3);
      }
    </style>
  `;

  showModal('Add New Payment Method', addForm);
};

window.saveCardChanges = function() {
  showMessage('Card information updated successfully!', 'success');
  closeModal();
};

window.confirmDeleteCard = function() {
  showMessage('Payment method deleted successfully!', 'success');
  closeModal();
};

window.saveNewCard = function() {
  showMessage('New payment method added successfully!', 'success');
  closeModal();
};

// Message notification system
window.showMessage = function(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `message-notification ${type}`;
  messageEl.textContent = message;

  const styles = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    transition: all 0.3s ease;
    max-width: 400px;
    word-wrap: break-word;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    opacity: 0;
  `;

  const typeStyles = {
    success: 'background: #10B981; border: 2px solid #059669; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);',
    error: 'background: #EF4444; border: 2px solid #DC2626; box-shadow: 0 10px 40px rgba(239, 68, 68, 0.4);',
    info: 'background: #7ea2d4; border: 2px solid #6b8fc4; box-shadow: 0 10px 40px rgba(126, 162, 212, 0.4);',
    warning: 'background: #F59E0B; border: 2px solid #D97706; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);'
  };

  console.log('Toast styles loaded:', typeStyles);

  messageEl.style.cssText = styles + typeStyles[type];

  document.body.appendChild(messageEl);

  // Slide in
  setTimeout(() => {
    messageEl.style.transform = 'translateX(0)';
    messageEl.style.opacity = '1';
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    messageEl.style.transform = 'translateX(100%)';
    messageEl.style.opacity = '0';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 3000);
};

// AI Assistant Interactive Functions
window.showAIMetrics = function(metricType) {
  const details = {
    responses: {
      title: 'AI Response Analytics',
      content: `
        <div class="modal-content">
          <h3>Response Statistics</h3>
          <div class="ai-analytics">
            <div class="analytics-item">
              <span>This Week:</span>
              <span>342 responses</span>
            </div>
            <div class="analytics-item">
              <span>This Month:</span>
              <span>1,289 responses</span>
            </div>
            <div class="analytics-item">
              <span>Success Rate:</span>
              <span>94.2%</span>
            </div>
            <div class="analytics-item">
              <span>Average Rating:</span>
              <span>4.6/5.0</span>
            </div>
          </div>
        </div>
        <style>
          .ai-analytics {
            padding: 20px 0;
          }
          .analytics-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(126, 162, 212, 0.1);
            color: #ffffff;
          }
          .analytics-item:last-child {
            border-bottom: none;
          }
          .analytics-item span:first-child {
            color: rgba(156, 163, 175, 1);
            font-weight: 500;
          }
          .analytics-item span:last-child {
            font-weight: 600;
            color: #22c55e;
          }
        </style>
      `
    },
    time: {
      title: 'Response Time Analytics',
      content: `
        <div class="modal-content">
          <h3>Performance Metrics</h3>
          <div class="time-analytics">
            <div class="time-item">
              <span>Average Response:</span>
              <span>1.2s</span>
            </div>
            <div class="time-item">
              <span>Fastest Response:</span>
              <span>0.8s</span>
            </div>
            <div class="time-item">
              <span>99th Percentile:</span>
              <span>2.1s</span>
            </div>
            <div class="time-item">
              <span>Uptime:</span>
              <span>99.9%</span>
            </div>
          </div>
        </div>
        <style>
          .time-analytics {
            padding: 20px 0;
          }
          .time-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(126, 162, 212, 0.1);
            color: #ffffff;
          }
          .time-item:last-child {
            border-bottom: none;
          }
          .time-item span:first-child {
            color: rgba(156, 163, 175, 1);
            font-weight: 500;
          }
          .time-item span:last-child {
            font-weight: 600;
            color: #22c55e;
          }
        </style>
      `
    }
  };

  showModal(details[metricType].title, details[metricType].content);
};

// Handle Course Selection for AI
window.handleCourseSelection = function(courseId) {
  if (!courseId) {
    showToast('Iltimos, kursni tanlang', 'warning');
    return;
  }

  // Store selected course for AI training
  localStorage.setItem('aiSelectedCourse', courseId);
  
  // Show success message
  const customToast = document.createElement('div');
  customToast.innerHTML = 'Kurs tanlandi! AI endi faqat shu kurs bo\'yicha javob beradi.';
  customToast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(65, 156, 98, 1) !important;
    color: white !important;
    padding: 14px 22px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
    border-left: 4px solid rgb(22, 163, 74);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    animation: slideIn 0.3s ease forwards;
  `;

  document.body.appendChild(customToast);

  setTimeout(() => {
    customToast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      if (customToast.parentNode) {
        customToast.parentNode.removeChild(customToast);
      }
    }, 300);
  }, 3000);

  console.log('AI Course selected:', courseId);
};

window.toggleAISetting = function(toggleElement) {
  const isChecked = toggleElement.checked;

  if (isChecked) {
    // Create custom toast with inline styles
    const customToast = document.createElement('div');
    customToast.innerHTML = 'AI auto-response enabled for lesson comments';
    customToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(65, 156, 98, 1) !important;
      color: white !important;
      padding: 14px 22px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 10000;
      border-left: 4px solid rgb(22, 163, 74);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      animation: slideIn 0.3s ease forwards;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(customToast);

    setTimeout(() => {
      customToast.remove();
      style.remove();
    }, 3000);
  } else {
    showMessage('AI auto-response disabled for lesson comments', 'info');
  }
};

window.openQuizAnalytics = async function() {
  console.log('openQuizAnalytics function called');
  
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'Quiz Analytics';
  }
  
  // Get teacher ID - try multiple sources
  let teacherId = null;
  
  // Try currentUser from localStorage first (this is the main one)
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (currentUser._id) {
    teacherId = currentUser._id;
  }
  
  // Try user from localStorage
  if (!teacherId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      teacherId = user._id;
    }
  }
  
  // Try window.currentUser if available
  if (!teacherId && window.currentUser && window.currentUser._id) {
    teacherId = window.currentUser._id;
  }
  
  // Try sessionStorage
  if (!teacherId) {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      const parsedUser = JSON.parse(sessionUser);
      teacherId = parsedUser._id;
    }
  }
  
  console.log('🔍 Teacher ID for quiz analytics:', teacherId);
  
  if (!teacherId) {
    contentArea.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #EF4444;">
        <p style="font-size: 18px; margin-bottom: 8px;">Teacher ID topilmadi</p>
        <p style="color: #9CA3AF;">Iltimos, qaytadan login qiling</p>
      </div>
    `;
    return;
  }
  
  // Show loading state
  contentArea.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; color: #9CA3AF;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid rgba(126, 162, 212, 0.2); border-top-color: #7ea2d4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p>Yuklanmoqda...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  try {
    // Fetch quiz analytics data
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/teachers/${teacherId}/quiz-analytics`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to load quiz analytics');
    }
    
    const { analytics, summary, courses } = result.data;
    
    // Update content area with real data
    const quizAnalyticsHTML = `
      <style>
        .figma-content-area.quiz-analytics-page {
          padding: 24px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 24px !important;
        }
        .quiz-stats-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 20px !important;
          margin-bottom: 32px !important;
        }
        .quiz-stat-card {
          background: rgba(58, 56, 56, 0.3) !important;
          border: 1px solid var(--primary-border) !important;
          border-radius: 12px !important;
          padding: 24px !important;
          text-align: center !important;
          transition: all 0.3s ease !important;
        }
        .quiz-stat-card:hover {
          background: var(--primary-light) !important;
          border-color: var(--primary-color) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        .quiz-stat-title {
          color: rgba(156, 163, 175, 1) !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          margin-bottom: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .quiz-stat-value {
          color: var(--primary-color) !important;
          font-size: 32px !important;
          font-weight: 700 !important;
          margin-bottom: 0 !important;
          line-height: 1.2 !important;
        }
        .quiz-content-section {
          background: rgba(58, 56, 56, 0.3) !important;
          border: 1px solid var(--primary-border) !important;
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .quiz-section-header {
          padding: 20px 24px !important;
          border-bottom: 1px solid var(--primary-border) !important;
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          margin: 0 !important;
        }
        .quiz-table-container {
          padding: 16px !important;
          overflow-x: auto !important;
        }
        .quiz-table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        .quiz-table th {
          padding: 12px 16px !important;
          text-align: center !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: var(--primary-color) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          background: var(--primary-light) !important;
        }
        .quiz-table th:first-child {
          text-align: left !important;
        }
        .quiz-table td {
          padding: 16px !important;
          border-top: 1px solid var(--primary-border) !important;
          color: #e0e0e0 !important;
          font-size: 14px !important;
          text-align: center !important;
        }
        .quiz-table td:first-child {
          text-align: left !important;
        }
        .quiz-table tbody tr {
          transition: background 0.2s !important;
        }
        .quiz-table tbody tr:hover {
          background: var(--primary-light) !important;
        }
        .student-name {
          font-weight: 600 !important;
          color: #ffffff !important;
        }
        .attempt-badge {
          font-family: 'Courier New', monospace !important;
          color: var(--primary-color) !important;
        }
        .score-value {
          font-weight: 700 !important;
          font-size: 16px !important;
        }
        .score-pass {
          color: #10B981 !important;
        }
        .score-fail {
          color: #EF4444 !important;
        }
        .status-badge {
          display: inline-block !important;
          padding: 4px 12px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }
        .status-passed {
          background: rgba(16, 185, 129, 0.2) !important;
          color: #10B981 !important;
        }
        .status-failed {
          background: rgba(239, 68, 68, 0.2) !important;
          color: #EF4444 !important;
        }
        .empty-state {
          padding: 60px 20px !important;
          text-align: center !important;
          color: #9CA3AF !important;
        }
      </style>

      <!-- Stats Cards -->
      <div class="quiz-stats-grid">
        <div class="quiz-stat-card">
          <div class="quiz-stat-title">Jami urinishlar</div>
          <div class="quiz-stat-value">${summary.totalAttempts} ta</div>
        </div>
        <div class="quiz-stat-card">
          <div class="quiz-stat-title">Studentlar soni</div>
          <div class="quiz-stat-value">${summary.uniqueStudents} ta</div>
        </div>
        <div class="quiz-stat-card">
          <div class="quiz-stat-title">O'rtacha foiz</div>
          <div class="quiz-stat-value">${summary.averageScore}%</div>
        </div>
      </div>

      <!-- Quiz Results Table -->
      <div class="quiz-content-section">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--primary-border); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">Quiz natijalari (eng oxirgi urinish)</h3>
          <input 
            type="text" 
            id="quizSearchInput" 
            placeholder="ID yoki ism bo'yicha qidirish..." 
            style="padding: 8px 16px; background: rgba(58, 56, 56, 0.5); border: 1px solid var(--primary-border); border-radius: 8px; color: #ffffff; font-size: 14px; width: 300px; outline: none;"
            onkeyup="filterQuizResults()"
          />
        </div>
        <div class="quiz-table-container">
          ${analytics.length === 0 ? `
            <div class="empty-state">
              <p>Hozircha quiz natijalari yo'q</p>
            </div>
          ` : `
            <table class="quiz-table" id="quizResultsTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Kurs</th>
                  <th>Urinish</th>
                  <th>Ball</th>
                  <th>To'g'ri javoblar</th>
                  <th>Holat</th>
                  <th>Vaqt</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.map(item => {
                  const course = courses.find(c => c._id === item.courseId.toString());
                  const courseName = course ? course.title : 'Unknown Course';
                  const statusClass = item.passed ? 'status-passed' : 'status-failed';
                  const statusText = item.passed ? 'O\'tdi' : 'O\'tmadi';
                  const scoreClass = item.passed ? 'score-pass' : 'score-fail';
                  
                  // Format date as DD/MM/YYYY
                  const dateObj = new Date(item.date);
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const year = dateObj.getFullYear();
                  const formattedDate = day + '/' + month + '/' + year;
                  
                  const time = window.formatQuizTime(item.timeElapsed);
                  
                  // Get last 5 digits of student ID
                  const studentIdShort = item.studentId.toString().slice(-5);
                  
                  return `
                    <tr data-student-id="${studentIdShort}" data-student-name="${item.studentName.toLowerCase()}">
                      <td style="font-family: 'Courier New', monospace; color: var(--primary-color); font-weight: 600;">${studentIdShort}</td>
                      <td class="student-name">${item.studentName}</td>
                      <td>${courseName}</td>
                      <td class="attempt-badge">${item.attemptNumber}/3</td>
                      <td class="score-value ${scoreClass}">${item.score}%</td>
                      <td>${item.correctAnswers}/${item.totalQuestions}</td>
                      <td>
                        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 8px; background: ${item.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};">
                          ${item.passed ? `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ` : `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          `}
                          <span style="color: ${item.passed ? '#10B981' : '#EF4444'}; font-size: 13px; font-weight: 600;">${statusText}</span>
                        </div>
                      </td>
                      <td>${time}</td>
                      <td>${formattedDate}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;

    contentArea.innerHTML = quizAnalyticsHTML;
    
    // Apply saved primary color
    const savedColor = localStorage.getItem('primaryColor') || '#7ea2d4';
    applyPrimaryColor(savedColor);
    
  } catch (error) {
    console.error('Error loading quiz analytics:', error);
    contentArea.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #EF4444;">
        <p style="font-size: 18px; margin-bottom: 8px;">Xatolik yuz berdi</p>
        <p style="color: #9CA3AF;">${error.message}</p>
      </div>
    `;
  }
};

// Helper function to format time
window.formatQuizTime = function(seconds) {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours} soat ${minutes} daq`;
  }
  if (minutes > 0) {
    return `${minutes} daq ${secs} sek`;
  }
  return `${secs} sek`;
};

// Filter quiz results by ID or name
window.filterQuizResults = function() {
  const searchInput = document.getElementById('quizSearchInput');
  const table = document.getElementById('quizResultsTable');
  
  if (!searchInput || !table) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  const rows = table.querySelectorAll('tbody tr');
  
  rows.forEach(row => {
    const studentId = row.getAttribute('data-student-id') || '';
    const studentName = row.getAttribute('data-student-name') || '';
    
    if (studentId.includes(searchTerm) || studentName.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

window.switchQuizTab = function(tabType, tabElement) {
  // Remove active class from all tabs
  document.querySelectorAll('.quiz-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Add active class to clicked tab
  tabElement.classList.add('active');

  const quizList = document.getElementById('quizList');

  if (tabType === 'results') {
    quizList.innerHTML = `
      <div class="quiz-item">
        <div class="quiz-header">
          <div>
            <h4 class="quiz-title">React Hooks Analytics</h4>
            <p class="quiz-meta">542 attempts • 76% average score</p>
          </div>
          <div class="quiz-actions">
            <button class="quiz-action-btn" onclick="showQuizAnalytics('react-hooks')">View Details</button>
          </div>
        </div>
        <p class="quiz-description">Most challenging questions: Custom hooks implementation, useEffect dependencies</p>
      </div>

      <div class="quiz-item">
        <div class="quiz-header">
          <div>
            <h4 class="quiz-title">CSS Grid Analytics</h4>
            <p class="quiz-meta">298 attempts • 81% average score</p>
          </div>
          <div class="quiz-actions">
            <button class="quiz-action-btn" onclick="showQuizAnalytics('css-grid')">View Details</button>
          </div>
        </div>
        <p class="quiz-description">Strong performance overall. Grid template areas most confusing topic.</p>
      </div>
    `;
  } else {
    quizList.innerHTML = `
      <div class="quiz-item">
        <div class="quiz-header">
          <div>
            <h4 class="quiz-title">React Hooks Fundamentals Quiz</h4>
            <p class="quiz-meta">React Masterclass • 20 questions • 30 min</p>
          </div>
          <div class="quiz-actions">
            <button class="quiz-action-btn">⋯</button>
          </div>
        </div>
        <p class="quiz-description">Test your knowledge on React Hooks including useState, useEffect, useContext, and custom hooks.</p>
      </div>

      <div class="quiz-item">
        <div class="quiz-header">
          <div>
            <h4 class="quiz-title">Advanced CSS Grid Layout Quiz</h4>
            <p class="quiz-meta">UI/UX Design • 15 questions • 25 min • AI</p>
          </div>
          <div class="quiz-actions">
            <button class="quiz-action-btn">⋯</button>
          </div>
        </div>
        <p class="quiz-description">Master CSS Grid with advanced layout techniques and real-world use cases.</p>
      </div>

      <div class="quiz-item">
        <div class="quiz-header">
          <div>
            <h4 class="quiz-title">React Hooks Fundamentals Quiz</h4>
            <p class="quiz-meta">React Masterclass • 20 questions • 30 min</p>
          </div>
          <div class="quiz-actions">
            <button class="quiz-action-btn">⋯</button>
          </div>
        </div>
        <p class="quiz-description">Test your knowledge on React Hooks including useState, useEffect, useContext, and custom hooks.</p>
      </div>
    `;
  }
};

window.showQuizAnalytics = function(quizId) {
  // This would show detailed analytics for a specific quiz
  alert('Quiz analytics details for: ' + quizId);
};

window.editAIResponse = function(responseId) {
  const editForm = `
    <div class="modal-content" style="background: rgba(32, 32, 32, 0.95) !important; border: 1px solid rgba(126, 162, 212, 0.2) !important; border-radius: 12px !important; padding: 0 !important;">
      <div class="response-edit-form">
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="color: rgba(156, 163, 175, 1) !important; font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px !important; display: block !important;">Student Question:</label>
          <textarea class="form-textarea" readonly style="width: 100% !important; background: rgba(20, 20, 20, 0.8) !important; border: 1px solid rgba(126, 162, 212, 0.2) !important; border-radius: 8px !important; padding: 12px !important; color: rgba(156, 163, 175, 0.8) !important; font-family: inherit !important; font-size: 14px !important; line-height: 1.5 !important; resize: vertical !important; min-height: 80px !important;">What's the difference between useState and useEffect?</textarea>
        </div>
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" style="color: rgba(156, 163, 175, 1) !important; font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px !important; display: block !important;">AI Response:</label>
          <textarea class="form-textarea" rows="4" id="aiResponseEdit" style="width: 100% !important; background: rgba(20, 20, 20, 0.8) !important; border: 1px solid rgba(126, 162, 212, 0.2) !important; border-radius: 8px !important; padding: 12px !important; color: #ffffff !important; font-family: inherit !important; font-size: 14px !important; line-height: 1.5 !important; resize: vertical !important; min-height: 120px !important;">useState manages component state, while useEffect handles side effects like API calls. Check Lesson 5 for examples!</textarea>
        </div>
        <div class="response-actions" style="display: flex !important; gap: 12px !important; flex-wrap: wrap !important;">
          <button class="save-response-btn" onclick="saveAIResponse(${responseId})" style="background: rgba(34, 197, 94, 0.2) !important; border: 1px solid rgba(34, 197, 94, 0.4) !important; color: #22c55e !important; padding: 12px 20px !important; border-radius: 8px !important; cursor: pointer !important; font-weight: 600 !important; flex: 1 !important; min-width: 120px !important; transition: all 0.3s ease !important;" onmouseover="this.style.background='rgba(34, 197, 94, 0.3)'" onmouseout="this.style.background='rgba(34, 197, 94, 0.2)'">Save Changes</button>
          <button class="regenerate-btn" onclick="regenerateAIResponse(${responseId})" style="background: rgba(126, 162, 212, 0.2) !important; border: 1px solid rgba(126, 162, 212, 0.4) !important; color: rgba(126, 162, 212, 1) !important; padding: 12px 20px !important; border-radius: 8px !important; cursor: pointer !important; font-weight: 600 !important; flex: 1 !important; min-width: 120px !important; transition: all 0.3s ease !important;" onmouseover="this.style.background='rgba(126, 162, 212, 0.3)'" onmouseout="this.style.background='rgba(126, 162, 212, 0.2)'">Regenerate</button>
          <button class="cancel-btn" onclick="closeModal()" style="background: rgba(75, 85, 99, 0.2) !important; border: 1px solid rgba(75, 85, 99, 0.4) !important; color: rgba(156, 163, 175, 1) !important; padding: 12px 20px !important; border-radius: 8px !important; cursor: pointer !important; font-weight: 600 !important; flex: 1 !important; min-width: 120px !important; transition: all 0.3s ease !important;" onmouseover="this.style.background='rgba(75, 85, 99, 0.3)'" onmouseout="this.style.background='rgba(75, 85, 99, 0.2)'">Cancel</button>
        </div>
      </div>
    </div>
  `;

  showModal('Edit AI Response', editForm);
};

window.saveAIResponse = function(responseId) {
  showMessage('AI response updated successfully!', 'success');
  closeModal();
};

window.regenerateAIResponse = function(responseId) {
  showMessage('Regenerating AI response...', 'info');

  // Simulate AI regeneration delay
  setTimeout(() => {
    document.getElementById('aiResponseEdit').value = 'useState is a React Hook for managing local component state, while useEffect is used for side effects like API calls, subscriptions, and DOM manipulation. For more examples, see Lesson 5 and the official React documentation.';
    showMessage('AI response regenerated successfully!', 'success');
  }, 2000);
};

window.showModal = function(title, content) {
  const modal = `
    <div class="finance-modal" onclick="closeModal()">
      <div class="finance-modal-content" onclick="event.stopPropagation()">
        <div class="finance-modal-header">
          <h3>${title}</h3>
          <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="finance-modal-body">
          ${content}
        </div>
      </div>
    </div>
    <style>
      .finance-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .finance-modal-content {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80%;
        overflow-y: auto;
      }
      .finance-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
      }
      .finance-modal-header h3 {
        color: var(--primary-color);
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease;
      }
      .close-btn:hover {
        color: var(--text-primary);
      }
      .finance-modal-body {
        padding: 20px;
        color: var(--text-primary);
      }
      .revenue-item, .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
      }
      .revenue-total {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        font-weight: bold;
        font-size: 16px;
        border-top: 2px solid var(--border-color);
        margin-top: 10px;
      }
      .withdraw-btn {
        background: var(--primary-light);
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: 600;
      }
      .withdraw-btn:hover {
        background: rgba(var(--primary-color-rgb), 0.2);
      }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', modal);
};

window.closeModal = function() {
  const modal = document.querySelector('.finance-modal');
  if (modal) {
    modal.remove();
  }
};

window.downloadReport = (format) => {
  showMessage(`Downloading ${format.toUpperCase()} report...`, 'info');
  // Simulate download
  setTimeout(() => {
    showMessage(`${format.toUpperCase()} report downloaded successfully!`, 'success');
  }, 2000);
};

window.requestPayout = () => {
  showModal('Request Payout', `
    <div class="modal-content">
      <h3>Payout Request</h3>
      <div class="payout-form">
        <div class="form-group">
          <label>Amount:</label>
          <input type="number" value="1250" max="1250" class="payout-input" />
        </div>
        <div class="form-group">
          <label>Payment Method:</label>
          <select class="payout-select">
            <option>UzBank Card ****1234</option>
            <option>Bank Transfer</option>
          </select>
        </div>
        <button class="payout-submit-btn" onclick="submitPayout()">Submit Request</button>
      </div>
    </div>
    <style>
      .payout-form .form-group {
        margin-bottom: 15px;
      }
      .payout-form label {
        display: block;
        margin-bottom: 5px;
        color: rgba(126, 162, 212, 1);
        font-weight: 500;
      }
      .payout-input, .payout-select {
        width: 100%;
        padding: 10px;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
      }
      .payout-submit-btn {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.4);
        color: #22c55e;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        width: 100%;
      }
      .payout-submit-btn:hover {
        background: rgba(34, 197, 94, 0.3);
      }
    </style>
  `);
};

window.submitPayout = function() {
  showMessage('Payout request submitted successfully! Processing will take 2-3 business days.', 'success');
  closeModal();
};

// Open Create Course Page
window.openCreateCourse = async function() {
  const userData = store.getState().user;

  // Show loading toast while checking
  const loadingToast = showSuccessToast('Checking course limit...');

  // Check course limit by fetching from backend
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses?teacher=${userData._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    const currentCourses = result.courses || [];
    
    console.log(`📊 Current courses: ${currentCourses.length}/2`);
    
    if (currentCourses.length >= 2) {
      showErrorToast('You have already created 2 courses. Upgrade your plan to create more courses.');
      return;
    }
  } catch (error) {
    console.error('Error checking course limit:', error);
    showErrorToast('Failed to check course limit. Please try again.');
    return;
  }

  // Check current general menu state before navigating
  const generalChildren = document.getElementById('general-children');
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'Create Course';
  }
  
  // Update content area only
  contentArea.innerHTML = `
          <form class="create-course-form" id="createCourseForm">

            <!-- Basic Information Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.basicInfo')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseTitle')}</label>
                <input type="text" class="form-input" name="title" placeholder="${t('createCourse.courseTitlePlaceholder')}" required />
              </div>

              <div class="form-field">
                <label class="field-label">Description</label>
                <textarea class="form-textarea" name="description" rows="4" placeholder="Write a description of your course..." required></textarea>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('createCourse.category')}</label>
                  <select class="form-input" name="category" required>
                    <option value="">Select category...</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Design">Design</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Business">Business</option>
                    <option value="Finance">Finance</option>
                    <option value="Photography">Photography</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Music">Music</option>
                    <option value="Language Learning">Language Learning</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Security">Security</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Database">Database</option>
                    <option value="Testing">Testing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

            </div>

            <!-- Course Image Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.courseImage')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseThumbnail')}</label>
                <div class="upload-area" id="uploadArea" onclick="triggerFileUpload()">
                  <input type="file" id="thumbnailInput" accept="image/*" style="display: none;" onchange="handleImageUpload(event)" />
                  <div class="upload-content" id="uploadContent">
                    <div class="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="upload-text">
                      <p>${t('createCourse.uploadThumbnail')}</p>
                      <small>${t('createCourse.thumbnailHint')}</small>
                    </div>
                  </div>
                  <div class="image-preview hidden" id="imagePreview">
                    <img id="previewImg" src="" alt="Course thumbnail" />
                    <div class="image-overlay">
                      <button type="button" class="image-action-btn" onclick="changeImage(event)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${t('createCourse.change')}
                      </button>
                      <button type="button" class="image-action-btn delete" onclick="deleteImage(event)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${t('createCourse.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing & Access Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.pricingAccess')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseType')}</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="paid" checked />
                    <span class="radio-custom"></span>
                    <span>${t('createCourse.paid')}</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="free" />
                    <span class="radio-custom"></span>
                    <span>${t('createCourse.free')}</span>
                  </label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('createCourse.coursePrice')}</label>
                  <input type="number" class="form-input" name="price" placeholder="${t('createCourse.coursePricePlaceholder')}" step="0.01" />
                </div>
                <div class="form-field">
                  <label class="field-label">${t('createCourse.discountPrice')}</label>
                  <input type="number" class="form-input" placeholder="${t('createCourse.discountPricePlaceholder')}" step="0.01" />
                  <small class="field-note">${t('createCourse.discountNote')}</small>
                </div>
              </div>
            </div>

            <!-- Course Structure Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.courseStructure')}</h3>

              <div class="info-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Organize your course into modules (sections) and lessons. You can add videos, files, quizzes, and assignments.</span>
              </div>

              <div class="modules-container" id="modulesContainer">
                <!-- Modules will be added here -->
                <button type="button" class="add-module-btn" onclick="addNewModule()">+ Add New Module</button>
              </div>
            </div>

            <!-- Additional Settings Section -->
            <div class="course-section">
              <h3 class="course-section-title">Additional Settings</h3>

              <div class="settings-list">
                <div class="setting-item disabled">
                  <div class="setting-info">
                    <div class="setting-header">
                      <h4>Enable Q&A for students</h4>
                      <svg class="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <p>Students can ask questions under lessons</p>
                  </div>
                  <label class="toggle-switch disabled">
                    <input type="checkbox" disabled />
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item disabled">
                  <div class="setting-info">
                    <div class="setting-header">
                      <h4>Enable AI auto-responses</h4>
                      <svg class="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <p>AI will automatically answer common student questions</p>
                  </div>
                  <label class="toggle-switch disabled">
                    <input type="checkbox" disabled />
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item disabled">
                  <div class="setting-info">
                    <div class="setting-header">
                      <h4>Issue certificate upon completion</h4>
                      <svg class="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <p>Students receive a certificate when they finish the course</p>
                  </div>
                  <label class="toggle-switch disabled">
                    <input type="checkbox" disabled />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions course-actions">
              <button type="button" class="btn-cancel" onclick="backToDashboard()">Cancel</button>
              <button type="submit" class="btn-secondary" name="action" value="draft">${t('createCourse.saveAsDraft')}</button>
              <button type="submit" class="btn-save" name="action" value="publish">${t('createCourse.publishCourse')}</button>
            </div>

          </form>
  `;

  // Add form submission handler
  setTimeout(() => {
    const form = document.getElementById('createCourseForm');
    if (form) {
      form.addEventListener('submit', handleCreateCourse);
    }
  }, 0);
};

// ===== MY COURSES FUNCTIONALITY =====

// Global variables for filtering and sorting
let currentFilter = 'active';
let currentSort = 'newest';
let currentSearch = '';

// Update courses statistics dynamically
function updateCoursesStatistics() {
  const stats = calculateCoursesStatistics();
  const statsContainer = document.getElementById('coursesStats');

  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="stat-card-my-courses">
      <h3>Total courses</h3>
      <div class="stat-number">${stats.totalCourses}</div>
    </div>
    <div class="stat-card-my-courses">
      <h3>Total enrolled</h3>
      <div class="stat-number">${stats.totalStudents.toLocaleString()}</div>
    </div>
    <div class="stat-card-my-courses">
      <h3>Total revenue</h3>
      <div class="stat-number">$${stats.totalRevenue.toLocaleString()}</div>
    </div>
    <div class="stat-card-my-courses">
      <h3>Live now</h3>
      <div class="stat-number">${stats.activeStudents}</div>
    </div>
  `;
}

// Calculate real statistics from courses data
function calculateCoursesStatistics() {
  const totalCourses = myCoursesData.length;
  const totalStudents = myCoursesData.reduce((sum, course) => sum + (course.totalStudents || 0), 0);
  const totalRevenue = myCoursesData.reduce((sum, course) => sum + (course.revenue || 0), 0);

  // Calculate new courses this month (November 2024)
  const thisMonth = new Date().toISOString().slice(0, 7); // "2024-11"
  const newThisMonth = myCoursesData.filter(course =>
    course.createdAt.startsWith(thisMonth)
  ).length;

  // Simulate some dynamic values
  const newStudents = Math.floor(totalStudents * 0.05); // 5% of total as new
  const monthlyRevenue = Math.floor(totalRevenue * 0.1); // 10% of total as monthly
  const activeStudents = Math.floor(totalStudents * 0.08); // 8% online now

  return {
    totalCourses,
    totalStudents,
    totalRevenue,
    newThisMonth,
    newStudents,
    monthlyRevenue,
    activeStudents
  };
}

// Update filter tabs with real counts
function updateFilterTabs() {
  const counts = {
    all: myCoursesData.length,
    active: myCoursesData.filter(course => course.status === 'Active').length,
    draft: myCoursesData.filter(course => course.status === 'Draft').length,
    archived: myCoursesData.filter(course => course.status === 'Archived').length,
    free: myCoursesData.filter(course => course.type === 'Free').length,
    paid: myCoursesData.filter(course => course.type === 'Paid').length
  };

  const tabsContainer = document.getElementById('courseFilterTabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = `
    <button class="filter-tab active" data-filter="active" onclick="filterCoursesByTab(this, 'active')">Active (${counts.active})</button>
    <button class="filter-tab" data-filter="draft" onclick="filterCoursesByTab(this, 'draft')">Draft (${counts.draft})</button>
    <button class="filter-tab" data-filter="archived" onclick="filterCoursesByTab(this, 'archived')">Archived (${counts.archived})</button>
    <button class="filter-tab" data-filter="free" onclick="filterCoursesByTab(this, 'free')">Free (${counts.free})</button>
    <button class="filter-tab" data-filter="paid" onclick="filterCoursesByTab(this, 'paid')">Paid (${counts.paid})</button>
    <button class="filter-tab" data-filter="all" onclick="filterCoursesByTab(this, 'all')">All courses (${counts.all})</button>
  `;
}

// OLD VERSION - REMOVED (duplicate function)
/* function renderMyCoursesCards(courses = myCoursesData) {
  const grid = document.getElementById('myCoursesGrid');
  if (!grid) return;

  // Apply current filters and search
  courses = applyCurrentFilters(courses);

  if (courses.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: var(--text-secondary);
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px; opacity: 0.5;">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <h3 style="margin-bottom: 8px; font-size: 18px;">No courses found</h3>
        <p style="opacity: 0.7;">Try adjusting your filters or search terms</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = courses.map(course => `
    <div class="my-course-card" data-course-id="${course.id}">
      <div class="course-thumbnail" style="background: ${course.color}">
        <div class="course-category-icon">
          ${getCategoryIcon(course.category)}
        </div>
      </div>
      <div class="course-status-badge status-${course.status.toLowerCase()}">${course.status}</div>
      <div class="course-card-body">
        <h3 class="course-card-title">${course.title}</h3>
        <p class="course-card-description">${course.description}</p>
        <div class="course-stats-row">
          <div class="course-stat">
            <div class="stat-number">${course.students.toLocaleString()}</div>
            <div class="stat-label">Students</div>
          </div>
          <div class="course-stat">
            <div class="stat-number">${course.rating}</div>
            <div class="stat-label">Rating</div>
          </div>
        </div>
        <div class="course-stats-row">
          <div class="course-stat">
            <div class="stat-number">${course.lessons}</div>
            <div class="stat-label">Lessons</div>
          </div>
          <div class="course-stat">
            <div class="stat-number">${course.price > 0 ? course.price.toLocaleString('uz-UZ') + ' UZS' : 'Bepul'}</div>
            <div class="stat-label">Price</div>
          </div>
        </div>
        <div class="course-revenue">
          <span class="revenue-label">Revenue</span>
          <span class="revenue-amount">$${course.revenue.toLocaleString()}</span>
        </div>
        <div class="course-actions">
          <button class="course-btn" onclick="editCourse(${course.id})" title="Edit course">Edit</button>
          <button class="course-btn" onclick="viewCourseStats(${course.id})" title="View statistics">Stats</button>
          <button class="course-btn course-btn-delete" onclick="deleteCourse(${course.id})" title="Delete course">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
} */

// Apply current filters, search and sort
function applyCurrentFilters(courses) {
  let filtered = [...courses];

  // Apply status/type filter
  if (currentFilter !== 'all') {
    switch (currentFilter) {
      case 'active':
        filtered = filtered.filter(course => course.status === 'Active');
        break;
      case 'draft':
        filtered = filtered.filter(course => course.status === 'Draft');
        break;
      case 'archived':
        filtered = filtered.filter(course => course.status === 'Archived');
        break;
      case 'free':
        filtered = filtered.filter(course => course.type === 'Free');
        break;
      case 'paid':
        filtered = filtered.filter(course => course.type === 'Paid');
        break;
    }
  }

  // Apply search filter
  if (currentSearch) {
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      course.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
      course.category.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  // Apply sorting
  switch (currentSort) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'students-desc':
      filtered.sort((a, b) => b.students - a.students);
      break;
    case 'revenue-desc':
      filtered.sort((a, b) => b.revenue - a.revenue);
      break;
    case 'rating-desc':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return filtered;
}

// Filter courses by tab
window.filterCoursesByTab = function(tabElement, filter) {
  // Remove active class from all tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Add active class to clicked tab
  tabElement.classList.add('active');

  // Update current filter
  currentFilter = filter;

  // Re-render courses
  renderMyCoursesCards();

  // Update sidebar menu active state
  document.querySelectorAll('.figma-menu-child').forEach(item => {
    item.classList.remove('active');
  });

  // Set "My Courses" as active when using filter tabs
  const myCoursesMenuItem = document.getElementById('my-courses-menu');

  if ((filter === 'all' || filter === 'active') && myCoursesMenuItem) {
    myCoursesMenuItem.classList.add('active');
  }

  // Update page title only if we're on My Courses page
  const titleElement = document.querySelector('.figma-title h2');
  if (titleElement && document.getElementById('myCoursesGrid')) {
    const filterTitles = {
      all: 'My courses',
      active: 'My Courses - Active',
      draft: 'My Courses - Drafts',
      archived: 'My Courses - Archived',
      free: 'My Courses - Free',
      paid: 'My Courses - Paid'
    };
    titleElement.textContent = filterTitles[filter] || 'My courses';
  }
};

// Search courses
window.searchCourses = function() {
  const searchInput = document.getElementById('courseSearchInput');
  currentSearch = searchInput ? searchInput.value : '';
  renderMyCoursesCards();
};

// Sort courses
window.sortCourses = function() {
  const sortSelect = document.getElementById('courseSortSelect');
  currentSort = sortSelect ? sortSelect.value : 'newest';
  renderMyCoursesCards();
};

// Enhanced course action functions
window.viewCourseStats = function(id) {
  const course = myCoursesData.find(c => c.id === id);
  if (!course) return;

  const statsModal = `
    <div class="course-stats-modal" onclick="closeStatsModal()">
      <div class="stats-modal-content" onclick="event.stopPropagation()">
        <div class="stats-modal-header">
          <h3>${course.title} - Statistics</h3>
          <button onclick="closeStatsModal()" class="close-modal-btn">&times;</button>
        </div>
        <div class="stats-modal-body">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${course.students.toLocaleString()}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${course.lessons}</div>
              <div class="stat-label">Lessons</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${course.rating}/5</div>
              <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">$${course.revenue.toLocaleString()}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${course.status}</div>
              <div class="stat-label">Status</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${course.type}</div>
              <div class="stat-label">Type</div>
            </div>
          </div>
          <div class="stats-details">
            <h4>Course Details</h4>
            <p><strong>Category:</strong> ${course.category}</p>
            <p><strong>Created:</strong> ${new Date(course.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> ${new Date(course.updatedAt).toLocaleDateString()}</p>
            <p><strong>Price:</strong> ${course.price > 0 ? course.price.toLocaleString('uz-UZ') + ' UZS' : 'Bepul'}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', statsModal);
};

window.closeStatsModal = function() {
  const modal = document.querySelector('.course-stats-modal');
  if (modal) modal.remove();
};

window.editCourse = function(id) {
  const course = myCoursesData.find(c => c.id === id);
  if (!course) return;

  // Simple edit functionality - in a real app this would open an edit form
  const newTitle = prompt('Edit course title:', course.title);
  if (newTitle && newTitle !== course.title) {
    course.title = newTitle;
    course.updatedAt = new Date().toISOString().slice(0, 10);
    renderMyCoursesCards();

    // Show success message
    showMessage('Course updated successfully!', 'success');
  }
};

window.deleteCourse = function(id) {
  const course = myCoursesData.find(c => c.id === id);
  if (!course) return;

  if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
    // Remove course from array
    const index = myCoursesData.findIndex(c => c.id === id);
    if (index > -1) {
      myCoursesData.splice(index, 1);

      // Update statistics and tabs
      updateCoursesStatistics();
      updateFilterTabs();
      renderMyCoursesCards();

      showMessage('Course deleted successfully!', 'success');
    }
  }
};

// Filter from sidebar menu - works from any page
window.filterFromSidebar = function(filterType) {
  // Always store the filter to apply
  sessionStorage.setItem('pendingFilter', filterType);

  // Check if we're already on My Courses page
  const isOnMyCoursesPage = document.getElementById('myCoursesGrid') !== null;

  if (!isOnMyCoursesPage) {
    // If not on My Courses page, navigate to it
    openMyCourses();
    return;
  }

  // If already on My Courses page, apply filter immediately
  applyFilterFromSidebar(filterType);
};

// Apply filter logic (extracted for reuse)
function applyFilterFromSidebar(filterType) {
  // Only apply if we're on My Courses page
  if (!document.getElementById('myCoursesGrid')) {
    return;
  }

  // Update sidebar menu active state
  document.querySelectorAll('.figma-menu-child').forEach(item => {
    item.classList.remove('active');
  });

  // Set active state for the clicked item
  const menuItems = {
    draft: document.querySelector('[onclick*="filterFromSidebar(\'draft\')"]'),
    archived: document.querySelector('[onclick*="filterFromSidebar(\'archived\')"]')
  };

  if (menuItems[filterType]) {
    menuItems[filterType].classList.add('active');
  }

  // Update the filter tabs to match sidebar selection
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-filter') === filterType) {
      tab.classList.add('active');
    }
  });

  // Update current filter and re-render
  currentFilter = filterType;
  renderMyCoursesCards();

  // Update page title based on filter
  const titleElement = document.querySelector('.figma-title h2');
  if (titleElement) {
    const filterTitles = {
      draft: 'My Courses - Drafts',
      archived: 'My Courses - Archived'
    };
    titleElement.textContent = filterTitles[filterType] || 'My courses';
  }

  // Update header button text to match current filter
  const backButton = document.querySelector('[onclick*="backToDashboard"]');
  if (backButton) {
    const newText = filterType === 'draft' ? '← Back to All Courses' :
                    filterType === 'archived' ? '← Back to All Courses' : '← Back';
    backButton.textContent = newText;
  }
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    'Web Development': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>',
    'Design': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    'Programming': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 4l-6 8 6 8M16 4l6 8-6 8M11 2l-2 20"/></svg>',
    'Mobile Development': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M7 1h10a2 2 0 012 2v18a2 2 0 01-2 2H7a2 2 0 01-2-2V3a2 2 0 012-2zm0 2v18h10V3H7z"/></svg>',
    'Marketing': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    'Security': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
    'Data Science': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>',
    'Blockchain': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    'Machine Learning': '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
  };

  return icons[category] || '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
}

// Helper function to show messages
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-toast message-${type}`;
  messageDiv.textContent = message;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 100);

  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}
// Ensure AI Assistant function is globally accessible
window.openAIAssistantPage = openAIAssistantPage;

// Handle language change event - reload current page with new translations
function handleLanguageChange() {
  console.log('Language changed, reloading dashboard...');
  
  // Get current page from active menu item
  const activeMenuItem = document.querySelector('.figma-menu-child.active');
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    // If no content area, just reload the whole dashboard
    initDashboard();
    return;
  }
  
  // Determine which page is currently active and reload it
  if (activeMenuItem) {
    const menuText = activeMenuItem.textContent.trim();
    
    // Map menu text to page reload functions
    const pageReloadMap = {
      'Dashboard': () => initDashboard(),
      'Profile': () => openEditProfile(),
      'Messages': () => openMessagesPage(),
      'Sub Admin': () => openSubAdmin(),
      'Language': () => openLanguagePage(),
      'Customize UI': () => openCustomizeUI(),
      'My Subscription': () => openMySubscription(),
      'Quiz Analytics': () => openQuizAnalytics(),
      'Rating Comments': () => openRatingComments(),
      'Students Analytics': () => openStudentsAnalytics(),
      'Progress': () => openProgress(),
    };
    
    // Try to find and execute the reload function
    const reloadFn = pageReloadMap[menuText];
    if (reloadFn) {
      reloadFn();
    } else {
      // If no specific reload function, just reload dashboard
      initDashboard();
    }
  } else {
    // No active menu item, reload dashboard
    initDashboard();
  }
}


// Toggle Assignment Content Type (Text or File)
window.toggleAssignmentContentType = function(radio) {
  const lessonForm = radio.closest('.lesson-form');
  const textContent = lessonForm.querySelector('.assignment-text-content');
  const fileContent = lessonForm.querySelector('.assignment-file-content');
  
  if (radio.value === 'text') {
    textContent.style.display = 'block';
    fileContent.style.display = 'none';
  } else {
    textContent.style.display = 'none';
    fileContent.style.display = 'block';
  }
};

// Handle Assignment File Selection
window.handleAssignmentFileSelect = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  // Check file size (50MB max)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    showErrorToast('File size exceeds 50MB limit');
    input.value = '';
    return;
  }
  
  // Check file type - expanded to support more formats
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar', '.jpg', '.jpeg', '.png'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    showErrorToast('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG');
    input.value = '';
    return;
  }
  
  // Show file preview
  const uploadArea = input.closest('.file-upload-area');
  const placeholder = uploadArea.querySelector('.upload-placeholder');
  const preview = uploadArea.querySelector('.file-preview');
  const fileName = preview.querySelector('.file-name');
  const fileSize = preview.querySelector('.file-size');
  
  placeholder.style.display = 'none';
  preview.style.display = 'flex';
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  // Store file data for later upload
  uploadArea.dataset.fileName = file.name;
  uploadArea.dataset.fileSize = file.size;
};

// Remove Assignment File
window.removeAssignmentFile = function(button, event) {
  event.stopPropagation();
  
  const uploadArea = button.closest('.file-upload-area');
  const placeholder = uploadArea.querySelector('.upload-placeholder');
  const preview = uploadArea.querySelector('.file-preview');
  const fileInput = uploadArea.querySelector('input[type="file"]');
  
  // Reset file input
  fileInput.value = '';
  
  // Hide preview, show placeholder
  preview.style.display = 'none';
  placeholder.style.display = 'block';
  
  // Clear stored data
  delete uploadArea.dataset.fileName;
  delete uploadArea.dataset.fileSize;
};

// Format file size helper
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


// Open Create Questions Modal
window.openCreateQuestionsModal = function(button) {
  console.log('openCreateQuestionsModal called');
  const lessonForm = button.closest('.lesson-form');
  const quizType = lessonForm.getAttribute('data-quiz-type') || 'multiple-choice';
  console.log('Quiz type:', quizType);
  
  // Remove existing modal if any
  const existingModal = document.getElementById('createQuestionsModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const correctAnswersField = quizType === 'multiple-correct' ? `
    <div class="form-group">
      <label>Number of Correct Answers per Question</label>
      <input type="number" id="correctAnswersCount" min="1" max="10" value="2" placeholder="Enter number of correct answers" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary);">
      <small style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; display: block;">This will be applied to all questions</small>
    </div>
  ` : '';
  
  const modalHTML = `
    <div class="modal-overlay" id="createQuestionsModal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; align-items: center; justify-content: center;" onclick="if(event.target === this) closeCreateQuestionsModal()">
      <div class="modal-content" style="max-width: 500px; width: 90%; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--text-primary);">Create Quiz Questions</h3>
          <button class="modal-close-btn" onclick="closeCreateQuestionsModal()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-size: 14px; font-weight: 500;">Number of Questions</label>
            <input type="number" id="questionsCount" min="1" max="50" value="5" placeholder="Enter number of questions" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary);">
          </div>
          ${correctAnswersField}
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-size: 14px; font-weight: 500;">Answer Options per Question</label>
            <input type="number" id="answerOptionsCount" min="2" max="10" value="4" placeholder="Enter number of answer options" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary);">
          </div>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px;">
          <button class="btn-secondary" onclick="closeCreateQuestionsModal()" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Cancel</button>
          <button class="btn-primary" onclick="createQuizQuestions()" style="background: var(--primary-color); color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Create Questions</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('Modal added to DOM');
};

// Close Create Questions Modal
window.closeCreateQuestionsModal = function() {
  const modal = document.getElementById('createQuestionsModal');
  if (modal) {
    modal.remove();
  }
};

// Create Quiz Questions
window.createQuizQuestions = function() {
  const questionsCount = parseInt(document.getElementById('questionsCount').value) || 5;
  const answerOptionsCount = parseInt(document.getElementById('answerOptionsCount').value) || 4;
  const correctAnswersCountInput = document.getElementById('correctAnswersCount');
  const correctAnswersCount = correctAnswersCountInput ? parseInt(correctAnswersCountInput.value) || 1 : 1;
  
  // Validate
  if (questionsCount < 1 || questionsCount > 50) {
    showErrorToast('Please enter a valid number of questions (1-50)');
    return;
  }
  
  if (answerOptionsCount < 2 || answerOptionsCount > 10) {
    showErrorToast('Please enter a valid number of answer options (2-10)');
    return;
  }
  
  if (correctAnswersCount > answerOptionsCount) {
    showErrorToast('Number of correct answers cannot exceed number of answer options');
    return;
  }
  
  // Find the lesson form
  const lessonForm = document.querySelector('.lesson-form[data-quiz-type]');
  if (!lessonForm) return;
  
  const questionsList = lessonForm.querySelector('.questions-list');
  const quizType = lessonForm.getAttribute('data-quiz-type') || 'multiple-choice';
  
  // Clear existing questions
  questionsList.innerHTML = '';
  
  // Create questions
  for (let i = 1; i <= questionsCount; i++) {
    addSingleQuizQuestion(questionsList, quizType, i, answerOptionsCount, correctAnswersCount);
  }
  
  closeCreateQuestionsModal();
  showSuccessToast(`${questionsCount} questions created successfully!`);
};

// Add Single Quiz Question (helper function)
function addSingleQuizQuestion(questionsList, quizType, questionNumber, answerOptionsCount, correctAnswersCount) {
  const instructionText = quizType === 'multiple-correct' 
    ? `Choose ${correctAnswersCount} correct answer${correctAnswersCount > 1 ? 's' : ''}`
    : 'Choose 1 correct answer';
  
  let answersHTML = '';
  for (let i = 0; i < answerOptionsCount; i++) {
    answersHTML += `
      <div class="answer-item">
        <div class="${quizType === 'multiple-choice' ? 'answer-radio' : 'answer-checkbox'}" onclick="toggleAnswer(this)" data-max-correct="${correctAnswersCount}">
          ${quizType === 'multiple-choice' ? '○' : '☐'}
        </div>
        <input type="text" class="answer-input" placeholder="Enter answer option ${i + 1}..." />
      </div>
    `;
  }
  
  const questionHTML = `
    <div class="question-item">
      <div class="question-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span class="question-number" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Question ${questionNumber}</span>
          <span class="question-instruction" style="font-size: 12px; color: var(--primary-color); font-weight: 500;">${instructionText}</span>
        </div>
        <button type="button" class="delete-question-btn" onclick="deleteQuestion(this)" style="background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 6px; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <input type="text" class="question-input" placeholder="Enter question text..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary); margin-bottom: 12px;" />
      <div class="answers-section">
        <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: block;">
          Answer options:
        </label>
        <div class="answers-list" data-max-correct="${correctAnswersCount}">
          ${answersHTML}
        </div>
      </div>
    </div>
  `;
  
  questionsList.insertAdjacentHTML('beforeend', questionHTML);
}


// Load My Courses from Backend
async function loadMyCoursesFromBackend() {
  try {
    const user = store.getState().user;
    if (!user) return;
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const url = `${apiBaseUrl}/courses?teacher=${user._id}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    
    if (result.success && result.courses) {
      window.myCoursesData = result.courses;
      updateCourseStats(result.courses);
      updateCoursesStatistics(); // Update My Courses page stats
      renderMyCoursesCards(result.courses);
    } else {
      updateCourseStats([]);
      updateCoursesStatistics(); // Update My Courses page stats
      renderMyCoursesCards([]);
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    renderMyCoursesCards([]);
  }
}

// Render My Courses Cards - Rasmdagidek design
function renderMyCoursesCards(courses) {
  const grid = document.getElementById('myCoursesGrid');
  if (!grid) return;

  if (!courses || courses.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 80px 20px;
        color: var(--text-secondary);
      ">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 24px; opacity: 0.4;">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <h3 style="margin-bottom: 12px; font-size: 20px; font-weight: 600; color: var(--text-primary);">No courses yet</h3>
        <p style="margin-bottom: 24px; opacity: 0.7; font-size: 15px;">Create your first course to get started</p>
        <button class="figma-btn figma-btn-primary" onclick="openCreateCourse()">Create Course</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = courses.map(course => `
    <div class="course-card-modern" data-course-id="${course._id}">
      <!-- Thumbnail -->
      <div class="course-thumbnail-modern" style="background-image: url('${course.thumbnail}');">
        <div class="course-status-badge-modern status-${course.status.toLowerCase()}">${course.status}</div>
      </div>
      
      <!-- Course Info -->
      <div class="course-card-body-modern">
        <div class="course-category-badge">${course.category || 'Uncategorized'}</div>
        <h3 class="course-title-modern">${course.title}</h3>
        <p class="course-description-modern">${course.description || ''}</p>
        
        <!-- Stats Grid -->
        <div class="course-stats-grid-modern">
          <div class="stat-item-modern">
            <div class="stat-value-modern">${course.totalStudents || 0}</div>
            <div class="stat-label-modern">Students</div>
          </div>
          <div class="stat-item-modern">
            <div class="stat-value-modern">${course.rating || 0}</div>
            <div class="stat-label-modern">Rating</div>
          </div>
          <div class="stat-item-modern">
            <div class="stat-value-modern">${course.totalLessons || 0}</div>
            <div class="stat-label-modern">Lessons</div>
          </div>
          <div class="stat-item-modern">
            <div class="stat-value-modern">${course.price > 0 ? course.price.toLocaleString('uz-UZ') + ' UZS' : 'Bepul'}</div>
            <div class="stat-label-modern">Price</div>
          </div>
        </div>
        
        <!-- Revenue -->
        <div class="course-revenue-modern">
          <span class="revenue-label-modern">Revenue</span>
          <span class="revenue-amount-modern">$${(course.revenue || 0).toLocaleString()}</span>
        </div>
        
        <!-- Actions -->
        <div class="course-actions-modern">
          <button class="course-btn-modern" onclick="editCourse('${course._id}')">Edit</button>
          <button class="course-btn-modern" onclick="viewCourseStats('${course._id}')">Stats</button>
          <button class="course-btn-modern course-btn-delete-modern" onclick="deleteCourseConfirm('${course._id}', \`${course.title.replace(/`/g, '')}\`)">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter Courses
window.filterCourses = function(filter) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-filter') === filter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  const courses = window.myCoursesData || [];
  let filtered = courses;
  
  if (filter === 'all') {
    filtered = courses;
  } else if (filter === 'free') {
    filtered = courses.filter(course => course.courseType === 'free' || course.price === 0);
  } else if (filter === 'paid') {
    filtered = courses.filter(course => course.courseType === 'paid' || course.price > 0);
  } else {
    // Status filter (active, draft, archived)
    filtered = courses.filter(course => course.status.toLowerCase() === filter);
  }
  
  renderMyCoursesCards(filtered);
};

// Search Courses
window.searchCourses = function() {
  const searchInput = document.getElementById('courseSearchInput');
  const searchTerm = searchInput.value.toLowerCase();
  
  const courses = window.myCoursesData || [];
  const filtered = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm) ||
    (course.description && course.description.toLowerCase().includes(searchTerm)) ||
    course.category.toLowerCase().includes(searchTerm)
  );
  
  renderMyCoursesCards(filtered);
};

// Sort Courses
window.sortCourses = function() {
  const sortSelect = document.getElementById('courseSortSelect');
  const sortValue = sortSelect.value;
  
  let courses = [...(window.myCoursesData || [])];
  
  switch(sortValue) {
    case 'newest':
      courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      courses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'name-asc':
      courses.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'name-desc':
      courses.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }
  
  renderMyCoursesCards(courses);
};

// Edit Course
window.editCourse = async function(courseId) {
  console.log('Edit course:', courseId);
  
  try {
    // Get course data from backend
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    console.log('Course data loaded:', result);
    
    if (result.success && result.course) {
      // Open course edit page with loaded data
      openCourseEditPage(result.course);
    } else {
      showErrorToast('Failed to load course data');
    }
  } catch (error) {
    console.error('Error loading course:', error);
    showErrorToast('Failed to load course data');
  }
};

// View Course Stats
window.viewCourseStats = function(courseId) {
  console.log('View stats:', courseId);
  showErrorToast('Stats functionality coming soon!');
};

// Delete Course Confirm
window.deleteCourseConfirm = function(courseId, courseTitle) {
  const modalHTML = `
    <div class="modal-overlay" id="deleteCourseModal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; align-items: center; justify-content: center;" onclick="if(event.target === this) closeDeleteCourseModal()">
      <div class="modal-content" style="max-width: 500px; width: 90%; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--text-primary);">Delete Course</h3>
          <button class="modal-close-btn" onclick="closeDeleteCourseModal()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-primary); margin: 0 0 16px 0;">Are you sure you want to delete this course?</p>
          <div style="background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <p style="color: #ff3b30; margin: 0; font-weight: 500;">${courseTitle}</p>
          </div>
          <p style="color: var(--text-secondary); font-size: 13px; margin: 0;">This action cannot be undone. All course data will be permanently deleted.</p>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px;">
          <button class="btn-secondary" onclick="closeDeleteCourseModal()" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Cancel</button>
          <button onclick="confirmDeleteCourse('${courseId}')" style="background: #ff3b30; color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">Delete Course</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closeDeleteCourseModal = function() {
  const modal = document.getElementById('deleteCourseModal');
  if (modal) modal.remove();
};

window.confirmDeleteCourse = async function(courseId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSuccessToast('Course deleted successfully!');
      closeDeleteCourseModal();
      await loadMyCoursesFromBackend();
    } else {
      throw new Error(result.message || 'Failed to delete course');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    showErrorToast(error.message || 'Failed to delete course');
  }
};


// Update Course Statistics
function updateCourseStats(courses) {
  const totalCourses = courses.length;
  const totalEnrolled = courses.reduce((sum, course) => sum + (course.totalStudents || 0), 0);
  const totalRevenue = courses.reduce((sum, course) => sum + (course.revenue || 0), 0);
  const liveStudents = Math.floor(totalEnrolled * 0.08); // Estimate 8% online
  
  // Update DOM
  const totalCoursesEl = document.getElementById('totalCoursesCount');
  const totalEnrolledEl = document.getElementById('totalEnrolledCount');
  const totalRevenueEl = document.getElementById('totalRevenueAmount');
  const liveStudentsEl = document.getElementById('liveStudentsCount');
  
  if (totalCoursesEl) totalCoursesEl.textContent = totalCourses;
  if (totalEnrolledEl) totalEnrolledEl.textContent = totalEnrolled.toLocaleString();
  if (totalRevenueEl) totalRevenueEl.textContent = '$' + totalRevenue.toLocaleString();
  if (liveStudentsEl) liveStudentsEl.textContent = liveStudents;
}

// Open Course Edit Page
function openCourseEditPage(courseData) {
  console.log('Opening course edit page with data:', courseData);
  
  const userData = store.getState().user;
  const contentArea = document.querySelector('.figma-content-area');
  
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = 'Edit Course';
  }
  
  // Use the same layout as create course page, but with pre-filled data
  contentArea.innerHTML = `
          <form class="create-course-form" id="editCourseForm" onsubmit="handleEditCourse(event, '${courseData._id}')">

            <!-- Basic Information Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.basicInfo')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseTitle')}</label>
                <input type="text" class="form-input" name="title" value="${courseData.title || ''}" placeholder="${t('createCourse.courseTitlePlaceholder')}" required />
              </div>

              <div class="form-field">
                <label class="field-label">Description</label>
                <textarea class="form-textarea" name="description" rows="4" placeholder="Write a description of your course..." required>${courseData.description || ''}</textarea>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">${t('createCourse.category')}</label>
                  <select class="form-input" name="category" required>
                    <option value="">Select category...</option>
                    <option value="Web Development" ${courseData.category === 'Web Development' ? 'selected' : ''}>Web Development</option>
                    <option value="Mobile Development" ${courseData.category === 'Mobile Development' ? 'selected' : ''}>Mobile Development</option>
                    <option value="Programming" ${courseData.category === 'Programming' ? 'selected' : ''}>Programming</option>
                    <option value="Data Science" ${courseData.category === 'Data Science' ? 'selected' : ''}>Data Science</option>
                    <option value="Machine Learning" ${courseData.category === 'Machine Learning' ? 'selected' : ''}>Machine Learning</option>
                    <option value="Artificial Intelligence" ${courseData.category === 'Artificial Intelligence' ? 'selected' : ''}>Artificial Intelligence</option>
                    <option value="Design" ${courseData.category === 'Design' ? 'selected' : ''}>Design</option>
                    <option value="UI/UX Design" ${courseData.category === 'UI/UX Design' ? 'selected' : ''}>UI/UX Design</option>
                    <option value="Graphic Design" ${courseData.category === 'Graphic Design' ? 'selected' : ''}>Graphic Design</option>
                    <option value="Marketing" ${courseData.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                    <option value="Digital Marketing" ${courseData.category === 'Digital Marketing' ? 'selected' : ''}>Digital Marketing</option>
                    <option value="Business" ${courseData.category === 'Business' ? 'selected' : ''}>Business</option>
                    <option value="Finance" ${courseData.category === 'Finance' ? 'selected' : ''}>Finance</option>
                    <option value="Photography" ${courseData.category === 'Photography' ? 'selected' : ''}>Photography</option>
                    <option value="Video Editing" ${courseData.category === 'Video Editing' ? 'selected' : ''}>Video Editing</option>
                    <option value="Music" ${courseData.category === 'Music' ? 'selected' : ''}>Music</option>
                    <option value="Language Learning" ${courseData.category === 'Language Learning' ? 'selected' : ''}>Language Learning</option>
                    <option value="Health & Fitness" ${courseData.category === 'Health & Fitness' ? 'selected' : ''}>Health & Fitness</option>
                    <option value="Lifestyle" ${courseData.category === 'Lifestyle' ? 'selected' : ''}>Lifestyle</option>
                    <option value="Security" ${courseData.category === 'Security' ? 'selected' : ''}>Security</option>
                    <option value="Cybersecurity" ${courseData.category === 'Cybersecurity' ? 'selected' : ''}>Cybersecurity</option>
                    <option value="Blockchain" ${courseData.category === 'Blockchain' ? 'selected' : ''}>Blockchain</option>
                    <option value="Cloud Computing" ${courseData.category === 'Cloud Computing' ? 'selected' : ''}>Cloud Computing</option>
                    <option value="DevOps" ${courseData.category === 'DevOps' ? 'selected' : ''}>DevOps</option>
                    <option value="Game Development" ${courseData.category === 'Game Development' ? 'selected' : ''}>Game Development</option>
                    <option value="Database" ${courseData.category === 'Database' ? 'selected' : ''}>Database</option>
                    <option value="Testing" ${courseData.category === 'Testing' ? 'selected' : ''}>Testing</option>
                    <option value="Other" ${courseData.category === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>

            </div>

            <!-- Course Image Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.courseImage')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseThumbnail')}</label>
                <div class="upload-area" id="uploadArea" onclick="triggerFileUpload()">
                  <input type="file" id="thumbnailInput" accept="image/*" style="display: none;" onchange="handleImageUpload(event)" />
                  ${courseData.thumbnail ? `
                    <div class="image-preview" id="imagePreview">
                      <img id="previewImg" src="${courseData.thumbnail}" alt="Course thumbnail" />
                      <div class="image-overlay">
                        <button type="button" class="image-action-btn" onclick="changeImage(event)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          ${t('createCourse.change')}
                        </button>
                        <button type="button" class="image-action-btn delete" onclick="deleteImage(event)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          ${t('createCourse.delete')}
                        </button>
                      </div>
                    </div>
                  ` : `
                    <div class="upload-content" id="uploadContent">
                      <div class="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div class="upload-text">
                        <p>${t('createCourse.uploadThumbnail')}</p>
                        <small>${t('createCourse.thumbnailHint')}</small>
                      </div>
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- Pricing & Access Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.pricingAccess')}</h3>

              <div class="form-field">
                <label class="field-label">${t('createCourse.courseType')}</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="paid" ${courseData.courseType === 'paid' ? 'checked' : ''} onchange="toggleEditPricing(this)" />
                    <span class="radio-custom"></span>
                    <span>${t('createCourse.paid')}</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="free" ${courseData.courseType === 'free' ? 'checked' : ''} onchange="toggleEditPricing(this)" />
                    <span class="radio-custom"></span>
                    <span>${t('createCourse.free')}</span>
                  </label>
                </div>
              </div>

              <div class="form-row" id="pricingFields" style="display: ${courseData.courseType === 'paid' ? 'flex' : 'none'};">
                <div class="form-field">
                  <label class="field-label">${t('createCourse.coursePrice')}</label>
                  <input type="number" class="form-input" name="price" value="${courseData.price || ''}" placeholder="${t('createCourse.coursePricePlaceholder')}" step="0.01" />
                </div>
                <div class="form-field">
                  <label class="field-label">${t('createCourse.discountPrice')}</label>
                  <input type="number" class="form-input" name="discountPrice" value="${courseData.discountPrice || ''}" placeholder="${t('createCourse.discountPricePlaceholder')}" step="0.01" />
                  <small class="field-note">${t('createCourse.discountNote')}</small>
                </div>
              </div>
            </div>

            <!-- Course Structure Section -->
            <div class="course-section">
              <h3 class="course-section-title">${t('createCourse.courseStructure')}</h3>

              <div class="info-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Organize your course into modules (sections) and lessons. You can add videos, files, quizzes, and assignments.</span>
              </div>

              <div class="modules-container" id="modulesContainer">
                <!-- Modules will be loaded here -->
                <button type="button" class="add-module-btn" onclick="addNewModule()">+ Add New Module</button>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions course-actions">
              <button type="button" class="btn-cancel" onclick="backToDashboard()">Cancel</button>
              <button type="submit" class="btn-secondary" name="action" value="draft">Save as Draft</button>
              <button type="submit" class="btn-save" name="action" value="publish">Update Course</button>
            </div>

          </form>
  `;
  
  // Load existing modules and lessons
  loadCourseModules(courseData);
  
  // Set uploaded thumbnail URL if exists
  if (courseData.thumbnail) {
    window.uploadedThumbnailUrl = courseData.thumbnail;
  }
  
  // Hide upload content if image exists
  if (courseData.thumbnail) {
    const uploadContent = document.getElementById('uploadContent');
    if (uploadContent) {
      uploadContent.classList.add('hidden');
    }
  }
}

// Add Module function for edit page
window.addModule = function() {
  const modulesContainer = document.getElementById('modulesContainer');
  const existingModules = modulesContainer.querySelectorAll('.module-item').length;
  const newModuleNumber = existingModules + 1;

  const newModuleHTML = `
    <div class="module-item">
      <div class="module-header" onclick="toggleModule(this)">
        <div class="module-info">
          <h4>Module ${newModuleNumber}: New Module</h4>
          <p>0 lessons • 0 hours</p>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button type="button" class="action-btn" onclick="editModule(this, event)">Edit</button>
          <button type="button" class="action-btn delete" onclick="deleteModule(this, event)">Delete</button>
        </div>
      </div>
      <div class="lessons-container" style="display: block;">
        <!-- Lessons will be added here -->
      </div>
      <div class="add-lesson-dropdown">
        <button type="button" class="add-btn dropdown-toggle" onclick="toggleLessonDropdown(this, event)">+ Add Lesson</button>
        <div class="dropdown-menu">
          <a href="#" onclick="addLesson('video', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            </svg>
            Video
          </a>
          <a href="#" onclick="addLesson('quiz', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
            </svg>
            Quiz
          </a>
          <a href="#" onclick="addLesson('assignment', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            Assignment
          </a>
          <a href="#" onclick="addLesson('file', this, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2"/>
              <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            File
          </a>
        </div>
      </div>
    </div>
  `;

  // Insert before the "Add Module" button
  const addButton = modulesContainer.querySelector('.add-module-btn');
  if (addButton) {
    addButton.insertAdjacentHTML('beforebegin', newModuleHTML);
  } else {
    modulesContainer.insertAdjacentHTML('beforeend', newModuleHTML);
  }
};

// Load Course Modules and Lessons
function loadCourseModules(courseData) {
  const modulesContainer = document.getElementById('modulesContainer');
  
  if (courseData.modules && courseData.modules.length > 0) {
    courseData.modules.forEach((module, moduleIndex) => {
      // Add module
      addModule();
      
      const moduleItems = document.querySelectorAll('.module-item');
      const currentModule = moduleItems[moduleItems.length - 1];
      
      // Set module title
      const moduleTitle = currentModule.querySelector('.module-info h4');
      if (moduleTitle) {
        moduleTitle.textContent = module.title || `Module ${moduleIndex + 1}`;
      }
      
      // Add lessons to this module
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach(lesson => {
          // Add lesson based on type
          const lessonContainer = currentModule.querySelector('.lessons-container');
          
          // Create lesson item HTML
          let lessonHTML = '';
          let iconSVG = '';
          
          switch(lesson.type) {
            case 'video':
              iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>`;
              break;
            case 'quiz':
              iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
              </svg>`;
              break;
            case 'assignment':
              iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>`;
              break;
            case 'file':
              iconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13,2 13,9 20,9"/>
              </svg>`;
              break;
          }
          
          // Create proper lesson HTML with all buttons
          let actionButtons = `
            <button class="edit-btn" onclick="editLesson(this, event)">Edit</button>
            <button class="delete-btn" onclick="deleteLesson(this, event)">Delete</button>
          `;
          
          // Add view button for video lessons
          if (lesson.type === 'video' && lesson.videoUrl) {
            actionButtons += `<button class="view-btn" onclick="viewVideo(this, event)">Ko'rish</button>`;
          }
          
          // Add view questions button for quiz lessons
          if (lesson.type === 'quiz' && lesson.questions && lesson.questions.length > 0) {
            actionButtons += `<button class="view-btn" onclick="viewQuizQuestions(this, event)">Questions (${lesson.questions.length})</button>`;
          }
          
          // Create lesson duration/info text
          let lessonInfo = lesson.duration || lesson.type;
          if (lesson.type === 'quiz' && lesson.questions && lesson.questions.length > 0) {
            lessonInfo = `Quiz • ${lesson.questions.length} questions`;
          }
          
          lessonHTML = `
            <div class="lesson-item" data-lesson='${JSON.stringify(lesson).replace(/'/g, "&apos;")}' data-video-url="${lesson.videoUrl || ''}">
              <div class="lesson-title-with-icon">
                <span class="lesson-icon">${iconSVG}</span>
                <span>${lesson.title}</span>
              </div>
              <div class="lesson-info-actions">
                <span class="lesson-duration">${lessonInfo}</span>
                ${actionButtons}
              </div>
            </div>
          `;
          
          lessonContainer.insertAdjacentHTML('beforeend', lessonHTML);
          
          // Store lesson data
          const newLessonItem = lessonContainer.lastElementChild;
          newLessonItem.lessonData = lesson;
        });
      }
      
      // Update module info
      updateModuleInfo(currentModule);
    });
  }
}

// Handle Edit Course Form Submission
window.handleEditCourse = async function(e, courseId) {
  e.preventDefault();
  
  const user = store.getState().user;
  if (!user) {
    showErrorToast('User not found');
    return;
  }
  
  // Determine which button was clicked
  const clickedButton = e.submitter;
  const action = clickedButton?.value || 'publish';
  const status = action === 'draft' ? 'draft' : 'active';
  
  console.log('📝 Updating course with action:', action, 'status:', status);

  // Show loading state
  const originalText = clickedButton.textContent;
  clickedButton.textContent = action === 'draft' ? 'Saving...' : 'Updating...';
  clickedButton.disabled = true;

  try {
    const formData = new FormData(e.target);
    
    // Get basic course info
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const courseType = formData.get('courseType') || 'free';
    const price = courseType === 'paid' ? parseInt(formData.get('price')) || 0 : 0;
    const discountPrice = courseType === 'paid' ? parseInt(formData.get('discountPrice')) || 0 : 0;
    
    // Get thumbnail URL (use existing or newly uploaded)
    const thumbnail = window.uploadedThumbnailUrl || '';
    
    console.log('🖼️ Thumbnail check:', {
      uploadedThumbnailUrl: window.uploadedThumbnailUrl,
      thumbnail: thumbnail,
      hasThumbnail: !!thumbnail
    });
    
    // Validate required fields
    if (!title || !description || !category) {
      throw new Error('Please fill in all required fields');
    }
    
    if (!thumbnail) {
      throw new Error('Please upload a course thumbnail');
    }
    
    // Collect modules data
    const modules = [];
    const moduleItems = document.querySelectorAll('.module-item');
    
    moduleItems.forEach((moduleItem, moduleIndex) => {
      const moduleTitle = moduleItem.querySelector('.module-info h4')?.textContent || `Module ${moduleIndex + 1}`;
      const lessons = [];
      
      const lessonItems = moduleItem.querySelectorAll('.lesson-item');
      lessonItems.forEach((lessonItem, lessonIndex) => {
        // Get full lesson data from stored data
        const lessonData = lessonItem.lessonData || {};
        
        const lesson = {
          type: lessonData.type || 'video',
          title: lessonData.title || `Lesson ${lessonIndex + 1}`,
          order: lessonIndex + 1,
          duration: lessonData.duration || '',
          ...lessonData // Include all lesson data
        };
        
        console.log('📚 Lesson data being updated:', lesson);
        lessons.push(lesson);
      });
      
      if (lessons.length > 0) {
        modules.push({
          title: moduleTitle,
          order: moduleIndex + 1,
          lessons,
        });
      }
    });
    
    const courseData = {
      title,
      description,
      category,
      thumbnail,
      level: 'beginner',
      language: 'Uzbek',
      duration: '0',
      courseType,
      price: courseType === 'paid' ? price : 0,
      discountPrice: courseType === 'paid' ? discountPrice : 0,
      status,
      modules,
      teacher: user._id,
    };
    
    console.log('📦 Sending updated course data:', courseData);

    // Call API to update course
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const updateCourseUrl = `${apiBaseUrl}/courses/${courseId}`;
    
    console.log('📤 Updating course at:', updateCourseUrl);
    
    const response = await fetch(updateCourseUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(courseData),
    });
    
    const result = await response.json();
    console.log('📥 API Response:', result);

    if (!response.ok) {
      console.error('❌ Update errors:', result.errors || result.message);
      throw new Error(result.message || 'Update failed');
    }

    if (result.success) {
      const message = status === 'draft' 
        ? 'Course updated and saved as draft!' 
        : 'Course updated successfully!';
      showSuccessToast(message);
      setTimeout(() => {
        openMyCourses(); // Go back to My Courses page
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to update course');
    }

  } catch (error) {
    console.error('Error updating course:', error);
    showErrorToast(error.message || 'Failed to update course. Please try again.');
  } finally {
    // Restore button state
    if (clickedButton) {
      clickedButton.textContent = originalText;
      clickedButton.disabled = false;
    }
  }
};

// Toggle Pricing Section for Edit Course
window.togglePricing = function(radio) {
  const pricingSection = document.querySelector('.pricing-section');
  if (pricingSection) {
    pricingSection.style.display = radio.value === 'paid' ? 'block' : 'none';
  }
};

// Toggle Pricing Fields for Edit Course
window.toggleEditPricing = function(radio) {
  const pricingFields = document.getElementById('pricingFields');
  if (pricingFields) {
    pricingFields.style.display = radio.value === 'paid' ? 'flex' : 'none';
  }
};

// View Quiz Questions Function
window.viewQuizQuestions = function(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const lessonItem = button.closest('.lesson-item');
  const lessonData = lessonItem.lessonData || {};
  const questions = lessonData.questions || [];
  
  if (questions.length === 0) {
    showErrorToast('No questions found for this quiz');
    return;
  }
  
  // Create quiz questions modal
  const questionsHTML = questions.map((q, index) => `
    <div class="quiz-question-item" style="margin-bottom: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">Question ${index + 1}</h4>
      <p style="margin: 0 0 12px 0; color: var(--text-primary);">${q.question}</p>
      <div class="quiz-options">
        ${q.options.map((option, optIndex) => `
          <div style="margin: 4px 0; padding: 8px; background: ${q.correctAnswers && q.correctAnswers.includes(optIndex) ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; color: var(--text-primary);">
            ${String.fromCharCode(65 + optIndex)}. ${option} ${q.correctAnswers && q.correctAnswers.includes(optIndex) ? '✓' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  const modalHTML = `
    <div class="quiz-modal" onclick="closeQuizModal()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
      <div class="quiz-modal-content" onclick="event.stopPropagation()" style="max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; background: var(--bg-secondary); border-radius: 12px; padding: 24px;">
        <div class="quiz-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--text-primary);">Quiz Questions: ${lessonData.title}</h3>
          <button onclick="closeQuizModal()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="quiz-questions-list">
          ${questionsHTML}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="closeQuizModal()" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Close Quiz Modal
window.closeQuizModal = function() {
  const modal = document.querySelector('.quiz-modal');
  if (modal) {
    modal.remove();
  }
};

// Open certificate modal to view full image
window.openCertificateModal = function(imageUrl, title) {
  const modal = document.createElement('div');
  modal.className = 'certificate-modal-overlay';
  modal.innerHTML = `
    <div class="certificate-modal-content">
      <button class="certificate-modal-close" onclick="this.closest('.certificate-modal-overlay').remove()">×</button>
      <img src="${imageUrl}" alt="${title}" />
    </div>
  `;
  
  // Close modal when clicking outside the image
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close modal with Escape key
  const handleEscape = function(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  document.body.appendChild(modal);
};

// Check if current URL is a teacher landing page and serve it
window.checkAndServeLandingPage = function() {
  const currentPath = window.location.pathname;

  // Check if URL matches student dashboard pattern: /teacher/teacherId/student-dashboard
  const studentDashboardPattern = /^\/teacher\/([a-zA-Z0-9]+)\/student-dashboard$/;
  const studentMatch = currentPath.match(studentDashboardPattern);

  if (studentMatch) {
    const teacherId = studentMatch[1];
    console.log('📚 Loading student dashboard for teacher:', teacherId);

    // Save teacherId to sessionStorage
    sessionStorage.setItem('currentTeacherId', teacherId);

    // Load student dashboard
    import('../student/landing-student-dashboard.js').then(module => {
      module.initLandingStudentDashboard();
    });
    return true;
  }

  // Check if URL matches teacher landing page pattern: /teacher/teacherId
  const teacherPagePattern = /^\/teacher\/([a-zA-Z0-9]+)$/;
  const match = currentPath.match(teacherPagePattern);

  if (match) {
    const teacherId = match[1];
    console.log('📄 Loading teacher landing page for ID:', teacherId);

    // Save teacherId to sessionStorage for later use
    sessionStorage.setItem('currentTeacherId', teacherId);

    // Load and display teacher landing page
    loadTeacherLandingPage(teacherId);
    return true;
  }

  return false;
};

// Load teacher landing page by ID
async function loadTeacherLandingPage(teacherId) {
  try {
    // Show loading state
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 100%); color: white;">
        <div style="text-align: center;">
          <div style="width: 50px; height: 50px; border: 3px solid rgba(126, 162, 212, 0.3); border-top: 3px solid #7ea2d4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <p style="font-size: 18px; color: rgba(255,255,255,0.8);">Loading teacher's page...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    // Get teacher profile by ID (public endpoint, no token needed)
    console.log('📡 Fetching teacher profile from API...');
    const apiBaseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8001/api' 
      : 'https://darslinker-backend.onrender.com/api';
    const response = await fetch(`${apiBaseUrl}/teachers/${teacherId}`);
    const teacherResult = await response.json();
    console.log('📡 API Response:', teacherResult);

    if (teacherResult.success && teacherResult.teacher) {
      const teacher = teacherResult.teacher;
      
      // Debug: Check teacher data and theme color
      console.log('🎨 Teacher data:', teacher);
      console.log('🎨 Teacher courses:', teacher.courses);
      console.log('🎨 Landing page settings:', teacher.landingPageSettings);
      console.log('🎨 Featured courses from settings:', teacher.landingPageSettings?.featuredCourses);
      console.log('🎨 Theme color:', teacher.landingPageSettings?.themeColor);

      // Generate and display the landing page
      const landingHTML = await generateLandingPageHTML(teacher);
      document.open();
      document.write(landingHTML);
      document.close();
      return;
    }

    // Teacher not found - show 404 page
    document.body.innerHTML = generateTeacherNotFoundHTML(teacherId);

  } catch (error) {
    console.error('❌ Error loading teacher landing page:', error);
    document.body.innerHTML = generateErrorHTML();
  }
}

// Generate 404 page for teacher not found
function generateTeacherNotFoundHTML(teacherId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Teacher Not Found</title>
    </head>
    <body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <div style="font-size: 120px; margin-bottom: 20px; opacity: 0.3;">🔍</div>
        <h1 style="font-size: 3rem; margin-bottom: 16px; color: #7ea2d4;">Teacher Not Found</h1>
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.7); margin-bottom: 30px;">
          We couldn't find a teacher with this ID.
        </p>
        <p style="color: rgba(255,255,255,0.5); margin-bottom: 30px;">
          The teacher might not have set up their landing page yet, or the URL might be incorrect.
        </p>
        <a href="/" style="display: inline-block; padding: 16px 32px; background: #7ea2d4; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.3s ease;">
          Go to DarsLinker
        </a>
      </div>
    </body>
    </html>
  `;
}

// Generate error page
function generateErrorHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <div style="font-size: 120px; margin-bottom: 20px; opacity: 0.3;">⚠️</div>
        <h1 style="font-size: 2.5rem; margin-bottom: 16px; color: #ef4444;">Something went wrong</h1>
        <p style="font-size: 1.1rem; color: rgba(255,255,255,0.7); margin-bottom: 30px;">
          We encountered an error while loading this page. Please try again later.
        </p>
        <a href="/" style="display: inline-block; padding: 16px 32px; background: #7ea2d4; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          Go to DarsLinker
        </a>
      </div>
    </body>
    </html>
  `;
}

// Auto-check for landing page on load
document.addEventListener('DOMContentLoaded', function() {
  // Only check if we're not already in the dashboard
  if (!document.querySelector('.figma-dashboard')) {
    checkAndServeLandingPage();
  }
});

// New Landing Settings HTML
function getNewLandingSettingsHTML(user, landingData = null) {
  const productionURL = 'https://bucolic-fairy-0e50d6.netlify.app';
  const landingURL = `${productionURL}/teacher/${user._id}`;
  
  // Default values or from landingData
  const settings = landingData || {
    title: `${user.firstName} ${user.lastName}'s Courses`,
    subtitle: user.specialization || 'Expert Instructor',
    description: 'Discover amazing courses and start your learning journey today.',
    primaryColor: '#7ea2d4',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    showCourses: true,
    showAbout: true,
    aboutText: user.bio || '',
    socialLinks: {
      telegram: user.telegramUsername || '',
      instagram: '',
      youtube: '',
      linkedin: ''
    }
  };

  return `
    <form class="create-course-form" id="landingSettingsForm" onsubmit="saveLandingSettings(event)">
      
      <!-- Landing URL Section -->
      <div class="course-section">
        <h3 class="course-section-title">🔗 Your Landing Page URL</h3>
        
        <div class="form-field">
          <label class="field-label">Public Landing Page Link</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="text" class="form-input" value="${landingURL}" readonly style="flex: 1;" />
            <button type="button" class="btn-secondary" onclick="copyLandingURL('${landingURL}')" style="white-space: nowrap;">Copy Link</button>
          </div>
          <small class="field-note">Share this link with your students to showcase your courses</small>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="course-section">
        <h3 class="course-section-title">🎯 Hero Section</h3>
        
        <div class="form-field">
          <label class="field-label">Main Title</label>
          <input type="text" class="form-input" name="title" value="${settings.title}" placeholder="Welcome to My Courses" required />
        </div>
        
        <div class="form-field">
          <label class="field-label">Subtitle</label>
          <input type="text" class="form-input" name="subtitle" value="${settings.subtitle}" placeholder="Learn from expert instructor" />
        </div>
        
        <div class="form-field">
          <label class="field-label">Description</label>
          <textarea class="form-textarea" name="description" rows="3" placeholder="Describe what students will learn">${settings.description}</textarea>
        </div>
      </div>

      <!-- Design & Colors -->
      <div class="course-section">
        <h3 class="course-section-title">🎨 Design & Colors</h3>
        
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">Primary Color</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="color" name="primaryColor" value="${settings.primaryColor}" style="width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;" />
              <input type="text" class="form-input" value="${settings.primaryColor}" readonly style="flex: 1;" />
            </div>
          </div>
          
          <div class="form-field">
            <label class="field-label">Background Color</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="color" name="backgroundColor" value="${settings.backgroundColor}" style="width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;" />
              <input type="text" class="form-input" value="${settings.backgroundColor}" readonly style="flex: 1;" />
            </div>
          </div>
        </div>
        
        <div class="form-field">
          <label class="field-label">Text Color</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="color" name="textColor" value="${settings.textColor}" style="width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;" />
            <input type="text" class="form-input" value="${settings.textColor}" readonly style="flex: 1;" />
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="course-section">
        <h3 class="course-section-title">👨‍🏫 About Section</h3>
        
        <div class="form-field">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <label class="toggle-switch">
              <input type="checkbox" name="showAbout" ${settings.showAbout ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
            <label class="field-label" style="margin: 0;">Show About Section</label>
          </div>
        </div>
        
        <div class="form-field">
          <label class="field-label">About Text</label>
          <textarea class="form-textarea" name="aboutText" rows="4" placeholder="Tell students about yourself, your experience, and teaching style">${settings.aboutText}</textarea>
        </div>
      </div>

      <!-- Social Links -->
      <div class="course-section">
        <h3 class="course-section-title">📱 Social Links</h3>
        
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">Telegram</label>
            <input type="text" class="form-input" name="telegram" value="${settings.socialLinks?.telegram || ''}" placeholder="@username" />
          </div>
          
          <div class="form-field">
            <label class="field-label">Instagram</label>
            <input type="text" class="form-input" name="instagram" value="${settings.socialLinks?.instagram || ''}" placeholder="@username" />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">YouTube</label>
            <input type="text" class="form-input" name="youtube" value="${settings.socialLinks?.youtube || ''}" placeholder="Channel URL" />
          </div>
          
          <div class="form-field">
            <label class="field-label">LinkedIn</label>
            <input type="text" class="form-input" name="linkedin" value="${settings.socialLinks?.linkedin || ''}" placeholder="Profile URL" />
          </div>
        </div>
      </div>

      <!-- Display Options -->
      <div class="course-section">
        <h3 class="course-section-title">⚙️ Display Options</h3>
        
        <div class="form-field">
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="toggle-switch">
              <input type="checkbox" name="showCourses" ${settings.showCourses ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
            <label class="field-label" style="margin: 0;">Show Courses Section</label>
          </div>
          <small class="field-note">Display your active courses on the landing page</small>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions course-actions">
        <button type="button" class="btn-cancel" onclick="backToDashboard()">Cancel</button>
        <button type="submit" class="btn-save">Save Landing Page</button>
      </div>
      
    </form>
  `;
}

// Save Landing Settings
window.saveLandingSettings = async function(event) {
  event.preventDefault();
  
  const user = store.getState().user;
  const form = event.target;
  const formData = new FormData(form);
  
  // Show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;
  
  try {
    const landingData = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      heroTitle: formData.get('heroTitle'),
      primaryColor: formData.get('primaryColor'),
      backgroundColor: formData.get('backgroundColor'),
      textColor: formData.get('textColor'),
      showAbout: formData.has('showAbout'),
      aboutText: formData.get('aboutText'),
      showCourses: formData.has('showCourses'),
      socialLinks: {
        telegram: formData.get('telegram'),
        instagram: formData.get('instagram'),
        youtube: formData.get('youtube'),
        linkedin: formData.get('linkedin')
      }
    };
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/landing/${user._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(landingData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSuccessToast('Landing page settings saved successfully!');
    } else {
      throw new Error(result.message || 'Failed to save settings');
    }
    
  } catch (error) {
    console.error('Error saving landing settings:', error);
    showErrorToast(error.message || 'Failed to save landing page settings');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
};

// Copy Landing URL
window.copyLandingURL = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    showSuccessToast('Landing page URL copied to clipboard!');
  }).catch(() => {
    showErrorToast('Failed to copy URL');
  });
};

// ==================== NOTIFICATION SYSTEM ====================

// Open Notifications Page
window.openNotifications = async function() {
  try {
    const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
    const userId = landingUser._id;
    
    if (!userId) {
      showMessage('Please log in to view notifications', 'error');
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to load notifications');
    }

    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;

    const notificationsHTML = notifications.length === 0 ? `
      <div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.3;">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <div style="font-size: 16px; margin-bottom: 8px;">No notifications yet</div>
        <div style="font-size: 13px; opacity: 0.7;">You'll see notifications here when you have updates</div>
      </div>
    ` : notifications.map(notif => {
      const date = new Date(notif.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const icon = notif.type === 'assignment_graded' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
      
      return `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="handleNotificationClick('${notif._id}', '${notif.link || ''}')">
          <div class="notification-icon">${icon}</div>
          <div class="notification-content">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${date}</div>
          </div>
          ${!notif.read ? '<div class="notification-badge"></div>' : ''}
        </div>
      `;
    }).join('');

    const modalContent = `
      <div style="max-height: 500px; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px;">
          <div style="font-size: 14px; color: rgba(255,255,255,0.7);">
            ${unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </div>
          ${notifications.length > 0 ? `
            <button onclick="markAllNotificationsRead('${userId}')" style="background: none; border: none; color: var(--primary-color); font-size: 13px; cursor: pointer; padding: 4px 8px;">
              Mark all as read
            </button>
          ` : ''}
        </div>
        ${notificationsHTML}
      </div>
      <style>
        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
          background: var(--bg-tertiary);
        }
        .notification-item:hover {
          background: rgba(var(--primary-color-rgb), 0.1);
        }
        .notification-item.unread {
          background: rgba(var(--primary-color-rgb), 0.05);
          border-left: 3px solid var(--primary-color);
        }
        .notification-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
        .notification-content {
          flex: 1;
        }
        .notification-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .notification-message {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .notification-time {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .notification-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
        }
      </style>
    `;

    showModal('Notifications', modalContent);
    
    // Update badge count
    updateNotificationBadge(unreadCount);

  } catch (error) {
    console.error('Error loading notifications:', error);
    showMessage('Failed to load notifications', 'error');
  }
};

// Handle notification click
window.handleNotificationClick = async function(notificationId, link) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    // Mark as read
    await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });

    // Close modal
    closeModal();

    // Navigate to link if exists
    if (link && link !== 'undefined') {
      // Refresh current page or navigate
      window.location.reload();
    }

  } catch (error) {
    console.error('Error handling notification:', error);
  }
};

// Mark all notifications as read
window.markAllNotificationsRead = async function(userId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    
    await fetch(`${apiBaseUrl}/notifications/user/${userId}/read-all`, {
      method: 'PATCH'
    });

    showMessage('All notifications marked as read', 'success');
    
    // Reload notifications
    openNotifications();

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    showMessage('Failed to mark notifications as read', 'error');
  }
};

// Update notification badge
window.updateNotificationBadge = function(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
};

// Load notification count on page load
window.loadNotificationCount = async function() {
  try {
    const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
    const userId = landingUser._id;
    
    if (!userId) return;

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}?unreadOnly=true`);
    const data = await response.json();

    if (data.success) {
      updateNotificationBadge(data.unreadCount || 0);
    }

  } catch (error) {
    console.error('Error loading notification count:', error);
  }
};

// Auto-refresh notifications every 30 seconds
setInterval(() => {
  if (sessionStorage.getItem('landingUser')) {
    loadNotificationCount();
  }
}, 30000);

// Load notification count on page load
setTimeout(() => {
  loadNotificationCount();
}, 1000);


// Override openNotifications to load page instead of modal
const originalOpenNotifications = window.openNotifications;
window.openNotifications = async function() {
  try {
    const { loadNotificationsPage } = await import('../student/notifications.js');
    loadNotificationsPage();
  } catch (error) {
    console.error('Error loading notifications page:', error);
    // Fallback to original modal
    if (originalOpenNotifications) {
      originalOpenNotifications();
    }
  }
};
