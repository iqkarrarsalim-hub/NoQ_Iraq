import { prisma } from './prisma';

export interface BookingRequestInput {
  customerId: string;
  listingId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  shiftName?: string;
  notes?: string;
}

/**
 * Double Booking Race Condition Prevention Handler with Temporary Hold Timeout
 */
export async function createBookingWithDoubleBookingProtection(input: BookingRequestInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch listing details
    const listing = await tx.listing.findUnique({
      where: { id: input.listingId },
      include: { provider: true },
    });

    if (!listing || !listing.isActive) {
      throw new Error('المكان غير موجود أو غير نشط حالياً.');
    }

    // 2. Fetch System Settings: Commission Percent and Pending Timeout Minutes
    const commissionSetting = await tx.systemSetting.findUnique({
      where: { key: 'DEFAULT_COMMISSION_PERCENT' },
    });
    const commissionRate = commissionSetting ? parseFloat(commissionSetting.value) : 5.0;

    const timeoutSetting = await tx.systemSetting.findUnique({
      where: { key: 'BOOKING_PENDING_TIMEOUT_MINUTES' },
    });
    const pendingTimeoutMinutes = timeoutSetting ? parseInt(timeoutSetting.value, 10) : 30;

    // Cutoff date for PENDING bookings
    const pendingCutoffDate = new Date(Date.now() - pendingTimeoutMinutes * 60 * 1000);

    // Auto-expire old pending bookings for this listing if any
    await tx.booking.updateMany({
      where: {
        listingId: input.listingId,
        status: 'PENDING',
        createdAt: { lt: pendingCutoffDate },
      },
      data: { status: 'EXPIRED' },
    });

    // 3. Check for overlapping CONFIRMED or active PENDING bookings (within the timeout window)
    const existingOverlappingBooking = await tx.booking.findFirst({
      where: {
        listingId: input.listingId,
        bookingDate: input.bookingDate,
        OR: [
          { status: 'CONFIRMED' },
          {
            AND: [
              { status: 'PENDING' },
              { createdAt: { gte: pendingCutoffDate } }, // Active hold within 30 mins
            ],
          },
        ],
        AND: [
          {
            OR: [
              { AND: [{ startTime: { lte: input.startTime } }, { endTime: { gte: input.startTime } }] },
              { AND: [{ startTime: { lte: input.endTime } }, { endTime: { gte: input.endTime } }] },
              { AND: [{ startTime: { gte: input.startTime } }, { endTime: { lte: input.endTime } }] },
            ],
          },
        ],
      },
    });

    if (existingOverlappingBooking) {
      throw new Error('نأسف، هذا الوقت أو الشفت تم حجزه أو عليه طلب حجز قائم قيد الانتظار للتو.');
    }

    // 4. Calculate Total Price and Snapshotted Commission as INTEGERS (IQD)
    let totalPrice: number = listing.basePrice;
    
    if (input.shiftName) {
      const templateSlot = await tx.availabilityTemplateSlot.findFirst({
        where: {
          template: { listingId: input.listingId },
          shiftName: input.shiftName,
        },
      });
      if (templateSlot && templateSlot.price) {
        totalPrice = templateSlot.price;
      }
    }

    const commissionAmount = Math.round((totalPrice * commissionRate) / 100);
    const providerEarnings = totalPrice - commissionAmount;

    // Unique Booking Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `IQB-${input.bookingDate.replace(/-/g, '')}-${randomSuffix}`;

    // 5. Create Booking (Integer Prices)
    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        customerId: input.customerId,
        listingId: input.listingId,
        bookingDate: input.bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        shiftName: input.shiftName,
        totalPrice,
        commissionRate,
        commissionAmount,
        providerEarnings,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        notes: input.notes,
      },
    });

    // 6. Create Availability Exception for the hold
    await tx.availabilityException.create({
      data: {
        listingId: input.listingId,
        date: input.bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        shiftName: input.shiftName,
        status: 'PENDING_CONFIRMATION',
        reason: `حجز مؤقت برقم ${bookingNumber}`,
      },
    });

    // 7. Notification for Provider
    await tx.notification.create({
      data: {
        userId: listing.providerId,
        title: 'طلب حجز جديد 🔔',
        message: `وصلك طلب حجز جديد لمكان [${listing.title}] بتاريخ ${input.bookingDate} (${input.shiftName || input.startTime}). لديك ${pendingTimeoutMinutes} دقيقة للموافقة قبل إنتهاء المهلة.`,
      },
    });

    // 8. Update Listing availabilityLastUpdatedAt
    await tx.listing.update({
      where: { id: input.listingId },
      data: { availabilityLastUpdatedAt: new Date() },
    });

    return booking;
  });
}

/**
 * Format time difference for UI
 */
export function formatTimeAgo(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'آخر تحديث للتوفر الآن';
  if (diffInMinutes < 60) return `آخر تحديث للتوفر قبل ${diffInMinutes} دقيقة`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `آخر تحديث للتوفر قبل ${diffInHours} ساعة`;

  return `آخر تحديث اليوم`;
}
