import { router } from '../../utils/router.js';
import { store } from '../../utils/store.js';

export function initHomePage() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="nav-brand">
          <img src="/src/assets/images/darslinker.png" alt="Dars Linker" class="logo" />
        </div>

        <nav class="nav-menu">
          <div class="language-selector">
            <div class="lang-dropdown">
              <div class="lang-selected" id="langSelected">
                <img src="/src/assets/images/uz-flag.jpg" alt="UZ" class="flag-img" />
                <span>UZ</span>
                <span class="dropdown-arrow">▼</span>
              </div>
              <div class="lang-options" id="langOptions">
                <div class="lang-option" data-lang="en" data-flag="/src/assets/images/us-flag.png">
                  <img src="/src/assets/images/us-flag.png" alt="EN" class="flag-img" />
                  <span>EN</span>
                </div>
                <div class="lang-option" data-lang="ru" data-flag="/src/assets/images/ru-flag.jpg">
                  <img src="/src/assets/images/ru-flag.jpg" alt="RU" class="flag-img" />
                  <span>RU</span>
                </div>
                <div class="lang-option active" data-lang="uz" data-flag="/src/assets/images/uz-flag.jpg">
                  <img src="/src/assets/images/uz-flag.jpg" alt="UZ" class="flag-img" />
                  <span>UZ</span>
                </div>
              </div>
            </div>
          </div>
          <a href="#" class="nav-item">Asosiy</a>
          <a href="#" class="nav-item">Ma'lumot</a>
          <a href="#" class="nav-item">Tariflar</a>
          <a href="#" class="nav-item">Bloglar</a>
          <a href="#" class="nav-item">Aloqa</a>
        </nav>

        <button class="login-btn" onclick="router.navigate('/login'); return false;">Kirish</button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-container">
            <h1 class="hero-title">Online Ta'limni Biz Bilan Boshlang</h1>
            <div class="hero-actions">
              <button class="btn-primary" onclick="router.navigate('/register'); return false;">BEPUL SINAB KO'RISH</button>
              <div class="stats-badge">
                <span class="stats-number">70+</span>
                <span class="stats-text">O'quv markazlari bizga ishonch bildiradi!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <h3>Sun'iy intellekt (AI)</h3>
            <p>O'quvchi savollarga avtomatik javob berish, darslarni puylash va ta'lim vazifasi mavzularini aniqlash va yecha maslahat data. Test topshiriqlarida yordam berish.</p>
          </div>

          <div class="feature-card">
            <h3>To'lov integratsiyasi</h3>
            <p>Uzcard, Humo, Visa, Mastercard, Payme, Click bo'yicha to'lov o'quvchi harid qilganiga integratsiya qilinb. Ixtisoriga nark tushinadi.</p>
          </div>

          <div class="feature-card">
            <h3>O'quvchilar tahlili</h3>
            <p>O'quvchilar faoliyatin real vaqt rejimida kuzatish, test, topshiriq natijalarini grafik va diagrammalarga qo'shish, individual kurslarni O'quvchilarga avtomatik tavsiyalanib.</p>
          </div>
        </div>

        <div class="video-section">
          <button class="video-btn">
            <span class="play-icon">▶</span>
            Video qo'llanmani ko'rish
          </button>
        </div>
      </div>
    </section>

    <!-- Platform Features Section -->
    <section class="platform-features">
      <div class="container">
        <h2 class="section-title">Platformaning Asosiy Imkoniyatlari</h2>

        <div class="platform-features-grid">
          <div class="platform-feature-card">
            <h4>1. Tez va oson kurs joylash</h4>
          </div>
          <div class="platform-feature-card">
            <h4>2. O'quvchilar Nazorati</h4>
          </div>
          <div class="platform-feature-card">
            <h4>3. To'lov tizimi integratsiya</h4>
          </div>

          <div class="platform-feature-card">
            <h4>4. Darslar analitikasi</h4>
          </div>
          <div class="platform-feature-card">
            <h4>5. Sun'iy intellekt</h4>
          </div>
          <div class="platform-feature-card">
            <h4>6. Brendaga moslash</h4>
          </div>

          <div class="platform-feature-card">
            <h4>7. Qo'llab quvvatlash</h4>
          </div>
          <div class="platform-feature-card">
            <h4>8. Ma'lumotlar xavfsizligi</h4>
          </div>
          <div class="platform-feature-card">
            <h4>9. Moliyaviy analitika</h4>
          </div>
        </div>

        <div class="platform-actions">
          <button class="btn-outline" onclick="router.navigate('/register'); return false;">Foydalanish</button>
          <button class="btn-outline">Batafsil</button>
        </div>
      </div>
    </section>

  `;

  // Initialize glittering effects and interactions
  initHomePageEffects();

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