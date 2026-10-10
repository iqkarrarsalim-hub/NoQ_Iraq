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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            listings: true,
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'معرّف المستخدم مطلوب' }, { status: 400 });
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'تحديث حالة الحساب 🛡️',
        message: role
          ? `تم تغيير صلاحية حسابك إلى [${role === 'PROVIDER' ? 'مالك وشريك 🏢' : role === 'ADMIN' ? 'مدير منصة 🛡️' : 'زبون 👤'}].`
          : `تم ${isActive ? 'تفعيل' : 'تقييد/حظر'} حسابك بواسطة إدارة المنصة.`,
      },
    });

    return NextResponse.json({ message: 'تم تحديث بيانات المستخدم بنجاح', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء التحديث' }, { status: 500 });
  }
}
