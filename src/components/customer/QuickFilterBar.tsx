'use client';

import { Calendar, Sparkles, TrendingDown, Star } from 'lucide-react';

interface QuickFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function QuickFilterBar({ activeFilter, onFilterChange }: QuickFilterBarProps) {
  const filters = [
    { id: 'today', label: 'متاح اليوم ⚡', icon: Calendar },
    { id: 'tomorrow', label: 'متاح غداً 📅', icon: Calendar },
    { id: 'top_rated', label: 'الأعلى تقييماً ⭐', icon: Star },
    { id: 'lowest_price', label: 'الأقل سعراً 🏷️', icon: TrendingDown },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(isActive ? '' : f.id)}
            className={`px-3.5 py-2 rounded-2xl border shrink-0 transition flex items-center gap-1.5 shadow-2xs ${
              isActive
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
