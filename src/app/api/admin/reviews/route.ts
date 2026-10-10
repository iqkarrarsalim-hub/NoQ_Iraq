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

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'معرّف التقييم مطلوب' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: 'تم حذف التقييم بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل حذف التقييم' }, { status: 500 });
  }
}
