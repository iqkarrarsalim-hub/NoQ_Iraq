import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { providerId: userPayload.userId },
      include: {
        category: true,
        city: { include: { governorate: true } },
        images: true,
        amenities: { include: { amenity: true } },
        availabilityTemplates: { include: { slots: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً لإنشاء مكان' }, { status: 401 });
    }

    // Auto update customer role to PROVIDER
    if (userPayload.role === 'CUSTOMER') {
      await prisma.user.update({
        where: { id: userPayload.userId },
        data: { role: 'PROVIDER' },
      });
    }

    const body = await request.json();
    let {
      title,
      description,
      categoryId,
      cityId,
      district,
      address,
      latitude,
      longitude,
      basePrice,
      pricingType,
      capacity,
      contactPhone,
      whatsappNumber,
      images, // array of { url, isPrimary }
      amenityIds, // array of amenity IDs
      templates, // array of { dayOfWeek, slots }
    } = body;

    // Auto-fallback cityId if missing or empty
    if (!cityId) {
      const basraCity =
        (await prisma.city.findFirst({
          where: { name: { contains: 'البصرة' } },
        })) || (await prisma.city.findFirst());
      cityId = basraCity?.id;
    }

    // Auto-fallback categoryId if missing
    if (!categoryId) {
      const defaultCategory = await prisma.category.findFirst();
      categoryId = defaultCategory?.id;
    }

    // Validation
    if (!title || !categoryId || !cityId || !basePrice || !contactPhone) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول الأساسية: اسم المكان، القسم، المدينة، السعر، ورقم الهاتف' },
        { status: 400 }
      );
    }

    const parsedPrice = parseInt(String(basePrice), 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: 'يرجى تحديد سعر صحيحي بالدينار العراقي' }, { status: 400 });
    }

    // Create listing starts unverified (isVerified = false)
    const newListing = await prisma.listing.create({
      data: {
        title,
        description: description || '',
        categoryId,
        providerId: userPayload.userId,
        cityId,
        district: district || 'البصرة',
        address: address || '',
        latitude: latitude ? parseFloat(String(latitude)) : 30.5081,
        longitude: longitude ? parseFloat(String(longitude)) : 47.8225,
        basePrice: parsedPrice,
        pricingType: pricingType || 'PER_SHIFT',
        capacity: capacity ? parseInt(String(capacity), 10) : null,
        contactPhone,
        whatsappNumber: whatsappNumber || contactPhone,
        isVerified: false, // Must be approved by Admin
        isActive: true,
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((img: any, idx: number) => ({
                url: img.url || img,
                isPrimary: idx === 0 || img.isPrimary === true,
              }))
            : [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
        },
        amenities: Array.isArray(amenityIds)
          ? { create: amenityIds.map((amenityId: string) => ({ amenityId })) }
          : undefined,
        availabilityTemplates: Array.isArray(templates)
          ? {
              create: templates.map((tmpl: any) => ({
                dayOfWeek: tmpl.dayOfWeek,
                slots: {
                  create: tmpl.slots.map((s: any) => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                    shiftName: s.shiftName,
                    price: s.price ? parseInt(String(s.price), 10) : parsedPrice,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        city: true,
        images: true,
      },
    });

    // Notify Admin of new listing for verification
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const adminUser of admins) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: 'مكان جديد بانتظار التوثيق ⏳',
          message: `قام المالك [${userPayload.name}] بإضافة مكان جديد [${title}] بالبصرة وهو بحاجة للمراجعة والتوثيق.`,
        },
      });
    }

    return NextResponse.json({
      message: 'تم إضافة المكان بنجاح وهو الآن بانتظار مراجعة وتوثيق الإدارة',
      listing: newListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إضافة المكان' },
      { status: 500 }
    );
  }
}
