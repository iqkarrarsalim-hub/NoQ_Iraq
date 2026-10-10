'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';
import { IRAQ_GOVERNORATES } from '@/lib/constants';

export default function SearchBox() {
  const router = useRouter();
  const [district, setDistrict] = useState('جميع المحافظات');

  return (
    <div className="bg-white rounded-3xl p-3.5 shadow-lg border border-gray-100/80 mb-5 space-y-3">
      {/* Sleek Search Input Trigger Bar */}
      <div
        onClick={() => router.push('/search')}
        className="bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl border border-gray-200/80 flex items-center justify-between cursor-pointer transition group shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition shrink-0">
            <Search className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-gray-900 block leading-tight">
              وين تريد تحجز اليوم؟ ✨
            </span>
            <span className="text-[11px] text-gray-400 font-semibold">
              شاليه، ملعب، فندق، عناية، غسيل سيارات...
            </span>
          </div>
        </div>

        <div className="p-2 bg-white text-gray-500 rounded-xl border border-gray-100 group-hover:text-brand-600 transition shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* District Quick Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs font-bold px-1">
        <span className="text-[10px] text-gray-400 shrink-0 font-extrabold flex items-center gap-1">
          <MapPin className="w-3 h-3 text-brand-600" />
          المحافظات:
        </span>
        {IRAQ_GOVERNORATES.slice(0, 8).map((dis, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setDistrict(dis);
              const query = new URLSearchParams();
              if (dis !== 'جميع المحافظات') query.set('district', dis);
              router.push(`/search?${query.toString()}`);
            }}
            className={`px-3 py-1.5 rounded-xl border shrink-0 transition text-[11px] font-bold ${
              district === dis
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {dis}
          </button>
        ))}
      </div>
    </div>
  );
}


