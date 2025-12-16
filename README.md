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

## Database Schema

### User Model (Base)
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  role: ['student', 'teacher', 'admin'],
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Teacher Model (Extends User)
```javascript
{
  bio: String,
  specialization: String,
  profileImage: String,
  ratingAverage: Number,
  reviewsCount: Number,
  courses: [ObjectId],
  balance: Number,
  paymentMethods: Object,
  certificates: [Object],
  socialLinks: Object
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  teacher: ObjectId,
  modules: [ObjectId],
  students: [ObjectId],
  category: String,
  level: String,
  duration: Number,
  isPublished: Boolean
}
```

### Blog Model
```javascript
{
  title: String,
  subtitle: String,
  sections: [Object],
  tags: [Object],
  seoKeywords: [String],
  author: ObjectId,
  views: Number,
  isPublished: Boolean,
  createdAt: Date
}
```

## Environment Configuration

### Backend Environment Variables
```env
# Server Configuration
PORT=8001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET_KEY=your_secret_key
JWT_REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=30d
JWT_REFRESH_TOKEN_EXPIRES_IN=90d

# Email Configuration
NODEMAILER_USER_EMAIL=your_email@gmail.com
NODEMAILER_USER_PASSWORD=your_app_password

# Cloudflare R2 Storage
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-domain.com

# Telegram Bots
TELEGRAM_BOT_TOKEN=your_student_bot_token
TEACHER_BOT_TOKEN=your_teacher_bot_token

# URLs
FRONTEND_URL=https://your-frontend-domain.com
MODERATOR_URL=https://your-moderator-domain.com
BACKEND_URL=https://your-backend-domain.com
```

### Frontend Environment Variables
```env
# Development
VITE_API_URL=http://localhost:8001/api

# Production
VITE_API_URL=https://your-backend-domain.com/api
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

### Deployment

#### Backend (Render.com)
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

#### Frontend (Vercel)
1. Connect GitHub repository
2. Set framework preset: Vite
3. Configure environment variables
4. Deploy automatically on push

#### Moderator (Vercel)
1. Connect GitHub repository
2. Set root directory: `moderator`
3. Configure build settings
4. Deploy automatically on push

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- OTP verification system
- Password hashing with bcrypt
- Session management

### Data Protection
- Input validation with Joi
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

### File Security
- File type validation
- Size limitations
- Secure file storage
- CDN integration

## Performance Optimization

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Compression middleware

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization
- CDN usage

### Monitoring
- Error logging with Winston
- Performance monitoring
- API response time tracking
- Database query analysis

## API Rate Limiting

### Default Limits
- Authentication endpoints: 5 requests/minute
- File upload: 10 requests/minute
- General API: 100 requests/minute
- Blog endpoints: 50 requests/minute

## Error Handling

### Backend Error Responses
```javascript
{
  success: false,
  message: "Error description",
  error: "ERROR_CODE",
  details: {} // Additional error details
}
```

### Frontend Error Handling
- Global error interceptor
- User-friendly error messages
- Retry mechanisms
- Offline support

## Contributing Guidelines

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Comprehensive comments

### Git Workflow
- Feature branch workflow
- Conventional commit messages
- Pull request reviews
- Automated testing

### Testing Requirements
- Unit tests for all services
- Integration tests for APIs
- Property-based tests for critical logic
- End-to-end testing

## Maintenance and Support

### Regular Maintenance
- Database backup and cleanup
- Log rotation and monitoring
- Security updates
- Performance optimization

### Monitoring
- Server health checks
- Database performance
- API response times
- Error rate tracking

## License

This project is proprietary software developed for Dars Linker platform.

## Documentation

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

## Loyiha Holati

**Joriy Versiya**: 1.0.0
**Holat**: Ishlab Chiqarishga Tayyor
**Oxirgi Yangilanish**: 2024-yil dekabr

### So'nggi Yangilanishlar
- ✅ To'liq API hujjatlari
- ✅ Keng qamrovli dasturchilar qo'llanmasi
- ✅ Deploy avtomatizatsiyasi
- ✅ Ishlash optimizatsiyasi
- ✅ Xavfsizlik yaxshilanishlari
- ✅ Testlash framework'i amalga oshirilishi

## Qo'llab-quvvatlash va Texnik Xizmat

### Yordam Olish
1. **Hujjatlar**: `/docs` papkasidagi keng qamrovli hujjatlarni tekshiring
2. **API Ma'lumotnomasi**: Interaktiv API hujjatlaridan foydalaning
3. **Muammolar**: GitHub issues orqali xatolar haqida xabar bering yoki yangi funksiyalar so'rang
4. **Ishlab chiqish**: Hissa qo'shish uchun dasturchilar qo'llanmasiga amal qiling

### Texnik Xizmat Jadvali
- **Xavfsizlik Yangilanishlari**: Oylik
- **Funksiya Yangilanishlari**: Choraklik
- **Ma'lumotlar Bazasi Texnik Xizmati**: Haftalik avtomatik zaxiralar
- **Ishlash Monitoringi**: Doimiy

## Contact Information

**Dasturchi**: Abdulboriy Mahamatjanov
**Email**: abdulborimahammadjanov86@gmail.com
**Loyiha**: Dars Linker Onlayn Ta'lim Platformasi
**Versiya**: 1.0.0
**Repository**: Shaxsiy Repository
**Hujjatlar**: To'liq texnik hujjatlar kiritilgan

---

**Eslatma**: Bu to'liq hujjatlar, testlash va deploy avtomatizatsiyasi bilan ishlab chiqarishga tayyor ta'lim platformasidir. Barcha maxfiy ma'lumotlar to'g'ri sozlangan va himoyalangan.