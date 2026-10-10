import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_AMENITIES = [
  // Chalets & Villas (شاليهات واستراحات)
  { id: 'amenity-pool', name: 'مسبح خاص للكبار', icon: '🏊‍♂️' },
  { id: 'amenity-kids-pool', name: 'مسبح أطفال مغلق/مكشوف', icon: '🏊‍♀️' },
  { id: 'amenity-bbq', name: 'منطقة شواء / باربيكيو', icon: '🍖' },
  { id: 'amenity-billiards', name: 'طاولة بليارد', icon: '🎱' },
  { id: 'amenity-playstation', name: 'فيشة / بلايستيشن (PS5)', icon: '🎮' },
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

  // Halls & Events (قاعات أعراس ومناسبات)
  { id: 'amenity-hall-stage', name: 'منصة وكوشة عرسان', icon: '👰' },
  { id: 'amenity-hall-dj', name: 'نظام DJ وسماعات احترافية', icon: '🎵' },
  { id: 'amenity-hall-lighting', name: 'إضاءة ليزارات وسفن شو', icon: '🎆' },
  { id: 'amenity-hall-ac', name: 'تكييف مركزي طن عالي', icon: '❄️' },
  { id: 'amenity-hall-hospitality', name: 'خدمة ضيافة وعصائر', icon: '🍹' },
  { id: 'amenity-hall-catering', name: 'تجهيز بوفيه وطعام', icon: '🍽️' },
  { id: 'amenity-hall-dressing', name: 'غرفة تبديل وتأهب العروس', icon: '💄' },
  { id: 'amenity-hall-screens', name: 'شاشات عرض عملاقة', icon: '📺' },

  // Sports & Stadiums (ملاعب رياضية وخماسي)
  { id: 'amenity-sports-floodlights', name: 'إضاءة كشافات ليلاً', icon: '💡' },
  { id: 'amenity-sports-grass', name: 'عشب صناعي ممتاز', icon: '⚽' },
  { id: 'amenity-sports-changing-room', name: 'غرف تبديل ملابس وتجهيز', icon: '👕' },
  { id: 'amenity-sports-showers', name: 'حمامات ودوش نظيف', icon: '🚿' },
  { id: 'amenity-sports-ball', name: 'توفير كرات خماسي وقماع', icon: '⚽' },
  { id: 'amenity-sports-cafeteria', name: 'كافتيريا ومشروبات', icon: '🥤' },
  { id: 'amenity-sports-stands', name: 'مدرجات زوار وعوائل', icon: '🪑' },

  // Hotels & Apartments (فنادق وشقق)
  { id: 'amenity-hotel-reception', name: 'استقبال وفندقة 24/7', icon: '🏨' },
  { id: 'amenity-hotel-elevator', name: 'مصعد كهربائي', icon: '🛗' },
  { id: 'amenity-hotel-roomservice', name: 'خدمة غرف وتنظيف', icon: '🧹' },
  { id: 'amenity-hotel-breakfast', name: 'وجبة إفطار صباحية', icon: '🍳' },

  // Beauty & Salons (عناية وتجميل)
  { id: 'amenity-beauty-private-room', name: 'غرف خاصة ومستقلة', icon: '💆‍♀️' },
  { id: 'amenity-beauty-specialist', name: 'خبيرات وكادر متمرس', icon: '💅' },
  { id: 'amenity-beauty-steam', name: 'حمام مغربي وساونا', icon: '🌫️' },

  // Carwash (غسيل وتلميع)
  { id: 'amenity-carwash-steam', name: 'غسيل بخار وتلميع', icon: '🧼' },
  { id: 'amenity-carwash-waiting', name: 'صالة انتظار مكيفة', icon: '🛋️' },
];

export async function GET() {
  try {
    let amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });

    // Seed default amenities if missing
    for (const a of DEFAULT_AMENITIES) {
      await prisma.amenity.upsert({
        where: { id: a.id },
        update: { name: a.name, icon: a.icon },
        create: a,
      });
    }

    amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });

    // Deduplicate amenities strictly by name
    const seen = new Set<string>();
    const uniqueAmenities: typeof amenities = [];
    for (const a of amenities) {
      const key = a.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAmenities.push(a);
      }
    }

    return NextResponse.json({ amenities: uniqueAmenities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
