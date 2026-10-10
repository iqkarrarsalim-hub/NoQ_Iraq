'use client';

import React from 'react';
import { TrendingUp, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatIQD } from '@/lib/constants';

interface AnalyticsChartsProps {
  title?: string;
  totalRevenue: number;
  totalBookingsCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  commissionEarned?: number;
  role?: 'PROVIDER' | 'ADMIN';
}

export default function AnalyticsCharts({
  title = 'التقرير والرسوم البيانية المالية',
  totalRevenue,
  totalBookingsCount,
  confirmedCount,
  pendingCount,
  cancelledCount,
  commissionEarned,
  role = 'PROVIDER',
}: AnalyticsChartsProps) {
  const maxCount = Math.max(confirmedCount, pendingCount, cancelledCount, 1);

  const confirmedPct = totalBookingsCount > 0 ? Math.round((confirmedCount / totalBookingsCount) * 100) : 0;
  const pendingPct = totalBookingsCount > 0 ? Math.round((pendingCount / totalBookingsCount) * 100) : 0;
  const cancelledPct = totalBookingsCount > 0 ? Math.round((cancelledCount / totalBookingsCount) * 100) : 0;

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          {title}
        </h3>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
          تحديث مباشر 📊
        </span>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 block">
            {role === 'ADMIN' ? 'إجمالي تداولات المنصة' : 'صافي أرباح المقبولة'}
          </span>
          <span className="text-base font-extrabold text-emerald-900 block">
            {formatIQD(totalRevenue)}
          </span>
        </div>

        {role === 'ADMIN' && commissionEarned !== undefined ? (
          <div className="bg-purple-50/70 border border-purple-100 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-purple-700 block">عمولة المنصة المستقطعة</span>
            <span className="text-base font-extrabold text-purple-900 block">
              {formatIQD(commissionEarned)}
            </span>
          </div>
        ) : (
          <div className="bg-brand-50/70 border border-brand-100 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-brand-700 block">إجمالي عدد الحجوزات</span>
            <span className="text-base font-extrabold text-brand-900 block">
              {totalBookingsCount} طلب حجز
            </span>
          </div>
        )}
      </div>

      {/* Visual Bar Charts Comparison */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-bold text-gray-700 block">توزيع حالة الحجوزات</span>

        {/* Confirmed Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> مؤكدة ({confirmedCount})
            </span>
            <span className="text-gray-500 font-bold">{confirmedPct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(confirmedCount / maxCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Pending Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3" /> معلقة ({pendingCount})
            </span>
            <span className="text-gray-500 font-bold">{pendingPct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(pendingCount / maxCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Cancelled / Rejected Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> ملغاة / مرفوضة ({cancelledCount})
            </span>
            <span className="text-gray-500 font-bold">{cancelledPct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-400 rounded-full transition-all duration-500"
              style={{ width: `${(cancelledCount / maxCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
