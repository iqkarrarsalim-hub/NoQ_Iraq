'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard from '@/components/customer/ListingCard';
import FilterDrawer from '@/components/customer/FilterDrawer';
import { ListingCardSkeleton } from '@/components/customer/SkeletonLoader';
import { Search, SlidersHorizontal, RefreshCw, Navigation, ArrowUpDown } from 'lucide-react';
import { APP_CATEGORIES, calculateDistance } from '@/lib/constants';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const initialCategory = searchParams.get('category') || '';
  const initialDistrict = searchParams.get('district') || '';
  const initialDate = searchParams.get('date') || '';
  const initialVerified = searchParams.get('verified') === 'true';
  const initialSort = searchParams.get('sort') || 'default';
  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');

  const initialSub = searchParams.get('sub') || 'all';

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [genderFilter, setGenderFilter] = useState(initialSub);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [onlyVerified, setOnlyVerified] = useState(initialVerified);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);

  // GPS Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    paramLat && paramLng ? { lat: parseFloat(paramLat), lng: parseFloat(paramLng) } : null
  );
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (paramLat && paramLng) {
      setUserLocation({ lat: parseFloat(paramLat), lng: parseFloat(paramLng) });
    }
    if (initialSort) {
      setSortBy(initialSort);
    }
    if (initialSub) {
      setGenderFilter(initialSub);
    }
  }, [paramLat, paramLng, initialSort, initialSub]);

  const requestUserLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
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
            alert('تعذر تحديد موقعك. يرجى التأكد من تشغيل إذن الموقع GPS.');
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('خدمة تحديد الموقع غير مدعومة في متصفحك.');
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategory) query.set('category', selectedCategory);
      if (selectedDistrict && !selectedDistrict.includes('الكل')) query.set('cityName', selectedDistrict);
      if (initialDate) query.set('date', initialDate);
      if (searchTerm) query.set('search', searchTerm);
      if (onlyVerified) query.set('verified', 'true');
      if (minPrice) query.set('minPrice', minPrice);
      if (maxPrice) query.set('maxPrice', maxPrice);

      const res = await fetch(`/api/listings?${query.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedCategory, selectedDistrict, onlyVerified]);

  // Client-side sorting & sub-filtering logic
  const getSortedListings = () => {
    let filtered = [...listings];

    // Sub-filter for beauty (men / women)
    if (selectedCategory === 'beauty' && genderFilter !== 'all') {
      filtered = filtered.filter((l) => {
        const text = `${l.title} ${l.description} ${l.district || ''} ${l.address || ''}`.toLowerCase();
        if (genderFilter === 'men') {
          return text.includes('رجال') || text.includes('رجالي') || text.includes('حلاقة') || text.includes('شبابي') || !text.includes('نساء');
        } else if (genderFilter === 'women') {
          return text.includes('نساء') || text.includes('نسائي') || text.includes('تجميل') || text.includes('صالون') || text.includes('سبا');
        }
        return true;
      });
    }

    if (sortBy === 'distance' && userLocation) {
      return filtered.sort((a, b) => {
        const distA = a.latitude && a.longitude ? calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude) : 9999;
        const distB = b.latitude && b.longitude ? calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude) : 9999;
        return distA - distB;
      });
    } else if (sortBy === 'price_asc') {
      return filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price_desc') {
      return filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'rating') {
      return filtered.sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  };

  const sortedListings = getSortedListings();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setGenderFilter('all');
    setSelectedDistrict('');
    setOnlyVerified(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    fetchResults();
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
    (onlyVerified ? 1 : 0);

  return (
    <div className="space-y-4 max-w-md mx-auto font-sans dir-rtl">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-600" />
            البحث في كافة الأماكن والخدمات
          </h2>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 bg-brand-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs hover:bg-brand-700 transition shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-white" />
            <span>الفلاتر والترتيب</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-brand-800 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center -mr-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ابحث باسم المكان، المنطقة، أو نوع الخدمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-500 shadow-2xs"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold shrink-0 hover:bg-brand-700 shadow-xs"
          >
            بحث
          </button>
        </form>

        {/* Location & Active Filters Badges Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            onClick={requestUserLocation}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1 transition ${
              userLocation
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'جاري التحديد...' : userLocation ? 'موقعي 📍' : 'تحديد موقعي 📍'}</span>
          </button>

          {/* Active Filter Pills */}
          {selectedCategory && (
            <span className="bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 rounded-2xl text-xs font-bold flex items-center gap-1 animate-fade-in">
              <span>{APP_CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('')} className="hover:text-red-600 font-extrabold pr-0.5">✕</button>
            </span>
          )}

          {sortBy !== 'default' && (
            <span className="bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 rounded-2xl text-xs font-bold flex items-center gap-1 animate-fade-in">
              <span>
                {sortBy === 'distance' && '📍 الأقرب'}
                {sortBy === 'price_asc' && '💰 الأقل سعراً'}
                {sortBy === 'price_desc' && '💎 الأعلى سعراً'}
                {sortBy === 'rating' && '⭐ الأعلى تقييماً'}
              </span>
              <button onClick={() => setSortBy('default')} className="hover:text-red-600 font-extrabold pr-0.5">✕</button>
            </span>
          )}

          {selectedDistrict && (
            <span className="bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 rounded-2xl text-xs font-bold flex items-center gap-1 animate-fade-in">
              <span>📍 {selectedDistrict}</span>
              <button onClick={() => setSelectedDistrict('')} className="hover:text-red-600 font-extrabold pr-0.5">✕</button>
            </span>
          )}

          {onlyVerified && (
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-2xl text-xs font-bold flex items-center gap-1 animate-fade-in">
              <span>موثق فقط ✓</span>
              <button onClick={() => setOnlyVerified(false)} className="hover:text-red-600 font-extrabold pr-0.5">✕</button>
            </span>
          )}
        </div>

        {/* Sub-category Gender Filter for Beauty */}
        {selectedCategory === 'beauty' && (
          <div className="flex items-center gap-2 pt-2 border-t border-pink-100 animate-fade-in">
            <span className="text-[11px] font-extrabold text-pink-900 shrink-0">فرز القسم:</span>
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                genderFilter === 'all'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
              }`}
            >
              الجميع 🌟
            </button>
            <button
              onClick={() => setGenderFilter('men')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                genderFilter === 'men'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
              }`}
            >
              💈 قسم الرجال (رجالي)
            </button>
            <button
              onClick={() => setGenderFilter('women')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                genderFilter === 'women'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
              }`}
            >
              💅 قسم النساء (نسائي)
            </button>
          </div>
        )}
      </div>

      {/* Results Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-gray-500">
          النتائج: ({sortedListings.length} مكان متاح)
        </span>
        <button onClick={fetchResults} className="text-xs text-brand-600 font-bold flex items-center gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Listings Result List */}
      {loading ? (
        <div className="space-y-4">
          <ListingCardSkeleton />
          <ListingCardSkeleton />
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 space-y-3">
          <p className="text-sm font-bold text-gray-700">لا توجد أماكن متاحة بهذا البحث حالياً</p>
          <p className="text-xs text-gray-400">جرب تغيير قسم البحث، اختيار منطقة أخرى، أو إزالة الفلاتر.</p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-sm"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} userLocation={userLocation} />
          ))}
        </div>
      )}

      {/* Mobile & Desktop Filter Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        onlyVerified={onlyVerified}
        setOnlyVerified={setOnlyVerified}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sortBy={sortBy}
        setSortBy={setSortBy}
        userLocation={userLocation}
        onRequestLocation={requestUserLocation}
        isLocating={isLocating}
        onApply={fetchResults}
        onReset={handleReset}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ListingCardSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

