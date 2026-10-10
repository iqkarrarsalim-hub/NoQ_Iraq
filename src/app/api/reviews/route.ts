import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للتقييم' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, listingId, rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'يرجى اختيار التقييم من 1 إلى 5 نجوم' },
        { status: 400 }
      );
    }

    let targetListingId = listingId;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
      }

      if (booking.customerId !== userPayload.userId) {
        return NextResponse.json(
          { error: 'لا يمكن تقديم تقييم لحجز خاص بمستخدم آخر' },
          { status: 403 }
        );
      }

      targetListingId = booking.listingId;
    }

    if (!targetListingId) {
      return NextResponse.json({ error: 'يرجى تحديد المكان المراد تقييمه' }, { status: 400 });
    }

    // Create Review
    const review = await prisma.review.create({
      data: {
        bookingId: bookingId || null,
        listingId: targetListingId,
        userId: userPayload.userId,
        rating: parseInt(String(rating), 10),
        comment: comment || null,
      },
    });

    // Recalculate Listing Rating & Review Count
    const allReviews = await prisma.review.findMany({
      where: { listingId: targetListingId },
    });

    const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalStars / allReviews.length;

    await prisma.listing.update({
      where: { id: targetListingId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({
      message: 'شكراً لك! تم إضافة تقييمك بنجاح ⭐',
      review,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'يرجى تحديد المكان' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { listingId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
