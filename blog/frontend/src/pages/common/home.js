import { router } from '../../utils/router.js';
import { store } from '../../utils/store.js';

export function initHomePage() {
  const app = document.querySelector('#app');

  // Make router available globally for onclick handlers
  window.router = router;

  app.innerHTML = `
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="nav-brand">
          <img src="/images/darslinker.png" alt="Dars Linker" class="logo" />
        </div>

        <nav class="nav-menu">
          <a href="#" class="nav-item">Asosiy</a>
          <a href="#" class="nav-item">Ma'lumot</a>
          <a href="#" class="nav-item">Tariflar</a>
          <a href="#" class="nav-item">Bloglar</a>
          <a href="#" class="nav-item">Aloqa</a>
        </nav>

        <div class="header-actions">
          <div class="language-selector">
            <div class="lang-dropdown">
              <div class="lang-selected" id="langSelected">
                <img src="/images/uz-flag.jpg" alt="UZ" class="flag-img" />
                <span>UZ</span>
                <span class="dropdown-arrow">▼</span>
              </div>
              <div class="lang-options" id="langOptions">
                <div class="lang-option" data-lang="en" data-flag="/images/us-flag.png">
                  <img src="/images/us-flag.png" alt="EN" class="flag-img" />
                  <span>EN</span>
                </div>
                <div class="lang-option" data-lang="ru" data-flag="/images/ru-flag.jpg">
                  <img src="/images/ru-flag.jpg" alt="RU" class="flag-img" />
                  <span>RU</span>
                </div>
                <div class="lang-option active" data-lang="uz" data-flag="/images/uz-flag.jpg">
                  <img src="/images/uz-flag.jpg" alt="UZ" class="flag-img" />
                  <span>UZ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Light/Dark Mode Toggle -->
          <div class="theme-toggle" id="themeToggle">
            <div class="toggle-container">
              <!-- Sun Icon -->
              <svg class="theme-icon sun-icon active" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>

              <!-- Moon Icon -->
              <svg class="theme-icon moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <button class="login-btn" onclick="router.navigate('/login'); return false;">Kirish</button>
        </div>
      </div>
    </header>


    <!-- Course Articles Section -->
    <section class="articles-section">
      <div class="container">
        <h2 class="section-title">O'qituvchilar uchun ma'qolalar</h2>

        <div class="articles-grid">
         <div class="samarali-dars-decoration">
              <img src="/images/0010 1.png" alt="Samarali Dars Decoration" class="samarali-dars-image">
            </div>
          <!-- Article Card 1 -->
          <div class="article-card samarali-dars-card">
           
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>

          <!-- Article Card 2 -->
          <div class="article-card">
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>

          <!-- Article Card 3 -->
          <div class="article-card">
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>

          <!-- Article Card 4 -->
          <div class="article-card">
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>

          <!-- Article Card 5 -->
          <div class="article-card">
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>
            <div class="oxirgi-dars-decoration">
              <img src="/images/0005 1.png" alt="Oxirgi Dars Decoration" class="oxirgi-dars-image">
            </div>
          <!-- Article Card 6 -->
          <div class="article-card oxirgi-dars-card">
           
            <div class="article-header">
              <h3>Samarali Dars</h3>
            </div>
            <div class="article-content">
              <p>Samarali dars o'tish uchun qaysi usullar haqida batafsil ma'lumot berigan ma'qola</p>
            </div>
            <div class="article-meta">
              <div class="article-stats">
                <span class="views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  1,245
                </span>
                <span class="date">10.01.2024</span>
              </div>
            </div>
          </div>
        </div>

        <div class="articles-action">
          <button class="btn-blog">BLOG BO'LIMIGA O'TISH</button>
        </div>
      </div>
    </section>

    <!-- Advice Section -->
    <section class="advice-section">
      <div class="container">
        <div class="advice-card">


      </div>
    </div>

  `;

  // Initialize glittering effects and interactions
  initHomePageEffects();

  // Initialize neon dots
  createNeonDots();

  // Initialize 3D play button
  init3DPlayButton();

  // Initialize header scroll effects
  initHeaderScrollEffects();

  // Initialize theme toggle
  initThemeToggle();

  // Initialize SMS contact
  initSMSContact();

  // Initialize navigation
  initNavigation();

  // Update store
  store.setState({ currentPage: 'home' });
}

function initHomePageEffects() {
  // Initialize language dropdown
  initLanguageDropdown();

  // Add enhanced glittering to 3D elements on hover
  const glitterElements = document.querySelectorAll('.glitter-animation');

  glitterElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.animationDuration = '1s';
      this.style.filter = 'brightness(1.5) drop-shadow(0 0 30px rgba(107, 123, 255, 1))';
    });

    element.addEventListener('mouseleave', function() {
      this.style.animationDuration = '3s';
      this.style.filter = '';
    });
  });

  // Add particle effect on click for 3D elements
  glitterElements.forEach(element => {
    element.addEventListener('click', function(e) {
      createParticleEffect(e.clientX, e.clientY);
    });
  });

  // Enhanced button interactions
  const buttons = document.querySelectorAll('.btn-primary, .btn-outline, .login-btn, .video-btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // Add ripple effect to buttons
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Dynamic floating elements
  const floatingElements = document.querySelectorAll('.floating-element');
  floatingElements.forEach((element, index) => {
    // Add random movement variation
    setInterval(() => {
      const randomX = Math.random() * 20 - 10;
      const randomY = Math.random() * 20 - 10;
      element.style.transform += ` translate(${randomX}px, ${randomY}px)`;
    }, 5000 + index * 1000);
  });

  // Parallax effect for hero section
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero3d = document.querySelector('.hero-3d');
    const platform3d = document.querySelector('.platform-3d');

    if (hero3d) {
      hero3d.style.transform = `translateY(${scrolled * 0.1}px) rotate(${scrolled * 0.1}deg)`;
    }

    if (platform3d) {
      platform3d.style.transform = `translateY(${scrolled * -0.05}px) rotate(${scrolled * -0.05}deg)`;
    }
  });

  // Add CSS for animations if not already present
  if (!document.querySelector('#home-effects-styles')) {
    const style = document.createElement('style');
    style.id = 'home-effects-styles';
    style.textContent = `
      @keyframes particleExplosion {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--vx), var(--vy)) scale(0);
          opacity: 0;
        }
      }

      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Language dropdown initialization
function initLanguageDropdown() {
  const langSelected = document.getElementById('langSelected');
  const langOptions = document.getElementById('langOptions');
  const langDropdown = document.querySelector('.lang-dropdown');

  if (!langSelected || !langOptions || !langDropdown) {
    console.log('Language dropdown elements not found');
    return;
  }

  // Toggle dropdown
  langSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('open');
  });

  // Handle language selection
  langOptions.addEventListener('click', (e) => {
    const langOption = e.target.closest('.lang-option');
    if (!langOption) return;

    // Remove active class from all options
    langOptions.querySelectorAll('.lang-option').forEach(option => {
      option.classList.remove('active');
    });

    // Add active class to selected option
    langOption.classList.add('active');

    // Update selected display
    const flag = langOption.querySelector('.flag-img').src;
    const text = langOption.querySelector('span').textContent;
    const lang = langOption.dataset.lang;

    langSelected.querySelector('.flag-img').src = flag;
    langSelected.querySelector('span').textContent = text;

    // Store selected language
    localStorage.setItem('selectedLanguage', lang);

    // Close dropdown
    langDropdown.classList.remove('open');

    // Update page language attribute
    document.documentElement.lang = lang;
    console.log('Language changed to:', lang);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    langDropdown.classList.remove('open');
  });

  // Load saved language on init
  loadSavedLanguage();
}

// Load saved language preference
function loadSavedLanguage() {
  const savedLang = localStorage.getItem('selectedLanguage');
  if (!savedLang) return;

  const langOption = document.querySelector(`[data-lang="${savedLang}"]`);
  if (!langOption) return;

  // Update UI to match saved language
  const langSelected = document.getElementById('langSelected');
  const flag = langOption.querySelector('.flag-img').src;
  const text = langOption.querySelector('span').textContent;

  langSelected.querySelector('.flag-img').src = flag;
  langSelected.querySelector('span').textContent = text;

  // Update active state
  document.querySelectorAll('.lang-option').forEach(option => {
    option.classList.remove('active');
  });
  langOption.classList.add('active');
}

// Particle effect function
function createParticleEffect(x, y) {
  const particles = 15;

  for (let i = 0; i < particles; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: linear-gradient(45deg, #6b7bff, #ffffff);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: particleExplosion 1s ease-out forwards;
    `;

    const angle = (i / particles) * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    particle.style.setProperty('--vx', vx + 'px');
    particle.style.setProperty('--vy', vy + 'px');

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Create animated neon dots
function createNeonDots() {
  const container = document.getElementById('neonDotsContainer');
  if (!container) return;

  // Strategic positions for 8 dots
  const positions = [
    { x: 15, y: 20 },    // Top left corner area
    { x: 85, y: 15 },    // Top right corner area
    { x: 20, y: 75 },    // Bottom left area
    { x: 75, y: 80 },    // Bottom right area
    { x: 45, y: 35 },    // Center-top area
    { x: 60, y: 65 },    // Center-bottom area
    { x: 5, y: 90 },     // Bottom left corner
    { x: 90, y: 85 }     // Bottom right corner
  ];

  const colors = ['blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white'];
  const animations = ['blink', 'pulse', 'blink', 'blink', 'pulse', 'blink', 'pulse', 'blink'];

  positions.forEach((pos, i) => {
    const dot = document.createElement('div');
    dot.className = 'neon-dot';

    if (colors[i] === 'white') {
      dot.classList.add('white');
    }

    dot.classList.add(animations[i]);

    // Position the dot
    dot.style.left = pos.x + '%';
    dot.style.top = pos.y + '%';

    // Staggered animation delays
    dot.style.animationDelay = (i * 2) + 's';

    container.appendChild(dot);
  });
}

// Initialize 3D play button functionality
function init3DPlayButton() {
  const playButton = document.querySelector('.play-button-3d');
  if (!playButton) return;

  playButton.addEventListener('click', function() {
    // Add click animation
    this.style.transform = 'scale(0.9)';

    setTimeout(() => {
      this.style.transform = '';
    }, 150);

    // Here you can add functionality like opening a video modal
    console.log('Play button clicked - add your video functionality here');

    // Example: scroll to video section or open modal
    const videoSection = document.querySelector('.video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Add pulse animation
  playButton.addEventListener('mouseenter', function() {
    this.style.animation = 'pulse 2s infinite';
  });

  playButton.addEventListener('mouseleave', function() {
    this.style.animation = '';
  });
}

// Initialize header scroll effects
function initHeaderScrollEffects() {
  const header = document.querySelector('.header');
  if (!header) return;

  let scrollTimeout;

  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;

    // Smooth blur effect based on scroll
    if (scrollY > 50) {
      header.style.background = 'rgba(90, 90, 90, 0.15)';
      header.style.backdropFilter = 'blur(30px) saturate(200%)';
      header.style.webkitBackdropFilter = 'blur(30px) saturate(200%)';
    } else {
      header.style.background = 'rgba(90, 90, 90, 0.1)';
      header.style.backdropFilter = 'blur(25px) saturate(180%)';
      header.style.webkitBackdropFilter = 'blur(25px) saturate(180%)';
    }

    // Clear previous timeout
    clearTimeout(scrollTimeout);

    // Add scroll indicator
    header.classList.add('scrolling');

    // Remove scroll indicator after scrolling stops
    scrollTimeout = setTimeout(() => {
      header.classList.remove('scrolling');
    }, 150);
  });
}

// Initialize theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = themeToggle?.querySelector('.sun-icon');
  const moonIcon = themeToggle?.querySelector('.moon-icon');

  if (!themeToggle || !sunIcon || !moonIcon) return;

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  let isDark = savedTheme === 'dark';

  // Set initial state
  if (isDark) {
    sunIcon.classList.remove('active');
    moonIcon.classList.add('active');
  }

  themeToggle.addEventListener('click', function() {
    // Toggle theme
    isDark = !isDark;

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Switch icons with animation
    const currentIcon = isDark ? sunIcon : moonIcon;
    const nextIcon = isDark ? moonIcon : sunIcon;

    // Fade out current icon
    currentIcon.classList.remove('active');

    // Add switching animation to next icon
    nextIcon.classList.add('switching');
    nextIcon.classList.add('active');

    // Remove switching class after animation
    setTimeout(() => {
      nextIcon.classList.remove('switching');
    }, 400);

    // Console log for future implementation
    console.log(`Theme switched to: ${isDark ? 'dark' : 'light'} mode`);

    // Here you can add actual theme switching logic later
    // For now, just visual toggle
  });

  // Add hover sound effect (optional)
  themeToggle.addEventListener('mouseenter', function() {
    // You can add sound effects here later
  });
}

// Advice Form Submission
window.submitAdviceForm = function(event) {
  event.preventDefault();

  const name = document.getElementById('adviceName').value;
  const phone = document.getElementById('advicePhone').value;
  const comment = document.getElementById('adviceComment').value;

  // Validation
  if (!name.trim() || !phone.trim()) {
    alert('Iltimos, ism va telefon raqamini kiriting!');
    return;
  }

  // Basic phone validation
  const phoneRegex = /^[\+]?[0-9\-\(\)\s]+$/;
  if (!phoneRegex.test(phone)) {
    alert('Iltimos, to\'g\'ri telefon raqam kiriting!');
    return;
  }

  // Show success message
  alert(`Rahmat, ${name}! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.`);

  // Here you would typically send the data to your backend
  console.log('Advice form submitted:', { name, phone, comment });

  // Reset form
  event.target.reset();

  // Add success animation to submit button
  const submitBtn = document.querySelector('.advice-submit');
  if (submitBtn) {
    const originalText = submitBtn.textContent;
    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    submitBtn.textContent = 'Yuborildi ✓';

    setTimeout(() => {
      submitBtn.style.background = '';
      submitBtn.textContent = originalText;
    }, 3000);
  }
};

// Initialize SMS Contact functionality
function initSMSContact() {
  const smsContact = document.getElementById('smsContact');

  if (!smsContact) return;

  smsContact.addEventListener('click', function() {
    // Add click animation
    const container = this.querySelector('.sms-container');
    container.style.transform = 'scale(0.9)';

    setTimeout(() => {
      container.style.transform = '';
    }, 150);

    // Open SMS or contact modal
    const phoneNumber = '+998901234567'; // You can change this number
    const message = 'Salom! Darslinker haqida ma\'lumot olishni xohlayman.';

    // Try to open SMS app if on mobile, otherwise show contact info
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    } else {
      // For desktop, show a nice alert with contact info
      alert(`Biz bilan bog'lanish:\n\nTelefon: ${phoneNumber}\nYoki Telegram: @darslinker\n\nXabar: ${message}`);
    }

    console.log('SMS contact clicked');
  });

  // Add hover sound effect (optional)
  smsContact.addEventListener('mouseenter', function() {
    // You can add sound effects here later
  });
}

// Initialize Navigation functionality
function initNavigation() {
  const logo = document.querySelector('.logo');
  const navItems = document.querySelectorAll('.nav-item');

  // Add navigation styles if not already present
  addNavigationStyles();

  // Logo click handler - scroll to top (Hero section)
  if (logo) {
    logo.addEventListener('click', function(e) {
      e.preventDefault();
      scrollToSection('hero');
    });
    // Make logo clickable
    logo.style.cursor = 'pointer';
  }

  // Navigation menu items
  navItems.forEach((item, index) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      const text = this.textContent.trim();

      switch (text) {
        case 'Asosiy':
          scrollToSection('hero');
          break;
        case 'Ma\'lumot':
          scrollToSection('platform-features');
          break;
        case 'Tariflar':
          scrollToSection('pricing-section');
          break;
        case 'Bloglar':
          scrollToSection('articles-section');
          break;
        case 'Aloqa':
          scrollToSection('advice-section');
          break;
        default:
          console.log('Unknown navigation item:', text);
      }
    });
  });

  // Initialize footer navigation
  initFooterNavigation();
}

// Smooth scroll to section
function scrollToSection(sectionClass) {
  const section = document.querySelector(`.${sectionClass}`);
  if (section) {
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    const sectionTop = section.offsetTop - headerHeight - 20; // 20px extra padding

    window.scrollTo({
      top: sectionTop,
      behavior: 'smooth'
    });
  }
}


// Add navigation styles
function addNavigationStyles() {
  if (document.querySelector('#navigation-styles')) return;

  const style = document.createElement('style');
  style.id = 'navigation-styles';
  style.textContent = `
    /* Only keep smooth scroll behavior and logo cursor */
    html {
      scroll-behavior: smooth;
    }

    /* Logo hover effect */
    .logo {
      transition: all 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
      filter: brightness(1.1);
    }
  `;

  document.head.appendChild(style);
}

// Initialize footer navigation
function initFooterNavigation() {
  const footerNavItems = document.querySelectorAll('.footer-nav-item');

  footerNavItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const text = this.textContent.trim();

      // Only handle internal navigation, let external links work normally
      if (text === 'Kirish' || text === 'Ommaviy oferta') {
        return; // Let these links work as normal
      }

      e.preventDefault();

      switch (text) {
        case 'Asosiy sahifa':
          scrollToSection('hero');
          break;
        case 'Ma\'lumot':
          scrollToSection('platform-features');
          break;
        case 'Tariflar':
          scrollToSection('pricing-section');
          break;
        case 'Aloqa':
          scrollToSection('advice-section');
          break;
        default:
          console.log('Unknown footer navigation item:', text);
      }

      // Scroll to top first to ensure visibility
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      // Then scroll to the specific section after a small delay
      setTimeout(() => {
        switch (text) {
          case 'Asosiy sahifa':
            scrollToSection('hero');
            break;
          case 'Ma\'lumot':
            scrollToSection('platform-features');
            break;
          case 'Tariflar':
            scrollToSection('pricing-section');
            break;
          case 'Aloqa':
            scrollToSection('advice-section');
            break;
        }
      }, 100);
    });
  });
}