import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatTimeAgo } from '@/lib/booking-engine';

export const dynamic = 'force-dynamic';

const DAY_NAMES: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const targetDate = new Date(dateStr);
    const dayOfWeekStr = DAY_NAMES[targetDate.getDay()];

    // Fetch listing details
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        availabilityTemplates: {
          where: { dayOfWeek: dayOfWeekStr },
          include: { slots: true },
        },
        availabilityExceptions: {
          where: { date: dateStr },
        },
      },
    });

    if (!listing || !listing.isActive) {
      return NextResponse.json(
        { error: 'المكان غير موجود أو غير نشط' },
        { status: 404 }
      );
    }

    // Get timeout minutes setting
    const timeoutSetting = await prisma.systemSetting.findUnique({
      where: { key: 'BOOKING_PENDING_TIMEOUT_MINUTES' },
    });
    const timeoutMinutes = timeoutSetting ? parseInt(timeoutSetting.value, 10) : 30;
    const pendingCutoffDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // Fetch active bookings for this date (CONFIRMED or active PENDING)
    const activeBookings = await prisma.booking.findMany({
      where: {
        listingId: params.id,
        bookingDate: dateStr,
        OR: [
          { status: 'CONFIRMED' },
          {
            AND: [
              { status: 'PENDING' },
              { createdAt: { gte: pendingCutoffDate } },
            ],
          },
        ],
      },
    });

    // Extract template slots for the day or generate smart slots based on pricingType / category
    let rawSlots: any[] = listing.availabilityTemplates[0]?.slots || [];

    if (!rawSlots || rawSlots.length === 0) {
      const pType = listing.pricingType || 'PER_SHIFT';
      const catSlug = listing.category?.slug || '';

      if (pType === 'PER_HOUR' || catSlug === 'sports' || catSlug === 'carwash' || catSlug === 'beauty') {
        // Hourly Slots Generator (1-Hour Slots)
        rawSlots = [
          { startTime: '09:00', endTime: '10:00', shiftName: '⏱️ 09:00 ص - 10:00 ص (ساعة واحدة)', price: listing.basePrice },
          { startTime: '10:00', endTime: '11:00', shiftName: '⏱️ 10:00 ص - 11:00 ص (ساعة واحدة)', price: listing.basePrice },
          { startTime: '11:00', endTime: '12:00', shiftName: '⏱️ 11:00 ص - 12:00 ظهراً (ساعة واحدة)', price: listing.basePrice },
          { startTime: '14:00', endTime: '15:00', shiftName: '⏱️ 02:00 م - 03:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '15:00', endTime: '16:00', shiftName: '⏱️ 03:00 م - 04:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '16:00', endTime: '17:00', shiftName: '⏱️ 04:00 م - 05:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '17:00', endTime: '18:00', shiftName: '⏱️ 05:00 م - 06:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '18:00', endTime: '19:00', shiftName: '⏱️ 06:00 م - 07:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '19:00', endTime: '20:00', shiftName: '⏱️ 07:00 م - 08:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '20:00', endTime: '21:00', shiftName: '⏱️ 08:00 م - 09:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '21:00', endTime: '22:00', shiftName: '⏱️ 09:00 م - 10:00 م (ساعة واحدة)', price: listing.basePrice },
          { startTime: '22:00', endTime: '23:00', shiftName: '⏱️ 10:00 م - 11:00 م (ساعة واحدة)', price: listing.basePrice },
        ];
      } else if (pType === 'PER_DAY' || catSlug === 'hotels') {
        // Daily / Hotel Night Stay Slots
        rawSlots = [
          { startTime: '14:00', endTime: '12:00', shiftName: '🏨 حجز يوم كامل / ليلة واحدة (دخول 02:00 م - خروج 12:00 ظهراً)', price: listing.basePrice },
          { startTime: '14:00', endTime: '12:00', shiftName: '🏨 حجز ليلتان متتاليتان (دخول 02:00 م - خروج 12:00 ظهراً)', price: listing.basePrice * 2 },
        ];
      } else {
        // Shift Slots (Chalets, Villas, Halls)
        rawSlots = [
          { startTime: '08:00', endTime: '16:00', shiftName: '🌅 الشفت الصباحي (08:00 ص - 04:00 م)', price: listing.basePrice },
          { startTime: '17:00', endTime: '01:00', shiftName: '🌃 الشفت المسائي (05:00 م - 01:00 ص)', price: listing.basePrice },
          { startTime: '20:00', endTime: '08:00', shiftName: '🌙 شفت مبيت كامل (08:00 م - 08:00 ص)', price: Math.round(listing.basePrice * 1.35) },
        ];
      }
    }

    // Compute status for each slot
    const computedSlots = rawSlots.map((slot) => {
      let status = 'AVAILABLE';
      let price = slot.price || listing.basePrice;

      // Check exceptions for this date
      const exception = listing.availabilityExceptions.find(
        (ex) => ex.startTime === slot.startTime || ex.shiftName === slot.shiftName
      );

      if (exception) {
        status = exception.status;
        if (exception.price) price = exception.price;
      }

      // Check active bookings
      const booked = activeBookings.find(
        (b) =>
          b.shiftName === slot.shiftName ||
          (b.startTime <= slot.startTime && b.endTime >= slot.startTime)
      );

      if (booked) {
        status = booked.status === 'CONFIRMED' ? 'BOOKED' : 'PENDING_CONFIRMATION';
      }

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        shiftName: slot.shiftName,
        price,
        status,
        isBookable: status === 'AVAILABLE',
      };
    });

    return NextResponse.json({
      listingId: listing.id,
      title: listing.title,
      date: dateStr,
      dayOfWeek: dayOfWeekStr,
      availabilityLastUpdatedText: formatTimeAgo(listing.availabilityLastUpdatedAt),
      slots: computedSlots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء فحص التوفر' },
      { status: 500 }
    );
  }
}
