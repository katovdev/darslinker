# Dars Linker Platformasi Hujjatlari

Dars Linker onlayn ta'lim platformasining keng qamrovli hujjatlariga xush kelibsiz. Ushbu hujjatlar to'plami platformani tushunish, ishlab chiqish, deploy qilish va saqlash uchun zarur bo'lgan barcha narsalarni taqdim etadi.

## Hujjatlar Sharhi

### 📚 [API Hujjatlari](API_DOCUMENTATION.md)
Batafsil endpoint tavsiflari, so'rov/javob namunalari va autentifikatsiya ma'lumotlari bilan to'liq API ma'lumotnomasi.

**Nimani topasiz:**
- Namunalar bilan barcha API endpointlari
- Autentifikatsiya va avtorizatsiya tafsilotlari
- So'rov/javob formatlari
- Xato kodlari va ularni boshqarish
- Tezlik cheklash ma'lumotlari
- Interaktiv API testlash qo'llanmasi

### 🛠️ [Dasturchilar Qo'llanmasi](DEVELOPER_GUIDE.md)
Platformada ishlaydigan dasturchilar uchun keng qamrovli qo'llanma, shu jumladan sozlash, ishlab chiqish jarayoni va eng yaxshi amaliyotlar.

**Nimani topasiz:**
- Ishlab chiqish muhitini sozlash
- Loyiha strukturasini tushuntirish
- Kodlash standartlari va konventsiyalari
- Testlash strategiyalari va namunalar
- Debug qilish va muammolarni hal qilish
- Hissa qo'shish yo'riqnomalari

### 🚀 [Deploy Qilish Qo'llanmasi](DEPLOYMENT_GUIDE.md)
Platformani turli muhitlarda deploy qilish uchun bosqichma-bosqich ko'rsatmalar.

**Nimani topasiz:**
- Oldindan talab qilinadigan shartlar va hisob sozlash
- Backend deploy (Render.com)
- Frontend deploy (Vercel)
- Muhit konfiguratsiyasi
- Domen sozlash va SSL
- Monitoring va texnik xizmat ko'rsatish

### 🏗️ [Tizim Arxitekturasi](ARCHITECTURE.md)
Tizim dizayni, ma'lumotlar oqimi va infratuzilma qarorlarini tushuntiradigan texnik arxitektura hujjatlari.

**Nimani topasiz:**
- Yuqori darajadagi tizim arxitekturasi
- Komponent o'zaro ta'siri
- Ma'lumotlar bazasi dizayni va munosabatlari
- Xavfsizlik arxitekturasi
- Ishlash ko'rsatkichlari
- Kengayish rejalashtirish

## Tezkor Boshlash Qo'llanmasi

### Dasturchilar Uchun
1. Muhitni sozlash uchun [Dasturchilar Qo'llanmasi](DEVELOPER_GUIDE.md)ni o'qing
2. Kod bazasini tushunish uchun [Tizim Arxitekturasi](ARCHITECTURE.md)ni ko'rib chiqing
3. Endpoint ma'lumotnomasi uchun [API Hujjatlari](API_DOCUMENTATION.md)dan foydalaning
4. Dasturchilar qo'llanmasida belgilangan kodlash standartlari va testlash amaliyotlariga amal qiling

### DevOps/Deploy Uchun
1. Bosqichma-bosqich deploy qilish uchun [Deploy Qilish Qo'llanmasi](DEPLOYMENT_GUIDE.md)ga amal qiling
2. Infratuzilmani tushunish uchun [Tizim Arxitekturasi](ARCHITECTURE.md)ni ko'rib chiqing
3. Monitoring va texnik xizmat ko'rsatish tartiblarini o'rnating
4. Xavfsizlik va zaxira tizimlarini sozlang

### API Integratsiyasi Uchun
1. [API Hujjatlari](API_DOCUMENTATION.md) bilan boshlang
2. Autentifikatsiya va avtorizatsiya talablarini ko'rib chiqing
3. Interaktiv hujjatlar yordamida endpointlarni sinab ko'ring
4. Xato boshqaruvi va tezlik cheklashni amalga oshiring

## Platforma Sharhi

### Texnologiyalar To'plami
- **Backend**: Node.js, Express.js, MongoDB, JWT Autentifikatsiya
- **Frontend**: Vanilla JavaScript, Vite, Zamonaviy CSS
- **Saqlash**: Cloudflare R2 (S3-mos)
- **Deploy**: Render.com (Backend), Vercel (Frontend)
- **Tashqi Xizmatlar**: Telegram API, Gmail SMTP, To'lov Shlyuzlari

### Asosiy Xususiyatlar
- Ko'p rollik foydalanuvchi tizimi (Talabalar, O'qituvchilar, Adminlar)
- Kurs yaratish va boshqarish
- Video va hujjat yuklash
- To'lov jarayoni va o'qituvchi to'lovlari
- SEO optimizatsiyasi bilan blog tizimi
- Telegram bot integratsiyasi
- Real-vaqt bildirishnomalar
- Keng qamrovli admin panel

### Jonli URL'lar
- **Frontend**: [https://darslinker-azio.vercel.app](https://darslinker-azio.vercel.app)
- **Moderator Panel**: [https://darslinker-4n3z.vercel.app](https://darslinker-4n3z.vercel.app)
- **API**: [https://darslinker-backend.onrender.com/api](https://darslinker-backend.onrender.com/api)
- **API Hujjatlari**: [https://darslinker-backend.onrender.com/api-docs](https://darslinker-backend.onrender.com/api-docs)

## Documentation Standards

### Writing Style
- Clear, concise explanations
- Step-by-step instructions where applicable
- Code examples with proper syntax highlighting
- Consistent formatting and structure
- Professional tone without unnecessary jargon

### Code Examples
All code examples in the documentation are:
- Tested and verified to work
- Properly formatted and commented
- Include error handling where appropriate
- Follow the project's coding standards
- Provide context and explanation

### Maintenance
This documentation is:
- Regularly updated with platform changes
- Version controlled alongside the codebase
- Reviewed for accuracy and completeness
- Enhanced based on user feedback

## Getting Help

### Documentation Issues
If you find errors, outdated information, or missing details in the documentation:
1. Check if the issue exists in the latest version
2. Review related documentation sections
3. Report the issue with specific details
4. Suggest improvements or corrections

### Technical Support
For technical issues with the platform:
1. Check the troubleshooting sections in relevant guides
2. Review error logs and debugging information
3. Consult the API documentation for endpoint-specific issues
4. Follow the debugging procedures in the developer guide

### Contributing to Documentation
To improve the documentation:
1. Follow the writing standards outlined above
2. Test all code examples before submission
3. Maintain consistency with existing documentation
4. Update related sections when making changes

## Version Information

**Hujjatlar Versiyasi**: 1.0.0
**Platforma Versiyasi**: 1.0.0
**Oxirgi Yangilanish**: 2024-yil dekabr
**Muvofiqlik**: Node.js 18+, Zamonaviy Brauzerlar
**Dasturchi**: Abdulboriy Mahamatjanov
**Email**: abdulborimahammadjanov86@gmail.com

---

Ushbu hujjatlar Dars Linker platformasi uchun to'liq texnik ma'lumotnomani ifodalaydi. Platformani ishlab chiqish, deploy qilish yoki u bilan integratsiya qilish - qaysi biri bo'lishidan qat'i nazar, sizga kerakli ma'lumotlarni ushbu keng qamrovli qo'llanmalarda topasiz.