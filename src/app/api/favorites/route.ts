import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: userPayload.userId },
      include: {
        listing: {
          include: {
            category: true,
            city: true,
            images: { where: { isPrimary: true } },
          },
        },
      },
    });

    const activeFavorites = favorites
      .filter((f) => f.listing && f.listing.isActive && f.listing.isVerified)
      .map((f) => f.listing);

    return NextResponse.json({ favorites: activeFavorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول لإضافة مكان للمفضلة' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'يرجى تحديد المكان' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: userPayload.userId,
          listingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'المكان موجود بالفعل في مفضلتك' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: userPayload.userId,
        listingId,
      },
    });

    return NextResponse.json({ message: 'تم إضافة المكان للمفضلة بنجاح ❤️', favorite });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'يرجى تحديد المكان' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: userPayload.userId,
        listingId,
      },
    });

    return NextResponse.json({ message: 'تم إزالة المكان من المفضلة' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
