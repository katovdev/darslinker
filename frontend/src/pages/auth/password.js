import { router } from '../../utils/router.js';
import { apiService } from '../../utils/api.js';

export function initPasswordPage() {
  const app = document.querySelector('#app');

  // Prevent scrolling on body
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';

  // Make router available globally
  window.router = router;

  // Get user data from session storage
  const userData = JSON.parse(sessionStorage.getItem('tempUserData') || '{}');
  const userIdentifier = sessionStorage.getItem('userIdentifier') || '';

  app.innerHTML = `
    <!-- Password Page -->
    <div class="password-page">
      <!-- Background -->
      <div class="password-background"></div>



      <!-- Logo -->
      <div class="password-logo">
        <h1>dars<span>linker</span></h1>
      </div>

      <!-- Password Modal -->
      <div class="password-modal">
        <div class="password-card">
          <h2 class="user-name">${capitalizeFirstLetter(userData.firstName)} ${capitalizeFirstLetter(userData.lastName)}</h2>

          <!-- Password Input Section -->
          <div class="password-input-section">
            <label class="password-label">Parol</label>
            <div class="password-input-wrapper">
              <input
                type="password"
                class="password-input password-input-field"
                placeholder="Parolingizni kiriting"
                id="passwordInput"
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
          </div>

          <!-- Forgot Password Link -->
          <div class="forgot-password-section">
            <a href="#" class="forgot-password-link" id="forgotPasswordLink">
              Parolni unutdingizmi?
            </a>
          </div>

          <!-- Login Button -->
          <button class="password-submit-btn" id="passwordSubmit">
            Kirish
          </button>
        </div>
      </div>
    </div>
  `;

  // Add password page styles
  addPasswordPageStyles();

  // Initialize password page functionality
  initPasswordPageFunctionality(userIdentifier);
}

function addPasswordPageStyles() {
  // Check if styles already exist
  if (document.querySelector('#password-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'password-page-styles';
  style.textContent = `
    .password-page {
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

    body:has(.password-page) {
      overflow: hidden;
      height: 100vh;
    }

    .password-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #232323;
      z-index: -1;
    }



    .password-logo {
      margin-bottom: 30px;
      text-align: center;
      transform: translateY(-120px);
    }

    .password-logo h1 {
      font-size: 2.5rem;
      font-weight: 300;
      color: #ffffff;
      margin: 0;
      letter-spacing: 2px;
    }

    .password-logo span {
      color: #7EA2D4;
      font-weight: 500;
    }

    .password-modal {
      position: relative;
      z-index: 10;
      transform: translateY(-120px);
    }

    .password-card {
      background: rgba(90, 90, 90, 0.1);
      backdrop-filter: blur(50px);
      -webkit-backdrop-filter: blur(50px);
      border-radius: 24px;
      padding: 40px;
      width: 550px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      border: 1px solid #7EA2D4;
    }

    .user-name {
      text-align: center;
      font-size: 1.8rem;
      font-weight: 500;
      color: #ffffff;
      margin: 0 0 10px 0;
    }

    .password-input-section {
      margin-bottom: 16px;
    }

    .forgot-password-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .forgot-password-link {
      color: #7EA2D4;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .forgot-password-link:hover {
      color: #5A85C7;
      text-decoration: underline;
    }

    .password-label {
      display: block;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .password-input {
      width: 100%;
      padding: 16px 20px;
      background: rgba(60, 60, 80, 0.5);
      border: 1px solid #7EA2D4;
      border-radius: 25px;
      color: #ffffff;
      font-size: 0.95rem;
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
      padding-right: 55px;
    }

    .password-toggle-btn {
      position: absolute;
      right: 16px;
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

    .password-input:focus {
      border-color: #7EA2D4;
      box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1);
    }

    .password-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Override browser autocomplete styles */
    .password-input:-webkit-autofill,
    .password-input:-webkit-autofill:hover,
    .password-input:-webkit-autofill:focus,
    .password-input:-webkit-autofill:active,
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

    .password-submit-btn {
      width: 120px;
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

    .password-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(126, 162, 212, 0.4);
    }

    .password-submit-btn:active {
      transform: translateY(0px);
    }

    .password-submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    /* Toast Notification */
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

    /* Responsive Design */
    @media (max-width: 768px) {
      /* Hide all 3D elements */

      .password-card {
        width: 90vw;
        max-width: 450px;
        padding: 32px 24px;
      }

      .password-logo {
        margin-bottom: 25px;
        transform: translateY(-20px);
      }

      .password-modal {
        transform: translateY(-20px);
      }

      .password-logo h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .password-card {
        padding: 24px 20px;
      }

      .password-logo {
        margin-bottom: 20px;
        transform: translateY(-15px);
      }

      .password-modal {
        transform: translateY(-15px);
      }

      .password-input {
        padding: 14px 16px;
      }
    }
  `;

  document.head.appendChild(style);
}

function initPasswordPageFunctionality(userIdentifier) {
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const passwordToggle = document.getElementById('passwordToggle');

  // Focus on password input
  passwordInput.focus();

  // Password toggle functionality
  passwordToggle.addEventListener('click', () => {
    togglePasswordVisibility(passwordInput, passwordToggle);
  });

  // Handle forgot password click
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showErrorToast('SMS tasdiqlash tez orada qo\'shiladi');
  });

  // Handle Enter key press
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  });

  // Handle form submission
  passwordSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    handlePasswordSubmit();
  });

  function handlePasswordSubmit() {
    const passwordValue = passwordInput.value.trim();

    if (!passwordValue) {
      showErrorToast('Iltimos, parolingizni kiriting!');
      return;
    }

    // Add loading state
    passwordSubmit.textContent = 'Kirilmoqda...';
    passwordSubmit.disabled = true;

    // Authenticate using real API
    apiService.login(userIdentifier, passwordValue, { skipErrorHandler: true })
      .then(response => {
        console.log('Login response:', response);

        if (response.success) {
          // Show success toast
          showSuccessToast('Kirish muvaffaqiyatli!');

          console.log('User data from response:', response.user);

          // Store tokens and user data
          localStorage.setItem('accessToken', response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          // Make sure user data exists before storing
          if (response.user) {
            sessionStorage.setItem('currentUser', JSON.stringify(response.user));
            console.log('User data stored in sessionStorage');
          } else {
            console.error('No user data in response!');
          }

          sessionStorage.removeItem('tempUserData');
          sessionStorage.removeItem('userIdentifier');

          // Reset button state and navigate to dashboard
          passwordSubmit.textContent = 'Kirish';
          passwordSubmit.disabled = false;
          passwordInput.value = '';

          // Navigate to dashboard after short delay
          setTimeout(() => {
            // Restore body scroll before navigation
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.paddingTop = '';

            // Clear the app content before navigation
            document.querySelector('#app').innerHTML = '';

            router.navigate('/dashboard');
          }, 1500);
        }
      })
      .catch(error => {
        console.error('Login error:', error);

        // Show specific error message
        let errorMessage = 'Parol noto\'g\'ri! Qaytadan urinib ko\'ring.';
        if (error.message.includes('Invalid credentials') || error.message.includes('password')) {
          errorMessage = 'Parol noto\'g\'ri! Qaytadan urinib ko\'ring.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Foydalanuvchi topilmadi!';
        } else {
          errorMessage = 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.';
        }

        showErrorToast(errorMessage);

        // Reset button state
        passwordSubmit.textContent = 'Kirish';
        passwordSubmit.disabled = false;
        passwordInput.value = '';
        passwordInput.focus();
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

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
