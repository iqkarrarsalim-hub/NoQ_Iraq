import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function TermsPage() {
  return (
    <div className="max-w-md mx-auto space-y-4 pb-10">
      <div className="flex items-center gap-2 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-gray-900 text-base">الشروط والأحكام الاستخدام</h1>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5 text-xs text-gray-600 leading-relaxed">
        <h2 className="font-extrabold text-gray-900 text-sm">شروط وأحكام الاستخدام - منصة {APP_CONFIG.appName}</h2>
        <p>مرحباً بك في منصة {APP_CONFIG.appName}. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية الخاصة بحجز الشاليهات، الملاعب، والقاعات في جميع المحافظات.</p>

        <h3 className="font-extrabold text-gray-900 text-xs pt-2">1. الحجوزات والالتزام بالحضور</h3>
        <p>تعتبر الحجوزات معلقة PENDING لحين تأكيد المالك، ويتم تحرير الوقت تلقائياً عند تجاوز المهلة المحددة دون رد. ويجب على الزبون الالتزام بأوقات الشفت المحجوزة بالشكل الصحيح.</p>

        <h3 className="font-extrabold text-gray-900 text-xs pt-2">2. سياسة الإلغاء والعمولات</h3>
        <p>يستطيع الزبون إلغاء الحجز المعلق مجاناً، بينما تخضع الحجوزات المؤكدة لسياسة الإلغاء الخاصة بالمالك وقبل 24 ساعة من الموعد.</p>

        <h3 className="font-extrabold text-red-600 text-xs pt-2">3. حظر الحساب عند الإلغاء المتكرر ⚠️</h3>
        <p>تنبيه هام: القيام بالإلغاء المتكرر للحجوزات يسبب حظراً مؤقتاً أو دائماً للحساب للحفاظ على مصداقية المنصة وتنظيم المواعيد وحقوق أصحاب الأماكن.</p>

        <h3 className="font-extrabold text-gray-900 text-xs pt-2">4. المستمسكات الرسمية والنظافة</h3>
        <p>يتوجب إبراز المستمسكات الرسمية (الهوية الوطنية / بطاقة السكن) عند الوصول للشاليهات والفلل والقاعات. والزبون ملزم بالحفاظ على نظافة المكان ومحتوياته ويتحمل المسألة عن الأضرار المتعمدة.</p>

        <h3 className="font-extrabold text-gray-900 text-xs pt-2">5. الالتزام بالقوانين النافذة</h3>
        <p>يمنع استخدام الأماكن والخدمات لأي أغراض تخالف القوانين والضوابط المتبعة في جمهورية العراق.</p>
      </div>
    </div>
  );
}
