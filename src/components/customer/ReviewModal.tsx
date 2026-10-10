'use client';

import { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('iq_token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل إضافة التقييم');
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
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">تقييم المكان والتجربة ⭐</h3>
              <span className="text-[11px] text-gray-400 font-extrabold">{booking.listing?.title}</span>
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

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="space-y-2 text-center bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <label className="block text-xs font-extrabold text-amber-900">اختر عدد النجوم (من 1 إلى 5):</label>
            <div className="flex items-center justify-center gap-2 py-1 dir-ltr">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-125 transition transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isActive
                          ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-extrabold text-amber-700 block">
              {rating === 5 ? 'ممتاز جداً ⭐⭐⭐⭐⭐' : rating === 4 ? 'جيد جداً ⭐⭐⭐⭐' : rating === 3 ? 'جيد ⭐⭐⭐' : rating === 2 ? 'مقبول ⭐⭐' : 'سيء ⭐'}
            </span>
          </div>

          {/* Written Comment Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">تعليقك أو انطباعك (اختياري)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب كلمة عن النظافة، الخدمات، تعامل المالك..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'جاري الحفظ...' : 'إرسال التقييم رسمياً'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
