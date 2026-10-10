import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const userPayload = token ? verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول لرفع الصور' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم تحديد أية صورة' }, { status: 400 });
    }

    // File Size Check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الصورة كبير جداً. الحد الأقصى هو 5 ميغابايت.' },
        { status: 400 }
      );
    }

    // Extension & Malicious File Check
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مسموح به. يرجى اختيار صورة بصيغة (JPG, PNG, WEBP).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      message: 'تم رفع الصورة بنجاح',
      url: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع الصورة' },
      { status: 500 }
    );
  }
}
