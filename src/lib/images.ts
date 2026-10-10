// Fallback SVG Data URIs for offline/reliable rendering without network dependency
export const SVG_FALLBACKS = {
  chalets: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/><circle cx="400" cy="240" r="90" fill="white" fill-opacity="0.15"/><text x="400" y="260" font-family="sans-serif" font-size="70" text-anchor="middle" fill="white">🌴</text><text x="400" y="380" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">شاليه واستراحة عائلية</text><text x="400" y="420" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23a7f3d0">البصرة • احجز الآن بالبصرة</text></svg>`,
  sports: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2314532d"/><stop offset="100%" stop-color="%2315803d"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/><circle cx="400" cy="240" r="90" fill="white" fill-opacity="0.15"/><text x="400" y="260" font-family="sans-serif" font-size="70" text-anchor="middle" fill="white">⚽</text><text x="400" y="380" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">ملعب ثيل صناعي خماسي</text><text x="400" y="420" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23bbf7d0">البصرة • احجز الآن بالبصرة</text></svg>`,
  halls: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23581c87"/><stop offset="100%" stop-color="%237e22ce"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/><circle cx="400" cy="240" r="90" fill="white" fill-opacity="0.15"/><text x="400" y="260" font-family="sans-serif" font-size="70" text-anchor="middle" fill="white">💍</text><text x="400" y="380" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">قاعة مناسبات وأفراح VIP</text><text x="400" y="420" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23e9d5ff">البصرة • احجز الآن بالبصرة</text></svg>`,
  default: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/><circle cx="400" cy="240" r="90" fill="white" fill-opacity="0.15"/><text x="400" y="260" font-family="sans-serif" font-size="70" text-anchor="middle" fill="white">🏛️</text><text x="400" y="380" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">احجز الآن بالبصرة</text><text x="400" y="420" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23cbd5e1">مكان مميز بالبصرة</text></svg>`,
};

// Default multi-image galleries for listings that don't have enough images
export const DEFAULT_CATEGORY_GALLERIES: Record<string, string[]> = {
  chalets: [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
  ],
  halls: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
  ],
};

export function getFallbackImage(categorySlug?: string): string {
  if (!categorySlug) return SVG_FALLBACKS.default;
  if (categorySlug.includes('chalet')) return SVG_FALLBACKS.chalets;
  if (categorySlug.includes('sport')) return SVG_FALLBACKS.sports;
  if (categorySlug.includes('hall')) return SVG_FALLBACKS.halls;
  return SVG_FALLBACKS.default;
}

export function getListingImages(listing: any): { url: string; isPrimary?: boolean }[] {
  if (!listing) return [{ url: SVG_FALLBACKS.default }];

  // If listing has images, check if it's more than 1
  if (listing.images && listing.images.length > 0) {
    const validImages = listing.images.filter((img: any) => img && img.url);
    if (validImages.length >= 2) {
      return validImages;
    }
    // If only 1 image, complement with category gallery photos
    const primary = validImages[0]?.url;
    const catSlug = listing.category?.slug || '';
    const categoryGallery = DEFAULT_CATEGORY_GALLERIES[catSlug] || DEFAULT_CATEGORY_GALLERIES.chalets;
    
    // Combine primary image with category gallery photos without duplicating
    const combined = [primary, ...categoryGallery.filter(u => u !== primary)];
    return combined.map((url, idx) => ({ url, isPrimary: idx === 0 }));
  }

  // If 0 images, return category gallery photos
  const catSlug = listing.category?.slug || '';
  const gallery = DEFAULT_CATEGORY_GALLERIES[catSlug] || DEFAULT_CATEGORY_GALLERIES.chalets;
  return gallery.map((url, idx) => ({ url, isPrimary: idx === 0 }));
}

export function getPrimaryImage(listing: any): string {
  if (!listing) return SVG_FALLBACKS.default;
  
  if (listing.primaryImage) return listing.primaryImage;
  
  if (listing.images && listing.images.length > 0) {
    const primaryObj = listing.images.find((img: any) => img.isPrimary) || listing.images[0];
    if (primaryObj?.url) return primaryObj.url;
  }

  const catSlug = listing.category?.slug || '';
  const gallery = DEFAULT_CATEGORY_GALLERIES[catSlug];
  if (gallery && gallery.length > 0) {
    return gallery[0];
  }

  return getFallbackImage(catSlug);
}

// React Image error handler
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, categorySlug?: string) {
  const target = e.currentTarget;
  // Prevent infinite loop if fallback also fails
  if (target.dataset.fallbackApplied) return;
  target.dataset.fallbackApplied = 'true';
  target.src = getFallbackImage(categorySlug);
}
