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
    
    if (teacherId && landingUser) {
      // Redirect to landing student dashboard
      window.location.href = `#/teacher/${teacherId}`;
    } else {
      // Fallback to main student dashboard
      window.location.href = '#/student-dashboard';
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
  
  confettiContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const confetti = [];
  const confettiCount = 120;
  const colors = [
    '#7EA2D4', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FECA57', '#E74C3C', '#9B59B6', '#F39C12',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#FD79A8'
  ];
  
  class Confetto {
    constructor() {
      // Start from top of screen with some randomness
      this.x = Math.random() * canvas.width;
      this.y = -Math.random() * 100 - 20;
      
      // Size variations for more realistic look
      this.w = Math.random() * 16 + 8;
      this.h = Math.random() * 12 + 6;
      
      // Physics properties
      this.vx = (Math.random() - 0.5) * 4; // horizontal velocity
      this.vy = Math.random() * 3 + 2; // vertical velocity
      this.gravity = 0.15;
      this.drag = 0.99;
      this.bounce = 0.7;
      
      // Rotation properties
      this.angle = Math.random() * 360;
      this.angularVelocity = (Math.random() - 0.5) * 15;
      
      // Visual properties
      this.opacity = Math.random() * 0.4 + 0.6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = Math.random();
      
      // Lifecycle
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.005;
    }
    
    update() {
      // Apply physics
      this.vy += this.gravity;
      this.vx *= this.drag;
      this.vy *= this.drag;
      
      // Update position
      this.x += this.vx;
      this.y += this.vy;
      
      // Update rotation
      this.angle += this.angularVelocity;
      this.angularVelocity *= 0.99;
      
      // Bounce off walls
      if (this.x <= 0 || this.x >= canvas.width) {
        this.vx *= -this.bounce;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
      }
      
      // Bounce off ground
      if (this.y >= canvas.height - this.h) {
        this.vy *= -this.bounce;
        this.y = canvas.height - this.h;
        this.angularVelocity *= 0.8;
      }
      
      // Fade out over time
      this.life -= this.decay;
      this.opacity = Math.max(0, this.life * 0.8);
      
      // Reset if completely faded or off screen
      if (this.life <= 0 || this.y > canvas.height + 100) {
        this.reset();
      }
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -Math.random() * 100 - 20;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = Math.random() * 3 + 2;
      this.life = 1.0;
      this.opacity = Math.random() * 0.4 + 0.6;
      this.angle = Math.random() * 360;
      this.angularVelocity = (Math.random() - 0.5) * 15;
    }
    
    draw() {
      if (this.opacity <= 0) return;
      
      ctx.save();
      ctx.translate(this.x + this.w/2, this.y + this.h/2);
      ctx.rotate(this.angle * Math.PI / 180);
      ctx.globalAlpha = this.opacity;
      
      // Add glow effect
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = this.color;
      
      // Draw different shapes
      if (this.shape < 0.33) {
        // Rectangle
        ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
      } else if (this.shape < 0.66) {
        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, this.w/2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -this.h/2);
        ctx.lineTo(-this.w/2, this.h/2);
        ctx.lineTo(this.w/2, this.h/2);
        ctx.closePath();
        ctx.fill();
      }
      
      // Add inner highlight for 3D effect
      ctx.shadowBlur = 0;
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.fillStyle = '#ffffff';
      
      if (this.shape < 0.33) {
        ctx.fillRect(-this.w/2, -this.h/2, this.w/3, this.h/3);
      } else if (this.shape < 0.66) {
        ctx.beginPath();
        ctx.arc(-this.w/6, -this.h/6, this.w/6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -this.h/2);
        ctx.lineTo(-this.w/6, -this.h/6);
        ctx.lineTo(this.w/6, -this.h/6);
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
  
  // Initialize confetti with staggered creation for burst effect
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      confetti.push(new Confetto());
    }, i * 50); // Stagger creation over 6 seconds
  }
  
  let animationId;
  let startTime = Date.now();
  
  function animate() {
    // Clear with slight trail effect for smoother animation
    ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw all confetti
    confetti.forEach(c => {
      c.update();
      c.draw();
    });
    
    // Continue animation for 15 seconds
    if (Date.now() - startTime < 15000) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Fade out
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  
  // Cleanup on animation end
  setTimeout(() => {
    window.removeEventListener('resize', handleResize);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }, 15000);
}