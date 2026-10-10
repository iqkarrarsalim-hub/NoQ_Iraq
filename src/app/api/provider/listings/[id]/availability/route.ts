import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        availabilityTemplates: { include: { slots: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'المكان غير موجود' }, { status: 404 });
    }

    if (listing.providerId !== userPayload.userId && userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch existing exceptions for date
    const exceptions = await prisma.availabilityException.findMany({
      where: { listingId: params.id, date: dateStr },
    });

    // Fetch active bookings for date
    const activeBookings = await prisma.booking.findMany({
      where: {
        listingId: params.id,
        bookingDate: dateStr,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    // Extract template slots or default slots
    let rawSlots: any[] = listing.availabilityTemplates[0]?.slots || [];
    if (!rawSlots || rawSlots.length === 0) {
      if (listing.pricingType === 'PER_DAY') {
        rawSlots = [
          { startTime: '14:00', endTime: '12:00', shiftName: '🏨 حجز يوم كامل / ليلة واحدة', price: listing.basePrice },
        ];
      } else if (listing.pricingType === 'PER_HOUR') {
        rawSlots = [
          { startTime: '09:00', endTime: '10:00', shiftName: '⏱️ 09:00 ص - 10:00 ص', price: listing.basePrice },
          { startTime: '10:00', endTime: '11:00', shiftName: '⏱️ 10:00 ص - 11:00 ص', price: listing.basePrice },
          { startTime: '14:00', endTime: '15:00', shiftName: '⏱️ 02:00 م - 03:00 م', price: listing.basePrice },
          { startTime: '16:00', endTime: '17:00', shiftName: '⏱️ 04:00 م - 05:00 م', price: listing.basePrice },
        ];
      } else {
        rawSlots = [
          { startTime: '08:00', endTime: '16:00', shiftName: '🌅 الشفت الصباحي', price: listing.basePrice },
          { startTime: '17:00', endTime: '01:00', shiftName: '🌃 الشفت المسائي', price: listing.basePrice },
          { startTime: '20:00', endTime: '08:00', shiftName: '🌙 شفت مبيت كامل', price: Math.round(listing.basePrice * 1.35) },
        ];
      }
    }

    const slots = rawSlots.map((slot) => {
      const exc = exceptions.find((e) => e.shiftName === slot.shiftName || e.startTime === slot.startTime);
      const booking = activeBookings.find((b) => b.shiftName === slot.shiftName || b.startTime === slot.startTime);

      let status = 'AVAILABLE'; // Default: Available / شاغر
      if (booking) {
        status = 'BOOKED';
      } else if (exc) {
        status = exc.status;
      }

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        shiftName: slot.shiftName,
        price: slot.price || listing.basePrice,
        status, // AVAILABLE, BLOCKED, BOOKED
      };
    });

    return NextResponse.json({
      date: dateStr,
      slots,
      availabilityLastUpdatedAt: listing.availabilityLastUpdatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'المكان غير موجود' }, { status: 404 });
    }

    if (listing.providerId !== userPayload.userId && userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح بالتعديل' }, { status: 403 });
    }

    const body = await request.json();
    const { date, shiftName, startTime, endTime, status } = body;

    const dateStr = date || new Date().toISOString().split('T')[0];

    if (!shiftName || !status) {
      return NextResponse.json({ error: 'اسم الشفت والحالة مطلوبة' }, { status: 400 });
    }

    // Find existing exception
    const existingException = await prisma.availabilityException.findFirst({
      where: {
        listingId: params.id,
        date: dateStr,
        shiftName,
      },
    });

    if (existingException) {
      await prisma.availabilityException.update({
        where: { id: existingException.id },
        data: { status },
      });
    } else {
      await prisma.availabilityException.create({
        data: {
          listingId: params.id,
          date: dateStr,
          shiftName,
          startTime: startTime || '00:00',
          endTime: endTime || '23:59',
          status,
        },
      });
    }

    // Update availabilityLastUpdatedAt timestamp on Listing
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        availabilityLastUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `تم تحديث حالة الشفت [${shiftName}] إلى [${status === 'AVAILABLE' ? 'شاغر 🟢' : 'محجوز/غير متوفر 🔴'}] بنجاح`,
      availabilityLastUpdatedAt: updatedListing.availabilityLastUpdatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث الشفت' }, { status: 500 });
  }
}
