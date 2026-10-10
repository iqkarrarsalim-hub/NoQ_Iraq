# دليل النشر التشغيلي (Production Deployment Guide) — منصة "احجز بالبصرة"

هذا المستند يوفر دليل النشر التفصيلي لمنصة **احجز بالبصرة** في بيئة التجربة الميدانية (Pilot) أو الإطلاق النهائي.

---

## 1. ومتطلبات النظام الأساسية (Prerequisites)

- Node.js v18.0.0 أو أحدث (يوصى بـ LTS v20+)
- PostgreSQL 14+ أو SQLite (للتطوير والـ Pilot البسيط)
- Nginx كـ Reverse Proxy (في حالة VPS)
- PM2 لـ Process Management (في حالة VPS)

---

## 2. خطوات النشر على خادم VPS (Ubuntu / Linux)

### الخطوة 1: استنساخ المشروع وتثبيت الاعتمادات
```bash
git clone <your-repo-url> /var/www/iq-booking-platform
cd /var/www/iq-booking-platform
npm install --production=false
```

### الخطوة 2: ضبط متغيّرات البيئة `.env`
قم بإنشاء ملف `.env` في المجلد الرئيسي وحظر الوصول إليه:
```env
DATABASE_URL="postgresql://iq_user:StrongPassword123@localhost:5432/iq_booking_db?schema=public"
JWT_SECRET="CHANGE_THIS_TO_A_VERY_LONG_RANDOM_SECRET_KEY_MIN_32_CHARS"
NEXT_PUBLIC_APP_URL="https://basra-booking.iq"
NEXT_PUBLIC_CITY_NAME="البصرة"
NODE_ENV="production"
PORT=3000
```

### الخطوة 3: تجهيز قاعدة البيانات وتوليد Prisma Client
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### الخطوة 4: بناء التطبيق
```bash
npm run build
```

### الخطوة 5: تشغيل التطبيق بواسطة PM2
```bash
npm install -g pm2
pm2 start npm --name "iq-booking-app" -- start
pm2 save
pm2 startup
```

---

## 3. إعداد Nginx و SSL (Certbot)

ملف إعداد Nginx `/etc/nginx/sites-available/iq-booking`:
```nginx
server {
    server_name basra-booking.iq www.basra-booking.iq;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

تفعيل SSL مجاناً عبر Let's Encrypt:
```bash
sudo certbot --nginx -d basra-booking.iq -d www.basra-booking.iq
```

---

## 4. فحص الصحة والجاهزية (Health Checks)

بعد النشر، يمكنك التحقق من جاهزية التطبيق وقاعدة البيانات عبر:
```bash
curl https://basra-booking.iq/api/health
```
الاستجابة المتوقعة:
```json
{
  "status": "ok",
  "service": "iq-booking-platform",
  "environment": "production",
  "timestamp": "2026-09-19T12:00:00.000Z",
  "database": {
    "status": "healthy",
    "latencyMs": 4
  },
  "uptime": 1205.4
}
```
