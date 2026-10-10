import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Users, Clock, Sparkles, Navigation, Heart } from 'lucide-react';
import VerifiedBadge from '../shared/VerifiedBadge';
import { formatIQD, calculateDistance } from '@/lib/constants';
import { getPrimaryImage, handleImageError } from '@/lib/images';

interface ListingCardProps {
  listing: any;
  userLocation?: { lat: number; lng: number } | null;
}

export default function ListingCard({ listing, userLocation }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const storedFavs: string[] = JSON.parse(localStorage.getItem('iq_favorites') || '[]');
      setIsFavorite(storedFavs.includes(listing.id));
    } catch (e) {}
  }, [listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newFavState = !isFavorite;
    setIsFavorite(newFavState);

    try {
      const storedFavs: string[] = JSON.parse(localStorage.getItem('iq_favorites') || '[]');
      let updatedFavs: string[];
      if (newFavState) {
        updatedFavs = Array.from(new Set([...storedFavs, listing.id]));
      } else {
        updatedFavs = storedFavs.filter((id) => id !== listing.id);
      }
      localStorage.setItem('iq_favorites', JSON.stringify(updatedFavs));
    } catch (e) {}

    const token = localStorage.getItem('iq_token');
    if (token) {
      try {
        if (newFavState) {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId: listing.id }),
          });
        } else {
          await fetch(`/api/favorites?listingId=${listing.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {}
    }
  };

  const getPricingLabel = (type: string) => {
    switch (type) {
      case 'PER_HOUR':
        return '/ ساعة';
      case 'PER_SHIFT':
        return '/ شفت';
      case 'PER_DAY':
        return '/ يوم';
      default:
        return '';
    }
  };

  const distance =
    userLocation && listing.latitude && listing.longitude
      ? calculateDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude)
      : null;

  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Image & Category Pill */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={getPrimaryImage(listing)}
            alt={listing.title}
            loading="lazy"
            onError={(e) => handleImageError(e, listing.category?.slug)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition z-20 shadow-md ${
              isFavorite
                ? 'bg-red-500 text-white scale-110'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white stroke-none' : ''}`} />
          </button>
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span>{listing.category?.icon || '🌴'}</span>
            <span>{listing.category?.name}</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>متاح اليوم</span>
          </div>
          {distance !== null && (
            <div className="absolute bottom-3 left-3 bg-brand-700/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Navigation className="w-3 h-3 text-amber-300" />
              <span>يبعد {distance} كم</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-brand-600 transition">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
              <span>{listing.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({listing.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">
                {listing.city?.governorate?.name ? `${listing.city.governorate.name} - ` : ''}
                {listing.city?.name} {listing.district ? `(${listing.district})` : ''}
              </span>
            </div>
            {listing.capacity && (
              <div className="flex items-center gap-1 shrink-0 border-r border-gray-200 pr-2">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span>{listing.capacity} شخص</span>
              </div>
            )}
          </div>

          {/* Availability Last Updated */}
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-xl font-semibold">
            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{listing.availabilityLastUpdatedText || 'آخر تحديث للتوفر الآن'}</span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
            <div>
              <span className="text-[10px] text-gray-400 block">يبدأ من</span>
              <div className="text-base font-extrabold text-brand-700">
                {formatIQD(listing.basePrice)}
                <span className="text-xs font-semibold text-gray-500 me-1">{getPricingLabel(listing.pricingType)}</span>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs group-hover:bg-brand-700 transition">
              احجز الآن
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

