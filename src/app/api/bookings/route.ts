import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { createBookingWithDoubleBookingProtection } from '@/lib/booking-engine';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json(
        { error: 'يرجى تسجيل الدخول لإكمال طلب الحجز' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, bookingDate, startTime, endTime, shiftName, notes } = body;

    if (!listingId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'يرجى تحديد المكان، التاريخ، ووقت البداية بالنظام السليم' },
        { status: 400 }
      );
    }

    const booking = await createBookingWithDoubleBookingProtection({
      customerId: userPayload.userId,
      listingId,
      bookingDate,
      startTime,
      endTime,
      shiftName,
      notes,
    });

    return NextResponse.json({
      message: 'تم إرسال طلب الحجز بنجاح وهو الآن بانتظار موافقة المالك',
      booking,
    });
  } catch (error: any) {
    const errorMessage = error.message || 'حدث خطأ أثناء معالجة طلب الحجز';
    const isConflict = errorMessage.includes('تم حجزه') || errorMessage.includes('غير متاح');

    return NextResponse.json(
      { error: errorMessage },
      { status: isConflict ? 409 : 400 } // HTTP 409 Conflict for double booking
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json(
        { error: 'غير مصرح للوصول' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope'); // 'provider' | 'customer'

    const whereClause: any = {};

    if (scope === 'provider' || userPayload.role === 'PROVIDER') {
      if (userPayload.role === 'ADMIN' && scope !== 'provider') {
        // Admin view without explicit provider scope sees all
      } else {
        whereClause.listing = { providerId: userPayload.userId };
      }
    } else if (scope === 'customer') {
      whereClause.customerId = userPayload.userId;
    } else if (userPayload.role === 'CUSTOMER') {
      // If user has listings, show provider bookings when scope is provider, otherwise customer bookings
      const countListings = await prisma.listing.count({
        where: { providerId: userPayload.userId },
      });
      if (countListings > 0 && scope !== 'customer') {
        whereClause.listing = { providerId: userPayload.userId };
      } else {
        whereClause.customerId = userPayload.userId;
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true } },
            city: true,
          },
        },
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الحجوزات' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    let bodyData: any = {};
    try {
      bodyData = await request.json();
    } catch (e) {}

    const cancelledBy = bodyData.cancelledBy || userPayload.role;
    const cancellationReason = bodyData.cancellationReason || searchParams.get('reason') || 'إلغاء من الزبون';
    const cancellationNote = bodyData.cancellationNote || '';

    if (!bookingId) {
      return NextResponse.json({ error: 'يرجى تحديد الحجز' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
    }

    // Security check: Only customer who created or admin can cancel
    if (userPayload.role !== 'ADMIN' && booking.customerId !== userPayload.userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية إلغاء هذا الحجز' },
        { status: 403 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledBy: cancelledBy === 'CUSTOMER' || userPayload.role === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN',
        cancellationReason,
        cancellationNote,
        cancelledAt: new Date(),
      },
    });

    // Create Notification for Provider
    if (booking.listing?.providerId) {
      await prisma.notification.create({
        data: {
          userId: booking.listing.providerId,
          title: 'إلغاء طلب حجز ⚠️',
          message: `قام الزبون [${booking.customer?.name || 'زبون'}] بإلغاء طلب الحجز [${booking.bookingNumber}] لمكانك [${booking.listing?.title}]. السبب: ${cancellationReason}`,
        },
      });
    }

    // Create Notification for Admin oversight
    const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const adm of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: adm.id,
          title: 'تقرير إلغاء حجز 📋',
          message: `إلغاء حجز [${booking.bookingNumber}] بواسطة ${cancelledBy}. السبب: ${cancellationReason}`,
        },
      });
    }

    return NextResponse.json({
      message: 'تم إلغاء طلب الحجز بنجاح',
      booking: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
