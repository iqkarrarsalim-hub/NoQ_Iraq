'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, ExternalLink, Star, ChevronLeft, Building2 } from 'lucide-react';
import { formatIQD } from '@/lib/constants';
import { getPrimaryImage, handleImageError } from '@/lib/images';

interface BasraInteractiveMapProps {
  listings: any[];
}

export default function BasraInteractiveMap({ listings }: BasraInteractiveMapProps) {
  const [selectedListing, setSelectedListing] = useState<any>(listings[0] || null);

  // Basra center lat/lng
  const centerLat = selectedListing?.latitude || 30.5081;
  const centerLng = selectedListing?.longitude || 47.8225;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">خريطة البصرة التفاعلية 🗺️</h3>
            <span className="text-[11px] text-gray-500">تم تحديد {listings.length} مكان في البصرة</span>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          مباشر GPS
        </span>
      </div>

      {/* Embedded Map Frame */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 shadow-inner">
        <iframe
          title="خريطة الأماكن بالبصرة"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.03}%2C${centerLat - 0.03}%2C${centerLng + 0.03}%2C${centerLat + 0.03}&layer=mapnik&marker=${centerLat}%2C${centerLng}`}
          className="w-full h-full opacity-90"
        />

        {/* Selected Location Pill */}
        {selectedListing && (
          <div className="absolute top-3 right-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold p-2.5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{selectedListing.title}</span>
            </div>
            <span className="text-[11px] text-amber-300 shrink-0 font-extrabold">
              {formatIQD(selectedListing.basePrice)}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Carousel of Place Markers */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-gray-700 block">اختر مكاناً لاستعراض موقعه وتفاصيله:</span>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {listings.map((item) => {
            const isSelected = selectedListing?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedListing(item)}
                className={`relative w-48 shrink-0 p-2.5 rounded-2xl border text-right transition flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-brand-50 border-brand-600 shadow-sm scale-102'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <img
                  src={getPrimaryImage(item)}
                  alt={item.title}
                  onError={(e) => handleImageError(e, item.category?.slug)}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="overflow-hidden space-y-0.5">
                  <h4 className="font-extrabold text-xs text-gray-900 truncate">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                    <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                    <span className="truncate">البصرة • {item.city?.name || 'المركز'}</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-brand-700">
                    {formatIQD(item.basePrice)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Listing Navigation Action Card */}
      {selectedListing && (
        <div className="p-3.5 bg-brand-50/90 border border-brand-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-brand-900 block">{selectedListing.title}</span>
            <span className="text-[11px] text-brand-700 block">{selectedListing.address || 'شارع الشاليهات والمرافق بالبصرة'}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.latitude || 30.5081},${selectedListing.longitude || 47.8225}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs hover:bg-brand-700 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>الاتجاهات</span>
            </a>
            <Link
              href={`/listing/${selectedListing.id}`}
              className="p-2 bg-white text-brand-700 rounded-xl text-xs font-bold border border-brand-200 hover:bg-gray-50 transition"
              title="عرض كامل التفاصيل"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
