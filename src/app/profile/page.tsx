'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  LogOut,
  MessageCircle,
  Heart,
  ChevronLeft,
  CheckCircle2,
  Save,
  Bell,
  Sparkles,
  Award,
  Building2,
  Edit3,
  Camera,
  Upload,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { APP_CONFIG, IRAQ_GOVERNORATES } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('البصرة');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [whatsappNotify, setWhatsappNotify] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('iq_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setName(parsed.name || '');
        setEmail(parsed.email || `${parsed.phone || 'user'}@iq-booking.com`);
        setPhone(parsed.phone || '');
        setCity(parsed.city || 'البصرة');
        setAddress(parsed.address || 'المركز، البصرة');
        setAvatarUrl(parsed.avatarUrl || '');
      } catch (e) {}
    }
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    const token = localStorage.getItem('iq_token');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        alert(uploadData.error || 'فشل رفع الصورة الشخصية');
        return;
      }

      const newAvatarUrl = uploadData.url;
      setAvatarUrl(newAvatarUrl);

      const updatedUser = {
        ...user,
        avatarUrl: newAvatarUrl,
      };

      localStorage.setItem('iq_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('storage'));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      alert('حدث خطأ أثناء رفع الصورة الشخصية');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = () => {
    if (!user) return;
    if (typeof window !== 'undefined' && !window.confirm('هل أنت تأكد من حذف الصورة الشخصية؟')) return;
    const updatedUser = { ...user, avatarUrl: '' };
    localStorage.setItem('iq_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setAvatarUrl('');
    setPreviewAvatarUrl(null);
    window.dispatchEvent(new Event('storage'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
      city,
      address,
      avatarUrl,
      whatsappNotify
    };

    localStorage.setItem('iq_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setSaveSuccess(true);
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('iq_token');
    localStorage.removeItem('iq_user');
    setUser(null);
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 space-y-4 max-w-md mx-auto my-8 font-sans dir-rtl">
        <User className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-base font-bold text-gray-800">لم تقم بتسجيل الدخول بعد</h2>
        <p className="text-xs text-gray-400">سجل الدخول لاستعراض بياناتك ومتابعة حجوزاتك بسهولة.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-brand-700"
        >
          تسجيل الدخول / حساب جديد
        </Link>
      </div>
    );
  }

  const roleLabel =
    user.role === 'ADMIN' ? 'مدير المنصة 🛡️' : user.role === 'PROVIDER' ? 'مالك عقارات 🏢' : 'زبون مميز 👤';

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12 font-sans dir-rtl">
      
      {/* 1. PROFESSIONAL PROFILE HEADER CARD */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-5 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-4">
        {/* Background Decorative Circles */}
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Interactive Avatar Upload Container */}
            <div className="relative group">
              <div
                className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-2xl bg-white text-blue-950 font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/40 overflow-hidden relative shrink-0 cursor-pointer"
                onClick={() => avatarUrl && setPreviewAvatarUrl(avatarUrl)}
                title={avatarUrl ? 'اضغط لتكبير ومعاينة الصورة' : ''}
              >
                {uploadingAvatar ? (
                  <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{name ? name.charAt(0) : 'U'}</span>
                )}
              </div>

              {/* Camera Upload Trigger Button */}
              <label
                className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white cursor-pointer transition hover:scale-110"
                title="تغيير الصورة الشخصية"
              >
                <Camera className="w-3 h-3 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>

              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] shadow-xs font-bold" title="حساب موثق">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-white leading-tight">{name}</h1>
                <CheckCircle2 className="w-4 h-4 text-amber-300 fill-amber-400/20" />
              </div>
              <p className="text-xs text-blue-100 font-semibold flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-200" />
                <span>{phone}</span>
              </p>
              <p className="text-[11px] text-blue-200/90 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-200" />
                <span className="truncate max-w-[160px]">{email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/20 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'إغلاق' : 'تعديل'}</span>
          </button>
        </div>

        {/* Avatar Upload & Delete Quick Action Bar */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-3">
            <label className="text-[11px] font-extrabold text-blue-100 flex items-center gap-1 cursor-pointer hover:underline">
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>{avatarUrl ? 'تغيير الصورة 📷' : 'إضافة صورة 📷'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="text-[11px] font-extrabold text-red-200 hover:text-red-100 flex items-center gap-1 hover:underline transition"
                title="حذف الصورة الشخصية"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الصورة 🗑️</span>
              </button>
            )}
          </div>

          <span className="text-blue-100 text-[11px] font-bold flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-300" />
            حساب موثق 🟢
          </span>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {saveSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
          <span>تم حفظ البيانات والصورة الشخصية بنجاح!</span>
        </div>
      )}

      {/* 2. EDITABLE PROFILE FORM SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            المعلومات الشخصية والصورة
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {isEditing ? 'مواضع التعديل مفتوحة ✏️' : 'عرض البيانات'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          {/* Avatar Picture Control in Form */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-700 shadow-2xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{name ? name.charAt(0) : 'U'}</span>
                )}
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-900 block">الصورة الشخصية</span>
                <span className="text-[10px] text-gray-400">تظهر في التعليقات والحجوزات</span>
              </div>
            </div>

            <label className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition cursor-pointer flex items-center gap-1 shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>اختيار صورة</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">الاسم الكامل:</label>
            <div className="relative">
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full text-xs font-bold rounded-2xl px-3.5 py-2.5 border outline-none transition ${
                  isEditing
                    ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
                placeholder="أدخل اسمك الكامل"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              البريد الإلكتروني (إضافة احترافية):
            </label>
            <div className="relative">
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-xs font-bold rounded-2xl px-3.5 py-2.5 border outline-none transition ${
                  isEditing
                    ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
                placeholder="example@gmail.com"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Phone Field (Read-only verified) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span>رقم الهاتف (الرقم الأساسي):</span>
              <span className="text-[10px] text-brand-700 font-extrabold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-brand-600" />
                مؤكد بالفورًا
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={phone}
                className="w-full text-xs font-bold rounded-2xl px-3.5 py-2.5 border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Governorate & City Selection */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">المحافظة:</label>
              <select
                disabled={!isEditing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full text-xs font-bold rounded-2xl px-2.5 py-2.5 border outline-none cursor-pointer transition ${
                  isEditing
                    ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                {IRAQ_GOVERNORATES.map((gov, i) => (
                  <option key={i} value={gov}>
                    📍 {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">المنطقة / الحي:</label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full text-xs font-bold rounded-2xl px-3 py-2.5 border outline-none transition ${
                    isEditing
                      ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 text-gray-900'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  placeholder="مثلاً: الجبيلة، الجزائر"
                />
              </div>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <div>
                <span className="text-xs font-extrabold text-gray-800 block">إشعارات الواتساب والتأكيد</span>
                <span className="text-[10px] text-gray-400">استلام تفاصيل الحجز عبر الرسائل</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWhatsappNotify(!whatsappNotify)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                whatsappNotify ? 'bg-brand-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:bg-brand-700 transition flex items-center justify-center gap-2 mt-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ البيانات والتعديلات</span>
            </button>
          )}
        </form>
      </div>

      {/* 3. QUICK MENU LINKS */}
      <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-sm divide-y divide-gray-50">
        <Link
          href="/my-bookings"
          className="p-3.5 flex items-center justify-between hover:bg-blue-50 rounded-2xl transition group"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-600 group-hover:scale-110 transition" />
            <div>
              <span className="text-xs font-extrabold text-gray-800 block">متابعة حجوزاتي</span>
              <span className="text-[10px] text-gray-400 font-medium">عرض جميع الشفتات والأيام المحجوزة</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-brand-600" />
        </Link>

        <Link
          href="/favorites"
          className="p-3.5 flex items-center justify-between hover:bg-blue-50 rounded-2xl transition group"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-500 group-hover:scale-110 transition" />
            <div>
              <span className="text-xs font-extrabold text-gray-800 block">أماكني المفضلة المحفوظة</span>
              <span className="text-[10px] text-gray-400 font-medium">الشاليهات والملاعب المفضلة لديك</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-brand-600" />
        </Link>

        {user.role === 'PROVIDER' && (
          <Link
            href="/provider"
            className="p-3.5 flex items-center justify-between bg-blue-50 hover:bg-blue-100/70 rounded-2xl transition border border-blue-200"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-brand-700" />
              <div>
                <span className="text-xs font-extrabold text-blue-950 block">لوحة التحكم وإدارة أماكني 🏢</span>
                <span className="text-[10px] text-blue-800 font-medium">إضافة شاليهات وتعديل الشفتات للزبائن</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-brand-700" />
          </Link>
        )}

        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="p-3.5 flex items-center justify-between bg-purple-50 hover:bg-purple-100/70 rounded-2xl transition border border-purple-200"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <div>
                <span className="text-xs font-extrabold text-purple-950 block">لوحة الإدارة والتأكيد 🛡️</span>
                <span className="text-[10px] text-purple-800 font-medium">إدارة المنصة والمستخدمين والتوثيق</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-purple-700" />
          </Link>
        )}

        <a
          href={`https://wa.me/${APP_CONFIG.supportWhatsapp}?text=${encodeURIComponent(
            'السلام عليكم، أريد الاستفسار عن خدمة في منصة NoQ Iraq'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 flex items-center justify-between hover:bg-blue-50 rounded-2xl transition group"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-brand-600 group-hover:scale-110 transition" />
            <div>
              <span className="text-xs font-extrabold text-gray-800 block">الدعم الفني عبر الواتساب</span>
              <span className="text-[10px] text-gray-400 font-medium">خدمة الزبائن والمالكين على مدار الساعة</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-brand-600" />
        </a>
      </div>

      {/* 4. LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="w-full p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج من الحساب
      </button>

      {/* 5. AVATAR PREVIEW LIGHTBOX MODAL */}
      {previewAvatarUrl && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 dir-rtl animate-fade-in font-sans">
          <button
            onClick={() => setPreviewAvatarUrl(null)}
            className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-md"
            title="إغلاق المعاينة"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>معاينة الصورة الشخصية 📷</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">{name}</span>
            </div>

            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10 relative">
              <img
                src={previewAvatarUrl}
                alt={name || 'صورة شخصية'}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="px-4 py-2.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الصورة 🗑️</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewAvatarUrl(null)}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold rounded-xl transition"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
