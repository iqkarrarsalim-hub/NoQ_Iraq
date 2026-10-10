'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, XCircle, Trash2, MessageCircle, FileText } from 'lucide-react';
import { formatIQD } from '@/lib/constants';
import { generateProviderNotificationUrl } from '@/lib/whatsapp';
import BookingReceiptModal from '@/components/customer/BookingReceiptModal';
import CancellationModal from '@/components/customer/CancellationModal';
import ReviewModal from '@/components/customer/ReviewModal';
import { Star } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBookingReceipt, setSelectedBookingReceipt] = useState<any>(null);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<any>(null);
  const [selectedBookingToReview, setSelectedBookingToReview] = useState<any>(null);

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem('iq_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في إلغاء طلب الحجز المعلق؟')) return;

    const token = localStorage.getItem('iq_token');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل إلغاء الحجز');
      }
    } catch (e) {
      alert('حدث خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            بانتظار موافقة المالك
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            مؤكد ومقبول 🎉
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" />
            مرفوض من المالك
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
            انتهت المهلة ⌛
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
            ملغى من الزبون
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  // Filter Bookings by Tab
  const upcomingBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'EXPIRED');

  const activeListings =
    activeTab === 'UPCOMING'
      ? upcomingBookings
      : activeTab === 'COMPLETED'
      ? completedBookings
      : cancelledBookings;

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Title */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <h1 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-600" />
          حجوزاتي ومتابعة الطلبات
        </h1>
        <span className="text-xs font-bold text-gray-500">إجمالي ({bookings.length})</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'UPCOMING' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          القادمة ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          المكتملة ({completedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'CANCELLED' ? 'bg-white text-red-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          الملغاة ({cancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-xs font-semibold animate-pulse">
          جاري جلب قائمة حجوزاتك...
        </div>
      ) : activeListings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 space-y-3">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">لا توجد حجوزات في هذا التبويب</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-sm hover:bg-brand-700"
          >
            تصفح الأماكن بالبصرة
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeListings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2.5">
                <div>
                  <span className="text-[10px] text-gray-400 font-extrabold block">رمز الحجز: {booking.bookingNumber}</span>
                  <h3 className="font-extrabold text-gray-900 text-base">{booking.listing?.title}</h3>
                </div>
                <div>{getStatusBadge(booking.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl font-medium">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">التاريخ</span>
                  <span className="font-extrabold text-gray-800">{booking.bookingDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">الشفت / الوقت</span>
                  <span className="font-extrabold text-gray-800">{booking.shiftName || `${booking.startTime} - ${booking.endTime}`}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 block">المبلغ الكلي</span>
                  <span className="text-base font-extrabold text-brand-700">{formatIQD(booking.totalPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {booking.status === 'PENDING' && booking.listing?.contactPhone && (
                    <a
                      href={generateProviderNotificationUrl(booking.listing.contactPhone, {
                        bookingNumber: booking.bookingNumber,
                        listingTitle: booking.listing?.title || 'المكان',
                        bookingDate: booking.bookingDate,
                        shiftName: booking.shiftName,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        totalPrice: booking.totalPrice,
                        customerName: booking.customer?.name || 'زبون',
                        customerPhone: booking.customer?.phone || '',
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      تنبيه المالك
                    </a>
                  )}
                  {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                    <button
                      onClick={() => setSelectedBookingToReview(booking)}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-extrabold flex items-center gap-1 hover:bg-amber-100 transition"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      تقييم التجربة ⭐
                    </button>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => setSelectedBookingToCancel(booking)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 hover:bg-red-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      إلغاء الحجز
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBookingReceipt(booking)}
                    className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-extrabold flex items-center gap-1 hover:bg-brand-100 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-600" />
                    وصل الحجز
                  </button>
                  <Link
                    href={`/listing/${booking.listingId}`}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                  >
                    عرض المكان
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingToReview && (
        <ReviewModal
          booking={selectedBookingToReview}
          onClose={() => setSelectedBookingToReview(null)}
          onSuccess={() => fetchBookings()}
        />
      )}

      {/* Cancellation Modal */}
      {selectedBookingToCancel && (
        <CancellationModal
          booking={selectedBookingToCancel}
          onClose={() => setSelectedBookingToCancel(null)}
          onSuccess={() => fetchBookings()}
        />
      )}

      {/* Booking Receipt Modal */}
      {selectedBookingReceipt && (
        <BookingReceiptModal
          booking={selectedBookingReceipt}
          onClose={() => setSelectedBookingReceipt(null)}
        />
      )}
    </div>
  );
}
