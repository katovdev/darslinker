# 🎓 DarsLinkeer Teacher Bot

Teacher uchun maxsus Telegram bot - tasdiqlash kodlarini olish uchun.

## 📱 Bot Ma'lumotlari

- **Bot Username**: `@DarsLinkeer_bot`
- **Bot Link**: https://t.me/DarsLinkeer_bot
- **Bot Token**: `8529221614:AAGx_XYo4x6J6Z8qAiIA2QFaazPMrYg6SLc`

## 🚀 Qanday Ishlaydi?

### 1. Foydalanuvchi Registratsiya Qiladi
- Veb-saytda telefon raqam bilan ro'yxatdan o'tadi
- Role: **teacher** sifatida

### 2. OTP Modal Ochiladi
- "Tasdiqlash kodini @DarsLinkeer_bot orqali oling" xabari ko'rsatiladi
- "Telegram Botga O'tish" tugmasi bosiladi

### 3. Telegram Botda
1. `/start` buyrug'ini bosadi
2. **Ikki usul:**
   - **Usul 1**: "📱 Telefon raqamni yuborish" tugmasini bosadi → Contact yuboriladi
   - **Usul 2**: Telefon raqamni yozadi (masalan: `+998 90 123 45 67` yoki `901234567`)
3. Bot telefon raqamni tekshiradi:
   - ✅ Agar raqam ro'yxatdan o'tgan bo'lsa → OTP kod yuboriladi
   - ❌ Agar raqam topilmasa → "Avval ro'yxatdan o'ting" xabari
   - ❌ Agar student bo'lsa → "Bu bot faqat o'qituvchilar uchun" xabari

### 4. OTP Kodni Oladi
```
✅ Tasdiqlash kodi:

🔐 123456

⏰ Kod 30 daqiqa davomida amal qiladi.

Iltimos, bu kodni veb-saytda kiriting.
```

### 5. Veb-saytda Tasdiqlash
- OTP kodni kiritadi
- "Tasdiqlash" tugmasini bosadi
- Dashboard ga o'tadi ✅

## 📱 Telefon Raqam Formatlari

Bot quyidagi formatlarni qabul qiladi:

```
✅ +998 90 123 45 67
✅ +998901234567
✅ 998901234567
✅ 901234567
✅ +998 (90) 123-45-67
```

Barcha formatlar avtomatik ravishda `+998901234567` formatiga o'zgartiriladi.

## 🔒 Xavfsizlik

### Telefon Raqam Tekshiruvi
Bot faqat ro'yxatdan o'tgan telefon raqamlarni qabul qiladi:

```javascript
// 1. Raqam normalize qilinadi
const normalizedPhone = normalizePhone(phoneNumber); // +998901234567

// 2. Database dan tekshiriladi
const user = await User.findOne({ phone: normalizedPhone });

// 3. Agar topilmasa
if (!user) {
  return "❌ Bu telefon raqam bilan ro'yxatdan o'tilmagan";
}

// 4. Role tekshiriladi
if (user.role !== 'teacher') {
  return "❌ Bu bot faqat o'qituvchilar uchun!";
}
```

### OTP Xavfsizligi
- OTP hash qilinib saqlanadi (bcrypt)
- 30 daqiqa amal qiladi
- Maksimal 5 marta noto'g'ri kiritish mumkin

## 📊 Bot Holati (In-Memory)

Bot foydalanuvchi holatini saqlaydi:

```javascript
userStates.set(chatId, {
  state: 'otp_sent',
  phone: '+998901234567',
  userId: '507f1f77bcf86cd799439011'
});
```

**Holatlar:**
- `waiting_contact` - Contact kutilmoqda
- `otp_sent` - OTP yuborildi

## 🔄 OTP Service Integratsiyasi

OTP Service avtomatik ravishda teacher botni ishlatadi:

```javascript
// otp.service.js
if (channel === "sms") {
  const user = await User.findOne({ phone: identifier });
  
  if (user && user.role === 'teacher') {
    // Teacher bot orqali yuborish
    await sendTeacherOtpViaTelegram(identifier, otp);
  } else {
    // Student uchun oddiy SMS
    await smsService.sendSms(identifier, message);
  }
}
```

## 🎯 Student Bot bilan Farqi

| Xususiyat | Teacher Bot | Student Bot |
|-----------|-------------|-------------|
| Username | @DarsLinkeer_bot | @darslinkerrr_bot |
| Role | teacher | student |
| Contact | Majburiy | Majburiy |
| OTP Yuborish | Telegram | SMS/Telegram |
| Webhook | Yo'q (polling) | Ha (production) |

## 🛠️ Texnik Ma'lumotlar

### Dependencies
```json
{
  "node-telegram-bot-api": "^0.x.x",
  "bcrypt": "^5.x.x"
}
```

### Environment Variables
```env
TEACHER_BOT_TOKEN="8529221614:AAGx_XYo4x6J6Z8qAiIA2QFaazPMrYg6SLc"
TEACHER_BOT_USERNAME="DarsLinkeer_bot"
```

### Bot Initialization
```javascript
// main.js
import { initTeacherBot } from "./src/services/telegram-teacher-bot.service.js";
initTeacherBot();
```

## 📝 Loglar

Bot barcha harakatlarni log qiladi:

```javascript
logger.info('Teacher bot /start command received', {
  chatId,
  username: msg.from.username,
  firstName,
});

logger.info('Teacher OTP sent successfully', {
  chatId,
  phoneNumber: normalizedPhone,
  userId: user._id,
});
```

## ⚠️ Muhim Eslatmalar

1. **Polling Mode**: Bot hozircha polling rejimida ishlaydi (webhook emas)
2. **In-Memory State**: User holatlari xotirada saqlanadi (production da Redis ishlatish tavsiya etiladi)
3. **Ikki Usul**: Contact button yoki oddiy text sifatida telefon raqam yuborish mumkin
4. **Role Check**: Faqat teacher role li userlar OTP oladi
5. **Phone Validation**: Telefon raqam database da bo'lishi kerak
6. **Auto Format**: Barcha telefon raqamlar avtomatik normalize qilinadi

## 🚀 Ishga Tushirish

```bash
# Backend ni ishga tushiring
cd backend
npm start

# Bot avtomatik ishga tushadi
# Console da ko'rasiz:
# 🎓 Teacher Telegram bot started successfully
```

## 🐛 Debugging

Agar bot ishlamasa:

1. **Token tekshiring**: `.env` faylda `TEACHER_BOT_TOKEN` to'g'ri ekanligini
2. **Internet**: Bot serverga ulanishi uchun internet kerak
3. **Loglarni ko'ring**: Console da error loglarini tekshiring
4. **Database**: MongoDB ulanganligini tekshiring

## 📞 Support

Muammo bo'lsa:
- Backend loglarini tekshiring
- Bot polling error larini ko'ring
- Database connection ni tekshiring

---

**Yaratilgan sana**: 2025-01-10
**Versiya**: 1.0.0
**Maqsad**: Teacher lar uchun xavfsiz OTP tasdiqlash tizimi
