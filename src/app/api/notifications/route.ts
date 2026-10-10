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

    const notifications = await prisma.notification.findMany({
      where: { userId: userPayload.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: userPayload.userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: userPayload.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'تم تحديث جميع الإشعارات كمقروءة' });
    }

    if (notificationId) {
      const notif = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notif || notif.userId !== userPayload.userId) {
        return NextResponse.json({ error: 'الإشعار غير موجود أو لا تملكه' }, { status: 403 });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ message: 'تم تحديث الإشعار كمقروء', notification: updated });
    }

    return NextResponse.json({ error: 'معطيات غير مكتملة' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
