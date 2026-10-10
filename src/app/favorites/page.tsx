'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ListingCard from '@/components/customer/ListingCard';
import { ListingCardSkeleton } from '@/components/customer/SkeletonLoader';
import { Heart, Search, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('iq_token');
        let apiFavListings: any[] = [];

        if (token) {
          const res = await fetch('/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            apiFavListings = data.favorites || [];
          }
        }

        // Also check localStorage favorites
        const localFavIds: string[] = JSON.parse(localStorage.getItem('iq_favorites') || '[]');

        if (apiFavListings.length > 0) {
          setFavoriteListings(apiFavListings);
        } else if (localFavIds.length > 0) {
          // Fetch all listings and filter by local favorite IDs
          const allRes = await fetch('/api/listings');
          const allData = await allRes.json();
          const filtered = (allData.listings || []).filter((l: any) => localFavIds.includes(l.id));
          setFavoriteListings(filtered);
        } else {
          setFavoriteListings([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);


  return (
    <div className="space-y-5 max-w-md mx-auto pb-10 px-4 pt-3 dir-rtl font-sans">
      {/* Page Header */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-2xs">
            <Heart className="w-5 h-5 fill-red-500" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-gray-900 leading-tight">الأماكن المفضلة</h1>
            <span className="text-[11px] text-gray-400 font-semibold">
              الأماكن والخدمات المحفوظة لحجزها لاحقاً
            </span>
          </div>
        </div>

        <Link
          href="/search"
          className="p-2 bg-gray-50 text-gray-600 hover:text-brand-600 rounded-xl border border-gray-100 transition"
          title="رجوع للبحث"
        >
          <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>

      {/* Favorites Count Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-gray-600">
          المفضلة الحالية ({favoriteListings.length} مكان محفوض)
        </span>
      </div>

      {/* Listings List */}
      {loading ? (
        <div className="space-y-4">
          <ListingCardSkeleton />
          <ListingCardSkeleton />
        </div>
      ) : favoriteListings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">لا توجد أماكن مفضلة حالياً</h3>
          <p className="text-xs text-gray-400">
            احفظ الشاليهات، الملاعب، أو الفنادق التي تعجبك أثناء التصفح للوصول إليها بنقرة واحدة.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-extrabold shadow-sm hover:bg-brand-700 transition"
          >
            <Search className="w-4 h-4" />
            استكشف الأماكن والخدمات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
