const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding updated multi-service categories...');

  const categories = [
    { name: 'شاليهات واستراحات', slug: 'chalets', icon: '🏖️', description: 'استراحات وعوائل' },
    { name: 'ملاعب رياضية', slug: 'sports', icon: '⚽', description: 'حجز بالساعة' },
    { name: 'مراكز عناية وتجميل', slug: 'beauty', icon: '💆‍♀️', description: 'صالونات وسبا' },
    { name: 'محطات غسيل السيارات', slug: 'carwash', icon: '🚗', description: 'غسيل وتلميع' },
    { name: 'فنادق وأجنحة', slug: 'hotels', icon: '🏨', description: 'أجنحة وغرف' },
    { name: 'قاعات المناسبات', slug: 'halls', icon: '🎉', description: 'أعراس ومناسبات' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description },
    });
  }

  // Get Provider User and City
  const provider = await prisma.user.findFirst({ where: { role: 'PROVIDER' } }) || await prisma.user.findFirst();
  const city = await prisma.city.findFirst() || await prisma.city.create({
    data: {
      name: 'الجبيلة',
      governorate: { create: { name: 'البصرة' } }
    }
  });

  const beautyCat = await prisma.category.findUnique({ where: { slug: 'beauty' } });
  const carwashCat = await prisma.category.findUnique({ where: { slug: 'carwash' } });
  const hotelCat = await prisma.category.findUnique({ where: { slug: 'hotels' } });

  // Add Beauty Center Sample
  if (beautyCat && provider) {
    const existing = await prisma.listing.findFirst({ where: { categoryId: beautyCat.id } });
    if (!existing) {
      await prisma.listing.create({
        data: {
          title: 'مركز ڤينوس للعناية والتجميل 💆‍♀️',
          description: 'جلسات عناية بالبشرة والمساج والمكياج السينمائي مع كادر متخصص بالبصرة.',
          categoryId: beautyCat.id,
          providerId: provider.id,
          cityId: city.id,
          district: 'الجبيلة',
          address: 'البصرة - شارع الجبيلة الرئيسي',
          basePrice: 50000,
          pricingType: 'PER_SHIFT',
          contactPhone: '07701112233',
          whatsappNumber: '9647701112233',
          isVerified: true,
          rating: 4.9,
          reviewCount: 18,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=60', isPrimary: true }
            ]
          }
        }
      });
      console.log('Created sample Beauty Center listing');
    }
  }

  // Add Car Wash Sample
  if (carwashCat && provider) {
    const existing = await prisma.listing.findFirst({ where: { categoryId: carwashCat.id } });
    if (!existing) {
      await prisma.listing.create({
        data: {
          title: 'مركز السفير لغسيل وتلميع السيارات VIP 🚗',
          description: 'غسيل ساطع وتلميع نانو سيراميك بأحدث الأجهزة الإيطالية بالبصرة.',
          categoryId: carwashCat.id,
          providerId: provider.id,
          cityId: city.id,
          district: 'الطويسة',
          address: 'البصرة - الطويسة قرب الجسر',
          basePrice: 25000,
          pricingType: 'PER_SHIFT',
          contactPhone: '07702223344',
          whatsappNumber: '9647702223344',
          isVerified: true,
          rating: 4.8,
          reviewCount: 24,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=60', isPrimary: true }
            ]
          }
        }
      });
      console.log('Created sample Car Wash listing');
    }
  }

  // Add Hotel Sample
  if (hotelCat && provider) {
    const existing = await prisma.listing.findFirst({ where: { categoryId: hotelCat.id } });
    if (!existing) {
      await prisma.listing.create({
        data: {
          title: 'فندق وأجنحة البصرة تاون الفاخرة 🏨',
          description: 'أجنحة فندقية 5 نجوم مطلة مع إفطار مجاني وخدمة غرف على مدار 24 ساعة.',
          categoryId: hotelCat.id,
          providerId: provider.id,
          cityId: city.id,
          district: 'مناوي باشا',
          address: 'البصرة - كورنيش مناوي باشا',
          basePrice: 120000,
          pricingType: 'PER_DAY',
          contactPhone: '07703334455',
          whatsappNumber: '9647703334455',
          isVerified: true,
          rating: 5.0,
          reviewCount: 35,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60', isPrimary: true }
            ]
          }
        }
      });
      console.log('Created sample Hotel listing');
    }
  }

  console.log('Seeding completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
