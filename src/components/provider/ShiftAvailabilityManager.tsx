'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, RefreshCw, Sparkles, Calendar, Lock } from 'lucide-react';
import { formatIQD } from '@/lib/constants';

interface ShiftSlot {
  startTime: string;
  endTime: string;
  shiftName: string;
  price: number;
  status: 'AVAILABLE' | 'BLOCKED' | 'BOOKED';
}

interface ShiftAvailabilityManagerProps {
  listingId: string;
  onAvailabilityChange?: () => void;
}

export default function ShiftAvailabilityManager({
  listingId,
  onAvailabilityChange,
}: ShiftAvailabilityManagerProps) {
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingShiftName, setTogglingShiftName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    const token = localStorage.getItem('iq_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/provider/listings/${listingId}/availability?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
        if (data.availabilityLastUpdatedAt) {
          setLastUpdatedText(new Date(data.availabilityLastUpdatedAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [listingId, selectedDate]);

  const handleToggleShift = async (slot: ShiftSlot) => {
    const token = localStorage.getItem('iq_token');
    if (!token) return;

    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    setTogglingShiftName(slot.shiftName);

    try {
      const res = await fetch(`/api/provider/listings/${listingId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          shiftName: slot.shiftName,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Optimistically update local slots state
        setSlots((prev) =>
          prev.map((s) => (s.shiftName === slot.shiftName ? { ...s, status: newStatus } : s))
        );
        showToast(
          newStatus === 'AVAILABLE'
            ? `🟢 تم فتح الشفت [${slot.shiftName}] كـ (شاغر) للزبائن`
            : `🔴 تم إغلاق الشفت [${slot.shiftName}] وتحديده كـ (محجوز)`
        );
        if (onAvailabilityChange) onAvailabilityChange();
      } else {
        alert(data.error || 'فشل تعديل حالة الشفت');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setTogglingShiftName(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-xs font-bold text-gray-400 animate-pulse bg-gray-50 rounded-2xl border border-gray-100">
        جاري تحميل شفتات المكان والشواغر...
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-md dir-rtl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-xs">
            ⚡
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-white leading-tight">إدارة الشفتات والشواغر اليومية</h3>
            <span className="text-[10px] text-slate-300 font-medium block">
              تحديث فوري يظهر للزبائن بنفس اللحظة ⚡
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-bold">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white outline-none cursor-pointer text-[11px] font-bold"
          />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-extrabold p-2.5 rounded-2xl text-center animate-in fade-in duration-200 shadow-2xs">
          {toastMsg}
        </div>
      )}

      {/* Summary Pill */}
      <div className="flex items-center justify-between text-[11px] font-bold px-1">
        <span className="text-slate-300">
          حالة التوفر اليوم: <span className="text-amber-300 font-extrabold">{availableCount} من {slots.length} شفتات شواغر 🟢</span>
        </span>
        {lastUpdatedText && (
          <span className="text-slate-400 text-[10px]">آخر تحديث: {lastUpdatedText}</span>
        )}
      </div>

      {/* Shift Slots Grid */}
      <div className="space-y-2">
        {slots.map((slot, index) => {
          const isAvailable = slot.status === 'AVAILABLE';
          const isToggling = togglingShiftName === slot.shiftName;

          return (
            <div
              key={index}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                isAvailable
                  ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/30'
                  : 'bg-red-950/30 border-red-500/40 opacity-90'
              }`}
            >
              {/* Shift info */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white truncate">{slot.shiftName}</span>
                  <span className="text-[10px] text-slate-300 font-medium">({slot.startTime} - {slot.endTime})</span>
                </div>
                <span className="text-[11px] font-bold text-amber-300 block">
                  {formatIQD(slot.price)}
                </span>
              </div>

              {/* Status Toggle Button */}
              <button
                type="button"
                disabled={isToggling}
                onClick={() => handleToggleShift(slot)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 shadow-xs ${
                  isAvailable
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/30'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isToggling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isAvailable ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متوفر / شاغر 🟢</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>محجوز / غير متوفر 🔴</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
