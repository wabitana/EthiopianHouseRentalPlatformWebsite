import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

async function main() {
  console.log('🌱 Seeding Ethiopian House Rental backend database...');

  // Password hashes
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const seekerUser = await prisma.user.upsert({
    where: { email: 'seeker@delala.com' },
    update: { role: 'seeker', passwordHash },
    create: {
      name: 'Abebe Bikila',
      email: 'seeker@delala.com',
      phone: '+251911223344',
      passwordHash,
      role: 'seeker',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
  });

  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@delala.com' },
    update: { role: 'provider', passwordHash },
    create: {
      name: 'Tigist Alemu',
      email: 'provider@delala.com',
      phone: '+251911556677',
      passwordHash,
      role: 'provider',
      isVerified: true,
      rating: 4.9,
      totalListings: 4,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@delala.com' },
    update: {},
    create: {
      name: 'Platform Administrator',
      email: 'admin@delala.com',
      phone: '+251900000000',
      passwordHash,
      role: 'admin',
      isVerified: true,
    },
  });

  console.log(`✅ Created users: Seeker (${seekerUser.email}), Provider (${providerUser.email}), Admin (${adminUser.email})`);

  // 2. Create Sample Active Ethiopian Property Listings
  const sampleProperties = [
    {
      title: 'Luxury Villa with Garden in Bole Atlas',
      description: 'Spacious 4 bedroom villa with master suit, modern fitted European kitchen, balcony view, and beautiful green garden in prime Bole area.',
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
      ]),
      amenities: JSON.stringify(['Generator', 'Elevator', 'Security Guard', 'Balcony', 'Water Tank']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 180,
      inquiriesCount: 4,
    },
    {
      title: 'Cozy Studio Flat in Sarbet',
      description: 'Clean studio apartment suitable for young professionals or diplomats near International Community School (ICS).',
      propertyType: 'Studio',
      price: 18000,
      rentalPeriod: 'Monthly',
      rooms: 1,
      bathrooms: 1,
      city: 'Addis Ababa',
      area: 'Sarbet',
      neighborhood: 'Near ICS',
      addressDetails: 'Sarbet Roundabout',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ]),
      amenities: JSON.stringify(['Water Tank', 'WiFi', 'Parking']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 95,
      inquiriesCount: 2,
    },
    {
      title: 'Lake View House in Hawassa',
      description: 'Serene 3 bedroom residential home with breathtaking view of Lake Hawassa, private parking, and lush greenery.',
      propertyType: 'Villa',
      price: 25000,
      rentalPeriod: 'Monthly',
      rooms: 3,
      bathrooms: 2,
      city: 'Hawassa',
      area: 'Lake Area',
      neighborhood: 'Haile Resort Zone',
      addressDetails: 'Lake Hawassa Promenade',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ]),
      amenities: JSON.stringify(['Garden', 'Parking', 'Water Tank', 'Balcony']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 110,
      inquiriesCount: 3,
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

  console.log(`✅ Seeded ${sampleProperties.length} Ethiopian properties successfully.`);

  // 3. Create Sample Notification for Seeker
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
