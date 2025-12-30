export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;

    window.addEventListener('popstate', () => {
      this.route(window.location.pathname);
    });
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.route(path);
    // Scroll to top after navigation
    window.scrollTo(0, 0);
  }

  route(path) {
    // First try exact match
    let handler = this.routes[path];
    let params = {};
    
    // If no exact match, try parameterized routes
    if (!handler) {
      for (const routePath in this.routes) {
        const match = this.matchRoute(routePath, path);
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
      this.currentRoute = path;
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
    this.route(window.location.pathname);
  }
}

export const router = new Router();
