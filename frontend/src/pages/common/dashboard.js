import { store } from '../../utils/store.js';
import { apiService } from '../../utils/api.js';
import { router } from '../../utils/router.js';

export function initDashboard() {
  console.log('=== Dashboard initializing ===');

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

  // Get user data from session storage and update store
  const currentUserData = sessionStorage.getItem('currentUser');
  console.log('Raw currentUser from sessionStorage:', currentUserData);

  let userData = null;
  if (currentUserData && currentUserData !== 'undefined' && currentUserData !== 'null') {
    try {
      userData = JSON.parse(currentUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      userData = null;
    }
  }
  console.log('Parsed user data:', userData);

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
  renderTeacherDashboard(userData);

  // Original logic (commented out for testing):
  // if (userData.role === 'teacher') {
  //   console.log('Rendering teacher dashboard');
  //   renderTeacherDashboard(userData);
  // } else {
  //   console.log('Rendering student dashboard');
  //   renderStudentDashboard(userData);
  // }

  console.log('=== Dashboard initialization complete ===');
  console.log('Final HTML check:', document.querySelector('#app').innerHTML.substring(0, 200));
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

function renderTeacherDashboard(user) {
  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header exactly like Figma -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2>Teacher dashboard</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="startNewMeeting()">New meeting</button>
          <button class="figma-btn" onclick="openTelegramBot()">Telegram Bot</button>
          <button class="figma-btn figma-btn-primary" onclick="openCreateCourse()">New Course</button>
        </div>
      </div>

      <!-- Main Layout with Sidebar + Content -->
      <div class="figma-main-layout">
        <!-- Left Sidebar -->
        <div class="figma-sidebar">
          <!-- General Menu (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('general')">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow" id="general-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="general-children">
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event)">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMessagesPage()">Messages</a>
            </div>
          </div>

          <!-- Content Management (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('content')">
              <span class="figma-menu-title">Content Management</span>
              <span class="figma-menu-arrow" id="content-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="content-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openCreateCourse()">Create Course</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMyCourses()">My Courses</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Drafts</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Archived</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openFinancePage()">Finance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this)">Assignments</a>
            </div>
          </div>

          <!-- AI Assistant (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('ai')">
              <span class="figma-menu-title">AI Assistant</span>
              <span class="figma-menu-arrow" id="ai-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="ai-children">
              <a href="#" class="figma-menu-child">AI Assistant</a>
            </div>
          </div>

          <!-- Analytics (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('analytics')">
              <span class="figma-menu-title">Analytics</span>
              <span class="figma-menu-arrow" id="analytics-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="analytics-children">
              <a href="#" class="figma-menu-child">Quiz Analytics</a>
              <a href="#" class="figma-menu-child">Rating Comments</a>
              <a href="#" class="figma-menu-child">Students Analytics</a>
              <a href="#" class="figma-menu-child">Engagement</a>
              <a href="#" class="figma-menu-child">Progress</a>
            </div>
          </div>

          <!-- Rolls (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('rolls')">
              <span class="figma-menu-title">Rolls</span>
              <span class="figma-menu-arrow" id="rolls-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="rolls-children">
              <a href="#" class="figma-menu-child">Sub Admin</a>
            </div>
          </div>

          <!-- Settings (Expandable) -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('settings')">
              <span class="figma-menu-title">Settings</span>
              <span class="figma-menu-arrow" id="settings-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="settings-children">
              <a href="#" class="figma-menu-child">Language</a>
              <a href="#" class="figma-menu-child">Customize UI</a>
            </div>
          </div>

          <!-- Subscription at bottom -->
          <div class="figma-subscription">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">My Subscription</a>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="figma-content-area">
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
              <p class="figma-profile-title">Web Development & UI/UX Design</p>
              <p class="figma-profile-location">Tashkent, Uzbekistan</p>
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
                <span class="figma-rating-text">4.9 (324 reviews)</span>
                <span class="figma-joined">• Joined 2025</span>
              </div>
            </div>
            <div class="figma-profile-buttons">
              <button class="figma-profile-btn" onclick="openEditProfile()">Edit profile</button>
              <button class="figma-profile-btn" onclick="customizeUI()">Customize UI</button>
            </div>
          </div>

          <!-- Stats Cards Grid -->
          <div class="figma-stats-grid">
            <!-- My Statistics Card -->
            <div class="figma-stats-card">
              <h3 class="figma-stats-title">My Statistics</h3>
              <div class="figma-stats-list">
                <div class="figma-stat-row">
                  <span class="figma-stat-label">Active Courses</span>
                  <span class="figma-stat-value">8</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">Total Students</span>
                  <span class="figma-stat-value">1111</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">Total Revenue</span>
                  <span class="figma-stat-value">$12,460</span>
                </div>
                <div class="figma-stat-row">
                  <span class="figma-stat-label">Avg. Rating</span>
                  <span class="figma-stat-value">4.9/5</span>
                </div>
              </div>
            </div>

            <!-- Achievements Card -->
            <div class="figma-stats-card">
              <h3 class="figma-stats-title">Achievements</h3>
              <div class="figma-achievements-list">
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">Top Instructor</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">1000+ Students</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">$10K+ Revenue</span>
                </div>
                <div class="figma-achievement-item">
                  <span class="figma-achievement-check">✓</span>
                  <span class="figma-achievement-text">High Rating</span>
                </div>
              </div>
            </div>

            <!-- Bio & Specialties Card -->
            <div class="figma-stats-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 class="figma-stats-title">Bio & Specialties</h3>
                <button class="edit-bio-btn" onclick="editBio()" style="background: none; border: 1px solid #7ea2d4; color: #7ea2d4; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Edit</button>
              </div>
              <p class="figma-bio-text" id="bioText">8+ years web development experience. Expert in React, UI/UX design, and teaching modern web technologies.</p>
              <div id="bioEditor" style="display: none;">
                <textarea id="bioTextarea" style="width: 100%; background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 8px; padding: 12px; color: #ffffff; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;" rows="4"></textarea>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                  <button onclick="saveBio()" style="background: #7ea2d4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">Save</button>
                  <button onclick="cancelBioEdit()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load dashboard data
  loadTeacherDashboardData();

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
    document.getElementById('courses-count').textContent = '5';
    document.getElementById('students-count').textContent = '24';
    document.getElementById('assignments-count').textContent = '12';
    document.getElementById('completed-lessons').textContent = '18';

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
    document.getElementById('enrolled-courses').textContent = '3';
    document.getElementById('completed-courses').textContent = '1';
    document.getElementById('pending-assignments').textContent = '4';
    document.getElementById('achievements').textContent = '2';

  } catch (error) {
    console.error('Error loading student dashboard data:', error);
  }
}

function loadRecentCourses() {
  const coursesContainer = document.getElementById('recent-courses');

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

  const formData = new FormData(e.target);
  const courseData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    price: parseInt(formData.get('price'))
  };

  try {
    // Call API to create course
    // const result = await apiService.createCourse(courseData);

    alert('Kurs muvaffaqiyatli yaratildi!');
    closeModal('course-modal');
    loadRecentCourses(); // Refresh courses

  } catch (error) {
    console.error('Error creating course:', error);
    alert('Kurs yaratishda xatolik yuz berdi');
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

window.openCreateCourse = function() {
  document.getElementById('course-modal').classList.remove('hidden');
};

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
  const user = store.getState().user;

  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Edit Profile Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2>Edit Profile</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="backToDashboard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
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
              <h3 class="section-title">Personal Information</h3>

              <!-- Profile Picture -->
              <div class="profile-picture-section">
                <label class="field-label">Profile picture</label>
                <div class="profile-picture-upload">
                  <div class="profile-picture-preview">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div class="upload-instructions">
                    <p>Click to upload or drag and drop</p>
                    <small>PNG, JPG up to 5MB</small>
                  </div>
                </div>
              </div>

              <!-- Name Fields -->
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">First Name</label>
                  <input type="text" class="form-input" value="${user.firstName || 'John'}" />
                </div>
                <div class="form-field">
                  <label class="field-label">Last Name</label>
                  <input type="text" class="form-input" value="${user.lastName || 'Smith'}" />
                </div>
              </div>

              <!-- Professional Title -->
              <div class="form-field">
                <label class="field-label">Professional Title / Specialty</label>
                <input type="text" class="form-input" value="Web Development & UI/UX Design" />
              </div>

              <!-- Bio -->
              <div class="form-field">
                <label class="field-label">Bio / About Me</label>
                <textarea class="form-textarea" rows="4">8+ years web development experience. Expert in React, UI/UX design, and teaching modern web technologies. Passionate about helping students achieve their goals!</textarea>
              </div>

              <!-- Location -->
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">City</label>
                  <input type="text" class="form-input" value="Tashkent" />
                </div>
                <div class="form-field">
                  <label class="field-label">Country</label>
                  <input type="text" class="form-input" value="Uzbekistan" />
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="profile-section">
              <h3 class="section-title">Contact information</h3>

              <div class="form-field">
                <label class="field-label">Email Address</label>
                <input type="email" class="form-input" value="${user.email || 'john@example.com'}" />
              </div>

              <div class="form-field">
                <label class="field-label">Phone Number</label>
                <input type="tel" class="form-input" value="+998 99 123 45 67" />
              </div>

              <div class="form-field">
                <label class="field-label">Telegram Username</label>
                <input type="text" class="form-input" value="@john_teacher" />
              </div>
            </div>

            <!-- Payment Information Section -->
            <div class="profile-section">
              <h3 class="section-title">Payment Information</h3>

              <div class="form-field">
                <label class="field-label">Account Holder Name</label>
                <input type="text" class="form-input" value="John Smith" />
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Bank name</label>
                  <input type="text" class="form-input" value="" />
                </div>
                <div class="form-field">
                  <label class="field-label">Card Number</label>
                  <input type="text" class="form-input" value="" />
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" onclick="backToDashboard()">Cancel</button>
              <button type="submit" class="btn-save">Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Add form submission handler
  document.getElementById('editProfileForm').addEventListener('submit', handleProfileSave);
};

window.customizeUI = function() {
  alert('UI customization coming soon...');
};

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
      menuArrow.textContent = '▶';
      menuParent.classList.remove('expanded');
    }
  });

  // If the clicked menu was closed, open it
  if (isCurrentlyOpen) {
    // Keep it closed (it was open, now we closed all, so leave it closed)
    children.classList.add('hidden');
    arrow.textContent = '▶';
    parent.classList.remove('expanded');
  } else {
    // Open the clicked menu
    children.classList.remove('hidden');
    arrow.textContent = '▼';
    parent.classList.add('expanded');
  }
};

// Set active menu child
window.setActiveChild = function(element, event) {
  // Prevent default link behavior first
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

  return false;
};

// Back to dashboard function
window.backToDashboard = function() {
  initDashboard();
};

// Handle profile save
function handleProfileSave(e) {
  e.preventDefault();
  alert('Profile saved successfully!');
  // Here you would normally save the form data to the backend
  backToDashboard();
}

// Open Messages Page
window.openMessagesPage = function() {
  const userData = store.getState().user;

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
          <h2>Messages</h2>
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
            <div class="figma-menu-parent" onclick="toggleMenu('ai')">
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
window.handleImageUpload = function(event) {
  const file = event.target.files[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

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
window.addLesson = function(type, dropdownLink) {
  const moduleItem = dropdownLink.closest('.module-item');
  const lessonsList = moduleItem.querySelector('.lessons-list');
  const addDropdown = lessonsList.querySelector('.add-lesson-dropdown');

  // Hide dropdown
  dropdownLink.closest('.dropdown-menu').style.display = 'none';

  // Get lesson count for numbering
  const existingLessons = lessonsList.querySelectorAll('.lesson-item').length;
  const lessonNumber = existingLessons + 1;

  let lessonHTML = '';

  switch(type) {
    case 'video':
      lessonHTML = `
        <div class="lesson-form">
          <h5>Add Video Lesson ${lessonNumber}</h5>
          <div class="form-group">
            <label>Lesson Title</label>
            <input type="text" placeholder="Enter lesson title" />
          </div>
          <div class="form-group">
            <label>Video File</label>
            <input type="file" accept="video/*" />
          </div>
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" placeholder="0" />
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
        <div class="lesson-form">
          <h5>Add Quiz ${lessonNumber}</h5>
          <div class="form-group">
            <label>Quiz Title</label>
            <input type="text" placeholder="Enter quiz title" />
          </div>
          <div class="form-group">
            <label>Time Limit (minutes)</label>
            <input type="number" placeholder="30" />
          </div>
          <div class="form-group">
            <label>Number of Questions</label>
            <input type="number" placeholder="10" />
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
        <div class="lesson-form">
          <h5>Add Assignment ${lessonNumber}</h5>
          <div class="form-group">
            <label>Assignment Title</label>
            <input type="text" placeholder="Enter assignment title" />
          </div>
          <div class="form-group">
            <label>Instructions</label>
            <textarea placeholder="Enter assignment instructions" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>Due Date</label>
            <input type="datetime-local" />
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
window.saveLesson = function(button, type) {
  const lessonForm = button.closest('.lesson-form');
  const inputs = lessonForm.querySelectorAll('input, textarea');
  const moduleItem = lessonForm.closest('.module-item');
  const lessonsList = moduleItem.querySelector('.lessons-list');

  // Get form data
  let lessonTitle = '';
  let duration = '';

  // Extract lesson title from first input
  const titleInput = lessonForm.querySelector('input[type="text"]');
  if (titleInput && titleInput.value.trim()) {
    lessonTitle = titleInput.value.trim();
  } else {
    alert('Please enter a lesson title');
    return;
  }

  // Get duration for display
  if (type === 'video') {
    const durationInput = lessonForm.querySelector('input[type="number"]');
    duration = durationInput && durationInput.value ? durationInput.value + ' min' : '0 min';
  } else if (type === 'quiz') {
    const timeInput = lessonForm.querySelector('input[type="number"]');
    duration = timeInput && timeInput.value ? timeInput.value + ' min' : '30 min';
  } else if (type === 'assignment') {
    duration = 'Assignment';
  } else if (type === 'file') {
    duration = 'File';
  }

  // Create lesson item HTML
  const lessonHTML = `
    <div class="lesson-item">
      <span>${lessonTitle}</span>
      <span>${duration}</span>
    </div>
  `;

  // Insert before the lesson form
  lessonForm.insertAdjacentHTML('beforebegin', lessonHTML);

  // Remove the form
  lessonForm.remove();

  // Update module info (lesson count)
  updateModuleInfo(moduleItem);
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
      <div class="module-header" onclick="toggleModule(this)">
        <div class="module-info">
          <h4>Module ${newModuleNumber}: New Module</h4>
          <p>0 lessons • 0 hours</p>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button type="button" class="action-btn" onclick="editModule(this)">Edit</button>
          <button type="button" class="action-btn delete" onclick="deleteModule(this)">Delete</button>
        </div>
      </div>
      <div class="lessons-list" style="display: none;">
        <div class="add-lesson-dropdown">
          <button type="button" class="add-btn dropdown-toggle" onclick="toggleLessonDropdown(this)">+ Add</button>
          <div class="dropdown-menu">
            <a href="#" onclick="addLesson('video', this)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              </svg>
              Video
            </a>
            <a href="#" onclick="addLesson('quiz', this)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
              </svg>
              Quiz
            </a>
            <a href="#" onclick="addLesson('assignment', this)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
              </svg>
              Assignment
            </a>
            <a href="#" onclick="addLesson('file', this)">
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
  `;

  // Insert before the "Add new module" button
  const addButton = modulesContainer.querySelector('.add-module-btn');
  addButton.insertAdjacentHTML('beforebegin', newModuleHTML);
};

// Toggle Module Expand/Collapse
window.toggleModule = function(moduleHeader) {
  const lessonsList = moduleHeader.nextElementSibling;
  const isVisible = lessonsList.style.display !== 'none';

  if (isVisible) {
    lessonsList.style.display = 'none';
    moduleHeader.classList.remove('expanded');
  } else {
    lessonsList.style.display = 'block';
    moduleHeader.classList.add('expanded');
  }
};

// Edit Module
window.editModule = function(button) {
  const moduleHeader = button.closest('.module-header');
  const moduleTitle = moduleHeader.querySelector('h4');
  const currentTitle = moduleTitle.textContent;

  const newTitle = prompt('Enter new module title:', currentTitle);
  if (newTitle && newTitle.trim()) {
    moduleTitle.textContent = newTitle.trim();
  }
};

// Delete Module
window.deleteModule = function(button) {
  if (confirm('Are you sure you want to delete this module?')) {
    const moduleItem = button.closest('.module-item');
    moduleItem.remove();

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
  }
};

// Toggle Lesson Dropdown
window.toggleLessonDropdown = function(button) {
  const dropdown = button.nextElementSibling;
  const isVisible = dropdown.style.display === 'block';

  // Close all other dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu !== dropdown) {
      menu.style.display = 'none';
    }
  });

  dropdown.style.display = isVisible ? 'none' : 'block';

  // Close dropdown when clicking outside
  if (!isVisible) {
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }
};

// Open My Courses Page
window.openMyCourses = function() {
  const userData = store.getState().user;

  // Preserve sidebar menu state
  const generalChildren = document.getElementById('general-children');
  const isGeneralExpanded = generalChildren && !generalChildren.classList.contains('hidden');
  const contentChildren = document.getElementById('content-children');
  const isContentExpanded = contentChildren && !contentChildren.classList.contains('hidden');

  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2>My Courses</h2>
        </div>
        <div class="figma-header-buttons">
           <button class="figma-btn figma-btn-primary" onclick="openCreateCourse()">New Course</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="figma-main-layout">
        <!-- Left Sidebar Menu -->
        <div class="figma-sidebar">
          <!-- General Menu -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isGeneralExpanded ? 'expanded' : ''}" onclick="toggleMenu('general')">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow" id="general-arrow">${isGeneralExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isGeneralExpanded ? '' : 'hidden'}" id="general-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMessagesPage()">Messages</a>
            </div>
          </div>

          <!-- Content Management -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isContentExpanded ? 'expanded' : ''}" onclick="toggleMenu('content')">
              <span class="figma-menu-title">Content Management</span>
              <span class="figma-menu-arrow" id="content-arrow">${isContentExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isContentExpanded ? '' : 'hidden'}" id="content-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openCreateCourse()">Create Course</a>
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event)">My Courses</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Drafts</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Archived</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Finance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Assignments</a>
            </div>
          </div>
          
          <!-- Other menus omitted for brevity but should be here in a real app -->
        </div>

        <!-- My Courses Content -->
        <div class="figma-content-area my-courses-page">
          <div class="my-courses-header">
            <div class="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input type="text" placeholder="Search for a course..." onkeyup="filterCourses(event)">
            </div>
            <div class="filters">
              <select class="filter-select" onchange="filterCourses()">
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
              <select class="filter-select" onchange="filterCourses()">
                <option value="">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <select class="filter-select" onchange="sortCourses(event)">
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="title">Sort by: Title</option>
              </select>
            </div>
          </div>
          <div class="courses-grid" id="coursesGrid">
            <!-- Course cards will be injected here -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load mock data into the grid
  renderCourseCards();
};

// Mock data for courses
const mockCourses = [
  { id: 1, title: 'Complete React Developer Course 2025', category: 'Web Development', lessons: 84, hours: 12.5, students: 1234, price: 49.99, status: 'Published', image: 'https://via.placeholder.com/300x170?text=React' },
  { id: 2, title: 'Advanced UI/UX Design Principles', category: 'UI/UX Design', lessons: 45, hours: 8.0, students: 567, price: 79.99, status: 'Published', image: 'https://via.placeholder.com/300x170?text=UI/UX' },
  { id: 3, title: 'Introduction to Machine Learning', category: 'Machine Learning', lessons: 120, hours: 25.0, students: 890, price: 99.99, status: 'Draft', image: 'https://via.placeholder.com/300x170?text=ML' },
  { id: 4, title: 'Node.js for Beginners', category: 'Web Development', lessons: 60, hours: 9.5, students: 234, price: 29.99, status: 'Published', image: 'https://via.placeholder.com/300x170?text=Node.js' },
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
  const userData = store.getState().user;

  // Preserve sidebar menu state
  const generalChildren = document.getElementById('general-children');
  const isGeneralExpanded = generalChildren && !generalChildren.classList.contains('hidden');
  const contentChildren = document.getElementById('content-children');
  const isContentExpanded = contentChildren && !contentChildren.classList.contains('hidden');

  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2>Finance</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="downloadReport('pdf')">Download PDF</button>
          <button class="figma-btn figma-btn-primary" onclick="requestPayout()">Request Payout</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="figma-main-layout">
        <!-- Left Sidebar Menu -->
        <div class="figma-sidebar">
          <!-- General Menu -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isGeneralExpanded ? 'expanded' : ''}" onclick="toggleMenu('general')">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow" id="general-arrow">${isGeneralExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isGeneralExpanded ? '' : 'hidden'}" id="general-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMessagesPage()">Messages</a>
            </div>
          </div>

          <!-- Content Management -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isContentExpanded ? 'expanded' : ''}" onclick="toggleMenu('content')">
              <span class="figma-menu-title">Content Management</span>
              <span class="figma-menu-arrow" id="content-arrow">${isContentExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isContentExpanded ? '' : 'hidden'}" id="content-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openCreateCourse()">Create Course</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMyCourses()">My Courses</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Drafts</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Archived</a>
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event)">Finance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Assignments</a>
            </div>
          </div>
          <!-- Other menus would go here -->
        </div>

        <!-- Finance Content -->
        <div class="figma-content-area finance-page">
          <!-- Finance Stats Cards -->
          <div class="finance-stats-grid">
            <div class="finance-card">
              <h3 class="finance-card-title">Available for Payout</h3>
              <p class="finance-card-amount">$8,250.00</p>
              <p class="finance-card-note">Next payout on Nov 15, 2025</p>
            </div>
            <div class="finance-card">
              <h3 class="finance-card-title">Total Revenue</h3>
              <p class="finance-card-amount">$12,460.00</p>
              <p class="finance-card-note">All time earnings</p>
            </div>
            <div class="finance-card">
              <h3 class="finance-card-title">Pending</h3>
              <p class="finance-card-amount">$1,230.50</p>
              <p class="finance-card-note">Waiting for clearance</p>
            </div>
          </div>

          <!-- Transactions History -->
          <div class="transactions-section">
            <div class="transactions-header">
              <h3 class="transactions-title">Transactions History</h3>
              <div class="transactions-filters">
                <input type="text" class="transaction-search" placeholder="Search transactions..." onkeyup="filterTransactions(event)">
                <input type="date" class="transaction-date-filter" onchange="filterTransactions()">
                <button class="figma-btn" onclick="downloadReport('csv')">Export CSV</button>
              </div>
            </div>
            <div class="transactions-table-container">
              <table class="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Course</th>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="transactionsBody">
                  <!-- Transaction rows will be injected here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderTransactions();
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
  const searchInput = document.querySelector('.transaction-search').value.toLowerCase();
  const dateInput = document.querySelector('.transaction-date-filter').value;

  let filtered = mockTransactions.filter(t => {
    const matchesSearch = t.course.toLowerCase().includes(searchInput) || t.student.toLowerCase().includes(searchInput);
    const matchesDate = !dateInput || t.date === dateInput;
    return matchesSearch && matchesDate;
  });

  renderTransactions(filtered);
};

window.downloadReport = (format) => alert(`Downloading ${format.toUpperCase()} report...`);
window.requestPayout = () => alert('Payout request functionality coming soon...');

// Open Create Course Page
window.openCreateCourse = function() {
  const userData = store.getState().user;

  // Check current general menu state before navigating
  const generalChildren = document.getElementById('general-children');
  const isGeneralExpanded = generalChildren && !generalChildren.classList.contains('hidden');

  // Check content management menu state
  const contentChildren = document.getElementById('content-children');
  const isContentExpanded = contentChildren && !contentChildren.classList.contains('hidden');

  document.querySelector('#app').innerHTML = `
    <div class="figma-dashboard">
      <!-- Top Header -->
      <div class="figma-header">
        <div class="figma-logo">
          <h1>dars<span>linker</span></h1>
        </div>
        <div class="figma-title">
          <h2>Create course</h2>
        </div>
        <div class="figma-header-buttons">
          <button class="figma-btn" onclick="backToDashboard()">← Back</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="figma-main-layout">
        <!-- Left Sidebar Menu -->
        <div class="figma-sidebar">
          <!-- General Menu -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isGeneralExpanded ? 'expanded' : ''}" onclick="toggleMenu('general')">
              <span class="figma-menu-title">General</span>
              <span class="figma-menu-arrow" id="general-arrow">${isGeneralExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isGeneralExpanded ? '' : 'hidden'}" id="general-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); backToDashboard()">Dashboard</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openEditProfile()">Profile</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event); openMessagesPage()">Messages</a>
            </div>
          </div>

          <!-- Content Management -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent ${isContentExpanded ? 'expanded' : ''}" onclick="toggleMenu('content')">
              <span class="figma-menu-title">Content Management</span>
              <span class="figma-menu-arrow" id="content-arrow">${isContentExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="figma-menu-children ${isContentExpanded ? '' : 'hidden'}" id="content-children">
              <a href="#" class="figma-menu-child active" onclick="setActiveChild(this, event)">Create Course</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">My Courses</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Drafts</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Archived</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Finance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Assignments</a>
            </div>
          </div>

          <!-- AI Assistant -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('ai')">
              <span class="figma-menu-title">AI Assistant</span>
              <span class="figma-menu-arrow" id="ai-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="ai-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Chat Assistant</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Content Generator</a>
            </div>
          </div>

          <!-- Analytics -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('analytics')">
              <span class="figma-menu-title">Analytics</span>
              <span class="figma-menu-arrow" id="analytics-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="analytics-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Student Progress</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Course Analytics</a>
            </div>
          </div>

          <!-- Rolls -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('rolls')">
              <span class="figma-menu-title">Rolls</span>
              <span class="figma-menu-arrow" id="rolls-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="rolls-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Attendance</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Grade Book</a>
            </div>
          </div>

          <!-- Settings -->
          <div class="figma-menu-section">
            <div class="figma-menu-parent" onclick="toggleMenu('settings')">
              <span class="figma-menu-title">Settings</span>
              <span class="figma-menu-arrow" id="settings-arrow">▶</span>
            </div>
            <div class="figma-menu-children hidden" id="settings-children">
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Account Settings</a>
              <a href="#" class="figma-menu-child" onclick="setActiveChild(this, event)">Preferences</a>
            </div>
          </div>

          <!-- Subscription -->
          <div class="figma-subscription">
            <div class="figma-menu-single">
              <a href="#" class="figma-single-link">My Subscription</a>
            </div>
          </div>
        </div>

        <!-- Create Course Content -->
        <div class="figma-content-area">
          <form class="create-course-form" id="createCourseForm">

            <!-- Basic Information Section -->
            <div class="course-section">
              <h3 class="course-section-title">Basic information</h3>

              <div class="form-field">
                <label class="field-label">Course Title *</label>
                <input type="text" class="form-input" placeholder="e.g. Complete React developer course 2025" required />
              </div>

              <div class="form-field">
                <label class="field-label">Short description *</label>
                <textarea class="form-textarea" rows="2" placeholder="Write a brief description of your course(2-3 sentences)" required></textarea>
              </div>

              <div class="form-field">
                <label class="field-label">Full description *</label>
                <textarea class="form-textarea" rows="4" placeholder="Detailed course description, what students will learn, prerequisites, etc" required></textarea>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Category *</label>
                  <input type="text" class="form-input" placeholder="Machine learning" required />
                </div>
                <div class="form-field">
                  <label class="field-label">Level *</label>
                  <input type="text" class="form-input" placeholder="e.g. Intermediate" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Language *</label>
                  <input type="text" class="form-input" placeholder="e.g. English" required />
                </div>
                <div class="form-field">
                  <label class="field-label">Duration (hours) *</label>
                  <input type="text" class="form-input" placeholder="e.g. 15 hours" required />
                </div>
              </div>
            </div>

            <!-- Course Image Section -->
            <div class="course-section">
              <h3 class="course-section-title">Course Image</h3>

              <div class="form-field">
                <label class="field-label">Course Thumbnail *</label>
                <div class="upload-area" id="uploadArea" onclick="triggerFileUpload()">
                  <input type="file" id="thumbnailInput" accept="image/*" style="display: none;" onchange="handleImageUpload(event)" />
                  <div class="upload-content" id="uploadContent">
                    <div class="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="upload-text">
                      <p>Click to upload course thumbnail</p>
                      <small>Recommended: 1280x720px, PNG or JPG, max 5MB</small>
                    </div>
                  </div>
                  <div class="image-preview hidden" id="imagePreview">
                    <img id="previewImg" src="" alt="Course thumbnail" />
                    <div class="image-overlay">
                      <button type="button" class="image-action-btn" onclick="changeImage(event)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Change
                      </button>
                      <button type="button" class="image-action-btn delete" onclick="deleteImage(event)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Preview Video URL (optional)</label>
                <input type="url" class="form-input" placeholder="https://youtube.com/watch?=..." />
                <small class="field-note">Add a preview video to attract more students</small>
              </div>
            </div>

            <!-- Pricing & Access Section -->
            <div class="course-section">
              <h3 class="course-section-title">Pricing & Access</h3>

              <div class="form-field">
                <label class="field-label">Course type *</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="paid" checked />
                    <span class="radio-custom"></span>
                    <span>Paid</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="courseType" value="free" />
                    <span class="radio-custom"></span>
                    <span>Free</span>
                  </label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Course Price (USD) *</label>
                  <input type="number" class="form-input" placeholder="49.99" step="0.01" />
                </div>
                <div class="form-field">
                  <label class="field-label">Discount Price (optional)</label>
                  <input type="number" class="form-input" placeholder="29.99" step="0.01" />
                  <small class="field-note">Leave empty if no discount</small>
                </div>
              </div>
            </div>

            <!-- Course Structure Section -->
            <div class="course-section">
              <h3 class="course-section-title">Course Structure (Modules & Lessons)</h3>

              <div class="info-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Tip: Organize your course into modules (sections) and lessons. You can add videos, files, and quizzes later.</span>
              </div>

              <div class="modules-container" id="modulesContainer">
                <!-- Module 1 -->
                <div class="module-item">
                  <div class="module-header" onclick="toggleModule(this)">
                    <div class="module-info">
                      <h4>Module 1: Introduction to React</h4>
                      <p>5 lessons • 2 hours</p>
                    </div>
                    <div class="module-actions" onclick="event.stopPropagation()">
                      <button type="button" class="action-btn" onclick="editModule(this)">Edit</button>
                      <button type="button" class="action-btn delete" onclick="deleteModule(this)">Delete</button>
                    </div>
                  </div>
                  <div class="lessons-list" style="display: none;">
                    <div class="lesson-item">
                      <span>Lesson 1: What is React?</span>
                      <span>15 min</span>
                    </div>
                    <div class="lesson-item">
                      <span>Lesson 2: Setting Up React</span>
                      <span>45 min</span>
                    </div>
                    <div class="add-lesson-dropdown">
                      <button type="button" class="add-btn dropdown-toggle" onclick="toggleLessonDropdown(this)">+ Add</button>
                      <div class="dropdown-menu">
                        <a href="#" onclick="addLesson('video', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Video
                        </a>
                        <a href="#" onclick="addLesson('quiz', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Quiz
                        </a>
                        <a href="#" onclick="addLesson('assignment', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Assignment
                        </a>
                        <a href="#" onclick="addLesson('file', this)">
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

                <!-- Module 2 -->
                <div class="module-item">
                  <div class="module-header" onclick="toggleModule(this)">
                    <div class="module-info">
                      <h4>Module 2: Advanced React Concepts</h4>
                      <p>0 lessons • 0 hours</p>
                    </div>
                    <div class="module-actions" onclick="event.stopPropagation()">
                      <button type="button" class="action-btn" onclick="editModule(this)">Edit</button>
                      <button type="button" class="action-btn delete" onclick="deleteModule(this)">Delete</button>
                    </div>
                  </div>
                  <div class="lessons-list" style="display: none;">
                    <div class="add-lesson-dropdown">
                      <button type="button" class="add-btn dropdown-toggle" onclick="toggleLessonDropdown(this)">+ Add</button>
                      <div class="dropdown-menu">
                        <a href="#" onclick="addLesson('video', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Video
                        </a>
                        <a href="#" onclick="addLesson('quiz', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Quiz
                        </a>
                        <a href="#" onclick="addLesson('assignment', this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Assignment
                        </a>
                        <a href="#" onclick="addLesson('file', this)">
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

                <button type="button" class="add-module-btn" onclick="addNewModule()">Add new module</button>
              </div>
            </div>

            <!-- Additional Settings Section -->
            <div class="course-section">
              <h3 class="course-section-title">Additional Settings</h3>

              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Enable Q&A for students</h4>
                    <p>Students can ask questions under lessons</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" checked />
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Enable AI auto-responses</h4>
                    <p>AI will automatically answer common student questions</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Issue certificate upon completion</h4>
                    <p>Students receive a certificate when they finish the course</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" checked />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions course-actions">
              <button type="button" class="btn-cancel" onclick="backToDashboard()">Save as draft</button>
              <button type="submit" class="btn-save">Publish course</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `;
};