import { router } from '../../utils/router.js';

export function initLoginPage() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <!-- Login Page -->
    <div class="login-page">
      <!-- Background -->
      <div class="login-background"></div>

      <!-- Animated Moon Decorations -->
      <div class="moon-decoration moon-top-right">
        <img src="/images/0016 1.png" alt="Moon" class="moon-image" />
      </div>

      <div class="moon-decoration moon-bottom-left">
        <img src="/images/0016 1.png" alt="Moon" class="moon-image" />
      </div>

      <!-- Logo -->
      <div class="login-logo">
        <h1>dars<span>linker</span></h1>
      </div>

      <!-- Login Modal -->
      <div class="login-modal">
        <div class="login-card">
          <h2 class="login-title">Kirish</h2>

          <!-- Toggle Buttons -->
          <div class="login-toggle">
            <button class="toggle-btn active" id="phoneToggle" data-type="phone">
              Telefon raqam
            </button>
            <button class="toggle-btn" id="emailToggle" data-type="email">
              Email
            </button>
          </div>

          <!-- Input Section -->
          <div class="input-section">
            <label class="input-label" id="inputLabel">Telefon raqam</label>

            <!-- Phone Input -->
            <div class="phone-input-container" id="phoneContainer">
              <div class="phone-input">
                <div class="country-selector">
                  <img src="/images/uz-flag.jpg" alt="UZ" class="country-flag" />
                  <span class="country-code">+998</span>
                  <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  class="phone-number-input"
                  placeholder="90 123 45 67"
                  id="phoneInput"
                />
              </div>
            </div>

            <!-- Email Input (hidden by default) -->
            <div class="email-input-container hidden" id="emailContainer">
              <input
                type="email"
                class="email-input"
                placeholder="example@email.com"
                id="emailInput"
              />
            </div>
          </div>

          <!-- Login Button -->
          <button class="login-submit-btn" id="loginSubmit">
            Kirish
          </button>
        </div>
      </div>
    </div>
  `;

  // Add login page styles
  addLoginPageStyles();

  // Initialize login page functionality
  initLoginPageFunctionality();
}

function addLoginPageStyles() {
  // Check if styles already exist
  if (document.querySelector('#login-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'login-page-styles';
  style.textContent = `
    .login-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .login-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg,
        rgba(23, 23, 40, 1) 0%,
        rgba(45, 45, 70, 1) 25%,
        rgba(30, 30, 50, 1) 50%,
        rgba(20, 20, 35, 1) 75%,
        rgba(15, 15, 25, 1) 100%
      );
      z-index: -1;
    }

    .moon-decoration {
      position: fixed;
      z-index: 1;
      pointer-events: none;
    }

    .moon-top-right {
      top: 120px;
      right: 80px;
      animation: moonFloat 6s ease-in-out infinite;
    }

    .moon-bottom-left {
      bottom: 80px;
      left: 80px;
      animation: moonFloat 8s ease-in-out infinite reverse;
    }

    .moon-image {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
      animation: moonRotate 20s linear infinite;
    }

    @keyframes moonFloat {
      0%, 100% {
        transform: translateY(0px) translateX(0px);
      }
      25% {
        transform: translateY(-15px) translateX(5px);
      }
      50% {
        transform: translateY(0px) translateX(10px);
      }
      75% {
        transform: translateY(15px) translateX(5px);
      }
    }

    @keyframes moonRotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .login-logo {
      margin-bottom: 60px;
      text-align: center;
    }

    .login-logo h1 {
      font-size: 2.5rem;
      font-weight: 300;
      color: #ffffff;
      margin: 0;
      letter-spacing: 2px;
    }

    .login-logo span {
      color: #7EA2D4;
      font-weight: 500;
    }

    .login-modal {
      position: relative;
      z-index: 10;
    }

    .login-card {
      background: rgba(45, 45, 60, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 40px;
      width: 450px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .login-title {
      text-align: center;
      font-size: 1.8rem;
      font-weight: 500;
      color: #ffffff;
      margin: 0 0 32px 0;
    }

    .login-toggle {
      display: flex;
      background: rgba(60, 60, 80, 0.5);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 32px;
    }

    .toggle-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .toggle-btn.active {
      background: rgba(126, 162, 212, 1);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(126, 162, 212, 0.3);
    }

    .toggle-btn:hover:not(.active) {
      background: rgba(60, 60, 80, 0.7);
      color: rgba(255, 255, 255, 0.9);
    }

    .input-section {
      margin-bottom: 32px;
    }

    .input-label {
      display: block;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .phone-input-container,
    .email-input-container {
      transition: all 0.3s ease;
    }

    .hidden {
      display: none;
    }

    .phone-input {
      display: flex;
      background: rgba(60, 60, 80, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .phone-input:focus-within {
      border-color: rgba(126, 162, 212, 0.5);
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .country-selector {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      background: rgba(70, 70, 90, 0.5);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      min-width: 100px;
    }

    .country-flag {
      width: 20px;
      height: 15px;
      border-radius: 2px;
      margin-right: 8px;
    }

    .country-code {
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 500;
      margin-right: 6px;
    }

    .dropdown-arrow {
      color: rgba(255, 255, 255, 0.6);
    }

    .phone-number-input {
      flex: 1;
      padding: 14px 16px;
      border: none;
      background: transparent;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
    }

    .phone-number-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .email-input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(60, 60, 80, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .email-input:focus {
      border-color: rgba(126, 162, 212, 0.5);
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .email-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .login-submit-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #7EA2D4 0%, #5A85C7 100%);
      border: none;
      border-radius: 12px;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(126, 162, 212, 0.3);
    }

    .login-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(126, 162, 212, 0.4);
    }

    .login-submit-btn:active {
      transform: translateY(0px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .login-card {
        width: 90vw;
        max-width: 400px;
        padding: 32px 24px;
      }

      .moon-top-right {
        top: 60px;
        right: 40px;
      }

      .moon-bottom-left {
        bottom: 40px;
        left: 40px;
      }

      .moon-image {
        width: 80px;
        height: 80px;
      }

      .login-logo h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px 20px;
      }

      .country-selector {
        min-width: 80px;
        padding: 12px 14px;
      }

      .phone-number-input {
        padding: 12px 14px;
      }

      .email-input {
        padding: 12px 14px;
      }
    }
  `;

  document.head.appendChild(style);
}

function initLoginPageFunctionality() {
  const phoneToggle = document.getElementById('phoneToggle');
  const emailToggle = document.getElementById('emailToggle');
  const phoneContainer = document.getElementById('phoneContainer');
  const emailContainer = document.getElementById('emailContainer');
  const inputLabel = document.getElementById('inputLabel');
  const loginSubmit = document.getElementById('loginSubmit');

  // Toggle between phone and email input
  phoneToggle.addEventListener('click', () => {
    phoneToggle.classList.add('active');
    emailToggle.classList.remove('active');
    phoneContainer.classList.remove('hidden');
    emailContainer.classList.add('hidden');
    inputLabel.textContent = 'Telefon raqam';
  });

  emailToggle.addEventListener('click', () => {
    emailToggle.classList.add('active');
    phoneToggle.classList.remove('active');
    emailContainer.classList.remove('hidden');
    phoneContainer.classList.add('hidden');
    inputLabel.textContent = 'Email';
  });

  // Handle form submission
  loginSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    const isPhoneMode = phoneToggle.classList.contains('active');

    if (isPhoneMode) {
      const phoneInput = document.getElementById('phoneInput');
      const phoneValue = phoneInput.value.trim();

      if (!phoneValue) {
        alert('Iltimos, telefon raqamingizni kiriting!');
        return;
      }

      console.log('Login attempt with phone:', phoneValue);
    } else {
      const emailInput = document.getElementById('emailInput');
      const emailValue = emailInput.value.trim();

      if (!emailValue) {
        alert('Iltimos, emailingizni kiriting!');
        return;
      }

      if (!isValidEmail(emailValue)) {
        alert('Iltimos, to\'g\'ri email kiriting!');
        return;
      }

      console.log('Login attempt with email:', emailValue);
    }

    // Add loading state
    loginSubmit.textContent = 'Kirilmoqda...';
    loginSubmit.disabled = true;

    // Simulate login process
    setTimeout(() => {
      alert('Kirish muvaffaqiyatli!');
      // Navigate to dashboard or home
      router.navigate('/dashboard');
    }, 1500);
  });

  // Format phone number as user types
  const phoneInput = document.getElementById('phoneInput');
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    // Format as XX XXX XX XX
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}