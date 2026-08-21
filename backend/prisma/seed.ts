import bcrypt from 'bcryptjs';
import { prisma } from '../src/prisma';

async function main() {
  await prisma.featurePhoneSms.deleteMany({});
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

  // 2. Create Field Agent Accounts
  const agentPasswordHash = await bcrypt.hash('AgentPassword123!', 10);

  const agent1 = await prisma.user.create({
    data: {
      name: 'Dawit Wolde',
      email: 'dawit.agent@delala.et',
      phone: '+251 91 123 4567',
      passwordHash: agentPasswordHash,
      role: 'agent',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
      assignedArea: 'Bole & Kazanchis',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'Tigist Alemu',
      email: 'tigist.agent@delala.et',
      phone: '+251 92 987 6543',
      passwordHash: agentPasswordHash,
      role: 'agent',
      isVerified: true,
      isEmailVerified: true,
      active: true,
      city: 'Addis Ababa',
      assignedArea: 'Yeka & CMC',
    },
  });

  // 3. Create Platform Subscription Plans
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
    },
  });

  // 4. Create Demo Inquiries
  const sampleProp = await prisma.property.findFirst();
  const sampleSeeker = await prisma.user.findFirst({ where: { role: 'seeker' } });
  const sampleProvider = await prisma.user.findFirst({ where: { role: 'provider' } });

  if (sampleProp && sampleSeeker) {
    await prisma.inquiry.upsert({
      where: { id: 'inq_seed_1' },
      update: {},
      create: {
        id: 'inq_seed_1',
        propertyId: sampleProp.id,
        propertyTitle: sampleProp.title,
        seekerId: sampleSeeker.id,
        seekerName: sampleSeeker.name,
        seekerPhone: sampleSeeker.phone,
        providerId: sampleProvider?.id || sampleSeeker.id,
        message: 'Selam! I submitted an inquiry for viewing this property.',
        messages: JSON.stringify([
          {
            id: 'msg_seed_1',
            senderId: sampleSeeker.id,
            senderName: sampleSeeker.name,
            senderRole: 'seeker',
            text: 'Selam! I submitted an inquiry for viewing this property.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'msg_seed_2',
            senderId: sampleProvider?.id || 'admin_user',
            senderName: sampleProvider?.name || 'Ethiopian Property Platform Admin',
            senderRole: 'admin',
            text: 'Tenayistillin! Our inspection team has received your inquiry.',
            createdAt: new Date().toISOString(),
          }
        ]),
        status: 'responded',
      },
    });
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
