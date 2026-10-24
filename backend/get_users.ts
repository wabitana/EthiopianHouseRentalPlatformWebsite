import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true
    }
  });
  console.log('=== USERS IN DB ===');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
