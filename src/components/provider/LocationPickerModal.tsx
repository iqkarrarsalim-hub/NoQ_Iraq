'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Check, X, Search, Link as LinkIcon, Compass, Locate, Sparkles } from 'lucide-react';

interface LocationPickerModalProps {
  initialLat?: number;
  initialLng?: number;
  initialDistrict?: string;
  initialAddress?: string;
  onConfirm: (data: { latitude: number; longitude: number; district: string; address: string }) => void;
  onClose: () => void;
}

const BASRA_AREAS: Record<string, { lat: number; lng: number }> = {
  'الجبيلة': { lat: 30.5281, lng: 47.8125 },
  'الطويسة': { lat: 30.5020, lng: 47.8050 },
  'مناوي باشا': { lat: 30.5100, lng: 47.8280 },
  'الكورنيش': { lat: 30.5250, lng: 47.8300 },
  'الجزائر': { lat: 30.5180, lng: 47.8200 },
  'التنومة': { lat: 30.5350, lng: 47.8600 },
  'البرجسية': { lat: 30.3800, lng: 47.6500 },
  'البصرة القديمة': { lat: 30.5150, lng: 47.8350 },
  'حي المعلمين': { lat: 30.5050, lng: 47.8100 },
};

export default function LocationPickerModal({
  initialLat = 30.5081,
  initialLng = 47.8225,
  initialDistrict = 'الجبيلة',
  initialAddress = '',
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [district, setDistrict] = useState(initialDistrict);
  const [address, setAddress] = useState(initialAddress);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [parseError, setParseError] = useState('');
  const [parseSuccess, setParseSuccess] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Load Leaflet dynamically on client-side
  useEffect(() => {
    let isMounted = true;

    const initLeafletMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Inject Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet marker default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map instance if not already created
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

        // Handle Map Click to move pin
        map.on('click', (e: any) => {
          const newLat = Number(e.latlng.lat.toFixed(5));
          const newLng = Number(e.latlng.lng.toFixed(5));
          setLat(newLat);
          setLng(newLng);
          marker.setLatLng([newLat, newLng]);
        });

        // Handle Marker Drag
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          const newLat = Number(position.lat.toFixed(5));
          const newLng = Number(position.lng.toFixed(5));
          setLat(newLat);
          setLng(newLng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      }
    };

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when lat/lng state changes from dropdown or paste
  const updateMapPosition = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
      markerInstanceRef.current.setLatLng([newLat, newLng]);
    }
  };

  // Handle District Dropdown Selection
  const handleDistrictSelect = (areaName: string) => {
    setDistrict(areaName);
    if (BASRA_AREAS[areaName]) {
      const { lat: areaLat, lng: areaLng } = BASRA_AREAS[areaName];
      updateMapPosition(areaLat, areaLng);
    }
  };

  // Handle Google Maps Link Parsing
  const handleParseGoogleMapsLink = () => {
    setParseError('');
    setParseSuccess('');

    if (!googleMapsLink.trim()) return;

    // Pattern 1: @30.5281,47.8125 or q=30.5281,47.8125 or 30.5281,47.8125
    const coordsMatch = googleMapsLink.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (coordsMatch) {
      const parsedLat = parseFloat(coordsMatch[1]);
      const parsedLng = parseFloat(coordsMatch[2]);

      if (parsedLat >= 29 && parsedLat <= 32 && parsedLng >= 46 && parsedLng <= 49) {
        updateMapPosition(parsedLat, parsedLng);
        setParseSuccess('تم استخراج الموقع وتحديد الدبوس على الخريطة بنجاح! 🎉');
        return;
      }
    }

    setParseError('لم يتم العثور على إحداثيات واضحة في الرابط. يمكنك النقر مباشرة على الخريطة لتحديده بسهولة.');
  };

  // Handle Browser Geolocation
  const handleGetGPS = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gLat = Number(pos.coords.latitude.toFixed(5));
          const gLng = Number(pos.coords.longitude.toFixed(5));
          updateMapPosition(gLat, gLng);
          setGpsLoading(false);
        },
        () => {
          alert('تعذر تحديد موقع الهاتف. يرجى النقر على الخريطة مباشرة لتحديد مكانك.');
          setGpsLoading(false);
        }
      );
    } else {
      alert('الخدمة غير مدعومة بالمتصفح.');
    }
  };

  const handleSave = () => {
    onConfirm({
      latitude: lat,
      longitude: lng,
      district,
      address,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="p-4 bg-brand-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-base">حدد موقع مكانك على الخريطة 🗺️</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-right dir-rtl">

          {/* Easy Method 1: Google Maps Link Paste */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-amber-600" />
              <span>طريقة سريعة: الصق رابط جوجل ماب هنا 📍</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={googleMapsLink}
                onChange={(e) => setGoogleMapsLink(e.target.value)}
                placeholder="مثلاً: https://maps.app.goo.gl/... أو إحداثيات"
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={handleParseGoogleMapsLink}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition"
              >
                تطبيق
              </button>
            </div>
            {parseSuccess && <p className="text-[11px] font-bold text-emerald-700">{parseSuccess}</p>}
            {parseError && <p className="text-[11px] font-bold text-red-600">{parseError}</p>}
          </div>

          {/* Easy Method 2: Basra Area Dropdown & Written Verification Address */}
          <div className="space-y-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-extrabold text-gray-900 mb-1">اختر منطقة البصرة *</label>
              <select
                value={district}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold outline-none shadow-2xs cursor-pointer"
              >
                {Object.keys(BASRA_AREAS).map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                العنوان التفصيلي (أقرب نقطة دالة أو معلم معروف) *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثلاً: الصالحية - قرب شجرة الصالحية"
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-brand-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Interactive Leaflet Touch Map Picker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                انقر بأصبعك على الخريطة لتحديد مكانك بالضبط:
              </span>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200 flex items-center gap-1"
              >
                <Locate className="w-3 h-3" />
                <span>{gpsLoading ? 'جاري التحديد...' : 'موقعي GPS'}</span>
              </button>
            </div>

            {/* Map Canvas */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full z-10 pointer-events-none">
                📍 انقر على الخريطة لوضع الدبوس
              </div>
            </div>
          </div>

          {/* Selected Coordinates Display */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">الموقع المحدد:</span>
            <span className="font-mono font-bold text-brand-700 dir-ltr">{lat}, {lng}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد هذا الموقع الحجوزاتي ✅</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl text-xs font-bold transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
