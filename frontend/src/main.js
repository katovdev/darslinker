import './assets/styles/main.css';
import { router } from './utils/router.js';
import { store } from './utils/store.js';
import { config } from './utils/config.js';

import { initHomePage } from './pages/common/home.js';
import { initLoginPage } from './pages/auth/login.js';
import { initRegisterPage } from './pages/auth/register.js';
import { initDashboard } from './pages/common/dashboard.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    console.log(`Initializing ${config.app.name}...`);

    this.setupRoutes();

    store.subscribe((state) => {
      console.log('State updated:', state);
    });

    router.init();
  }

  setupRoutes() {
    router.register('/', initHomePage);
    router.register('/login', initLoginPage);
    router.register('/register', initRegisterPage);
    router.register('/dashboard', initDashboard);

    router.register('*', () => {
      document.querySelector('#app').innerHTML = `
        <div class="error-page">
          <h1>404 - Sahifa topilmadi</h1>
          <p>Siz qidirayotgan sahifa mavjud emas.</p>
          <a href="/" onclick="router.navigate('/'); return false;">Bosh sahifaga qaytish</a>
        </div>
      `;
    });
  }
}

new App();