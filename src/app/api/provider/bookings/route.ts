import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload || (userPayload.role !== 'PROVIDER' && userPayload.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح للوصول لوظائف المالك' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, action, status, reason, cancellationReason, cancellationNote, cancelledBy } = body; 
    const effectiveAction = action || (status === 'CONFIRMED' ? 'ACCEPT' : status === 'REJECTED' ? 'REJECT' : 'CANCEL');
    const finalReason = cancellationReason || reason || 'تحديث من المالك';

    if (!bookingId) {
      return NextResponse.json(
        { error: 'يرجى تحديد الحجز والإجراء المطلوب' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
    }

    if (userPayload.role === 'PROVIDER' && booking.listing.providerId !== userPayload.userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية التعديل على هذا الحجز' },
        { status: 403 }
      );
    }

    let updatedBooking;

    if (effectiveAction === 'ACCEPT') {
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Update availability exception status to BOOKED
      await prisma.availabilityException.updateMany({
        where: {
          listingId: booking.listingId,
          date: booking.bookingDate,
          startTime: booking.startTime,
        },
        data: { status: 'BOOKED', reason: `حجز مؤكد برقم ${booking.bookingNumber}` },
      });

      // Send Customer Notification
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: 'تم تأكيد حجزك! 🎉',
          message: `تم قبول وتأكيد حجزك لمكان [${booking.listing.title}] بتاريخ ${booking.bookingDate}.`,
        },
      });
    } else {
      // REJECT or CANCEL
      const targetStatus = effectiveAction === 'REJECT' ? 'REJECTED' : 'CANCELLED';

      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          cancelledBy: cancelledBy || 'PROVIDER',
          cancellationReason: finalReason,
          cancellationNote: cancellationNote || '',
          cancelledAt: new Date(),
        },
      });

      // Remove or set availability exception to AVAILABLE
      await prisma.availabilityException.deleteMany({
        where: {
          listingId: booking.listingId,
          date: booking.bookingDate,
          startTime: booking.startTime,
        },
      });

      // Send Customer Notification
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: targetStatus === 'REJECTED' ? 'اعتذار عن طلب الحجز ❌' : 'إلغاء حجز من المالك ⚠️',
          message: `نعتذر منك، تم ${targetStatus === 'REJECTED' ? 'رفض' : 'إلغاء'} حجزك لمكان [${booking.listing.title}] بتاريخ ${booking.bookingDate}. السبب: ${finalReason}`,
        },
      });

      // Create Admin Notification
      const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const adm of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: adm.id,
            title: 'تقرير رفض/إلغاء حجز 📋',
            message: `قام المالك بإلغاء/رفض حجز [${booking.bookingNumber}] لمكان [${booking.listing.title}]. السبب: ${finalReason}`,
          },
        });
      }
    }

    // Update availability timestamp
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { availabilityLastUpdatedAt: new Date() },
    });

    return NextResponse.json({
      message: `تم تحديث حالة الحجز بنجاح`,
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء معالجة طلب المالك' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return POST(request);
}
