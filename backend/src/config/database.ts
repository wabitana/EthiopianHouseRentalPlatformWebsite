import dotenv from 'dotenv';
import dns from 'dns';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const isNeon = connectionString.includes('neon.tech');

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore on older Node runtimes
}

class ResilientWebSocket extends ws {
  constructor(address: any, protocols?: any, options?: any) {
    super(address, protocols, Object.assign({}, options, {
      family: 4,
      handshakeTimeout: 30000,
    }));
  }
}

let prismaClientInstance: PrismaClient;

if (isNeon) {
  neonConfig.webSocketConstructor = ResilientWebSocket;
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    max: 10,
  });

  pool.on('error', () => {});

  const adapter = new PrismaNeon(pool);
  prismaClientInstance = new PrismaClient({ adapter });
} else {
  prismaClientInstance = new PrismaClient();
}

export const prisma = prismaClientInstance;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}
