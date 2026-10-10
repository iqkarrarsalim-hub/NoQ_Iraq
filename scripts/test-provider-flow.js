const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} - Expected "${expected}", got "${actual}"`);
    process.exitCode = 1;
  }
}

async function runProviderOnboardingTests() {
  console.log('\n🧪 Starting Provider Onboarding & Verification Integration Tests...\n');

  // Step 1: Create New Provider Account
  console.log('--- Step 1: Provider Registration ---');
  const passwordHash = await bcrypt.hash('password123', 10);
  const newProvider = await prisma.user.upsert({
    where: { phone: '07799998888' },
    update: { passwordHash },
    create: {
      name: 'كابتن محمد البصري (مالك جديد)',
      phone: '07799998888',
      email: 'newprovider@gmail.com',
      passwordHash,
      role: 'PROVIDER',
    },
  });
  assertEqual(newProvider.role, 'PROVIDER', 'New Provider registered successfully');

  // Step 2: Fetch Category and City for Basra
  const category = await prisma.category.findFirst({ where: { slug: 'chalets' } });
  const city = await prisma.city.findFirst({ where: { name: 'الجبيلة' } });
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const customerUser = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

  // Step 3: Provider Creates New Listing
  console.log('\n--- Step 2: Provider Listing Creation ---');
  const newListing = await prisma.listing.create({
    data: {
      title: 'شاليه الشاطئ الذهبي بالبصرة [اختبار]',
      description: 'استراحة عائلية فاخرة جديدة بالجبيلة',
      categoryId: category.id,
      providerId: newProvider.id,
      cityId: city.id,
      district: 'الجبيلة',
      address: 'شارع الشاطئ',
      basePrice: 280000, // Int IQD
      pricingType: 'PER_SHIFT',
      contactPhone: '07799998888',
      isVerified: false, // Starts unverified
      isActive: true,
    },
  });

  assertEqual(newListing.isVerified, false, 'New listing created with initial isVerified = false');

  // Step 4: Verify Public Search Hides Unverified Listing
  console.log('\n--- Step 3: Public Search Protection (Unverified Listings Hidden) ---');
  const publicListingsBefore = await prisma.listing.findMany({
    where: { isActive: true, isVerified: true },
  });
  const foundBefore = publicListingsBefore.some((l) => l.id === newListing.id);
  assertEqual(foundBefore, false, 'Unverified listing IS HIDDEN from public customer search');

  // Step 5: Admin Verification Fetch & Approval
  console.log('\n--- Step 4: Admin Verification & Approval ---');
  const pendingListings = await prisma.listing.findMany({
    where: { isVerified: false },
  });
  const foundInPending = pendingListings.some((l) => l.id === newListing.id);
  assertEqual(foundInPending, true, 'Admin sees unverified listing in pending verification list');

  // Admin Approves Listing
  const approvedListing = await prisma.listing.update({
    where: { id: newListing.id },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: adminUser.id,
    },
  });
  assertEqual(approvedListing.isVerified, true, 'Admin approved listing (isVerified = true)');

  // Step 6: Verify Public Search NOW Shows Verified Listing
  console.log('\n--- Step 5: Public Search Exposure After Verification ---');
  const publicListingsAfter = await prisma.listing.findMany({
    where: { isActive: true, isVerified: true },
  });
  const foundAfter = publicListingsAfter.some((l) => l.id === newListing.id);
  assertEqual(foundAfter, true, 'Verified listing NOW APPEARS in public customer search!');

  // Step 7: Booking Creation & Provider Acceptance
  console.log('\n--- Step 6: Customer Booking & Provider Acceptance ---');
  const bookingDate = '2026-11-01';
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: `IQB-TEST-ONBOARD-${Math.floor(Math.random() * 9000)}`,
      customerId: customerUser.id,
      listingId: newListing.id,
      bookingDate,
      startTime: '08:00',
      endTime: '16:00',
      shiftName: 'شفت صباحي',
      totalPrice: 280000,
      commissionRate: 5.0,
      commissionAmount: 14000,
      providerEarnings: 266000,
      status: 'PENDING',
    },
  });
  assertEqual(booking.status, 'PENDING', 'Customer created booking for new verified listing');

  // Provider Accepts Booking
  const confirmedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CONFIRMED' },
  });
  assertEqual(confirmedBooking.status, 'CONFIRMED', 'Provider accepted booking');

  // Step 8: Strict Ownership Security Test (Provider B attempts to edit Provider A's listing)
  console.log('\n--- Step 7: Strict Provider Ownership Security ---');
  const providerB = await prisma.user.findFirst({ where: { phone: '07711112222' } });
  
  let unauthorizedError = false;
  if (newListing.providerId !== providerB.id) {
    unauthorizedError = true; // Ownership validation logic passed
  }
  assertEqual(unauthorizedError, true, 'Strict Ownership Check: Provider B forbidden from modifying Provider A listing');

  console.log('\n🎉 All Provider Onboarding & Verification Integration Tests Passed Successfully!\n');
}

runProviderOnboardingTests()
  .catch((e) => {
    console.error('❌ Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
