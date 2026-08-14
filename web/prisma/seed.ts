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
      role: "ADMIN",
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
      role: "VENDOR",
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

  const subAdmin = await prisma.user.upsert({
    where: { email: "subadmin@delala.com" },
    update: {},
    create: {
      email: "subadmin@delala.com",
      passwordHash,
      name: "Solomon Tadesse (Bole Sub-Admin)",
      phone: "0911556677",
      role: "SUB_ADMIN",
      city: "Addis Ababa",
      assignedRegion: "Addis Ababa - Bole",
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
      role: "CUSTOMER",
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
      role: "SERVICE_PROVIDER",
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

  // Seed sample Ethiopian Properties
  const sampleProperties = [
    {
      id: "prop-bole-1",
      title: "Luxury Diplomatic Villa with Private Garden",
      description: "Modern 4-bedroom executive villa located in prime Bole Atlas neighborhood. Features high-speed fiber internet, standby 50kVA generator, European kitchen, 24/7 security guard house, and solar hot water.",
      price: 85000,
      deposit: 170000,
      city: "Addis Ababa",
      neighborhood: "Bole Atlas",
      address: "Near Edna Mall, Bole, Addis Ababa",
      bedrooms: 4,
      bathrooms: 4,
      areaSqm: 350,
      images: JSON.stringify(["/images/house1.jpg", "/images/house2.jpg"]),
      has3DWalkthrough: true,
      model3DType: "executive_villa",
      status: "APPROVED",
      landlordName: "Mulugeta Tesfaye",
      landlordPhone: "0911224466",
      landlordEmail: "mulugeta@delala.com",
      featured: true,
      verifiedBySubAdminId: subAdmin.id,
    },
    {
      id: "prop-kazanchis-2",
      title: "Modern Executive Suite near UNECA & Hilton",
      description: "High-floor luxury 2-bedroom furnished apartment with panoramic skylines of Addis Ababa. Ideal for expat diplomats, NGO directors, and corporate executives.",
      price: 45000,
      deposit: 90000,
      city: "Addis Ababa",
      neighborhood: "Kazanchis",
      address: "Kazanchis Business Center, Addis Ababa",
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 140,
      images: JSON.stringify(["/images/house2.jpg"]),
      has3DWalkthrough: true,
      model3DType: "modern_apartment",
      status: "APPROVED",
      landlordName: "Bethlehem Haile",
      landlordPhone: "0911335577",
      landlordEmail: "bethlehem@delala.com",
      featured: true,
      verifiedBySubAdminId: subAdmin.id,
    },
    {
      id: "prop-oldairport-3",
      title: "Family Compound Villa with Staff Quarters",
      description: "Quiet residential compound in Old Airport close to International Community School (ICS). Large manicured lawn, double garage, and water tanker reserve.",
      price: 65000,
      deposit: 130000,
      city: "Addis Ababa",
      neighborhood: "Old Airport",
      address: "Old Airport Road, Addis Ababa",
      bedrooms: 3,
      bathrooms: 3,
      areaSqm: 280,
      images: JSON.stringify(["/images/house3.jpg"]),
      has3DWalkthrough: false,
      model3DType: "family_villa",
      status: "APPROVED",
      landlordName: "Tewodros Kassahun",
      landlordPhone: "0911446688",
      landlordEmail: "tewodros@delala.com",
      featured: false,
      verifiedBySubAdminId: subAdmin.id,
    },
    {
      id: "prop-hawassa-4",
      title: "Lakeview Residence Hawassa",
      description: "Serene lakeside 3-bedroom vacation & long-term villa overlooking Lake Hawassa. Fully furnished with solar power system and security fence.",
      price: 32000,
      deposit: 64000,
      city: "Hawassa",
      neighborhood: "Piazza Lakefront",
      address: "Lake Road, Hawassa",
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 210,
      images: JSON.stringify(["/images/house1.jpg"]),
      has3DWalkthrough: true,
      model3DType: "lakeview_home",
      status: "APPROVED",
      landlordName: "Genet Assefa",
      landlordPhone: "0916554433",
      landlordEmail: "genet@delala.com",
      featured: true,
      verifiedBySubAdminId: subAdmin.id,
    },
    {
      id: "prop-pending-5",
      title: "Newly Built Penthouse in CMC (Awaiting Sub-Admin Verification)",
      description: "Brand new 3-bedroom penthouse apartment with private rooftop terrace. Pending physical site inspection and title deed check by regional sub-admin.",
      price: 50000,
      deposit: 100000,
      city: "Addis Ababa",
      neighborhood: "CMC",
      address: "CMC Heights, Block 4B, Addis Ababa",
      bedrooms: 3,
      bathrooms: 3,
      areaSqm: 180,
      images: JSON.stringify(["/images/house2.jpg"]),
      has3DWalkthrough: true,
      model3DType: "penthouse_suite",
      status: "PENDING",
      landlordName: "Dawit Worku",
      landlordPhone: "0912998877",
      landlordEmail: "dawit@delala.com",
      featured: false,
    },
    {
      id: "prop-pending-6",
      title: "Commercial & Residential Duplex in Adama",
      description: "Mixed-use duplex unit in central Adama main street. Submitted by landlord for commercial ground floor and residential upper floor rental.",
      price: 28000,
      deposit: 56000,
      city: "Adama",
      neighborhood: "Central Plaza",
      address: "Main Highway, Adama",
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 160,
      images: JSON.stringify(["/images/house3.jpg"]),
      has3DWalkthrough: false,
      model3DType: "commercial_duplex",
      status: "PENDING",
      landlordName: "Rahel Seyoum",
      landlordPhone: "0915112233",
      landlordEmail: "rahel@delala.com",
      featured: false,
    }
  ];

  for (const prop of sampleProperties) {
    await prisma.property.upsert({
      where: { id: prop.id },
      update: {},
      create: prop,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
