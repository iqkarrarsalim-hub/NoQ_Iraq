const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAmenities() {
  console.log('Cleaning up duplicate amenities...');

  const CLEAN_AMENITIES = [
    { id: 'amenity-pool', name: 'مسبح خاص', icon: '🏊‍♂️' },
    { id: 'amenity-kids-pool', name: 'مسبح أطفال', icon: '🏊‍♀️' },
    { id: 'amenity-bbq', name: 'منطقة شواء / باربيكيو', icon: '🍖' },
    { id: 'amenity-billiards', name: 'طاولة بليارد', icon: '🎱' },
    { id: 'amenity-playstation', name: 'فيشة / بلايستيشن (PS5)', icon: '🎮' },
    { id: 'amenity-mini-pitch', name: 'ملعب كرة قدم مصغر', icon: '⚽' },
    { id: 'amenity-table-tennis', name: 'تنس طاولة', icon: '🏓' },
    { id: 'amenity-playground', name: 'ألعاب ومراجيح أطفال', icon: '🎠' },
    { id: 'amenity-generator', name: 'مولدة كهرباء 24/7', icon: '⚡' },
    { id: 'amenity-ac', name: 'تكييف طن عالي / سبلت', icon: '❄️' },
    { id: 'amenity-wifi', name: 'إنترنت واي فاي مجاني', icon: '📶' },
    { id: 'amenity-parking', name: 'كراج / موقف سيارات خاص', icon: '🅿️' },
    { id: 'amenity-gazebo', name: 'جلسة خارجية وعريشة', icon: '🛋️' },
    { id: 'amenity-garden', name: 'حدائق ومساحات خضراء', icon: '🌳' },
    { id: 'amenity-speakers', name: 'سماعات ونظام صوتي', icon: '🔊' },
    { id: 'amenity-kitchen', name: 'مطبخ متكامل بالخدمات', icon: '🍳' },
    { id: 'amenity-jacuzzi', name: 'جاكوزي / ساونا', icon: '🛁' },
    { id: 'amenity-security', name: 'حراسة وكاميرات أمان', icon: '🛡️' },
    { id: 'amenity-coffee', name: 'ركن قهوة وشاي', icon: '☕' },
    { id: 'amenity-lighting', name: 'إضاءة ليلاً قوية', icon: '💡' },
  ];

  // 1. Upsert clean amenities
  for (const a of CLEAN_AMENITIES) {
    await prisma.amenity.upsert({
      where: { id: a.id },
      update: { name: a.name, icon: a.icon },
      create: a,
    });
  }

  // 2. Delete all non-standard UUID amenities
  const cleanIds = CLEAN_AMENITIES.map((a) => a.id);
  const oldAmenities = await prisma.amenity.findMany({
    where: { id: { notIn: cleanIds } },
  });

  for (const oldA of oldAmenities) {
    await prisma.listingAmenity.deleteMany({ where: { amenityId: oldA.id } });
    await prisma.amenity.delete({ where: { id: oldA.id } });
  }

  const remaining = await prisma.amenity.findMany();
  console.log('✅ Cleanup finished! Unique amenities in database:', remaining.length);
  process.exit(0);
}

cleanAmenities().catch((e) => {
  console.error(e);
  process.exit(1);
});
