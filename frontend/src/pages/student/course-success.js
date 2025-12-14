// Course completion success page
import { t } from '../../utils/i18n.js';

export function showCourseCompletionSuccess(course) {
  const appElement = document.querySelector('#app');
  if (!appElement) return;

  // Create confetti animation
  createConfetti();

  appElement.innerHTML = `
    <div class="success-page" style="
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    ">
      <!-- Confetti Container -->
      <div id="confetti-container" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      "></div>

      <!-- Success Content -->
      <div class="success-content" style="
        background: rgba(42, 42, 42, 0.95);
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 20px;
        padding: 60px 40px;
        text-align: center;
        max-width: 600px;
        width: 100%;
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        z-index: 10;
      ">
        <!-- Success Icon -->
        <div style="
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, var(--primary-color), #5a9bd4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          animation: successPulse 2s ease-in-out infinite;
        ">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>

        <!-- Congratulations Text -->
        <h1 style="
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 20px;
          animation: fadeInUp 1s ease-out 0.5s both;
        ">
          ${t('success.congratulations')}
        </h1>

        <!-- Course Completion Message -->
        <p style="
          color: #e5e7eb;
          font-size: 20px;
          line-height: 1.6;
          margin-bottom: 40px;
          animation: fadeInUp 1s ease-out 0.7s both;
        ">
          ${t('success.courseCompleted').replace('{course}', `<strong style="color: var(--primary-color);">${course.title}</strong>`)}
        </p>

        <!-- Stats -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
          animation: fadeInUp 1s ease-out 0.9s both;
        ">
          <div style="
            background: rgba(126, 162, 212, 0.1);
            border: 1px solid rgba(126, 162, 212, 0.2);
            border-radius: 12px;
            padding: 20px;
          ">
            <div style="color: var(--primary-color); font-size: 24px; font-weight: 600;">
              ${course.modules?.length || 0}
            </div>
            <div style="color: #9ca3af; font-size: 14px; margin-top: 4px;">
              Modules Completed
            </div>
          </div>
          <div style="
            background: rgba(126, 162, 212, 0.1);
            border: 1px solid rgba(126, 162, 212, 0.2);
            border-radius: 12px;
            padding: 20px;
          ">
            <div style="color: var(--primary-color); font-size: 24px; font-weight: 600;">
              ${getTotalLessons(course)}
            </div>
            <div style="color: #9ca3af; font-size: 14px; margin-top: 4px;">
              Lessons Completed
            </div>
          </div>
          <div style="
            background: rgba(126, 162, 212, 0.1);
            border: 1px solid rgba(126, 162, 212, 0.2);
            border-radius: 12px;
            padding: 20px;
          ">
            <div style="color: var(--primary-color); font-size: 24px; font-weight: 600;">
              100%
            </div>
            <div style="color: #9ca3af; font-size: 14px; margin-top: 4px;">
              Progress
            </div>
          </div>
        </div>

        <!-- Back to Dashboard Button -->
        <button onclick="goBackToDashboard()" style="
          background: linear-gradient(135deg, var(--primary-color), #5a9bd4);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: fadeInUp 1s ease-out 1.1s both;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(126, 162, 212, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          ${t('success.backToDashboard')}
        </button>
      </div>
    </div>

    <style>
      @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes confettiFall {
        0% {
          transform: translateY(-100vh) rotate(0deg) scale(1);
          opacity: 1;
        }
        50% {
          opacity: 1;
          transform: translateY(50vh) rotate(180deg) scale(1.2);
        }
        100% {
          transform: translateY(100vh) rotate(360deg) scale(0.8);
          opacity: 0;
        }
      }

      @keyframes confettiSway {
        0%, 100% {
          transform: translateX(0) rotate(0deg);
        }
        25% {
          transform: translateX(20px) rotate(90deg);
        }
        75% {
          transform: translateX(-20px) rotate(270deg);
        }
      }

      .confetti-piece {
        position: absolute;
        width: 8px;
        height: 8px;
        animation: confettiFall 4s ease-in-out infinite, confettiSway 2s ease-in-out infinite;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
      }

      @media (max-width: 768px) {
        .success-content {
          padding: 40px 20px !important;
          margin: 20px !important;
        }
        
        .success-content h1 {
          font-size: 28px !important;
        }
        
        .success-content p {
          font-size: 18px !important;
        }
      }
    </style>
  `;

  // Add global functions
  window.goBackToDashboard = function() {
    // Get current teacher ID from session
    const teacherId = sessionStorage.getItem('currentTeacherId');
    const landingUser = sessionStorage.getItem('landingUser');
    
    if (teacherId && landingUser) {
      // Redirect to landing student dashboard
      window.location.href = `/teacher/${teacherId}`;
    } else {
      // Fallback to main student dashboard
      window.location.href = '/student-dashboard';
    }
  };
}

function getTotalLessons(course) {
  if (!course.modules) return 0;
  return course.modules.reduce((total, module) => {
    return total + (module.lessons?.length || 0);
  }, 0);
}

function createConfetti() {
  const colors = ['#7ea2d4', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#e74c3c', '#9b59b6', '#f39c12'];
  const shapes = ['circle', 'square', 'triangle'];
  const confettiContainer = document.getElementById('confetti-container');
  
  if (!confettiContainer) {
    setTimeout(createConfetti, 100);
    return;
  }

  // Create more confetti pieces for better effect
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      
      // Random position
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      
      // Random color
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Random shape
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
      } else if (shape === 'triangle') {
        confetti.style.width = '0';
        confetti.style.height = '0';
        confetti.style.backgroundColor = 'transparent';
        confetti.style.borderLeft = '5px solid transparent';
        confetti.style.borderRight = '5px solid transparent';
        confetti.style.borderBottom = `10px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
      }
      
      // Random size
      const size = Math.random() * 8 + 4; // 4-12px
      if (shape !== 'triangle') {
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
      }
      
      // Random animation
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
      
      // Random rotation
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      confettiContainer.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 6000);
    }, i * 50); // Faster creation
  }
  
  // Create second wave of confetti
  setTimeout(() => {
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 1 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.borderRadius = '50%';
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 4000);
      }, i * 30);
    }
  }, 1000);
}