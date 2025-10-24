import { router } from '../../utils/router.js';
import { findUserByPhoneOrEmail } from '../../utils/mockDatabase.js';

export function initLoginPage() {
  const app = document.querySelector('#app');

  // Prevent scrolling on body
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';

  // Make router available globally
  window.router = router;

  app.innerHTML = `
    <!-- Login Page -->
    <div class="login-page">
      <!-- Background -->
      <div class="login-background"></div>

      <!-- Neon Dots -->
      <div class="neon-dots-container" id="neonDotsContainer"></div>

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
                </div>
                <input
                  type="tel"
                  class="phone-number-input"
                  placeholder="90 123 45 67"
                  id="phoneInput"
                />
              </div>
              <div class="input-error" id="phoneError"></div>
            </div>

            <!-- Email Input (hidden by default) -->
            <div class="email-input-container hidden" id="emailContainer">
              <input
                type="email"
                class="email-input"
                placeholder="example@email.com"
                id="emailInput"
              />
              <div class="input-error" id="emailError"></div>
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

  // Initialize neon dots
  initNeonDots();
}

function addLoginPageStyles() {
  // Check if styles already exist
  if (document.querySelector('#login-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'login-page-styles';
  style.textContent = `
    .login-page {
      height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body:has(.login-page) {
      overflow: hidden;
      height: 100vh;
    }

    .login-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #232323;
      z-index: -1;
    }

    /* Neon Blinking Dots */
    .neon-dots-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0.12;
      overflow: hidden;
    }

    .neon-dot {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #5B8BC7;
      opacity: 0.12;
      filter: blur(15px);
    }

    .neon-dot.white {
      background: #ffffff;
      opacity: 0.12;
    }

    @keyframes neonBlink {
      0%, 100% {
        opacity: 0;
      }
      50% {
        opacity: 0.12;
      }
    }

    @keyframes neonPulse {
      0%, 100% {
        opacity: 0;
      }
      50% {
        opacity: 0.08;
      }
    }

    @keyframes whiteBlink {
      0%, 100% {
        opacity: 0;
      }
      50% {
        opacity: 0.06;
      }
    }

    .neon-dot.blink {
      animation: neonBlink 5s ease-in-out infinite;
    }

    .neon-dot.pulse {
      animation: neonPulse 5s ease-in-out infinite;
    }

    .neon-dot.white.blink {
      animation: whiteBlink 5s ease-in-out infinite;
    }

    .neon-dot:nth-child(2n) {
      animation-delay: -1s;
    }

    .neon-dot:nth-child(3n) {
      animation-delay: -2s;
    }

    .neon-dot:nth-child(4n) {
      animation-delay: -3s;
    }

    .neon-dot:nth-child(5n) {
      animation-delay: -4s;
    }

    .moon-decoration {
      position: fixed;
      z-index: 1;
      pointer-events: none;
    }

    .moon-top-right {
      top: 150px;
      right: 350px;
      animation: moonFloat 6s ease-in-out infinite;
    }

    .moon-bottom-left {
      bottom: 100px;
      left: 330px;
      animation: moonFloat 8s ease-in-out infinite reverse;
    }

    .moon-image {
      width: 200px;
      height: 200px;
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
      margin-bottom: 30px;
      text-align: center;
      transform: translateY(-120px)
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
      transform: translateY(-100px);
    }

    .login-card {
      background: rgba(90, 90, 90, 0.1);
      backdrop-filter: blur(50px);
      -webkit-backdrop-filter: blur(50px);
      border-radius: 24px;
      padding: 20px 40px 40px 40px;
      width: 550px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      border: 1px solid #7EA2D4;
    }

    .login-title {
      text-align: center;
      font-size: 1.8rem;
      font-weight: 500;
      color: #ffffff;
      margin: 1px 0 20px 0;
    }

    .login-toggle {
      display: flex;
      background: rgba(60, 60, 80, 0.5);
      border-radius: 25px;
      padding: 4px;
      margin-bottom: 20px;
    }

    .toggle-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 25px;
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
      margin-bottom: 8px;
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
      border-radius: 25px;
      border: 1px solid #7EA2D4;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .phone-input:focus-within {
      border-color: #7EA2D4;
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .country-selector {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      background: rgba(70, 70, 90, 0.5);
      border-right: 1px solid #7EA2D4;
      min-width: 95px;
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
    }

    .phone-number-input {
      flex: 1;
      padding: 8px 20px;
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
      padding: 16px 20px;
      background: rgba(60, 60, 80, 0.5);
      border: 1px solid #7EA2D4;
      border-radius: 25px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .email-input:focus {
      border-color: #7EA2D4;
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .email-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Override browser autocomplete styles */
    .phone-number-input:-webkit-autofill,
    .phone-number-input:-webkit-autofill:hover,
    .phone-number-input:-webkit-autofill:focus,
    .phone-number-input:-webkit-autofill:active,
    .email-input:-webkit-autofill,
    .email-input:-webkit-autofill:hover,
    .email-input:-webkit-autofill:focus,
    .email-input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px rgba(60, 60, 80, 0.5) inset !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s !important;
      background-color: rgba(60, 60, 80, 0.5) !important;
    }

    /* Input Error Messages */
    .input-error {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 5px;
      margin-left: 4px;
      display: none;
    }

    .input-error.show {
      display: block;
    }

    .login-submit-btn {
      width: 200px;
      padding: 13px;
      margin: 10px auto 0 auto;
      display: block;
      background: linear-gradient(135deg, #7EA2D4 0%, #5A85C7 100%);
      border: none;
      border-radius: 25px;
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
        max-width: 450px;
        padding: 32px 24px;
      }

      .login-logo {
        margin-bottom: 25px;
      }

      .login-modal {
      }

      .moon-top-right {
        top: 55px;
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

      .login-logo {
        margin-bottom: 20px;
      }

      .login-modal {
      }

      .country-selector {
        min-width: 80px;
        padding: 14px 16px;
      }

      .phone-number-input {
        padding: 14px 16px;
      }

      .email-input {
        padding: 14px 16px;
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

  // Error elements
  const phoneError = document.getElementById('phoneError');
  const emailError = document.getElementById('emailError');

  // Validation functions
  function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function hideError(errorElement) {
    errorElement.classList.remove('show');
  }

  function validatePhone() {
    const phoneInput = document.getElementById('phoneInput');
    const phoneValue = phoneInput.value.trim().replace(/\s/g, '');

    if (!phoneValue) {
      showError(phoneError, 'Telefon raqam kiritilishi shart');
      return false;
    } else if (phoneValue.length !== 9) {
      showError(phoneError, 'Iltimos, 9 ta raqam kiriting');
      return false;
    } else {
      hideError(phoneError);
      return true;
    }
  }

  function validateEmail() {
    const emailInput = document.getElementById('emailInput');
    const emailValue = emailInput.value.trim();

    if (!emailValue) {
      showError(emailError, 'Email kiritilishi shart');
      return false;
    } else if (!isValidEmail(emailValue)) {
      showError(emailError, 'To\'g\'ri email kiriting');
      return false;
    } else {
      hideError(emailError);
      return true;
    }
  }

  // Toggle between phone and email input
  phoneToggle.addEventListener('click', () => {
    phoneToggle.classList.add('active');
    emailToggle.classList.remove('active');
    phoneContainer.classList.remove('hidden');
    emailContainer.classList.add('hidden');
    inputLabel.textContent = 'Telefon raqam';
    // Clear errors when switching
    hideError(phoneError);
    hideError(emailError);
  });

  emailToggle.addEventListener('click', () => {
    emailToggle.classList.add('active');
    phoneToggle.classList.remove('active');
    emailContainer.classList.remove('hidden');
    phoneContainer.classList.add('hidden');
    inputLabel.textContent = 'Email';
    // Clear errors when switching
    hideError(phoneError);
    hideError(emailError);
  });

  // Handle form submission
  loginSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    const isPhoneMode = phoneToggle.classList.contains('active');
    let userIdentifier = '';
    let isValid = false;

    if (isPhoneMode) {
      isValid = validatePhone();
      if (isValid) {
        const phoneInput = document.getElementById('phoneInput');
        const phoneValue = phoneInput.value.trim().replace(/\s/g, '');
        userIdentifier = '+998' + phoneValue;
      }
    } else {
      isValid = validateEmail();
      if (isValid) {
        const emailInput = document.getElementById('emailInput');
        userIdentifier = emailInput.value.trim();
      }
    }

    if (!isValid) {
      return; // Don't proceed if validation fails
    }

    // Add loading state
    loginSubmit.textContent = 'Tekshirilmoqda...';
    loginSubmit.disabled = true;

    // Check if user exists
    setTimeout(() => {
      const existingUser = findUserByPhoneOrEmail(userIdentifier);

      if (existingUser) {
        // User exists, store temp data and go to password page
        sessionStorage.setItem('tempUserData', JSON.stringify(existingUser));
        sessionStorage.setItem('userIdentifier', userIdentifier);

        // Restore body scroll before navigation
        document.body.style.overflow = '';
        document.body.style.height = '';

        router.navigate('/password');
      } else {
        // User doesn't exist, go to register page
        sessionStorage.setItem('registerIdentifier', userIdentifier);
        sessionStorage.setItem('registerMode', isPhoneMode ? 'phone' : 'email');

        // Restore body scroll before navigation
        document.body.style.overflow = '';
        document.body.style.height = '';

        router.navigate('/register');
      }

      // Reset button state
      loginSubmit.textContent = 'Kirish';
      loginSubmit.disabled = false;
    }, 1000);
  });

  // Format phone number as user types and validate
  const phoneInput = document.getElementById('phoneInput');
  const emailInput = document.getElementById('emailInput');

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

    // Clear error when user starts typing
    if (phoneError.classList.contains('show')) {
      hideError(phoneError);
    }
  });

  phoneInput.addEventListener('blur', validatePhone);

  emailInput.addEventListener('input', () => {
    // Clear error when user starts typing
    if (emailError.classList.contains('show')) {
      hideError(emailError);
    }
  });

  emailInput.addEventListener('blur', validateEmail);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function initNeonDots() {
  const container = document.getElementById('neonDotsContainer');

  // Helper function to create a dot
  function createDot(left, top, isSpecialPosition = false) {
    const dot = document.createElement('div');
    dot.className = 'neon-dot';

    // Randomly assign animation type
    const animations = ['blink', 'pulse'];
    const animationType = animations[Math.floor(Math.random() * animations.length)];
    dot.classList.add(animationType);

    // 30% chance for white dots
    if (Math.random() < 0.3) {
      dot.classList.add('white');
    }

    // Position
    dot.style.left = left;
    dot.style.top = top;

    // Random size variation (40px to 60px)
    const size = 40 + Math.random() * 20;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';

    container.appendChild(dot);
  }

  // Random dots across the screen
  const randomDotCount = 6;
  for (let i = 0; i < randomDotCount; i++) {
    createDot(
      Math.random() * 100 + '%',
      Math.random() * 100 + '%'
    );
  }

  // Left side dots
  for (let i = 0; i < 3; i++) {
    createDot(
      Math.random() * 15 + '%', // 0-15% from left
      Math.random() * 100 + '%',
      true
    );
  }

  // Top area dots
  for (let i = 0; i < 3; i++) {
    createDot(
      Math.random() * 100 + '%',
      Math.random() * 15 + '%', // 0-15% from top
      true
    );
  }

  // Bottom area dots
  for (let i = 0; i < 3; i++) {
    createDot(
      Math.random() * 100 + '%',
      85 + Math.random() * 15 + '%', // 85-100% from top
      true
    );
  }
}