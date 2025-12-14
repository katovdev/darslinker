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

      /* Canvas-based confetti - no CSS animations needed */

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
    
    console.log('🔄 Redirecting back to dashboard...', { teacherId, landingUser: !!landingUser });
    
    // Import router and navigate
    import('../../utils/router.js').then(({ router }) => {
      if (teacherId && landingUser) {
        // Redirect to landing student dashboard
        console.log('📍 Navigating to teacher landing dashboard:', `/teacher/${teacherId}/student-dashboard`);
        router.navigate(`/teacher/${teacherId}/student-dashboard`);
      } else {
        // Fallback to main student dashboard
        console.log('📍 Navigating to main student dashboard');
        router.navigate('/student-dashboard');
      }
    }).catch(error => {
      console.error('Error importing router:', error);
      // Fallback to window.location
      if (teacherId && landingUser) {
        window.location.href = `/teacher/${teacherId}/student-dashboard`;
      } else {
        window.location.href = '/student-dashboard';
      }
    });
  };
}

function getTotalLessons(course) {
  if (!course.modules) return 0;
  return course.modules.reduce((total, module) => {
    return total + (module.lessons?.length || 0);
  }, 0);
}

function createConfetti() {
  const confettiContainer = document.getElementById('confetti-container');
  
  if (!confettiContainer) {
    setTimeout(createConfetti, 100);
    return;
  }

  // Create canvas for confetti
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.display = 'block';
  
  confettiContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const confetti = [];
  const confettiCount = 40; // Kamroq miqdor
  const colors = ['#7EA2D4', '#5A5A5A', '#FFFFFF']; // Sizning ranglaringiz
  
  class Confetto {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.w = Math.random() * 10 + 5;
      this.h = Math.random() * 6 + 3;
      this.speed = Math.random() * 3 + 2;
      this.angle = Math.random() * 360;
      this.rotation = Math.random() * 10 - 5;
      this.opacity = Math.random() * 0.5 + 0.5;
      this.maxOpacity = this.opacity; // Boshlang'ich opacity ni saqlash
      this.swing = Math.random() * 2 - 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.fadeStartTime = null; // Fade boshlanish vaqti
    }
    
    update(currentTime, fadeStarted) {
      this.y += this.speed;
      this.angle += this.rotation;
      this.x += this.swing;
      
      // Agar fade boshlangan bo'lsa, sekin yo'qotish
      if (fadeStarted) {
        if (!this.fadeStartTime) {
          this.fadeStartTime = currentTime;
        }
        // 2 sekund davomida sekin yo'qotish
        const fadeProgress = (currentTime - this.fadeStartTime) / 2000;
        this.opacity = this.maxOpacity * Math.max(0, 1 - fadeProgress);
      }
      
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }
    
    draw() {
      if (this.opacity <= 0) return; // Agar ko'rinmas bo'lsa, chizmaslik
      
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * Math.PI / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }
  
  // Initialize confetti
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new Confetto());
  }
  
  let animationId;
  let startTime = Date.now();
  
  function animate() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2 sekunddan keyin fade boshlanadi, 4 sekundda tugaydi
    const fadeStarted = elapsed > 2000;
    
    confetti.forEach(c => {
      c.update(currentTime, fadeStarted);
      c.draw();
    });
    
    // 6 sekund davomida ko'rsatish (2 sekund normal + 2 sekund fade + 2 sekund buffer)
    if (elapsed < 6000) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Animatsiyani to'xtatish va canvasni olib tashlash
      cancelAnimationFrame(animationId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
  
  animate();
  
  // Handle window resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup after 6 seconds
  setTimeout(() => {
    window.removeEventListener('resize', handleResize);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }, 6000);
}