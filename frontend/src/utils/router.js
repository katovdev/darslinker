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
    const handler = this.routes[path] || this.routes['*'];
    if (handler) {
      this.currentRoute = path;
      handler();
      // Scroll to top after route change
      window.scrollTo(0, 0);
    } else {
      console.warn(`No handler found for route: ${path}`);
    }
  }

  init() {
    this.route(window.location.pathname);
  }
}

export const router = new Router();