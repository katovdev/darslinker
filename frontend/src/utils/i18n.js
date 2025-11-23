// Translation system for multi-language support

const translations = {
  en: {
    // Header
    'header.newMeeting': 'New meeting',
    'header.telegramBot': 'Telegram Bot',
    'header.newCourse': 'New Course',
    
    // Dashboard
    'dashboard.title': 'Teacher dashboard',
    'dashboard.profile.editProfile': 'Edit profile',
    'dashboard.profile.customizeUI': 'Customize UI',
    'dashboard.profile.joined': 'Joined',
    'dashboard.profile.reviews': 'reviews',
    
    // Sidebar
    'sidebar.general': 'General',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.profile': 'Profile',
    'sidebar.messages': 'Messages',
    'sidebar.contentManagement': 'Content Management',
    'sidebar.createCourse': 'Create Course',
    'sidebar.myCourses': 'My Courses',
    'sidebar.drafts': 'Drafts',
    'sidebar.archived': 'Archived',
    'sidebar.finance': 'Finance',
    'sidebar.assignments': 'Assignments',
    'sidebar.aiAssistant': 'AI Assistant',
    'sidebar.analytics': 'Analytics',
    'sidebar.quizAnalytics': 'Quiz Analytics',
    'sidebar.ratingComments': 'Rating Comments',
    'sidebar.studentsAnalytics': 'Students Analytics',
    'sidebar.engagement': 'Engagement',
    'sidebar.progress': 'Progress',
    'sidebar.rolls': 'Rolls',
    'sidebar.subAdmin': 'Sub Admin',
    'sidebar.settings': 'Settings',
    'sidebar.language': 'Language',
    'sidebar.customizeUI': 'Customize UI',
    'sidebar.mySubscription': 'My Subscription',
    
    // Stats
    'stats.myStatistics': 'My Statistics',
    'stats.activeCourses': 'Active Courses',
    'stats.totalStudents': 'Total Students',
    'stats.totalRevenue': 'Total Revenue',
    'stats.avgRating': 'Avg. Rating',
    'stats.achievements': 'Achievements',
    'stats.topInstructor': 'Top Instructor',
    'stats.students1000': '1000+ Students',
    'stats.revenue10k': '$10K+ Revenue',
    'stats.highRating': 'High Rating',
    'stats.bioSpecialties': 'Bio & Specialties',
    'stats.edit': 'Edit',
    
    // Sub Admin
    'subAdmin.title': 'Sub admins',
    'subAdmin.search': 'Search sub admins...',
    'subAdmin.addSubadmin': 'Add Subadmin',
    'subAdmin.telephone': 'Telephone',
    'subAdmin.added': 'Added',
    'subAdmin.addNew': 'Add New Sub Admin',
    'subAdmin.fullName': 'Full Name',
    'subAdmin.email': 'Email Address',
    'subAdmin.phone': 'Telephone',
    'subAdmin.cancel': 'Cancel',
    'subAdmin.addAdmin': 'Add Admin',
    'subAdmin.deleteConfirm': 'Remove Sub Admin?',
    'subAdmin.deleteMessage': 'Are you sure you want to remove',
    'subAdmin.deleteMessageEnd': 'as sub admin? This action cannot be undone.',
    'subAdmin.remove': 'Remove',
    
    // Language Page
    'language.title': 'Language',
    'language.choosePreferred': 'Choose your preferred language',
    'language.english': 'English',
    'language.uzbek': 'Uzbek',
    'language.russian': 'Russian',
    'language.applyChanges': 'Apply changes',
    'language.back': 'Back',
  },
  
  uz: {
    // Header
    'header.newMeeting': 'Yangi uchrashuv',
    'header.telegramBot': 'Telegram Bot',
    'header.newCourse': 'Yangi Kurs',
    
    // Dashboard
    'dashboard.title': "O'qituvchi paneli",
    'dashboard.profile.editProfile': 'Profilni tahrirlash',
    'dashboard.profile.customizeUI': 'Interfeys sozlamalari',
    'dashboard.profile.joined': "Qo'shildi",
    'dashboard.profile.reviews': 'sharh',
    
    // Sidebar
    'sidebar.general': 'Asosiy',
    'sidebar.dashboard': 'Bosh sahifa',
    'sidebar.profile': 'Profil',
    'sidebar.messages': 'Xabarlar',
    'sidebar.contentManagement': 'Kontent boshqaruvi',
    'sidebar.createCourse': 'Kurs yaratish',
    'sidebar.myCourses': 'Mening kurslarim',
    'sidebar.drafts': 'Qoralamalar',
    'sidebar.archived': 'Arxivlangan',
    'sidebar.finance': 'Moliya',
    'sidebar.assignments': 'Topshiriqlar',
    'sidebar.aiAssistant': 'AI Yordamchi',
    'sidebar.analytics': 'Tahlil',
    'sidebar.quizAnalytics': 'Test tahlili',
    'sidebar.ratingComments': 'Reyting va sharhlar',
    'sidebar.studentsAnalytics': "O'quvchilar tahlili",
    'sidebar.engagement': 'Faollik',
    'sidebar.progress': 'Jarayon',
    'sidebar.rolls': 'Rollar',
    'sidebar.subAdmin': 'Yordamchi admin',
    'sidebar.settings': 'Sozlamalar',
    'sidebar.language': 'Til',
    'sidebar.customizeUI': 'Interfeys sozlamalari',
    'sidebar.mySubscription': 'Mening obuna',
    
    // Stats
    'stats.myStatistics': 'Mening statistikam',
    'stats.activeCourses': 'Faol kurslar',
    'stats.totalStudents': "Jami o'quvchilar",
    'stats.totalRevenue': 'Jami daromad',
    'stats.avgRating': "O'rtacha reyting",
    'stats.achievements': 'Yutuqlar',
    'stats.topInstructor': "Eng yaxshi o'qituvchi",
    'stats.students1000': "1000+ o'quvchi",
    'stats.revenue10k': '$10K+ daromad',
    'stats.highRating': 'Yuqori reyting',
    'stats.bioSpecialties': 'Bio va mutaxassislik',
    'stats.edit': 'Tahrirlash',
    
    // Sub Admin
    'subAdmin.title': 'Yordamchi adminlar',
    'subAdmin.search': 'Yordamchi adminlarni qidirish...',
    'subAdmin.addSubadmin': 'Yordamchi admin qo\'shish',
    'subAdmin.telephone': 'Telefon',
    'subAdmin.added': "Qo'shildi",
    'subAdmin.addNew': "Yangi yordamchi admin qo'shish",
    'subAdmin.fullName': 'To\'liq ism',
    'subAdmin.email': 'Email manzil',
    'subAdmin.phone': 'Telefon',
    'subAdmin.cancel': 'Bekor qilish',
    'subAdmin.addAdmin': "Admin qo'shish",
    'subAdmin.deleteConfirm': 'Yordamchi adminni o\'chirish?',
    'subAdmin.deleteMessage': 'Rostdan ham',
    'subAdmin.deleteMessageEnd': 'ni yordamchi admin sifatida o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.',
    'subAdmin.remove': "O'chirish",
    
    // Language Page
    'language.title': 'Til',
    'language.choosePreferred': 'O\'zingizga qulay tilni tanlang',
    'language.english': 'Ingliz tili',
    'language.uzbek': 'O\'zbek tili',
    'language.russian': 'Rus tili',
    'language.applyChanges': 'O\'zgarishlarni saqlash',
    'language.back': 'Orqaga',
  },
  
  ru: {
    // Header
    'header.newMeeting': 'Новая встреча',
    'header.telegramBot': 'Telegram Бот',
    'header.newCourse': 'Новый курс',
    
    // Dashboard
    'dashboard.title': 'Панель учителя',
    'dashboard.profile.editProfile': 'Редактировать профиль',
    'dashboard.profile.customizeUI': 'Настроить интерфейс',
    'dashboard.profile.joined': 'Присоединился',
    'dashboard.profile.reviews': 'отзывов',
    
    // Sidebar
    'sidebar.general': 'Основное',
    'sidebar.dashboard': 'Главная',
    'sidebar.profile': 'Профиль',
    'sidebar.messages': 'Сообщения',
    'sidebar.contentManagement': 'Управление контентом',
    'sidebar.createCourse': 'Создать курс',
    'sidebar.myCourses': 'Мои курсы',
    'sidebar.drafts': 'Черновики',
    'sidebar.archived': 'Архивированные',
    'sidebar.finance': 'Финансы',
    'sidebar.assignments': 'Задания',
    'sidebar.aiAssistant': 'AI Помощник',
    'sidebar.analytics': 'Аналитика',
    'sidebar.quizAnalytics': 'Аналитика тестов',
    'sidebar.ratingComments': 'Рейтинг и комментарии',
    'sidebar.studentsAnalytics': 'Аналитика студентов',
    'sidebar.engagement': 'Вовлеченность',
    'sidebar.progress': 'Прогресс',
    'sidebar.rolls': 'Роли',
    'sidebar.subAdmin': 'Помощник админа',
    'sidebar.settings': 'Настройки',
    'sidebar.language': 'Язык',
    'sidebar.customizeUI': 'Настроить интерфейс',
    'sidebar.mySubscription': 'Моя подписка',
    
    // Stats
    'stats.myStatistics': 'Моя статистика',
    'stats.activeCourses': 'Активные курсы',
    'stats.totalStudents': 'Всего студентов',
    'stats.totalRevenue': 'Общий доход',
    'stats.avgRating': 'Средний рейтинг',
    'stats.achievements': 'Достижения',
    'stats.topInstructor': 'Лучший преподаватель',
    'stats.students1000': '1000+ студентов',
    'stats.revenue10k': '$10K+ дохода',
    'stats.highRating': 'Высокий рейтинг',
    'stats.bioSpecialties': 'Био и специализация',
    'stats.edit': 'Редактировать',
    
    // Sub Admin
    'subAdmin.title': 'Помощники админа',
    'subAdmin.search': 'Поиск помощников админа...',
    'subAdmin.addSubadmin': 'Добавить помощника',
    'subAdmin.telephone': 'Телефон',
    'subAdmin.added': 'Добавлен',
    'subAdmin.addNew': 'Добавить нового помощника админа',
    'subAdmin.fullName': 'Полное имя',
    'subAdmin.email': 'Email адрес',
    'subAdmin.phone': 'Телефон',
    'subAdmin.cancel': 'Отмена',
    'subAdmin.addAdmin': 'Добавить админа',
    'subAdmin.deleteConfirm': 'Удалить помощника админа?',
    'subAdmin.deleteMessage': 'Вы уверены, что хотите удалить',
    'subAdmin.deleteMessageEnd': 'как помощника админа? Это действие нельзя отменить.',
    'subAdmin.remove': 'Удалить',
    
    // Language Page
    'language.title': 'Язык',
    'language.choosePreferred': 'Выберите предпочитаемый язык',
    'language.english': 'Английский',
    'language.uzbek': 'Узбекский',
    'language.russian': 'Русский',
    'language.applyChanges': 'Применить изменения',
    'language.back': 'Назад',
  }
};

// Get current language from localStorage or default to 'en'
export function getCurrentLanguage() {
  return localStorage.getItem('appLanguage') || 'en';
}

// Set language
export function setLanguage(lang) {
  localStorage.setItem('appLanguage', lang);
  // Trigger custom event for language change
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get translation
export function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}

// Initialize language system
export function initI18n() {
  // Set default language if not set
  if (!localStorage.getItem('appLanguage')) {
    setLanguage('en');
  }
}
