import dotenv from 'dotenv';
import dns from 'dns';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

dotenv.config();

// Prioritize IPv4 over IPv6 across all Node.js net/DNS requests
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore on older Node runtimes
}

// Custom WebSocket class enforcing IPv4 and resilient handshake timeout
class ResilientWebSocket extends ws {
  constructor(address: any, protocols?: any, options?: any) {
    const opts = Object.assign({}, options, {
      family: 4, // Prevent stalling on unreachable IPv6 addresses
      handshakeTimeout: 30000,
    });
    super(address, protocols, opts);
  }
}

neonConfig.webSocketConstructor = ResilientWebSocket;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 10,
});

// Handle background websocket connection drops gracefully
pool.on('error', (err: any) => {
  console.warn('Neon WebSocket pool notice:', err?.message || err);
});

const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('ostgreSQL Database connected successfully via Neon WebSockets (Port 443)');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

