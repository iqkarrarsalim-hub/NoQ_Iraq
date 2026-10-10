import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function PrivacyPage() {
  return (
    <div className="max-w-md mx-auto space-y-4 pb-10">
      <div className="flex items-center gap-2 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-gray-900 text-base">سياسة الخصوصية وحماية البيانات</h1>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600 leading-relaxed">
        <h2 className="font-extrabold text-gray-900 text-sm">حماية البيانات في {APP_CONFIG.appName}</h2>
        <p>نحن نلتزم بحماية خصوصية بيانات المستخدمين ورقم الهاتف والموقع الجغرافي واستخدامها حصراً لتقديم خدمات الحجز بالبصرة.</p>
      </div>
    </div>
  );
}
