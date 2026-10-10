'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, CheckCircle2, XCircle, Clock, DollarSign,
  Calendar, Building2, Plus, Sliders, AlertCircle, ShieldCheck, Power, MessageCircle
} from 'lucide-react';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import AnalyticsCharts from '@/components/shared/AnalyticsCharts';
import RejectionModal from '@/components/provider/RejectionModal';
import ShiftAvailabilityManager from '@/components/provider/ShiftAvailabilityManager';
import { formatIQD } from '@/lib/constants';
import { generateCustomerConfirmationUrl } from '@/lib/whatsapp';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBookingForRejection, setSelectedBookingForRejection] = useState<{ booking: any; actionType: 'REJECT' | 'CANCEL' } | null>(null);

  const fetchProviderData = async () => {
    const token = localStorage.getItem('iq_token');
    const storedUser = localStorage.getItem('iq_user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      setUser(u);

      // Fetch Provider Bookings with explicit provider scope
      const res = await fetch('/api/bookings?scope=provider', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);

      // Fetch Provider Listings
      const lRes = await fetch('/api/provider/listings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lData = await lRes.json();
      setListings(lData.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
    // Poll for new booking requests every 10 seconds
    const interval = setInterval(() => {
      fetchProviderData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBookingAction = async (bookingId: string, action: 'ACCEPT' | 'REJECT') => {
    const token = localStorage.getItem('iq_token');
    setActionLoading(true);

    try {
      const res = await fetch('/api/provider/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, action }),
      });

      if (res.ok) {
        fetchProviderData();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل تنفيذ الإجراء');
      }
    } catch (e) {
      alert('حدث خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (listingId: string, currentActiveStatus: boolean) => {
    const token = localStorage.getItem('iq_token');
    try {
      const res = await fetch(`/api/provider/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActiveStatus }),
      });

      if (res.ok) {
        fetchProviderData();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل تعديل حالة النشاط');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال');
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.providerEarnings || b.totalPrice), 0);

  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL');

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'PENDING') return b.status === 'PENDING';
    if (bookingFilter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (bookingFilter === 'REJECTED') return b.status === 'REJECTED' || b.status === 'CANCELLED' || b.status === 'EXPIRED';
    return true; // ALL
  });

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      {/* Header & Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-[11px] font-extrabold mb-1.5 shadow-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>لوحة المالك والشركاء 🏢</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">{user?.name || 'لوحة التحكم والشركاء'}</h1>
            <p className="text-xs text-blue-200 font-medium mt-0.5">إدارة العقارات، متابعة الأرباح وحجوزات البصرة</p>
          </div>
          <Link
            href="/provider/listings/new"
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-extrabold flex items-center gap-1 shadow-md hover:shadow-lg transition shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            إضافة مكان
          </Link>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setBookingFilter('PENDING')}
            className={`p-3 rounded-2xl text-center transition ${
              bookingFilter === 'PENDING' ? 'bg-amber-500/30 ring-2 ring-amber-400 border border-amber-400/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] text-amber-200 block font-bold">طلبات جديدة 🔔</span>
            <span className="text-lg font-extrabold text-amber-300">{pendingBookings.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setBookingFilter('CONFIRMED')}
            className={`p-3 rounded-2xl text-center transition ${
              bookingFilter === 'CONFIRMED' ? 'bg-emerald-500/30 ring-2 ring-emerald-400 border border-emerald-400/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] text-emerald-200 block font-bold">حجوزات مؤكدة ✅</span>
            <span className="text-lg font-extrabold text-emerald-300">{confirmedBookings.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setBookingFilter('ALL')}
            className={`p-3 rounded-2xl text-center transition ${
              bookingFilter === 'ALL' ? 'bg-blue-600/40 ring-2 ring-blue-400 border border-blue-400/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] text-blue-200 block font-bold">إجمالي الأرباح 💰</span>
            <span className="text-xs font-extrabold text-blue-100 block mt-1">{formatIQD(totalRevenue)}</span>
          </button>
        </div>
      </div>

      {/* Analytics & Financial Chart */}
      <AnalyticsCharts
        title="تقرير أرباحك وأداء المكان بالبصرة"
        totalRevenue={totalRevenue}
        totalBookingsCount={bookings.length}
        confirmedCount={confirmedBookings.length}
        pendingCount={pendingBookings.length}
        cancelledCount={bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'EXPIRED').length}
        role="PROVIDER"
      />

      {/* My Listings Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            أماكني المسجلة ({listings.length})
          </h2>
          <Link
            href="/provider/listings/new"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مكان جديد
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl text-center border border-gray-100 space-y-2 shadow-xs">
            <p className="text-xs font-bold text-gray-600">ليس لديك أماكن مسجلة بعد</p>
            <Link
              href="/provider/listings/new"
              className="inline-block px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-xs transition"
            >
              سجل مكانك الأول الآن 🏢
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={l.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                      alt={l.title}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">{l.title}</h3>
                      <span className="text-xs text-gray-500 block">{l.category?.name} • {l.city?.name}</span>
                      <span className="text-xs font-extrabold text-brand-700 block">{formatIQD(l.basePrice)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-left shrink-0">
                    {l.isVerified ? (
                      <VerifiedBadge />
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold block">
                        ⏳ بانتظار التوثيق
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-time Shift Availability Control Manager */}
                <ShiftAvailabilityManager listingId={l.id} onAvailabilityChange={fetchProviderData} />

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs font-bold gap-2">
                  <button
                    onClick={() => handleToggleActive(l.id, l.isActive)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                      l.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${l.isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{l.isActive ? 'نشط' : 'موقوف'}</span>
                  </button>

                  <Link
                    href={`/provider/listings/${l.id}`}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-100 flex items-center gap-1 transition shrink-0"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>تعديل والشفتات ⚙️</span>
                  </Link>

                  <Link
                    href={`/listing/${l.id}`}
                    className="text-gray-600 font-bold hover:underline shrink-0"
                  >
                    معاينة المكان
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Bookings Management Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            طلبات وإدارة الحجوزات
          </h2>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            الإجمالي: {bookings.length} طلب
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setBookingFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              bookingFilter === 'ALL'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setBookingFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
              bookingFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⏳ قيد الانتظار</span>
            <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">{pendingBookings.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
              bookingFilter === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>✅ المؤكدة</span>
            <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">{confirmedBookings.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              bookingFilter === 'REJECTED'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            ❌ الملغاة والمرفوضة
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-8 text-center text-gray-400 text-xs font-semibold animate-pulse">
            جاري جلب كافة الطلبات...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-2xl text-center text-xs text-gray-400 font-medium">
            لا توجد طلبات حجز مطابقة للتصفية الحالية 👍
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const isPending = booking.status === 'PENDING';
              const isConfirmed = booking.status === 'CONFIRMED';
              const isRejectedOrCancelled = booking.status === 'REJECTED' || booking.status === 'CANCELLED' || booking.status === 'EXPIRED';

              return (
                <div
                  key={booking.id}
                  className={`p-4 rounded-3xl border shadow-xs space-y-3 transition ${
                    isPending
                      ? 'bg-amber-50/40 border-2 border-amber-300'
                      : isConfirmed
                      ? 'bg-white border-emerald-200'
                      : 'bg-gray-50 border-gray-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold block">#{booking.bookingNumber}</span>
                        {isPending && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                            ⏳ بانتظار موافقتك
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            ✅ حجز مؤكد
                          </span>
                        )}
                        {isRejectedOrCancelled && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            ❌ {booking.status === 'REJECTED' ? 'مرفوض' : 'ملغى'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-sm mt-1">{booking.listing?.title}</h3>
                      <span className="text-xs text-brand-700 font-bold block mt-0.5">
                        الزبون: {booking.customer?.name || 'زبون'}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl shrink-0">
                      {formatIQD(booking.totalPrice)}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl text-xs space-y-1 border border-gray-100">
                    <div><span className="font-bold text-gray-700">التاريخ:</span> {booking.bookingDate}</div>
                    <div><span className="font-bold text-gray-700">الشفت:</span> {booking.shiftName || `${booking.startTime} - ${booking.endTime}`}</div>
                    {booking.notes && <div><span className="font-bold text-gray-700">ملاحظة الزبون:</span> {booking.notes}</div>}
                    {booking.cancellationReason && (
                      <div className="text-red-600 font-bold"><span className="font-bold">سبب الرفض/الإلغاء:</span> {booking.cancellationReason}</div>
                    )}
                  </div>

                  {/* Actions for PENDING */}
                  {isPending && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'ACCEPT')}
                        disabled={actionLoading}
                        className="py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        قبول وتأكيد الحجز
                      </button>
                      <button
                        onClick={() => setSelectedBookingForRejection({ booking, actionType: 'REJECT' })}
                        disabled={actionLoading}
                        className="py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض الطلب
                      </button>
                    </div>
                  )}

                  {/* Actions for CONFIRMED */}
                  {isConfirmed && (
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-xs font-bold">
                      <span className="text-[11px] text-emerald-800">مستحقاتك: {formatIQD(booking.providerEarnings || booking.totalPrice)}</span>
                      <div className="flex items-center gap-2">
                        {booking.customer?.phone && (
                          <a
                            href={generateCustomerConfirmationUrl(booking.customer.phone, {
                              bookingNumber: booking.bookingNumber,
                              listingTitle: booking.listing?.title || 'المكان',
                              bookingDate: booking.bookingDate,
                              shiftName: booking.shiftName,
                              startTime: booking.startTime,
                              endTime: booking.endTime,
                              totalPrice: booking.totalPrice,
                              address: booking.listing?.address,
                              providerPhone: user?.phone,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            واتساب الزبون
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForRejection({ booking, actionType: 'CANCEL' })}
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[11px] font-bold hover:bg-red-100 transition"
                        >
                          إلغاء الحجز
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection & Cancellation Modal */}
      {selectedBookingForRejection && (
        <RejectionModal
          booking={selectedBookingForRejection.booking}
          actionType={selectedBookingForRejection.actionType}
          onClose={() => setSelectedBookingForRejection(null)}
          onSuccess={() => fetchProviderData()}
        />
      )}
    </div>
  );
}
