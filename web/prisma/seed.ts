import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@delala.com" },
    update: {},
    create: {
      email: "admin@delala.com",
      passwordHash,
      name: "Platform Admin",
      phone: "0987888333",
      roles: ["ADMIN"],
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@delala.com" },
    update: {},
    create: {
      email: "vendor@delala.com",
      passwordHash,
      name: "Delala Rentals PLC",
      phone: "0911819145",
      roles: ["OWNER"],
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Delala Home Rentals PLC",
      description:
        "Leading rental platform for apartments, luxury villas, and tenant move-in services across Ethiopia.",
      status: "APPROVED",
      subscriptionPlan: "premium",
      commissionRate: 8,
      onboardingStep: 4,
      businessCategory: "Home Rentals & Services",
      offersServices: true,
      contactEmail: "rentals@delala.com",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@delala.com" },
    update: {},
    create: {
      email: "customer@delala.com",
      passwordHash,
      name: "Abebe Kebede",
      phone: "0911223344",
      roles: ["RENTER"],
      city: "Addis Ababa",
    },
  });

  await prisma.user.upsert({
    where: { email: "provider@delala.com" },
    update: {},
    create: {
      email: "provider@delala.com",
      passwordHash,
      name: "Service Technician",
      phone: "0922334455",
      roles: ["RENTER"],
    },
  });

  const products = [
    {
      name: "Industrial Paint - Premium White",
      description: "High-quality liquid paint for protection and decoration.",
      price: 2500,
      stock: 120,
      category: "Paint & Coatings",
      image: "/products/paint.jpg",
    },
    {
      name: "Construction Admixture",
      description: "High-performance chemical for enhanced construction durability.",
      price: 1800,
      stock: 85,
      category: "Construction Chemicals",
      image: "/products/construction.jpg",
    },
    {
      name: "Farm Chemical - Herbicide",
      description: "Effective agricultural chemical for crop protection.",
      price: 3200,
      stock: 60,
      category: "Farm Chemicals",
      image: "/products/farm.jpg",
    },
    {
      name: "Packaging Film Roll",
      description: "Durable plastic packaging for commercial shipping.",
      price: 950,
      stock: 200,
      category: "Packaging",
      image: "/products/packaging.jpg",
    },
    {
      name: "Home Care Cleaning Solution",
      description: "Safe and effective home cleaning chemical.",
      price: 450,
      stock: 300,
      category: "Home Care",
      image: "/products/homecare.jpg",
    },
    {
      name: "Foam Chemical - Industrial Grade",
      description: "Versatile foam chemical for industrial applications.",
      price: 2100,
      stock: 45,
      category: "Foam Chemicals",
      image: "/products/foam.jpg",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { vendorId: vendor.id, name: product.name },
    });
    if (!existing) {
      await prisma.product.create({
        data: { ...product, vendorId: vendor.id },
      });
    }
  }

  const providerUser = await prisma.user.findUnique({
    where: { email: "provider@delala.com" },
  });

  if (providerUser) {
    const existingProvider = await prisma.vendorProvider.findFirst({
      where: { vendorId: vendor.id, name: "Service Technician" },
    });
    if (!existingProvider) {
      await prisma.vendorProvider.createMany({
        data: [
          {
            vendorId: vendor.id,
            providerId: providerUser.id,
            name: "Service Technician",
            phone: "0922334455",
            specialty: "GENERAL",
          },
          {
            vendorId: vendor.id,
            providerId: providerUser.id,
            name: "Alemayehu Tadesse",
            phone: "0911002233",
            specialty: "CLEANING",
          },
          {
            vendorId: vendor.id,
            providerId: providerUser.id,
            name: "Bereket Haile",
            phone: "0933445566",
            specialty: "PEST_CONTROL",
          },
          {
            vendorId: vendor.id,
            providerId: providerUser.id,
            name: "Mekonnen Desta",
            phone: "0944556677",
            specialty: "MOVING",
          },
        ],
      });
    }
  }

  const servicePackages = [
    {
      type: "CLEANING",
      slug: "cleaning-standard",
      name: "Standard Clean",
      description: "Regular home cleaning for apartments and small homes.",
      basePrice: 1500,
      features: JSON.stringify([
        "Dusting & vacuuming",
        "Kitchen & bathroom sanitization",
        "Floor mopping",
        "Up to 3 rooms",
      ]),
      sortOrder: 1,
    },
    {
      type: "CLEANING",
      slug: "cleaning-premium",
      name: "Premium Deep Clean",
      description: "Thorough deep cleaning with premium products.",
      basePrice: 2800,
      features: JSON.stringify([
        "Everything in Standard",
        "Inside appliances",
        "Window cleaning",
        "Upholstery vacuum",
      ]),
      sortOrder: 2,
    },
    {
      type: "CLEANING",
      slug: "cleaning-monthly",
      name: "Monthly Cleaning Plan",
      description: "4 visits per month with 15% savings.",
      basePrice: 5100,
      features: JSON.stringify([
        "4 standard cleans/month",
        "Priority scheduling",
        "Dedicated provider",
        "15% discount",
      ]),
      isSubscription: true,
      billingCycle: "month",
      discountPercent: 15,
      sortOrder: 3,
    },
    {
      type: "PEST_CONTROL",
      slug: "pest-standard",
      name: "Standard Treatment",
      description: "Single-visit pest control for common household pests.",
      basePrice: 2500,
      features: JSON.stringify([
        "Inspection & assessment",
        "Safe chemical treatment",
        "30-day warranty",
      ]),
      sortOrder: 1,
    },
    {
      type: "PEST_CONTROL",
      slug: "pest-quarterly",
      name: "Quarterly Protection",
      description: "Recurring quarterly pest prevention plan.",
      basePrice: 6800,
      features: JSON.stringify([
        "4 treatments per year",
        "Emergency call-outs",
        "Commercial-grade products",
        "10% savings",
      ]),
      isSubscription: true,
      billingCycle: "quarter",
      discountPercent: 10,
      sortOrder: 2,
    },
    {
      type: "MOVING",
      slug: "moving-local",
      name: "Local Move",
      description: "Residential move within Addis Ababa.",
      basePrice: 3000,
      features: JSON.stringify([
        "2 movers + truck",
        "Furniture wrapping",
        "Loading & unloading",
        "Up to 10 km",
      ]),
      sortOrder: 1,
    },
    {
      type: "MOVING",
      slug: "moving-premium",
      name: "Premium Relocation",
      description: "Full-service move with packing assistance.",
      basePrice: 5500,
      features: JSON.stringify([
        "4 movers + large truck",
        "Packing materials included",
        "Fragile item handling",
        "Assembly/disassembly",
      ]),
      sortOrder: 2,
    },
  ];

  for (const pkg of servicePackages) {
    await prisma.servicePackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  await prisma.platformConfig.upsert({
    where: { key: "commission_rate" },
    update: { value: "10" },
    create: { key: "commission_rate", value: "10" },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
