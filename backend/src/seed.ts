import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

async function main() {
  console.log('🌱 Seeding Ethiopian House Rental backend database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('🧹 Clearing existing test data...');
  await prisma.featurePhoneSms.deleteMany({});
  await prisma.leaseAgreement.deleteMany({});
  await prisma.assistedBooking.deleteMany({});
  await prisma.assistedTenant.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.propertyDocument.deleteMany({});
  await prisma.identityDocument.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.property.deleteMany({});

  // 1. Create Core Test Accounts
  const seekerUser = await prisma.user.upsert({
    where: { email: 'seeker@delala.com' },
    update: { role: 'seeker', passwordHash, isEmailVerified: true },
    create: {
      name: 'Abebe Bikila',
      email: 'seeker@delala.com',
      phone: '+251911223344',
      passwordHash,
      role: 'seeker',
      isVerified: true,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
  });

  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@delala.com' },
    update: { role: 'provider', passwordHash, isEmailVerified: true },
    create: {
      name: 'Tigist Alemu',
      email: 'provider@delala.com',
      phone: '+251911556677',
      passwordHash,
      role: 'provider',
      isVerified: true,
      isEmailVerified: true,
      rating: 4.9,
      totalListings: 4,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@delala.com' },
    update: { role: 'admin', passwordHash, isEmailVerified: true },
    create: {
      name: 'Platform Administrator',
      email: 'admin@delala.com',
      phone: '+251900000000',
      passwordHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
    },
  });

  // 2. Create Subscription Plans
  await prisma.subscriptionPlan.upsert({
    where: { name: 'Basic' },
    update: { priceETB: 500, durationDays: 30, maxListings: 3 },
    create: {
      name: 'Basic',
      priceETB: 500,
      durationDays: 30,
      maxListings: 3,
      features: JSON.stringify(['Up to 3 Active Property Listings', 'Basic Analytics', 'Standard Support']),
    },
  });

  const profPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Professional' },
    update: { priceETB: 1200, durationDays: 30, maxListings: 10 },
    create: {
      name: 'Professional',
      priceETB: 1200,
      durationDays: 30,
      maxListings: 10,
      features: JSON.stringify(['Up to 10 Listings + 360° Panorama Tours', 'Advanced Analytics', 'Priority Support']),
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Business' },
    update: { priceETB: 2500, durationDays: 30, maxListings: 100 },
    create: {
      name: 'Business',
      priceETB: 2500,
      durationDays: 30,
      maxListings: 100,
      features: JSON.stringify(['Unlimited Listings', 'Top Sponsor Placement', 'Dedicated Account Manager']),
    },
  });

  // Activate Professional plan for providerUser
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  await prisma.subscription.upsert({
    where: { id: 'seed-provider-sub' },
    update: { status: 'ACTIVE', endDate },
    create: {
      id: 'seed-provider-sub',
      userId: providerUser.id,
      planId: profPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate,
    },
  });

  // 3. Create Sample Properties
  const sampleProperties = [
    {
      title: 'Luxury Villa with Garden in Bole Atlas',
      description: 'Spacious 4 bedroom villa with master suite, modern fitted European kitchen, balcony view, and beautiful green garden in prime Bole area.',
      propertyType: 'Villa',
      price: 45000,
      rentalPeriod: 'Monthly',
      rooms: 4,
      bathrooms: 3,
      city: 'Addis Ababa',
      area: 'Bole',
      neighborhood: 'Atlas',
      addressDetails: 'Near Ednamall, Bole Road',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
      ]),
      amenities: JSON.stringify(['Generator', 'Water Tank', 'Parking', 'WiFi', 'Garden', 'Security Guard']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 240,
      inquiriesCount: 6,
    },
    {
      title: 'Modern 2BR Apartment in Kazanchis',
      description: 'Fully furnished 2 bedroom condominium with standby generator, 24/7 security, high-speed elevator, close to UNECA & Hilton.',
      propertyType: 'Apartment',
      price: 28000,
      rentalPeriod: 'Monthly',
      rooms: 2,
      bathrooms: 2,
      city: 'Addis Ababa',
      area: 'Kazanchis',
      neighborhood: 'ECA Quarter',
      addressDetails: 'Opposite ECA Building',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ]),
      amenities: JSON.stringify(['Generator', 'Elevator', 'Security Guard', 'Balcony', 'Water Tank']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 180,
      inquiriesCount: 4,
    },
  ];

  for (const prop of sampleProperties) {
    await prisma.property.create({
      data: {
        ...prop,
        providerId: providerUser.id,
        providerName: providerUser.name,
        providerPhone: providerUser.phone,
        providerAvatar: providerUser.avatarUrl,
        providerIsVerified: providerUser.isVerified,
      },
    });
  }

  console.log('✅ Clean Seed Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log('Role      | Email              | Password');
  console.log('--------------------------------------------------');
  console.log('Seeker    | seeker@delala.com   | password123');
  console.log('Provider  | provider@delala.com | password123');
  console.log('Admin     | admin@delala.com    | password123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


