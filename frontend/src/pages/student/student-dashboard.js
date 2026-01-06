import { store } from '../../utils/store.js';
import { router } from '../../utils/router.js';
import { t, getCurrentLanguage, initI18n } from '../../utils/i18n.js';

export function initStudentDashboard() {
  console.log('=== Student Dashboard initializing ===');

  // Initialize i18n for translations
  initI18n();

  // Check if user came from landing page registration
  const landingUser = sessionStorage.getItem('landingUser');

  if (landingUser) {
    // Landing user - show coming soon without authentication
    console.log('Landing user detected - showing coming soon page');
    let user = null;
    try {
      user = JSON.parse(landingUser);
    } catch (error) {
      console.error('Error parsing landing user:', error);
    }

    // Update store with landing user (no authentication)
    store.setState({
      user: user || { firstName: 'Guest', lastName: '' },
      isAuthenticated: false
    });
  } else {
    // Regular user - check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.navigate('/login');
      return;
    }

    // Get user data
    let userData = localStorage.getItem('currentUser');
    if (!userData) {
      userData = sessionStorage.getItem('currentUser');
    }

    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.navigate('/login');
        return;
      }
    }

    if (!user) {
      router.navigate('/login');
      return;
    }

    // Update store
    store.setState({
      user: user,
      isAuthenticated: true
    });
  }

  // Render student dashboard
  document.querySelector('#app').innerHTML = `
    <div class="student-dashboard">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #232323;
          color: #ffffff;
          overflow: hidden;
        }

        .student-dashboard {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .logout-btn {
          position: fixed;
          top: 30px;
          right: 30px;
          background: transparent;
          border: 2px solid #7EA2D4;
          color: #7EA2D4;
          padding: 12px 30px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .logout-btn:hover {
          background: #7EA2D4;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(126, 162, 212, 0.4);
        }

        .coming-soon-container {
          text-align: center;
          animation: fadeIn 1s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .coming-soon-title {
          font-size: 48px;
          font-weight: 900;
          background: linear-gradient(135deg, #7EA2D4, #5A85C7, #7EA2D4);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
          letter-spacing: 4px;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .coming-soon-subtitle {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          font-weight: 300;
        }

        .coming-soon-description {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .logout-btn {
          font-size: 14px;
        }

        /* Logout Confirmation Modal */
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .logout-modal-content {
          background: rgba(45, 45, 45, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(126, 162, 212, 0.3);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logout-modal-header {
          margin-bottom: 16px;
        }

        .logout-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .logout-modal-body {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .logout-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .logout-modal-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .logout-modal-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logout-modal-cancel:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .logout-modal-confirm {
          background: linear-gradient(135deg, #7EA2D4, #5A85C7);
          color: #ffffff;
        }

        .logout-modal-confirm:hover {
          background: linear-gradient(135deg, #5A85C7, #4A75B7);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(126, 162, 212, 0.4);
        }

        @media (max-width: 768px) {
          .coming-soon-title {
            font-size: 36px;
            letter-spacing: 3px;
          }

          .coming-soon-subtitle {
            font-size: 18px;
          }

          .coming-soon-description {
            font-size: 14px;
            padding: 0 20px;
          }

          .logout-btn {
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            font-size: 12px;
          }
        }
      </style>

      <button class="logout-btn" id="logoutBtn" onclick="showLogoutConfirmation()">${t('common.back')}</button>

      <div class="coming-soon-container">
        <h1 class="coming-soon-title">COMING SOON</h1>
        <p class="coming-soon-subtitle">Student Dashboard</p>
        <p class="coming-soon-description">
          Kurslar, darslar va boshqa funksiyalar ustida ishlanmoqda. Tez orada sizga taqdim etamiz!
        </p>
      </div>
    </div>
  `;

  // Show logout confirmation modal
  window.showLogoutConfirmation = function () {
    // Get current language for translations
    const currentLang = getCurrentLanguage();

    // Get translations based on current language
    const translations = {
      title: t('logout.confirmTitle'),
      body: t('logout.confirmBody'),
      cancel: t('common.cancel') || 'Cancel',
      confirm: t('header.logout') || 'Logout'
    };

    // Remove existing modal if any
    const existingModal = document.querySelector('.logout-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
      <div class="logout-modal-overlay" onclick="closeLogoutModal(event)">
        <div class="logout-modal-content" onclick="event.stopPropagation()">
          <div class="logout-modal-header">
            <h3 class="logout-modal-title">${translations.title}</h3>
          </div>
          <div class="logout-modal-body">
            <p>${translations.body}</p>
          </div>
          <div class="logout-modal-actions">
            <button class="logout-modal-btn logout-modal-cancel" onclick="closeLogoutModal()">
              ${translations.cancel}
            </button>
            <button class="logout-modal-btn logout-modal-confirm" onclick="confirmLogout()">
              ${translations.confirm}
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  };

  // Close logout modal
  window.closeLogoutModal = function (event) {
    // Only close if clicking overlay, not the modal content
    if (event && event.target && !event.target.classList.contains('logout-modal-overlay')) {
      return;
    }
    const modal = document.querySelector('.logout-modal-overlay');
    if (modal) {
      modal.remove();
    }
  };

  // Confirm logout and redirect
  window.confirmLogout = function () {
    // Close modal
    closeLogoutModal();

    // Clear auth and go to home
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Update logout button text
  function updateLogoutButtonText() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.textContent = t('common.back');
    }
  }

  // Initial button text update
  updateLogoutButtonText();

  // Listen for language changes to update modal and button text
  window.addEventListener('languageChanged', function () {
    // Update button text
    updateLogoutButtonText();

    // Update modal if it's open
    const modal = document.querySelector('.logout-modal-overlay');
    if (modal) {
      // Re-show modal with updated translations
      closeLogoutModal();
      setTimeout(() => {
        showLogoutConfirmation();
      }, 100);
    }
  });
}
