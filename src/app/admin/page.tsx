'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, DollarSign, Users, Building2, Sliders, RefreshCw, XCircle, Clock, AlertTriangle, FileText, Upload, Image as ImageIcon, RotateCcw, Eye, MapPin, Phone, MessageCircle, ExternalLink, X, ChevronRight, ChevronLeft, User } from 'lucide-react';
import AnalyticsCharts from '@/components/shared/AnalyticsCharts';
import NoQLogo from '@/components/shared/NoQLogo';
import { formatIQD } from '@/lib/constants';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [pendingVerificationListings, setPendingVerificationListings] = useState<any[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState('5');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING_VERIFY' | 'ALL_LISTINGS' | 'CANCELLATIONS'>('PENDING_VERIFY');
  const [inspectingListing, setInspectingListing] = useState<any | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('iq_token');
    const storedUser = localStorage.getItem('iq_user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      setUser(u);
      if (u.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      // Fetch all listings
      const res = await fetch('/api/listings');
      const data = await res.json();
      setAllListings(data.listings || []);

      // Fetch unverified listings awaiting verification
      const pRes = await fetch('/api/admin/verification', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();
      setPendingVerificationListings(pData.pendingListings || []);

      // Fetch all bookings for cancellations report
      const bRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bData = await bRes.json();
      const allB = bData.bookings || [];
      setCancelledBookings(allB.filter((b: any) => b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'EXPIRED'));

      // Fetch settings
      const sRes = await fetch('/api/admin/settings');
      const sData = await sRes.json();
      if (sData.settings?.DEFAULT_COMMISSION_PERCENT) {
        setCommissionRate(sData.settings.DEFAULT_COMMISSION_PERCENT);
      }
      if (sData.settings?.CUSTOM_APP_LOGO_URL) {
        setCustomLogoUrl(sData.settings.CUSTOM_APP_LOGO_URL);
        localStorage.setItem('iq_custom_logo', sData.settings.CUSTOM_APP_LOGO_URL);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerificationAction = async (listingId: string, verify: boolean, rejectionReason?: string) => {
    const token = localStorage.getItem('iq_token');

    try {
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId,
          verify,
          rejectionReason,
        }),
      });

      if (res.ok) {
        setInspectingListing(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل التعديل');
      }
    } catch (e) {
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const token = localStorage.getItem('iq_token');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'DEFAULT_COMMISSION_PERCENT',
          value: commissionRate,
        }),
      });

      if (res.ok) {
        alert('تم تحديث نسبة العمولة بنجاح!');
      } else {
        alert('فشل حفظ التعديلات');
      }
    } catch (e) {
      alert('حدث خطأ أثناء التواصل مع السيرفر');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const token = localStorage.getItem('iq_token');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        alert(uploadData.error || 'فشل رفع الصورة');
        return;
      }

      const newLogoUrl = uploadData.url;

      // Save setting to backend DB
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'CUSTOM_APP_LOGO_URL',
          value: newLogoUrl,
        }),
      });

      setCustomLogoUrl(newLogoUrl);
      localStorage.setItem('iq_custom_logo', newLogoUrl);

      // Dispatch global events for instant reactive logo update across all components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('logo-updated'));

      alert('✨ تم تحديث وتطبيق شعار التطبيق الجديد بنجاح في كامل المنصة!');
    } catch (e) {
      alert('حدث خطأ أثناء رفع الشعار الجديد');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!confirm('هل أنت تأكد من استعادة الشعار الرسمي الافتراضي لـ NoQ Iraq؟')) return;

    const token = localStorage.getItem('iq_token');
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'CUSTOM_APP_LOGO_URL',
          value: '',
        }),
      });

      setCustomLogoUrl('');
      localStorage.removeItem('iq_custom_logo');

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('logo-updated'));

      alert('تم إعادة الشعار الافتراضي بنجاح');
    } catch (e) {
      alert('حدث خطأ أثناء الإلغاء');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">جاري تحميل لوحة التحكم الشاملة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10 font-sans">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 rounded-3xl text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md">
              🛡️
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-none">لوحة الإدارة الشاملة</h1>
              <span className="text-[10px] text-blue-200 font-semibold">{user?.name} (Admin)</span>
            </div>
          </div>
          <span className="bg-blue-400/20 border border-blue-400/30 text-blue-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
            تحكم كامل ⚡
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center">
            <span className="text-[10px] text-blue-200 block">طلبات التوثيق</span>
            <span className="text-lg font-extrabold text-amber-300">{pendingVerificationListings.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center">
            <span className="text-[10px] text-blue-200 block">الأماكن النشطة</span>
            <span className="text-lg font-extrabold text-white">{allListings.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center">
            <span className="text-[10px] text-blue-200 block">نسبة العمولة</span>
            <span className="text-lg font-extrabold text-emerald-300">{commissionRate}%</span>
          </div>
        </div>
      </div>

      {/* Analytics & Platform Stats */}
      <AnalyticsCharts
        title="إجمالي تقرير تداولات وعمولات المنصة"
        totalRevenue={12500000}
        totalBookingsCount={48}
        confirmedCount={38}
        pendingCount={6}
        cancelledCount={4}
        commissionEarned={625000}
        role="ADMIN"
      />

      {/* Dynamic Logo & Brand Settings Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            تحديث أيقونة وشعار التطبيق (Logo)
          </h2>
          <span className="text-[10px] bg-brand-50 text-brand-700 font-extrabold px-2 py-0.5 rounded-full border border-brand-200">
            تحديث فوري
          </span>
        </div>

        {/* Preview Container */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-700 block">معاينة الشعار الحالي في المنصة:</span>
            <span className="text-[11px] text-gray-400 block">
              {customLogoUrl ? 'تم تفعيل شعار مخصص مرفوع من الأدمن' : 'الشعار الرسمي الافتراضي لـ NoQ Iraq'}
            </span>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs">
            <NoQLogo size="md" showTagline={false} customLogoUrl={customLogoUrl} />
          </div>
        </div>

        {/* Upload Action controls */}
        <div className="flex items-center gap-2">
          <label className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs">
            <Upload className="w-4 h-4" />
            <span>{uploadingLogo ? 'جاري رفع الشعار...' : 'رفع صورة أيقونة جديدة'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
          </label>

          {customLogoUrl && (
            <button
              type="button"
              onClick={handleResetLogo}
              className="p-3 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl text-xs font-bold transition border border-gray-200"
              title="إعادة للشعار الافتراضي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Commission Setting Box */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-600" />
          إدارة نسبة عمولة المنصة
        </h2>

        <form onSubmit={handleSaveCommission} className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 p-2.5 rounded-2xl border border-gray-200 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">النسبة الحالية:</span>
            <input
              type="number"
              step="0.5"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="bg-transparent font-extrabold text-sm text-brand-800 outline-none w-16 text-center"
            />
            <span className="text-xs font-bold text-gray-600">%</span>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="px-5 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-sm hover:bg-brand-700 transition"
          >
            {savingSettings ? 'جاري الحفظ...' : 'تحديث العمولة'}
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('PENDING_VERIFY')}
          className={`py-2.5 rounded-xl transition ${
            activeTab === 'PENDING_VERIFY'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          طلب توثيق ({pendingVerificationListings.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL_LISTINGS')}
          className={`py-2.5 rounded-xl transition ${
            activeTab === 'ALL_LISTINGS'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          الأماكن ({allListings.length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLATIONS')}
          className={`py-2.5 rounded-xl transition ${
            activeTab === 'CANCELLATIONS'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          سجل الإلغاء ({cancelledBookings.length})
        </button>
      </div>

      {/* Tab 1: Pending Verification */}
      {activeTab === 'PENDING_VERIFY' && (
        <div className="space-y-3">
          {pendingVerificationListings.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl text-center border border-gray-100 text-xs text-gray-400 font-medium">
              لا توجد أية أماكن في انتظار التوثيق حالياً 👍
            </div>
          ) : (
            pendingVerificationListings.map((listing) => (
              <div key={listing.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition">
                <div
                  onClick={() => {
                    setInspectingListing(listing);
                    setActiveImageIdx(0);
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                      alt={listing.title}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <ImageIcon className="w-2.5 h-2.5" />
                      {listing.images?.length || 0}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-gray-900 text-sm truncate group-hover:text-brand-600 transition">{listing.title}</h3>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-2 py-0.5 rounded-full">
                        ⏳ بانتظار المعاينة
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 block truncate">{listing.category?.name} • {listing.city?.name}</span>
                    <span className="text-xs text-brand-700 font-bold">{formatIQD(listing.basePrice)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1 text-gray-600">
                  <div><span className="font-bold text-gray-800">صاحب المكان:</span> {listing.provider?.name} ({listing.provider?.phone})</div>
                  <div><span className="font-bold text-gray-800">العنوان:</span> {listing.address}</div>
                </div>

                {/* Inspect Details & Photos Button */}
                <button
                  type="button"
                  onClick={() => {
                    setInspectingListing(listing);
                    setActiveImageIdx(0);
                  }}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>معاينة وتفتيش كافة التفاصيل والصور ({listing.images?.length || 0} صورة) 🔍</span>
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVerificationAction(listing.id, true)}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    موافقة وتوثيق المكان ✓
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('يرجى كتابة سبب رفض التوثيق:', 'المعلومات أو الصور غير كافية');
                      if (reason !== null) {
                        handleVerificationAction(listing.id, false, reason);
                      }
                    }}
                    className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-2xl text-xs transition"
                  >
                    رفض
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: All Active Listings */}
      {activeTab === 'ALL_LISTINGS' && (
        <div className="space-y-3">
          {allListings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                  alt={listing.title}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-sm truncate">{listing.title}</h3>
                  <span className="text-xs text-gray-500 block truncate">{listing.category?.name} • {listing.city?.name}</span>
                  <span className="text-[11px] text-brand-700 font-bold block">{formatIQD(listing.basePrice)}</span>
                </div>
              </div>

              <button
                onClick={() => handleVerificationAction(listing.id, !listing.isVerified)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                  listing.isVerified
                    ? 'bg-brand-50 text-brand-700 border border-brand-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${listing.isVerified ? 'text-brand-600' : 'text-gray-400'}`} />
                {listing.isVerified ? 'موثق ✓' : 'توثيق'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Cancellations & Policy Audit */}
      {activeTab === 'CANCELLATIONS' && (
        <div className="space-y-3">
          {cancelledBookings.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl text-center border border-gray-100 text-xs text-gray-400 font-medium">
              لا توجد عمليات إلغاء سابقة في المنصة 👍
            </div>
          ) : (
            cancelledBookings.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">رمز الحجز: {b.bookingNumber}</span>
                    <h3 className="font-extrabold text-gray-900 text-sm">{b.listing?.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    b.cancelledBy === 'PROVIDER' ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-red-700'
                  }`}>
                    ملغى بواسطة {b.cancelledBy === 'PROVIDER' ? 'المالك 🏢' : 'الزبون 👤'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1 text-gray-700">
                  <div><span className="font-bold">السبب المصرح:</span> {b.cancellationReason || 'لم يحدد'}</div>
                  {b.cancellationNote && <div><span className="font-bold">توضيح إضافي:</span> {b.cancellationNote}</div>}
                  <div className="text-[10px] text-gray-400 pt-1">الزبون: {b.customer?.name} ({b.customer?.phone})</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-bold">
                  <span>المبلغ المسترجع: 100% (سياسة حماية المنصة)</span>
                  <span className="text-brand-700">لا توجد عمولة مقتطعة</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Full Verification Inspection & Photo Lightbox Modal */}
      {inspectingListing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl relative border border-gray-100 font-sans my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-base font-extrabold shadow-2xs">
                  🔍
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-sm">معاينة وفحص طلب التوثيق الكامل</h2>
                  <span className="text-[11px] text-gray-400 block font-medium">مراجعة كافة الصور والبيانات قبل الموافقة</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingListing(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photos Inspection Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  صور المكان المرفوعة ({inspectingListing.images?.length || 0})
                </span>
                {inspectingListing.images?.length > 0 && (
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    صورة {activeImageIdx + 1} من {inspectingListing.images.length}
                  </span>
                )}
              </div>

              {inspectingListing.images?.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group shadow-inner">
                    <img
                      src={inspectingListing.images[activeImageIdx]?.url}
                      alt={`صورة المكان ${activeImageIdx + 1}`}
                      className="w-full h-full object-cover transition duration-300"
                    />

                    {inspectingListing.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : inspectingListing.images.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition shadow-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIdx((prev) => (prev < inspectingListing.images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition shadow-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {inspectingListing.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {inspectingListing.images.map((img: any, idx: number) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                            activeImageIdx === idx ? 'border-brand-600 ring-2 ring-brand-300 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt="مصغرة" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs text-center font-bold">
                  ⚠️ لم يقم صاحب المكان برفع أي صور بعد
                </div>
              )}
            </div>

            {/* Owner Details Card */}
            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-600" />
                  معلومات مالك العقار
                </span>
                <span className="bg-blue-200/60 text-blue-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  شريك مسجل
                </span>
              </div>
              <div className="text-xs space-y-1 text-gray-700 font-medium">
                <div><span className="font-bold text-gray-900">الاسم الكامل:</span> {inspectingListing.provider?.name || 'غير معروف'}</div>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span className="font-bold dir-ltr">{inspectingListing.provider?.phone}</span>
                  </span>
                  {inspectingListing.provider?.phone && (
                    <a
                      href={`https://wa.me/964${inspectingListing.provider.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      مراسلة عبر واتساب
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Property Specs & Address */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-600" />
                {inspectingListing.title}
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-gray-700 font-medium pt-1 border-t border-gray-200/60">
                <div><span className="font-bold text-gray-900">التصنيف:</span> {inspectingListing.category?.name}</div>
                <div><span className="font-bold text-gray-900">المدينة:</span> {inspectingListing.city?.name || 'البصرة'}</div>
                <div><span className="font-bold text-gray-900">السعر الأساسي:</span> <span className="text-brand-700 font-extrabold">{formatIQD(inspectingListing.basePrice)}</span></div>
                <div><span className="font-bold text-gray-900">السعة:</span> {inspectingListing.capacity ? `${inspectingListing.capacity} شخص` : 'غير محدد'}</div>
              </div>

              {/* Written Address & Map Coordinates Verification Comparison */}
              <div className="pt-2 border-t border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    تدقيق مطابقة العنوان والنقطة على الخريطة 🗺️
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                    مقارنة التوثيق
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                  <div>
                    <span className="font-extrabold text-gray-900 block">📝 العنوان النصي المكتوب بواسطة المالك:</span>
                    <p className="text-gray-800 font-bold text-xs bg-gray-50 p-2 rounded-lg mt-0.5 border border-gray-100">
                      {inspectingListing.address || 'لم يتم كتابة عنوان تفصيلي'}
                    </p>
                  </div>

                  {inspectingListing.latitude && inspectingListing.longitude && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-600 font-bold text-[11px]">
                        📍 موقع الدبوس على الخريطة (GPS): <span className="font-mono text-brand-700">{inspectingListing.latitude}, {inspectingListing.longitude}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${inspectingListing.latitude},${inspectingListing.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-extrabold text-brand-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        فتح على الخريطة 🗺️
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Description Box */}
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-gray-800 block">الوصف التفصيلي للمكان:</span>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-medium">
                {inspectingListing.description || 'لا يوجد وصف تفصيلي'}
              </div>
            </div>

            {/* Amenities Section */}
            {inspectingListing.amenities?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-gray-800 block">المميزات والخدمات المتوفرة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingListing.amenities.map((item: any, idx: number) => (
                    <span key={idx} className="bg-brand-50 text-brand-800 border border-brand-200 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                      {item.amenity?.icon || '✨'} {item.amenity?.name || item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Live Listing Link */}
            <div className="pt-1">
              <Link
                href={`/listing/${inspectingListing.id}`}
                target="_blank"
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                معاينة صفحة المكان الحية كما يراها الزبائن 🔗
              </Link>
            </div>

            {/* Decision Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleVerificationAction(inspectingListing.id, true)}
                className="py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                موافقة وتوثيق المكان ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  const reason = prompt('يرجى إدخال سبب رفض التوثيق (سيصل تنبيه للمالك):', 'المعلومات أو الصور غير مكتملة');
                  if (reason !== null) {
                    handleVerificationAction(inspectingListing.id, false, reason);
                  }
                }}
                className="py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                رفض طلب التوثيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
