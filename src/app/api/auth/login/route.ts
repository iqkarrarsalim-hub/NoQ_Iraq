import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, normalizeIraqiPhone } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body || {};

    const phoneClean = normalizeIraqiPhone(phone);

    if (!phoneClean || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم الهاتف وكلمة المرور' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: phoneClean },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role as any,
    });

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في السيرفر' },
      { status: 500 }
    );
  }
}
