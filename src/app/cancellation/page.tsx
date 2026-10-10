import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

export default function CancellationPage() {
  return (
    <div className="max-w-md mx-auto space-y-4 pb-10">
      <div className="flex items-center gap-2 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-gray-900 text-base">سياسة الإلغاء وانقضاء المهلة</h1>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600 leading-relaxed">
        <h2 className="font-extrabold text-gray-900 text-sm">قواعد إلغاء الحجز</h2>
        <p>يحق للزبون إلغاء أي حجز معلق PENDING دون أي رسوم، وتتحول الطلبات المعلقة تلقائياً إلى EXPIRED عند تجاوز 30 دقيقة دون رد المالك.</p>
        <p className="pt-2 text-red-600 font-bold">⚠️ تنبيه الإلغاء المتكرر: القيام بالإلغاء المتكرر للحجوزات قد يعرض حسابك للحظر المؤقت أو الدائم للحفاظ على تنظيم المواعيد وحقوق أصحاب الأماكن.</p>
      </div>
    </div>
  );
}
