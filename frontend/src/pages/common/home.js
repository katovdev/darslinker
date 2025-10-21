import { router } from '../../utils/router.js';
import { store } from '../../utils/store.js';

export function initHomePage() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="page">
      <header class="header">
        <div class="container">
          <nav class="nav">
            <div class="logo">Dars Linker</div>
            <ul class="nav-links">
              <li><a href="/courses" onclick="router.navigate('/courses'); return false;">Kurslar</a></li>
              <li><a href="/about" onclick="router.navigate('/about'); return false;">Biz haqimizda</a></li>
              <li><a href="/login" onclick="router.navigate('/login'); return false;">Kirish</a></li>
              <li><a href="/register" onclick="router.navigate('/register'); return false;" class="btn btn-primary">Ro'yxatdan o'tish</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <!-- Hero Section -->
          <section class="hero text-center mb-8">
            <h1>O'zbekiston EdTech Platformasiga Xush Kelibsiz</h1>
            <p class="text-lg mb-6">Professional video kurslarni yarating, sotish va o'rganing. O'qituvchilar va o'quvchilar uchun zamonaviy platforma.</p>
            <div class="flex justify-center gap-4">
              <a href="/register" onclick="router.navigate('/register'); return false;" class="btn btn-primary btn-lg">Bepul Boshlash</a>
              <a href="/courses" onclick="router.navigate('/courses'); return false;" class="btn btn-secondary btn-lg">Kurslarni Ko'rish</a>
            </div>
          </section>

          <!-- Features Section -->
          <section class="features mb-8">
            <h2 class="text-center mb-6">Nima Uchun Dars Linker?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="card text-center">
                <h3>O'qituvchilar Uchun</h3>
                <p>Video kurslarni yarating, modullarni tartibga soling va o'quvchilar bilan professional tarzda ishlang.</p>
                <ul class="text-left mt-4">
                  <li>• Video yuklash va boshqarish</li>
                  <li>• Test va vazifalar yaratish</li>
                  <li>• Moliyaviy hisobotlar</li>
                  <li>• O'quvchilar bilan aloqa</li>
                </ul>
              </div>

              <div class="card text-center">
                <h3>O'quvchilar Uchun</h3>
                <p>Qulay interfeysda o'rganing, progressni kuzating va sertifikat oling.</p>
                <ul class="text-left mt-4">
                  <li>• HD video darslar</li>
                  <li>• Offline yuklab olish</li>
                  <li>• Progress kuzatish</li>
                  <li>• Raqamli sertifikatlar</li>
                </ul>
              </div>

              <div class="card text-center">
                <h3>Platforma Imkoniyatlari</h3>
                <p>Zamonaviy texnologiyalar va xavfsiz to'lov tizimi bilan ishlaydigan platforma.</p>
                <ul class="text-left mt-4">
                  <li>• Click, Payme to'lovlari</li>
                  <li>• AI bilan savol-javob</li>
                  <li>• Promo-kodlar tizimi</li>
                  <li>• Forum va chat</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- CTA Section -->
          <section class="cta text-center">
            <div class="card">
              <h2>Bugun boshlang!</h2>
              <p class="mb-6">O'zbekiston edtech sohasida birinchi qadam tashlang va professional kurslar yarating yoki o'rganing.</p>
              <a href="/register" onclick="router.navigate('/register'); return false;" class="btn btn-primary btn-lg">Bepul Ro'yxatdan O'tish</a>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer">
        <div class="container text-center">
          <p>&copy; 2024 Dars Linker. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  `;

  // Update store
  store.setState({ currentPage: 'home' });
}