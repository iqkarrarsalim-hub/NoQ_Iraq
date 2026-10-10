const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Clean Database Seed for Basra Platform (Phase 1)...');

  // Clean existing tables to avoid unique constraint failures
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilityException.deleteMany();
  await prisma.availabilityTemplateSlot.deleteMany();
  await prisma.availabilityTemplate.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listingAttributeValue.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();
  await prisma.governorate.deleteMany();
  await prisma.user.deleteMany();

  // 1. System Settings (Commission & Booking Pending Timeout)
  await prisma.systemSetting.upsert({
    where: { key: 'DEFAULT_COMMISSION_PERCENT' },
    update: { value: '5' },
    create: { key: 'DEFAULT_COMMISSION_PERCENT', value: '5' },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'BOOKING_PENDING_TIMEOUT_MINUTES' },
    update: { value: '30' },
    create: { key: 'BOOKING_PENDING_TIMEOUT_MINUTES', value: '30' },
  });

  // 2. Governorates & Cities
  const basra = await prisma.governorate.create({
    data: {
      name: 'البصرة',
      cities: {
        create: [
          { name: 'الجبيلة' },
          { name: 'الطويسة' },
          { name: 'مناوي باشا' },
          { name: 'التنومة' },
          { name: 'البرجسية' },
          { name: 'البصرة القديمة' },
        ],
      },
    },
    include: { cities: true },
  });

  await prisma.governorate.create({
    data: {
      name: 'بغداد',
      cities: {
        create: [
          { name: 'الكرادة' },
          { name: 'المنصور' },
          { name: 'الجادرية' },
        ],
      },
    },
  });

  const jubailaCity = basra.cities.find((c) => c.name === 'الجبيلة');
  const tuwaisehCity = basra.cities.find((c) => c.name === 'الطويسة');
  const manawiCity = basra.cities.find((c) => c.name === 'مناوي باشا');

  // 3. Categories & Dynamic Attributes
  const chaletsCat = await prisma.category.create({
    data: {
      name: 'شاليهات واستراحات',
      slug: 'chalets',
      icon: '🌴',
      description: 'شاليهات ومزارع واستراحات عائلية مع مسبح وخدمات كاملة في البصرة',
      attributes: {
        create: [
          { name: 'نوع المسبح', type: 'SELECT', options: JSON.stringify(['مغلق مغطى', 'مفتوح خارجي', 'مغلق ومفتوح']) },
          { name: 'عدد الغرف', type: 'NUMBER' },
        ],
      },
    },
  });

  const sportsCat = await prisma.category.create({
    data: {
      name: 'ملاعب رياضية',
      slug: 'sports',
      icon: '⚽',
      description: 'ملاعب ثيل صناعي وخماسي وملاعب كشوفات رياضية للحجز بالساعة',
      attributes: {
        create: [
          { name: 'نوع الأرضية', type: 'SELECT', options: JSON.stringify(['ثيل صناعي تركيات', 'ثيل طبيعي', 'تارتان']) },
        ],
      },
    },
  });

  const hallsCat = await prisma.category.create({
    data: {
      name: 'قاعات ومناسبات',
      slug: 'halls',
      icon: '💍',
      description: 'قاعات أعراس، مؤتمرات، وحفلات تخرج في أرقى مناطق البصرة',
    },
  });

  // 4. Amenities
  const amenitiesData = [
    { name: 'مسبح خاص', icon: '🏊‍♂️' },
    { name: 'مولدة كهرباء 24/7', icon: '⚡' },
    { name: 'تكييف طن عالي', icon: '❄️' },
    { name: 'منطقة شواء barbecue', icon: '🍖' },
    { name: 'ألعاب أطفال', icon: '🎠' },
    { name: 'موقف سيارات مظلل', icon: '🅿️' },
    { name: 'إضاءة ليلاً قوية', icon: '💡' },
    { name: 'إنترنت واي فاي', icon: '📶' },
  ];

  const createdAmenities = [];
  for (const a of amenitiesData) {
    const am = await prisma.amenity.create({ data: a });
    createdAmenities.push(am);
  }

  // 5. Create Demo Accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'مدير المنصة (تجريبي)',
      phone: '07700000000',
      email: 'admin@iqbooking.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const provider = await prisma.user.create({
    data: {
      name: 'أبو فهد البصري (مالك تجريبي)',
      phone: '07711112222',
      email: 'owner@chalets.com',
      passwordHash,
      role: 'PROVIDER',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'كرار سليم (زبون تجريبي)',
      phone: '07733334444',
      email: 'customer@gmail.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  // 6. Create Realistic Demo Listings in Basra
  const chalet1 = await prisma.listing.create({
    data: {
      title: 'شاليه النخيل الفاخر VIP [تجريبي]',
      description: 'استراحة عائلية فاخرة بالبصرة تحتوي على مسبح خارجي كبير ومسبح أطفال، مجلس يسع 30 شخص، ومولدة 100 كي في تعمل بشكل مستمر.',
      categoryId: chaletsCat.id,
      providerId: provider.id,
      cityId: jubailaCity.id,
      district: 'شارع الشاليهات - الجبيلة',
      address: 'مقابل كورنيش الجبيلة، قرب جسر خالد',
      latitude: 30.5081,
      longitude: 47.8225,
      basePrice: 250000, // Int IQD
      pricingType: 'PER_SHIFT',
      capacity: 35,
      contactPhone: '07711112222',
      whatsappNumber: '9647711112222',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: admin.id,
      rating: 4.9,
      reviewCount: 14,
      availabilityLastUpdatedAt: new Date(),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', isPrimary: false },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities[0].id },
          { amenityId: createdAmenities[1].id },
          { amenityId: createdAmenities[2].id },
        ],
      },
      availabilityTemplates: {
        create: [
          {
            dayOfWeek: 'SATURDAY',
            slots: {
              create: [
                { startTime: '08:00', endTime: '16:00', shiftName: 'شفت صباحي', price: 250000 },
                { startTime: '17:00', endTime: '01:00', shiftName: 'شفت مسائي', price: 300000 },
              ],
            },
          },
        ],
      },
    },
  });

  const sports1 = await prisma.listing.create({
    data: {
      title: 'ملعب الأبطال الخماسي الدولي [تجريبي]',
      description: 'أرقى ملعب ثيل صناعي درجة أولى بالبصرة، مزود بكشافات LED ليلية غرف تبديل ملابس مكيفة ودوشات.',
      categoryId: sportsCat.id,
      providerId: provider.id,
      cityId: tuwaisehCity.id,
      district: 'حي المعلمين - الطويسة',
      address: 'تقاطع الطويسة خلف مدرسة الأمل',
      latitude: 30.5120,
      longitude: 47.8150,
      basePrice: 35000, // Int IQD
      pricingType: 'PER_HOUR',
      capacity: 12,
      contactPhone: '07711112222',
      whatsappNumber: '9647711112222',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: admin.id,
      rating: 4.8,
      reviewCount: 22,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80', isPrimary: false },
        ],
      },
    },
  });

  const hall1 = await prisma.listing.create({
    data: {
      title: 'قاعة القصر الملكي للمناسبات [تجريبي]',
      description: 'قاعة فخمة تتسع لـ 500 شخص مع نظام صوت واكتشاف ضوئي حديث، كادر ضيافة عراقي متميز.',
      categoryId: hallsCat.id,
      providerId: provider.id,
      cityId: manawiCity.id,
      district: 'مناوي باشا',
      address: 'شارع مناوي باشا الرئيسي',
      latitude: 30.5200,
      longitude: 47.8300,
      basePrice: 850000, // Int IQD
      pricingType: 'PER_DAY',
      capacity: 500,
      contactPhone: '07711112222',
      whatsappNumber: '9647711112222',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: admin.id,
      rating: 5.0,
      reviewCount: 9,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80', isPrimary: false },
        ],
      },
    },
  });

  // 7. Seed Sample Booking for Customer
  const todayStr = new Date().toISOString().split('T')[0];
  await prisma.booking.create({
    data: {
      bookingNumber: 'IQB-BASRA-10294',
      customerId: customer.id,
      listingId: chalet1.id,
      bookingDate: todayStr,
      startTime: '08:00',
      endTime: '16:00',
      shiftName: 'شفت صباحي',
      totalPrice: 250000,
      commissionRate: 5.0,
      commissionAmount: 12500,
      providerEarnings: 237500,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      notes: 'طلب عائلي تجريبي',
    },
  });

  console.log('✅ Phase 1 Clean Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
