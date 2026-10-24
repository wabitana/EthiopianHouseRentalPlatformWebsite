import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

const connectionString = process.env.DATABASE_URL || '';
const isNeon = connectionString.includes('neon.tech');

let prismaClientInstance: PrismaClient;

if (isNeon) {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString });
  pool.on('error', (err: any) => {
    console.warn('⚠️ Neon WebSocket pool notice:', err?.message || err);
  });
  const adapter = new PrismaNeon(pool);
  prismaClientInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
} else {
  prismaClientInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
}

export const prisma = prismaClientInstance;

export async function connectDatabase() {
  try {
    await prisma.$connect();
    const target = isNeon ? 'Neon WebSockets (Port 443)' : 'PostgreSQL Database';
    console.log(`✅ PostgreSQL Database connected successfully via ${target}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
