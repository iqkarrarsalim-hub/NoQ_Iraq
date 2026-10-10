'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Building2,
  UserCheck,
  UserX,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PROVIDER' | 'CUSTOMER' | 'ADMIN'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
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

      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId: string, updateData: { role?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('iq_token');
    setActionLoadingId(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          ...updateData,
        }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل التعديل');
      }
    } catch (e) {
      alert('حدث خطأ أثناء التواصل مع السيرفر');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    if (roleFilter === 'PROVIDER') return matchesSearch && u.role === 'PROVIDER';
    if (roleFilter === 'CUSTOMER') return matchesSearch && u.role === 'CUSTOMER';
    if (roleFilter === 'ADMIN') return matchesSearch && u.role === 'ADMIN';

    return matchesSearch;
  });

  const providerCount = users.filter((u) => u.role === 'PROVIDER').length;
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3 font-sans">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">جاري تحميل قائمة المستخدمين والمالكين...</p>
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
        <span className="text-xs font-extrabold text-gray-400">الإجمالي: {users.length} حساب</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-5 rounded-3xl text-white shadow-xl space-y-3 relative overflow-hidden border border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md border border-purple-400/40 shrink-0">
            👥
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight text-white">إدارة المستخدمين والمالكين</h1>
            <p className="text-xs text-purple-200 font-medium">التحكم بالصلاحيات، التفعيل والحظر في منصة NoQ</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setRoleFilter('PROVIDER')}
            className={`p-2.5 rounded-2xl text-center transition ${
              roleFilter === 'PROVIDER' ? 'bg-amber-400/30 ring-2 ring-amber-400' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-[10px] text-amber-200 block font-bold">المالكين 🏢</span>
            <span className="text-base font-extrabold text-amber-300">{providerCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('CUSTOMER')}
            className={`p-2.5 rounded-2xl text-center transition ${
              roleFilter === 'CUSTOMER' ? 'bg-blue-400/30 ring-2 ring-blue-400' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-[10px] text-blue-200 block font-bold">الزبائن 👤</span>
            <span className="text-base font-extrabold text-white">{customerCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('ADMIN')}
            className={`p-2.5 rounded-2xl text-center transition ${
              roleFilter === 'ADMIN' ? 'bg-purple-400/30 ring-2 ring-purple-400' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-[10px] text-purple-200 block font-bold">المشرفين 🛡️</span>
            <span className="text-base font-extrabold text-purple-300">{adminCount}</span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الحساب أو رقم الهاتف..."
          className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-gray-400 hover:text-gray-600 font-bold px-2"
          >
            مسح
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            roleFilter === 'ALL'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          الكل ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('PROVIDER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
            roleFilter === 'PROVIDER'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>🏢 المالكين</span>
          <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">{providerCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('CUSTOMER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
            roleFilter === 'CUSTOMER'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          <span>👤 الزبائن</span>
          <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">{customerCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('ADMIN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
            roleFilter === 'ADMIN'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
          }`}
        >
          <span>🛡️ المشرفين</span>
          <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">{adminCount}</span>
        </button>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 text-xs text-gray-400 font-medium space-y-1">
          <p className="font-bold text-gray-600">لا توجد أية حسابات مطابقة للبحث 👍</p>
          <p className="text-[11px] text-gray-400">جرب البحث بكلمة أخرى أو تصفية مختلفة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isProvider = u.role === 'PROVIDER';
            const isAdmin = u.role === 'ADMIN';
            const isCustomer = u.role === 'CUSTOMER';
            const isCurrentAction = actionLoadingId === u.id;

            return (
              <div
                key={u.id}
                className={`p-4 rounded-3xl border shadow-xs space-y-3 transition ${
                  !u.isActive
                    ? 'bg-red-50/40 border-red-200'
                    : isProvider
                    ? 'bg-amber-50/20 border-amber-200/80'
                    : isAdmin
                    ? 'bg-purple-50/30 border-purple-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-2xs ${
                        isAdmin
                          ? 'bg-purple-600 text-white'
                          : isProvider
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isAdmin ? '🛡️' : isProvider ? '🏢' : '👤'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-gray-900 text-sm">{u.name}</h3>
                        {!u.isActive && (
                          <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-200">
                            🛑 محظور
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${
                            isProvider
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isAdmin
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {isProvider ? 'مالك وشريك 🏢' : isAdmin ? 'مشرف المنصة 🛡️' : 'زبون 👤'}
                        </span>
                        <span className="text-[11px] text-gray-500 font-bold dir-ltr flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {u.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Quick Action */}
                  {u.phone && (
                    <a
                      href={`https://wa.me/964${u.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl transition shrink-0"
                      title="مراسلة واتساب"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    </a>
                  )}
                </div>

                {/* Account Details & Stats */}
                <div className="bg-white/80 p-3 rounded-2xl text-xs space-y-1 border border-gray-100 text-gray-700 font-medium">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>تاريخ الانضمام: {new Date(u.createdAt).toLocaleDateString('ar-IQ')}</span>
                    <span className="font-bold text-gray-900">
                      {isProvider ? `الأماكن المسجلة: ${u._count?.listings || 0}` : `الحجوزات: ${u._count?.bookings || 0}`}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                  {/* Role Switcher */}
                  <select
                    value={u.role}
                    disabled={isCurrentAction}
                    onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-2xl text-xs font-bold px-3 py-2 outline-none cursor-pointer transition text-center"
                  >
                    <option value="CUSTOMER">تحويل لزبون 👤</option>
                    <option value="PROVIDER">تحويل لمالك 🏢</option>
                    <option value="ADMIN">ترقية لمشرف 🛡️</option>
                  </select>

                  {/* Ban / Unban Toggle Button */}
                  <button
                    type="button"
                    disabled={isCurrentAction}
                    onClick={() => {
                      const confirmMsg = u.isActive
                        ? `هل أنت تأكد من حظر حساب [${u.name}]؟`
                        : `هل أنت تأكد من إلغاء حظر حساب [${u.name}] وتفعيله؟`;
                      if (confirm(confirmMsg)) {
                        handleUpdateUser(u.id, { isActive: !u.isActive });
                      }
                    }}
                    className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                      u.isActive
                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {u.isActive ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        حظر الحساب
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        تفعيل وإلغاء الحظر ✓
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
