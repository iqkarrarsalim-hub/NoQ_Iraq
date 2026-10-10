'use client';

import Link from 'next/link';
import { ShieldCheck, User, LogIn, LayoutDashboard, Search, Bell, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@/lib/constants';
import SidebarDrawer from '@/components/shared/SidebarDrawer';

import NoQLogo from '@/components/shared/NoQLogo';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUnreadNotifications = async () => {
    const token = localStorage.getItem('iq_token');
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('iq_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    fetchUnreadNotifications();

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 12000);

    window.addEventListener('storage', loadUser);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const homeHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'PROVIDER' ? '/provider' : '/';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm font-sans">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          {/* Menu Icon & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-700 hover:text-brand-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100"
              title="القائمة الجانبية"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>

            <Link href={homeHref} className="flex items-center gap-2">
              <NoQLogo size="md" />
              {user?.role === 'PROVIDER' && (
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  المالك 🏢
                </span>
              )}
              {user?.role === 'ADMIN' && (
                <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                  الأدمن 🛡️
                </span>
              )}
            </Link>
          </div>

          {/* Actions - Cleaned & Simplified */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2.5 text-gray-700 hover:text-brand-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global RTL Sidebar Drawer */}
      <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}

