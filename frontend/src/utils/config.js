export const config = {
  app: {
    name: 'Dars Linker',
    description: "O'zbekiston EdTech Platformasi",
    version: '1.0.0'
  },
  api: {
    baseUrl: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : 'https://darslinker.uz/api'
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