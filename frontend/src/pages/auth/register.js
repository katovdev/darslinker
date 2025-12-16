import { router } from '../../utils/router.js';
import { apiService } from '../../utils/api.js';

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



      <!-- Logo -->
      <div class="register-logo">
        <h1>dars<span>linker</span></h1>
      </div>

      <!-- Register Modal -->
      <div class="register-modal">
        <div class="register-card">
          <h2 class="register-title">Ro'yxatdan o'tish</h2>



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
            <div class="form-group" id="phoneGroup">
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



            <!-- Password -->
            <div class="form-group">
              <label class="form-label">Parol</label>
              <div class="password-input-wrapper">
                <input
                  type="password"
                  class="form-input password-input-field"
                  placeholder="Kamida 6 ta belgi"
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



    .register-logo {
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      text-align: center;
      width: 100%;
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
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
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
      transform: none;
      margin: 0;
    }

    .register-title {
      text-align: center;
      font-size: 1.2rem;
      font-weight: 500;
      color: #ffffff;
      margin: 10px 0 15px 0;
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
      padding: 10px 20px 10px 14px;
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
      font-size: 0.85rem;
      font-weight: 500;
      margin-right: 12px;
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
      /* Hide all 3D elements */
      .neon-dots-container {
        display: none !important;
      }

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
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .form-input,
      .phone-number-input {
        padding: 14px 16px;
      }

      .country-selector {
        min-width: 90px;
        padding: 14px 18px 14px 16px;
      }
    }
  `;

  document.head.appendChild(style);
}

function initRegisterPageFunctionality() {
  const phoneGroup = document.getElementById('phoneGroup');
  const registerSubmit = document.getElementById('registerSubmit');

  // Form inputs
  const firstNameInput = document.getElementById('firstNameInput');
  const lastNameInput = document.getElementById('lastNameInput');
  const phoneInput = document.getElementById('phoneInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');

  // Password toggle buttons
  const passwordToggle = document.getElementById('passwordToggle');
  const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

  // Error elements
  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const phoneError = document.getElementById('phoneError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  // Password toggle functionality
  passwordToggle.addEventListener('click', () => {
    togglePasswordVisibility(passwordInput, passwordToggle);
  });

  confirmPasswordToggle.addEventListener('click', () => {
    togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
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

  async function handleRegistration() {
    // Run all validations (phone only now)
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    // Check if all validations pass
    const allValid = isFirstNameValid && isLastNameValid && isPhoneValid && isPasswordValid && isConfirmPasswordValid;

    if (!allValid) {
      showErrorToast('Iltimos, barcha xatolarni tuzating!');
      return;
    }

    // Get form values
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim().replace(/\s/g, '');
    const password = passwordInput.value.trim();

    const userIdentifier = `+998${phone}`;

    // Add loading state
    registerSubmit.textContent = 'Ro\'yxatdan o\'tilmoqda...';
    registerSubmit.disabled = true;

    try {
      // First check if user already exists
      const checkResult = await apiService.checkUser(userIdentifier);

      if (checkResult.exists && checkResult.next === 'login') {
        showErrorToast('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan va tasdiqlangan!');
        registerSubmit.textContent = 'Ro\'yxatdan o\'tish';
        registerSubmit.disabled = false;
        return;
      }

      if (!checkResult.exists && checkResult.next === 'verify') {
        // User exists but not verified, show OTP modal directly
        showOtpVerificationModal(userIdentifier);
        registerSubmit.textContent = 'Ro\'yxatdan o\'tish';
        registerSubmit.disabled = false;
        return;
      }

      // Prepare user data for registration
      const userData = {
        firstName,
        lastName,
        password,
        phone: `+998${phone}`,
        role: 'teacher' // Default role - all users are teachers
      };

      // Register the user
      const registerResult = await apiService.register(userData);

      if (registerResult.success) {
        // Store registration data for OTP verification
        sessionStorage.setItem('registrationIdentifier', userIdentifier);
        sessionStorage.setItem('awaitingOtpVerification', 'true');

        // Show success message and redirect to OTP verification
        showSuccessToast('Ro\'yxatdan o\'tish muvaffaqiyatli! OTP kod yuborildi.');

        // Create and show OTP verification modal
        showOtpVerificationModal(userIdentifier);
      }

    } catch (error) {
      console.error('Registration error:', error);
      showErrorToast(error.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      // Reset button state
      registerSubmit.textContent = 'Ro\'yxatdan o\'tish';
      registerSubmit.disabled = false;
    }
  }



  function showOtpVerificationModal(identifier) {
    // Create OTP verification modal
    const otpModal = document.createElement('div');
    otpModal.className = 'otp-modal-overlay';
    otpModal.innerHTML = `
      <div class="otp-modal">
        <div class="otp-header">
          <h3>Tasdiqlash kodi</h3>
          <p>Tasdiqlash kodini <strong>@DarsLinkeer_bot</strong> orqali oling</p>
          <p class="bot-instruction">Telegram botga o'ting va tasdiqlash kodini oling</p>
        </div>
        <div class="otp-actions-telegram">
          <button class="telegram-bot-btn" id="openTelegramBot">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.673c-.137.613-.5.76-1.013.474l-2.8-2.062-1.347 1.298c-.15.15-.273.273-.562.273l.2-2.86 5.2-4.7c.226-.2-.05-.313-.35-.112l-6.425 4.047-2.774-.867c-.6-.187-.612-.6.126-.887l10.85-4.187c.5-.187.937.112.774.887z"/>
            </svg>
            Telegram Botga O'tish
          </button>
        </div>
        <div class="otp-divider">
          <span>Kodni oldingizmi?</span>
        </div>
        <div class="otp-input-container">
          <input type="text" class="otp-input" maxlength="6" placeholder="000000" id="otpCodeInput">
        </div>
        <div class="otp-actions">
          <button class="otp-verify-btn" id="verifyOtpBtn">Tasdiqlash</button>
        </div>
        <button class="otp-close-btn" id="closeOtpModal">&times;</button>
      </div>
    `;

    // Add OTP modal styles
    const otpStyles = document.createElement('style');
    otpStyles.textContent = `
      .otp-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .otp-modal {
        background: rgba(90, 90, 90, 0.15);
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
        border-radius: 24px;
        padding: 40px 48px;
        width: 550px;
        max-width: 90vw;
        border: 1px solid #7EA2D4;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .otp-header h3 {
        color: #ffffff;
        font-size: 1.6rem;
        margin: 0 0 12px 0;
        text-align: center;
        font-weight: 600;
      }

      .otp-header p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 1rem;
        margin: 0 0 10px 0;
        text-align: center;
        line-height: 1.5;
      }

      .otp-header p.bot-instruction {
        color: rgba(255, 255, 255, 0.65);
        font-size: 0.9rem;
        margin: 0 0 24px 0;
      }

      .otp-header strong {
        color: #7EA2D4;
        font-weight: 600;
      }

      .otp-actions-telegram {
        margin-bottom: 16px;
      }

      .telegram-bot-btn {
        width: 100%;
        padding: 16px 24px;
        background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
        border: none;
        border-radius: 25px;
        color: #ffffff;
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        box-shadow: 0 6px 16px rgba(0, 136, 204, 0.4);
      }

      .telegram-bot-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 136, 204, 0.4);
        background: linear-gradient(135deg, #0099dd 0%, #0077aa 100%);
      }

      .telegram-bot-btn:active {
        transform: translateY(0px);
      }

      .telegram-bot-btn svg {
        width: 20px;
        height: 20px;
      }

      .otp-divider {
        text-align: center;
        margin: 16px 0;
        position: relative;
      }

      .otp-divider::before,
      .otp-divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
      }

      .otp-divider::before {
        left: 0;
      }

      .otp-divider::after {
        right: 0;
      }

      .otp-divider span {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.85rem;
        background: rgba(90, 90, 90, 0.1);
        padding: 0 12px;
        position: relative;
      }

      .otp-input-container {
        margin-bottom: 28px;
      }

      .otp-input {
        width: 100%;
        padding: 16px 20px;
        background: rgba(60, 60, 80, 0.6);
        border: 2px solid #7EA2D4;
        border-radius: 25px;
        color: #ffffff;
        font-size: 1.4rem;
        text-align: center;
        letter-spacing: 6px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
        font-weight: 600;
      }

      .otp-input:focus {
        border-color: #7EA2D4;
        box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
      }

      .otp-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .otp-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }

      .otp-verify-btn {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #7EA2D4 0%, #5A85C7 100%);
        color: #ffffff;
        box-shadow: 0 6px 16px rgba(126, 162, 212, 0.4);
      }

      .otp-verify-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(126, 162, 212, 0.4);
      }

      .otp-verify-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .otp-close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        border-radius: 50%;
      }

      .otp-close-btn:hover {
        color: rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }
    `;

    document.head.appendChild(otpStyles);
    document.body.appendChild(otpModal);

    // Get OTP modal elements
    const otpInput = document.getElementById('otpCodeInput');
    const verifyBtn = document.getElementById('verifyOtpBtn');
    const closeBtn = document.getElementById('closeOtpModal');
    const telegramBtn = document.getElementById('openTelegramBot');

    // Open Telegram Bot
    telegramBtn.addEventListener('click', () => {
      // Open Telegram bot in new tab
      window.open('https://t.me/DarsLinkeer_bot', '_blank');
      
      // Focus on OTP input after opening bot
      setTimeout(() => {
        otpInput.focus();
      }, 500);
    });

    // Focus on input
    setTimeout(() => otpInput.focus(), 100);

    // Auto-format OTP input (only numbers)
    otpInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Verify OTP
    verifyBtn.addEventListener('click', async () => {
      const otpCode = otpInput.value.trim();
      if (otpCode.length !== 6) {
        showErrorToast('Iltimos, 6 raqamli OTP kodni kiriting');
        return;
      }

      verifyBtn.textContent = 'Tekshirilmoqda...';
      verifyBtn.disabled = true;

      try {
        const result = await apiService.verifyRegistrationOtp(identifier, otpCode);
        if (result.success) {
          // Check if auto-login data is provided (new format)
          if (result.accessToken && result.user) {
            // Auto-login after verification

            // Clear old data from both localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // Save new user data and tokens
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            localStorage.setItem('isAuthenticated', 'true');

            // Also save to sessionStorage for dashboard compatibility
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            sessionStorage.setItem('accessToken', result.accessToken);
            sessionStorage.setItem('isAuthenticated', 'true');

            showSuccessToast('Ro\'yxatdan o\'tish yakunlandi va avtomatik kirdingiz!');
          } else {
            // Old format - just show success message
            showSuccessToast('Ro\'yxatdan o\'tish yakunlandi!');
          }

          // Clear session storage
          sessionStorage.removeItem('registrationIdentifier');
          sessionStorage.removeItem('awaitingOtpVerification');
          sessionStorage.removeItem('registerIdentifier');
          sessionStorage.removeItem('registerMode');

          // Close modal and reset form
          document.body.removeChild(otpModal);
          document.head.removeChild(otpStyles);

          // Reset form inputs
          firstNameInput.value = '';
          lastNameInput.value = '';
          phoneInput.value = '';
          passwordInput.value = '';
          confirmPasswordInput.value = '';

          // Navigate to dashboard after successful registration
          setTimeout(() => {
            router.navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        showErrorToast(error.message || 'OTP tasdiqlashda xatolik yuz berdi');
      } finally {
        verifyBtn.textContent = 'Tasdiqlash';
        verifyBtn.disabled = false;
      }
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(otpModal);
      document.head.removeChild(otpStyles);
    });

    // Close on overlay click
    otpModal.addEventListener('click', (e) => {
      if (e.target === otpModal) {
        document.body.removeChild(otpModal);
        document.head.removeChild(otpStyles);
      }
    });

    // Enter key to verify
    otpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && otpInput.value.length === 6) {
        verifyBtn.click();
      }
    });
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