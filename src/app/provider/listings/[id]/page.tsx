'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2, Upload, Plus, Trash2, CheckCircle2, AlertCircle,
  ArrowRight, MapPin, Compass, Sparkles, Clock, Sliders, Calendar, DollarSign, Eye, Check, Layers
} from 'lucide-react';
import Link from 'next/link';
import LocationPickerModal from '@/components/provider/LocationPickerModal';
import ShiftAvailabilityManager from '@/components/provider/ShiftAvailabilityManager';
import { formatIQD } from '@/lib/constants';

interface ShiftSlot {
  id?: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  price: number | string;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Listing Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [pricingType, setPricingType] = useState('PER_SHIFT');
  const [capacity, setCapacity] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [district, setDistrict] = useState('الجبيلة');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(30.5281);
  const [longitude, setLongitude] = useState(47.8125);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Amenities State
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Custom Shifts & Availability Templates State
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [applyToAllDays, setApplyToAllDays] = useState(true);

  // New Shift Form State
  const [newShiftName, setNewShiftName] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (!listingId) return;

    const fetchInitialData = async () => {
      const token = localStorage.getItem('iq_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        // Fetch Amenities
        const amRes = await fetch('/api/amenities');
        const amData = await amRes.json();
        setAllAmenities(amData.amenities || []);

        // Fetch Listing
        const res = await fetch(`/api/provider/listings/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const d = await res.json();
          setError(d.error || 'تعذر تحميل بيانات المكان');
          setLoading(false);
          return;
        }

        const data = await res.json();
        const l = data.listing;

        if (l) {
          setTitle(l.title || '');
          setCategoryId(l.categoryId || '');
          setDescription(l.description || '');
          setBasePrice(String(l.basePrice || ''));
          setPricingType(l.pricingType || 'PER_SHIFT');
          setCapacity(l.capacity ? String(l.capacity) : '');
          setContactPhone(l.contactPhone || '');
          setWhatsappNumber(l.whatsappNumber || l.contactPhone || '');
          setDistrict(l.district || 'الجبيلة');
          setAddress(l.address || '');
          setLatitude(l.latitude || 30.5281);
          setLongitude(l.longitude || 47.8125);

          if (Array.isArray(l.images)) {
            setImages(l.images.map((img: any) => img.url));
          }

          if (Array.isArray(l.amenities)) {
            setSelectedAmenities(l.amenities.map((a: any) => a.amenityId || a.amenity?.id));
          }

          const existingTemplate = l.availabilityTemplates?.[0];
          if (existingTemplate && Array.isArray(existingTemplate.slots) && existingTemplate.slots.length > 0) {
            setSlots(
              existingTemplate.slots.map((s: any) => ({
                id: s.id,
                shiftName: s.shiftName || 'شفت خاص',
                startTime: s.startTime || '08:00',
                endTime: s.endTime || '16:00',
                price: s.price || l.basePrice,
              }))
            );
          } else if (l.categoryId) {
            handleCategorySelect(l.categoryId);
          }
        }
      } catch (e) {
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [listingId]);

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

  const handlePricingTypeChange = (newType: string) => {
    setPricingType(newType);
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
      alert('يرجى تحديد اسم الشفت ووقت البداية والنهاية');
      return;
    }
    const price = newPrice ? parseInt(newPrice, 10) : parseInt(basePrice || '250000', 10);
    setSlots((prev) => [
      ...prev,
      {
        shiftName: newShiftName,
        startTime: newStartTime,
        endTime: newEndTime,
        price,
      },
    ]);
    setNewShiftName('');
    setNewPrice('');
  };

  const handleRemoveShift = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickAddPreset = (presetName: string, start: string, end: string, multiplier = 1) => {
    const p = Math.round(parseInt(basePrice || '250000', 10) * multiplier);
    setSlots((prev) => [
      ...prev,
      {
        shiftName: presetName,
        startTime: start,
        endTime: end,
        price: p,
      },
    ]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('iq_token');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || 'فشل رفع الصورة');
      }
    } catch (e) {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !basePrice || !contactPhone) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const token = localStorage.getItem('iq_token');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/provider/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          categoryId,
          description,
          basePrice: parseInt(basePrice, 10),
          pricingType,
          capacity: capacity ? parseInt(capacity, 10) : null,
          contactPhone,
          whatsappNumber: whatsappNumber || contactPhone,
          district,
          address,
          latitude,
          longitude,
          images,
          amenityIds: selectedAmenities,
          applyToAllDays,
          slots: slots.map((s) => ({
            shiftName: s.shiftName,
            startTime: s.startTime,
            endTime: s.endTime,
            price: typeof s.price === 'string' ? parseInt(s.price, 10) : s.price,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('تم حفظ كافة التعديلات والمرافق والشفتات بنجاح 🎉');
        setTimeout(() => {
          router.push('/provider');
        }, 1500);
      } else {
        setError(data.error || 'فشل حفظ التعديلات');
      }
    } catch (e) {
      setError('حدث خطأ بالاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-extrabold text-xs animate-pulse">
        جاري تحميل تفاصيل المكان والمرافق والشفتات...
      </div>
    );
  }

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
        <h1 className="font-extrabold text-gray-900 text-base">تعديل المكان والمرافق والشفتات ⚙️</h1>
        <Link href={`/listing/${listingId}`} className="p-2 bg-brand-50 text-brand-700 rounded-xl hover:bg-brand-100">
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Info Box */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            المعلومات الأساسية والتصنيف
          </h2>

          {/* Category Dropdown & Chips */}
          <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-2xl space-y-2">
            <label className="block text-xs font-extrabold text-brand-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>نوع وتصنيف المكان (قسم التطبيق) *</span>
            </label>

            <select
              required
              value={categoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full bg-white border-2 border-brand-500 rounded-xl p-2.5 text-xs font-extrabold text-gray-900 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '🏷️'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم المكان التجاري *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">السعر الأساسي (د.ع) *</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
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
                <option value="PER_DAY">🏨 باليوم الكامل / ليلة (فنادق/شقق)</option>
                <option value="PER_HOUR">⏱️ بالساعة (ملاعب/سيارات/خدمات)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم التواصل *</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم الواتساب</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">الطاقة الاستيعابية (عدد الأشخاص)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="مثلاً 30 شخص"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">الوصف التفصيلي للمكان</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-medium outline-none"
            />
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
        </div>

        {/* AMENITIES & FACILITIES SELECTOR CHIPS */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              المرافق الخاصة بـ [{currentCategoryName}] ✨
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100">
              اخترت ({selectedAmenities.length})
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            انقر على المرافق المتوفرة في المكان ليراها الزبون كقائمة واضحة عند الحجز:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {getFilteredAmenities().map((am) => {
              const isSelected = selectedAmenities.includes(am.id);
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => toggleAmenity(am.id)}
                  className={`p-3 rounded-2xl border text-right transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-extrabold ring-1 ring-emerald-400 shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 text-gray-700 font-semibold hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-lg shrink-0">{am.icon || '✨'}</span>
                    <span className="text-xs truncate">{am.name}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Shift Availability Control Manager */}
        <ShiftAvailabilityManager listingId={listingId} />

        {/* SHIFTS & SCHEDULE MANAGER BOX */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase block">خاصية المالك المتقدمة</span>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                تحديد الشفتات وأوقات الحجز ⏰
              </h2>
            </div>
            <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full font-bold border border-amber-400/30">
              {slots.length} شفتات
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            حدد أوقات الدخول والخروج والشفتات الخاصة بمكانك مع سعر كل شفت ليعرض مباشرة للزبائن في منصة البصرة:
          </p>

          {/* Quick Preset Buttons for Per Shift */}
          {pricingType === 'PER_SHIFT' && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block">إضافة سريعة لشفتات جاهزة:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAddPreset('🌅 الشفت الصباحي', '08:00', '16:00', 1)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-xl text-xs font-bold border border-amber-500/40 transition"
                >
                  + شفت صباحي (08:00-16:00)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddPreset('🌃 الشفت المسائي', '17:00', '01:00', 1)}
                  className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-xl text-xs font-bold border border-indigo-500/40 transition"
                >
                  + شفت مسائي (17:00-01:00)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddPreset('🌙 شفت مبيت كامل', '20:00', '08:00', 1.35)}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl text-xs font-bold border border-emerald-500/40 transition"
                >
                  + شفت مبيت (20:00-08:00)
                </button>
              </div>
            </div>
          )}

          {/* Slots List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-200 block">الشفتات المعرفة حالياً:</span>
            {slots.length === 0 ? (
              <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-slate-400 font-bold">
                لا توجد شفتات معرفة بعد. أضف شفتك الأول من النموذج أدناه.
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                        <span>{s.shiftName}</span>
                      </div>
                      <span className="text-slate-300 font-mono text-[11px] block mt-0.5 dir-ltr">
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl text-xs border border-emerald-500/30">
                        {formatIQD(Number(s.price))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveShift(idx)}
                        className="p-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Shift Box */}
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <span className="text-xs font-extrabold text-amber-300 block">إضافة شفت مخصص جديد:</span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="اسم الشفت (مثلاً: شفت الظهيرة / شفت السهرة)"
                value={newShiftName}
                onChange={(e) => setNewShiftName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">وقت البداية</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">وقت النهاية</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">السعر المخصص لهذا الشفت (د.ع)</label>
                <input
                  type="number"
                  placeholder={`افتراضي: ${basePrice || '250000'}`}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddShift}
                className="w-full py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                حفظ الشفت بالقائمة ➕
              </button>
            </div>
          </div>

          {/* Toggle All Days */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="applyAllDays"
              checked={applyToAllDays}
              onChange={(e) => setApplyToAllDays(e.target.checked)}
              className="w-4 h-4 accent-amber-400 rounded"
            />
            <label htmlFor="applyAllDays" className="text-xs text-slate-200 font-bold cursor-pointer">
              تطبيق هذه الشفتات على كل أيام الأسبوع (من السبت إلى الجمعة) 📅
            </label>
          </div>
        </div>

        {/* Location Picker Box */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              الموقع والجغرافيا
            </h2>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="text-xs font-extrabold text-brand-600 hover:underline"
            >
              تعديل باللمس على الخريطة 🗺️
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
            <div className="font-bold text-gray-900">المنطقة: {district}</div>
            {address && <div className="text-gray-500 font-medium">العنوان: {address}</div>}
            <div className="text-[10px] text-gray-400 font-mono">الإحداثيات: {latitude}, {longitude}</div>
          </div>
        </div>

        {showMapModal && (
          <LocationPickerModal
            initialLat={latitude}
            initialLng={longitude}
            initialDistrict={district}
            initialAddress={address}
            onConfirm={(d) => {
              setLatitude(d.latitude);
              setLongitude(d.longitude);
              setDistrict(d.district);
              setAddress(d.address);
            }}
            onClose={() => setShowMapModal(false)}
          />
        )}

        {/* Photos Box */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-brand-600" />
            معرض صور المكان ({images.length})
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200">
                <img src={url} alt="Listing" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-500 font-bold">{uploading ? 'رفع...' : 'إضافة صورة'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Actions */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-sm font-extrabold shadow-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? 'جاري حفظ التغييرات...' : 'حفظ كافة التعديلات والمرافق والشفتات 💾'}
        </button>
      </form>
    </div>
  );
}
