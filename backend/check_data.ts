import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const propCount = await prisma.property.count();
  const userCount = await prisma.user.count();
  const inquiryCount = await prisma.inquiry.count();

  console.log('--- DB SUMMARY ---');
  console.log('Properties in DB:', propCount);
  console.log('Users in DB:', userCount);
  console.log('Inquiries in DB:', inquiryCount);

  if (propCount > 0) {
    const props = await prisma.property.findMany({ take: 5 });
    console.log('\nSample Properties:', props);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
