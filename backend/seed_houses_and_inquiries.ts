import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma: any = new PrismaClient();

async function main() {
  // 1. Get or create provider user
  let provider = await prisma.user.findFirst({
    where: { role: 'provider' },
  });

  if (!provider) {
    provider = await prisma.user.create({
      data: {
        name: 'Abebe Property Holdings',
        email: 'provider@ethiopianhouserental.et',
        phone: '+251 92 222 2222',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'provider',
        isVerified: true,
        isEmailVerified: true,
        city: 'Addis Ababa',
      },
    });
  }

  // 2. Get or create seeker user (Wabitena)
  let seeker = await prisma.user.findFirst({
    where: { email: 'wabitena10@gmail.com' },
  });

  if (!seeker) {
    seeker = await prisma.user.create({
      data: {
        name: 'Wabitena',
        email: 'wabitena10@gmail.com',
        phone: '+251911111111',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'seeker',
        isVerified: true,
        isEmailVerified: true,
        city: 'Addis Ababa',
      },
    });
  }

  console.log('Provider User ID:', provider.id);
  console.log('Seeker User ID:', seeker.id);

  // Clear old properties & inquiries to have a clean seed
  await prisma.inquiry.deleteMany({});
  await prisma.property.deleteMany({});

  // 3. Realistic House Listings in Addis Ababa
  const propertiesData = [
    {
      title: 'Luxury 2 Bedroom Apartment in Bole Atlas',
      description: 'Modern fully furnished apartment located in the heart of Bole Atlas. Features 24/7 backup generator, high-speed Wi-Fi, elevator access, reserve water tank, and 24-hour security guards.',
      propertyType: 'Apartment',
      transactionType: 'RENT',
      price: 25000,
      rentPrice: 25000,
      rentalPeriod: 'Monthly',
      rooms: 2,
      bathrooms: 2,
      city: 'Addis Ababa',
      area: 'Bole',
      neighborhood: 'Bole Atlas',
      addressDetails: 'Near Atlas Hotel & Edna Mall',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Backup Generator', 'Water Tank', '24/7 Security', 'Elevator', 'Wifi', 'Balcony', 'Parking']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 142,
      inquiriesCount: 8,
    },
    {
      title: 'Spacious 3 Bedroom Villa in Old Airport',
      description: 'Beautiful G+1 villa with spacious private green garden, servant quarters, high perimeter wall with electric fence, and 2 covered parking spots. Quiet diplomatic neighborhood.',
      propertyType: 'Villa',
      transactionType: 'RENT',
      price: 45000,
      rentPrice: 45000,
      rentalPeriod: 'Monthly',
      rooms: 3,
      bathrooms: 3,
      city: 'Addis Ababa',
      area: 'Old Airport',
      neighborhood: 'Old Airport Diplomatic Zone',
      addressDetails: 'Close to International Community School (ICS)',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Garden', 'Parking', 'Electric Fence', 'Water Tank', 'Servant Quarters']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 230,
      inquiriesCount: 12,
    },
    {
      title: 'Modern Studio Apartment near Kazanchis UNECA',
      description: 'Charming fully furnished studio apartment within walking distance to Kazanchis and UNECA. Includes kitchenette, balcony with city view, security, and weekly cleaning service.',
      propertyType: 'Studio',
      transactionType: 'RENT',
      price: 16000,
      rentPrice: 16000,
      rentalPeriod: 'Monthly',
      rooms: 1,
      bathrooms: 1,
      city: 'Addis Ababa',
      area: 'Kazanchis',
      neighborhood: 'UNECA Area',
      addressDetails: 'Behind Intercontinental Hotel',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Furnished', 'Balcony', 'Wifi', '24/7 Security', 'Water Tank']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 95,
      inquiriesCount: 5,
    },
    {
      title: 'Family 3 Bedroom Condo in CMC Michael',
      description: 'Clean modern condominium apartment on the 2nd floor in CMC Michael site. Tiled flooring, built-in kitchen cabinets, continuous water supply, and ample parking space.',
      propertyType: 'Condo',
      transactionType: 'RENT',
      price: 22000,
      rentPrice: 22000,
      rentalPeriod: 'Monthly',
      rooms: 3,
      bathrooms: 2,
      city: 'Addis Ababa',
      area: 'CMC',
      neighborhood: 'CMC Michael',
      addressDetails: 'Near St. Michael Church',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Parking', 'Water Tank', 'Kitchen Cabinets', 'Balcony']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 180,
      inquiriesCount: 9,
    },
    {
      title: 'Elegant 2 Bedroom Apartment in Sarbet Old Airport',
      description: 'Newly constructed high-rise apartment building. Offers panoramic views of Addis Ababa, standby generator, gym facility, underground parking, and biometric access control.',
      propertyType: 'Apartment',
      transactionType: 'RENT',
      price: 28000,
      rentPrice: 28000,
      rentalPeriod: 'Monthly',
      rooms: 2,
      bathrooms: 2,
      city: 'Addis Ababa',
      area: 'Sarbet',
      neighborhood: 'Sarbet AU Area',
      addressDetails: 'Near African Union Headquarters',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Backup Generator', 'Elevator', 'Gym', 'Underground Parking', '24/7 Security']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 310,
      inquiriesCount: 15,
    },
    {
      title: 'Cozy 2 Bedroom House in Yeka CMC',
      description: 'Independent compound house with clean courtyard, water reservoir pump, private entrance, and perimeter guard booth.',
      propertyType: 'House',
      transactionType: 'RENT',
      price: 20000,
      rentPrice: 20000,
      rentalPeriod: 'Monthly',
      rooms: 2,
      bathrooms: 1,
      city: 'Addis Ababa',
      area: 'Yeka',
      neighborhood: 'Yeka Abado',
      addressDetails: 'Near Yeka Subcity Administrative Office',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Private Yard', 'Water Tank', 'Parking']),
      availability: true,
      isVerified: true,
      listingStatus: 'active',
      viewsCount: 75,
      inquiriesCount: 3,
    }
  ];

  const createdProps = [];
  for (const p of propertiesData) {
    const created = await prisma.property.create({
      data: {
        ...p,
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.phone || '+251 92 222 2222',
        providerAvatar: provider.avatarUrl,
        providerIsVerified: provider.isVerified,
      },
    });
    createdProps.push(created);
  }

  console.log(`✅ Successfully seeded ${createdProps.length} properties!`);

  // 4. Create sample inquiries for Seeker (Wabitena) so "My Inquiries" screen displays data!
  if (createdProps.length >= 2) {
    const prop1 = createdProps[0];
    const prop2 = createdProps[1];

    await prisma.inquiry.create({
      data: {
        propertyId: prop1.id,
        propertyTitle: prop1.title,
        propertyImage: JSON.parse(prop1.images)[0],
        seekerId: seeker.id,
        seekerName: seeker.name,
        seekerPhone: seeker.phone,
        providerId: provider.id,
        message: 'Selam! Is this 2-bedroom apartment in Bole Atlas available for a visit tomorrow afternoon?',
        phone: seeker.phone,
        messages: JSON.stringify([
          {
            id: 'msg-1',
            senderId: seeker.id,
            senderName: seeker.name,
            senderRole: 'seeker',
            text: 'Selam! Is this 2-bedroom apartment in Bole Atlas available for a visit tomorrow afternoon?',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 'msg-2',
            senderId: provider.id,
            senderName: provider.name,
            senderRole: 'provider',
            text: 'Tenayistillin Wabitena! Yes, it is available. You can visit tomorrow at 2:00 PM.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]),
        status: 'responded',
      },
    });

    await prisma.inquiry.create({
      data: {
        propertyId: prop2.id,
        propertyTitle: prop2.title,
        propertyImage: JSON.parse(prop2.images)[0],
        seekerId: seeker.id,
        seekerName: seeker.name,
        seekerPhone: seeker.phone,
        providerId: provider.id,
        message: 'Hello, what is the minimum advance payment required for this Villa in Old Airport?',
        phone: seeker.phone,
        messages: JSON.stringify([
          {
            id: 'msg-3',
            senderId: seeker.id,
            senderName: seeker.name,
            senderRole: 'seeker',
            text: 'Hello, what is the minimum advance payment required for this Villa in Old Airport?',
            createdAt: new Date().toISOString(),
          },
        ]),
        status: 'PENDING',
      },
    });

    console.log('✅ Successfully seeded sample inquiries for Wabitena!');

    // 5. Seed initial realistic maintenance tickets
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.maintenanceRequest.create({
      data: {
        tenantId: seeker.id,
        providerId: provider.id,
        propertyId: createdProps[0].id,
        propertyTitle: createdProps[0].title,
        title: 'Water Tank Supply Pipe Leakage',
        description: 'The overhead water tank inlet pipe is leaking slowly onto the roof slab since yesterday afternoon. Needs pipe connector replacement.',
        category: 'Plumbing & Water',
        status: 'PENDING',
        tenantName: seeker.name,
        tenantPhone: seeker.phone,
        providerName: provider.name,
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        tenantId: seeker.id,
        providerId: provider.id,
        propertyId: createdProps[1]?.id || createdProps[0].id,
        propertyTitle: createdProps[1]?.title || createdProps[0].title,
        title: 'Master Bedroom Circuit Breaker Tripping',
        description: 'The wall socket breaker trips whenever the heater is plugged in. Needs fuse box inspection.',
        category: 'Electricity & Power',
        status: 'IN_PROGRESS',
        tenantName: seeker.name,
        tenantPhone: seeker.phone,
        providerName: provider.name,
        providerNotes: 'Technician Dawit scheduled to visit on Saturday morning at 10:00 AM.',
      },
    });

    console.log('✅ Successfully seeded sample maintenance repair requests!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
