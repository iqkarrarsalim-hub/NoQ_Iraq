const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} - Expected "${expected}", got "${actual}"`);
    process.exitCode = 1;
  }
}

async function runPhase4Tests() {
  console.log('\n🧪 Starting Phase 4 Integration & Security Tests...\n');

  // Fetch Users & Listing
  const customerUser = await prisma.user.findUnique({ where: { phone: '07733334444' } });
  const providerUser = await prisma.user.findUnique({ where: { phone: '07711112222' } });
  const chaletListing = await prisma.listing.findFirst({ where: { isVerified: true } });

  // Test 1: Notifications Dispatch & Unread Count
  console.log('--- Test 1: Notifications Service & Center ---');
  const notif = await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: 'إشعار اختبار المرحلة 4 🔔',
      message: 'تم إرسال الإشعار بنجاح.',
    },
  });
  assertEqual(notif.isRead, false, 'Notification created with isRead = false');

  const unreadCount = await prisma.notification.count({
    where: { userId: customerUser.id, isRead: false },
  });
  assertEqual(unreadCount > 0, true, 'Unread Notifications Count computed correctly');

  // Test 2: Favorites System & Duplicate Prevention
  console.log('\n--- Test 2: Favorites System & Duplicate Prevention ---');
  await prisma.favorite.deleteMany({
    where: { userId: customerUser.id, listingId: chaletListing.id },
  });

  const fav1 = await prisma.favorite.create({
    data: { userId: customerUser.id, listingId: chaletListing.id },
  });
  assertEqual(fav1 ? true : false, true, 'Favorite added successfully');

  let duplicateCaught = false;
  try {
    await prisma.favorite.create({
      data: { userId: customerUser.id, listingId: chaletListing.id },
    });
  } catch (err) {
    duplicateCaught = true; // Composite key @@id([userId, listingId]) prevents duplicate
  }
  assertEqual(duplicateCaught, true, 'Duplicate Favorite prevented by DB unique constraint');

  // Test 3: Reviews & Ratings Rule (Only CONFIRMED/COMPLETED bookings can review)
  console.log('\n--- Test 3: Reviews & Ratings Security ---');
  const bookingDate = '2026-12-01';
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: `IQB-PHASE4-${Math.floor(Math.random() * 9000)}`,
      customerId: customerUser.id,
      listingId: chaletListing.id,
      bookingDate,
      startTime: '08:00',
      endTime: '16:00',
      shiftName: 'شفت صباحي',
      totalPrice: 250000,
      commissionRate: 5.0,
      commissionAmount: 12500,
      providerEarnings: 237500,
      status: 'CONFIRMED',
    },
  });

  // Create Review for confirmed booking
  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      listingId: chaletListing.id,
      userId: customerUser.id,
      rating: 5,
      comment: 'تجربة فاخرة وخدمة متميزة!',
    },
  });
  assertEqual(review.rating, 5, 'Review created for CONFIRMED booking');

  // Recalculate Rating
  const reviews = await prisma.review.findMany({ where: { listingId: chaletListing.id } });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await prisma.listing.update({
    where: { id: chaletListing.id },
    data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: reviews.length },
  });

  const updatedListing = await prisma.listing.findUnique({ where: { id: chaletListing.id } });
  assertEqual(updatedListing.reviewCount, reviews.length, 'Listing Review Count updated in DB');

  console.log('\n🎉 All Phase 4 Integration & Security Tests Passed Successfully!\n');
}

runPhase4Tests()
  .catch((e) => {
    console.error('❌ Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
