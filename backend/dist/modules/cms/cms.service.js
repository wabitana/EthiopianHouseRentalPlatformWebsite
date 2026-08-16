"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsService = exports.CmsService = void 0;
const prisma_1 = require("../../prisma");
const cms_defaults_1 = require("./cms.defaults");
class CmsService {
    async getCmsConfig() {
        try {
            const configs = await prisma_1.prisma.platformConfig.findMany({
                where: { key: { in: cms_defaults_1.ALL_CMS_KEYS } },
            });
            const configMap = configs.reduce((acc, curr) => {
                try {
                    acc[curr.key] = JSON.parse(curr.value);
                }
                catch {
                    acc[curr.key] = curr.value;
                }
                return acc;
            }, {});
            const result = {};
            for (const key of cms_defaults_1.ALL_CMS_KEYS) {
                result[key] = configMap[key] ?? cms_defaults_1.defaultCmsConfig[key];
            }
            return result;
        }
        catch (error) {
            console.warn('Failed to fetch CMS config from database, using defaults:', error);
            return cms_defaults_1.defaultCmsConfig;
        }
    }
    async updateCmsConfig(key, value) {
        const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
        const config = await prisma_1.prisma.platformConfig.upsert({
            where: { key },
            update: { value: stringifiedValue },
            create: { key, value: stringifiedValue },
        });
        return config;
    }
}
exports.CmsService = CmsService;
exports.cmsService = new CmsService();
