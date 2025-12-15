import { router } from '../../utils/router.js';
import { store } from '../../utils/store.js';
import { cleanupPricingStyles } from '../pricing.js';
import { replaceLandingArticles } from '../../components/dynamic-articles.js';
import '../../styles/dynamic-articles.css';

// Home page translations - separate from other pages
const homeTranslations = {
  uz: {
    // Navigation
    home: 'Asosiy',
    about: 'Ma\'lumot',
    pricing: 'Tariflar',
    blog: 'Bloglar',
    contact: 'Aloqa',
    login: 'Kirish',
    
    // Hero Section
    heroTitle: 'Online Ta\'limni Biz Bilan Boshlang',
    heroButton: 'BEPUL SINAB KO\'RISH',
    statsText: 'O\'quv markazlari bizga ishonch bildiradi!',
    
    // Hero Features
    aiTitle: 'Sun\'iy intellekt (AI)',
    aiDescription: 'O\'quvchi savollarga avtomatik javob berish, darslarni puylash va ta\'lim vazifasi mavzularini aniqlash va yecha maslahat data. Test topshiriqlarida yordam berish.',
    paymentTitle: 'To\'lov integratsiyasi',
    paymentDescription: 'Uzcard, Humo, Visa, Mastercard, Payme, Click bo\'yicha to\'lov o\'quvchi harid qilganiga integratsiya qilinb. Ixtisoriga nark tushinadi.',
    analyticsTitle: 'O\'quvchilar tahlili',
    analyticsDescription: 'O\'quvchilar faoliyatin real vaqt rejimida kuzatish, test, topshiriq natijalarini grafik va diagrammalarga qo\'shish, individual kurslarni O\'quvchilarga avtomatik tavsiyalanib.',
    videoGuide: 'Video qo\'llanmani ko\'rish',
    
    // Platform Features
    platformTitle: 'Platformaning Asosiy Imkoniyatlari',
    feature1: '1. Tez va oson kurs joylash',
    feature2: '2. O\'quvchilar Nazorati',
    feature3: '3. To\'lov tizimi integratsiya',
    feature4: '4. Onlayn uchrashuvlar',
    feature5: '5. Sun\'iy intellekt',
    feature6: '6. Brendaga moslash',
    feature7: '7. Qo\'llab quvvatlash',
    feature8: '8. Ma\'lumotlar xavfsizligi',
    feature9: '9. Moliyaviy analitika',
    useButton: 'Foydalanish',
    detailsButton: 'Batafsil',
    
    // Pricing Section
    pricingTitle: 'Tariflar & Narxlar',
    minimal: 'Minimal',
    standard: 'Standard',
    pro: 'Pro',
    corporate: 'Korporativ',
    recommended: 'Tavsiya',
    specialPrice: 'Maxsus narx',
    
    // Pricing Features
    courseLimit: 'Kurs joylash soni',
    adminAdd: 'Admin qo\'shish',
    studentBase: 'O\'quvchilar bazasi',
    support: 'Qo\'llab-quvvatlash',
    analytics: 'O\'quvchilar analitikasi',
    onlineMeeting: 'Onlayn uchrashuv',
    certificate: 'Sertifikat generatsiyasi',
    chat: 'O\'quvchilar bilan chat',
    paymentIntegration: 'To\'lov tizimi integratsyasi',
    ai: 'Sun\'iy intellekt',
    contentSecurity: 'Kontent xavfsizligi',
    brandDesign: 'Brendga mos dizayn',
    personalDomain: 'Shaxsiy Domein',
    proFeatures: 'Pro tarif imkoniyatlari',
    seo: 'SEO - Google\'da qidiruv',
    pricingInfo: 'Ta\'riflar bo\'yicha to\'liq ma\'lumot',
    
    // Articles Section
    articlesTitle: 'O\'qituvchilar uchun ma\'qolalar',
    articleTitle: 'Samarali Dars',
    articleDescription: 'Samarali dars o\'tish uchun qaysi usullar haqida batafsil ma\'lumot berigan ma\'qola',
    blogButton: 'BLOG BO\'LIMIGA O\'TISH',
    
    // Advice Section
    adviceTitle: 'Maslahat olish',
    namePlaceholder: 'Ismingiz',
    phonePlaceholder: 'Raqamingiz',
    commentPlaceholder: 'Izoh',
    submitButton: 'Yuborish',
    
    // Login Section
    systemLogin: 'Tizimga Kirish',
    
    // Footer
    mainPage: 'Asosiy sahifa',
    publicOffer: 'Ommaviy oferta',
    rightsReserved: 'Barcha huquqlar himoyalangan',
    
    // Contact Info
    address: 'Toshkent shahar, Chilonzor tumani, 12-kvartal',
    
    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode'
  },
  
  ru: {
    // Navigation
    home: 'Главная',
    about: 'Информация',
    pricing: 'Тарифы',
    blog: 'Блоги',
    contact: 'Контакты',
    login: 'Войти',
    
    // Hero Section
    heroTitle: 'Начните Онлайн Обучение с Нами',
    heroButton: 'ПОПРОБОВАТЬ БЕСПЛАТНО',
    statsText: 'учебных центров доверяют нам!',
    
    // Hero Features
    aiTitle: 'Искусственный интеллект (ИИ)',
    aiDescription: 'Автоматические ответы на вопросы студентов, распределение уроков и определение учебных задач с советами. Помощь в тестовых заданиях.',
    paymentTitle: 'Интеграция платежей',
    paymentDescription: 'Интеграция платежей через Uzcard, Humo, Visa, Mastercard, Payme, Click для покупок студентов. Цена соответствует специализации.',
    analyticsTitle: 'Аналитика студентов',
    analyticsDescription: 'Мониторинг активности студентов в реальном времени, добавление результатов тестов и заданий в графики и диаграммы, автоматические рекомендации индивидуальных курсов студентам.',
    videoGuide: 'Посмотреть видео руководство',
    
    // Platform Features
    platformTitle: 'Основные Возможности Платформы',
    feature1: '1. Быстрое и простое размещение курсов',
    feature2: '2. Контроль студентов',
    feature3: '3. Интеграция платежной системы',
    feature4: '4. Онлайн встречи',
    feature5: '5. Искусственный интеллект',
    feature6: '6. Адаптация к бренду',
    feature7: '7. Поддержка',
    feature8: '8. Безопасность данных',
    feature9: '9. Финансовая аналитика',
    useButton: 'Использовать',
    detailsButton: 'Подробнее',
    
    // Pricing Section
    pricingTitle: 'Тарифы и Цены',
    minimal: 'Минимальный',
    standard: 'Стандартный',
    pro: 'Про',
    corporate: 'Корпоративный',
    recommended: 'Рекомендуем',
    specialPrice: 'Специальная цена',
    
    // Pricing Features
    courseLimit: 'Количество курсов',
    adminAdd: 'Добавление админов',
    studentBase: 'База студентов',
    support: 'Поддержка',
    analytics: 'Аналитика студентов',
    onlineMeeting: 'Онлайн встречи',
    certificate: 'Генерация сертификатов',
    chat: 'Чат со студентами',
    paymentIntegration: 'Интеграция платежной системы',
    ai: 'Искусственный интеллект',
    contentSecurity: 'Безопасность контента',
    brandDesign: 'Дизайн под бренд',
    personalDomain: 'Личный домен',
    proFeatures: 'Возможности Pro тарифа',
    seo: 'SEO - поиск в Google',
    pricingInfo: 'Полная информация о тарифах',
    
    // Articles Section
    articlesTitle: 'Статьи для преподавателей',
    articleTitle: 'Эффективный урок',
    articleDescription: 'Статья с подробной информацией о методах проведения эффективных уроков',
    blogButton: 'ПЕРЕЙТИ В РАЗДЕЛ БЛОГА',
    
    // Advice Section
    adviceTitle: 'Получить консультацию',
    namePlaceholder: 'Ваше имя',
    phonePlaceholder: 'Ваш номер',
    commentPlaceholder: 'Комментарий',
    submitButton: 'Отправить',
    
    // Login Section
    systemLogin: 'Войти в систему',
    
    // Footer
    mainPage: 'Главная страница',
    publicOffer: 'Публичная оферта',
    rightsReserved: 'Все права защищены',
    
    // Contact Info
    address: 'г. Ташкент, Чиланзарский район, 12-квартал',
    
    // Theme
    darkMode: 'Темная тема',
    lightMode: 'Светлая тема'
  },
  
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    pricing: 'Pricing',
    blog: 'Blog',
    contact: 'Contact',
    login: 'Login',
    
    // Hero Section
    heroTitle: 'Start Online Learning with Us',
    heroButton: 'TRY FOR FREE',
    statsText: 'educational centers trust us!',
    
    // Hero Features
    aiTitle: 'Artificial Intelligence (AI)',
    aiDescription: 'Automatic answers to student questions, lesson distribution and identification of educational tasks with advice. Assistance in test assignments.',
    paymentTitle: 'Payment Integration',
    paymentDescription: 'Payment integration through Uzcard, Humo, Visa, Mastercard, Payme, Click for student purchases. Price matches specialization.',
    analyticsTitle: 'Student Analytics',
    analyticsDescription: 'Real-time monitoring of student activity, adding test and assignment results to graphs and charts, automatic recommendations of individual courses to students.',
    videoGuide: 'Watch video guide',
    
    // Platform Features
    platformTitle: 'Main Platform Features',
    feature1: '1. Fast and easy course placement',
    feature2: '2. Student Control',
    feature3: '3. Payment system integration',
    feature4: '4. Online meetings',
    feature5: '5. Artificial Intelligence',
    feature6: '6. Brand adaptation',
    feature7: '7. Support',
    feature8: '8. Data security',
    feature9: '9. Financial analytics',
    useButton: 'Use',
    detailsButton: 'Details',
    
    // Pricing Section
    pricingTitle: 'Pricing & Plans',
    minimal: 'Minimal',
    standard: 'Standard',
    pro: 'Pro',
    corporate: 'Corporate',
    recommended: 'Recommended',
    specialPrice: 'Special price',
    
    // Pricing Features
    courseLimit: 'Course limit',
    adminAdd: 'Admin addition',
    studentBase: 'Student base',
    support: 'Support',
    analytics: 'Student analytics',
    onlineMeeting: 'Online meetings',
    certificate: 'Certificate generation',
    chat: 'Student chat',
    paymentIntegration: 'Payment system integration',
    ai: 'Artificial Intelligence',
    contentSecurity: 'Content security',
    brandDesign: 'Brand design',
    personalDomain: 'Personal domain',
    proFeatures: 'Pro plan features',
    seo: 'SEO - Google search',
    pricingInfo: 'Complete pricing information',
    
    // Articles Section
    articlesTitle: 'Articles for Teachers',
    articleTitle: 'Effective Lesson',
    articleDescription: 'Article with detailed information about methods for conducting effective lessons',
    blogButton: 'GO TO BLOG SECTION',
    
    // Advice Section
    adviceTitle: 'Get Advice',
    namePlaceholder: 'Your name',
    phonePlaceholder: 'Your number',
    commentPlaceholder: 'Comment',
    submitButton: 'Submit',
    
    // Login Section
    systemLogin: 'Login to System',
    
    // Footer
    mainPage: 'Home page',
    publicOffer: 'Public offer',
    rightsReserved: 'All rights reserved',
    
    // Contact Info
    address: 'Tashkent city, Chilanzar district, 12th quarter',
    
    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode'
  }
};

// Current language for home page
let currentHomeLanguage = localStorage.getItem('homeLanguage') || 'uz';

// Translation function for home page
function t(key) {
  try {
    return homeTranslations[currentHomeLanguage]?.[key] || homeTranslations.uz[key] || key;
  } catch (error) {
    console.error('Translation error for key:', key, error);
    return key; // Return the key itself as fallback
  }
}

// Update page content with translations
function updateHomeTranslations() {
  try {
    // Navigation
    document.querySelectorAll('[data-home-i18n="home"]').forEach(el => el.textContent = t('home'));
    document.querySelectorAll('[data-home-i18n="about"]').forEach(el => el.textContent = t('about'));
    document.querySelectorAll('[data-home-i18n="pricing"]').forEach(el => el.textContent = t('pricing'));
    document.querySelectorAll('[data-home-i18n="blog"]').forEach(el => el.textContent = t('blog'));
    document.querySelectorAll('[data-home-i18n="contact"]').forEach(el => el.textContent = t('contact'));
    document.querySelectorAll('[data-home-i18n="login"]').forEach(el => el.textContent = t('login'));
  
  // Hero Section
  document.querySelectorAll('[data-home-i18n="heroTitle"]').forEach(el => el.textContent = t('heroTitle'));
  document.querySelectorAll('[data-home-i18n="heroButton"]').forEach(el => el.textContent = t('heroButton'));
  document.querySelectorAll('[data-home-i18n="statsText"]').forEach(el => el.textContent = t('statsText'));
  
  // Hero Features
  document.querySelectorAll('[data-home-i18n="aiTitle"]').forEach(el => el.textContent = t('aiTitle'));
  document.querySelectorAll('[data-home-i18n="aiDescription"]').forEach(el => el.textContent = t('aiDescription'));
  document.querySelectorAll('[data-home-i18n="paymentTitle"]').forEach(el => el.textContent = t('paymentTitle'));
  document.querySelectorAll('[data-home-i18n="paymentDescription"]').forEach(el => el.textContent = t('paymentDescription'));
  document.querySelectorAll('[data-home-i18n="analyticsTitle"]').forEach(el => el.textContent = t('analyticsTitle'));
  document.querySelectorAll('[data-home-i18n="analyticsDescription"]').forEach(el => el.textContent = t('analyticsDescription'));
  document.querySelectorAll('[data-home-i18n="videoGuide"]').forEach(el => el.textContent = t('videoGuide'));
  
  // Platform Features
  document.querySelectorAll('[data-home-i18n="platformTitle"]').forEach(el => el.textContent = t('platformTitle'));
  document.querySelectorAll('[data-home-i18n="feature1"]').forEach(el => el.textContent = t('feature1'));
  document.querySelectorAll('[data-home-i18n="feature2"]').forEach(el => el.textContent = t('feature2'));
  document.querySelectorAll('[data-home-i18n="feature3"]').forEach(el => el.textContent = t('feature3'));
  document.querySelectorAll('[data-home-i18n="feature4"]').forEach(el => el.textContent = t('feature4'));
  document.querySelectorAll('[data-home-i18n="feature5"]').forEach(el => el.textContent = t('feature5'));
  document.querySelectorAll('[data-home-i18n="feature6"]').forEach(el => el.textContent = t('feature6'));
  document.querySelectorAll('[data-home-i18n="feature7"]').forEach(el => el.textContent = t('feature7'));
  document.querySelectorAll('[data-home-i18n="feature8"]').forEach(el => el.textContent = t('feature8'));
  document.querySelectorAll('[data-home-i18n="feature9"]').forEach(el => el.textContent = t('feature9'));
  document.querySelectorAll('[data-home-i18n="useButton"]').forEach(el => el.textContent = t('useButton'));
  document.querySelectorAll('[data-home-i18n="detailsButton"]').forEach(el => el.textContent = t('detailsButton'));
  
  // Pricing Section
  document.querySelectorAll('[data-home-i18n="pricingTitle"]').forEach(el => el.textContent = t('pricingTitle'));
  document.querySelectorAll('[data-home-i18n="minimal"]').forEach(el => el.textContent = t('minimal'));
  document.querySelectorAll('[data-home-i18n="standard"]').forEach(el => el.textContent = t('standard'));
  document.querySelectorAll('[data-home-i18n="pro"]').forEach(el => el.textContent = t('pro'));
  document.querySelectorAll('[data-home-i18n="corporate"]').forEach(el => el.textContent = t('corporate'));
  document.querySelectorAll('[data-home-i18n="recommended"]').forEach(el => el.textContent = t('recommended'));
  document.querySelectorAll('[data-home-i18n="specialPrice"]').forEach(el => el.textContent = t('specialPrice'));
  
  // Pricing Features
  document.querySelectorAll('[data-home-i18n="courseLimit"]').forEach(el => el.textContent = t('courseLimit'));
  document.querySelectorAll('[data-home-i18n="adminAdd"]').forEach(el => el.textContent = t('adminAdd'));
  document.querySelectorAll('[data-home-i18n="studentBase"]').forEach(el => el.textContent = t('studentBase'));
  document.querySelectorAll('[data-home-i18n="support"]').forEach(el => el.textContent = t('support'));
  document.querySelectorAll('[data-home-i18n="analytics"]').forEach(el => el.textContent = t('analytics'));
  document.querySelectorAll('[data-home-i18n="onlineMeeting"]').forEach(el => el.textContent = t('onlineMeeting'));
  document.querySelectorAll('[data-home-i18n="certificate"]').forEach(el => el.textContent = t('certificate'));
  document.querySelectorAll('[data-home-i18n="chat"]').forEach(el => el.textContent = t('chat'));
  document.querySelectorAll('[data-home-i18n="paymentIntegration"]').forEach(el => el.textContent = t('paymentIntegration'));
  document.querySelectorAll('[data-home-i18n="ai"]').forEach(el => el.textContent = t('ai'));
  document.querySelectorAll('[data-home-i18n="contentSecurity"]').forEach(el => el.textContent = t('contentSecurity'));
  document.querySelectorAll('[data-home-i18n="brandDesign"]').forEach(el => el.textContent = t('brandDesign'));
  document.querySelectorAll('[data-home-i18n="personalDomain"]').forEach(el => el.textContent = t('personalDomain'));
  document.querySelectorAll('[data-home-i18n="proFeatures"]').forEach(el => el.textContent = t('proFeatures'));
  document.querySelectorAll('[data-home-i18n="seo"]').forEach(el => el.textContent = t('seo'));
  document.querySelectorAll('[data-home-i18n="pricingInfo"]').forEach(el => el.textContent = t('pricingInfo'));
  
  // Articles Section
  document.querySelectorAll('[data-home-i18n="articlesTitle"]').forEach(el => el.textContent = t('articlesTitle'));
  document.querySelectorAll('[data-home-i18n="articleTitle"]').forEach(el => el.textContent = t('articleTitle'));
  document.querySelectorAll('[data-home-i18n="articleDescription"]').forEach(el => el.textContent = t('articleDescription'));
  document.querySelectorAll('[data-home-i18n="blogButton"]').forEach(el => el.textContent = t('blogButton'));
  
  // Advice Section
  document.querySelectorAll('[data-home-i18n="adviceTitle"]').forEach(el => el.textContent = t('adviceTitle'));
  document.querySelectorAll('[data-home-i18n="namePlaceholder"]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t('namePlaceholder');
    } else {
      el.textContent = t('namePlaceholder');
    }
  });
  document.querySelectorAll('[data-home-i18n="phonePlaceholder"]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t('phonePlaceholder');
    } else {
      el.textContent = t('phonePlaceholder');
    }
  });
  document.querySelectorAll('[data-home-i18n="commentPlaceholder"]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t('commentPlaceholder');
    } else {
      el.textContent = t('commentPlaceholder');
    }
  });
  document.querySelectorAll('[data-home-i18n="submitButton"]').forEach(el => el.textContent = t('submitButton'));
  
  // Login Section
  document.querySelectorAll('[data-home-i18n="systemLogin"]').forEach(el => el.textContent = t('systemLogin'));
  
  // Footer
  document.querySelectorAll('[data-home-i18n="mainPage"]').forEach(el => el.textContent = t('mainPage'));
  document.querySelectorAll('[data-home-i18n="publicOffer"]').forEach(el => el.textContent = t('publicOffer'));
  document.querySelectorAll('[data-home-i18n="rightsReserved"]').forEach(el => el.textContent = t('rightsReserved'));
  document.querySelectorAll('[data-home-i18n="address"]').forEach(el => el.textContent = t('address'));
  
  // Theme
  document.querySelectorAll('[data-home-i18n="darkMode"]').forEach(el => el.textContent = t('darkMode'));
  document.querySelectorAll('[data-home-i18n="lightMode"]').forEach(el => el.textContent = t('lightMode'));
  
  } catch (error) {
    console.error('Error updating home translations:', error);
  }
}

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

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle Menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="nav-menu" id="navMenu">
          <a href="#" class="nav-item" data-home-i18n="home">Asosiy</a>
          <a href="#" class="nav-item" data-home-i18n="about">Ma'lumot</a>
          <!-- <a href="#" class="nav-item" data-home-i18n="pricing">Tariflar</a> -->
          <a href="#" class="nav-item" data-home-i18n="blog">Bloglar</a>
          <a href="#" class="nav-item" data-home-i18n="contact">Aloqa</a>

          <!-- Mobile-only header actions in menu -->
          <div class="mobile-header-actions">
            <div class="mobile-language-selector">
              <div class="mobile-lang-dropdown">
                <div class="mobile-lang-selected" id="mobileLangSelected">
                  <img src="/images/uz-flag.jpg" alt="UZ" class="mobile-flag-img" />
                  <span>UZ</span>
                  <span class="mobile-dropdown-arrow">▼</span>
                </div>
                <div class="mobile-lang-options" id="mobileLangOptions">
                  <div class="mobile-lang-option" data-lang="en" data-flag="/images/us-flag.png">
                    <img src="/images/us-flag.png" alt="EN" class="mobile-flag-img" />
                    <span>EN</span>
                  </div>
                  <div class="mobile-lang-option" data-lang="ru" data-flag="/images/ru-flag.jpg">
                    <img src="/images/ru-flag.jpg" alt="RU" class="mobile-flag-img" />
                    <span>RU</span>
                  </div>
                  <div class="mobile-lang-option active" data-lang="uz" data-flag="/images/uz-flag.jpg">
                    <img src="/images/uz-flag.jpg" alt="UZ" class="mobile-flag-img" />
                    <span>UZ</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mobile-theme-toggle" id="mobileThemeToggle">
              <span class="mobile-theme-text" data-home-i18n="lightMode">Light Mode</span>
              <div class="mobile-toggle-switch">
                <div class="mobile-toggle-slider"></div>
              </div>
            </div>

            <button class="mobile-login-btn" onclick="router.navigate('/login'); return false;" data-home-i18n="login">Kirish</button>
          </div>
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
              <svg class="theme-icon sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>

              <!-- Moon Icon -->
              <svg class="theme-icon moon-icon active" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <button class="login-btn" onclick="router.navigate('/login'); return false;" data-home-i18n="login">Kirish</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-header-container">
            <h1 class="hero-title" data-home-i18n="heroTitle">Online Ta'limni Biz Bilan Boshlang</h1>

            <div class="hero-actions">
              <button class="btn-primary" onclick="router.navigate('/register'); return false;" data-home-i18n="heroButton">BEPUL SINAB KO'RISH</button>
              <div class="stats-badge">
                <span class="stats-number">70+</span>
                <span class="stats-text" data-home-i18n="statsText">O'quv markazlari bizga ishonch bildiradi!</span>
              </div>
            </div>
          </div>

          <div class="hero-features-grid">
            <div class="hero-feature-card">
              <h3 data-home-i18n="aiTitle">Sun'iy intellekt (AI)</h3>
              <p data-home-i18n="aiDescription">O'quvchi savollarga avtomatik javob berish, darslarni puylash va ta'lim vazifasi mavzularini aniqlash va yecha maslahat data. Test topshiriqlarida yordam berish.</p>
            </div>

            <div class="hero-feature-card">
              <h3 data-home-i18n="paymentTitle">To'lov integratsiyasi</h3>
              <p data-home-i18n="paymentDescription">Uzcard, Humo, Visa, Mastercard, Payme, Click bo'yicha to'lov o'quvchi harid qilganiga integratsiya qilinb. Ixtisoriga nark tushinadi.</p>
            </div>

            <div class="hero-feature-card analytics-card">
              <h3 data-home-i18n="analyticsTitle">O'quvchilar tahlili</h3>
              <p data-home-i18n="analyticsDescription">O'quvchilar faoliyatin real vaqt rejimida kuzatish, test, topshiriq natijalarini grafik va diagrammalarga qo'shish, individual kurslarni O'quvchilarga avtomatik tavsiyalanib.</p>
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
              <span class="video-text" data-home-i18n="videoGuide">Video qo'llanmani ko'rish</span>
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
        <h2 class="section-title" data-home-i18n="platformTitle">Platformaning Asosiy Imkoniyatlari</h2>

        <div class="platform-features-grid">
         <div class="course-3d-icon">
              <img src="/images/3D Black Chrome Shape (3) 1.png" alt="3D Course Icon" class="course-icon-image" />
            </div>
          <div class="platform-feature-card course-card">
            <h4 data-home-i18n="feature1">1. Tez va oson kurs joylash</h4>

            <!-- 3D Course Icon on left side -->
           
          </div>
          <div class="platform-feature-card">
            <h4 data-home-i18n="feature2">2. O'quvchilar Nazorati</h4>
          </div>
          <div class="platform-feature-card">
            <h4 data-home-i18n="feature3">3. To'lov tizimi integratsiya</h4>
          </div>

          <div class="platform-feature-card">
            <h4 data-home-i18n="feature4">4. Onlayn uchrashuvlar</h4>
          </div>
          <div class="platform-feature-card">
            <h4 data-home-i18n="feature5">5. Sun'iy intellekt</h4>
          </div>
          <div class="glass-decoration">
              <img src="/images/gradient glass (20) 1 (1).png" alt="Glass Decoration" class="glass-deco-image" />
            </div>
          <div class="platform-feature-card brending-card">
            <h4 data-home-i18n="feature6">6. Brendaga moslash</h4>

            <!-- Decorative Glass Element next to card -->
            
          </div>

          <div class="platform-feature-card">
            <h4 data-home-i18n="feature7">7. Qo'llab quvvatlash</h4>
          </div>
          <div class="platform-feature-card">
            <h4 data-home-i18n="feature8">8. Ma'lumotlar xavfsizligi</h4>
          </div>
          <div class="platform-feature-card">
            <h4 data-home-i18n="feature9">9. Moliyaviy analitika</h4>
          </div>
        </div>

        <div class="platform-actions">
          <button class="btn-outline" onclick="router.navigate('/register'); return false;" data-home-i18n="useButton">Foydalanish</button>
          <!-- <button class="btn-outline" data-home-i18n="detailsButton">Batafsil</button> -->
        </div>
      </div>
    </section>


    <!-- FOR PRICING -->






    <!-- Course Articles Section -->
    <section class="articles-section">
      <div class="container">
        <h2 class="section-title" data-home-i18n="articlesTitle">O'qituvchilar uchun ma'qolalar</h2>

        <div class="articles-grid" id="dynamic-articles-container">
          <!-- Dynamic articles will be loaded here -->
        </div>

        <div class="articles-action">
          <button class="btn-blog" onclick="router.navigate('/blog'); return false;" data-home-i18n="blogButton">BLOG BO'LIMIGA O'TISH</button>
        </div>
      </div>
    </section>

    <!-- Advice Section -->
    <section class="advice-section">
      <div class="container">
        <div class="advice-card">


          <h2 class="advice-title" data-home-i18n="adviceTitle">Maslahat olish</h2>
          <form class="advice-form" onsubmit="submitAdviceForm(event)">
            <div class="form-row">
              <div class="form-group">
                <input
                  type="text"
                  class="form-input"
                  data-home-i18n="namePlaceholder"
                  placeholder="Ismingiz"
                  required
                  id="adviceName"
                />
              </div>
              <div class="form-group">
                <input
                  type="tel"
                  class="form-input"
                  data-home-i18n="phonePlaceholder"
                  placeholder="+998 XX XXX XX XX"
                  value="+998"
                  pattern="\\+998 [0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}"
                  maxlength="17"
                  required
                  id="advicePhone"
                />
              </div>
            </div>
            <div class="form-group">
              <textarea
                class="form-input form-textarea"
                data-home-i18n="commentPlaceholder"
                placeholder="Izoh"
                id="adviceComment"
              ></textarea>
            </div>
            <button type="submit" class="advice-submit" data-home-i18n="submitButton">Yuborish</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Login Section -->
    <section class="login-section">
      <div class="container">
        <button class="btn-login-main" onclick="router.navigate('/login'); return false;" data-home-i18n="systemLogin">Tizimga Kirish</button>
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
            <a href="#" class="footer-nav-item" data-home-i18n="mainPage">Asosiy sahifa</a>
            <a href="#" class="footer-nav-item" data-home-i18n="about">Ma'lumot</a>
            <!-- <a href="#" class="footer-nav-item" data-home-i18n="pricing">Tariflar</a> -->
            <a href="#" class="footer-nav-item" data-home-i18n="contact">Aloqa</a>
            <a href="#" class="footer-nav-item" data-home-i18n="publicOffer">Ommaviy oferta</a>
            <a href="#" class="footer-nav-item" onclick="router.navigate('/login'); return false;" data-home-i18n="login">Kirish</a>
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
              <span data-home-i18n="address">Toshkent shahar, Chilonzor tumani, 12-kvartal</span>
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
          <p>&copy; 2025 Darslinker. <span data-home-i18n="rightsReserved">Barcha huquqlar himoyalangan</span></p>
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
      
      <!-- Speech Bubble -->
      <div class="sms-speech-bubble" id="smsSpeechBubble" style="display: none;">
        <div class="sms-bubble-header">
          <button class="sms-bubble-close" id="smsCloseBtn">&times;</button>
        </div>
        <div class="sms-bubble-content">
          <p>Savollaringiz bormi? Telegram bot orqali murojaat qiling</p>
          <button class="sms-telegram-btn" onclick="openTelegramBot()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.24-.02.38z" fill="white"/>
            </svg>
            Telegram Bot
          </button>
        </div>
        <!-- Speech bubble tail -->
        <div class="sms-bubble-tail"></div>
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

  // Initialize phone formatting
  initPhoneFormatting();

  // Initialize mobile menu
  initMobileMenu();

  // Initialize mobile language dropdown
  initMobileLanguageDropdown();

  // Initialize mobile theme toggle
  initMobileThemeToggle();

  // Initialize home page translations
  initHomeTranslations();

  // Initialize dynamic articles
  initDynamicArticles();

  // Update store
  store.setState({ currentPage: 'home' });
}

// Initialize home page translations
function initHomeTranslations() {
  try {
    // Load saved language
    const savedLang = localStorage.getItem('homeLanguage');
    if (savedLang && homeTranslations[savedLang]) {
      currentHomeLanguage = savedLang;
    }
    
    // Update all translations
    updateHomeTranslations();
    
    // Update language selector UI
    updateLanguageSelectorUI();
  } catch (error) {
    console.error('Error initializing home translations:', error);
  }
}

// Update language selector UI to match current language
function updateLanguageSelectorUI() {
  try {
    const langFlags = {
      uz: '/images/uz-flag.jpg',
      ru: '/images/ru-flag.jpg', 
      en: '/images/us-flag.png'
    };
    
    const langNames = {
      uz: 'UZ',
      ru: 'RU',
      en: 'EN'
    };
    
    // Update desktop selector
    const desktopSelected = document.getElementById('langSelected');
    if (desktopSelected) {
      const flagImg = desktopSelected.querySelector('.flag-img');
      const span = desktopSelected.querySelector('span');
      if (flagImg) flagImg.src = langFlags[currentHomeLanguage];
      if (span) span.textContent = langNames[currentHomeLanguage];
    }
    
    // Update mobile selector
    const mobileSelected = document.getElementById('mobileLangSelected');
    if (mobileSelected) {
      const flagImg = mobileSelected.querySelector('.mobile-flag-img');
      const span = mobileSelected.querySelector('span');
      if (flagImg) flagImg.src = langFlags[currentHomeLanguage];
      if (span) span.textContent = langNames[currentHomeLanguage];
    }
    
    // Update active states
    document.querySelectorAll('.lang-option, .mobile-lang-option').forEach(option => {
      option.classList.remove('active');
      if (option.dataset.lang === currentHomeLanguage) {
        option.classList.add('active');
      }
    });
  } catch (error) {
    console.error('Error updating language selector UI:', error);
  }
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

      /* Language dropdown fix */
      .lang-dropdown {
        position: relative;
        z-index: 1001;
      }

      .lang-options {
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1002 !important;
        min-width: 100px !important;
      }

      .lang-dropdown.open .lang-options {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
      }

      /* Light Theme Styles */
      .light-theme {
        --bg-primary: #ffffff;
        --bg-secondary: #f8f9fa;
        --text-primary: #212529;
        --text-secondary: #6c757d;
      }

      .light-theme body {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%) !important;
        color: #212529 !important;
      }

      /* Force all white text to black in light mode */
      .light-theme * {
        color: #212529 !important;
      }

      /* Exceptions for elements that should keep their colors */
      .light-theme .login-btn,
      .light-theme .mobile-login-btn,
      .light-theme .btn-primary,
      .light-theme .advice-submit {
        color: #ffffff !important;
      }

      .light-theme .header {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(25px) !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
      }

      .light-theme .nav-item {
        color: #212529 !important;
      }

      .light-theme .nav-item:hover,
      .light-theme .nav-item.active {
        color: #7EA2D4 !important;
      }

      .light-theme .login-btn {
        background: #7EA2D4 !important;
        color: #ffffff !important;
      }

      .light-theme .mobile-login-btn {
        background: #7EA2D4 !important;
        color: #ffffff !important;
      }

      .light-theme .hero {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
      }

      .light-theme .hero-title {
        color: #212529 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      }

      .light-theme .hero-feature-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #212529 !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
      }

      .light-theme .hero-feature-card h3,
      .light-theme .hero-feature-card p {
        color: #212529 !important;
      }

      .light-theme .platform-feature-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #212529 !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
      }

      .light-theme .platform-feature-card h4 {
        color: #212529 !important;
      }

      .light-theme .pricing-card {
        background: rgba(255, 255, 255, 0.98) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #212529 !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
      }

      .light-theme .pricing-card h3,
      .light-theme .pricing-card span,
      .light-theme .pricing-card .feature-item span {
        color: #212529 !important;
      }

      .light-theme .article-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border: none !important;
        color: #212529 !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
      }

      .light-theme .article-card h3,
      .light-theme .article-card p {
        color: #212529 !important;
      }

      .light-theme .advice-section {
        background: transparent !important;
      }

      .light-theme .advice-card {
        background: rgba(255, 255, 255, 0.98) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #212529 !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
      }

      .light-theme .advice-title {
        color: #212529 !important;
      }

      .light-theme .form-input {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(0, 0, 0, 0.15) !important;
        color: #212529 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
      }

      .light-theme .form-input:focus {
        border-color: #7EA2D4 !important;
        box-shadow: 0 0 0 3px rgba(126, 162, 212, 0.1) !important;
      }

      .light-theme .form-input::placeholder {
        color: #6c757d !important;
        opacity: 1 !important;
      }

      .light-theme .btn-primary {
        background: linear-gradient(135deg, #7EA2D4, #6B91C7) !important;
        color: #ffffff !important;
        border: none !important;
      }

      .light-theme .advice-submit {
        background: linear-gradient(135deg, #7EA2D4, #6B91C7) !important;
        color: #ffffff !important;
      }

      .light-theme .footer {
        background: rgba(248, 249, 250, 0.95) !important;
        color: #212529 !important;
        border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
      }

      .light-theme .footer-nav-item,
      .light-theme .footer-contact span,
      .light-theme .footer-bottom p {
        color: #212529 !important;
      }

      .light-theme .section-title {
        color: #212529 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      }

      .light-theme .lang-selected {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(0, 0, 0, 0.2) !important;
        color: #212529 !important;
      }

      .light-theme .lang-selected span {
        color: #212529 !important;
      }

      .light-theme .lang-options {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(0, 0, 0, 0.2) !important;
      }

      .light-theme .lang-option {
        color: #212529 !important;
      }

      .light-theme .lang-option span {
        color: #212529 !important;
      }

      .light-theme .lang-option:hover {
        background: rgba(126, 162, 212, 0.1) !important;
        color: #212529 !important;
      }

      .light-theme .lang-option:hover span {
        color: #212529 !important;
      }

      /* Logo special styling for light mode - need custom logo for this */
      .light-theme .logo,
      .light-theme .footer-logo-img {
        /* We'll need a custom logo with "Dars" black and "linker" #7EA2D4 */
        /* For now, using filter to make it darker */
        filter: brightness(0.3) contrast(1.5) !important;
      }

      /* Stats badge and other elements */
      .light-theme .stats-badge {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #212529 !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
      }

      .light-theme .stats-number,
      .light-theme .stats-text {
        color: #212529 !important;
      }

      .light-theme .btn-outline {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #7EA2D4 !important;
        border: 2px solid #7EA2D4 !important;
      }

      .light-theme .btn-outline:hover {
        background: #7EA2D4 !important;
        color: #ffffff !important;
      }

      .light-theme .video-btn {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #7EA2D4 !important;
        border: 1px solid #7EA2D4 !important;
      }

      .light-theme .btn-login-main {
        background: rgba(255, 255, 255, 0.95) !important;
        color: #7EA2D4 !important;
        border: 2px solid #7EA2D4 !important;
      }

      .light-theme .btn-login-main:hover {
        background: #7EA2D4 !important;
        color: #ffffff !important;
      }

      /* Social media icons with circle border */
      .light-theme .social-link {
        border: 2px solid #dee2e6 !important;
        border-radius: 50% !important;
        width: 45px !important;
        height: 45px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #6c757d !important;
        transition: all 0.3s ease !important;
      }

      .light-theme .social-link:hover {
        border-color: #7EA2D4 !important;
        color: #7EA2D4 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(126, 162, 212, 0.2) !important;
      }

      /* Floating Chat Widget Styles */
      .floating-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }

      .floating-chat-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #7EA2D4, #6B91C7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(126, 162, 212, 0.4);
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      }

      .floating-chat-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(126, 162, 212, 0.6);
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 4px 20px rgba(126, 162, 212, 0.4);
        }
        50% {
          box-shadow: 0 4px 20px rgba(126, 162, 212, 0.6), 0 0 0 10px rgba(126, 162, 212, 0.1);
        }
        100% {
          box-shadow: 0 4px 20px rgba(126, 162, 212, 0.4);
        }
      }

      .chat-speech-bubble {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 320px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        border: 2px solid #e1e8ed;
        animation: slideInUp 0.3s ease;
        overflow: hidden;
      }

      .bubble-header {
        display: flex;
        align-items: center;
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #e1e8ed;
      }

      .bubble-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        background: #7EA2D4;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bubble-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .bubble-info {
        flex: 1;
      }

      .bubble-info h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .bubble-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #666;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .bubble-close:hover {
        background: #f0f0f0;
        color: #333;
      }

      .bubble-content {
        padding: 15px;
      }

      .bubble-content p {
        margin: 0 0 15px 0;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
      }

      .bubble-telegram-btn {
        background: linear-gradient(135deg, #0088cc, #006699);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
        width: 100%;
        justify-content: center;
      }

      .bubble-telegram-btn:hover {
        background: linear-gradient(135deg, #006699, #004d73);
        transform: translateY(-1px);
      }

      .bubble-tail {
        position: absolute;
        bottom: -8px;
        right: 25px;
        width: 16px;
        height: 16px;
        background: white;
        border-right: 2px solid #e1e8ed;
        border-bottom: 2px solid #e1e8ed;
        transform: rotate(45deg);
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Light theme adjustments */
      .light-theme .chat-speech-bubble {
        background: white;
        border-color: #dee2e6;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      }

      .light-theme .bubble-header {
        background: #f8f9fa;
        border-bottom-color: #dee2e6;
      }

      .light-theme .bubble-tail {
        background: white;
        border-right-color: #dee2e6;
        border-bottom-color: #dee2e6;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .floating-chat-widget {
          bottom: 15px;
          right: 15px;
        }

        .floating-chat-icon {
          width: 50px;
          height: 50px;
        }

        .chat-speech-bubble {
          width: 280px;
          bottom: 70px;
          right: -10px;
        }

        .bubble-tail {
          right: 20px;
        }
      }

      /* Telegram Bot Popup Styles */
      .telegram-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }

      .telegram-popup {
        background: var(--bg-primary);
        border: 2px solid var(--primary-color);
        border-radius: 20px;
        padding: 0;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
        overflow: hidden;
      }

      .telegram-popup-header {
        background: linear-gradient(135deg, var(--primary-color), rgba(126, 162, 212, 0.8));
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(126, 162, 212, 0.3);
      }

      .telegram-popup-header h3 {
        margin: 0;
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .telegram-popup-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .telegram-popup-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }

      .telegram-popup-content {
        padding: 30px;
        text-align: center;
      }

      .telegram-popup-icon {
        margin-bottom: 20px;
      }

      .telegram-popup-content p {
        color: var(--text-primary);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 30px;
      }

      .telegram-popup-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .telegram-bot-btn {
        background: linear-gradient(135deg, #0088cc, #006699);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
      }

      .telegram-bot-btn:hover {
        background: linear-gradient(135deg, #006699, #004d73);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 136, 204, 0.4);
      }

      .telegram-cancel-btn {
        background: transparent;
        color: var(--text-secondary);
        border: 2px solid var(--border-color);
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .telegram-cancel-btn:hover {
        background: var(--hover-bg);
        border-color: var(--primary-color);
        color: var(--text-primary);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.9);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Light theme popup styles */
      .light-theme .telegram-popup {
        background: white;
        border-color: var(--primary-color);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }

      .light-theme .telegram-popup-content p {
        color: #212529;
      }

      .light-theme .telegram-cancel-btn {
        color: #6c757d;
        border-color: #dee2e6;
      }

      .light-theme .telegram-cancel-btn:hover {
        background: #f8f9fa;
        border-color: var(--primary-color);
        color: #212529;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .telegram-popup {
          margin: 20px;
          width: calc(100% - 40px);
        }

        .telegram-popup-content {
          padding: 20px;
        }

        .telegram-popup-actions {
          flex-direction: column;
        }

        .telegram-bot-btn,
        .telegram-cancel-btn {
          width: 100%;
          justify-content: center;
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
    console.log('Language dropdown clicked');
    langDropdown.classList.toggle('open');
    
    // Debug: check if dropdown is open
    if (langDropdown.classList.contains('open')) {
      console.log('Language dropdown opened');
    } else {
      console.log('Language dropdown closed');
    }
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

    // Store selected language for home page
    localStorage.setItem('homeLanguage', lang);
    currentHomeLanguage = lang;

    // Close dropdown
    langDropdown.classList.remove('open');

    // Update page language attribute
    document.documentElement.lang = lang;
    
    // Update all translations on the page
    updateHomeTranslations();
    
    console.log('Home page language changed to:', lang);
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
  const savedLang = localStorage.getItem('homeLanguage');
  if (!savedLang) return;

  const langOption = document.querySelector(`[data-lang="${savedLang}"]`);
  if (!langOption) return;

  // Update UI to match saved language
  const langSelected = document.getElementById('langSelected');
  if (!langSelected) return;
  
  const flag = langOption.querySelector('.flag-img')?.src;
  const text = langOption.querySelector('span')?.textContent;

  if (flag && text) {
    const selectedFlag = langSelected.querySelector('.flag-img');
    const selectedText = langSelected.querySelector('span');
    
    if (selectedFlag) selectedFlag.src = flag;
    if (selectedText) selectedText.textContent = text;
  }

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

// Apply theme changes to the page
function applyTheme(isDark) {
  const body = document.body;
  const html = document.documentElement;
  
  if (isDark) {
    // Dark mode styles
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    html.classList.remove('light-theme');
    html.classList.add('dark-theme');
  } else {
    // Light mode styles
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    html.classList.remove('dark-theme');
    html.classList.add('light-theme');
  }
}

// Initialize theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = themeToggle?.querySelector('.sun-icon');
  const moonIcon = themeToggle?.querySelector('.moon-icon');

  if (!themeToggle || !sunIcon || !moonIcon) return;

  // Check for saved theme preference or default to dark mode
  const savedTheme = localStorage.getItem('theme') || 'dark';
  let isDark = savedTheme === 'dark';

  // Set initial state - dark mode is default
  if (isDark) {
    sunIcon.classList.remove('active');
    moonIcon.classList.add('active');
  } else {
    moonIcon.classList.remove('active');
    sunIcon.classList.add('active');
  }
  
  // Apply initial theme
  applyTheme(isDark);

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

    // Apply actual theme changes
    applyTheme(isDark);
    
    console.log(`Theme switched to: ${isDark ? 'dark' : 'light'} mode`);
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
    showToast('Iltimos, ism va telefon raqamini kiriting!', 'error', 4000);
    return;
  }

  // Uzbekistan phone validation
  const phoneRegex = /^\+998( [0-9]{2}){1}( [0-9]{3}){1}( [0-9]{2}){2}$/;
  if (!phoneRegex.test(phone) || phone.length < 17) {
    showToast('Iltimos, to\'g\'ri O\'zbekiston telefon raqamini kiriting! Format: +998 XX XXX XX XX', 'error', 5000);
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('.advice-submit');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Yuborilmoqda...';

  // Send data to backend
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
  fetch(`${API_URL}/advices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, phone, comment })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success toast
      showToast(`Rahmat, ${name}! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.`, 'success', 6000);
      
      // Reset form
      event.target.reset();
      
      // Reset phone input to default value
      document.getElementById('advicePhone').value = '+998';
      
      // Success animation
      submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      submitBtn.textContent = 'Yuborildi ✓';
      
      setTimeout(() => {
        submitBtn.style.background = '';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 3000);
      
    } else {
      throw new Error(data.message || 'Xatolik yuz berdi');
    }
  })
  .catch(error => {
    console.error('Advice submission error:', error);
    showToast('Xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.', 'error', 5000);
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });

};

// Initialize SMS Contact functionality
function initSMSContact() {
  const smsContact = document.getElementById('smsContact');
  const speechBubble = document.getElementById('smsSpeechBubble');
  const closeBtn = document.getElementById('smsCloseBtn');

  if (!smsContact || !speechBubble) return;

  smsContact.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // Add click animation
    const container = this.querySelector('.sms-container');
    container.style.transform = 'scale(0.9)';

    setTimeout(() => {
      container.style.transform = '';
    }, 150);

    // Toggle speech bubble
    if (speechBubble.style.display === 'none' || speechBubble.style.display === '') {
      speechBubble.style.display = 'block';
    } else {
      speechBubble.style.display = 'none';
    }

    console.log('SMS contact clicked - speech bubble toggled');
  });

  // Close button event listener
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSMSBubble();
    });
  }

  // Add hover sound effect (optional)
  smsContact.addEventListener('mouseenter', function() {
    // You can add sound effects here later
  });
}

// Close SMS Speech Bubble
function closeSMSBubble() {
  const speechBubble = document.getElementById('smsSpeechBubble');
  if (speechBubble) {
    speechBubble.style.display = 'none';
  }
}

// Toast Notification System
function showToast(message, type = 'success', duration = 5000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : '❌';
  
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Show toast with animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Auto remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 400);
    }
  }, duration);
}

// Phone number formatting for Uzbekistan
function initPhoneFormatting() {
  const phoneInput = document.getElementById('advicePhone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value;
    
    // Remove all non-digits except the + at the beginning
    let numbers = value.replace(/[^\d]/g, '');
    
    // If user tries to delete 998, restore it
    if (numbers.length < 3 || !numbers.startsWith('998')) {
      numbers = '998' + numbers.replace(/^998/, '');
    }
    
    // Limit to 12 digits total (998 + 9 more)
    if (numbers.length > 12) {
      numbers = numbers.substring(0, 12);
    }
    
    // Format the number
    let formatted = '+998';
    if (numbers.length > 3) {
      formatted += ' ' + numbers.substring(3, 5);
    }
    if (numbers.length > 5) {
      formatted += ' ' + numbers.substring(5, 8);
    }
    if (numbers.length > 8) {
      formatted += ' ' + numbers.substring(8, 10);
    }
    if (numbers.length > 10) {
      formatted += ' ' + numbers.substring(10, 12);
    }
    
    e.target.value = formatted;
  });

  // Prevent cursor from going before +998
  phoneInput.addEventListener('keydown', function(e) {
    const cursorPosition = e.target.selectionStart;
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4) {
      e.preventDefault();
    }
  });

  // Set cursor after +998 when clicked at the beginning
  phoneInput.addEventListener('click', function(e) {
    if (e.target.selectionStart < 4) {
      e.target.setSelectionRange(4, 4);
    }
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
        // case 'Tariflar':
        //   scrollToSection('pricing-section');
        //   break;
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
    // { element: document.querySelector('.pricing-section'), name: 'Tariflar' },
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
        // case 'Tariflar':
        //   scrollToSection('pricing-section');
        //   break;
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
          // case 'Tariflar':
          //   scrollToSection('pricing-section');
          //   break;
          case 'Aloqa':
            scrollToSection('advice-section');
            break;
        }
      }, 100);
    });
  });
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const header = document.querySelector('.header');

  if (!mobileMenuBtn || !navMenu || !header) {
    console.log('Mobile menu elements not found');
    return;
  }

  // Toggle mobile menu
  mobileMenuBtn.addEventListener('click', function(e) {
    e.stopPropagation();

    // Toggle active states
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('mobile-active');
    header.classList.toggle('menu-open');

    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('mobile-active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking nav items or mobile login button
  const navItems = navMenu.querySelectorAll('.nav-item');
  const mobileLoginBtn = navMenu.querySelector('.mobile-login-btn');

  [...navItems, mobileLoginBtn].forEach(item => {
    if (item) {
      item.addEventListener('click', function() {
        // Close mobile menu
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('mobile-active');
        header.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!header.contains(e.target)) {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('mobile-active');
      header.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  });

  // Close menu on window resize if screen becomes large
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('mobile-active');
      header.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  });

  // Add mobile menu styles
  addMobileMenuStyles();
}

// Add comprehensive mobile menu and responsive styles
function addMobileMenuStyles() {
  if (document.querySelector('#mobile-responsive-styles')) return;

  const style = document.createElement('style');
  style.id = 'mobile-responsive-styles';
  style.textContent = `
    /* Mobile Menu Button - Hidden by default */
    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 24px;
      background: none;
      border: none;
      cursor: pointer;
      z-index: 1001;
      transition: all 0.3s ease;
    }

    .hamburger-line {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(1) {
      transform: translateY(10.5px) rotate(45deg);
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(3) {
      transform: translateY(-10.5px) rotate(-45deg);
    }

    /* Hide mobile-only elements on desktop */
    .mobile-header-actions {
      display: none;
    }

    /* Tablet and Mobile Responsive Styles */
    @media (max-width: 1024px) {
      /* Header responsive adjustments for tablet */
      .header .container {
        padding: 0 20px;
      }

      .nav-menu {
        gap: 20px;
      }

      .nav-item {
        font-size: 14px;
      }

      .login-btn {
        padding: 10px 16px;
        font-size: 14px;
      }

      .lang-dropdown {
        font-size: 13px;
      }

      .logo {
        height: 40px;
      }
    }

    @media (max-width: 768px) {
      /* Show mobile menu button */
      .mobile-menu-btn {
        display: flex;
        order: 3;
      }

      /* Header layout for mobile */
      .header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        position: relative;
      }

      .nav-brand {
        order: 1;
        z-index: 1001;
      }

      .logo {
        height: 28px;
        width: auto;
      }

      /* Hide desktop navigation and create dropdown menu */
      .nav-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        padding: 80px 20px 40px;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s ease;
        z-index: 1000;
        max-height: 100vh;
        overflow-y: auto;
      }

      .nav-menu.mobile-active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-item {
        font-size: 20px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 12px;
        transition: all 0.3s ease;
        text-align: center;
        width: auto;
      }

      .nav-item:hover,
      .nav-item.active {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        transform: translateY(-2px);
      }

      /* Mobile header actions in menu */
      .mobile-header-actions {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
        max-width: 280px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* Mobile language selector */
      .mobile-language-selector {
        width: 100%;
      }

      .mobile-lang-dropdown {
        position: relative;
        width: 100%;
      }

      .mobile-lang-selected {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        font-size: 16px;
      }

      .mobile-lang-selected:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .mobile-flag-img {
        width: 24px;
        height: 16px;
        object-fit: cover;
        border-radius: 2px;
      }

      .mobile-dropdown-arrow {
        transition: transform 0.3s ease;
        font-size: 12px;
      }

      .mobile-lang-dropdown.open .mobile-dropdown-arrow {
        transform: rotate(180deg);
      }

      .mobile-lang-options {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        margin-top: 8px;
        overflow: hidden;
        transform: translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 100;
      }

      .mobile-lang-dropdown.open .mobile-lang-options {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .mobile-lang-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
      }

      .mobile-lang-option:hover,
      .mobile-lang-option.active {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      /* Mobile theme toggle */
      .mobile-theme-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        font-size: 16px;
      }

      .mobile-theme-toggle:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .mobile-toggle-switch {
        width: 48px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        position: relative;
        transition: all 0.3s ease;
      }

      .mobile-toggle-slider {
        width: 18px;
        height: 18px;
        background: #ffffff;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: all 0.3s ease;
      }

      .mobile-toggle-slider.active {
        transform: translateX(24px);
      }

      /* Mobile login button */
      .mobile-login-btn {
        width: 100%;
        padding: 14px 16px;
        background: linear-gradient(135deg, #7EA2D4, #5A8BC7);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .mobile-login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(126, 162, 212, 0.3);
      }

      /* Hide desktop header actions on mobile */
      .header-actions {
        display: none;
      }

      /* Hero section mobile - further reduced padding */
      .hero {
        padding-top: 50px !important; /* Further reduced top padding */
        padding-bottom: 50px !important; /* Ensure consistent bottom padding */
      }

      .hero .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      /* Hero features grid mobile - improved layout */
      .hero-features-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
        max-width: 600px !important; /* Increase max width */
        margin: 0 auto !important; /* Center the grid */
        justify-items: center !important; /* Center grid items */
      }

      .hero-feature-card {
        width: 100% !important;
        max-width: 480px !important; /* Wider cards */
        padding: 24px !important;
        margin: 0 auto !important; /* Center each card */
        box-sizing: border-box;
      }

      .hero-feature-card h3 {
        font-size: 18px !important;
        margin-bottom: 12px !important;
      }

      .hero-feature-card p {
        font-size: 14px !important;
        line-height: 1.6 !important;
      }

      /* Hero video section mobile - add top padding */
      .hero-video-section {
        padding-top: 30px !important;
        margin-top: 20px !important;
      }

      /* Platform features mobile - improved layout */
      .platform-features .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      .platform-features-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
        max-width: 600px !important; /* Increase max width */
        margin: 0 auto !important; /* Center the grid */
        justify-items: center !important; /* Center grid items */
      }

      .platform-feature-card {
        width: 100% !important;
        max-width: 480px !important; /* Wider cards */
        padding: 24px !important;
        margin: 0 auto !important; /* Center each card */
        box-sizing: border-box;
      }

      .platform-feature-card h4 {
        font-size: 18px !important;
        margin-bottom: 12px !important;
      }

      /* Platform actions mobile - add top padding */
      .platform-actions {
        padding-top: 40px !important;
        margin-top: 30px !important;
      }

      /* Pricing section mobile - improved layout */
      .pricing-section .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      .pricing-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
        max-width: 480px !important; /* Optimized width for pricing cards */
        margin: 0 auto !important; /* Center the grid */
        justify-items: center !important; /* Center grid items */
      }

      .pricing-card {
        width: 100% !important;
        margin: 0 auto !important; /* Center each card */
        box-sizing: border-box;
      }

      /* Pricing action mobile - add top padding */
      .pricing-action {
        padding-top: 40px !important;
        margin-top: 30px !important;
      }

      /* Articles section mobile - improved layout */
      .articles-section .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      .articles-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
        max-width: 600px !important; /* Increase max width */
        margin: 0 auto !important; /* Center the grid */
        justify-items: center !important; /* Center grid items */
      }

      .article-card {
        width: 100% !important;
        max-width: 480px !important; /* Wider cards */
        padding: 24px !important;
        margin: 0 auto !important; /* Center each card */
        box-sizing: border-box;
      }

      .article-card h3 {
        font-size: 18px !important;
        margin-bottom: 12px !important;
      }

      .article-card p {
        font-size: 14px !important;
        line-height: 1.6 !important;
      }

      /* Articles action mobile - add top padding */
      .articles-action {
        padding-top: 40px !important;
        margin-top: 30px !important;
      }

      /* Advice section mobile - minimal changes */
      .advice-section .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      .form-input {
        font-size: 16px; /* Prevent zoom on iOS */
      }

      /* Login section mobile - add top padding */
      .login-section {
        padding-top: 40px !important;
        margin-top: 30px !important;
      }

      /* Footer mobile - minimal changes */
      .footer .container {
        padding-left: 16px;
        padding-right: 16px;
      }

      /* SMS Contact button mobile - minimal changes */
      .sms-contact {
        bottom: 20px;
        right: 20px;
      }
    }

    @media (max-width: 480px) {
      /* Extra small mobile adjustments - minimal changes */
      .logo {
        height: 26px;
      }

      .mobile-menu-btn {
        width: 25px;
        height: 20px;
      }

      .hamburger-line {
        height: 2px;
      }

      .mobile-menu-btn.active .hamburger-line:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
      }

      .mobile-menu-btn.active .hamburger-line:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
      }
    }

    /* Hide all 3D elements on mobile and tablet */
    @media (max-width: 1024px) {
      .play-button-3d,
      .analytics-3d-icon,
      .analytics-outside,
      .course-3d-icon,
      .glass-decoration,
      .minimal-glass-decoration,
      .korporativ-glass-decoration,
      .samarali-dars-decoration,
      .oxirgi-dars-decoration,
      .theme-toggle .moon-icon,
      .theme-toggle .sun-icon {
        display: none !important;
      }

      /* Keep only basic theme toggle on mobile */
      .theme-toggle {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .theme-toggle::after {
        content: '🌙';
        font-size: 16px;
        filter: grayscale(0.3);
      }

      .theme-toggle.active::after {
        content: '☀️';
      }

      /* Remove neon dots on mobile */
      .neon-dots-container {
        display: none !important;
      }

      /* Simplify cards without 3D elements */
      .hero-feature-card.analytics-card,
      .platform-feature-card.course-card,
      .platform-feature-card.brending-card,
      .pricing-card.minimal-card,
      .pricing-card.korporativ-card,
      .article-card.samarali-dars-card,
      .article-card.oxirgi-dars-card {
        position: relative;
      }

      /* Clean up positioning without 3D elements */
      .hero-features-grid,
      .platform-features-grid,
      .pricing-grid,
      .articles-grid {
        position: static;
      }
    }

    /* Ensure smooth animations */
    * {
      -webkit-tap-highlight-color: transparent;
    }

    /* Prevent horizontal scroll on mobile */
    @media (max-width: 768px) {
      body {
        overflow-x: hidden;
      }

      .container {
        max-width: 100%;
        overflow: hidden;
      }
    }
  `;

  document.head.appendChild(style);
}

// Initialize mobile language dropdown
function initMobileLanguageDropdown() {
  const mobileLangSelected = document.getElementById('mobileLangSelected');
  const mobileLangOptions = document.getElementById('mobileLangOptions');
  const mobileLangDropdown = document.querySelector('.mobile-lang-dropdown');

  if (!mobileLangSelected || !mobileLangOptions || !mobileLangDropdown) {
    return;
  }

  // Toggle dropdown
  mobileLangSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileLangDropdown.classList.toggle('open');
  });

  // Handle language selection
  mobileLangOptions.addEventListener('click', (e) => {
    const langOption = e.target.closest('.mobile-lang-option');
    if (!langOption) return;

    // Remove active class from all options
    mobileLangOptions.querySelectorAll('.mobile-lang-option').forEach(option => {
      option.classList.remove('active');
    });

    // Add active class to selected option
    langOption.classList.add('active');

    // Update selected display
    const flag = langOption.querySelector('.mobile-flag-img').src;
    const text = langOption.querySelector('span').textContent;
    const lang = langOption.dataset.lang;

    mobileLangSelected.querySelector('.mobile-flag-img').src = flag;
    mobileLangSelected.querySelector('span').textContent = text;

    // Store selected language for home page
    localStorage.setItem('homeLanguage', lang);
    currentHomeLanguage = lang;

    // Close dropdown
    mobileLangDropdown.classList.remove('open');

    // Update page language attribute
    document.documentElement.lang = lang;

    // Also update desktop language selector
    const desktopLangSelected = document.getElementById('langSelected');
    if (desktopLangSelected) {
      desktopLangSelected.querySelector('.flag-img').src = flag;
      desktopLangSelected.querySelector('span').textContent = text;
    }

    // Update all translations on the page
    updateHomeTranslations();

    console.log('Mobile home page language changed to:', lang);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileLangDropdown.contains(e.target)) {
      mobileLangDropdown.classList.remove('open');
    }
  });
}

// Initialize mobile theme toggle
function initMobileThemeToggle() {
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  const mobileThemeText = mobileThemeToggle?.querySelector('.mobile-theme-text');
  const mobileToggleSlider = mobileThemeToggle?.querySelector('.mobile-toggle-slider');

  if (!mobileThemeToggle || !mobileThemeText || !mobileToggleSlider) {
    return;
  }

  // Check for saved theme preference - default to dark mode
  const savedTheme = localStorage.getItem('theme') || 'dark';
  let isDark = savedTheme === 'dark';

  // Set initial state - dark mode is default
  if (isDark) {
    mobileToggleSlider.classList.add('active');
    mobileThemeText.textContent = 'Light Mode';
  } else {
    mobileToggleSlider.classList.remove('active');
    mobileThemeText.textContent = 'Dark Mode';
  }
  
  // Apply initial theme
  applyTheme(isDark);

  mobileThemeToggle.addEventListener('click', function() {
    // Toggle theme
    isDark = !isDark;

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update mobile toggle appearance
    if (isDark) {
      mobileToggleSlider.classList.add('active');
      mobileThemeText.textContent = 'Light Mode';
    } else {
      mobileToggleSlider.classList.remove('active');
      mobileThemeText.textContent = 'Dark Mode';
    }

    // Also update desktop theme toggle if it exists
    const desktopThemeToggle = document.getElementById('themeToggle');
    if (desktopThemeToggle) {
      const sunIcon = desktopThemeToggle.querySelector('.sun-icon');
      const moonIcon = desktopThemeToggle.querySelector('.moon-icon');

      if (sunIcon && moonIcon) {
        if (isDark) {
          sunIcon.classList.remove('active');
          moonIcon.classList.add('active');
        } else {
          moonIcon.classList.remove('active');
          sunIcon.classList.add('active');
        }
      }
    }

    // Apply actual theme changes
    applyTheme(isDark);
    
    console.log(`Mobile theme switched to: ${isDark ? 'dark' : 'light'} mode`);
  });

}

// Initialize dynamic articles for home page
async function initDynamicArticles() {
  try {
    console.log('Initializing dynamic articles...');
    
    // Wait a bit for DOM to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize dynamic articles using the replaceLandingArticles function
    const dynamicArticles = await replaceLandingArticles({
      limit: 6,
      showLoadingState: true,
      showErrorState: true,
      fallbackToStatic: true,
      enableRealTime: true,
      showUpdateNotifications: true
    });
    
    if (dynamicArticles) {
      console.log('✅ Dynamic articles initialized successfully');
    } else {
      console.warn('⚠️ Dynamic articles initialization returned null - using fallback content');
    }
  } catch (error) {
    console.error('❌ Failed to initialize dynamic articles:', error);
    
    // If dynamic loading fails, show a simple message
    const container = document.getElementById('dynamic-articles-container');
    if (container) {
      container.innerHTML = `
        <div class="articles-loading-error">
          <p>Maqolalar yuklanmadi. Iltimos, sahifani yangilang.</p>
          <button onclick="window.location.reload()" class="btn-retry">Qayta urinish</button>
        </div>
      `;
    }
  }
}

// Floating Chat Widget Functions
function toggleChatBubble() {
  const bubble = document.getElementById('chatSpeechBubble');
  if (bubble) {
    if (bubble.style.display === 'none' || bubble.style.display === '') {
      bubble.style.display = 'block';
    } else {
      bubble.style.display = 'none';
    }
  }
}

function closeChatBubble() {
  const bubble = document.getElementById('chatSpeechBubble');
  if (bubble) {
    bubble.style.display = 'none';
  }
}

function openTelegramBot() {
  // Open Telegram bot in new tab
  window.open('https://t.me/darslinker_bot', '_blank');
  // Close popup after opening bot
  closeTelegramBotMessage();
}

// ESC key to close chat bubble and SMS bubble
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const chatBubble = document.getElementById('chatSpeechBubble');
    const smsBubble = document.getElementById('smsSpeechBubble');
    
    if (chatBubble && chatBubble.style.display === 'block') {
      closeChatBubble();
    }
    
    if (smsBubble && smsBubble.style.display === 'block') {
      closeSMSBubble();
    }
  }
});

// Click outside bubbles to close
document.addEventListener('click', function(e) {
  const chatBubble = document.getElementById('chatSpeechBubble');
  const chatIcon = document.getElementById('floatingChatIcon');
  const smsBubble = document.getElementById('smsSpeechBubble');
  const smsContact = document.getElementById('smsContact');
  
  // Close chat bubble if clicked outside
  if (chatBubble && chatBubble.style.display === 'block') {
    if (!chatBubble.contains(e.target) && !chatIcon.contains(e.target)) {
      closeChatBubble();
    }
  }
  
  // Close SMS bubble if clicked outside
  if (smsBubble && smsBubble.style.display === 'block') {
    if (!smsBubble.contains(e.target) && !smsContact.contains(e.target)) {
      closeSMSBubble();
    }
  }
});

// Make functions globally available
window.toggleChatBubble = toggleChatBubble;
window.closeChatBubble = closeChatBubble;
window.openTelegramBot = openTelegramBot;
window.closeSMSBubble = closeSMSBubble;