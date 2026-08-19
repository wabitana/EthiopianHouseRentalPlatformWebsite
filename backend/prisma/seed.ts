import bcrypt from 'bcryptjs';
import { prisma } from '../src/prisma';

async function main() {
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
  await prisma.favorite.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create SINGLE Super Administrator Account
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Ethiopian Platform Administrator',
      email: 'admin@ethiopianhouserental.et',
      phone: '+251 94 634 0709',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
    },
  });


  // 2. Create Platform Subscription Plans
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

  await prisma.subscriptionPlan.upsert({
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
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
