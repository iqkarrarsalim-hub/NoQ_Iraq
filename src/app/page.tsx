'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, CheckCircle2, Sparkles, ArrowLeft, Search, Layers, Compass } from 'lucide-react';
import { APP_CONFIG, APP_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const serviceCategories = APP_CATEGORIES.filter((c) => c.id !== 'all' && c.isActive !== false);

  const categoryStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    chalets: { bg: 'bg-emerald-50/80', text: 'text-emerald-950', border: 'border-emerald-100', badge: 'bg-emerald-100/70 text-emerald-800' },
    sports: { bg: 'bg-blue-50/80', text: 'text-blue-950', border: 'border-blue-100', badge: 'bg-blue-100/70 text-blue-800' },
    beauty: { bg: 'bg-pink-50/80', text: 'text-pink-950', border: 'border-pink-100', badge: 'bg-pink-100/70 text-pink-800' },
    carwash: { bg: 'bg-amber-50/80', text: 'text-amber-950', border: 'border-amber-100', badge: 'bg-amber-100/70 text-amber-800' },
    hotels: { bg: 'bg-indigo-50/80', text: 'text-indigo-950', border: 'border-indigo-100', badge: 'bg-indigo-100/70 text-indigo-800' },
    halls: { bg: 'bg-purple-50/80', text: 'text-purple-950', border: 'border-purple-100', badge: 'bg-purple-100/70 text-purple-800' },
  };

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      {/* Comprehensive Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>البصرة • وتدريجياً لكافة المحافظات</span>
          </div>
          <h2 className="text-xl font-extrabold leading-tight tracking-tight">
            NoQ Iraq — احجز قبل لا توصل —
          </h2>
          <p className="text-xs text-blue-100 font-medium">
            حجوزات الشاليهات، القاعات والملاعب الرياضية والمراكز بدون انتظار.
          </p>
        </div>
      </div>

      {/* Main Service Categories Hub - Grid Blocks */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600 fill-brand-600" />
            ماذا تريد أن تحجز اليوم؟
          </h3>
          <span className="text-xs text-brand-600 font-bold">الخدمات الرئيسية</span>
        </div>

        {/* 2-Column Grid of Beautiful Service Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {serviceCategories.map((cat) => {
            const style = categoryStyles[cat.id] || {
              bg: 'bg-gray-50',
              text: 'text-gray-900',
              border: 'border-gray-100',
              badge: 'bg-gray-200 text-gray-700',
            };

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-3xl border ${style.bg} ${style.border} flex flex-col justify-between space-y-3 hover:scale-[1.02] transition shadow-xs group relative overflow-hidden`}
              >
                <Link href={`/search?category=${cat.id}`} className="space-y-3 block">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xs group-hover:scale-110 transition">
                      {cat.icon}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${style.badge}`}>
                      حجز فوري
                    </span>
                  </div>

                  <div>
                    <h4 className={`font-extrabold text-sm ${style.text} flex items-center justify-between`}>
                      <span>{cat.name}</span>
                      <ArrowLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition" />
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </Link>

                {/* Gender Sub-category buttons for Beauty */}
                {cat.id === 'beauty' && (
                  <div className="pt-1.5 border-t border-pink-200/60 flex items-center gap-1.5 text-[10px]">
                    <Link
                      href="/search?category=beauty&sub=men"
                      className="flex-1 bg-white/90 hover:bg-pink-100 text-pink-900 font-extrabold py-1 px-1.5 rounded-xl text-center border border-pink-200 shadow-2xs transition"
                    >
                      💈 رجالي
                    </Link>
                    <Link
                      href="/search?category=beauty&sub=women"
                      className="flex-1 bg-white/90 hover:bg-pink-100 text-pink-900 font-extrabold py-1 px-1.5 rounded-xl text-center border border-pink-200 shadow-2xs transition"
                    >
                      💅 نسائي
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* Premium Trust & Features Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden border border-blue-500/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
            لماذا يفضل الزبائن الحجز عبر NoQ Iraq؟
          </h3>
          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/30">
            ضمان 100% 🛡️
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl space-y-1">
            <span className="font-extrabold text-amber-300 block flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              حجز فوري ومؤكد
            </span>
            <p className="text-[10px] text-blue-100/90 font-medium leading-relaxed">
              تأكيد تلقائي للشفتات والمواعيد بدون أي تضارب.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl space-y-1">
            <span className="font-extrabold text-blue-300 block flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              تواصل مباشر مع المالك
            </span>
            <p className="text-[10px] text-blue-100/90 font-medium leading-relaxed">
              اتصال وتنسيق عبر الواتساب فور التأكيد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



