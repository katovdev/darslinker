import { applyLanguageToPath, detectLanguageFromPath, setLanguage, stripLanguageFromPath, getCurrentLanguage } from './i18n.js';

export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentLanguage = detectLanguageFromPath(window.location.pathname);
    setLanguage(this.currentLanguage, { emitEvent: false });

    window.addEventListener('popstate', () => {
      this.route(window.location.pathname);
    });

    // React to language changes triggered from UI
    window.addEventListener('languageChanged', (event) => {
      const lang = event.detail?.language || getCurrentLanguage();
      this.currentLanguage = lang;
      const { path } = stripLanguageFromPath(window.location.pathname);
      const target = applyLanguageToPath(path, lang);
      if (target !== window.location.pathname) {
        window.history.replaceState({}, '', target);
      }
      this.route(target);
    });
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    const normalizedPath = this.normalizePathWithLanguage(path);
    window.history.pushState({}, '', normalizedPath);
    this.route(normalizedPath);
    // Scroll to top after navigation
    window.scrollTo(0, 0);
  }

  route(path) {
    // Determine language from the incoming path
    const { lang, path: strippedPath } = stripLanguageFromPath(path);
    if (lang !== this.currentLanguage) {
      this.currentLanguage = lang;
      setLanguage(lang, { emitEvent: false });
    }

    // First try exact match
    let handler = this.routes[strippedPath];
    let params = {};

    // If no exact match, try parameterized routes
    if (!handler) {
      for (const routePath in this.routes) {
        const match = this.matchRoute(routePath, strippedPath);
        if (match) {
          handler = this.routes[routePath];
          params = match.params;
          break;
        }
      }
    }

    // If still no match, try wildcard
    if (!handler) {
      handler = this.routes['*'];
    }

    if (handler) {
      this.currentRoute = strippedPath;
      handler(params);
      // Scroll to top after route change
      window.scrollTo(0, 0);
    } else {
      console.warn(`No handler found for route: ${path}`);
    }
  }

  matchRoute(routePath, actualPath) {
    // Wildcard route matches anything
    if (routePath === '*') {
      return { params: {} };
    }

    // Convert route path to regex pattern
    // e.g., /course/:courseId -> /course/([^/]+)
    const paramNames = [];
    const pattern = routePath.replace(/:([^/]+)/g, (match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${pattern}$`);
    const match = actualPath.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { params };
    }

    return null;
  }

  init() {
    // Use URL first for language, fallback to stored
    const urlLang = detectLanguageFromPath(window.location.pathname);
    const effectiveLang = urlLang || getCurrentLanguage();
    this.currentLanguage = effectiveLang;
    setLanguage(effectiveLang, { emitEvent: false });
    const normalized = this.normalizePathWithLanguage(window.location.pathname);
    this.route(normalized);
  }

  normalizePathWithLanguage(path) {
    const safePath = path.startsWith('/') ? path : `/${path}`;
    // If path already has a supported language, preserve it
    const { lang } = stripLanguageFromPath(safePath);
    const targetLang = lang || this.currentLanguage || getCurrentLanguage();
    return applyLanguageToPath(safePath, targetLang);
  }
}

export const router = new Router();
