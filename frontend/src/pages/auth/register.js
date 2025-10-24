import { router } from '../../utils/router.js';
import { registerUser, findUserByPhoneOrEmail } from '../../utils/mockDatabase.js';

export function initRegisterPage() {
  const app = document.querySelector('#app');

  // Prevent scrolling on body
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';

  // Make router available globally
  window.router = router;

  // Get register data from session storage
  const registerIdentifier = sessionStorage.getItem('registerIdentifier') || '';
  const registerMode = sessionStorage.getItem('registerMode') || 'phone';

  app.innerHTML = `
    <!-- Register Page -->
    <div class="register-page">
      <!-- Background -->
      <div class="register-background"></div>

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
      <div class="register-logo">
        <h1>dars<span>linker</span></h1>
      </div>

      <!-- Register Modal -->
      <div class="register-modal">
        <div class="register-card">
          <h2 class="register-title">Ro'yxatdan o'tish</h2>

          <!-- Toggle Buttons -->
          <div class="register-toggle">
            <button class="toggle-btn ${registerMode === 'phone' ? 'active' : ''}" id="phoneToggle" data-type="phone">
              Telefon raqam
            </button>
            <button class="toggle-btn ${registerMode === 'email' ? 'active' : ''}" id="emailToggle" data-type="email">
              Email
            </button>
          </div>

          <!-- Form Fields -->
          <div class="register-form">
            <!-- First Name -->
            <div class="form-group">
              <label class="form-label">Ism</label>
              <input
                type="text"
                class="form-input"
                placeholder="Ismingizni kiriting"
                id="firstNameInput"
                required
              />
              <div class="input-error" id="firstNameError"></div>
            </div>

            <!-- Last Name -->
            <div class="form-group">
              <label class="form-label">Familiya</label>
              <input
                type="text"
                class="form-input"
                placeholder="Familiyangizni kiriting"
                id="lastNameInput"
                required
              />
              <div class="input-error" id="lastNameError"></div>
            </div>

            <!-- Phone Number -->
            <div class="form-group ${registerMode !== 'phone' ? 'hidden' : ''}" id="phoneGroup">
              <label class="form-label">Telefon raqam</label>
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
                  value="${registerMode === 'phone' && registerIdentifier ? registerIdentifier.replace('+998', '').replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') : ''}"
                />
              </div>
              <div class="input-error" id="phoneError"></div>
            </div>

            <!-- Email -->
            <div class="form-group ${registerMode !== 'email' ? 'hidden' : ''}" id="emailGroup">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-input"
                placeholder="example@email.com"
                id="emailInput"
                value="${registerMode === 'email' ? registerIdentifier : ''}"
              />
              <div class="input-error" id="emailError"></div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">Parol</label>
              <div class="password-input-wrapper">
                <input
                  type="password"
                  class="form-input password-input-field"
                  placeholder="Parol kiriting"
                  id="passwordInput"
                  required
                />
                <button type="button" class="password-toggle-btn" id="passwordToggle">
                  <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <svg class="eye-hide hidden" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <div class="input-error" id="passwordError"></div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label class="form-label">Parolni tasdiqlang</label>
              <div class="password-input-wrapper">
                <input
                  type="password"
                  class="form-input password-input-field"
                  placeholder="Parolni tasdiqlang"
                  id="confirmPasswordInput"
                  required
                />
                <button type="button" class="password-toggle-btn" id="confirmPasswordToggle">
                  <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <svg class="eye-hide hidden" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <div class="input-error" id="confirmPasswordError"></div>
            </div>
          </div>

          <!-- Register Button -->
          <button class="register-submit-btn" id="registerSubmit">
            Ro'yxatdan o'tish
          </button>
        </div>
      </div>
    </div>
  `;

  // Add register page styles
  addRegisterPageStyles();

  // Initialize register page functionality
  initRegisterPageFunctionality();

  // Initialize neon dots
  initRegisterNeonDots();
}

function addRegisterPageStyles() {
  // Check if styles already exist
  if (document.querySelector('#register-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'register-page-styles';
  style.textContent = `
    .register-page {
      height: 100vh;
      position: relative;
      // overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body:has(.register-page) {
      overflow: hidden;
      height: 100vh;
    }

    .register-background {
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
      top: 35px;
      right: 330px;
      animation: moonFloat 6s ease-in-out infinite;
    }

    .moon-bottom-left {
      bottom: -5px;
      left: 300px;
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

    .register-logo {
      margin-bottom: 1px;
      text-align: center;
      transform: translateY(-100px);
    }

    .register-logo h1 {
      font-size: 2.5rem;
      font-weight: 300;
      color: #ffffff;
      margin: 0;
      letter-spacing: 2px;
    }

    .register-logo span {
      color: #7EA2D4;
      font-weight: 500;
    }

    .register-modal {
      position: relative;
      z-index: 10;
    }

    .register-card {
      background: rgba(90, 90, 90, 0.1);
      backdrop-filter: blur(50px);
      -webkit-backdrop-filter: blur(50px);
      border-radius: 24px;
      padding: 8px 40px 12px 40px;
      width: 600px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      border: 1px solid #7EA2D4;
      transform: translateY(-90px);

    }

    .register-title {
      text-align: center;
      font-size: 1.2rem;
      font-weight: 500;
      color: #ffffff;
      margin: 10px 0 15px 0;
    }

    .register-toggle {
      display: flex;
      background: rgba(60, 60, 80, 0.5);
      border-radius: 25px;
      padding: 4px;
      margin-bottom: 6px;
    }

    .toggle-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
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

    .register-form {
      margin-bottom: 8px;
    }

    .form-group {
      margin-bottom: 6px;
      transition: all 0.3s ease;
    }

    .form-group.hidden {
      display: none;
    }

    .form-label {
      display: block;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 2px;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(60, 60, 80, 0.5);
      border: 1px solid #7EA2D4;
      border-radius: 25px;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-field {
      padding-right: 50px;
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
    }

    .password-toggle-btn:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .password-toggle-btn svg {
      width: 20px;
      height: 20px;
    }

    .password-toggle-btn .hidden {
      display: none;
    }

    .form-input:focus {
      border-color: #7EA2D4;
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Override browser autocomplete styles */
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus,
    .form-input:-webkit-autofill:active,
    .password-input-field:-webkit-autofill,
    .password-input-field:-webkit-autofill:hover,
    .password-input-field:-webkit-autofill:focus,
    .password-input-field:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px rgba(60, 60, 80, 0.5) inset !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s !important;
      background-color: rgba(60, 60, 80, 0.5) !important;
    }

    .phone-input {
      display: flex;
      background: rgba(60, 60, 80, 0.5);
      border-radius: 25px;
      border: 1px solid #7EA2D4;
      overflow: hidden;
      height: 40px;
      transition: all 0.3s ease;
    }

    .phone-input:focus-within {
      border-color: #7EA2D4;
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .country-selector {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      background: rgba(70, 70, 90, 0.5);
      border-right: 1px solid #7EA2D4;
      min-width: 80px;
    }

    .country-flag {
      width: 20px;
      height: 15px;
      border-radius: 2px;
      margin-right: 8px;
    }

    .country-code {
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .phone-number-input {
      flex: 1;
      padding: 10px 14px;
      border: none;
      background: transparent;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
    }

    .phone-number-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Override browser autocomplete styles for phone input */
    .phone-number-input:-webkit-autofill,
    .phone-number-input:-webkit-autofill:hover,
    .phone-number-input:-webkit-autofill:focus,
    .phone-number-input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s !important;
      background-color: transparent !important;
    }

    .register-submit-btn {
      width: 140px;
      padding: 10px;
      margin: 15px auto 15px auto;
      display: block;
      background: linear-gradient(135deg, #7EA2D4 0%, #5A85C7 100%);
      border: none;
      border-radius: 25px;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(126, 162, 212, 0.3);
    }

    .register-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(126, 162, 212, 0.4);
    }

    .register-submit-btn:active {
      transform: translateY(0px);
    }

    .register-submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      top: 30px;
      right: 30px;
      padding: 16px 24px;
      border-radius: 12px;
      color: #ffffff;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    }

    .toast.success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .toast.error {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    .toast.show {
      transform: translateX(0);
    }

    /* Input Error Messages */
    .input-error {
      color: #dc3545;
      font-size: 0.75rem;
      margin-top: 2px;
      margin-left: 4px;
      display: none;
    }

    .input-error.show {
      display: block;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .register-card {
        width: 90vw;
        max-width: 450px;
        padding: 32px 24px;
        max-height: 90vh;
      }

      .register-logo {
        margin-bottom: 25px;
        transform: translateY(-20px);
      }

      .register-modal {
        transform: translateY(-20px);
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

      .register-logo h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 24px 20px;
      }

      .register-logo {
        margin-bottom: 20px;
        transform: translateY(-15px);
      }

      .register-modal {
        transform: translateY(-15px);
      }

      .form-input,
      .phone-number-input {
        padding: 14px 16px;
      }

      .country-selector {
        min-width: 80px;
        padding: 14px 16px;
      }
    }
  `;

  document.head.appendChild(style);
}

function initRegisterPageFunctionality() {
  const phoneToggle = document.getElementById('phoneToggle');
  const emailToggle = document.getElementById('emailToggle');
  const phoneGroup = document.getElementById('phoneGroup');
  const emailGroup = document.getElementById('emailGroup');
  const registerSubmit = document.getElementById('registerSubmit');

  // Form inputs
  const firstNameInput = document.getElementById('firstNameInput');
  const lastNameInput = document.getElementById('lastNameInput');
  const phoneInput = document.getElementById('phoneInput');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');

  // Password toggle buttons
  const passwordToggle = document.getElementById('passwordToggle');
  const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

  // Error elements
  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const phoneError = document.getElementById('phoneError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  // Password toggle functionality
  passwordToggle.addEventListener('click', () => {
    togglePasswordVisibility(passwordInput, passwordToggle);
  });

  confirmPasswordToggle.addEventListener('click', () => {
    togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
  });

  // Toggle between phone and email registration
  phoneToggle.addEventListener('click', () => {
    phoneToggle.classList.add('active');
    emailToggle.classList.remove('active');
    phoneGroup.classList.remove('hidden');
    emailGroup.classList.add('hidden');
  });

  emailToggle.addEventListener('click', () => {
    emailToggle.classList.add('active');
    phoneToggle.classList.remove('active');
    emailGroup.classList.remove('hidden');
    phoneGroup.classList.add('hidden');
  });

  // Real-time validation with letter-only filtering
  firstNameInput.addEventListener('input', (e) => {
    // Allow only letters, remove numbers and special characters
    e.target.value = e.target.value.replace(/[^a-zA-Z\u0400-\u04FF\u00C0-\u017F]/g, '');
    validateFirstName();
  });
  firstNameInput.addEventListener('blur', validateFirstName);

  lastNameInput.addEventListener('input', (e) => {
    // Allow only letters, remove numbers and special characters
    e.target.value = e.target.value.replace(/[^a-zA-Z\u0400-\u04FF\u00C0-\u017F]/g, '');
    validateLastName();
  });
  lastNameInput.addEventListener('blur', validateLastName);

  phoneInput.addEventListener('input', (e) => {
    formatPhoneNumber(e);
    validatePhone();
  });
  phoneInput.addEventListener('blur', validatePhone);

  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  passwordInput.addEventListener('input', validatePassword);
  passwordInput.addEventListener('blur', validatePassword);

  confirmPasswordInput.addEventListener('input', validateConfirmPassword);
  confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

  // Validation functions
  function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function hideError(errorElement) {
    errorElement.classList.remove('show');
  }

  function validateFirstName() {
    const value = firstNameInput.value.trim();
    const lettersOnly = /^[a-zA-Z\u0400-\u04FF\u00C0-\u017F]+$/; // Latin, Cyrillic, accented letters

    if (!value) {
      showError(firstNameError, 'Ism kiritilishi shart');
      return false;
    } else if (value.length < 3) {
      showError(firstNameError, 'Ism kamida 3 ta harfdan iborat bo\'lishi kerak');
      return false;
    } else if (!lettersOnly.test(value)) {
      showError(firstNameError, 'Ism faqat harflardan iborat bo\'lishi kerak');
      return false;
    } else {
      hideError(firstNameError);
      return true;
    }
  }

  function validateLastName() {
    const value = lastNameInput.value.trim();
    const lettersOnly = /^[a-zA-Z\u0400-\u04FF\u00C0-\u017F]+$/;

    if (!value) {
      showError(lastNameError, 'Familiya kiritilishi shart');
      return false;
    } else if (value.length < 3) {
      showError(lastNameError, 'Familiya kamida 3 ta harfdan iborat bo\'lishi kerak');
      return false;
    } else if (!lettersOnly.test(value)) {
      showError(lastNameError, 'Familiya faqat harflardan iborat bo\'lishi kerak');
      return false;
    } else {
      hideError(lastNameError);
      return true;
    }
  }

  function validatePhone() {
    const isPhoneMode = phoneToggle.classList.contains('active');
    if (!isPhoneMode) return true;

    const value = phoneInput.value.trim().replace(/\s/g, '');

    if (!value) {
      showError(phoneError, 'Telefon raqam kiritilishi shart');
      return false;
    } else if (value.length !== 9) {
      showError(phoneError, 'Telefon raqam to\'liq kiritilishi kerak');
      return false;
    } else {
      hideError(phoneError);
      return true;
    }
  }

  function validateEmail() {
    const isEmailMode = emailToggle.classList.contains('active');
    if (!isEmailMode) return true;

    const value = emailInput.value.trim();

    if (!value) {
      showError(emailError, 'Email kiritilishi shart');
      return false;
    } else if (!isValidEmail(value)) {
      showError(emailError, 'To\'g\'ri email kiriting');
      return false;
    } else {
      hideError(emailError);
      return true;
    }
  }

  function validatePassword() {
    const value = passwordInput.value.trim();

    if (!value) {
      showError(passwordError, 'Parol kiritilishi shart');
      return false;
    } else if (value.length < 6) {
      showError(passwordError, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
      return false;
    } else {
      hideError(passwordError);
      validateConfirmPassword(); // Re-validate confirm password when password changes
      return true;
    }
  }

  function validateConfirmPassword() {
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!confirmPassword) {
      showError(confirmPasswordError, 'Parolni tasdiqlang');
      return false;
    } else if (password !== confirmPassword) {
      showError(confirmPasswordError, 'Parollar mos kelmaydi');
      return false;
    } else {
      hideError(confirmPasswordError);
      return true;
    }
  }

  function formatPhoneNumber(e) {
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
  }

  // Handle form submission
  registerSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    handleRegistration();
  });

  function handleRegistration() {
    const isPhoneMode = phoneToggle.classList.contains('active');

    // Run all validations
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isPhoneValid = validatePhone();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    // Check if all validations pass
    const allValid = isFirstNameValid && isLastNameValid &&
                    (isPhoneMode ? isPhoneValid : isEmailValid) &&
                    isPasswordValid && isConfirmPasswordValid;

    if (!allValid) {
      showErrorToast('Iltimos, barcha xatolarni tuzating!');
      return;
    }

    // Get form values
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim().replace(/\s/g, '');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const userIdentifier = isPhoneMode ? phone : email;

    // Check if user already exists
    const existingUser = findUserByPhoneOrEmail(userIdentifier);
    if (existingUser) {
      showErrorToast('Bu telefon raqam yoki email allaqachon ro\'yxatdan o\'tgan!');
      return;
    }

    // Add loading state
    registerSubmit.textContent = 'Ro\'yxatdan o\'tilmoqda...';
    registerSubmit.disabled = true;

    // Simulate registration
    setTimeout(() => {
      const userData = {
        firstName,
        lastName,
        phone: isPhoneMode ? phone : '',
        email: isPhoneMode ? '' : email,
        password
      };

      const newUser = registerUser(userData);

      // Clear session storage
      sessionStorage.removeItem('registerIdentifier');
      sessionStorage.removeItem('registerMode');

      // Show success toast
      showSuccessToast('Ro\'yxatdan o\'tish muvaffaqiyatli!');

      // Reset form and button
      registerSubmit.textContent = 'Ro\'yxatdan o\'tish';
      registerSubmit.disabled = false;

      // Reset form inputs
      firstNameInput.value = '';
      lastNameInput.value = '';
      phoneInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
      confirmPasswordInput.value = '';
    }, 1500);
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast error';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

function initRegisterNeonDots() {
  const container = document.getElementById('neonDotsContainer');

  // Helper function to create a dot
  function createDot(left, top) {
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
      Math.random() * 100 + '%'
    );
  }

  // Top area dots
  for (let i = 0; i < 3; i++) {
    createDot(
      Math.random() * 100 + '%',
      Math.random() * 15 + '%' // 0-15% from top
    );
  }

  // Bottom area dots
  for (let i = 0; i < 3; i++) {
    createDot(
      Math.random() * 100 + '%',
      85 + Math.random() * 15 + '%' // 85-100% from top
    );
  }
}

function togglePasswordVisibility(inputField, toggleButton) {
  const eyeShow = toggleButton.querySelector('.eye-show');
  const eyeHide = toggleButton.querySelector('.eye-hide');

  if (inputField.type === 'password') {
    inputField.type = 'text';
    eyeShow.classList.add('hidden');
    eyeHide.classList.remove('hidden');
  } else {
    inputField.type = 'password';
    eyeShow.classList.remove('hidden');
    eyeHide.classList.add('hidden');
  }
}