export const config = {
  app: {
    name: 'Dars Linker',
    description: "O'zbekiston EdTech Platformasi",
    version: '1.0.0'
  },
  api: {
    // Use production backend URL, fallback to localhost for development
    baseUrl: import.meta.env.VITE_API_URL || 'https://darslinker-backend.onrender.com/api'
  },
  routes: {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    courses: '/courses',
    profile: '/profile'
  },
  userRoles: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  }
};