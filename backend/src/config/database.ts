import dotenv from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Handle background websocket connection drops gracefully
pool.on('error', (err: any) => {
  console.warn('⚠️ Neon WebSocket pool notice:', err?.message || err);
});

const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Neon WebSockets (Port 443)');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
