'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, phone, password, role } : { phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'حدث خطأ في عملية التسجيل');
      } else {
        localStorage.setItem('iq_token', data.token);
        localStorage.setItem('iq_user', JSON.stringify(data.user));

        const targetUrl = data.user.role === 'PROVIDER' ? '/provider' : data.user.role === 'ADMIN' ? '/admin' : '/';
        window.location.href = targetUrl;
      }
    } catch (e) {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          {isRegister ? 'انضم لمنصة الحجوزات العراقية كزبون أو صاحب مكان' : 'أدخل رقم هاتفك وكلمة المرور للمتابعة'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        {/* Toggle Login / Register */}
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              !isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: كابتن علي البصري"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      role === 'CUSTOMER' ? 'bg-brand-50 border-brand-600 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    👤 زبون (أريد الحجز)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      role === 'PROVIDER' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    🏢 مالك (عندي مكان)
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف العراقي</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                placeholder="07700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-brand-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'جاري التحقق...' : isRegister ? 'تأكيد تسجيل الحساب' : 'الدخول الآن'}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
          <span className="font-bold text-gray-700 block">حسابات تجريبية سريعة:</span>
          <div>• الزبون: 07733334444 / password123</div>
          <div>• المالك: 07711112222 / password123</div>
          <div>• الأدمن: 07700000000 / password123</div>
        </div>
      </div>
    </div>
  );
}
