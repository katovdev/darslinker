// Import i18n functions
import { t, getCurrentLanguage, setLanguage, initI18n } from '../../utils/i18n.js';

// Course start page - Simple page with course info and start button
export async function initCourseStartPage(courseId) {
  // Initialize i18n
  await initI18n();
  console.log('📚 Loading course start page for:', courseId);
  
  // Fetch course data
  const courseData = await fetchCourseData(courseId);
  
  if (!courseData) {
    showErrorPage();
    return;
  }
  
  await renderCourseStartPage(courseData);
}

// Fetch course data from API
async function fetchCourseData(courseId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success && result.course) {
      console.log('✅ Course data loaded:', result.course);
      return result.course;
    } else {
      console.error('❌ Failed to load course');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    return null;
  }
}

// Render course start page
async function renderCourseStartPage(course) {
  const teacherName = course.teacher 
    ? `${course.teacher.firstName || ''} ${course.teacher.lastName || ''}`.trim() || 'Instructor'
    : 'Instructor';

  // Load teacher landing settings for theme
  let primaryColor = '#7ea2d4';
  if (course.teacher && course.teacher._id) {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiBaseUrl}/landing/public/${course.teacher._id}`);
      const result = await response.json();
      if (result.success && result.landing) {
        primaryColor = result.landing.primaryColor || '#7ea2d4';
      }
    } catch (error) {
      console.error('Error loading teacher theme:', error);
    }
  }

  document.body.innerHTML = `
    <style>
      :root {
        --primary-color: ${primaryColor};
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #232323;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .course-start-container {
        max-width: 600px;
        width: 100%;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .course-start-header {
        text-align: left;
        margin-bottom: 12px;
      }

      .course-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #9CA3AF;
        margin-bottom: 32px;
      }

      .course-nav-item {
        color: #9CA3AF;
        text-decoration: none;
      }

      .course-title {
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 12px;
      }

      .course-instructor {
        font-size: 16px;
        color: #9CA3AF;
        margin-bottom: 32px;
      }

      .course-actions {
        display: flex;
        gap: 16px;
      }

      .btn {
        flex: 1;
        padding: 14px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        text-align: center;
      }

      .btn-cancel {
        background: rgba(58, 56, 56, 0.5);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        color: #9CA3AF;
      }

      .btn-cancel:hover {
        background: rgba(58, 56, 56, 0.7);
        border-color: var(--primary-color);
        color: #ffffff;
      }

      .btn-start {
        background: var(--primary-color);
        color: #ffffff;
      }

      .btn-start:hover {
        background: color-mix(in srgb, var(--primary-color) 80%, #000);
      }
    </style>

    <div class="course-start-container">
      <div class="course-start-header">
        <div class="course-nav">
          <span class="course-nav-item">${t('courseStart.courseName')}</span>
          <span class="course-nav-item" style="color: var(--primary-color); font-weight: 600;">${t('courseStart.free')}</span>
        </div>
      </div>

      <h1 class="course-title">${course.title || 'Untitled Course'}</h1>
      <p class="course-instructor">${teacherName}</p>

      <div class="course-actions">
        <button class="btn btn-cancel" onclick="goBack()">${t('courseStart.cancel')}</button>
        <button class="btn btn-start" onclick="startCourse()">${t('courseStart.startLesson')}</button>
      </div>
    </div>
  `;

  // Attach event handlers
  window.goBack = function() {
    window.history.back();
  };

  window.startCourse = async function() {
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
      console.error('No student ID found');
      window.location.href = `/course-learning/${course._id}`;
      return;
    }

    // Enroll student in course
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const enrollUrl = `${apiBaseUrl}/students/${studentId}/enroll/${course._id}`;
      console.log('🔄 Enrolling student:', enrollUrl);
      
      const response = await fetch(enrollUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('📥 Enrollment response:', result);
      
      if (result.success) {
        console.log('✅ Enrolled in course! Total students:', result.totalStudents);
        // Navigate to course learning page
        window.location.href = `/course-learning/${course._id}`;
      } else {
        console.error('❌ Failed to enroll:', result);
        // Still navigate even if enrollment fails
        window.location.href = `/course-learning/${course._id}`;
      }
    } catch (error) {
      console.error('❌ Error enrolling:', error);
      // Still navigate even if enrollment fails
      window.location.href = `/course-learning/${course._id}`;
    }
  };
}

function showErrorPage() {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <h1 style="color: #ef4444; margin-bottom: 16px;">${t('courseStart.error')}</h1>
      <p style="color: #666; margin-bottom: 24px;">${t('courseStart.failedToLoad')}</p>
      <button onclick="window.history.back()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">${t('courseStart.goBack')}</button>
    </div>
  `;
}
