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
  console.log(`✅ Seeded ${sampleProperties.length} Ethiopian properties successfully.`);

  // 3. Create Portal Agent Account
  const agentHash = await bcrypt.hash('agent123456', 10);
  const portalAgent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: { passwordHash: agentHash },
    create: {
      name: 'Dawit Wolde',
      email: 'agent@example.com',
      phone: '+251 91 123 7890',
      passwordHash: agentHash,
      role: 'agent',
      isVerified: true,
      assignedArea: 'Bole, Addis Ababa',
      propertiesManaged: 12,
      verificationsCompleted: 48,
      activeTasks: 4,
      performanceScore: 98.2,
      agentStatus: 'Active',
    },
  });

  // 4. Create Portal Admin Account matching web defaults
  const adminHash = await bcrypt.hash('admin123456', 10);
  const ethiopianAdminHash = await bcrypt.hash('AdminPassword123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: adminHash },
    create: {
      name: 'Portal Administrator',
      email: 'admin@example.com',
      phone: '+251 90 000 0001',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ethiopianhouserental.et' },
    update: { passwordHash: ethiopianAdminHash },
    create: {
      name: 'Ethiopian Platform Administrator',
      email: 'admin@ethiopianhouserental.et',
      phone: '+251 90 000 0002',
      passwordHash: ethiopianAdminHash,
      role: 'admin',
      isVerified: true,
    },
  });

  console.log('✅ Created Portal Agent (agent@example.com) & Portal Admin (admin@example.com)');

  // 5. Create some properties for agent inspections
  const boleProperty = await prisma.property.findFirst({ where: { area: 'Bole' } });
  if (boleProperty) {
    // Create verification document requests for it
    await prisma.propertyDocument.upsert({
      where: { id: 'doc-prop-1' },
      update: {},
      create: {
        id: 'doc-prop-1',
        propertyId: boleProperty.id,
        ownerId: providerUser.id,
        docType: 'TITLE_DEED',
        docUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
        status: 'UNDER_REVIEW',
        aiRiskScore: 92.0,
        aiNotes: 'Title deed format matches Ministry specifications. Signature verification pending.',
      },
    });

    // Create a task for agent to inspect
    await prisma.task.create({
      data: {
        title: 'Verify Property in Bole Atlas',
        type: 'Inspect property',
        propertyId: boleProperty.id,
        propertyTitle: boleProperty.title,
        providerName: providerUser.name,
        assignedAgentId: portalAgent.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        priority: 'High',
        status: 'Pending',
        description: 'Perform physical onsite property walkthrough, capture high quality room photos, and verify utility connections.',
      },
    });
  }

  // Create Identity verification request for provider
  await prisma.identityDocument.upsert({
    where: { id: 'doc-identity-1' },
    update: {},
    create: {
      id: 'doc-identity-1',
      userId: providerUser.id,
      idType: 'NATIONAL_ID',
      idNumber: 'ID-ET-990812',
      documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      status: 'UNDER_REVIEW',
      aiRiskScore: 95.5,
      aiNotes: 'OCR verified Ethiopian National ID. Name matches system profile.',
    },
  });

  // Create tasks for agent
  await prisma.task.createMany({
    data: [
      {
        title: 'Review National ID for Tigist Alemu',
        type: 'Review documents',
        assignedAgentId: portalAgent.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'In Progress',
        description: 'Verify national ID documents submitted by provider and double check OCR accuracy.',
      },
      {
        title: 'Call Owner of Coz Studio Sarbet',
        type: 'Contact provider',
        assignedAgentId: portalAgent.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'Low',
        status: 'Pending',
        description: 'Follow up with owner regarding missing water utility proof details.',
      },
    ],
  });

  // 6. Create Assisted Rural / Offline Entities
  const assistedTenant = await prisma.assistedTenant.create({
    data: {
      fullName: 'Alemayehu Tadese',
      featurePhone: '+251 91 122 3344',
      kebeleIdNumber: 'KB-88271',
      region: 'Oromia',
      woreda: 'Adaa',
      preferredHouseType: 'Apartment',
      maxBudgetETB: 12000,
      familySize: 3,
      hasSmartphone: false,
      status: 'Active Search',
      agentId: portalAgent.id,
    },
  });

  const HawkProperty = await prisma.property.findFirst({ where: { city: 'Hawassa' } });
  if (HawkProperty) {
    const assistedBooking = await prisma.assistedBooking.create({
      data: {
        tenantId: assistedTenant.id,
        propertyId: HawkProperty.id,
        monthlyRentETB: 25000,
        depositETB: 25000,
        paymentMethod: 'Cash collected by Agent',
        receiptNumber: 'REC-2026-9081',
        bookingDate: new Date(),
        status: 'Pending Payment',
        agentId: portalAgent.id,
      },
    });

    await prisma.leaseAgreement.create({
      data: {
        bookingId: assistedBooking.id,
        tenantName: assistedTenant.fullName,
        tenantKebeleId: assistedTenant.kebeleIdNumber,
        providerName: providerUser.name,
        providerIdNumber: 'PRV-ET-9182',
        propertyTitle: HawkProperty.title,
        location: `${HawkProperty.city}, ${HawkProperty.area}`,
        monthlyRentETB: 25000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kebeleWitnessName: 'Melaku Belay (Kebele Chairman)',
        kebeleWitnessStamp: 'OFFICIAL_KEBELE_STAMP_01',
        status: 'Official Draft',
        agentId: portalAgent.id,
      },
    });
  }

  // Create SMS log
  await prisma.featurePhoneSms.create({
    data: {
      recipientPhone: assistedTenant.featurePhone,
      recipientName: assistedTenant.fullName,
      messageAmharic: 'ሰላም ዓለማየሁ! ወኪል ዳዊት ለእርስዎ በጀት የሚሆን 2 የቤት አማራጮችን አግኝቷል። ቅዳሜ ይጎበኛሉ።',
      messageEnglish: 'Selam Alemayehu! Agent Dawit has found 2 matching house options for your budget. Inspection scheduled for Saturday.',
      status: 'Delivered (Feature Phone)',
      agentId: portalAgent.id,
    },
  });

  // 7. Create abuse report
  const studioProperty = await prisma.property.findFirst({ where: { propertyType: 'Studio' } });
  if (studioProperty) {
    await prisma.report.create({
      data: {
        propertyId: studioProperty.id,
        reporterId: seekerUser.id,
        reason: 'Fraudulent Listing',
        details: 'Listed price is incorrect. Landlord asking for 30,000 ETB instead of 18,000 ETB.',
      },
    });
  }

  // 8. Create payments
  const samplePayments = [
    {
      userId: providerUser.id,
      amountETB: 1200,
      currency: 'ETB',
      paymentMethod: 'CHAPA_SIMULATION',
      reference: 'TX-SUB-BOLE-001',
      status: 'SUCCESS',
    },
    {
      userId: providerUser.id,
      amountETB: 45000,
      currency: 'ETB',
      paymentMethod: 'CBE_BIRR',
      reference: 'TX-RENT-BOLE-002',
      status: 'SUCCESS',
    },
    {
      userId: providerUser.id,
      amountETB: 28000,
      currency: 'ETB',
      paymentMethod: 'CHAPA_REAL',
      reference: 'TX-RENT-KAZ-003',
      status: 'SUCCESS',
    },
    {
      userId: providerUser.id,
      amountETB: 30400,
      currency: 'ETB',
      paymentMethod: 'CBE_BIRR',
      reference: 'TX-PAYOUT-004',
      status: 'PENDING',
    },
    {
      userId: seekerUser.id,
      amountETB: 2500,
      currency: 'ETB',
      paymentMethod: 'CHAPA_SIMULATION',
      reference: 'TX-SUB-BUS-005',
      status: 'SUCCESS',
    },
  ];

  for (const pmt of samplePayments) {
    await prisma.payment.upsert({
      where: { reference: pmt.reference },
      update: { status: pmt.status, amountETB: pmt.amountETB },
      create: pmt,
    });
  }

  // 9. Create Sample Notification for Seeker
  await prisma.notification.create({
    data: {
      userId: seekerUser.id,
      title: 'Welcome to Ethiopian House Rental!',
      message: 'Discover verified rental properties across Addis Ababa, Hawassa, Adama, and Bahir Dar.',
      type: 'SYSTEM',
    },
  });

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


