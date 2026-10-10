# منصة الحجوزات العراقية (Iraqi Multi-Service Booking Platform) - Phase 1

منصة حجوزات متعددة الخدمات موجهة للسوق العراقي (انطلاقة من البصرة) تعتمد على **Booking Engine موحد** فائق المرونة لخدمة الشاليهات، الملاعب، والقاعات بدون تكرار الأنظمة.

---

## 🔑 الحسابات التجريبية (Demo Accounts)

| دور الحساب (Role) | رقم الهاتف | كلمة المرور | الوصف |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `07700000000` | `password123` | مدير المنصة (توثيق الأماكن وإدارة نسبة العمولة) |
| **PROVIDER** | `07711112222` | `password123` | مالك الأماكن (قبول/رفض الحجوزات وإدارة القوالب) |
| **CUSTOMER** | `07733334444` | `password123` | زبون تجريبي (البحث والحجز والإنشائيات) |

---

## 🛠️ تقنيات المرحلة الأولى (Tech Stack)

- **Frontend / Mobile UI**: Next.js 14 (App Router) + React 18 + TailwindCSS (RTL)
- **Database**: SQLite (للتطوير المحلي السريع) / PostgreSQL جاهز للبيئة الإنتاجية
- **ORM**: Prisma ORM v5
- **Authentication**: JWT (JSON Web Tokens) مع درجات الصلاحية RBAC
- **Currency & Specs**: الدينار العراقي كأعداد صحيحة (`Int` IQD)، توقيت بغداد `Asia/Baghdad`

---

## 🚀 كيفية تشغيل المشروع (Running the Project)

```bash
# 1. تثبيت الاعتماديات (Dependencies)
npm install

# 2. تحديث وتوليد قاعدة البيانات (Prisma DB Push)
npx prisma db push

# 3. تغذية قاعدة البيانات بالبيانات التجريبية للبصرة (Seed)
node prisma/seed.js

# 4. تشغيل خادم التطوير (Development Server)
npm run dev
```

التطبيق سيعمل على: `http://localhost:3000`

---

## 🛡️ آلية منع الحجز المزدوج وانقضاء المهلة (Concurrency & Timeout)

1. **الأسعار Integer**: جميع الحقول المالية (`basePrice`, `totalPrice`, `commissionAmount`, `providerEarnings`) مخزنة كـ Integer بالدينار العراقي لمنع أخطاء floating-point.
2. **المهلة المؤقتة للـ Pending**: تم إضافة حقل `BOOKING_PENDING_TIMEOUT_MINUTES` بقيمة default 30 دقيقة قابلة للتعديل ديناميكياً من الأدمن.
3. **التحقق المعاملي (Prisma Transaction)**: يتم التحقق من وجود حجز قائم `CONFIRMED` أو `PENDING` لم تنتهِ مهلته الـ 30 دقيقة داخل `$transaction` واحدة قبل إنشاء طلب جديد.

---

## 📌 ملفات المرحلة الأولى المنشأة

- `prisma/schema.prisma` - الموديلات والجداول بالأسعار الصحيحة `Int`.
- `prisma/seed.js` - سكريبت التغذية النظيف الذاتي للبصرة والأقسام والحسابات.
- `src/lib/prisma.ts` - عميل Prisma الموحد.
- `src/lib/auth.ts` - أدوات التشفير والـ JWT.
- `src/lib/booking-engine.ts` - خوارزمية منع الحجز المزدوج وانقضاء المهلة.
- `src/app/api/auth/*` - APIs تسجيل الدخول وإنشاء الحساب.
