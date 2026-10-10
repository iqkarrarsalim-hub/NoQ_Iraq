'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Heart,
  User,
  MessageSquare,
  Headphones,
  HelpCircle,
  ShieldCheck,
  FileText,
  LogOut,
  LogIn,
  Globe,
  X,
  Send,
  Instagram,
  Twitter,
  Youtube,
  ChevronLeft,
  ChevronDown,
  Star,
  CheckCircle2,
  Lock,
  MapPin,
  Navigation,
  Building2,
  Plus,
  LayoutDashboard,
  Users,
  Clock,
  Sliders,
  DollarSign,
  Eye,
  Bell,
  Sparkles,
  Calendar,
  Trash2
} from 'lucide-react';
import { APP_CONFIG, IRAQ_GOVERNORATES } from '@/lib/constants';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'faq' | 'terms' | 'guarantee' | 'reviews' | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('البصرة');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isLocating, setIsLocating] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);

  const handleAutoDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          router.push(`/search?lat=${latitude}&lng=${longitude}&sort=distance`);
          onClose();
        },
        (err) => {
          setIsLocating(false);
          if (
            window.location.protocol !== 'https:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1'
          ) {
            alert(
              '⚠️ تنبيه الأمان بالمتصفح:\nمتصفح الكمبيوتر يمنع تحديد الموقع على روابط الـ HTTP بالشبكة المحلية (192.168.x.x).\n\nليعمل الـ GPS في المتصفح:\n1️⃣ افتح الموقع عبر: http://localhost:3000\n2️⃣ أو جرب التطبيق من الموبايل (APK) حيث يعمل الـ GPS بشكل طبيعي وسريع جداً!'
            );
          } else {
            alert('تعذر تحديد موقعك تلقائياً. يرجى التأكد من تشغيل إذن الموقع GPS في جهازك.');
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('خدمة تحديد الموقع غير مدعومة في متصفحك.');
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('iq_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    } else {
      setUser(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, activeModal]);

  const safeClose = () => {
    if (typeof window !== 'undefined' && window.history.state?.sidebarDrawerOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined' && !window.history.state?.sidebarDrawerOpen) {
        window.history.pushState({ sidebarDrawerOpen: true }, '');
      }

      const handlePopState = () => {
        if (previewAvatarUrl) {
          setPreviewAvatarUrl(null);
        } else if (activeModal) {
          setActiveModal(null);
        } else {
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, activeModal, previewAvatarUrl, onClose]);

  const handleDeleteAvatarInSidebar = () => {
    if (!user) return;
    if (typeof window !== 'undefined' && !window.confirm('هل أنت تأكد من حذف الصورة الشخصية؟')) return;
    const updatedUser = { ...user, avatarUrl: '' };
    localStorage.setItem('iq_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setPreviewAvatarUrl(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    localStorage.removeItem('iq_user');
    localStorage.removeItem('iq_token');
    setUser(null);
    safeClose();
    window.location.href = '/';
  };

  const openModal = (modal: 'faq' | 'terms' | 'guarantee' | 'reviews') => {
    setActiveModal(modal);
  };

  if (!isOpen && !activeModal && !previewAvatarUrl) return null;

  const role = user?.role || 'GUEST';

  const customerFaqs = [
    {
      q: 'كيف يتم تأكيد الحجز على المنصة؟',
      a: 'عند اختيارك للمكان أو الخدمة وتحديد التاريخ والشفت المطلوبة، ينقل طلبك فوراً للمالك ومسؤول المنصة مع إرسال إشعار فوري وتأكيد التوفر بدون تضارب بالحجوزات.',
    },
    {
      q: 'هل تغطي المنصة جميع محافظات العراق؟',
      a: 'حالياً تغطي المنصة محافظة البصرة بالكامل، وتدريجياً سيتم التوسع وتغطية باقي المحافظات وصولاً إلى كافة المحافظات العراقية وكافة الخدمات.',
    },
    {
      q: 'هل يمكنني التواصل المباشر مع صاحب الشاليه أو الخدمة؟',
      a: 'نعم بالتأكيد! توفر المنصة زر تواصل مباشر عبر واتساب واتصال هاتفي مع المالك المباشر بعد التأكد من التفاصيل.',
    },
    {
      q: 'ما هي سياسة الإلغاء واسترداد المبلغ؟',
      a: 'يمكنك إلغاء الحجز مجاناً قبل 24 ساعة من الموعد المحدد من خلال صفحة "حجوزاتي"، ويتم إرجاع المبلغ كاملاً لرصيدك أو محفظتك.',
    },
  ];

  const providerFaqs = [
    {
      q: 'كيف أضيف مكان أو خدمة جديدة وأحدد الشفتات والأوقات؟',
      a: 'من لوحة المالك اختر "إضافة مكان جديد"، حدد نوع المكان (شاليه، فندق، ملعب، سيارة) ثم اختر نوع الإيجار (شفتات، يومي، بالساعة) وقم بإدخال الأسعار والأوقات والمرافق المتاحة.',
    },
    {
      q: 'كيف تصلني إشعارات الطلبات وتأكيد الحجوزات؟',
      a: 'تصلك إشعارات فورية في التطبيق وعلى الواتساب فور إتمام الزبون لحجز أحد عقاراتك، متضمنة تفاصيل الشفت أو التاريخ والاسم والرقم.',
    },
    {
      q: 'كيف يتم تسليم المستحقات والعمولات للمالكين؟',
      a: 'تُسلم مبالغ الحجوزات وفق الآلية المتفق عليها مع إدارة المنصة (تسليم مباشر أو تحويل عبر زين كاش / المحافظ الإلكترونية) وبأقل نسبة عمولة منافسة.',
    },
    {
      q: 'ماذا أفعل عند الحاجة لإيقاف المكان مؤقتاً أو الصيانة؟',
      a: 'يمكنك الدخول إلى "لوحة المالك وإدارة أماكني" والتحكم بحالة المكان (نشط / موقف مؤقتاً) لإخفائه أو إظهاره للزبائن فوراً ومنع تضارب الحجوزات.',
    },
  ];

  const customerTerms = [
    'الالتزام بالحضور في أوقات الشفت المحددة (الشفت الصباحي، المسائي، أو اليوم الكامل).',
    '⚠️ الإلغاء المتكرر للحجوزات يسبب حظراً مؤقتاً أو دائماً للحساب للحفاظ على مصداقية المنصة وحقوق المالكين.',
    'إبراز المستمسكات الرسمية (الهوية الوطنية / بطاقة السكن) عند الوصول بالنسبة للشاليهات والفلل والقاعات.',
    'الحفاظ التام على نظافة ومحتويات المكان، والزبون يتحمل كامل المسؤولية عن أي أضرار ناتجة عن التلف.',
    'طلب تغيير موعد أو نقل الشفت يتم بالتنسيق المباشر مع صاحب المكان وقبل 24 ساعة من بدء وقت الحجز.',
    'يمنع استخدام المكان أو الخدمة لأي أغراض تخالف القوانين المحلية المتبعة في جمهورية العراق.',
    'منصة NoQ وسيط حجوزات موثق يضمن تنظيم المواعيد وحقوق الطرفين (الزبون ومقدم الخدمة).',
  ];

  const providerTerms = [
    'مطابقة مواصفات وصور وشفتات المكان المعروضة في المنصة مع الواقع الميداني 100%.',
    'الالتزام التام بالأسعار المحددة في التطبيق وعدم تقاضي أي مبالغ إضافية غير مدونة من النزيل عند الوصول.',
    'تجهيز وتنظيف المكان قبل بدء موعد الشفت المحجوز بوقت كافٍ لضمان استقبال النزلاء بالشكل اللائق.',
    'إشعار إدارة المنصة فور حدوث أي طارئ أو تعديل على توفر المكان قبل 24 ساعة لمنع تضارب الحجوزات.',
    'عدم إلغاء حجز الزبون المؤكد بدون سبب قاهر، والإلغاء التعسفي يعرض حساب المالك لتقييد الإدراج.',
    'الالتزام بالضوابط والقوانين الرسمية المتبعة في جمهورية العراق للحفاظ على أمن وسلامة النزلاء.',
  ];

  const customerReviews = [
    { name: 'أحمد الحسان', rating: 5, date: 'قبل يومين', comment: 'حجزت استراحة عائلية، النظافة ممتازة والتعامل جداً راقي وتأكيد الحجز كان بس ثواني!' },
    { name: 'زينب علي', rating: 5, date: 'قبل 4 أيام', comment: 'مركز التجميل حجزت منه جلسة عناية، خدمة سريعة بدون انتظار ومواعيد مضبوطة 100%.' },
    { name: 'سجاد العبادي', rating: 4, date: 'قبل اسبوع', comment: 'ملعب خماسي، الحجز سهل والتواصل مباشرة وية صاحب الملعب عبر الواتساب.' },
  ];

  const providerReviews = [
    { name: 'حيدر الكعبي (حجز شاليه)', rating: 5, date: 'قبل 3 أيام', comment: 'الشاليه جداً نظيف والمسبح مصفى، التعامل راقي من المالك وتأكيد الحجز كان سريع جداً.' },
    { name: 'أمير الجابري (حجز ملعب)', rating: 5, date: 'قبل 5 أيام', comment: 'تجهيز الملعب والإضاءة في الشفت المسائي كان ممتاز، شكراً للمالك على الالتزام بالمواعيد.' },
    { name: 'مريم الصدر (حجز شقة)', rating: 4, date: 'قبل اسبوع', comment: 'شقة مرتبة وبمكان هادئ، الاستلام والتسليم تم بمرونة عالية.' },
  ];

  const faqs = role === 'PROVIDER' ? providerFaqs : customerFaqs;
  const termsList = role === 'PROVIDER' ? providerTerms : customerTerms;
  const reviewsList = role === 'PROVIDER' ? providerReviews : customerReviews;


  return (
    <>
      {/* -------------------- SIDEBAR DRAWER -------------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-[9990] overflow-hidden font-sans dir-rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={safeClose}
          />

          {/* RTL Drawer Content */}
          <aside className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white text-gray-900 shadow-2xl flex flex-col justify-between border-l border-gray-100 z-[9990] animate-slide-in-right overflow-y-auto overscroll-contain touch-pan-y scrollbar-none">

            {/* HEADER SECTION (ROLE ADAPTIVE) */}
            <div>
              {/* PROVIDER HEADER */}
              {role === 'PROVIDER' && (
                <div className="p-5 border-b border-blue-500/20 relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
                  <button
                    onClick={safeClose}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-xs"
                    title="إغلاق"
                  >
                    <X className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>

                  <Link href="/provider" onClick={safeClose} className="flex items-center gap-3.5 pt-1">
                    <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white/40 shrink-0">
                      🏢
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="bg-blue-400/30 text-blue-200 border border-blue-400/40 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                          حساب مالك 🏢
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-white truncate">{user.name}</h3>
                      <span className="text-xs text-blue-200 font-semibold flex items-center gap-1 hover:underline">
                        لوحة التحكم وإدارة الأماكن
                        <ChevronLeft className="w-3 h-3 text-blue-300" />
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* ADMIN HEADER */}
              {role === 'ADMIN' && (
                <div className="p-5 border-b border-purple-500/20 relative bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white">
                  <button
                    onClick={safeClose}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-xs"
                    title="إغلاق"
                  >
                    <X className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>

                  <Link href="/admin" onClick={safeClose} className="flex items-center gap-3.5 pt-1">
                    <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-purple-400 text-purple-950 font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white/40 shrink-0">
                      🛡️
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="bg-purple-400/30 text-purple-200 border border-purple-400/40 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                          مدير المنصة (ADMIN) 🛡️
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-white truncate">{user.name}</h3>
                      <span className="text-xs text-purple-200 font-semibold flex items-center gap-1 hover:underline">
                        لوحة الإدارة الشاملة والتوثيق
                        <ChevronLeft className="w-3 h-3 text-purple-300" />
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* CUSTOMER / GUEST HEADER */}
              {(role === 'CUSTOMER' || role === 'GUEST') && (
                <div className="p-5 border-b border-blue-700/20 relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white">
                  <button
                    onClick={safeClose}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-xs"
                    title="إغلاق"
                  >
                    <X className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>

                  {user ? (
                    <div className="flex items-center gap-3.5 pt-1">
                      {user.avatarUrl ? (
                        <div
                          className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl overflow-hidden border-2 border-white/40 shadow-md shrink-0 bg-white cursor-pointer hover:scale-105 transition"
                          onClick={() => setPreviewAvatarUrl(user.avatarUrl)}
                          title="اضغط لمعاينة الصورة الشخصية وتكبيرها"
                        >
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Link href="/profile" onClick={safeClose} className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-white text-blue-900 font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white/40 shrink-0">
                          {user.name.charAt(0)}
                        </Link>
                      )}
                      <Link href="/profile" onClick={safeClose} className="space-y-0.5 overflow-hidden">
                        <h3 className="font-extrabold text-base text-white truncate">{user.name}</h3>
                        <span className="text-xs text-blue-100 font-semibold flex items-center gap-1 hover:underline">
                          تعديل الحساب والصورة
                          <ChevronLeft className="w-3 h-3 text-blue-200" />
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/login" onClick={safeClose} className="flex items-center gap-3.5 pt-1">
                      <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30 shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-base text-white">زائر NoQ Iraq</h3>
                        <span className="text-xs text-blue-100 font-semibold flex items-center gap-1 hover:underline">
                          تسجيل الدخول / إنشاء حساب
                          <ChevronLeft className="w-3 h-3 text-blue-200" />
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {/* Location Selector (المحافظة & GPS) */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    تحديد الموقع / المحافظة:
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={isLocating}
                    className="text-[10px] bg-brand-600 text-white font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-brand-700 transition shadow-2xs"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'جاري التحديد...' : '📍 موقعي الحقيقي'}</span>
                  </button>
                </div>

                <select
                  value={selectedGovernorate}
                  onChange={(e) => {
                    if (e.target.value === 'GPS_AUTO') {
                      handleAutoDetectLocation();
                    } else {
                      setSelectedGovernorate(e.target.value);
                      const query = new URLSearchParams();
                      if (e.target.value !== 'جميع المحافظات') query.set('cityName', e.target.value);
                      router.push(`/search?${query.toString()}`);
                      onClose();
                    }
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none shadow-2xs cursor-pointer"
                >
                  <option value="GPS_AUTO" className="text-brand-700 font-extrabold">
                    📍 تحديد موقعي الحالي تلقائياً (GPS)
                  </option>
                  {IRAQ_GOVERNORATES.map((gov, i) => (
                    <option key={i} value={gov}>
                      📍 {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAVIGATION MENU ITEMS - TAILORED FOR EACH ROLE */}
              <div className="px-3 py-3 space-y-1 text-xs font-bold">
                
                {/* 1. PROVIDER (OWNER) NAVIGATION MENU */}
                {role === 'PROVIDER' && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between mb-2">
                      <span>إدارة المالك 🏢</span>
                      <span>لوحة التحكم</span>
                    </div>

                    <Link
                      href="/provider"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 text-amber-900 border border-amber-200 hover:bg-amber-500/20 transition font-extrabold"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-amber-700" />
                        <span>لوحة المالك وإدارة أماكني</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-amber-700" />
                    </Link>

                    <Link
                      href="/provider/listings/new"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 text-emerald-900 border border-emerald-100 transition font-extrabold"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="w-5 h-5 text-emerald-700" />
                        <span>إضافة مكان جديد وتحديد الشفتات</span>
                      </div>
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">جديد</span>
                    </Link>

                    <Link
                      href="/provider"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-100 text-gray-800 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span>طلبات وقبول الحجوزات</span>
                      </div>
                    </Link>

                    <div className="my-3 border-t border-gray-100" />

                    <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      معاينة الواجهة كزبون 👁️
                    </div>

                    <Link
                      href="/"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 text-gray-700 font-bold"
                    >
                      <Home className="w-5 h-5 text-gray-500" />
                      <span>واجهة الزبائن الرئيسية</span>
                    </Link>
                  </>
                )}

                {/* 2. ADMIN NAVIGATION MENU */}
                {role === 'ADMIN' && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-purple-800 uppercase tracking-wider bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between mb-2">
                      <span>إدارة المنصة 🛡️</span>
                      <span>لوحة الأدمن</span>
                    </div>

                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 transition font-extrabold shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" />
                        <span>لوحة التحكم والتوثيق 🛡️</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-purple-200" />
                    </Link>

                    <Link
                      href="/admin/users"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-purple-900 border border-purple-100 transition font-extrabold"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-700" />
                        <span>إدارة المستخدمين والمالكين</span>
                      </div>
                    </Link>

                    <Link
                      href="/admin/reviews"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-purple-900 border border-purple-100 transition font-extrabold"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-purple-700" />
                        <span>إدارة ومراجعة التقييمات</span>
                      </div>
                    </Link>

                    <div className="my-3 border-t border-gray-100" />

                    <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      معاينة الواجهة 👁️
                    </div>

                    <Link
                      href="/"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 text-gray-700 font-bold"
                    >
                      <Home className="w-5 h-5 text-gray-500" />
                      <span>واجهة الزبائن الرئيسية</span>
                    </Link>
                  </>
                )}

                {/* 3. CUSTOMER / GUEST TOOLS & REVIEWS MENU */}
                {(role === 'CUSTOMER' || role === 'GUEST') && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between mb-1.5">
                      <span>أدوات الزبائن والخدمات 🌟</span>
                      <span>NoQ Iraq</span>
                    </div>

                    <Link
                      href="/favorites"
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 transition text-gray-800 hover:text-emerald-700 group font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-red-500 group-hover:scale-110 transition" />
                        <span>أماكني المفضلة المحفوظة</span>
                      </div>
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        محفوظة ❤️
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => openModal('reviews')}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/60 transition text-gray-800 hover:text-amber-800 text-right font-bold group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
                        <span>آراء وتقييمات الزبائن بالمنصة</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        4.9
                      </span>
                    </button>
                  </>
                )}

                {/* HELP & SUPPORT SECTION */}
                <div className="my-2.5 border-t border-gray-100" />
                <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  الدعم والضوابط 🛡️
                </div>

                <a
                  href={`https://wa.me/${APP_CONFIG.supportWhatsapp}?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن خدمة في منصة NoQ Iraq')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 transition text-gray-800 hover:text-emerald-700 font-bold group"
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                    <span>{role === 'PROVIDER' ? 'دعم المالكين المباشر (واتساب)' : 'الدعم الفني المباشر (واتساب)'}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">24/7 💬</span>
                </a>

                <button
                  type="button"
                  onClick={() => openModal('faq')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 transition text-gray-800 hover:text-emerald-700 text-right font-bold group"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                    <span>{role === 'PROVIDER' ? 'الأسئلة الشائعة للمالكين' : 'الأسئلة الشائعة وتأكيد الحجز'}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('terms')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 transition text-gray-800 hover:text-emerald-700 text-right font-bold group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                    <span>{role === 'PROVIDER' ? 'شروط والتزامات المالك' : 'قوانين المنصة وضمان NoQ'}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                </button>

                {/* LOGOUT / LOGIN */}
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-600 transition text-right mt-2 font-extrabold"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs text-right mt-2 font-extrabold justify-center"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول / حساب جديد</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Footer Info & Social Icons */}
            <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50 shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  العربية (العراق)
                </span>
                <span className="text-gray-400">v1.0.0</span>
              </div>

              <div className="flex items-center justify-around text-gray-500 pt-1">
                <a href="#" className="p-2 hover:text-emerald-600 transition" title="Telegram">
                  <Send className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 hover:text-emerald-600 transition" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 hover:text-emerald-600 transition" title="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 hover:text-emerald-600 transition" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

          </aside>
        </div>
      )}

      {/* -------------------- LIGHT APP THEME MODALS -------------------- */}

      {/* 1. FAQ MODAL */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in dir-rtl font-sans">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-sm w-full p-5 text-gray-900 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-none z-[10000]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-gray-900">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                {role === 'PROVIDER' ? 'الأسئلة الشائعة للمالكين' : 'الأسئلة الشائعة'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpenFaq = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpenFaq ? null : index)}
                      className="w-full p-3 text-right font-extrabold text-xs text-gray-900 flex items-center justify-between gap-2"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-emerald-600 transition-transform ${
                          isOpenFaq ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpenFaq && (
                      <div className="px-3 pb-3 pt-1 text-[11px] text-gray-600 leading-relaxed border-t border-gray-200/60 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. TERMS & RULES MODAL */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in dir-rtl font-sans">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-sm w-full p-5 text-gray-900 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-none z-[10000]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-emerald-600" />
                {role === 'PROVIDER' ? 'شروط والتزامات المالكين' : 'قوانين وشروط المنصة'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {termsList.map((term, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 font-bold leading-relaxed">{term}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. GUARANTEE MODAL */}
      {activeModal === 'guarantee' && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in dir-rtl font-sans">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-sm w-full p-5 text-gray-900 space-y-4 shadow-2xl relative z-[10000]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-gray-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {role === 'PROVIDER' ? 'ضمان حقوق المالك وإشغال المكان' : 'ضمان الحجز والتسليم 100%'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed font-medium">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                <span className="font-extrabold text-emerald-900 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  حماية الحجز المزدوج
                </span>
                <p className="text-[11px] text-emerald-800">
                  يتم قفل التاريخ والتوقيت فور تأكيد الحجز على السيرفر لمنع أي حجز متكرر لنفس المكان.
                </p>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                <span className="font-extrabold text-emerald-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  توثيق هويات المالكين
                </span>
                <p className="text-[11px] text-emerald-800">
                  جميع الشاليهات والمراكز المعروضة تحمل شارة التوثيق الرسمي ✓ بعد المعاينة الميدانية.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. REVIEWS MODAL */}
      {activeModal === 'reviews' && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in dir-rtl font-sans">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-sm w-full p-5 text-gray-900 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-none z-[10000]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-gray-900">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {role === 'PROVIDER' ? 'تقييمات النزلاء على عقاراتي' : 'تقييمات الزبائن على NoQ Iraq'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-4 rounded-2xl text-white flex items-center justify-between shadow-xs">
              <div>
                <span className="text-2xl font-extrabold text-white">4.9</span>
                <span className="text-xs text-blue-100 font-bold block">
                  {role === 'PROVIDER' ? 'متوسط تقييم عقاراتك من الزبائن' : 'من 5 نجوم (أكثر من 120 تقييم)'}
                </span>
              </div>
              <div className="flex gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-300" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviewsList.map((rev, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-gray-900">{rev.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-bold">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <span className="text-xs text-slate-400 font-medium">{user?.name}</span>
            </div>

            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10 relative">
              <img
                src={previewAvatarUrl}
                alt={user?.name || 'صورة شخصية'}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteAvatarInSidebar}
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

    </>
  );
}
