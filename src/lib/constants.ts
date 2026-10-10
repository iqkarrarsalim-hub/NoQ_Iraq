export const APP_CONFIG = {
  appName: 'NoQ',
  appSubTitle: 'حجوزات الشاليهات، الملاعب والقاعات بدون انتظار',
  primaryCity: 'البصرة',
  currency: 'د.ع',
  currencyCode: 'IQD',
  supportPhone: '07700000000',
  supportWhatsapp: '9647700000000',
  defaultPendingTimeoutMinutes: 30,
};

export const APP_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: '🌟', description: 'جميع الخدمات والأماكن', isActive: true },
  { id: 'chalets', name: 'شاليهات', icon: '🏖️', description: 'استراحات وعوائل', isActive: true },
  { id: 'halls', name: 'قاعات', icon: '🎉', description: 'أعراس ومناسبات', isActive: true },
  { id: 'sports', name: 'ملاعب', icon: '⚽', description: 'حجز بالساعة وشفتات', isActive: true },
  { id: 'beauty', name: 'عناية وتجميل', icon: '💆‍♀️', description: 'رجالي ونسائي', isActive: true },
  { id: 'hotels', name: 'فنادق', icon: '🏨', description: 'أجنحة وغرف', isActive: false },
  { id: 'carwash', name: 'غسيل سيارات', icon: '🚗', description: 'غسيل وتلميع', isActive: false },
];

export const IRAQ_GOVERNORATES = [
  'البصرة',
];

export function formatIQD(amount: number): string {
  return `${new Intl.NumberFormat('ar-IQ').format(amount)} ${APP_CONFIG.currency}`;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
