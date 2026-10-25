import { prisma, withDbRetry } from '../../prisma';
import { defaultCmsConfig, ALL_CMS_KEYS } from './cms.defaults';

export class CmsService {
  async getCmsConfig() {
    try {
      const configs = await withDbRetry(
        () =>
          prisma.platformConfig.findMany({
            where: { key: { in: ALL_CMS_KEYS } },
          }),
        2,
        800
      );

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

      // Dynamically populate live database counts for platform statistics
      if (!configMap['cms_counters']) {
        const [propertyCount, userCount, inquiryCount, agreementCount] = await Promise.all([
          prisma.property.count({ where: { listingStatus: 'active' } }).catch(() => prisma.property.count().catch(() => 0)),
          prisma.user.count().catch(() => 0),
          prisma.inquiry.count().catch(() => 0),
          prisma.rentalAgreement.count().catch(() => 0),
        ]);

        result['cms_counters'] = [
          { value: 2026, label: 'Platform Infrastructure Launch' },
          { value: propertyCount, label: 'Verified Properties Listed' },
          { value: userCount, label: 'Satisfied Tenants & Buyers' },
          { value: inquiryCount + agreementCount, label: 'Completed Inquiries & Requests' },
        ];
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
