import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALL_DAYS = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        city: true,
        images: true,
        amenities: { include: { amenity: true } },
        availabilityTemplates: { include: { slots: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'المكان غير موجود' }, { status: 404 });
    }

    // Strict Ownership Check
    if (userPayload.role !== 'ADMIN' && listing.providerId !== userPayload.userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية الوصول إلى بيانات هذا المكان الخارجي' },
        { status: 403 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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

    // Strict Ownership Check: Provider A cannot edit Provider B's listing
    if (userPayload.role !== 'ADMIN' && listing.providerId !== userPayload.userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية تعديل هذا المكان الخاص بمالك آخر' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      basePrice,
      pricingType,
      capacity,
      contactPhone,
      whatsappNumber,
      district,
      address,
      latitude,
      longitude,
      images,
      amenityIds, // Array of amenity IDs
      templates, // Array of { dayOfWeek, slots } OR { slots, applyToAllDays }
      applyToAllDays,
      slots, // Single array of slots when applyToAllDays is true
    } = body;

    const parsedBasePrice = basePrice ? parseInt(String(basePrice), 10) : listing.basePrice;

    // Update listing base info
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: title || listing.title,
        description: description !== undefined ? description : listing.description,
        categoryId: categoryId || listing.categoryId,
        basePrice: parsedBasePrice,
        pricingType: pricingType || listing.pricingType,
        capacity: capacity !== undefined ? (capacity ? parseInt(String(capacity), 10) : null) : listing.capacity,
        contactPhone: contactPhone || listing.contactPhone,
        whatsappNumber: whatsappNumber || listing.whatsappNumber,
        district: district || listing.district,
        address: address !== undefined ? address : listing.address,
        latitude: latitude ? parseFloat(String(latitude)) : listing.latitude,
        longitude: longitude ? parseFloat(String(longitude)) : listing.longitude,
        availabilityLastUpdatedAt: new Date(),
      },
    });

    // Handle Amenities updates if passed
    if (Array.isArray(amenityIds)) {
      await prisma.listingAmenity.deleteMany({
        where: { listingId: params.id },
      });
      await prisma.listingAmenity.createMany({
        data: amenityIds.map((amenityId: string) => ({
          listingId: params.id,
          amenityId,
        })),
      });
    }

    // Handle Image updates if passed
    if (Array.isArray(images)) {
      await prisma.listingImage.deleteMany({
        where: { listingId: params.id },
      });
      await prisma.listingImage.createMany({
        data: images.map((img: any, idx: number) => ({
          listingId: params.id,
          url: typeof img === 'string' ? img : img.url,
          isPrimary: idx === 0 || img.isPrimary === true,
        })),
      });
    }

    // Handle Availability Shifts & Templates updates
    let templatesToProcess: Array<{ dayOfWeek: string; slots: any[] }> = [];

    if (applyToAllDays && Array.isArray(slots)) {
      templatesToProcess = ALL_DAYS.map((day) => ({
        dayOfWeek: day,
        slots,
      }));
    } else if (Array.isArray(templates)) {
      templatesToProcess = templates;
    }

    if (templatesToProcess.length > 0) {
      // Delete existing templates & slots for this listing
      await prisma.availabilityTemplate.deleteMany({
        where: { listingId: params.id },
      });

      // Insert updated templates & slots
      for (const tmpl of templatesToProcess) {
        if (Array.isArray(tmpl.slots) && tmpl.slots.length > 0) {
          await prisma.availabilityTemplate.create({
            data: {
              listingId: params.id,
              dayOfWeek: tmpl.dayOfWeek,
              slots: {
                create: tmpl.slots.map((s: any) => ({
                  startTime: s.startTime,
                  endTime: s.endTime,
                  shiftName: s.shiftName || null,
                  price: s.price ? parseInt(String(s.price), 10) : parsedBasePrice,
                })),
              },
            },
          });
        }
      }
    }

    return NextResponse.json({
      message: 'تم تحديث كافة بيانات المكان والشفتات بنجاح',
      listing: updatedListing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
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

    // Strict Ownership Check
    if (userPayload.role !== 'ADMIN' && listing.providerId !== userPayload.userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية تعديل نشاط هذا المكان' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: { isActive: !!isActive },
    });

    return NextResponse.json({
      message: isActive ? 'تم تفعيل المكان بنجاح' : 'تم إيقاف المكان مؤقتاً',
      listing: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
