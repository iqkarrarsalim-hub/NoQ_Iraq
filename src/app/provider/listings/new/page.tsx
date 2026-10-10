'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Upload, Plus, Trash2, CheckCircle2, AlertCircle,
  ArrowRight, MapPin, Navigation, Compass, Locate, Map, Sparkles, Clock, Sliders, Check, Layers
} from 'lucide-react';
import Link from 'next/link';
import LocationPickerModal from '@/components/provider/LocationPickerModal';
import { formatIQD } from '@/lib/constants';

const ALL_DAYS = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

interface ShiftSlot {
  shiftName: string;
  startTime: string;
  endTime: string;
  price: number | string;
}

export default function NewListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cityId, setCityId] = useState('');
  const [district, setDistrict] = useState('الجبيلة');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(30.5281);
  const [longitude, setLongitude] = useState(47.8125);
  const [showMapModal, setShowMapModal] = useState(false);
  const [basePrice, setBasePrice] = useState('250000');
  const [pricingType, setPricingType] = useState('PER_SHIFT');
  const [capacity, setCapacity] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Amenities State
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Custom Shifts Builder State
  const [slots, setSlots] = useState<ShiftSlot[]>([
    { shiftName: '🌅 الشفت الصباحي', startTime: '08:00', endTime: '16:00', price: 250000 },
    { shiftName: '🌃 الشفت المسائي', startTime: '17:00', endTime: '01:00', price: 250000 },
    { shiftName: '🌙 شفت مبيت كامل', startTime: '20:00', endTime: '08:00', price: 337500 },
  ]);
  const [newShiftName, setNewShiftName] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newPrice, setNewPrice] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchFormInitialData = async () => {
      try {
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (Array.isArray(catData.categories) && catData.categories.length > 0) {
          setCategories(catData.categories);
          setCategoryId(catData.categories[0].id);
        }

        // Fetch Amenities
        const amRes = await fetch('/api/amenities');
        const amData = await amRes.json();
        setAllAmenities(amData.amenities || []);

        // Fetch City ID
        const res = await fetch('/api/listings');
        const data = await res.json();
        if (data.listings?.[0]?.cityId) {
          setCityId(data.listings[0].cityId);
        }
      } catch (e) {}
    };
    fetchFormInitialData();
  }, []);

  const handleCategorySelect = (selectedId: string) => {
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (!cat) return;

    const slug = cat.slug;
    const p = parseInt(basePrice || '250000', 10);

    if (slug === 'halls') {
      setPricingType('PER_SHIFT');
      setSlots([
        { shiftName: '👰 شفت مناسبات صباحي/ظهراً', startTime: '10:00', endTime: '16:00', price: p },
        { shiftName: '💃 شفت مناسبات مسائي', startTime: '17:00', endTime: '00:00', price: p },
        { shiftName: '✨ شفت حجز يوم كامل للقاعة', startTime: '10:00', endTime: '00:00', price: Math.round(p * 1.8) },
      ]);
    } else if (slug === 'sports') {
      setPricingType('PER_HOUR');
      setSlots([
        { shiftName: '⚽ شفت خماسي عصر (ساعة ونصف)', startTime: '16:00', endTime: '17:30', price: 40000 },
        { shiftName: '⚽ شفت خماسي مغرب (ساعة ونصف)', startTime: '18:00', endTime: '19:30', price: 50000 },
        { shiftName: '⚽ شفت خماسي ليل أول (ساعة ونصف)', startTime: '20:00', endTime: '21:30', price: 50000 },
        { shiftName: '⚽ شفت خماسي ليل ثاني (ساعة ونصف)', startTime: '22:00', endTime: '23:30', price: 50000 },
      ]);
    } else if (slug === 'hotels') {
      setPricingType('PER_DAY');
      setSlots([
        { shiftName: '🏨 حجز يوم كامل / ليلة واحدة', startTime: '14:00', endTime: '12:00', price: p },
      ]);
    } else if (slug === 'carwash' || slug === 'beauty') {
      setPricingType('PER_HOUR');
      setSlots([
        { shiftName: '⏱️ 09:00 ص - 10:00 ص', startTime: '09:00', endTime: '10:00', price: p },
        { shiftName: '⏱️ 10:00 ص - 11:00 ص', startTime: '10:00', endTime: '11:00', price: p },
        { shiftName: '⏱️ 14:00 م - 15:00 م', startTime: '14:00', endTime: '15:00', price: p },
        { shiftName: '⏱️ 16:00 م - 17:00 م', startTime: '16:00', endTime: '17:00', price: p },
      ]);
    } else {
      // Default: Chalets (شاليهات)
      setPricingType('PER_SHIFT');
      setSlots([
        { shiftName: '🌅 الشفت الصباحي', startTime: '08:00', endTime: '16:00', price: p },
        { shiftName: '🌃 الشفت المسائي', startTime: '17:00', endTime: '01:00', price: p },
        { shiftName: '🌙 شفت مبيت كامل', startTime: '20:00', endTime: '08:00', price: Math.round(p * 1.35) },
      ]);
    }
  };

  const handlePricingTypeChange = (type: string) => {
    setPricingType(type);
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      handleCategorySelect(categoryId);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId]
    );
  };

  const handleAddShift = () => {
    if (!newShiftName || !newStartTime || !newEndTime) {
      alert('يرجى تحديد اسم الشفت وأوقات البداية والنهاية');
      return;
    }
    const price = newPrice ? parseInt(newPrice, 10) : parseInt(basePrice || '250000', 10);
    setSlots((prev) => [
      ...prev,
      { shiftName: newShiftName, startTime: newStartTime, endTime: newEndTime, price },
    ]);
    setNewShiftName('');
    setNewPrice('');
  };

  const handleRemoveShift = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('iq_token');
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedUrls: string[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          alert(data.error || `فشل رفع الصورة: ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (e) {
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !basePrice || !contactPhone || !categoryId) {
      setError('يرجى اختيار نوع المكان، الاسم، السعر، ورقم التواصل.');
      return;
    }

    const token = localStorage.getItem('iq_token');
    setSubmitting(true);

    // Build availability templates for all days of the week
    const templates = ALL_DAYS.map((day) => ({
      dayOfWeek: day,
      slots: slots.map((s) => ({
        shiftName: s.shiftName,
        startTime: s.startTime,
        endTime: s.endTime,
        price: typeof s.price === 'string' ? parseInt(s.price, 10) : s.price,
      })),
    }));

    try {
      const res = await fetch('/api/provider/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          cityId: cityId || undefined,
          district,
          address,
          latitude,
          longitude,
          basePrice: parseInt(basePrice, 10),
          pricingType,
          capacity: capacity ? parseInt(capacity, 10) : null,
          contactPhone,
          whatsappNumber: whatsappNumber || contactPhone,
          images: images.length > 0 ? images.map((url, i) => ({ url, isPrimary: i === 0 })) : undefined,
          amenityIds: selectedAmenities,
          templates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل إضافة المكان');
      } else {
        setSuccess('تم تسجيل المكان وتأكيد المرافق والشفتات بنجاح وهو الآن بانتظار توثيق الإدارة 🎉');
        setTimeout(() => {
          router.push('/provider');
        }, 1500);
      }
    } catch (e) {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredAmenities = () => {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const slug = selectedCategory?.slug || '';

    if (slug === 'halls') {
      const keywords = ['منصة', 'كوشة', 'DJ', 'إضاءة', 'مركزي', 'ضيافة', 'عصائر', 'بوفيه', 'طعام', 'عروس', 'شاشات', 'سماعات', 'مولدة', 'تكييف', 'كراج', 'حراسة'];
      const filtered = allAmenities.filter((a) => keywords.some((k) => a.name.includes(k)));
      return filtered.length > 0 ? filtered : allAmenities;
    }

    if (slug === 'sports') {
      const keywords = ['كشافات', 'عشب', 'كرة', 'خماسي', 'ملابس', 'تجهيز', 'دوش', 'حمام', 'كرات', 'كافتيريا', 'مدرجات', 'إضاءة', 'مولدة', 'كراج', 'واي فاي'];
      const filtered = allAmenities.filter((a) => keywords.some((k) => a.name.includes(k)));
      return filtered.length > 0 ? filtered : allAmenities;
    }

    if (slug === 'hotels') {
      const keywords = ['فندقة', 'استقبال', 'مصعد', 'غرف', 'تنظيف', 'إفطار', 'واي فاي', 'مولدة', 'تكييف', 'كراج', 'حراسة'];
      const filtered = allAmenities.filter((a) => keywords.some((k) => a.name.includes(k)));
      return filtered.length > 0 ? filtered : allAmenities;
    }

    if (slug === 'beauty') {
      const keywords = ['خاصة', 'مستقلة', 'خبيرات', 'مغربي', 'ساونا', 'تكييف', 'واي فاي'];
      const filtered = allAmenities.filter((a) => keywords.some((k) => a.name.includes(k)));
      return filtered.length > 0 ? filtered : allAmenities;
    }

    if (slug === 'carwash') {
      const keywords = ['بخار', 'تلميع', 'انتظار', 'كافتيريا', 'واي فاي', 'تكييف'];
      const filtered = allAmenities.filter((a) => keywords.some((k) => a.name.includes(k)));
      return filtered.length > 0 ? filtered : allAmenities;
    }

    // Default (شاليهات واستراحات): Exclude hall-only or sports-only amenities
    const chaletFiltered = allAmenities.filter(
      (a) => !['منصة', 'كوشة', 'DJ', 'عشب', 'خماسي', 'مصعد', 'فندقة', 'بخار'].some((k) => a.name.includes(k))
    );
    return chaletFiltered.length > 0 ? chaletFiltered : allAmenities;
  };

  const currentCategoryName = categories.find((c) => c.id === categoryId)?.name || 'المكان';

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Link href="/provider" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-gray-900 text-base">تسجيل مكان أو خدمة جديدة 🏢</h1>
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            نوع المكان والمعلومات الأساسية
          </h2>

          {/* Category Dropdown & Chips */}
          <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-2xl space-y-2">
            <label className="block text-xs font-extrabold text-brand-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>اختر تصنيف ونوع مكانك (قسم المنصة) *</span>
            </label>

            <select
              required
              value={categoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full bg-white border-2 border-brand-500 rounded-xl p-2.5 text-xs font-extrabold text-gray-900 outline-none shadow-2xs"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '🏷️'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم المكان التجاري *</label>
            <input
              type="text"
              required
              placeholder="مثلاً: قاعة البصرة الملكية / ملعب الأسطورة / شاليه الخليج"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500"
            />
          </div>

          {/* Pricing & Type */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">السعر الأساسي (د.ع) *</label>
              <input
                type="number"
                required
                placeholder="250000"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">نوع التسعير والآلية *</label>
              <select
                value={pricingType}
                onChange={(e) => handlePricingTypeChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
              >
                <option value="PER_SHIFT">🌅 بالشفت (شاليهات/قاعات)</option>
                <option value="PER_DAY">🏨 باليوم الكامل (فنادق/شقق)</option>
                <option value="PER_HOUR">⏱️ بالساعة (ملاعب/خدمات)</option>
              </select>
            </div>
          </div>

          {/* AMENITIES & FACILITIES SELECTOR */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                المرافق الخاصة بـ [{currentCategoryName}] ✨
              </span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                اخترت ({selectedAmenities.length})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {getFilteredAmenities().map((am) => {
                const isSelected = selectedAmenities.includes(am.id);
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => toggleAmenity(am.id)}
                    className={`p-2.5 rounded-2xl border text-right transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white border-emerald-600 text-emerald-950 font-extrabold shadow-sm'
                        : 'bg-white/60 border-gray-200 text-gray-700 font-semibold hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{am.icon || '✨'}</span>
                      <span className="text-xs truncate">{am.name}</span>
                    </div>

                    <div
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SHIFTS CONFIGURATOR IN CREATION FORM */}
        <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              تحديد شفتات وأوقات هذا المكان:
            </span>
            <span className="text-[10px] text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded-full">
              {slots.length} شفتات
            </span>
          </div>

          <div className="space-y-1.5">
            {slots.map((s, idx) => (
              <div key={idx} className="p-2.5 bg-white/10 rounded-2xl flex items-center justify-between text-xs border border-white/5">
                <div>
                  <span className="font-extrabold text-amber-300 block">{s.shiftName}</span>
                  <span className="text-[10px] text-slate-300 dir-ltr">{s.startTime} - {s.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-[11px]">{formatIQD(Number(s.price))}</span>
                  <button type="button" onClick={() => handleRemoveShift(idx)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Form */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <input
              type="text"
              placeholder="إضافة شفت (اسم الشفت)"
              value={newShiftName}
              onChange={(e) => setNewShiftName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
              />
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddShift}
              className="w-full py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm hover:bg-amber-300 transition"
            >
              + إضافة الشفت للقائمة
            </button>
          </div>
        </div>

        {/* Location & Interactive Map Section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>موقع المكان على الخريطة 🗺️</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              دبوس GPS
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="w-full p-4 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:from-brand-800 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                <Map className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-right">
                <span className="block font-extrabold text-sm">انقر لتحديد الموقع باللمس على الخريطة 📍</span>
                <span className="text-[11px] text-brand-100 font-medium">اختر المنطقة أو الصق رابط جوجل ماب</span>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          </button>
        </div>

        {/* Descriptive Address Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>العنوان التفصيلي (أقرب نقطة دالة أو معلم معروف) *</span>
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="مثلاً: الصالحية - قرب شجرة الصالحية"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500"
          />
        </div>

        {showMapModal && (
          <LocationPickerModal
            initialLat={latitude}
            initialLng={longitude}
            initialDistrict={district}
            initialAddress={address}
            onConfirm={(data) => {
              setLatitude(data.latitude);
              setLongitude(data.longitude);
              setDistrict(data.district);
              setAddress(data.address);
            }}
            onClose={() => setShowMapModal(false)}
          />
        )}

        {/* Phone & WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">رقم التواصل *</label>
            <input
              type="text"
              required
              placeholder="07711112222"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">رقم الواتساب</label>
            <input
              type="text"
              placeholder="9647711112222"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
            />
          </div>
        </div>

        {/* Capacity & Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">الطاقة الاستيعابية (عدد الأشخاص)</label>
          <input
            type="number"
            placeholder="30"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none mb-3"
          />

          <label className="block text-xs font-bold text-gray-700 mb-1">وصف تفصيلي للمكان</label>
          <textarea
            rows={3}
            placeholder="اكتب مواصفات الاستراحة، المسبح، التكييف، والخدمات الخاصة..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-medium outline-none"
          />
        </div>

        {/* Image Upload Component */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700">صور المعرض للمكان (اختر عدة صور 📷)</label>
            <span className="text-[10px] text-gray-400 font-semibold">{images.length} صور</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xs group bg-gray-100">
                <img
                  src={url}
                  alt={`صورة المكان ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 right-1 bg-brand-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shadow-2xs">
                    رئيسية ⭐
                  </span>
                )}
              </div>
            ))}

            <label className="aspect-square rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 flex flex-col items-center justify-center cursor-pointer transition text-center p-2">
              <Upload className="w-6 h-6 text-brand-600 mb-1" />
              <span className="text-[11px] text-brand-900 font-extrabold">
                {uploading ? 'جاري الرفع...' : 'رفع صور 📷'}
              </span>
              <span className="text-[9px] text-brand-600 font-medium">حدد عدة صور</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Errors & Success */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'جاري إضافة المكان والشفتات...' : 'حفظ وإرسال للمراجعة والتوثيق 🚀'}
        </button>
      </form>
    </div>
  );
}
