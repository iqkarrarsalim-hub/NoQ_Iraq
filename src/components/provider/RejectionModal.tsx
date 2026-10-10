'use client';

import { useState } from 'react';
import { AlertCircle, X, Check, MessageCircle } from 'lucide-react';
import { generateCustomerConfirmationUrl } from '@/lib/whatsapp';

interface RejectionModalProps {
  booking: any;
  actionType: 'REJECT' | 'CANCEL'; // REJECT pending or CANCEL confirmed
  onClose: () => void;
  onSuccess: () => void;
}

const PROVIDER_REJECTION_REASONS = [
  'تضارب في الجدول / محجوز لمناسبة حضورية 📅',
  'المكان يخضع لعمليات صيانة حالياً 🛠️',
  'ظرف طارئ غير متوقع لدى المالك 🚨',
  'عدد الأشخاص يتجاوز الطاقة الاستيعابية 👥',
  'سبب آخر...',
];

export default function RejectionModal({ booking, actionType, onClose, onSuccess }: RejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState(PROVIDER_REJECTION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmRejection = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('iq_token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const finalReason = selectedReason === 'سبب آخر...' ? (customNote || 'سبب آخر من المالك') : selectedReason;

    try {
      const newStatus = actionType === 'REJECT' ? 'REJECTED' : 'CANCELLED';

      const res = await fetch(`/api/provider/bookings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          status: newStatus,
          cancelledBy: 'PROVIDER',
          cancellationReason: finalReason,
          cancellationNote: customNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل تحديث حالة الحجز');
      } else {
        onSuccess();
        onClose();
      }
    } catch (e) {
      setError('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 shadow-2xl border border-gray-100 text-right dir-rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">
                {actionType === 'REJECT' ? 'رفض طلب الحجز ❌' : 'إلغاء الحجز المؤكد ⚠️'}
              </h3>
              <span className="text-[11px] text-gray-400 font-extrabold">رمز الحجز: {booking.bookingNumber}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Info Box */}
        <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1 text-gray-700">
          <div><span className="font-bold">اسم الزبون:</span> {booking.customer?.name || 'زبون'}</div>
          <div><span className="font-bold">المكان والموعد:</span> {booking.listing?.title} ({booking.bookingDate})</div>
        </div>

        {/* Reason Select */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800">اختر سبب الرفض/الإلغاء الذي سيظهر للزبون والإدارة *</label>
          <div className="space-y-1.5">
            {PROVIDER_REJECTION_REASONS.map((reason, idx) => (
              <label
                key={idx}
                onClick={() => setSelectedReason(reason)}
                className={`w-full p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  selectedReason === reason
                    ? 'bg-red-50 border-red-500 text-red-900 shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{reason}</span>
                <input
                  type="radio"
                  name="providerReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-red-600"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Custom Note */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">توضيح إضافي للزبون (اختياري)</label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="مثلاً: نعتذر منكم، تم إغلاق الاستراحة هذا اليوم للصيانة الدوري..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-xs font-medium outline-none focus:border-red-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmRejection}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition disabled:opacity-50"
          >
            {loading ? 'جاري الإرسال...' : 'تأكيد الإرسال وتحديث الحالة'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition"
          >
            تراجع
          </button>
        </div>
      </div>
    </div>
  );
}
