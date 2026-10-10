'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass } from 'lucide-react';

interface MapViewProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  district?: string;
  title?: string;
}

export default function MapView({ latitude, longitude, address, district, title }: MapViewProps) {
  const [copied, setCopied] = useState(false);

  // Default Basra coordinates (Center of Basra: 30.5081, 47.8225)
  const lat = latitude || 30.5081;
  const lng = longitude || 47.8225;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm">الموقع الجغرافي الخريطة 🗺️</h4>
            <span className="text-[11px] text-gray-500">البصرة • {district || 'المنطقة الحضرية'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCoords}
          className="text-xs font-semibold text-gray-500 hover:text-brand-600 flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg transition"
          title="نسخ إحداثيات GPS"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'تم النسخ!' : 'الإحداثيات'}</span>
        </button>
      </div>

      {/* Address Card */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
        <div className="flex items-start gap-1.5">
          <Compass className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-slate-900 block">{district ? `منطقة ${district}` : 'محافظة البصرة'}</span>
            <span className="text-slate-600 font-medium">{address || 'شارع الشاليهات والمرافق السياحية الرئيسي'}</span>
          </div>
        </div>
      </div>

      {/* Embedded Interactive Map Frame */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 shadow-inner group">
        <iframe
          title={`خريطة ${title || 'المكان'}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.008}%2C${lng + 0.008}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
          className="w-full h-full opacity-95 transition group-hover:opacity-100"
        />

        {/* Pin Location Badge overlay */}
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>موقع المكان المباشر بالبصرة</span>
        </div>
      </div>

      {/* Quick Navigation Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Navigation className="w-4 h-4" />
          <span>الذهاب عبر Google Maps</span>
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>فتح في Waze 🚗</span>
        </a>
      </div>
    </div>
  );
}
