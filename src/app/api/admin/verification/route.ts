import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'حصري لمدير المنصة (ADMIN)' },
        { status: 403 }
      );
    }

    // Get unverified listings
    const pendingListings = await prisma.listing.findMany({
      where: { isVerified: false },
      include: {
        category: true,
        city: true,
        provider: { select: { id: true, name: true, phone: true } },
        images: true,
        amenities: { include: { amenity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pendingListings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'حصري لمدير المنصة (ADMIN)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listingId, verify, rejectionReason } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'يرجى تحديد المكان' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: 'المكان غير موجود' }, { status: 404 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        isVerified: !!verify,
        verifiedAt: verify ? new Date() : null,
        verifiedById: verify ? userPayload.userId : null,
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: listing.providerId,
        title: verify ? 'تم توثيق مكانك بنجاح! 🎉' : 'تنبيه حول توثيق المكان ⚠️',
        message: verify
          ? `تهانينا! تم توثيق ونشر مكانك [${listing.title}] بالبصرة للعملاء بنجاح.`
          : `نعتذر، لم يتم توثيق مكانك [${listing.title}]. ${rejectionReason ? `السبب: ${rejectionReason}` : ''}`,
      },
    });

    return NextResponse.json({
      message: verify ? 'تم توثيق ونشر المكان بنجاح ✓' : 'تم رفض توثيق المكان بنجاح',
      listing: updatedListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل التوثيق' },
      { status: 500 }
    );
  }
}
