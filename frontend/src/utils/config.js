export const config = {
  app: {
    name: 'Dars Linker',
    description: "O'zbekiston EdTech Platformasi",
    version: '1.0.0'
  },
  api: {
    baseUrl: 'http://localhost:8001/api'
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