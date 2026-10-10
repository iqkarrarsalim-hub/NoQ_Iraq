'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem('iq_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('iq_token');
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {}
  };

  const handleNotificationClick = async (n: any) => {
    const token = localStorage.getItem('iq_token');
    if (!n.isRead && token) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notificationId: n.id }),
        });
      } catch (e) {}
    }

    // Smart Navigation: Provider vs Customer
    if (n.title.includes('طلب حجز جديد') || n.title.includes('إلغاء') || n.message.includes('وصلك طلب حجز')) {
      window.location.href = '/provider';
    } else {
      window.location.href = '/my-bookings';
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/profile" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
            <ArrowRight className="w-5 h-5" />
          </Link>

          <h1 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            مركز الإشعارات
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-xs font-semibold animate-pulse">
          جاري جلب إشعاراتك...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 space-y-2">
          <Bell className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">لا توجد إشعارات جديدة حالياً</p>
          <p className="text-xs text-gray-400">ستصلك الإشعارات هنا فور تقديم الحجوزات وتأكيد المالك.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-3xl border transition space-y-1 cursor-pointer hover:shadow-xs ${
                !n.isRead ? 'bg-brand-50/70 border-brand-200' : 'bg-white border-gray-100 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />}
                  <h3 className="font-extrabold text-gray-900 text-sm">{n.title}</h3>
                </div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleDateString('ar-IQ')}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium pr-4">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
