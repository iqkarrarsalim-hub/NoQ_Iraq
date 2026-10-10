'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import MapView from '@/components/shared/MapView';
import { ListingDetailSkeleton } from '@/components/customer/SkeletonLoader';
import {
  Star, MapPin, Users, Phone, MessageCircle, Calendar,
  Clock, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, ChevronRight, ChevronLeft, ImageIcon, Maximize2, X, ZoomIn, Heart
} from 'lucide-react';
import { formatIQD } from '@/lib/constants';
import { getListingImages, handleImageError } from '@/lib/images';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      try {
        const storedFavs: string[] = JSON.parse(localStorage.getItem('iq_favorites') || '[]');
        setIsFavorite(storedFavs.includes(id));
      } catch (e) {}
    }
  }, [id]);

  const toggleFavorite = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const newFavState = !isFavorite;
    setIsFavorite(newFavState);

    try {
      const storedFavs: string[] = JSON.parse(localStorage.getItem('iq_favorites') || '[]');
      let updatedFavs: string[];
      if (newFavState) {
        updatedFavs = Array.from(new Set([...storedFavs, id]));
      } else {
        updatedFavs = storedFavs.filter((itemId) => itemId !== id);
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
            body: JSON.stringify({ listingId: id }),
          });
        } else {
          await fetch(`/api/favorites?listingId=${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {}
    }
  };


  // Review Modal State (Must be declared unconditionally before early return)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${id}?date=${selectedDate}`);
      const data = await res.json();
      if (res.ok) {
        setListing(data.listing);
      }

      // Fetch availability from real API
      const availRes = await fetch(`/api/availability/listing/${id}?date=${selectedDate}`);
      const availData = await availRes.json();
      if (availRes.ok) {
        setAvailability(availData);
      }

      // Fetch Reviews
      const revRes = await fetch(`/api/reviews?listingId=${id}`);
      const revData = await revRes.json();
      if (revRes.ok) {
        setReviews(revData.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchListing();
  }, [id, selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(null);

    const token = localStorage.getItem('iq_token');
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لإرسال طلب الحجز.');
      router.push('/login');
      return;
    }

    if (!selectedSlot) {
      setBookingError('يرجى اختيار الشفت أو الفترة الزمنية المطلوبة أولاً.');
      return;
    }

    setBookingLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: id,
          bookingDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          shiftName: selectedSlot.shiftName,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || 'فشل إرسال طلب الحجز');
      } else {
        setBookingSuccess(data.booking);
        setTimeout(() => {
          router.push('/my-bookings');
        }, 3000);
      }
    } catch (e: any) {
      setBookingError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    const token = localStorage.getItem('iq_token');
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لإضافة تقييمك.');
      router.push('/login');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: id,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'فشل إرسال التقييم');
      } else {
        alert('شكراً لك! تم إضافة تقييمك بنجاح ⭐');
        setIsReviewModalOpen(false);
        setNewComment('');
        fetchListing();
      }
    } catch (err) {
      setReviewError('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading || !listing) {
    return <ListingDetailSkeleton />;
  }

  const imagesList = getListingImages(listing);
  const currentImage = imagesList[activeImageIndex]?.url || imagesList[0]?.url;
  const priceToDisplay = selectedSlot?.price || listing.basePrice;
  const availableSlots = availability?.slots || [];

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };


  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      {/* Primary Image Gallery & Badges */}
      <div className="space-y-2">
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-md bg-gray-900 group cursor-pointer"
        >
          <img
            src={currentImage}
            alt={listing.title}
            onError={(e) => handleImageError(e, listing.category?.slug)}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />

          {/* Verification Badge */}
          <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
            {listing.isVerified && <VerifiedBadge size="md" />}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 pointer-events-none">
            <span>{listing.category?.icon || '🌴'}</span>
            <span>{listing.category?.name}</span>
          </div>

          {/* Expand Fullscreen Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 transition shadow-sm"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>توسيع الصور ({imagesList.length})</span>
          </button>

          {/* Navigation Arrows */}
          {imagesList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition z-10 shadow-md"
                title="الصورة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition z-10 shadow-md"
                title="الصورة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        {imagesList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {imagesList.map((img: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-14 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? 'border-brand-600 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={`معاينة ${idx + 1}`}
                  onError={(e) => handleImageError(e, listing.category?.slug)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pt-2 px-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ImageIcon className="w-4 h-4 text-brand-400" />
              <span>الصورة {activeImageIndex + 1} من {imagesList.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              title="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Fullscreen Image View */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentImage}
              alt={listing.title}
              onError={(e) => handleImageError(e, listing.category?.slug)}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />

            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Navigation */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none max-w-md mx-auto w-full">
            {imagesList.map((img: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-14 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? 'border-brand-500 scale-110 shadow-lg ring-2 ring-brand-400' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={`معاينة ${idx + 1}`}
                  onError={(e) => handleImageError(e, listing.category?.slug)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Info Box */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 leading-snug">{listing.title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{listing.city?.governorate?.name ? `${listing.city.governorate.name} - ` : ''}{listing.city?.name} {listing.district ? `(${listing.district})` : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 font-extrabold text-xs shadow-2xs ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              <span className="text-xs">{isFavorite ? 'محفوظ' : 'حفظ'}</span>
            </button>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-extrabold px-2.5 py-2 rounded-2xl text-xs border border-amber-200">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{listing.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Capacity & Availability Last Updated */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
          {listing.capacity && (
            <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>يتسع لـ {listing.capacity} شخص</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-100">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{listing.availabilityLastUpdatedText || 'آخر تحديث للتوفر الآن'}</span>
          </div>
        </div>
      </div>

      {/* Description & Amenities */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm mb-1.5">تفاصيل المكان ووصف الخدمة</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">{listing.description}</p>
        </div>

        {/* Amenities Grid */}
        {listing.amenities?.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-sm mb-2.5">المميزات والخدمات المتاحة</h3>
            <div className="grid grid-cols-2 gap-2">
              {listing.amenities.map(({ amenity }: any) => (
                <div key={amenity.id} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-2xl text-xs font-bold text-gray-800">
                  <span className="text-base">{amenity.icon || '✨'}</span>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protected Booking Guarantee Banner */}
        <div className="pt-3 border-t border-gray-100">
          <div className="p-3.5 bg-brand-50/80 border border-brand-200 rounded-2xl text-xs space-y-1">
            <div className="font-extrabold text-brand-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>ضمان وحماية الحجز عبر المنصة 🛡️</span>
            </div>
            <p className="text-[11px] text-brand-700 leading-relaxed font-medium">
              يتم تزويدك برقم المالك وعنوانه الدقيق والتواصل المباشر فور إرسال وتأكيد الحجز رسمياً عبر المنصة لحماية حقوق الطرفين وضمان حجزك.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            تقييمات وآراء الزبائن ({listing.reviewCount || reviews.length})
          </h3>
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>+ أضف تقييمك ورأيك</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-2xl text-center space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              لا توجد تقييمات مضافة لهذا المكان بعد. كن أول من يجرب ويقيم!
            </p>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-700 transition"
            >
              ⭐ اكتب تقييمك الآن
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev: any) => (
              <div key={rev.id} className="p-3.5 bg-gray-50 rounded-2xl text-xs space-y-1.5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center justify-center">
                      {rev.user?.name ? rev.user.name[0] : 'ز'}
                    </div>
                    <span className="font-bold text-gray-900">{rev.user?.name || 'زبون المنصة'}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-gray-600 font-medium leading-relaxed pr-9 text-[11px]">
                    "{rev.comment}"
                  </p>
                )}
                <div className="text-[10px] text-gray-400 text-left">
                  {new Date(rev.createdAt).toLocaleDateString('ar-IQ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-100 text-right dir-rtl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                أضف تقييمك وانطباعك
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="space-y-2 text-center bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                <label className="block text-xs font-extrabold text-amber-900">اختر التقييم (من 1 إلى 5 نجوم):</label>
                <div className="flex items-center justify-center gap-2 py-1 dir-ltr">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (newHoverRating || newRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setNewHoverRating(star)}
                        onMouseLeave={() => setNewHoverRating(0)}
                        className="p-1 hover:scale-125 transition transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            isActive
                              ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                              : 'fill-gray-200 text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-extrabold text-amber-700 block">
                  {newRating === 5 ? 'ممتاز جداً ⭐⭐⭐⭐⭐' : newRating === 4 ? 'جيد جداً ⭐⭐⭐⭐' : newRating === 3 ? 'جيد ⭐⭐⭐' : newRating === 2 ? 'مقبول ⭐⭐' : 'سيء ⭐'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اكتب انطباعك وتجربتك (اختياري)</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب كلمة عن النظافة، المعاملة، أو الخدمات..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {reviewError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold">
                  {reviewError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="py-3 bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="py-3 bg-brand-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {reviewSubmitting ? 'جاري الحفظ...' : 'إرسال التقييم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Interactive Map View */}
      <MapView
        latitude={listing.latitude}
        longitude={listing.longitude}
        address={listing.address}
        district={listing.district}
        title={listing.title}
      />

      {/* Booking Steps Flow (Real API Availability Slots) */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-brand-600" />
            حجز المكان وتأكيد التوفر
          </h3>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-extrabold">
            تأكيد فوري
          </span>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {/* Step 1: Date Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">الخطوة 1: اختر تاريخ الحجز</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-extrabold outline-none focus:border-brand-500"
            />
          </div>

          {/* Step 2: Time Slot / Shift Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">الخطوة 2: اختر الشفت / الوقت المتاح</label>
            <div className="space-y-2">
              {availableSlots.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500 font-semibold">
                  ماكو أوقات متاحة بهذا اليوم، جرب تاريخ ثاني.
                </div>
              ) : (
                availableSlots.map((slot: any, idx: number) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const isBookable = slot.isBookable;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isBookable}
                      onClick={() => isBookable && setSelectedSlot(slot)}
                      className={`w-full p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
                        !isBookable
                          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-brand-50 border-brand-600 shadow-xs'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-xs text-gray-900 block">
                          {slot.shiftName || `من ${slot.startTime} إلى ${slot.endTime}`}
                        </span>
                        <span className="text-[11px] text-gray-500">من {slot.startTime} لغاية {slot.endTime}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-extrabold text-sm text-brand-700 block">
                          {formatIQD(slot.price || listing.basePrice)}
                        </span>
                        <span className={`text-[10px] font-extrabold ${isBookable ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isBookable ? 'متاح للحجز' : slot.status === 'BOOKED' ? 'محجوز فعلياً' : 'غير متاح'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 3: Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">الخطوة 3: ملاحظات للمالك (اختياري)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: حجز عائلي، تجهيز أطفال..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-brand-500"
            />
          </div>

          {/* Error Message */}
          {bookingError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Success Banner */}
          {bookingSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-3xl text-xs font-bold space-y-1">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم إرسال طلب الحجز بنجاح! 🎉</span>
              </div>
              <div>رمز الحجز المرجعي: <span className="font-extrabold underline">{bookingSuccess.bookingNumber}</span></div>
              <div className="text-[11px] text-emerald-700">الحالة الحالية: <span className="font-bold">PENDING (بانتظار موافقة المالك)</span></div>
            </div>
          )}

          {/* Price Summary & Submit Button */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block">الإجمالي الكلي</span>
              <span className="text-lg font-extrabold text-brand-700">{formatIQD(priceToDisplay)}</span>
            </div>
            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot}
              className="px-6 py-3.5 bg-brand-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              {bookingLoading ? 'جاري الإرسال...' : 'تأكيد طلب الحجز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
