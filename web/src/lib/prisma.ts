// Proxy layer redirecting Next.js server components to the Main Express REST API Backend
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const createModelProxy = (modelName: string) => {
  return new Proxy({}, {
    get(_target, prop: string) {
      return async (...args: any[]) => {
        try {
          if (prop === 'findMany' || prop === 'findUnique' || prop === 'findFirst') {
            const endpoint = modelName.toLowerCase() === 'product' || modelName.toLowerCase() === 'property' 
              ? `${BACKEND_URL}/properties` 
              : `${BACKEND_URL}/services/packages`;
            
            const res = await fetch(endpoint, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              const items = data.properties || data.packages || data || [];
              if (prop === 'findUnique' || prop === 'findFirst') {
                return items[0] || null;
              }
              return items;
            }
          }
          if (prop === 'aggregate') {
            return { _sum: { quantity: 0 }, _count: 0 };
          }
          if (prop === 'groupBy') {
            return [];
          }
          return null;
        } catch (error) {
          console.warn(`[Web REST Proxy] Error for model ${modelName}.${prop}:`, error);
          if (prop === 'findMany' || prop === 'groupBy') return [];
          if (prop === 'aggregate') return { _sum: { quantity: 0 }, _count: 0 };
          return null;
        }
      };
    }
  });
};

export const prisma = new Proxy({}, {
  get(_target, prop: string) {
    if (prop === '$connect' || prop === '$disconnect') {
      return async () => {};
    }
    return createModelProxy(prop);
  }
}) as any;
