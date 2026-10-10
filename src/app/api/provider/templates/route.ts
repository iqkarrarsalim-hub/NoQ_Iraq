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
        { error: 'غير مصرح للوصول' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listingId, dayOfWeek, slots } = body;
    // slots: Array of { startTime, endTime, shiftName, price }

    if (!listingId || !dayOfWeek || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'بيانات القالب غير مكتملة' },
        { status: 400 }
      );
    }

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || (userPayload.role === 'PROVIDER' && listing.providerId !== userPayload.userId)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Upsert template for dayOfWeek
    let template = await prisma.availabilityTemplate.findFirst({
      where: { listingId, dayOfWeek },
    });

    if (template) {
      // Delete existing slots and recreate
      await prisma.availabilityTemplateSlot.deleteMany({
        where: { templateId: template.id },
      });
    } else {
      template = await prisma.availabilityTemplate.create({
        data: { listingId, dayOfWeek },
      });
    }

    // Create new slots
    await prisma.availabilityTemplateSlot.createMany({
      data: slots.map((s: any) => ({
        templateId: template!.id,
        startTime: s.startTime,
        endTime: s.endTime,
        shiftName: s.shiftName,
        price: s.price ? parseFloat(s.price) : null,
      })),
    });

    // Update availability timestamp
    await prisma.listing.update({
      where: { id: listingId },
      data: { availabilityLastUpdatedAt: new Date() },
    });

    return NextResponse.json({
      message: `تم حفظ قالب التوفر ليوم ${dayOfWeek} بنجاح`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ القالب' },
      { status: 500 }
    );
  }
}
