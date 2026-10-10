import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatTimeAgo } from '@/lib/booking-engine';
import { generateWhatsAppUrl } from '@/lib/whatsapp';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: { attributes: true },
        },
        city: { include: { governorate: true } },
        provider: { select: { id: true, name: true, phone: true } },
        images: true,
        amenities: { include: { amenity: true } },
        attributeValues: { include: { attribute: true } },
        availabilityTemplates: {
          include: { slots: true },
        },
        availabilityExceptions: {
          where: { date },
        },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!listing || !listing.isActive) {
      return NextResponse.json(
        { error: 'المكان المطلوب غير موجود أو تم إيقافه' },
        { status: 404 }
      );
    }

    const whatsappUrl = generateWhatsAppUrl(
      listing.whatsappNumber || listing.contactPhone,
      listing.title,
      date
    );

    const timeAgoText = formatTimeAgo(listing.availabilityLastUpdatedAt);

    return NextResponse.json({
      listing: {
        ...listing,
        whatsappUrl,
        availabilityLastUpdatedText: timeAgoText,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب تفاصيل المكان' },
      { status: 500 }
    );
  }
}
