export const config = {
  app: {
    name: 'Dars Linker',
    description: "O'zbekiston EdTech Platformasi",
    version: '1.0.0'
  },
  api: {
    // Prefer explicit env override, otherwise auto-switch between local and prod
    baseUrl: (() => {
      const normalize = (url) => {
        if (!url) return null;
        let raw = url.trim();
        // Remove leading dots and enforce https:// if missing
        raw = raw.replace(/^\.+/, '');
        if (!/^https?:\/\//i.test(raw)) {
          raw = `https://${raw.replace(/^\/+/, '')}`;
        }
        // Strip trailing slash
        return raw.replace(/\/+$/, '');
      };

      const envUrl = normalize(import.meta.env.VITE_API_URL);
      if (envUrl) return envUrl;

      // Fallbacks
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8001/api'; // Development
      }
      return 'https://api.darslinker.uz/api'; // Production
    })()
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
