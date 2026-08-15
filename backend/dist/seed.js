"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const password_service_1 = require("./services/password.service");
const client_1 = require("@prisma/client");
async function seed() {
    console.log('🌱 Seeding database...');
    // 1. Create Admin User
    const adminPassword = await password_service_1.PasswordService.hash('Admin@123456');
    const admin = await database_1.prisma.user.upsert({
        where: { email: 'admin@ethioproperty.et' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@ethioproperty.et',
            phone: '+251911000001',
            passwordHash: adminPassword,
            roles: [client_1.Role.ADMIN],
            isPhoneVerified: true,
            isEmailVerified: true,
            isIdentityVerified: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);
    // 2. Create Sample Owner User
    const ownerPassword = await password_service_1.PasswordService.hash('Owner@123456');
    const owner = await database_1.prisma.user.upsert({
        where: { email: 'owner@ethioproperty.et' },
        update: {},
        create: {
            name: 'Abebe Kebede',
            email: 'owner@ethioproperty.et',
            phone: '+251911000002',
            passwordHash: ownerPassword,
            roles: [client_1.Role.OWNER, client_1.Role.RENTER],
            isPhoneVerified: true,
            isEmailVerified: true,
            isIdentityVerified: true,
        },
    });
    console.log('✅ Owner user created:', owner.email);
    // 3. Create Sample Renter User
    const renterPassword = await password_service_1.PasswordService.hash('Renter@123456');
    const renter = await database_1.prisma.user.upsert({
        where: { email: 'renter@ethioproperty.et' },
        update: {},
        create: {
            name: 'Tigist Alemu',
            email: 'renter@ethioproperty.et',
            phone: '+251911000003',
            passwordHash: renterPassword,
            roles: [client_1.Role.RENTER, client_1.Role.BUYER],
            isPhoneVerified: true,
            isEmailVerified: true,
            isIdentityVerified: true,
        },
    });
    console.log('✅ Renter user created:', renter.email);
    // 4. Create Subscription Plans
    const basicPlan = await database_1.prisma.subscriptionPlan.create({
        data: {
            name: 'Basic Plan',
            price: 500,
            durationDays: 30,
            maxListings: 3,
            features: JSON.stringify(['3 Property Listings', 'Standard Search Result Priority', 'Direct Messaging']),
        },
    });
    const proPlan = await database_1.prisma.subscriptionPlan.create({
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
    await database_1.prisma.subscription.create({
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
    const rentProperty = await database_1.prisma.property.create({
        data: {
            ownerId: owner.id,
            title: 'Modern 2 Bedroom Apartment in Bole',
            description: 'Spacious apartment near Bole Medhanealem with modern amenities and high-speed internet.',
            propertyType: 'Apartment',
            transactionType: client_1.TransactionType.RENT,
            price: 35000,
            area: 120,
            bedrooms: 2,
            bathrooms: 2,
            city: 'Addis Ababa',
            areaName: 'Bole',
            neighborhood: 'Medhanealem',
            status: client_1.PropertyStatus.PUBLISHED,
            images: {
                create: [
                    { url: '/uploads/bole_apt_1.jpg', isPrimary: true },
                    { url: '/uploads/bole_apt_2.jpg', isPrimary: false },
                ],
            },
        },
    });
    const saleProperty = await database_1.prisma.property.create({
        data: {
            ownerId: owner.id,
            title: 'Luxury Villa for Sale in CMC',
            description: 'Beautiful 4-bedroom villa with private garden, garage, and G+2 architecture.',
            propertyType: 'Villa',
            transactionType: client_1.TransactionType.SALE,
            price: 25000000,
            area: 350,
            bedrooms: 4,
            bathrooms: 4,
            city: 'Addis Ababa',
            areaName: 'CMC',
            neighborhood: 'CMC Michael',
            status: client_1.PropertyStatus.PUBLISHED,
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
    await database_1.prisma.$disconnect();
});
