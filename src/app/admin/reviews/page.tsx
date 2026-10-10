'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Trash2,
  ArrowRight,
  RefreshCw,
  Building2,
  User,
  MessageSquare
} from 'lucide-react';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const token = localStorage.getItem('iq_token');
    const storedUser = localStorage.getItem('iq_user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      if (u.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا التقييم؟')) return;

    const token = localStorage.getItem('iq_token');
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل الحذف');
      }
    } catch (e) {
      alert('حدث خطأ في الاتصال');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3 font-sans">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">جاري تحميل سجل آراء وتقييمات العملاء...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-md mx-auto pb-12 font-sans dir-rtl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-2xl transition shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الأدمن</span>
        </Link>
        <span className="text-xs font-extrabold text-gray-400">الإجمالي: {reviews.length} تقييم</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-5 rounded-3xl text-white shadow-xl space-y-2 relative overflow-hidden border border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
            ⭐
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight text-white">إدارة ومراجعة التقييمات</h1>
            <p className="text-xs text-purple-200 font-medium">مراقبة جودة الخدمات وآراء الزبائن بالمنصة</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 text-xs text-gray-400 font-medium">
          لا توجد تقييمات سابقة بالمنصة حالياً 👍
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-extrabold text-xs flex items-center justify-center">
                    {r.user?.name?.charAt(0) || '👤'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-xs">{r.user?.name || 'زائر'}</h3>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      مكان الحجز: {r.listing?.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                    title="حذف التقييم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {r.comment && (
                <div className="bg-gray-50 p-3 rounded-2xl text-xs text-gray-700 leading-relaxed font-medium">
                  "{r.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
