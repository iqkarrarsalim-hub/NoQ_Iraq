import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, normalizeIraqiPhone } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password, role } = body || {};

    const nameClean = name ? String(name).trim() : '';
    const phoneClean = normalizeIraqiPhone(phone);

    if (!nameClean || !phoneClean || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال الاسم ورقم الهاتف وكلمة المرور' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone: phoneClean },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'رقم الهاتف مستخدم بالفعل، يرجى تسجيل الدخول' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name: nameClean,
        phone: phoneClean,
        email: email ? String(email).trim() : null,
        passwordHash,
        role: assignedRole,
      },
    });

    const token = signToken({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role as any,
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
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
      { error: error.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
