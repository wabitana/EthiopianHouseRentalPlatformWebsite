import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const commonPasswordHash = await bcrypt.hash('Test@123', 10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

  // 1. House Seeker / Universal Account (wabitena@gmail.com)
  const wabitenaUser = await prisma.user.upsert({
    where: { email: 'wabitena@gmail.com' },
    update: {
      name: 'Wabitena',
      passwordHash: commonPasswordHash,
      isVerified: true,
      isEmailVerified: true,
      active: true,
    },
    create: {
      name: 'Wabitena',
      email: 'wabitena@gmail.com',
      phone: '+251911000000',
      passwordHash: commonPasswordHash,
      role: 'seeker',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
    },
  });
  console.log('✅ Created/Updated Demo User (wabitena@gmail.com):', wabitenaUser.email);

  // 1b. House Seeker Account (wabitena10@gmail.com)
  const seeker = await prisma.user.upsert({
    where: { email: 'wabitena10@gmail.com' },
    update: {
      name: 'Wabitena',
      passwordHash: commonPasswordHash,
      role: 'seeker',
      isVerified: true,
      isEmailVerified: true,
      active: true,
    },
    create: {
      name: 'Wabitena',
      email: 'wabitena10@gmail.com',
      phone: '+251911111111',
      passwordHash: commonPasswordHash,
      role: 'seeker',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
    },
  });
  console.log('✅ Created/Updated House Seeker:', seeker.email);

  // 2. House Provider Account
  const provider = await prisma.user.upsert({
    where: { email: 'provider@ethiopianhouserental.et' },
    update: {
      passwordHash: commonPasswordHash,
      role: 'provider',
      isVerified: true,
      isEmailVerified: true,
      active: true,
    },
    create: {
      name: 'Abebe Landlord (Provider)',
      email: 'provider@ethiopianhouserental.et',
      phone: '+251922222222',
      passwordHash: commonPasswordHash,
      role: 'provider',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
    },
  });
  console.log('✅ Created/Updated House Provider:', provider.email);

  // 3. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethiopianhouserental.et' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      active: true,
    },
    create: {
      name: 'Platform Administrator',
      email: 'admin@ethiopianhouserental.et',
      phone: '+251946340709',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
    },
  });
  console.log('✅ Created/Updated Admin:', admin.email);

  // 4. Ensure demo listings for wabitenaUser when viewing Provider mode
  const existingWabitenaProps = await prisma.property.count({
    where: { providerId: wabitenaUser.id },
  });

  if (existingWabitenaProps === 0) {
    await prisma.property.create({
      data: {
        title: 'Modern 2-Bedroom Condo in Bole Medhanialem',
        description: 'Sunlit modern 2-bedroom furnished condominium with private parking, high-speed fiber internet, and 24/7 security. Just 5 minutes from Edna Mall.',
        propertyType: 'Condo',
        transactionType: 'RENT',
        price: 28000,
        rentPrice: 28000,
        rentalPeriod: 'Monthly',
        rooms: 2,
        bathrooms: 2,
        city: 'Addis Ababa',
        area: 'Bole',
        neighborhood: 'Bole Medhanialem',
        addressDetails: 'Across from Medhanialem Cathedral',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ]),
        amenities: JSON.stringify(['Backup Generator', 'Elevator', 'Wifi', 'Water Tank', 'Parking']),
        availability: true,
        isVerified: true,
        listingStatus: 'active',
        viewsCount: 215,
        inquiriesCount: 14,
        providerId: wabitenaUser.id,
        providerName: wabitenaUser.name,
        providerPhone: wabitenaUser.phone || '+251911000000',
        providerIsVerified: true,
      },
    });
    console.log('✅ Added demo listing for wabitena@gmail.com');
  }

  // Print all active accounts
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      isEmailVerified: true,
    },
  });
  console.log('\n=== CURRENT DB ACCOUNTS ===');
  console.table(allUsers);
}

main()
  .catch((e) => {
    console.error('Error seeding demo accounts:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
