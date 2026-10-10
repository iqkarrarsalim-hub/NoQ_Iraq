'use client';

import { X, SlidersHorizontal, ShieldCheck, MapPin, ArrowUpDown, Navigation, Sparkles } from 'lucide-react';
import { IRAQ_GOVERNORATES, APP_CATEGORIES } from '@/lib/constants';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (dis: string) => void;
  onlyVerified: boolean;
  setOnlyVerified: (v: boolean) => void;
  minPrice: string;
  setMinPrice: (p: string) => void;
  maxPrice: string;
  setMaxPrice: (p: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  genderFilter?: string;
  setGenderFilter?: (g: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  isLocating: boolean;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedDistrict,
  setSelectedDistrict,
  onlyVerified,
  setOnlyVerified,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  genderFilter = 'all',
  setGenderFilter,
  userLocation,
  onRequestLocation,
  isLocating,
  onApply,
  onReset,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  const activeCategories = APP_CATEGORIES.filter((c) => c.id !== 'all' && c.isActive !== false);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans dir-rtl">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            الفلاتر والترتيب المتقدم
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Location Quick Action */}
        <div className="bg-brand-50 border border-brand-100 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
            <Navigation className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{userLocation ? 'تم تحديد موقعك الحالي 📍' : 'تحديد الموقع لإظهار الأقرب لمكانك'}</span>
          </div>
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={isLocating}
            className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-brand-700 transition shadow-xs"
          >
            {isLocating ? 'جاري التحديد...' : userLocation ? 'تحديث الموقع' : '📍 موقعي الحالي'}
          </button>
        </div>

        {/* Categories Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800 flex items-center justify-between">
            <span>القسم أو نوع الخدمة:</span>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className="text-[10px] text-brand-600 hover:underline font-bold"
              >
                عرض الكل
              </button>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                {selectedCategory === cat.id && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>

          {/* Sub-gender filter for Beauty category */}
          {selectedCategory === 'beauty' && setGenderFilter && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-600">الفئة:</span>
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${genderFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('men')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${genderFilter === 'men' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                💈 رجالي
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('women')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${genderFilter === 'women' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                💅 نسائي
              </button>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
            الترتيب والفرز حسب:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'distance', label: '📍 الأقرب لموقعي' },
              { id: 'rating', label: '⭐ الأعلى تقييماً' },
              { id: 'price_asc', label: '💰 الأقل سعراً' },
              { id: 'price_desc', label: '💎 الأعلى سعراً' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (option.id === 'distance' && !userLocation) {
                    onRequestLocation();
                  }
                  setSortBy(sortBy === option.id ? 'default' : option.id);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition ${
                  sortBy === option.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Governorate / Location Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            تحديد المحافظة أو المنطقة:
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold text-gray-900 outline-none focus:border-brand-500 shadow-2xs"
          >
            {IRAQ_GOVERNORATES.map((dis, idx) => (
              <option key={idx} value={idx === 0 ? '' : dis}>
                📍 {dis}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-800">نطاق السعر (بالدينار العراقي):</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="الحد الأدنى (مثال: 50,000)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-brand-500"
            />
            <input
              type="number"
              placeholder="الحد الأعلى (مثال: 300,000)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Verified Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition ${
              onlyVerified ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              إظهار الأماكن الموثقة فقط ✓
            </span>
            <input type="checkbox" checked={onlyVerified} readOnly className="rounded text-brand-600" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onReset}
            className="py-3 bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-200 transition"
          >
            إعادة ضبط
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="py-3 bg-brand-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-brand-700 transition"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
}
