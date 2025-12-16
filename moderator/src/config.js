export const config = {
  app: {
    name: 'Dars Linker Moderator',
    description: "O'zbekiston EdTech Platformasi - Moderator Panel",
    version: '1.0.0'
  },
  api: {
    // Auto-switch between development and production
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8001/api'  // Development
      : 'https://darslinker-backend.onrender.com/api'  // Production
  },
  routes: {
    home: '/',
    login: '/login',
    dashboard: '/dashboard',
    blog: '/blog',
    advice: '/advice',
    teachers: '/teachers',
    analytics: '/analytics'
  }
};