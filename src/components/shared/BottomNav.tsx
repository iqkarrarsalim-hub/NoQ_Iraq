'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, User, Plus, Building2, ShieldCheck, Users, Star } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('iq_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const role = user?.role || 'GUEST';

  let navItems = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'البحث', href: '/search', icon: Search },
    { name: 'حجوزاتي', href: '/my-bookings', icon: Calendar },
    { name: 'حسابي', href: '/profile', icon: User },
  ];

  if (role === 'PROVIDER') {
    navItems = [
      { name: 'أماكني', href: '/provider', icon: Building2 },
      { name: 'إضافة مكان', href: '/provider/listings/new', icon: Plus },
      { name: 'الحجوزات', href: '/provider', icon: Calendar },
      { name: 'حسابي', href: '/profile', icon: User },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { name: 'اللوحة', href: '/admin', icon: ShieldCheck },
      { name: 'المستخدمين', href: '/admin/users', icon: Users },
      { name: 'التقييمات', href: '/admin/reviews', icon: Star },
      { name: 'حسابي', href: '/profile', icon: User },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg md:hidden dir-rtl font-sans">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
                isActive
                  ? role === 'PROVIDER'
                    ? 'text-amber-700 font-bold bg-amber-50'
                    : role === 'ADMIN'
                    ? 'text-purple-700 font-bold bg-purple-50'
                    : 'text-brand-600 font-bold bg-emerald-50'
                  : 'text-gray-400 font-medium hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

