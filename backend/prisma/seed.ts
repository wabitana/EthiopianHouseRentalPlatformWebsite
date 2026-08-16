import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ethiopian Property Platform database...');

  // 1. Seed Subscription Plans
  const plans = [
    {
      name: 'Basic',
      priceETB: 500,
      durationDays: 30,
      maxListings: 3,
      features: JSON.stringify(['Up to 3 Active Property Listings', 'Standard Marketplace Search Placement', 'In-App Inquiry Messages']),
    },
    {
      name: 'Professional',
      priceETB: 1200,
      durationDays: 30,
      maxListings: 10,
      features: JSON.stringify(['Up to 10 Active Property Listings', 'Featured Listing Badge & Priority Search', '360° Panorama Virtual Tour Upload', '2-Way Direct Chatting']),
    },
    {
      name: 'Business',
      priceETB: 2500,
      durationDays: 30,
      maxListings: 50,
      features: JSON.stringify(['Unlimited Property Listings', 'Top Sponsor Placement & Priority Search', 'Real-Time Provider Analytics Engine', 'AI Document Pre-Check', 'Dedicated Account Manager']),
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  console.log('✅ Subscription Plans seeded (Basic, Professional, Business).');

  // 2. Seed Default Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ethiopianhouserental.et' },
    update: {},
    create: {
      name: 'Platform Administrator',
      email: 'admin@ethiopianhouserental.et',
      phone: '+251 91 100 0000',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
    },
  });

  console.log(`✅ Default Admin Account Ready: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
