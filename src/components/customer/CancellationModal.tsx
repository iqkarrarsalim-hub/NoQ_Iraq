'use client';

import { useState } from 'react';
import { AlertTriangle, X, MessageCircle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { generateProviderNotificationUrl } from '@/lib/whatsapp';

interface CancellationModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CUSTOMER_CANCELLATION_REASONS = [
  'تغيرت في الخطط العائلية / ظروف طارئة ✈️',
  'أرغب في تغيير تاريخ الحجز 📅',
  'وجدت مكاناً آخر يناسبني أكثر 🏖️',
  'السعر أو الشروط غير مناسبة 💰',
  'سبب آخر...',
];

export default function CancellationModal({ booking, onClose, onSuccess }: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState(CUSTOMER_CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmCancel = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('iq_token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const finalReason = selectedReason === 'سبب آخر...' ? (customNote || 'سبب آخر') : selectedReason;

      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cancelledBy: 'CUSTOMER',
          cancellationReason: finalReason,
          cancellationNote: customNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل إلغاء الحجز');
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

  const whatsappRescheduleUrl = booking.listing?.contactPhone
    ? generateProviderNotificationUrl(booking.listing.contactPhone, {
        bookingNumber: booking.bookingNumber,
        listingTitle: booking.listing?.title || 'المكان',
        bookingDate: booking.bookingDate,
        shiftName: booking.shiftName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        customerName: booking.customer?.name || 'زبون',
        customerPhone: booking.customer?.phone || '',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 shadow-2xl border border-gray-100 text-right dir-rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">إلغاء طلب الحجز</h3>
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

        {/* Reschedule Suggestion Box */}
        {whatsappRescheduleUrl && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>هل تود تغيير الموعد بدلاً من الإلغاء؟ 💡</span>
            </div>
            <p className="text-amber-800 font-medium leading-relaxed">
              يمكنك التواصل المباشر مع المالك لطلب تغيير التاريخ أو الشفت دون الحاجة لإلغاء الحجز.
            </p>
            <a
              href={whatsappRescheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>مراسلة المالك لتعديل الموعد عبر واتساب</span>
            </a>
          </div>
        )}

        {/* Reason Select */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800">اختر سبب الإلغاء الرئيسية *</label>
          <div className="space-y-1.5">
            {CUSTOMER_CANCELLATION_REASONS.map((reason, idx) => (
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
                  name="cancellationReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-red-600"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Extra Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات أو توضيح إضافي (اختياري)</label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="اكتب أي تفاصيل أخرى ترغب بإبلاغ الإدارة والمالك بها..."
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
            onClick={handleConfirmCancel}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition disabled:opacity-50"
          >
            {loading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء وتغيير الحالة'}
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
