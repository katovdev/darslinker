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
  }

  route(path) {
    const handler = this.routes[path] || this.routes['*'];
    if (handler) {
      this.currentRoute = path;
      handler();
    } else {
      console.warn(`No handler found for route: ${path}`);
    }
  }

  init() {
    this.route(window.location.pathname);
  }
}

export const router = new Router();