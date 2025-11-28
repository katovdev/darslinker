import { store } from '../../utils/store.js';
import { router } from '../../utils/router.js';

export function initStudentDashboard() {
  console.log('=== Student Dashboard initializing ===');

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
          font-size: 120px;
          font-weight: 900;
          background: linear-gradient(135deg, #7EA2D4, #5A85C7, #7EA2D4);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 30px;
          letter-spacing: 10px;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .coming-soon-subtitle {
          font-size: 28px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          font-weight: 300;
        }

        .coming-soon-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.5);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.8;
        }

        @media (max-width: 768px) {
          .coming-soon-title {
            font-size: 60px;
            letter-spacing: 5px;
          }

          .coming-soon-subtitle {
            font-size: 20px;
          }

          .coming-soon-description {
            font-size: 16px;
            padding: 0 20px;
          }

          .logout-btn {
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      </style>

      <button class="logout-btn" onclick="handleBack()">Orqaga</button>

      <div class="coming-soon-container">
        <h1 class="coming-soon-title">COMING SOON</h1>
        <p class="coming-soon-subtitle">Student Dashboard</p>
        <p class="coming-soon-description">
          Kurslar, darslar va boshqa funksiyalar ustida ishlanmoqda. Tez orada sizga taqdim etamiz!
        </p>
      </div>
    </div>
  `;

  // Setup back handler - go to home page
  window.handleBack = function() {
    // Clear auth and go to home
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };
}
