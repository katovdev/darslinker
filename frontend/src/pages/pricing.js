import { router } from '../utils/router.js';
import { store } from '../utils/store.js';

// Cleanup function to remove pricing styles
export function cleanupPricingStyles() {
  const existingStyle = document.getElementById('pricing-page-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
}

export function initPricingPage() {
  // Clean up any existing pricing styles first
  cleanupPricingStyles();

  const app = document.querySelector('#app');

  // Make router available globally for onclick handlers
  window.router = router;

  app.innerHTML = `
    <div class="pricing-page-container">
      <!-- Pricing Section -->
      <section class="pricing-section">
        <div class="container">
          <h2 class="section-title">Tariflar & Narxlar</h2>

        <!-- Payment Methods -->
        <div class="payment-methods-section">
          <div class="payment-methods">
            <img src="/images/Group 47.png" alt="Uzum" class="payment-logo" />
            <img src="/images/Group 39.png" alt="Payme" class="payment-logo" />
            <img src="/images/Group 38.png" alt="Click" class="payment-logo" />
            <img src="/images/Group 48.png" alt="Mastercard" class="payment-logo" />
            <img src="/images/Group 36.png" alt="Visa" class="payment-logo" />
          </div>
        </div>

        <!-- Detailed Features Table -->
        <div class="detailed-features-section">
          <h3 class="detailed-title">Batafsil xususiyatlar</h3>

          <div class="features-table-container">
            <table class="features-table">
              <thead>
                <tr>
                  <th class="feature-category">Xususiyat</th>
                  <th class="plan-header minimal">Minimal</th>
                  <th class="plan-header standard">Standard</th>
                  <th class="plan-header pro">Pro</th>
                  <th class="plan-header korporativ">Korporativ</th>
                </tr>
              </thead>
              <tbody>
                <!-- 1. Profil -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">1. Profil</td>
                </tr>
                <tr>
                  <td class="feature-name">Shaxsiy profil yaratish (rasm, ism, bio, ixtisoslik)</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Reyting va sharh tizimi (o'quvchilar baho berishi)</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Sertifikatlar va yutuqlarni ko'rsatish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'qituvchi faoliyati bo'yicha statistik ko'rsatkichlar (kurslar soni, o'quvchilar soni, daromad)</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 2. Kurs yaratish va boshqarish -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">2. Kurs yaratish va boshqarish</td>
                </tr>
                <tr>
                  <td class="feature-name">Kurs yaratish (nom, tavsif, kategoriya)</td>
                  <td class="feature-cell"><span class="feature-value">2</span></td>
                  <td class="feature-cell"><span class="feature-value">4</span></td>
                  <td class="feature-cell"><span class="feature-value">8</span></td>
                  <td class="feature-cell"><span class="feature-value">∞</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Video yuklash va joylashtirish</td>
                  <td class="feature-cell"><span class="feature-value">20GB</span></td>
                  <td class="feature-cell"><span class="feature-value">40GB</span></td>
                  <td class="feature-cell"><span class="feature-value">60GB</span></td>
                  <td class="feature-cell"><span class="feature-value">∞</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Xodim qo'shish va ularni imkoniyatlarini belgilash</td>
                  <td class="feature-cell"><span class="feature-value">3</span></td>
                  <td class="feature-cell"><span class="feature-value">6</span></td>
                  <td class="feature-cell"><span class="feature-value">12</span></td>
                  <td class="feature-cell"><span class="feature-value">∞</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Onlayn uchrashuv o'tkazish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Darslarga matn, fayl, vazifa qo'shish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kursni modul/bo'limlarga bo'lib joylashtirish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Savol-javob (test) yaratish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Uy vazifa qo'shish va baholash</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Dars ostida AI yordamida o'quvchi savollarga avtomatik javob berish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kurs/Darsni bepul yoki pullik qilish sozlamalari</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kurs materiallarini yangilash va o'zgartirish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kursda nechta o'quvchi o'qiyotganini ko'rsatish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kursda o'quvchilar feedbacklarini qo'shish yoki o'chirish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kursga cover rasm joylash</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Draft rejimi - Kurs videolari to'liq joylangunga qadar tasdiqlanmaguncha platformada turadi.</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 3. Moliyaviy imkoniyatlar -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">3. Moliyaviy imkoniyatlar</td>
                </tr>
                <tr>
                  <td class="feature-name">To'lovlarni kuzatish (hisobotlar)</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Promokod va chegirmalar yaratish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Click/Payme/Uzum orqali to'lovlarni qabul qilish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 4. Kommunikatsiya va aloqa -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">4. Kommunikatsiya va aloqa</td>
                </tr>
                <tr>
                  <td class="feature-name">Kurs ichida chat funksiyasi (O'qituvchiga alohida savol yo'llash)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">AI yordamida tez-tez beriladigan savollarga avtomatik javob berish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Telegram bot orqali savollarga javob berish (faqat o'quvchiga tegishli bot)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 5. Baholash va kuzatuv -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">5. Baholash va kuzatuv</td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchilar faoliyatini kuzatish (kim nechta darsni tugatganini ko'rish)</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Ayni damda platformada nechta o'quvchi o'qiyotganini ko'rib turish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Test natijalarini kuzatish</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchilarga avtomatik xabar (reminder) yuborish (bot & platforma orqali)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 6. AI qo'llab-quvvatlash -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">6. AI qo'llab-quvvatlash</td>
                </tr>
                <tr>
                  <td class="feature-name">AI yordamida test savollari yaratish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">AI yordamida kurs tavsifi yozish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Dars ostidagi savollarga AI avtomatik javob berishi</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Test va topshiriqlar tahlili</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchilar qayerda kursni tark etayotganini tahlili</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 7. Maxsus imkoniyatlar -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">7. Maxsus imkoniyatlar</td>
                </tr>
                <tr>
                  <td class="feature-name">O'qituvchi uchun maxsus sayt (landing)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">SEO google qidiruv</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Brendga mos dizayn</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kurs yakunida avtomatik sertifikat generatsiyasi</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'qituvchilar uchun maxsus "mentor panel" (eng faol o'quvchilarni ajratib ko'rsatish)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Platformadan ro'yhatdan o'tgan o'quvchilar ro'yhati</td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Kurslarni muxofaza qilish – video darslarni ko'chirilishi oldini olish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">E'lon joylash – aksiyalar, yangi kurslar yoki boshqa e'lon joylash</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Gamification – o'quvchilar darslarni bajarish davomida ballar to'plashi</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 8. Telegram bot -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">8. Telegram bot</td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchilar uchun alohida bot - faqat eslatma yoki savollarga javob olishi</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'qtuvchilar uchun yangi ro'yhatdan o'tgan o'quvchi haqida ma'lumot</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchining yangi to'lov qilgani va qaysi darsni boshlagani haqida ma'lumot</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">O'quvchilarni bergan savollari va ularga javob berish</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>

                <!-- 11. Korporativ -->
                <tr class="category-header">
                  <td colspan="5" class="category-title">11. Korporativ</td>
                </tr>
                <tr>
                  <td class="feature-name">Pro tarif imkoniyatlari</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Shaxsiy domein</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
                <tr>
                  <td class="feature-name">Mobil ilova (Android & iOS)</td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check no">✗</span></td>
                  <td class="feature-cell"><span class="check yes">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </div>
      </section>

      <!-- Neon Dots Background -->
      <div class="neon-dots-container" id="neonDotsContainer"></div>
    </div>
  `;

  // Initialize page effects
  initPricingPageEffects();

  // Initialize neon dots
  createNeonDots();

  // Update store
  store.setState({ currentPage: 'pricing' });
}

function initPricingPageEffects() {
  // Add styles
  addPricingPageStyles();
}

// Same functions from home page with slight modifications for pricing page
function addPricingPageStyles() {
  // Remove existing pricing styles if any
  const existingStyle = document.getElementById('pricing-page-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'pricing-page-styles';
  style.textContent = `
    /* Pricing Page Specific Styles */
    .pricing-page-container {
      background: #232323;
      color: white;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }

    /* Back Button */
    .back-button-container {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(126, 162, 212, 0.9);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(20px);
      border: 2px solid rgba(126, 162, 212, 0.3);
    }

    .back-btn:hover {
      background: rgba(126, 162, 212, 1);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(126, 162, 212, 0.4);
    }

    .back-btn svg {
      transition: transform 0.3s ease;
    }

    .back-btn:hover svg {
      transform: translateX(-3px);
    }

    .pricing-page-container .pricing-section {
      min-height: 100vh;
      background: #232323;
      color: white;
      padding: 80px 0 50px 0;
      position: relative;
      overflow: hidden;
    }

    .pricing-page-container .payment-methods-section {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem 0;
    }

    .pricing-page-container .payment-methods {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .pricing-page-container .payment-logo {
      height: 40px;
      width: auto;
      transition: transform 0.3s ease;
    }

    .pricing-page-container .payment-logo:hover {
      transform: scale(1.1);
    }

    /* Detailed Features Table */
    .pricing-page-container .detailed-features-section {
      margin: 4rem 0;
      padding: 2rem 0;
    }

    .pricing-page-container .detailed-title {
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      color: #ffffff;
      margin-bottom: 2rem;
      text-shadow: 0 0 20px rgba(126, 162, 212, 0.3);
    }

    .pricing-page-container .features-table-container {
      overflow-x: auto;
      border-radius: 12px;
      background: rgba(58, 56, 56, 0.3);
      border: 2px solid rgba(126, 162, 212, 0.4);
      backdrop-filter: blur(20px);
    }

    .pricing-page-container .features-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .pricing-page-container .features-table th,
    .pricing-page-container .features-table td {
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .pricing-page-container .features-table th {
      background: rgba(126, 162, 212, 0.2);
      font-weight: 700;
      font-size: 1rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .pricing-page-container .feature-category {
      text-align: left !important;
      width: 50%;
      font-size: 1.1rem;
    }

    .pricing-page-container .plan-header {
      width: 12.5%;
      color: #ffffff;
    }

    .pricing-page-container .plan-header.minimal { color: #7EA2D4; }
    .pricing-page-container .plan-header.standard { color: #10b981; }
    .pricing-page-container .plan-header.pro { color: #f59e0b; }
    .pricing-page-container .plan-header.korporativ { color: #8b5cf6; }

    .pricing-page-container .category-header {
      background: rgba(126, 162, 212, 0.1) !important;
    }

    .pricing-page-container .category-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: #7EA2D4;
      text-align: left !important;
      padding: 1.5rem 1rem;
    }

    .pricing-page-container .feature-name {
      text-align: left !important;
      color: #e0e0e0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .pricing-page-container .feature-cell {
      background: rgba(40, 40, 40, 0.3);
    }

    .pricing-page-container .check {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .pricing-page-container .check.yes {
      color: #10b981;
    }

    .pricing-page-container .check.no {
      color: #ef4444;
    }

    .pricing-page-container .feature-value {
      color: #7EA2D4;
      font-weight: 700;
      font-size: 1rem;
    }

    /* Hover effects */
    .pricing-page-container .features-table tbody tr:hover {
      background: rgba(126, 162, 212, 0.05);
    }

    .pricing-page-container .features-table tbody tr:hover .feature-cell {
      background: rgba(126, 162, 212, 0.1);
    }

    /* Mobile responsive for table */
    @media (max-width: 768px) {
      .pricing-page-container .detailed-title {
        font-size: 1.5rem;
      }

      .pricing-page-container .features-table {
        font-size: 0.8rem;
      }

      .pricing-page-container .features-table th,
      .pricing-page-container .features-table td {
        padding: 0.5rem 0.3rem;
      }

      .pricing-page-container .feature-category {
        width: 40%;
      }

      .pricing-page-container .plan-header {
        width: 15%;
      }

      .pricing-page-container .category-title {
        font-size: 1rem;
        padding: 1rem 0.5rem;
      }

      .pricing-page-container .feature-name {
        font-size: 0.8rem;
      }
    }

    /* Copy all pricing styles from home page */
    .pricing-page-container .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .pricing-page-container .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      color: #ffffff;
      margin-bottom: 3rem;
      text-shadow: 0 0 20px rgba(126, 162, 212, 0.3);
    }

    .pricing-page-container .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
      position: relative;
    }

    /* All other pricing card styles copied from home page... */
    .pricing-card {
      background: rgba(58, 56, 56, 0.3);
      border: 2px solid rgba(126, 162, 212, 0.4);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.3s ease;
      height: auto;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .pricing-card:hover {
      transform: translateY(-10px);
      border-color: #7EA2D4;
      box-shadow: 0 20px 40px rgba(126, 162, 212, 0.3);
      background: rgba(58, 56, 56, 0.5);
    }

    .tavsiya-badge {
      position: absolute;
      top: -10px;
      right: 20px;
      background: linear-gradient(135deg, #538bdb, #7ea2d4);
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 10;
    }

    .pricing-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .pricing-header h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .pricing-header.minimal h3 { color: #7EA2D4; }
    .pricing-header.standard h3 { color: #10b981; }
    .pricing-header.pro h3 { color: #f59e0b; }
    .pricing-header.korporativ h3 { color: #8b5cf6; }

    .pricing-features {
      flex: 1;
      margin-bottom: 2rem;
    }

    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.9rem;
    }

    .feature-item.disabled {
      opacity: 0.5;
    }

    .feature-value {
      font-weight: 700;
      color: #7EA2D4;
      font-size: 1.1rem;
    }

    .feature-check {
      font-weight: 700;
      font-size: 1.2rem;
    }

    .feature-item:not(.disabled) .feature-check {
      color: #10b981;
    }

    .feature-item.disabled .feature-check {
      color: #ef4444;
    }

    .pricing-price {
      text-align: center;
      font-size: 1.8rem;
      font-weight: 700;
      padding: 1rem;
      border-radius: 8px;
      margin-top: auto;
    }

    .pricing-price.minimal {
      background: rgba(126, 162, 212, 0.1);
      color: #7EA2D4;
    }
    .pricing-price.standard {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .pricing-price.pro {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .pricing-price.korporativ {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    /* Glass decorations */
    .minimal-glass-decoration,
    .korporativ-glass-decoration {
      position: absolute;
      pointer-events: none;
      z-index: 1;
    }

    .minimal-glass-decoration {
      top: -50px;
      left: -30px;
    }

    .korporativ-glass-decoration {
      bottom: -50px;
      right: -30px;
    }

    .minimal-glass-image,
    .korporativ-glass-image {
      width: 80px;
      height: auto;
      opacity: 0.7;
    }


    /* Footer styles */
    .footer {
      background: rgba(20, 20, 20, 0.95);
      color: white;
      padding: 3rem 0 1rem 0;
      border-top: 1px solid rgba(126, 162, 212, 0.2);
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-logo-img {
      height: 40px;
      width: auto;
    }

    .footer-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-nav-item {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-nav-item:hover {
      color: #7EA2D4;
    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .contact-icon {
      color: #7EA2D4;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-link {
      color: rgba(255, 255, 255, 0.7);
      transition: color 0.3s ease;
    }

    .social-link:hover {
      color: #7EA2D4;
    }

    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
    }

    /* Neon dots */
    .neon-dots-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .neon-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #7EA2D4;
      border-radius: 50%;
      box-shadow: 0 0 10px #7EA2D4, 0 0 20px #7EA2D4, 0 0 30px #7EA2D4;
    }

    .neon-dot.white {
      background: #ffffff;
      box-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff;
    }

    .neon-dot.blink {
      animation: blink 3s ease-in-out infinite;
    }

    .neon-dot.pulse {
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.7; }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .pricing-page-container .pricing-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .pricing-page-container .container {
        padding: 0 1rem;
      }

      .pricing-page-container .section-title {
        font-size: 2rem;
      }

      .pricing-page-container .payment-methods {
        gap: 1rem;
      }

      .pricing-page-container .payment-logo {
        height: 30px;
      }

      .header .container {
        padding: 1rem;
      }

      .nav-menu {
        gap: 1rem;
      }

      .nav-item {
        padding: 0.3rem 0.5rem;
        font-size: 0.9rem;
      }
    }
  `;

  document.head.appendChild(style);
}

// Import necessary functions from home page
function createNeonDots() {
  const container = document.getElementById('neonDotsContainer');
  if (!container) return;

  const positions = [
    { x: 15, y: 20 },
    { x: 85, y: 15 },
    { x: 20, y: 75 },
    { x: 75, y: 80 },
    { x: 45, y: 35 },
    { x: 60, y: 65 },
    { x: 5, y: 90 },
    { x: 90, y: 85 }
  ];

  const colors = ['blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white'];
  const animations = ['blink', 'pulse', 'blink', 'blink', 'pulse', 'blink', 'pulse', 'blink'];

  positions.forEach((pos, i) => {
    const dot = document.createElement('div');
    dot.className = 'neon-dot';

    if (colors[i] === 'white') {
      dot.classList.add('white');
    }

    dot.classList.add(animations[i]);
    dot.style.left = pos.x + '%';
    dot.style.top = pos.y + '%';
    dot.style.animationDelay = (i * 2) + 's';

    container.appendChild(dot);
  });
}

