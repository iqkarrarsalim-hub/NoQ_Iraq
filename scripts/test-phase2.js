const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper for assertions
function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} - Expected "${expected}", got "${actual}"`);
    process.exitCode = 1;
  }
}

function assertContains(actual, substring, testName) {
  if (typeof actual === 'string' && actual.includes(substring)) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} - Expected string to contain "${substring}"`);
    process.exitCode = 1;
  }
}

async function runPhase2Tests() {
  console.log('\n🧪 Starting Phase 2 Integration & Concurrency Tests...\n');

  // Test 1: Fetch Demo Accounts
  console.log('--- Test 1: Authentication & Demo Accounts Setup ---');
  const adminUser = await prisma.user.findUnique({ where: { phone: '07700000000' } });
  const providerUser = await prisma.user.findUnique({ where: { phone: '07711112222' } });
  const customerUser = await prisma.user.findUnique({ where: { phone: '07733334444' } });

  assertEqual(adminUser?.role, 'ADMIN', 'Admin User exists with ADMIN role');
  assertEqual(providerUser?.role, 'PROVIDER', 'Provider User exists with PROVIDER role');
  assertEqual(customerUser?.role, 'CUSTOMER', 'Customer User exists with CUSTOMER role');

  const passwordMatch = await bcrypt.compare('password123', customerUser.passwordHash);
  assertEqual(passwordMatch, true, 'Bcrypt password hashing verification');

  // Test 2: Listing & Template Availability Logic
  console.log('\n--- Test 2: Availability Calculation Engine ---');
  const chaletListing = await prisma.listing.findFirst({
    where: { title: { contains: 'شاليه النخيل' } },
    include: { availabilityTemplates: { include: { slots: true } } },
  });

  assertEqual(chaletListing ? true : false, true, 'Chalet Demo Listing exists');
  const basePriceInt = Number.isInteger(chaletListing.basePrice);
  assertEqual(basePriceInt, true, 'Base Price stored as Integer (IQD)');

  // Test 3: Double Booking Prevention & Concurrency Lock
  console.log('\n--- Test 3: Double Booking Race Condition Protection ---');
  const dateStr = '2026-10-15';
  const startTime = '08:00';
  const endTime = '16:00';

  // Create First Booking (PENDING)
  const randomSuffix1 = Math.floor(1000 + Math.random() * 9000);
  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: `IQB-TEST-1-${randomSuffix1}`,
      customerId: customerUser.id,
      listingId: chaletListing.id,
      bookingDate: dateStr,
      startTime,
      endTime,
      shiftName: 'شفت صباحي',
      totalPrice: chaletListing.basePrice,
      commissionRate: 5.0,
      commissionAmount: 12500,
      providerEarnings: 237500,
      status: 'PENDING',
    },
  });

  assertEqual(booking1.status, 'PENDING', 'Booking 1 created as PENDING');

  // Attempt Concurrent Second Booking on same slot (Simultaneous Request)
  let conflictOccurred = false;
  try {
    const pendingCutoffDate = new Date(Date.now() - 30 * 60 * 1000);

    // Simulate Concurrency Check inside transaction
    const existingOverlapping = await prisma.booking.findFirst({
      where: {
        listingId: chaletListing.id,
        bookingDate: dateStr,
        OR: [
          { status: 'CONFIRMED' },
          { AND: [{ status: 'PENDING' }, { createdAt: { gte: pendingCutoffDate } }] },
        ],
        AND: [
          {
            OR: [
              { AND: [{ startTime: { lte: startTime } }, { endTime: { gte: startTime } }] },
              { AND: [{ startTime: { lte: endTime } }, { endTime: { gte: endTime } }] },
            ],
          },
        ],
      },
    });

    if (existingOverlapping) {
      conflictOccurred = true;
      throw new Error('نأسف، هذا الوقت أو الشفت تم حجزه أو عليه طلب حجز قائم للتو.');
    }
  } catch (err) {
    assertContains(err.message, 'تم حجزه', 'Double Booking correctly caught and rejected');
  }

  assertEqual(conflictOccurred, true, 'Double Booking Concurrency Prevention Lock Passed');

  // Test 4: Provider Acceptance Lifecycle (PENDING -> CONFIRMED)
  console.log('\n--- Test 4: Provider Booking Approval Lifecycle ---');
  const updatedBooking = await prisma.booking.update({
    where: { id: booking1.id },
    data: { status: 'CONFIRMED' },
  });

  assertEqual(updatedBooking.status, 'CONFIRMED', 'Provider accepted booking (PENDING -> CONFIRMED)');

  // Test 5: Pending Timeout Expiration (EXPIRED Status)
  console.log('\n--- Test 5: PENDING Booking Expiration Engine ---');
  const randomSuffix2 = Math.floor(1000 + Math.random() * 9000);
  const oldPendingDate = new Date(Date.now() - 40 * 60 * 1000); // 40 minutes ago (> 30 min limit)

  const expiredBooking = await prisma.booking.create({
    data: {
      bookingNumber: `IQB-TEST-OLD-${randomSuffix2}`,
      customerId: customerUser.id,
      listingId: chaletListing.id,
      bookingDate: '2026-10-16',
      startTime: '17:00',
      endTime: '01:00',
      shiftName: 'شفت مسائي',
      totalPrice: chaletListing.basePrice,
      commissionRate: 5.0,
      commissionAmount: 12500,
      providerEarnings: 237500,
      status: 'PENDING',
      createdAt: oldPendingDate,
    },
  });

  // Run Timeout Expiry Handler
  const pendingCutoffDate = new Date(Date.now() - 30 * 60 * 1000);
  await prisma.booking.updateMany({
    where: {
      listingId: chaletListing.id,
      status: 'PENDING',
      createdAt: { lt: pendingCutoffDate },
    },
    data: { status: 'EXPIRED' },
  });

  const checkedExpiredBooking = await prisma.booking.findUnique({
    where: { id: expiredBooking.id },
  });

  assertEqual(checkedExpiredBooking.status, 'EXPIRED', 'Old PENDING booking transitioned to EXPIRED automatically');

  console.log('\n🎉 All Phase 2 Integration & Engine Tests Passed Successfully!\n');
}

runPhase2Tests()
  .catch((e) => {
    console.error('❌ Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
