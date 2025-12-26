import { router } from '../../utils/router.js';
import { apiService } from '../../utils/api.js';

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



      <!-- Logo -->
      <div class="login-logo">
        <h1>dars<span>linker</span></h1>
      </div>

      <!-- Login Modal -->
      <div class="login-modal">
        <div class="login-card">
          <h2 class="login-title">Kirish</h2>



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



    .login-logo {
      position: fixed;
      top: 160px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      text-align: center;
      width: 100%;
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
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
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
      padding: 12px 24px 12px 20px;
      background: rgba(70, 70, 90, 0.5);
      border-right: 1px solid #7EA2D4;
      min-width: 110px;
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
      margin-right: 12px;
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



    /* Override browser autocomplete styles */
    .phone-number-input:-webkit-autofill,
    .phone-number-input:-webkit-autofill:hover,
    .phone-number-input:-webkit-autofill:focus,
    .phone-number-input:-webkit-autofill:active {
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
      /* Hide all 3D elements */
      .neon-dots-container {
        display: none !important;
      }

      .login-card {
        width: 90vw;
        max-width: 450px;
        padding: 32px 24px;
      }

      .login-logo {
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
      }

      .login-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
      }

      .login-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .country-selector {
        min-width: 95px;
        padding: 14px 20px 14px 16px;
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
  const phoneContainer = document.getElementById('phoneContainer');
  const inputLabel = document.getElementById('inputLabel');
  const loginSubmit = document.getElementById('loginSubmit');

  // Error elements
  const phoneError = document.getElementById('phoneError');

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





  // Handle form submission
  loginSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    // Only phone mode now
    const isValid = validatePhone();
    if (!isValid) {
      return; // Don't proceed if validation fails
    }

    const phoneInput = document.getElementById('phoneInput');
    const phoneValue = phoneInput.value.trim().replace(/\s/g, '');
    const userIdentifier = '+998' + phoneValue;

    // Add loading state
    loginSubmit.textContent = 'Tekshirilmoqda...';
    loginSubmit.disabled = true;

    // Check if user exists using real API
    apiService.checkUser(userIdentifier)
      .then(response => {
        if (response.exists && response.next === 'login') {
          // User exists and verified, store temp data and go to password page
          sessionStorage.setItem('tempUserData', JSON.stringify(response.user));
          sessionStorage.setItem('userIdentifier', userIdentifier);

          // Restore body scroll before navigation
          document.body.style.overflow = '';
          document.body.style.height = '';

          router.navigate('/password');
        } else if (!response.exists && response.next === 'verify') {
          // User exists but not verified, show OTP verification modal
          showOtpVerificationModal(userIdentifier, response.user);
        } else {
          // User doesn't exist, go to register page
          sessionStorage.setItem('registerIdentifier', userIdentifier);
          sessionStorage.setItem('registerMode', 'phone');

          // Restore body scroll before navigation
          document.body.style.overflow = '';
          document.body.style.height = '';

          router.navigate('/register');
        }

        // Reset button state
        loginSubmit.textContent = 'Kirish';
        loginSubmit.disabled = false;
      })
      .catch(error => {
        console.error('Error checking user:', error);

        // Show error message
        showError(phoneError, 'Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');

        // Reset button state
        loginSubmit.textContent = 'Kirish';
        loginSubmit.disabled = false;
      });
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


}



function showOtpVerificationModal(identifier, user) {
  // Create OTP verification modal
  const otpModal = document.createElement('div');
  otpModal.className = 'otp-modal-overlay';
  otpModal.innerHTML = `
    <div class="otp-modal">
      <div class="otp-header">
        <h3>Tasdiqlash kodi</h3>
        <p>Siz ro'yxatdan o'tgansiz, lekin hisobingiz tasdiqlanmagan.</p>
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
  otpStyles.id = 'otp-modal-styles';
  otpStyles.textContent = `
    .otp-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(circle at 20% 20%, rgba(126, 162, 212, 0.08), transparent 32%),
        radial-gradient(circle at 80% 80%, rgba(126, 162, 212, 0.06), transparent 30%),
        rgba(30, 30, 32, 0.68);
      backdrop-filter: blur(16px) saturate(140%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 12000;
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
      background: linear-gradient(180deg, rgba(35, 35, 35, 0.85), rgba(28, 28, 28, 0.9));
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border-radius: 24px;
      padding: 40px 48px;
      width: 550px;
      max-width: 90vw;
      border: 1px solid rgba(126, 162, 212, 0.5);
      position: relative;
      box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.55),
        0 0 0 1px rgba(255, 255, 255, 0.05);
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
      showToastMessage('Iltimos, 6 raqamli OTP kodni kiriting', 'error');
      return;
    }

    verifyBtn.textContent = 'Tekshirilmoqda...';
    verifyBtn.disabled = true;

    try {
      const result = await apiService.verifyRegistrationOtp(identifier, otpCode);
      if (result.success) {
        showToastMessage('Hisob tasdiqlandi! Endi parol kiriting.', 'success');

        // Close modal
        document.body.removeChild(otpModal);
        const existingStyles = document.getElementById('otp-modal-styles');
        if (existingStyles) {
          document.head.removeChild(existingStyles);
        }

        // Store user data and navigate to password page
        sessionStorage.setItem('tempUserData', JSON.stringify(user));
        sessionStorage.setItem('userIdentifier', identifier);

        // Restore body scroll before navigation
        document.body.style.overflow = '';
        document.body.style.height = '';

        setTimeout(() => {
          router.navigate('/password');
        }, 1500);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showToastMessage('Xato OTP kiritdingiz, qayta urinib ko\'ring.', 'error');
    } finally {
      verifyBtn.textContent = 'Tasdiqlash';
      verifyBtn.disabled = false;
    }
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(otpModal);
    const existingStyles = document.getElementById('otp-modal-styles');
    if (existingStyles) {
      document.head.removeChild(existingStyles);
    }
  });

  // Close on overlay click
  otpModal.addEventListener('click', (e) => {
    if (e.target === otpModal) {
      document.body.removeChild(otpModal);
      const existingStyles = document.getElementById('otp-modal-styles');
      if (existingStyles) {
        document.head.removeChild(existingStyles);
      }
    }
  });

  // Enter key to verify
  otpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && otpInput.value.length === 6) {
      verifyBtn.click();
    }
  });
}

function showToastMessage(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Ensure toast styles always enforce highest z-index (even if previously injected)
  const toastStyleId = 'otp-toast-styles';
  let toastStyles = document.getElementById(toastStyleId);
  const toastCss = `
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      color: #ffffff;
      font-weight: 500;
      z-index: 20000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      pointer-events: none;
    }

    .toast.success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      z-index: 21000;
    }

    .toast.error {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      z-index: 21000;
    }

    .toast.show {
      transform: translateX(0);
    }
  `;

  if (!toastStyles) {
    toastStyles = document.createElement('style');
    toastStyles.id = toastStyleId;
    toastStyles.textContent = toastCss;
    document.head.appendChild(toastStyles);
  } else {
    toastStyles.textContent = toastCss;
  }

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
