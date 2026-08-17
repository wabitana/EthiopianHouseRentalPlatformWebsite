import { prisma } from './config/database';
import { PasswordService } from './services/password.service';
import { Role, TransactionType, PropertyStatus, VerificationStatus } from '@prisma/client';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const adminPassword = await PasswordService.hash('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethioproperty.et' },
    update: { passwordHash: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@ethioproperty.et',
      phone: '+251911000001',
      passwordHash: adminPassword,
      roles: [Role.ADMIN],
      isPhoneVerified: true,
      isEmailVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Sample Owner User
  const ownerPassword = await PasswordService.hash('Owner@123456');
  const owner = await prisma.user.upsert({
    where: { email: 'owner@ethioproperty.et' },
    update: { passwordHash: ownerPassword },
    create: {
      name: 'Abebe Kebede',
      email: 'owner@ethioproperty.et',
      phone: '+251911000002',
      passwordHash: ownerPassword,
      roles: [Role.OWNER, Role.RENTER],
      isPhoneVerified: true,
      isEmailVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Owner user created:', owner.email);

  // 3. Create Sample Renter User
  const renterPassword = await PasswordService.hash('Renter@123456');
  const renter = await prisma.user.upsert({
    where: { email: 'renter@ethioproperty.et' },
    update: { passwordHash: renterPassword },
    create: {
      name: 'Tigist Alemu',
      email: 'renter@ethioproperty.et',
      phone: '+251911000003',
      passwordHash: renterPassword,
      roles: [Role.RENTER, Role.BUYER],
      isPhoneVerified: true,
      isEmailVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Renter user created:', renter.email);

  // 4. Create Subscription Plans
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic Plan',
      price: 500,
      durationDays: 30,
      maxListings: 3,
      features: JSON.stringify(['3 Property Listings', 'Standard Search Result Priority', 'Direct Messaging']),
    },
  });

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Professional Plan',
      price: 1200,
      durationDays: 30,
      maxListings: 10,
      features: JSON.stringify(['10 Property Listings', 'Featured Search Placement', 'Analytics Access']),
    },
  });
  console.log('✅ Subscription plans created');

  // 5. Create Active Owner Subscription
  await prisma.subscription.create({
    data: {
      ownerId: owner.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Active owner subscription assigned');

  // 6. Create Sample Properties
  const rentProperty = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Modern 2 Bedroom Apartment in Bole',
      description: 'Spacious apartment near Bole Medhanealem with modern amenities and high-speed internet.',
      propertyType: 'Apartment',
      transactionType: TransactionType.RENT,
      price: 35000,
      area: 120,
      bedrooms: 2,
      bathrooms: 2,
      city: 'Addis Ababa',
      areaName: 'Bole',
      neighborhood: 'Medhanealem',
      status: PropertyStatus.PUBLISHED,
      images: {
        create: [
          { url: '/uploads/bole_apt_1.jpg', isPrimary: true },
          { url: '/uploads/bole_apt_2.jpg', isPrimary: false },
        ],
      },
    },
  });

  const saleProperty = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Luxury Villa for Sale in CMC',
      description: 'Beautiful 4-bedroom villa with private garden, garage, and G+2 architecture.',
      propertyType: 'Villa',
      transactionType: TransactionType.SALE,
      price: 25000000,
      area: 350,
      bedrooms: 4,
      bathrooms: 4,
      city: 'Addis Ababa',
      areaName: 'CMC',
      neighborhood: 'CMC Michael',
      status: PropertyStatus.PUBLISHED,
      images: {
        create: [
          { url: '/uploads/cmc_villa_1.jpg', isPrimary: true },
        ],
      },
    },
  });
  console.log('✅ Sample Rent and Sale properties created');

  console.log('🎉 Database seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
