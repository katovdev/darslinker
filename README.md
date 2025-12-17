# Dars Linker - Onlayn Ta'lim Platformasi

## Loyiha Haqida

Dars Linker - O'zbekiston bozori uchun mo'ljallangan keng qamrovli onlayn ta'lim platformasi. Platforma o'qituvchilar va talabalarni intuitiv interfeys orqali bog'lab, kurs yaratish, kontent boshqaruvi, to'lov jarayonlari va muloqot uchun vositalar taqdim etadi.

## Arxitektura

Loyiha uchta asosiy komponentdan iborat zamonaviy full-stack arxitekturasiga amal qiladi:

### Backend (Node.js/Express)
- **Framework**: Express.js 5.1.0
- **Ma'lumotlar bazasi**: MongoDB va Mongoose ODM
- **Autentifikatsiya**: JWT asosidagi autentifikatsiya tizimi
- **Fayl saqlash**: Cloudflare R2 (S3-mos)
- **Real-vaqt aloqa**: Telegram Bot integratsiyasi
- **Testlash**: Jest va Property-Based Testing

### Frontend (Vanilla JavaScript)
- **Build vositasi**: Vite 7.1.7
- **Arxitektura**: Komponent asosidagi vanilla JavaScript
- **Dizayn**: Zamonaviy dizayn naqshlari bilan maxsus CSS
- **API aloqa**: HTTP so'rovlar uchun Axios
- **Deploy**: Vercel

### Moderator Paneli (Admin Interfeysi)
- **Framework**: Vite bilan Vanilla JavaScript
- **Maqsad**: Kontent boshqaruvi va administratsiya
- **Xususiyatlar**: Blog boshqaruvi, foydalanuvchi moderatsiyasi, analitika
- **Deploy**: Vercel

## Texnologiyalar To'plami

### Backend Texnologiyalari
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1.0
- **Ma'lumotlar bazasi**: MongoDB Atlas
- **ODM**: Mongoose 8.19.2
- **Autentifikatsiya**: JSON Web Tokens (jsonwebtoken 9.0.2)
- **Parol shifrlash**: bcrypt 6.0.0
- **Fayl yuklash**: Multer 2.0.2
- **Bulut saqlash**: Cloudflare R2 uchun AWS SDK
- **Email xizmati**: Nodemailer 7.0.9
- **Validatsiya**: Joi 18.0.1
- **Logging**: Winston 3.18.3
- **API hujjatlari**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Testlash**: Jest 29.7.0, Supertest 7.1.4, fast-check 3.15.0

### Frontend Texnologiyalari
- **Build vositasi**: Vite 7.1.7
- **HTTP mijoz**: Axios 1.12.2
- **Sana boshqaruvi**: date-fns 4.1.0
- **Arxitektura**: Vanilla JavaScript (ES6+)
- **Dizayn**: CSS o'zgaruvchilari bilan zamonaviy CSS
- **Deploy**: Muhit asosidagi konfiguratsiya bilan Vercel

### Tashqi Xizmatlar
- **Ma'lumotlar bazasi**: MongoDB Atlas
- **Fayl saqlash**: Cloudflare R2
- **Email**: Gmail SMTP
- **Xabar almashish**: Telegram Bot API
- **Deploy**: 
  - Backend: Render.com
  - Frontend: Vercel
  - Moderator: Vercel

## Loyiha Strukturasi

```
dars-linker/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── controllers/        # So'rov ishlovchilari
│   │   ├── models/            # Ma'lumotlar bazasi modellari
│   │   ├── routes/            # API yo'nalishlari
│   │   ├── services/          # Biznes logika
│   │   ├── middlewares/       # Maxsus middleware
│   │   ├── validations/       # Kirish validatsiya sxemalari
│   │   └── utils/             # Yordamchi funksiyalar
│   ├── config/                # Konfiguratsiya fayllari
│   ├── scripts/               # Yordamchi skriptlar
│   ├── __tests__/             # Test fayllari
│   └── main.js                # Dastur kirish nuqtasi
├── frontend/                   # Asosiy foydalanuvchi interfeysi
│   ├── src/
│   │   ├── pages/             # Sahifa komponentlari
│   │   ├── components/        # Qayta ishlatiladigan komponentlar
│   │   ├── services/          # API xizmatlari
│   │   ├── utils/             # Yordamchi funksiyalar
│   │   └── config/            # Konfiguratsiya
│   ├── public/                # Statik resurslar
│   └── index.html             # Asosiy HTML fayl
├── moderator/                  # Admin panel
│   ├── src/
│   │   ├── main.js            # Asosiy dastur logikasi
│   │   └── style.css          # Dizayn
│   └── index.html             # Admin interfeysi
└── docs/                      # Hujjatlar
```

## Asosiy Xususiyatlar

### Foydalanuvchi Boshqaruvi
- **Ko'p rollik Autentifikatsiya**: Talabalar, O'qituvchilar, Sub-adminlar
- **OTP Tasdiqlash**: Email va SMS asosidagi tasdiqlash
- **Profil Boshqaruvi**: Keng qamrovli foydalanuvchi profillari
- **Ijtimoiy Integratsiya**: Telegram bot integratsiyasi

### Kurs Boshqaruvi
- **Kurs Yaratish**: O'qituvchilar uchun boy kurs yaratish vositalari
- **Modul Tizimi**: Tartibga solingan kontent strukturasi
- **Dars Boshqaruvi**: Video, hujjat va interaktiv kontent
- **Topshiriq Tizimi**: Uy vazifasi va baholash vositalari
- **Taraqqiyot Kuzatuvi**: Talaba taraqqiyotini monitoring qilish

### To'lov Tizimi
- **Ko'plab To'lov Usullari**: Click, Payme, Uzum Bank
- **O'qituvchi To'lovlari**: Avtomatlashtirilgan daromad taqsimoti
- **To'lov Tasdiqlash**: Qo'lda tasdiqlash tizimi
- **Moliyaviy Hisobot**: Keng qamrovli moliyaviy analitika

### Kontent Boshqaruvi
- **Blog Tizimi**: Kategoriyalar bilan SEO-optimallashtirilgan blog
- **Fayl Boshqaruvi**: Cloudflare R2 integratsiyasi
- **Video Qayta Ishlash**: Avtomatik video siqish
- **Hujjat Boshqaruvi**: PDF va rasm qo'llab-quvvatlash

### Aloqa
- **Telegram Integratsiyasi**: Ikki botli tizim (talabalar/o'qituvchilar)
- **Bildirishnoma Tizimi**: Real-vaqt bildirish
- **Maslahat Tizimi**: Talaba-o'qituvchi maslahatlashuvi
- **Landing Sahifalari**: Maxsus o'qituvchi landing sahifalari

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/verify-otp        # OTP verification
POST /api/auth/logout            # User logout
PATCH /api/auth/change-password  # Password change
```

### User Management
```
GET /api/teachers                # Get all teachers
GET /api/teachers/:id            # Get teacher profile
PATCH /api/teachers/:id          # Update teacher profile
GET /api/students                # Get all students
GET /api/students/:id            # Get student profile
```

### Course Management
```
GET /api/courses                 # Get all courses
POST /api/courses                # Create new course
GET /api/courses/:id             # Get course details
PATCH /api/courses/:id           # Update course
DELETE /api/courses/:id          # Delete course
```

### Content Management
```
GET /api/blogs                   # Get all blog posts
POST /api/blogs                  # Create blog post
GET /api/blogs/:id               # Get blog post
PATCH /api/blogs/:id             # Update blog post
DELETE /api/blogs/:id            # Delete blog post
```

### File Upload
```
POST /api/upload/image           # Upload image
POST /api/upload/video           # Upload video
POST /api/upload/document        # Upload document
```


## Installation and Setup

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudflare R2 account
- Gmail account for SMTP
- Telegram Bot tokens

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Moderator Setup
```bash
cd moderator
npm install
npm run dev
```

## Development Workflow

### Local Development
1. Start MongoDB (or use Atlas)
2. Configure environment variables
3. Start backend server: `npm run dev`
4. Start frontend: `npm run dev`
5. Start moderator panel: `npm run dev`

### Testing
```bash
# Backend tests
cd backend
npm test
npm run test:watch

# Property-based tests
npm run test:system

# Performance benchmarks
npm run benchmark:performance
```



### To'liq Hujjatlar To'plami

- **[API Hujjatlari](docs/API_DOCUMENTATION.md)** - Namunalar bilan keng qamrovli API ma'lumotnomasi
- **[Dasturchilar Qo'llanmasi](docs/DEVELOPER_GUIDE.md)** - Sozlash, ishlab chiqish jarayoni va eng yaxshi amaliyotlar
- **[Deploy Qilish Qo'llanmasi](docs/DEPLOYMENT_GUIDE.md)** - Bosqichma-bosqich deploy ko'rsatmalari
- **[Tizim Arxitekturasi](docs/ARCHITECTURE.md)** - Texnik arxitektura va dizayn qarorlari

### Tezkor Havolalar

- **Jonli API Hujjatlari**: [https://darslinker-backend.onrender.com/api-docs](https://darslinker-backend.onrender.com/api-docs)
- **Frontend Dasturi**: [https://darslinker-azio.vercel.app](https://darslinker-azio.vercel.app)
- **Moderator Paneli**: [https://darslinker-4n3z.vercel.app](https://darslinker-4n3z.vercel.app)
- **Backend API**: [https://darslinker-backend.onrender.com/api](https://darslinker-backend.onrender.com/api)
