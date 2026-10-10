import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatTimeAgo } from '@/lib/booking-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const cityId = searchParams.get('cityId');
    const cityName = searchParams.get('cityName');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const verifiedOnly = searchParams.get('verified') === 'true';

    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      whereClause.OR = [
        { category: { slug: categorySlug } },
        { categoryId: categorySlug },
      ];
    }

    if (cityId) {
      whereClause.cityId = cityId;
    } else if (cityName) {
      whereClause.city = { name: { contains: cityName } };
    }

    if (verifiedOnly) {
      whereClause.isVerified = true;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { district: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) whereClause.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.basePrice.lte = parseFloat(maxPrice);
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        city: { include: { governorate: true } },
        images: true,
        amenities: { include: { amenity: true } },
        availabilityExceptions: date ? { where: { date } } : false,
      },
      orderBy: [
        { isVerified: 'desc' },
        { rating: 'desc' },
      ],
    });

    // Format output with time ago helper
    const formattedListings = listings.map((l) => ({
      ...l,
      availabilityLastUpdatedText: formatTimeAgo(l.availabilityLastUpdatedAt),
      primaryImage: l.images.find((img) => img.isPrimary)?.url || l.images[0]?.url || 'https://via.placeholder.com/600x400',
    }));

    return NextResponse.json({ listings: formattedListings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الأماكن' },
      { status: 500 }
    );
  }
}
