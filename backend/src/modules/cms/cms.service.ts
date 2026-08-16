import { prisma } from '../../prisma';
import { defaultCmsConfig, ALL_CMS_KEYS } from './cms.defaults';

export class CmsService {
  async getCmsConfig() {
    try {
      const configs = await prisma.platformConfig.findMany({
        where: { key: { in: ALL_CMS_KEYS } },
      });

      const configMap = configs.reduce((acc, curr) => {
        try {
          acc[curr.key] = JSON.parse(curr.value);
        } catch {
          acc[curr.key] = curr.value;
        }
        return acc;
      }, {} as Record<string, any>);

      const result: Record<string, any> = {};
      for (const key of ALL_CMS_KEYS) {
        result[key] = configMap[key] ?? (defaultCmsConfig as any)[key];
      }
      return result;
    } catch (error) {
      console.warn('Failed to fetch CMS config from database, using defaults:', error);
      return defaultCmsConfig;
    }
  }

  async updateCmsConfig(key: string, value: any) {
    const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { value: stringifiedValue },
      create: { key, value: stringifiedValue },
    });

    return config;
  }
}

export const cmsService = new CmsService();
