import { router } from '../../utils/router.js';
import { store } from '../../utils/store.js';
import { cleanupPricingStyles } from '../pricing.js';

export function initHomePage() {
  // Clean up pricing page styles when returning to home
  cleanupPricingStyles();

  // Scroll to top when page loads
  window.scrollTo(0, 0);

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

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-header-container">
            <h1 class="hero-title">Online Ta'limni Biz Bilan Boshlang</h1>

            <div class="hero-actions">
              <button class="btn-primary" onclick="router.navigate('/register'); return false;">BEPUL SINAB KO'RISH</button>
              <div class="stats-badge">
                <span class="stats-number">70+</span>
                <span class="stats-text">O'quv markazlari bizga ishonch bildiradi!</span>
              </div>
            </div>
          </div>

          <div class="hero-features-grid">
            <div class="hero-feature-card">
              <h3>Sun'iy intellekt (AI)</h3>
              <p>O'quvchi savollarga avtomatik javob berish, darslarni puylash va ta'lim vazifasi mavzularini aniqlash va yecha maslahat data. Test topshiriqlarida yordam berish.</p>
            </div>

            <div class="hero-feature-card">
              <h3>To'lov integratsiyasi</h3>
              <p>Uzcard, Humo, Visa, Mastercard, Payme, Click bo'yicha to'lov o'quvchi harid qilganiga integratsiya qilinb. Ixtisoriga nark tushinadi.</p>
            </div>

            <div class="hero-feature-card analytics-card">
              <h3>O'quvchilar tahlili</h3>
              <p>O'quvchilar faoliyatin real vaqt rejimida kuzatish, test, topshiriq natijalarini grafik va diagrammalarga qo'shish, individual kurslarni O'quvchilarga avtomatik tavsiyalanib.</p>
            </div>
<!-- 3D Analytics Icon - Outside card (clear) -->
              <div class="analytics-3d-icon analytics-outside">
                <img src="/images/3D Black Chrome Shape (25) 1.png" alt="3D Analytics" class="analytics-icon-image-clear" />
              </div>
          </div>

          <div class="hero-video-section">
            <button class="video-btn">
              <div class="play-icon-container">
                <svg class="play-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="rgba(126, 162, 212, 0.1)"/>
                  <polygon points="10,8 16,12 10,16" fill="currentColor"/>
                </svg>
              </div>
              <span class="video-text">Video qo'llanmani ko'rish</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3D Play Button only in Hero Section -->
      <div class="play-button-3d">
        <img src="/images/9 1.png" alt="3D Play Button" class="play-btn-image" />
      </div>
    </section>

    <!-- Platform Features Section -->
    <section class="platform-features">
      <div class="container">
        <h2 class="section-title">Platformaning Asosiy Imkoniyatlari</h2>

        <div class="platform-features-grid">
         <div class="course-3d-icon">
              <img src="/images/3D Black Chrome Shape (3) 1.png" alt="3D Course Icon" class="course-icon-image" />
            </div>
          <div class="platform-feature-card course-card">
            <h4>1. Tez va oson kurs joylash</h4>

            <!-- 3D Course Icon on left side -->
           
          </div>
          <div class="platform-feature-card">
            <h4>2. O'quvchilar Nazorati</h4>
          </div>
          <div class="platform-feature-card">
            <h4>3. To'lov tizimi integratsiya</h4>
          </div>

          <div class="platform-feature-card">
            <h4>4. Onlayn uchrashuvlar</h4>
          </div>
          <div class="platform-feature-card">
            <h4>5. Sun'iy intellekt</h4>
          </div>
          <div class="glass-decoration">
              <img src="/images/gradient glass (20) 1 (1).png" alt="Glass Decoration" class="glass-deco-image" />
            </div>
          <div class="platform-feature-card brending-card">
            <h4>6. Brendaga moslash</h4>

            <!-- Decorative Glass Element next to card -->
            
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

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="container">
        <h2 class="section-title">Tariflar & Narxlar</h2>

        <div class="pricing-grid">
        <div class="minimal-glass-decoration">
              <img src="/images/gradient glass (4) 1.png" alt="Glass Decoration" class="minimal-glass-image">
            </div>
          <!-- Minimal Plan -->
          <div class="pricing-card minimal-card">

            <div class="pricing-header minimal">
              <h3>Minimal</h3>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <span>Kurs joylash soni</span>
                <span class="feature-value">2</span>
              </div>
              <div class="feature-item">
                <span>Admin qo'shish</span>
                <span class="feature-value">3</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bazasi</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>Qo'llab-quvvatlash</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar analitikasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item disabled">
                <span>Onlayn uchrashuv</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>Sertifikat generatsiyasi</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>O'quvchilar bilan chat</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>To'lov tizimi integratsyasi</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>Sun'iy intellekt</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>Kontent xavfsizligi</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>Brendga mos dizayn</span>
                <span class="feature-check">✗</span>
              </div>
            </div>
            <div class="pricing-price minimal">470 000 so'm</div>
          </div>

          <!-- Standard Plan -->
          <div class="pricing-card">
            <span class="tavsiya-badge">Tavsiya</span>
            <div class="pricing-header standard">
              <h3>Standard</h3>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <span>Kurs joylash soni</span>
                <span class="feature-value">4</span>
              </div>
              <div class="feature-item">
                <span>Admin qo'shish</span>
                <span class="feature-value">6</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bazasi</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>Qo'llab-quvvatlash</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar analitikasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Onlayn uchrashuv</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Sertifikat generatsiyasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bilan chat</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>To'lov tizimi integratsyasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Sun'iy intellekt</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item disabled">
                <span>Kontent xavfsizligi</span>
                <span class="feature-check">✗</span>
              </div>
              <div class="feature-item disabled">
                <span>Brendga mos dizayn</span>
                <span class="feature-check">✗</span>
              </div>
            </div>
            <div class="pricing-price standard">870 000 so'm</div>
          </div>

          <!-- Pro Plan -->
          <div class="pricing-card">
            <div class="pricing-header pro">
              <h3>Pro</h3>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <span>Kurs joylash soni</span>
                <span class="feature-value">8</span>
              </div>
              <div class="feature-item">
                <span>Admin qo'shish</span>
                <span class="feature-value">12</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bazasi</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>Qo'llab-quvvatlash</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar analitikasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Onlayn uchrashuv</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Sertifikat generatsiyasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bilan chat</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>To'lov tizimi integratsyasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Sun'iy intellekt</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Kontent xavfsizligi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Brendga mos dizayn</span>
                <span class="feature-check">✓</span>
              </div>
            </div>
            <div class="pricing-price pro">1 270 000 so'm</div>
          </div>

               <div class="korporativ-glass-decoration">
              <img src="/images/gradient glass (5) 1.png" alt="Glass Decoration" class="korporativ-glass-image">
            </div>
          <!-- Korporativ Plan -->
          <div class="pricing-card korporativ-card">
       
            <div class="pricing-header korporativ">
              <h3>Korporativ</h3>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <span>Kurs joylash soni</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>Admin qo'shish</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bazasi</span>
                <span class="feature-value">∞</span>
              </div>
              <div class="feature-item">
                <span>Qo'llab-quvvatlash</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Shaxsiy Domein</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Onlayn uchrashuv</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Pro tarif imkoniyatlari</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>SEO - Google'da qidiruv</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>O'quvchilar bilan chat</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>To'lov tizimi integratsyasi</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Sun'iy intellekt</span>
                <span class="feature-check">✓</span>
              </div>
              <div class="feature-item">
                <span>Kontent xavfsizligi</span>
                <span class="feature-check">✓</span>
              </div>
            </div>
            <div class="pricing-price korporativ">Maxsus narx</div>
          </div>
        </div>

        <div class="pricing-action">
          <button class="btn-pricing" onclick="router.navigate('/pricing'); return false;">Ta'riflar bo'yicha to'liq ma'lumot</button>
        </div>
      </div>
    </section>

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


          <h2 class="advice-title">Maslahat olish</h2>
          <form class="advice-form" onsubmit="submitAdviceForm(event)">
            <div class="form-row">
              <div class="form-group">
                <input
                  type="text"
                  class="form-input"
                  placeholder="Ismingiz"
                  required
                  id="adviceName"
                />
              </div>
              <div class="form-group">
                <input
                  type="tel"
                  class="form-input"
                  placeholder="Raqamingiz"
                  required
                  id="advicePhone"
                />
              </div>
            </div>
            <div class="form-group">
              <textarea
                class="form-input form-textarea"
                placeholder="Izoh"
                id="adviceComment"
              ></textarea>
            </div>
            <button type="submit" class="advice-submit">Yuborish</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Login Section -->
    <section class="login-section">
      <div class="container">
        <button class="btn-login-main" onclick="router.navigate('/login'); return false;">Tizimga Kirish</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <!-- Logo -->
          <div class="footer-logo-section">
            <img src="/images/darslinker.png" alt="Darslinker" class="footer-logo-img" />
          </div>

          <!-- Navigation -->
          <nav class="footer-nav">
            <a href="#" class="footer-nav-item">Asosiy sahifa</a>
            <a href="#" class="footer-nav-item">Ma'lumot</a>
            <a href="#" class="footer-nav-item">Tariflar</a>
            <a href="#" class="footer-nav-item">Aloqa</a>
            <a href="#" class="footer-nav-item">Ommaviy oferta</a>
            <a href="#" class="footer-nav-item" onclick="router.navigate('/login'); return false;">Kirish</a>
          </nav>

          <!-- Payment Methods -->
          <div class="payment-methods">
            <img src="/images/Group 47.png" alt="Uzum" class="payment-logo" />
            <img src="/images/Group 39.png" alt="Payme" class="payment-logo" />
            <img src="/images/Group 38.png" alt="Click" class="payment-logo" />
            <img src="/images/Group 48.png" alt="Mastercard" class="payment-logo" />
            <img src="/images/Group 36.png" alt="Visa" class="payment-logo" />
          </div>

          <!-- Contact Info -->
          <div class="footer-contact">
            <div class="footer-contact-item">
              <svg class="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Toshkent shahar, Chilonzor tumani, 12-kvartal</span>
            </div>
            <div class="footer-contact-item">
              <svg class="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>+998 90 123 45 67</span>
            </div>
          </div>

          <!-- Social Links -->
          <div class="social-links">
            <a href="#" class="social-link instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="social-link telegram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <a href="#" class="social-link facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
              </svg>
            </a>
            <a href="#" class="social-link gmail">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </a>
            <a href="#" class="social-link linkedin">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Darslinker. Barcha huquqlar himoyalangan</p>
        </div>
      </div>
    </footer>

    <!-- Neon Dots Background -->
    <div class="neon-dots-container" id="neonDotsContainer"></div>

    <!-- SMS Contact Button -->
    <div class="sms-contact" id="smsContact">
      <div class="sms-container">
        <svg class="sms-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="#7EA2D4" stroke-width="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="#7EA2D4"/>
          <circle cx="12" cy="10" r="1" fill="#7EA2D4"/>
          <circle cx="16" cy="10" r="1" fill="#7EA2D4"/>
        </svg>
        <div class="sms-pulse"></div>
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

      // Remove active class from all nav items
      navItems.forEach(navItem => navItem.classList.remove('active'));

      // Add active class to clicked item
      this.classList.add('active');

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

  // Initialize scroll-based active detection
  initScrollActiveDetection();

  // Initialize footer navigation
  initFooterNavigation();
}


// Set active navigation item
function setActiveNavItem(activeText) {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.textContent.trim() === activeText) {
      item.classList.add('active');
    }
  });
}

// Scroll-based active section detection
function initScrollActiveDetection() {
  const sections = [
    { element: document.querySelector('.hero'), name: 'Asosiy' },
    { element: document.querySelector('.platform-features'), name: 'Ma\'lumot' },
    { element: document.querySelector('.pricing-section'), name: 'Tariflar' },
    { element: document.querySelector('.articles-section'), name: 'Bloglar' },
    { element: document.querySelector('.advice-section'), name: 'Aloqa' }
  ].filter(section => section.element); // Filter out null elements

  let ticking = false;

  function updateActiveNav() {
    const scrollPos = window.scrollY + 150; // 150px offset for header
    let currentSection = 'Asosiy'; // Default to first section

    // Find which section we're currently in
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (scrollPos >= section.element.offsetTop) {
        currentSection = section.name;
        break;
      }
    }

    setActiveNavItem(currentSection);
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateActiveNav);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick);

  // Set initial active state
  updateActiveNav();
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
    /* Smooth scroll behavior */
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

    /* Navigation item hover - 70% white */
    .nav-item:hover {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    /* Navigation item active (clicked) - 100% white */
    .nav-item.active {
      color: rgba(255, 255, 255, 1) !important;
    }

    /* Make sure active state overrides hover */
    .nav-item.active:hover {
      color: rgba(255, 255, 255, 1) !important;
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