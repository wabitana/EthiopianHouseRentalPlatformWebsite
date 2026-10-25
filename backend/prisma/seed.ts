/// <reference types="node" />
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'agent';
  assignedArea?: string;
  city?: string;
}

interface SeedPlanData {
  name: string;
  priceETB: number;
  durationDays: number;
  maxListings: number;
  features: string[];
}

const SEED_USERS: SeedUserData[] = [
  {
    name: 'Ethiopian Platform Administrator',
    email: 'shambel5110@gmail.com',
    phone: '+251 94 634 0709',
    password: 'AdminPassword123!',
    role: 'admin',
    city: 'Addis Ababa',
  },
  
  {
    name: 'Dawit Wolde',
    email: 'dawit.agent@delala.et',
    phone: '+251 91 123 4567',
    password: 'AgentPassword123!',
    role: 'agent',
    city: 'Addis Ababa',
    assignedArea: 'Bole & Kazanchis',
  },
  {
    name: 'Tigist Alemu',
    email: 'tigist.agent@delala.et',
    phone: '+251 92 987 6543',
    password: 'AgentPassword123!',
    role: 'agent',
    city: 'Addis Ababa',
    assignedArea: 'Yeka & CMC',
  },
];

const SEED_PLANS: SeedPlanData[] = [
  {
    name: 'Basic',
    priceETB: 500,
    durationDays: 30,
    maxListings: 3,
    features: ['Up to 3 Active Property Listings', 'Basic Analytics', 'Standard Support'],
  },
  {
    name: 'Professional',
    priceETB: 1200,
    durationDays: 30,
    maxListings: 10,
    features: ['Up to 10 Listings + 360° Panorama Tours', 'Advanced Analytics', 'Priority Support'],
  },
  {
    name: 'Business',
    priceETB: 2500,
    durationDays: 30,
    maxListings: 100,
    features: ['Unlimited Listings', 'Dedicated Account Manager', '24/7 Priority Support'],
  },
];

async function seedUser(userData: SeedUserData): Promise<void> {
  const passwordHash = await bcrypt.hash(userData.password, 10);
  const commonPayload = {
    name: userData.name,
    phone: userData.phone,
    passwordHash,
    role: userData.role,
    isVerified: true,
    isEmailVerified: true,
    active: true,
    city: userData.city ?? 'Addis Ababa',
    ...(userData.assignedArea ? { assignedArea: userData.assignedArea } : {}),
  };

  await prisma.user.upsert({
    where: { email: userData.email },
    update: commonPayload,
    create: {
      ...commonPayload,
      email: userData.email,
    },
  });
}

async function seedPlan(plan: SeedPlanData): Promise<void> {
  const commonPayload = {
    priceETB: plan.priceETB,
    durationDays: plan.durationDays,
    maxListings: plan.maxListings,
    features: JSON.stringify(plan.features),
  };

  await prisma.subscriptionPlan.upsert({
    where: { name: plan.name },
    update: commonPayload,
    create: {
      name: plan.name,
      ...commonPayload,
    },
  });
}

async function main(): Promise<void> {
  await Promise.all(SEED_USERS.map((user) => seedUser(user)));
  await Promise.all(SEED_PLANS.map((plan) => seedPlan(plan)));
}

main()
  .catch((err) => {
    process.stderr.write(`Seeding error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });